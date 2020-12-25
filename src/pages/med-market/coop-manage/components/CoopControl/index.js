/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from "react";
import { connect } from "dva";
import moment from "moment";
import router from "umi/router";
// eslint-disable-next-line no-unused-vars
import { Button, Popconfirm, Pagination } from "antd";
import ComplexTable from "@/components/ComplexTable";
import { TextRender } from "@/components/complex-table";
import CoopMagSearch from "../CoopMagSearch";

import { formatNum, genPageObj, success, err } from "@/utils/utils";

import styles from "./index.less";

const format = "YYYY年MM月DD日";
const opeFormat = "YYYY年MM月DD日 HH时mm分ss秒";
/* unction mergeRow(text, record, index, child) {
    const obj = {
        children: child || text,
        props: {},
    };
    if (record.length === 1) {
        obj.props.rowSpan = 1;
    }
    let rowSpanLen = 1;
    switch (record.length) {
    case 0:
        rowSpanLen = 0;
        break;
    case 1:
        rowSpanLen = 1;
        break;
    default:
        rowSpanLen = record.length;
    }
    obj.props.rowSpan = rowSpanLen;
    return obj;
} */
function mergeRow(text, record, index, child) {
    const obj = {
        children: child || text,
        props: {},
    };
    if (record.length === 1) {
        obj.props.rowSpan = 1;
    }
    let rowSpanLen = 1;
    switch (record.length) {
    case 0:
        rowSpanLen = 0;
        break;
    case 1:
        rowSpanLen = 1;
        break;
    default:
        rowSpanLen = record.length;
    }
    obj.props.rowSpan = rowSpanLen;
    return obj;
}

let dispatch;
const statusObj = {
    1: "审核中",
    2: "审核通过",
    3: "审核驳回",
    4: "审核中",
    5: "审核驳回",
};

@connect(({ market, loading }) => ({
    ...market,
    loading: loading.effects["market/query"],
}))
class CoopControl extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line prefer-destructuring
        dispatch = props.dispatch;
        this.customPageObj = genPageObj(this, "abc");
        this.state = { loading: false };
        this.columns = [
            {
                title: "序号",
                dataIndex: "key",
                width: 70,
                align: "center",
                render: (text, record, index) => mergeRow(text, record, index, record.rowIndex),
            },
            {
                title: "任务名称",
                dataIndex: "taskName",
                width: 150,
                render: (text, record, index) => mergeRow(text, record, index, <TextRender multiEllipse = {2} text = {text} />),
            },
            {
                title: "公司名称",
                dataIndex: "companyName",
                width: 150,
                render: (text, record, index) => mergeRow(text, record, index, <TextRender multiEllipse = {2} text = {text} />),
            },
            {
                title: "活动费收入",
                dataIndex: "income",
                width: 120,
                render: (text, record, index) => mergeRow(text, record, index, formatNum(text)),
            },
            {
                title: "审核状态",
                dataIndex: "verifyStatus",
                width: 100,
                render: (text, record, index) => mergeRow(text, record, index, statusObj[text]),
            },
            {
                title: "回款时间",
                dataIndex: "returnTime",
                width: 150,
                render: (text, record, index) => mergeRow(text, record, index, moment(text).format(format)),
            },
            {
                title: "活动预支出",
                dataIndex: "preSpend",
                width: 120,
                render: (text, record, index) => mergeRow(text, record, index, formatNum(text)),
            },
            /* {
                title: "验证预支出",
                dataIndex: "verifyPreSpend",
                width: 100,
                render: (text, record, index) => mergeRow(text, record, index, text ? formatNum(text) : "--"),
            }, */
            {
                title: "活动已支出",
                dataIndex: "expend",
                width: 120,
                render: (text, record, index) => mergeRow(text, record, index, text ? formatNum(text) : ""),
            },
            {
                title: "任务起止时间",
                dataIndex: "taskTime",
                width: 270,
                render: (text, record, index) => {
                    const str = `${moment(record.startTime).format(format)}-${moment(record.endTime).format(format)}`;
                    return mergeRow(text, record, index, str);
                },
            },
            {
                title: "已参与活动",
                dataIndex: "paticipatedActs",
                width: 200,
            },
            {
                title: "活动时间",
                dataIndex: "actTime",
                width: 270,
            },
            {
                title: "操作人",
                dataIndex: "modifier",
                width: 120,
                render: (text, record, index) => mergeRow(text, record, index),
            },
            {
                title: "操作时间",
                dataIndex: "modified",
                width: 270,
                render: (text, record, index) => mergeRow(text, record, index, moment(text).format(opeFormat)),
            },
            {
                title: "操作",
                dataIndex: "operation",
                fixed: "right",
                align: "center",
                width: 140,
                render: (text, record, index) => {
                    const ele = (
                        <div>
                            <Button type = "primary" size = "small" onClick = {this.onComClick("detail", record)}>
                                查看
                            </Button>
                            <Button type = "primary" size = "small" className = {styles["ml-btn-small"]} onClick = {this.onComClick("edit", record)}>
                                编辑
                            </Button>
                            {/* <Popconfirm placement = "topRight" title = "是否确定删除" okText = "确定" cancelText = "取消">
                                <Button type = "primary" className = {`${styles["ml-btn-small"]}`} size = "small" onClick = {this.onDelete(record)}>
                                    删除
                                </Button>
                            </Popconfirm> */}
                        </div>
                    );
                    return mergeRow(text, record, index, ele);
                },
            },
        ];
    }

    componentDidMount() {
        this.getData({
            currentPage: 1,
            pageSize: 10,
        });
    }

    /**
     * 当前方法为新增编辑查看公用方法
     * @param {string} operateId 操作动作表示，新增:add、编辑：edit、查看：detail
     */
    onComClick = (operateId, record) => () => {
        const pathname = "./operation";
        router.push({
            pathname,
            query: {
                pageType: operateId,
                id: record && record.id,
            },
        });
    };

    onPageChange = type => (current, pageSize) => {
        const param = {
            currentPage: type === "current" ? current : 1,
            pageSize,
        };
        this.getData(param);
    };

    getData = data => {
        this.setState({ loading: true });
        dispatch({
            type: "market/queryData",
            payload: data,
            callback: ({ type, msg }) => {
                this.setState({ loading: false });
                if (type === "error") err(msg);
            },
        });
    };

    handleExport = () => {
        this.callModel("doExport", {}, ({ msg, type }) => {
            if (type === "success") {
                success({ content: msg });
            } else {
                err(msg);
            }
        });
        /* const { pageReq } = this.props;
        fetch("/api/be/act/task/exportTask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(pageReq),
            credentials: "include",
        })
            .then(response =>
                response.blob().then(blob => {
                    const selfURL = window[window.webkitURL ? "webkitURL" : "URL"];
                    const url = selfURL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    // const fileName = response.headers.get('Content-Disposition').split('=')[1];
                    const fileName = "导出数据.xls";
                    a.download = decodeURIComponent(fileName);
                    a.click();
                    success("导出成功");
                })
            )
            .catch(error => {
                err(`导出:${error}`);
            }); */
    };

    callModel = (type, data, callback) => {
        dispatch({
            type: `market/${type}`,
            payload: data,
            callback,
        });
    };

    render() {
        const {
            pageReq: { currentPage: current, pageSize },
            pageRes: { data, total },
        } = this.props;
        const pageProps = {
            ...this.customPageObj,
            ...{ current, pageSize },
            total,
        };
        const { loading } = this.state;
        return (
            <div className = {styles["med-market"]}>
                <CoopMagSearch dispatch = {dispatch} />
                <div className = {styles["btn-container"]}>
                    <Button type = "primary" onClick = {this.onComClick("add")}>
                        创建任务
                    </Button>
                    <Popconfirm placement = "topLeft" title = "是否确定导出" okText = "确定" cancelText = "取消" onConfirm = {this.handleExport}>
                        <Button type = "primary" className = {styles["ml-btn-small"]}>
                            导出
                        </Button>
                    </Popconfirm>
                </div>
                <ComplexTable
                    dataSource = {data}
                    columns = {this.columns}
                    /* pagination = {{
                        ...this.customPageObj,
                        ...{ current, pageSize },
                        total,
                    }} */
                    pagination = {false}
                    scroll = {{ x: "110%", y: "101%" }}
                    bordered
                    rowKey = "_id"
                    loading = {loading}
                />
                <div className = {styles.pagination}>
                    <Pagination {...pageProps} />
                </div>
            </div>
        );
    }
}

export default CoopControl;
