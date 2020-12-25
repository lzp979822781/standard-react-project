/* eslint-disable import/extensions */
import React, { Component } from "react";
import { connect } from "dva";
import moment from "moment";
import ComplexTable from "@/components/ComplexTable";
import YaoForm from "../../../activity/list/YaoForm";
import { columns, formTplData } from "./templateData";

@connect(({ coopApproval, loading }) => ({
    ...coopApproval,
    loading: loading.effects["coopApproval/getList"],
}))
class CoopApproval extends Component {
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
            type: "coopApproval/getList",
            payload: { ...values, currentPage: current, pageSize },
        });
    };

    formatParam = values => ({
        taskNameLike: values.taskNameLike,
        venderId: values.venderId && values.venderId.venderId ? values.venderId.venderId : undefined,
        startTime: values.rangeTime && values.rangeTime[0] ? `${moment(values.rangeTime[0]).format("YYYY-MM-DD")} 00:00:00` : undefined,
        endTime: values.rangeTime && values.rangeTime[1] ? `${moment(values.rangeTime[1]).format("YYYY-MM-DD")} 23:59:59` : undefined,
        status: values.status ? Number(values.status) : "",
    });

    onSearch = (values = {}) => {
        const param = this.formatParam(values);
        this.getList(param);
    };

    onSubmit = values => {
        this.setState(
            {
                current: 1,
            },
            () => {
                this.onSearch(values);
            }
        );
    };

    onReset = () => {
        this.setState(
            {
                current: 1,
            },
            () => {
                this.onSearch();
            }
        );
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
        return (
            <div style = {{ padding: 24 }}>
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
                    columns = {columns}
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
                    loading = {loading}
                />
            </div>
        );
    }
}

export default CoopApproval;
