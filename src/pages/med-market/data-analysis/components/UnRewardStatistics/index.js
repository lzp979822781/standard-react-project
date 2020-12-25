import React, { Component } from "react";
import { connect } from "dva";
import router from "umi/router";
import { Button, Affix } from "antd";
import DetailSearch from "./DetailSearch";
import ComplexTable from "@/components/ComplexTable";
import { genPageObj, transCookie, isGy, calcColWidths } from "@/utils/utils";
import { detailCols, getStrDate } from "./commonData";

import styles from "./index.less";

let dispatch;
@connect(({ reward, loading }) => ({
    ...reward,
    loading,
}))
class UnRewardStatistics extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        ({ dispatch } = props);
        this.customPageObj = genPageObj(this, "abc");
        this.columns = this.genCols();
    }

    componentDidMount() {}

    genCols = () => {
        const operation = {
            title: "操作",
            dataIndex: "operation",
            width: 160,
            fixed: "right",
            render: (text, record) => (
                <Button type = "primary" onClick = {this.hanldeToList(record)}>
                    查看清单
                </Button>
            ),
        };
        return [...detailCols, operation];
    };

    hanldeToList = record => () => {
        const { actId: id, actType: type } = record;
        router.push({
            pathname: "./unreward-checklist",
            query: {
                id,
                type,
            },
        });
    };

    queryList = () => {
        const { id } = this.state;
        this.callModel("queryDetailList", { actId: id });
    };

    onExport = () => {
        const { taskName, companyName: factoryName } = this.actInfo;
        const { pin } = transCookie() || {};
        const companyName = isGy ? pin : factoryName;
        const fileName = `${companyName}_${taskName}_达成未奖励统计_${getStrDate(undefined, "YYYYMMDDHHmmss")}.xls`;
        this.callModel("detailExport", { fileName });
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
        return (
            <ComplexTable
                dataSource = {data}
                columns = {this.columns}
                pagination = {{
                    ...this.customPageObj,
                    ...{ current, pageSize },
                    total,
                }}
                scroll = {{ x: calcColWidths(this.columns, 180) }}
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
        return (
            <div className = {styles["train-detail"]}>
                <Affix offsetTop = {0}>
                    <DetailSearch parContext = {this} />
                </Affix>
                <div className = {styles.content}>
                    {this.renderBtn()}
                    {this.renderTable()}
                </div>
            </div>
        );
    }
}

export default UnRewardStatistics;
