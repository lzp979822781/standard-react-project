import React, { Component } from "react";
import { connect } from "dva";
// import { routerRedux } from "dva/router";
import { Button, Select } from "antd";
import ComplexTable from "@/components/ComplexTable";
import { columns, formTplData } from "./templateData";
import YaoForm from "../list/YaoForm";
// import { resCallback, isGy } from "@/utils/utils";
// import { actStatus } from "../list/actStatus";
const { Option } = Select;

@connect(({ applyNumList, loading }) => ({
    ...applyNumList,
    loading: loading.effects["applyNumList/getList"],
}))
class ApplyNumList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1,
            pageSize: 10,
            // selectedRowKeys: [],
            // selectedRows: [],
            fields: {},
        };
    }

    componentDidMount() {
        // const {
        //     location: {
        //         query: { id },
        //     },
        // } = this.props;
        this.initData();
        this.onSearch();
    }

    initData = () => {
        const { dispatch } = this.props;

        // 初始化数据
        dispatch({
            type: "applyNumList/initData",
            payload: {},
        });

        // 获取客户买家类型列表
        dispatch({
            type: "applyNumList/getCompanyCategory",
            payload: {},
        });
    };

    getList = values => {
        const { current, pageSize } = this.state;
        const {
            dispatch,
            location: {
                query: { id },
            },
        } = this.props;
        dispatch({
            type: "applyNumList/getList",
            payload: { actId: Number(id), curPage: current, pageSize, ...values },
        });
    };

    formatParam = values => ({
        ...values,
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
        this.onSearch({ pin: "", userType: 0 });
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

    // onSelectChange = (selectedRowKeys, selectedRows) => {
    //     this.setState({ selectedRowKeys, selectedRows });
    // };

    exportExcel = () => {
        const {
            dispatch,
            location: {
                query: { id },
            },
            param,
        } = this.props;

        const { selectedRows } = this.state;
        dispatch({
            type: "applyNumList/doExport",
            payload: { actId: id, ...param, selectedRows },
        });
    };

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    render() {
        const { list, loading, total, current, companyCategory = [] } = this.props;

        const { fields } = this.state;
        // const rowSelection = {
        //     fixed: true,
        //     selectedRowKeys,
        //     onChange: this.onSelectChange,
        //     // getCheckboxProps: item => ({
        //     //     disabled: !item.cycleId,
        //     // }),
        // };

        const compType = (
            <Select placeholder = "买家类型">
                <Option value = {0}>全部</Option>
                {companyCategory.map(({ name, categoryId }) => (
                    <Option key = {categoryId} value = {categoryId}>
                        {name}
                    </Option>
                ))}
            </Select>
        );

        formTplData[1].component = compType;

        return (
            <>
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
                <div
                    style = {{
                        marginBottom: 24,
                    }}
                >
                    <Button type = "primary" onClick = {this.exportExcel}>
                        导出
                    </Button>
                </div>
                <ComplexTable
                    dataSource = {list}
                    columns = {columns}
                    scroll = {{ x: 1000 }}
                    pagination = {{
                        showTotal: () => `共 ${total} 条`,
                        showQuickJumper: true,
                        current,
                        total,
                        onChange: this.onPageChange,
                    }}
                    bordered
                    rowKey = "id"
                    loading = {loading}
                />
            </>
        );
    }
}

export default ApplyNumList;
