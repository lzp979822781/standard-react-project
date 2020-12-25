/* eslint-disable import/extensions */
import React, { Component } from "react";
import { connect } from "dva";
import { Button, Descriptions, Table, Affix } from "antd";
import DetailSearch from "./DetailSearch";
import { detailCols, baseTableProp } from "../DisplayAnalysis/commonData";
import { getStrDate, isGy, transCookie } from "@/utils/utils";
import styles from "./index.less";

let newDetailCols = detailCols;
if (isGy) {
    newDetailCols = newDetailCols.filter(item => !item.hideGy);
}

let dispatch;
@connect(({ displayAnalyse, loading }) => ({
    ...displayAnalyse,
    loading: loading.effects["displayAnalyse/queryDetailList"],
}))
class DisplayDetail extends Component {
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
                query: { id = 415, type = 1 },
            },
        } = this.props;
        this.setState({ id, type: type ? parseInt(type, 10) : 1 }, () => {
            if (id) {
                this.queryAct();
            }
        });
    };

    queryAct = () => {
        const { id, type } = this.state;
        this.callModel("queryActs", { id, type }, ({ data }) => {
            if (data) {
                const { actId, actTaskId, venderId: factoryVenderId } = data;
                const baseReq = { actId, actTaskId, factoryVenderId };
                this.callModel("queryDetailInfo", baseReq);
                this.callModel("queryDetailList", { currentPage: 1, pageSize: 10 });
                this.querySearch(data);
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
            this.initSearch({ venderId: Object.assign({}, { key, label }, result[0]) });
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
            this.initSearch({ actTaskId: Object.assign({}, { key: id, label: taskName }, result[0]) });
        }
    };

    initSearch = value => {
        const { setValues } = this.curSearch || {};
        if (setValues) {
            setValues(value);
        }
    };

    onExport = () => () => {
        const { actId, actTaskName, factoryName, name } = this.actInfo;
        const { pin } = transCookie() || {};
        const companyName = isGy ? pin : factoryName;
        const fileName = `${companyName}_${actTaskName}_${name}[陈列活动明细]_${getStrDate(undefined, "YYYYMMDDHHmmss")}.xls`;
        this.callModel("detailExport", actId ? { type: "detail", fileName } : { type: "detail" });
    };

    jointPageParam = ({ type, current, pageSize }) => ({
        currentPage: type === "current" ? current : 1,
        pageSize,
    });

    onDetailChange = type => (current, pageSize) => {
        this.callModel("queryDetailList", this.jointPageParam({ type, current, pageSize }));
    };

    isArrEmpty = data => !Array.isArray(data) || (Array.isArray(data) && !data.length);

    isDisabled = () => {
        const {
            detailListRes: { data: detail },
        } = this.props;
        const data = detail;
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

    renderBtn = () => {
        const disabled = this.isDisabled();
        return (
            <div className = {styles.btn}>
                <Button onClick = {this.onExport()} disabled = {disabled} type = "primary" icon = "download">
                    下载数据
                </Button>
            </div>
        );
    };

    renderDetail = () => {
        const {
            detailListParam: { currentPage: current, pageSize },
            detailListRes: { totalCount: total, data },
            loading,
        } = this.props;
        const title = () => (
            <div className = {styles["table-head"]}>
                陈列明细
                {this.renderBtn("detail")}
            </div>
        );

        newDetailCols[newDetailCols.length - 1].width = "auto";
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
                    scroll = {{ x: isGy ? 1000 : 1700 }}
                    rowKey = "id"
                    loading = {loading}
                />
            </div>
        );
    };

    setCurSearch = ele => {
        this.curSearch = ele;
    };

    callModel = (type, data = {}, callback) => {
        dispatch({
            type: `displayAnalyse/${type}`,
            payload: data,
            callback,
        });
    };

    render() {
        const searchStyle = this.getMarginTop();
        const { location } = this.props;
        return (
            <div className = {styles["display-detail"]}>
                <Affix offsetTop = {0}>
                    <DetailSearch dispatch = {dispatch} location = {location} searchFun = {this.getUrlParam} onRef = {this.setCurSearch} parContext = {this} />
                </Affix>
                <div className = {styles.content} style = {searchStyle}>
                    {this.renderBaseInfo()}
                    {this.renderDetail()}
                </div>
            </div>
        );
    }
}

export default DisplayDetail;
