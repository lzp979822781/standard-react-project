// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Divider, Tag, Popconfirm, message } from "antd";
import request from "@/utils/request";
import ComplexTable from "@/components/ComplexTable";
import YaoForm from "../list/YaoForm";

const mockdata = [
    // {
    //     id: "11",
    //     erpCode: "11111",
    //     approvNum: 2,
    //     packageSpec: "sdsdsds",
    //     medicinesName: "商品1",
    //     commonName: "商品",
    // },
];

class StandardModel extends PureComponent {
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {
                data: nextProps.value || [],
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        const value = props.value || [];
        this.searchRef = React.createRef();
        this.state = {
            visible: false,
            current: 1,
            pageSize: 10,
            totalCount: 0,
            data: value,
            tempdate: value,
            list: [],
            fetching: false,
            fields: {},
        };
    }

    getList(values) {
        const { current, pageSize } = this.state;
        const { url, param } = this.props;
        this.setState({ list: [], fetching: true });

        const params = {
            currentPage: current,
            pageSize,
            type: 4,
            ...values,
            ...param,
        };

        const asyncFunc = async () => {
            const res = await request(url, {
                method: "POST",
                data: params,
            });

            let total = 0;
            let list = [];

            if (res && res.data && res.data.result) {
                list = res.data.result;
                total = res.data.totalCount;
            }
            this.setState({ list, totalCount: total, fetching: false });
        };

        asyncFunc();
    }

    onPageChange = pageNumber => {
        this.setState(
            {
                current: pageNumber,
            },
            () => {
                this.getList();
            }
        );
    };

    showModal = () => {
        this.setState(
            {
                visible: true,
            },
            () => {
                this.getList();
            }
        );
    };

    handleOk = () => {
        const { tempdate } = this.state;
        if (tempdate && tempdate.length === 0) {
            message.destroy();
            message.warning("请选择活动商品后提交！");
            return;
        }
        this.setState(
            {
                visible: false,
                data: tempdate,
            },
            () => {
                this.triggerChange();
            }
        );
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        });
    };

    onCloseTag = () => {
        this.setState(
            {
                data: [],
            },
            () => {
                this.triggerChange();
            }
        );
    };

    triggerChange = () => {
        const { onChange } = this.props;
        const { tempdate } = this.state;
        if (onChange) {
            onChange(tempdate);
        }
    };

    selectedChange = (record, selectedRows) => {
        const { tempdate } = this.state;
        const newRecord = { ...record };
        const newSelectedRows = selectedRows.map(item => ({
            ...item,
            flag: 1,
        }));

        newRecord.skuInfoList = newSelectedRows;
        let containerIndex = 0;
        let has = false;

        // 遍历查出是否已选择，选择就删除，否则就添加
        tempdate.forEach((item, index) => {
            if (item.id === record.id) {
                containerIndex = index;
                has = true;
            }
        });

        // 如果已经有，就删除
        if (has) {
            tempdate.splice(containerIndex, 1);
        }
        if (selectedRows.length !== 0) {
            tempdate.push(newRecord);
        }

        this.setState({ tempdate }, () => {
            this.triggerChange();
        });
    };

    onSearch = () => {
        const { current } = this.searchRef;
        if (current) {
            current.validateFields((err, values) => {
                if (!err) {
                    this.getList(values);
                }
            });
        } else {
            this.getList({});
        }
    };

    onSubmit = e => {
        if (e.preventDefault) {
            // e.preventDefault();
        }
        this.setState(
            {
                current: 1,
            },
            () => {
                this.onSearch();
            }
        );
    };

    onReset = () => {
        const { current } = this.searchRef;
        if (current) {
            current.resetFields();
        }
        this.setState(
            {
                current: 1,
            },
            () => {
                this.onSearch();
            }
        );
    };

    deleteParent = index => {
        const { onChange } = this.props;
        const { data } = this.state;
        data.splice(index, 1);
        this.setState(
            {
                data,
            },
            () => {
                if (onChange) {
                    onChange(data);
                }
            }
        );
    };

    deleteChild = (index, childIndex) => {
        const { onChange } = this.props;
        const { data } = this.state;
        if (data[index].skuInfoList.length > 1) {
            data[index].skuInfoList.splice(childIndex, 1);
        } else {
            data.splice(index, 1);
        }

        this.setState(
            {
                data,
            },
            () => {
                if (onChange) {
                    onChange(data);
                }
            }
        );
    };

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    render() {
        const { buttonText, title, tooltip, columns, searchForm, type, rowKey, disabled } = this.props;
        const { data, visible, fetching, list, current, totalCount, fields } = this.state;
        let columnsSelect = columns;
        if (!disabled) {
            columnsSelect = columns.concat([
                {
                    title: "操作",
                    dataIndex: "action",
                    width: 120,
                    render: (text, record, index) => (
                        <Popconfirm
                            title = "确定删除吗?"
                            onConfirm = {() => {
                                this.deleteParent(index);
                            }}
                            onCancel = {() => {}}
                        >
                            <a>删除全部</a>
                        </Popconfirm>
                    ),
                },
            ]);
        }

        return (
            <div>
                <div>
                    <Button type = "primary" onClick = {this.showModal} disabled = {disabled}>
                        {buttonText}
                    </Button>
                    <span style = {{ marginLeft: 10 }}>{tooltip}</span>
                    {data.length > 0 && type === "radio" ? (
                        <Tag closable onClose = {this.onCloseTag}>
                            {data[0].groupName}
                        </Tag>
                    ) : null}
                </div>
                {data.length > 0 && type === "checkbox" ? (
                    <ComplexTable
                        columns = {columnsSelect}
                        dataSource = {data}
                        pagination = {false}
                        rowKey = "id"
                        loading = {fetching}
                        size = "small"
                        defaultExpandAllRows
                        expandedRowRender = {(record, index) => {
                            let columns3 = [
                                { title: "商家名称", dataIndex: "shopName" },
                                {
                                    title: "药品名称",
                                    dataIndex: "medicinesName",
                                },
                            ];

                            if (!disabled) {
                                columns3 = columns3.concat([
                                    {
                                        title: "操作",
                                        dataIndex: "action",
                                        width: 100,
                                        render: (childText, childRecord, childIndex) => (
                                            <Popconfirm
                                                title = "确定删除吗?"
                                                onConfirm = {() => {
                                                    this.deleteChild(index, childIndex);
                                                }}
                                                onCancel = {() => {}}
                                            >
                                                <a>删除</a>
                                            </Popconfirm>
                                        ),
                                    },
                                ]);
                            }

                            // 只显示选中flag值为1的

                            const data3 = record.skuInfoList.filter(item => item.flag === 1);

                            return (
                                <div style = {{ padding: 20, backgroundColor: "#FFFFFF" }}>
                                    <ComplexTable showHeader columns = {columns3} dataSource = {data3} pagination = {false} rowKey = "skuId" />
                                </div>
                            );
                        }}
                    />
                ) : null}
                <Modal title = {title} visible = {visible} onOk = {this.handleOk} onCancel = {this.handleCancel} width = {980}>
                    {searchForm.length === 0 ? null : (
                        <YaoForm
                            ref = {this.searchRef}
                            items = {searchForm}
                            columns = {3}
                            layout = {{
                                labelCol: { span: 6 },
                                wrapperCol: { span: 18 },
                            }}
                            onChange = {this.handleFormChange}
                            fields = {{ ...fields }}
                            onReset = {this.onReset}
                            onSubmit = {this.onSubmit}
                            size = "small"
                            expandFormhide
                        />
                    )}
                    {searchForm.length === 0 ? null : <Divider />}
                    <div style = {{ marginBottom: 16 }}>
                        <Button icon = "reload" onClick = {this.onReset} style = {{ marginLeft: 10 }}>
                            刷新
                        </Button>
                    </div>
                    <ComplexTable
                        // rowSelection = {rowSelection}
                        columns = {columns}
                        dataSource = {list.length > 0 ? list : mockdata}
                        pagination = {{
                            showTotal: total => `共 ${total} 条`,
                            showQuickJumper: true,
                            current,
                            total: totalCount,
                            onChange: this.onPageChange,
                        }}
                        bordered
                        rowKey = {rowKey}
                        loading = {fetching}
                        size = "small"
                        scroll = {{ y: 280 }}
                        defaultExpandAllRows
                        expandedRowRender = {record => {
                            const columns3 = [
                                { title: "商家名称", dataIndex: "shopName" },
                                {
                                    title: "药品名称",
                                    dataIndex: "medicinesName",
                                },
                                {
                                    title: "是否可用",
                                    dataIndex: "state",
                                    render: currentItem => {
                                        let txt = "--";
                                        if (currentItem === 1) {
                                            txt = "正常可用";
                                        } else if (currentItem === 2) {
                                            txt = "已参加活动，不可用";
                                        } else if (currentItem === 3) {
                                            txt = "经营范围不匹配，不可用";
                                        }
                                        return txt;
                                    },
                                },
                            ];
                            // 获取选中项和当前项相同的
                            const currentActRecord = data.filter(currentItem => record.id === currentItem.id);

                            // 获取选中项和当前项的子选中项
                            let selectedRowKeys = [];
                            if (currentActRecord[0]) {
                                selectedRowKeys = currentActRecord[0].skuInfoList.map(item => item.skuId);
                            }
                            const rowSelection = {
                                type,
                                selectedRowKeys,
                                onChange: (selectedKeys, selectedRows) => {
                                    this.selectedChange(record, selectedRows);
                                },
                                getCheckboxProps: item => ({
                                    disabled: item.state === 2 || item.state === 3,
                                }),
                            };
                            return (
                                <div style = {{ padding: 20, backgroundColor: "#FFFFFF" }}>
                                    <ComplexTable showHeader rowSelection = {rowSelection} columns = {columns3} dataSource = {record.skuInfoList} pagination = {false} rowKey = "skuId" />
                                </div>
                            );
                        }}
                    />
                </Modal>
            </div>
        );
    }
}

StandardModel.propTypes = {
    title: PropTypes.string,
    buttonText: PropTypes.string,
    columns: PropTypes.array,
    searchForm: PropTypes.array,
    url: PropTypes.string,
    type: PropTypes.string,
    param: PropTypes.object,
    rowKey: PropTypes.string,
    // hasRowSelection:  PropTypes.bool,
    // hasexpandedRowRender:  PropTypes.bool,
    // eventList: PropTypes.array
};

StandardModel.defaultProps = {
    buttonText: "选择",
    title: "",
    columns: [],
    searchForm: [],
    url: "/activity/queryActList",
    type: "checkbox",
    param: {},
    rowKey: "id",
    // hasRowSelection: true
    // eventList: []
};

export default StandardModel;
