/* eslint-disable import/extensions */
import React, { Component } from "react";
import { connect } from "dva";
// import { routerRedux } from "dva/router";
import Link from "umi/link";
import moment from "moment";
import { Divider } from "antd";
import ComplexTable from "@/components/ComplexTable";
import YaoForm from "../list/YaoForm";
import { columns, formTplData } from "./templateData";

import styles from "./index.less";

@connect(({ activityCheckListGy, loading }) => ({
    ...activityCheckListGy,
    loading: loading.effects["activityCheckListGy/getList"],
}))
class ActivityCheckList extends Component {
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
            type: "activityCheckListGy/getList",
            payload: { ...values, currentPage: current, pageSize },
        });
    };

    formatParam = values => ({
        name: values.name,
        actStartTime: values.rangeTime && values.rangeTime[0] ? `${moment(values.rangeTime[0]).format("YYYY-MM-DD")} 00:00:00` : "",
        actEndTime: values.rangeTime && values.rangeTime[1] ? `${moment(values.rangeTime[1]).format("YYYY-MM-DD")} 23:59:59` : "",
        type: Number(values.type) || 0,
        status: Number(values.status) || 0,
    });

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
        this.onSearch({});
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

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    render() {
        const { list, loading, total, current, pageSize } = this.props;
        const { fields } = this.state;
        const columns1 = columns.concat([
            {
                title: "操作",
                dataIndex: "action",
                width: 100,
                // fixed: "right",
                render: (text, record) => {
                    let checkUrl = "";
                    let detailUrl = "";
                    // type 1:陈列， 2 采购
                    if (record.type === 1) {
                        checkUrl = "./check/display";
                        detailUrl = "./detail/display";
                    } else if (record.type === 2) {
                        checkUrl = "./check/collect";
                        detailUrl = "./detail/collect";
                    } else if (record.type === 3) {
                        checkUrl = "./check/pull-sale";
                        detailUrl = "./detail/pull-sale";
                    } else if (record.type === 4) {
                        checkUrl = "./check/train";
                        detailUrl = "./detail/train";
                    } else if (record.type === 5) {
                        checkUrl = "./check/train";
                        detailUrl = "./detail/train";
                    } else {
                        detailUrl = "./check/display";
                        detailUrl = "./detail/display";
                    }
                    return (
                        <span>
                            <Link
                                to = {{
                                    pathname: detailUrl,
                                    query: { checkType: "gy", id: record.id, pageType: "view", type: record.type },
                                }}
                            >
                                查看
                            </Link>
                            {[3].includes(record.status) ? (
                                <React.Fragment>
                                    <Divider type = "vertical" />
                                    <Link
                                        to = {{
                                            pathname: checkUrl,
                                            query: {
                                                id: record.id,
                                                checkType: "gy",
                                                pageType: "check",
                                                type: record.type,
                                                verified: record.verified,
                                            },
                                        }}
                                    >
                                        药企审核
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
                <ComplexTable
                    dataSource = {list}
                    columns = {columns1}
                    scroll = {{ x: 1100 }}
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
                    loading = {loading}
                />
            </div>
        );
    }
}

export default ActivityCheckList;
