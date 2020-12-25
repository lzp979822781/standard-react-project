/* eslint-disable import/extensions */
import React, { Component } from "react";
import { connect } from "dva";
import Link from "umi/link";
import moment from "moment";
import ComplexTable from "@/components/ComplexTable";
import YaoForm from "../list/YaoForm";
import { columns, formTplData } from "./templateData";
import { isGy } from "@/utils/utils";

import styles from "./index.less";

@connect(({ resultList, loading }) => ({
    ...resultList,
    loading: loading.effects["resultList/getList"],
}))
class ResultList extends Component {
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

        // 工业不显示采购活动，全部结果不显示培训活动
        const typeList = isGy ? ["1", "3"] : ["1", "2", "3"];
        dispatch({
            type: "resultList/getList",
            payload: { ...values, currentPage: current, pageSize, typeList },
        });
    };

    formatParam = values => ({
        name: values.name,
        actStartTime: values.rangeTime && values.rangeTime[0] ? `${moment(values.rangeTime[0]).format("YYYY-MM-DD")} 00:00:00` : "",
        actEndTime: values.rangeTime && values.rangeTime[1] ? `${moment(values.rangeTime[1]).format("YYYY-MM-DD")} 23:59:59` : "",
        type: values.type ? Number(values.type) : "",
        realStatusList: values.realStatusList ? values.realStatusList.split(",") : [],
        venderId: values.venderId ? values.venderId.venderId : undefined,
        actTaskId: values.actTask ? values.actTask.key : undefined,
    });

    onSearch = (values = { realStatusList: "102,104,105" }) => {
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
        this.onSearch({ realStatusList: "102,104,105" });
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
                fixed: "right",
                width: 200,
                render: (text, record) => {
                    let resultUrl = "";

                    if (record.type === 1) {
                        resultUrl = "./result/display";
                    } else if (record.type === 2) {
                        resultUrl = "./result/collect";
                    } else if (record.type === 3) {
                        resultUrl = "./result/pull-sale";
                    } else if (record.type === 4) {
                        resultUrl = "./result/train";
                    } else if (record.type === 5) {
                        resultUrl = "./result/train";
                    } else {
                        resultUrl = "./result/display";
                    }
                    return (
                        <span>
                            <Link
                                to = {{
                                    pathname: resultUrl,
                                    query: { id: record.id, statusText: encodeURI(record.realStatusName), pageType: "view" },
                                }}
                            >
                                查看
                            </Link>
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
                    scroll = {{ x: 1300 }}
                    bordered
                    rowKey = "id"
                    loading = {loading}
                />
            </div>
        );
    }
}

export default ResultList;
