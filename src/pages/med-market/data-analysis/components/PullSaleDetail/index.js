import React, { Component } from "react";
import { connect } from "dva";
import { Button, Descriptions, Table, Affix } from "antd";
import DetailSearch from "./DetailSearch";
import { getStrDate, isGy, calcColWidths, transCookie } from "@/utils/utils";
import { detailCols, rewardCols, baseTableProp } from "../PullSaleAnalysis/commonData";

import styles from "./index.less";

let dispatch;
@connect(({ pullSaleAnalyse, loading }) => ({
    ...pullSaleAnalyse,
    loading,
}))
class PullSaleDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        ({ dispatch } = props);
    }

    componentDidMount() {
        this.getUrlParam();
    }

    getUrlParam = () => {
        const {
            location: {
                query: { id = 439, type },
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
                const { id: actId, actTaskId, venderId: factoryVenderId } = data;
                const baseReq = { actId, actTaskId, factoryVenderId };
                this.callModel("queryDetailInfo", baseReq);
                this.callModel("queryDetailList", { currentPage: 1, pageSize: 10, ...baseReq });
                if (!isGy) {
                    this.callModel("queryReward", { currentPage: 1, pageSize: 10, ...baseReq });
                }
            }
            this.querySearch(data);
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
            this.initSearch({ venderId: Object.assign({}, { key, label }, result[0]) });
        }
    };

    initAct = data => {
        if (data) {
            const { id: key, name: label } = data;
            this.initSearch({ activity: Object.assign({}, { key, label }, data) });
            const {
                actMoveVO: { actTaskName, factoryName },
            } = data;
            this.actInfo = Object.assign({}, data, { actTaskName, factoryName });
        }
    };

    initTask = result => {
        if (!result) return;
        if (Array.isArray(result) && result.length) {
            const { id, taskName } = result[0];
            this.initSearch({ actTaskId: Object.assign({}, { key: id, label: taskName }, result[0]) });
        }
    };

    initSearch = value => {
        const { setValues } = this.curSearch || {};
        if (setValues) {
            setValues(value);
        }
    };

    setCurSearch = ele => {
        this.curSearch = ele;
    };

    onExport = type => () => {
        const appendix = type === "detail" ? "动销活动明细" : "动销奖励明细";
        const { actTaskName, factoryName, name } = this.actInfo;
        const { pin } = transCookie() || {};
        const companyName = isGy ? pin : factoryName;
        const fileName = `${companyName}_${actTaskName}_${name}[${appendix}]_${getStrDate(undefined, "YYYYMMDDHHmmss")}.xls`;
        this.callModel("detailExport", { type, fileName });
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

    getLoading = method => {
        const { loading: { effects: { [`pullSaleAnalyse/${method}`]: loading } = {} } = {} } = this.props;
        return loading;
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

    renderDetail = () => {
        const {
            detailListParam: { currentPage: current, pageSize },
            detailListRes: { totalCount: total, data },
        } = this.props;
        const title = () => (
            <div className = {styles["table-head"]}>
                动销明细
                {this.renderBtn("detail")}
            </div>
        );
        return (
            <div className = {styles.table}>
                <Table
                    title = {title}
                    dataSource = {data}
                    columns = {detailCols}
                    pagination = {{
                        ...baseTableProp,
                        onChange: this.onDetailChange("current"),
                        onShowSizeChange: this.onDetailChange("pageSize"),
                        ...{ current, pageSize },
                        total,
                    }}
                    scroll = {{ x: calcColWidths(detailCols) }}
                    rowKey = "id"
                    loading = {this.getLoading("queryDetailList")}
                />
            </div>
        );
    };

    renderReward = () => {
        const {
            rewardParam: { currentPage: current, pageSize },
            rewardRes: { totalCount: total, data },
        } = this.props;

        const title = () => (
            <div className = {styles["table-head"]}>
                奖励明细
                {this.renderBtn("reward")}
            </div>
        );

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
                    scroll = {{ x: calcColWidths(rewardCols) }}
                    rowKey = "id"
                    loading = {this.getLoading("queryReward")}
                />
            </div>
        );
    };

    callModel = (type, data = {}, callback) => {
        dispatch({
            type: `pullSaleAnalyse/${type}`,
            payload: data,
            callback,
        });
    };

    render() {
        const { location } = this.props;
        return (
            <div className = {styles["pull-sale-detail"]}>
                <Affix offsetTop = {0}>
                    <DetailSearch dispatch = {dispatch} location = {location} searchFun = {this.getUrlParam} onRef = {this.setCurSearch} parContext = {this} />
                </Affix>
                <div className = {styles.content}>
                    {this.renderBaseInfo()}
                    {this.renderDetail()}
                    {!isGy ? this.renderReward() : ""}
                </div>
            </div>
        );
    }
}

export default PullSaleDetail;
