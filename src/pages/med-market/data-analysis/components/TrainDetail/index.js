import React, { Component } from "react";
import { connect } from "dva";
import { Button, Descriptions, Affix } from "antd";
import DetailSearch from "./DetailSearch";
import ComplexTable from "@/components/ComplexTable";
import { genPageObj, getStrDate, err, transCookie, isGy } from "@/utils/utils";
import { detailCols, getActType } from "../TrainAnalysis/commonData";

import styles from "./index.less";

let dispatch;
@connect(({ trainSale, loading }) => ({
    ...trainSale,
    loading,
}))
class TrainDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        ({ dispatch } = props);
        this.customPageObj = genPageObj(this, "abc");
    }

    componentDidMount() {
        this.getUrlParam();
    }

    getUrlParam = () => {
        const {
            location: {
                query: { id, type },
            },
        } = this.props;
        this.setState({ id, type: type ? parseInt(type, 10) : 4 }, () => {
            if (id) {
                this.queryList();
                this.queryAct();
            }
        });
    };

    setCurSearch = ele => {
        this.curSearch = ele;
    };

    queryList = () => {
        const { id } = this.state;
        this.callModel("queryDetailList", { actId: id }, (res = {}) => {
            this.failCallback(res);
        });
    };

    failCallback = ({ msg, type }) => {
        if (type === "error") {
            err(msg);
            this.callModel("updateState", {
                detailListRes: { totalCount: 0, data: [] },
            });
        }
    };

    queryAct = () => {
        const { id, type } = this.state;
        this.callModel("queryActs", { id, type }, (res = {}) => {
            this.failCallback(res);
            const { data } = res;
            if (data) {
                const { actId, actTaskId, venderId: factoryVenderId } = data;
                const baseReq = { actId, actTaskId, factoryVenderId };
                this.callModel("queryBaseInfo", baseReq, this.comCallback);
                this.callModel("queryAnalyseArea", {}, this.comCallback);
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

    onExport = () => {
        const { id } = this.state;
        const { factoryName, actTaskName, name } = this.actInfo;
        const { pin } = transCookie() || {};
        const companyName = isGy ? pin : factoryName;
        const fileName = `${companyName}_${actTaskName}_${name}[培训活动明细]_${getStrDate(undefined, "YYYYMMDDHHmmss")}.xls`;
        this.callModel("detailExport", { actId: id, fileName });
    };

    /**
     * 分页相关函数
     */
    onPageChange = type => (current, pageSize) => {
        const param = {
            currentPage: type === "current" ? current : 1,
            pageSize,
        };
        this.callModel("queryDetailList", param);
    };

    getLoading = () => {
        const { loading: { effects: { "trainSale/queryDetailList": loading } = {} } = {} } = this.props;
        return loading;
    };

    renderBaseInfo = () => {
        const {
            detailListRes: { data = [] },
        } = this.props;
        const { actName, actType, actStartTime, actEndTime } = data[0] || {};
        return (
            <div className = {styles["base-info"]}>
                <Descriptions>
                    <Descriptions.Item className = {styles.actName} label = "活动名称">
                        {actName}
                    </Descriptions.Item>
                    <Descriptions.Item label = "活动时间">{`${getStrDate(actStartTime)}~${getStrDate(actEndTime)}`}</Descriptions.Item>
                    <Descriptions.Item label = "培训类型">{getActType(actType)}</Descriptions.Item>
                </Descriptions>
            </div>
        );
    };

    renderBtn = () => {
        const {
            detailListRes: { data },
        } = this.props;
        const isValiable = Array.isArray(data) && data.length;
        return (
            <div className = {styles.btn}>
                <Button onClick = {this.onExport} disabled = {!isValiable} type = "primary" icon = "download">
                    下载数据
                </Button>
            </div>
        );
    };

    renderTable = () => {
        const {
            detailListRes: { data, totalCount: total },
            detailListParam: { currentPage: current, pageSize },
        } = this.props;
        // detailCols[detailCols.length - 1].width = null;
        return (
            <div className = {styles.table}>
                <ComplexTable
                    dataSource = {data}
                    columns = {detailCols}
                    pagination = {{
                        ...this.customPageObj,
                        ...{ current, pageSize },
                        total,
                    }}
                    scroll = {{ x: 1800 }}
                    bordered
                    rowKey = "id"
                    loading = {this.getLoading()}
                />
            </div>
        );
    };

    callModel = (type, data = {}, callback) => {
        dispatch({
            type: `trainSale/${type}`,
            payload: data,
            callback,
        });
    };

    render() {
        const { location } = this.props;
        this.getLoading();
        return (
            <div className = {styles["train-detail"]}>
                <Affix offsetTop = {0}>
                    <DetailSearch location = {location} searchFun = {this.getUrlParam} onRef = {this.setCurSearch} parContext = {this} />
                </Affix>
                <div className = {styles.content}>
                    {this.renderBaseInfo()}
                    {this.renderBtn()}
                    {this.renderTable()}
                </div>
            </div>
        );
    }
}

export default TrainDetail;
