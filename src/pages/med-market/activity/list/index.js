/* eslint-disable import/extensions */
import React, { Component } from "react";
import { connect } from "dva";
import { routerRedux } from "dva/router";
import Link from "umi/link";
import moment from "moment";
import { Button, Popconfirm, Menu, Dropdown, Divider } from "antd";
import ComplexTable from "@/components/ComplexTable";
import YaoForm from "./YaoForm";
// import YaoFormRelate from "./YaoFormRelate";
import { columns, formTplData } from "./templateData";
import { resCallback } from "@/utils/utils";

import styles from "./index.less";

@connect(({ activityList, loading }) => ({
    ...activityList,
    loading: loading.effects["activityList/getList"],
    recallLoading: loading.effects["activityList/recall"],
}))
class ActivityList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1,
            pageSize: 10,
            fields: {},
        };
    }

    componentDidMount() {
        this.onSearch();
    }

    getList = values => {
        const { current, pageSize } = this.state;
        const { dispatch } = this.props;
        dispatch({
            type: "activityList/getList",
            payload: { ...values, currentPage: current, pageSize },
        });
    };

    formatParam = values => {
        let actTaskId;
        if (values.actTask && !values.actTask.key && values.actTaskId) {
            // eslint-disable-next-line prefer-destructuring
            actTaskId = Number(values.actTaskId);
        } else if (values.actTask && values.actTask.key && !values.actTaskId) {
            actTaskId = Number(values.actTask.key);
        }

        return {
            name: values.name,
            actStartTime: values.rangeTime && values.rangeTime[0] ? `${moment(values.rangeTime[0]).format("YYYY-MM-DD")} 00:00:00` : "",
            actEndTime: values.rangeTime && values.rangeTime[1] ? `${moment(values.rangeTime[1]).format("YYYY-MM-DD")} 23:59:59` : "",
            type: values.type ? Number(values.type) : 0,
            realStatus: values.status ? Number(values.status) : 0,
            venderId: values.venderId ? values.venderId.venderId : undefined,
            actTaskId,
            idList: values.id ? [Number(values.id)] : "",
        };
    };

    onSearch = (values = {}) => {
        this.setState(
            {
                current: 1,
            },
            () => {
                const param = this.formatParam(values);
                this.getList(param);
            }
        );
    };

    onSubmit = values => {
        this.onSearch(values);
    };

    onReset = () => {
        this.onSearch();
        this.setState({ fields: {} });
    };

    onPageChange = pageNumber => {
        const { param } = this.props;
        this.setState(
            {
                current: pageNumber,
            },
            () => {
                this.getList(param);
            }
        );
    };

    onShowSizeChange = (current, size) => {
        const { param } = this.props;
        this.setState(
            {
                current,
                pageSize: size,
            },
            () => {
                this.getList(param);
            }
        );
    };

    onAdd = e => {
        const { dispatch } = this.props;
        // 路由跳转时附加参数
        const pathnames = {
            1: "./create/display",
            2: "./create/collect",
            3: "./create/pull-sale",
            4: "./create/train",
            5: "./create/train",
        };
        dispatch(
            routerRedux.push({
                pathname: pathnames[e.key],
                query: { type: e.key, pageType: "add" },
            })
        );
    };

    recall = data => {
        const { dispatch } = this.props;
        dispatch({
            type: "activityList/recall",
            payload: { actId: data.id },
            callback: response => {
                resCallback(
                    response,
                    () => {
                        this.onSearch();
                    },
                    "活动撤销成功"
                );
            },
        });
    };

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    render() {
        const { list, loading, recallLoading, total, current, pageSize } = this.props;
        const { fields } = this.state;

        const menu = (
            <Menu onClick = {this.onAdd}>
                <Menu.Item key = "1">陈列</Menu.Item>
                <Menu.Item key = "2">采购</Menu.Item>
                <Menu.Item key = "3">动销</Menu.Item>
                <Menu.Item key = "4">培训-京采说</Menu.Item>
                <Menu.Item key = "5">培训-用心看</Menu.Item>
            </Menu>
        );
        const columns1 = columns.concat([
            {
                title: "操作",
                dataIndex: "action",
                width: 120,
                fixed: "right",
                render: (text, record) => {
                    let detailUrl = "";
                    let createUrl = "";

                    // 培训和其他活动限时撤回按钮区分
                    const hasRecallArray = [4, 5].includes(record.type) ? [2, 3, 103] : [2, 3, 100];

                    if (record.type === 1) {
                        detailUrl = "./detail/display";
                        createUrl = "./create/display";
                    } else if (record.type === 2) {
                        detailUrl = "./detail/collect";
                        createUrl = "./create/collect";
                    } else if (record.type === 3) {
                        detailUrl = "./detail/pull-sale";
                        createUrl = "./create/pull-sale";
                    } else if (record.type === 4) {
                        detailUrl = "./detail/train";
                        createUrl = "./create/train";
                    } else if (record.type === 5) {
                        detailUrl = "./detail/train";
                        createUrl = "./create/train";
                    } else {
                        detailUrl = "./detail/display";
                        createUrl = "./create/display";
                    }
                    return (
                        <span>
                            <Link
                                to = {{
                                    pathname: detailUrl,
                                    query: { id: record.id, pageType: "view", type: record.type },
                                }}
                            >
                                查看
                            </Link>
                            {hasRecallArray.includes(record.realStatus) ? (
                                <React.Fragment>
                                    <Divider type = "vertical" />
                                    <Popconfirm
                                        title = "确定撤回吗?"
                                        onConfirm = {() => {
                                            this.recall(record);
                                        }}
                                    >
                                        <a>撤回</a>
                                    </Popconfirm>
                                </React.Fragment>
                            ) : null}
                            {[1, 4, 6].includes(record.status) ? (
                                <React.Fragment>
                                    <Divider type = "vertical" />
                                    <Link
                                        to = {{
                                            pathname: createUrl,
                                            query: { id: record.id, pageType: "edit", type: record.type },
                                        }}
                                    >
                                        编辑
                                    </Link>
                                </React.Fragment>
                            ) : null}
                        </span>
                    );
                },
            },
        ]);

        return (
            <div className = {styles.tableList}>
                <YaoForm
                    items = {formTplData}
                    columns = {3}
                    layout = {{
                        labelCol: { span: 6 },
                        wrapperCol: { span: 18 },
                    }}
                    onChange = {this.handleFormChange}
                    fields = {{ ...fields }}
                    onReset = {this.onReset}
                    onSubmit = {this.onSubmit}
                />
                {/* <pre className = "language-bash">{JSON.stringify(fields, null, 2)}</pre> */}
                {/* <YaoFormRelate items = {formTplData2} /> */}
                <div className = {styles.tableListOperator}>
                    <Dropdown overlay = {menu}>
                        <Button icon = "plus" type = "primary">
                            创建活动
                        </Button>
                    </Dropdown>
                </div>
                <ComplexTable
                    dataSource = {list}
                    columns = {columns1}
                    scroll = {{ x: 1800 }}
                    pagination = {{
                        showTotal: () => `共 ${total} 条`,
                        showQuickJumper: true,
                        showSizeChanger: true,
                        current,
                        total,
                        pageSize,
                        pageSizeOptions: ["10", "15", "20"],
                        onChange: this.onPageChange,
                        onShowSizeChange: this.onShowSizeChange,
                    }}
                    bordered
                    rowKey = "id"
                    loading = {loading || recallLoading}
                />
            </div>
        );
    }
}

export default ActivityList;
