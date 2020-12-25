import React, { Component } from "react";
import { connect } from "dva";
import { Button, Descriptions, Affix } from "antd";
import DetailSearch from "./DetailSearch";
import ComplexTable from "@/components/ComplexTable";
import { genPageObj, getStrDate, transCookie, isGy, err as genError } from "@/utils/utils";
import { checkListCols, getActType } from "../UnRewardStatistics/commonData";

import styles from "./index.less";

let dispatch;
@connect(({ reward, loading }) => ({
    ...reward,
    loading,
}))
class UnRewardList extends Component {
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
                query: { id = 306, type = 4 },
            },
        } = this.props;
        this.setState({ id: typeof id !== "undefined" ? parseInt(id, 10) : undefined, type: parseInt(type, 10) }, () => {
            if (id) {
                this.queryAct();
            }
        });
    };

    queryAct = () => {
        const { id, type } = this.state;
        this.callModel("queryActs", { idList: [id], type }, ({ data: { result }, type: msgType, msg }) => {
            if (msgType === "error") {
                genError(msg);
                return;
            }

            if (Array.isArray(result) && result.length) {
                const { id: actId } = result[0];
                this.callModel("queryCheckList", { actId }, this.errCallback);
                this.querySearch(result[0]);
            }
        });
    };

    errCallback = ({ type, msg }) => {
        if (type === "error") {
            genError(msg);
        }
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

    setCurSearch = ele => {
        this.curSearch = ele;
    };

    onExport = () => {
        const {
            checkBaseInfo: { id: actId },
        } = this.props;
        const { actTaskName, venderName, name } = this.actInfo;
        const { pin } = transCookie() || {};
        const companyName = isGy ? pin : venderName;
        const fileName = `${companyName}_${actTaskName}_${name}_达成未奖励清单_${getStrDate(undefined, "YYYYMMDDHHmmss")}.xls`;
        this.callModel("checkExport", { actId, fileName });
    };

    /**
     * 分页相关函数
     */
    onPageChange = type => (current, pageSize) => {
        const param = {
            currentPage: type === "current" ? current : 1,
            pageSize,
        };
        this.callModel("queryCheckList", param);
    };

    renderBaseInfo = () => {
        const { checkBaseInfo = {} } = this.props;
        const { name: actName, type: actType, actStartTime, actEndTime } = checkBaseInfo;
        return (
            <div className = {styles["base-info"]}>
                <Descriptions>
                    <Descriptions.Item label = "活动名称">{actName}</Descriptions.Item>
                    <Descriptions.Item label = "活动时间">{`${getStrDate(actStartTime)}~${getStrDate(actEndTime)}`}</Descriptions.Item>
                    <Descriptions.Item label = "活动类型">{getActType(actType)}</Descriptions.Item>
                </Descriptions>
            </div>
        );
    };

    renderBtn = () => {
        const {
            checkListRes: { data },
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
            checkListRes: { data, totalCount: total },
            checkListParam: { currentPage: current, pageSize },
        } = this.props;
        return (
            <ComplexTable
                dataSource = {data}
                columns = {checkListCols}
                pagination = {{
                    ...this.customPageObj,
                    ...{ current, pageSize },
                    total,
                }}
                // scroll = {{ x: "110%" }}
                bordered
                rowKey = "id"
            />
        );
    };

    callModel = (type, data = {}, callback) => {
        dispatch({
            type: `reward/${type}`,
            payload: data,
            callback,
        });
    };

    render() {
        const { location } = this.props;
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

export default UnRewardList;
