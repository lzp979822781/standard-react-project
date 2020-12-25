/* eslint-disable import/extensions */
import React, { Component } from "react";
import { connect } from "dva";
import { Button, Descriptions, Table, DatePicker, Affix } from "antd";
import moment from "moment";
import CollectSearch from "./CollectSearch";
import { getStrDate, isGy, transCookie } from "@/utils/utils";
import { detailCols, rewardCols, baseTableProp } from "../CollectAnalysis/commonData";
import styles from "./index.less";

const { RangePicker } = DatePicker;

let newDetailCols = detailCols;
if (isGy) {
    newDetailCols = newDetailCols.filter(item => !item.hideGy);
}

let dispatch;
@connect(({ collectAnalyse, loading }) => ({
    ...collectAnalyse,
    loading: loading.effects["collectAnalyse/queryDetailList"],
    rewardLoading: loading.effects["collectAnalyse/queryReward"],
}))
class CollectDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        ({ dispatch } = props);
    }

    componentDidMount() {
        this.getUrlParam();
    }

    getMarginTop = () => {
        const height = this.searchHeight || 0;
        return { marginTop: `${height}px` };
    };

    getUrlParam = () => {
        const {
            location: {
                query: { id = 462, type },
            },
        } = this.props;
        this.setState({ id, type: type ? parseInt(type, 10) : 3 }, () => {
            if (id) {
                this.queryAct();
            }
        });
    };

    queryAct = () => {
        const { id, type } = this.state;
        this.callModel("queryActs", { id, type }, ({ data }) => {
            if (data) {
                const { actId, actTaskId: taskId, venderId: factoryVenderId } = data;
                const baseReq = { actId, actTaskId: taskId, taskId, factoryVenderId };
                this.callModel("queryDetailInfo", baseReq);
                this.callModel("queryDetailList", { currentPage: 1, pageSize: 10 });
                this.querySearch(data);
                if (!isGy) {
                    this.callModel("queryReward", { currentPage: 1, pageSize: 10 });
                }
            }
        });
    };

    querySearch = data => {
        this.initAct(data);
        const { venderId } = data;
        const facReq = {
            currentPage: 1,
            pageSize: 10,
            venderId,
            type: "company",
        };
        this.callModel("initSearch", facReq, ({ data: { result } = {} }) => {
            if (Array.isArray(result) && result.length) {
                this.initCompany(result);
                this.queryTask(data);
            }
        });
    };

    queryTask = data => {
        const { actTaskId, venderId } = data;
        if (venderId) {
            const taskReq = { id: actTaskId, venderId, currentPage: 1, pageSize: 10, status: 2, type: "task" };
            this.callModel("initSearch", taskReq, ({ data: { result } = {} }) => {
                this.initTask(result);
            });
        }
    };

    initCompany = result => {
        if (Array.isArray(result) && result.length) {
            const { venderId: key, companyName: label } = result[0];
            this.initSearch({ factoryVenderId: Object.assign({}, { key, label }, result[0]) });
        }
    };

    initAct = data => {
        if (data) {
            const { actId: key, name: label } = data;
            this.initSearch({ activity: Object.assign({}, { key, label }, data) });
            this.actInfo = data;
        }
    };

    initTask = result => {
        if (!result) return;
        if (Array.isArray(result) && result.length) {
            const { id, taskName } = result[0];
            this.initSearch({ taskId: Object.assign({}, { key: id, label: taskName }, result[0]) });
        }
    };

    initSearch = value => {
        const { setValues } = this.curSearch || {};
        if (setValues) {
            setValues(value);
        }
    };

    onExport = type => () => {
        const { actId, actTaskName, factoryName, name } = this.actInfo;
        const { pin } = transCookie() || {};
        const companyName = isGy ? pin : factoryName;

        const concatText = type === "detail" ? "采购活动明细" : "采购奖励明细";
        const fileName = `${companyName}_${actTaskName}_${name}[${concatText}]_${getStrDate(undefined, "YYYYMMDDHHmmss")}.xls`;
        this.callModel("detailExport", actId ? { type, fileName } : { type });
    };

    jointPageParam = ({ type, current, pageSize }) => ({
        currentPage: type === "current" ? current : 1,
        pageSize,
    });

    onDetailChange = type => (current, pageSize) => {
        this.callModel("queryDetailList", this.jointPageParam({ type, current, pageSize }));
    };

    onRewardChange = type => (current, pageSize) => {
        this.callModel("queryReward", this.jointPageParam({ type, current, pageSize }));
    };

    isArrEmpty = data => !Array.isArray(data) || (Array.isArray(data) && !data.length);

    isDisabled = type => {
        const {
            detailListRes: { data: detail },
            rewardRes: { data: reward },
        } = this.props;
        const data = type === "detail" ? detail : reward;
        return this.isArrEmpty(data);
    };

    renderBaseInfo = () => {
        const { detailBaseInfo: { actName, actStartTime, actEndTime } = {} } = this.props;
        return (
            <div className = {styles["base-info"]}>
                <Descriptions>
                    <Descriptions.Item className = {styles.actName} label = "活动名称">
                        {actName}
                    </Descriptions.Item>
                    <Descriptions.Item label = "活动时间">{`${getStrDate(actStartTime)}~${getStrDate(actEndTime)}`}</Descriptions.Item>
                </Descriptions>
            </div>
        );
    };

    renderBtn = type => {
        const disabled = this.isDisabled(type);
        return (
            <div className = {styles.btn}>
                <Button onClick = {this.onExport(type)} disabled = {disabled} type = "primary" icon = "download">
                    下载数据
                </Button>
            </div>
        );
    };

    disabledDate = current => {
        const { detailBaseInfo: { actStartTime, actEndTime } = {} } = this.props;
        return current < moment(actStartTime).startOf("day") || current >= moment(actEndTime).endOf("day");
    };

    renderDetail = () => {
        const {
            detailListParam: { currentPage: current, pageSize },
            detailListRes: { totalCount: total, data },
            loading,
            detailBaseInfo: { actStartTime, actEndTime } = {},
        } = this.props;
        const { localDate } = this.state;
        const rangeDate = localDate || [moment(actStartTime), moment(actEndTime)];

        const title = () => (
            <div className = {styles["table-head"]}>
                采购明细
                <span style = {{ marginLeft: 10 }}>
                    <RangePicker value = {rangeDate} onChange = {this.onChangeDate} disabledDate = {this.disabledDate} />
                </span>
                {this.renderBtn("detail")}
            </div>
        );

        newDetailCols[newDetailCols.length - 1].width = null;
        return (
            <div className = {styles.table}>
                <Table
                    title = {title}
                    dataSource = {data}
                    columns = {newDetailCols}
                    pagination = {{
                        ...baseTableProp,
                        onChange: this.onDetailChange("current"),
                        onShowSizeChange: this.onDetailChange("pageSize"),
                        ...{ current, pageSize },
                        total,
                    }}
                    loading = {loading}
                    scroll = {{ x: isGy ? 1800 : 1900 }}
                    rowKey = "id"
                />
            </div>
        );
    };

    onChangeDate = data => {
        this.setState(
            {
                localDate: data,
            },
            () => {
                this.callModel("queryDetailList", { currentPage: 1, pageSize: 10, startTime: moment(data[0]).valueOf(), endTime: moment(data[1]).valueOf() });
                // this.callModel("queryDetailList", { currentPage: 1, pageSize: 10, startTime: moment(data[0]).format("YYYY-MM-DD HH:mm:ss"), endTime: moment(data[1]).format("YYYY-MM-DD HH:mm:ss") });
            }
        );
    };

    resetDate = () => {
        this.setState({ localDate: null });
    };

    // changeAct = data => {
    //     console.log(data);
    // };

    renderReward = () => {
        const {
            rewardParam: { currentPage: current, pageSize },
            rewardRes: { totalCount: total, data },
            rewardLoading,
        } = this.props;

        const title = () => (
            <div className = {styles["table-head"]}>
                奖励明细
                {this.renderBtn("reward")}
            </div>
        );
        rewardCols[rewardCols.length - 1].width = "auto";
        return (
            <div className = {styles.table}>
                <Table
                    title = {title}
                    dataSource = {data}
                    columns = {rewardCols}
                    pagination = {{
                        ...baseTableProp,
                        onChange: this.onRewardChange("current"),
                        onShowSizeChange: this.onRewardChange("pageSize"),
                        ...{ current, pageSize },
                        total,
                    }}
                    loading = {rewardLoading}
                    scroll = {{ x: 1400 }}
                    rowKey = "id"
                />
            </div>
        );
    };

    setCurSearch = ele => {
        this.curSearch = ele;
    };

    callModel = (type, data = {}, callback) => {
        dispatch({
            type: `collectAnalyse/${type}`,
            payload: data,
            callback,
        });
    };

    render() {
        const searchStyle = this.getMarginTop();
        const { location } = this.props;
        // const { rangeDate } = this.state;
        return (
            <div className = {styles["collect-detail"]}>
                <Affix offsetTop = {0}>
                    <CollectSearch dispatch = {dispatch} location = {location} resetDate = {this.resetDate} searchFun = {this.getUrlParam} onRef = {this.setCurSearch} parContext = {this} />
                </Affix>
                <div className = {styles.content} style = {searchStyle}>
                    {this.renderBaseInfo()}
                    {this.renderDetail()}
                    {isGy ? null : this.renderReward()}
                </div>
            </div>
        );
    }
}

export default CollectDetail;
