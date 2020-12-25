// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Divider, Tooltip, Tag, Popconfirm, message } from "antd";
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
                data: nextProps.value || {},
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        const value = props.value || [];
        this.searchRef = React.createRef();
        this.tempdate = [];
        this.state = {
            visible: false,
            current: 1,
            pageSize: 10,
            totalCount: 0,
            data: value,
            tempdate: value,
            selectedRowKeys: [],
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
        const { value, rowKey } = this.props;
        let selectedRowKeys;
        if (value && value.length > 0) {
            selectedRowKeys = value.map(item => item[rowKey]);
        }

        this.setState(
            {
                visible: true,
                selectedRowKeys: selectedRowKeys || [],
            },
            () => {
                this.getList();
            }
        );
    };

    handleOk = () => {
        const { tempdate } = this.state;
        const { type } = this.props;
        if (tempdate && tempdate.length === 0) {
            const msg = type === "radio" ? "请选择活动组后提交！" : "请选择活动商品后提交！";
            message.destroy();
            message.warning(msg);
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
                tempdate: [],
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
        if (e) {
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

        this.onSearch();
    };

    delete = index => {
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

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    render() {
        const { buttonText, title, tooltip, columns, searchForm, type, rowKey, disabled } = this.props;
        const { selectedRowKeys, visible, fetching, list, current, totalCount, data, fields } = this.state;
        const self = this;
        const rowSelection = {
            type,
            selectedRowKeys,
            onChange: (selectedKeys, selectedRows) => {
                self.tempdate = self.tempdate.concat(selectedRows);
                self.tempdate = self.tempdate.filter(item => selectedKeys.includes(item.id));
                const objkey = [];
                const arrayUnique = [];
                self.tempdate.forEach(item => {
                    if (!objkey.includes(item.id)) {
                        objkey.push(item.id);
                        arrayUnique.push(item);
                    }
                });
                this.setState({
                    selectedRowKeys: selectedKeys,
                    tempdate: arrayUnique,
                });
            },
            getCheckboxProps: item => ({
                disabled: item.status === 2,
            }),
        };
        let columnsSelect = columns;
        if (!disabled) {
            columnsSelect = columns.concat([
                {
                    title: "操作",
                    dataIndex: "action",
                    width: 100,
                    fixed: "right",
                    render: (text, record, index) => (
                        <Popconfirm
                            title = "确定删除吗?"
                            onConfirm = {() => {
                                this.delete(index);
                            }}
                            onCancel = {() => {}}
                        >
                            <a>删除</a>
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
                    {data.length > 0 && type === "radio" && data[0] && data[0].groupName ? (
                        <Tooltip title = {data[0].groupName}>
                            <Tag closable = {!disabled} onClose = {this.onCloseTag}>
                                <div style = {{ float: "left", display: "inline-block", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{data[0].groupName}</div>
                            </Tag>
                        </Tooltip>
                    ) : null}
                </div>
                {data.length > 0 && type === "checkbox" ? (
                    <ComplexTable columns = {columnsSelect} dataSource = {data} pagination = {false} rowKey = {rowKey} loading = {fetching} size = "small" scroll = {{ y: 280, x: 800 }} />
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
                        rowSelection = {rowSelection}
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
    // eventList: []
};

export default StandardModel;
