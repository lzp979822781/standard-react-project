/* eslint-disable react/no-unused-state */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table } from "antd";

import { UUID } from "@/utils/utils";

/* const fakeData = [
    {
        companyName: "北京门店",
        companyAddress: "大兴区",
        userType: "药房",
        pin: 123,
        key: 1,
    },
    {
        companyName: "上海厂商",
        companyAddress: "浦东区",
        userType: "厂商",
        pin: 45,
        key: 2,
    },
    {
        companyName: "南京门店",
        companyAddress: "中山陵",
        userType: "个体户",
        pin: 15,
        key: 3,
    },
    {
        companyName: "成都门店",
        companyAddress: "开发区",
        userType: "中型药厂",
        pin: 65,
        key: 4,
    },
]; */

const defaultProps = {};

const propTypes = {
    url: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    columns: PropTypes.array.isRequired,
};

class CommonTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            currentPage: 1,
            pageSize: 10,

            totalCount: 0,
            data: [],

            selectedRowKeys: this.getSelectKeys(props.showValue) || [],
        };
        const { onRef } = this.props;
        if (onRef) onRef(this);
    }

    /*    static getDerivedStateFromProps(props) {
        const { selectData } = props;
        if("selectData" in props) {
            return {
                selectedRowKeys: selectData,
            };
        }
        return null;
    } */

    componentDidMount() {
        this.getData();
    }

    onSelectChange = (selectedRowKeys, selectedRows) => {
        // console.log('selectedRows changed: ', selectedRows);
        this.setState({ selectedRowKeys });
        this.setVal(selectedRows);
        this.callParSelect(selectedRowKeys, selectedRows);
    };

    callParSelect = (keys, rows) => {
        const { onSelectChange } = this.props;
        if (onSelectChange) {
            onSelectChange(rows, keys);
        }
    };

    getSelectKeys = arr => {
        const { rowKey } = this.props;
        if (Array.isArray(arr) && arr.length) {
            return arr.map(({ [rowKey]: id }) => id);
        }
        return [];
    };

    /*     getCheckboxProps = record => {
        const { showValue, rowKey } = this.props;
        if (Array.isArray(showValue) && showValue.length) {
            return {
                checked: showValue.some(({ [rowKey]: id }) => id === record[rowKey]),
            };
        }

        return {};
    }; */
    getCheckboxProps = record => {
        const { status } = record;
        return {
            disabled: status === 2,
        };
    };

    /**
     * 判断当前选中数据中是否包含已经删除的数据
     */
    handleDelete = () => {};

    /**
     * 分页相关函数
     */
    onPageChange = type => (current, pageSize) => {
        const param = {
            currentPage: type === "current" ? current : 1,
            pageSize,
        };
        this.setState(
            {
                ...param,
            },
            () => {
                this.getData();
            }
        );
    };

    joint = (param = {}) => {
        const { currentPage, pageSize } = this.state;
        const { tableParam } = this.props;
        return {
            ...tableParam,
            ...param,
            currentPage,
            pageSize,
        };
    };

    setVal = value => {
        const { onChange } = this.props;
        this.executeSet([onChange], value);
    };

    executeSet = (arr, value) => {
        arr.forEach(element => {
            if (element) element(value);
        });
    };

    genRowSelection = () => {
        const { showValue, checkType } = this.props;
        const selKeys = this.getSelectKeys(showValue) || [];
        return Object.assign(
            {},
            {
                fixed: true,
                selectedRowKeys: selKeys,
                onChange: this.onSelectChange,
                getCheckboxProps: this.getCheckboxProps,
                type: checkType,
            }
        );
    };

    getData = param => {
        const reqData = this.joint(param);
        const { url } = this.props;
        this.setState({ loading: true });
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reqData),
            credentials: "include",
        })
            .then(response => response.json())
            .then(body => {
                this.setState({ loading: false });
                const {
                    data: { result: data = [], totalCount = 0 },
                    success = false,
                } = body;
                if (success && Array.isArray(data)) {
                    const updateData = data.map(item => {
                        const temp = { ...item, key: UUID() };
                        return temp;
                    });
                    this.setState({
                        totalCount,
                        data: updateData,
                    });
                } else {
                    throw new Error("返回值异常");
                }
            })
            .catch(err => {
                console.log(`table值获取异常:${err}`);
                this.setState({ loading: false });
            });
    };

    render() {
        const that = this;
        const { columns, url, children, onSelectChange, visible, showValue, ...otherProps } = that.props;
        const { data, totalCount: total, currentPage: current, pageSize, loading /* selectedRowKeys */ } = that.state;
        /* const rowSelection = {
            fixed: true,
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: this.getCheckboxProps,
        }; */
        const rowSelection = this.genRowSelection();

        return (
            <div>
                <Table
                    rowSelection = {rowSelection}
                    dataSource = {data}
                    columns = {columns}
                    pagination = {{
                        defaultCurrent: 1,
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: totalNum => `共${totalNum}条`,
                        pageSize,
                        position: "bottom",
                        onChange: this.onPageChange("current"),
                        onShowSizeChange: this.onPageChange("pageSize"),
                        total,
                        current,
                    }}
                    loading = {loading}
                    {...otherProps}
                />
            </div>
        );
    }
}

CommonTable.defaultProps = defaultProps;
CommonTable.propTypes = propTypes;

export default CommonTable;
