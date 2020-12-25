/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
// import cloneDeep from "lodash/cloneDeep";
import { Button, Modal, Table, Tooltip, Popconfirm } from "antd";
import cloneDeep from "lodash/cloneDeep";
import { CommonTable } from "@/components/complex-table";

import styles from "./index.less";

const defaultProps = {
    title: "列表选择",
    showArea: true,
    otherParam: {},
    // eslint-disable-next-line react/default-props-match-prop-types
    promptMsg: "",
    isOpenTooltip: false,
    showClear: true,
    checkType: "checkbox",
    size: "default",
};

const propTypes = {
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
    showArea: PropTypes.bool,
    otherParam: PropTypes.object,
    isOpenTooltip: PropTypes.bool,
    showClear: PropTypes.bool,
    checkType: PropTypes.string,
    size: PropTypes.string,
};

// eslint-disable-next-line no-unused-vars
let cacheData = [];
let primitData = [];

let interVal;

class ModalList extends Component {
    constructor(props) {
        super(props);
        cacheData = (Array.isArray(props.value) && props.value) || [];
        primitData = (Array.isArray(props.value) && props.value) || [];
        this.state = {
            selectData: cloneDeep(props.value) || undefined, // 当前选中值
            visible: false, // 是否显示弹窗
            searchParam: undefined,
            initVal: undefined,
            isShowTooltip: false,
            selectedRowKeys: [],
        };
    }

    /*     static getDerivedStateFromProps(nextProps, prevState) {
        const { value } = nextProps;
        if ("value" in nextProps) {
            const { selectData } = prevState;
            if (typeof selectData === "undefined") {
                return null;
            }
            return {
                selectData: Array.isArray(value) ? value : undefined,
            };
        }
        return null;
    } */

    static getDerivedStateFromProps(nextProps) {
        const { value } = nextProps;
        if ("value" in nextProps) {
            return {
                selectData: value,
            };
        }
        return null;
    }

    componentDidMount() {}

    handleOk = () => {
        const { selectData } = this.state;
        // this.setVal(cacheData);
        // this.setVal(selectData);
        this.setState({ visible: false });
    };

    handleCancel = () => {
        this.setState({ visible: false });
        // 取消的时候,重新赋缓存的初值
        const { initVal } = this.state;
        this.setVal(initVal);
    };

    /**
     * 清除
     */
    /*     onSelectChange = selectedRows => {
        this.setState({
            selectData: selectedRows,
        });
        cacheData = selectedRows;
    }; */
    onSelectChange = (selectedRows, selKeys) => {
        const newData = this.combineSelectedData(selectedRows, selKeys);
        this.setState({
            selectData: newData,
        });

        this.setVal(newData);
    };

    combineSelectedData = (data, selKeys) => {
        const { rowKey } = this.props;
        const { selectData = [] } = this.state;
        const complex = selectData.concat(data);
        const idsObj = {};
        const filterData = [];
        if (Array.isArray(selKeys) && !selKeys.length) {
            cacheData = [];
            return [];
        }
        complex.forEach(item => {
            const { [rowKey]: id } = item || {};
            if (selKeys.includes(id) && !idsObj[id]) {
                idsObj[id] = item;
                filterData.push(item);
            }
        });

        cacheData = filterData;
        return filterData;
    };

    onSearch = param => {
        this.table.getData(param);
        this.setState({ searchParam: param });
    };

    onRef = ref => {
        // 获取searchArea的
        this.table = ref;
    };

    /* openModal = () => {
        this.setState({ visible: true });
    }; */
    openModal = () => {
        const { value } = this.props;
        this.setState({ visible: true, initVal: value });
        const param = this.jointParam();
        if (this.table) {
            // 可能在打开弹框的时候，依赖的参数才由其他组件的失焦事件获取到，所以这里需要加一个0的延时，放入任务队列
            setTimeout(() => {
                this.table.getData(param);
            }, 0);
        }
    };

    /**
     * 清空当前选中值
     */
    handleClear = () => {
        /*         if (this.table) {
            this.table.onSelectChange([], []);
        } else {
            this.onSelectChange([]);
        } */
        this.setVal(undefined);
    };

    setVal = value => {
        const that = this;
        const { onChange } = that.props;
        if (onChange) {
            onChange(value);
        } else {
            that.setState({
                selectData: value,
            });
        }
    };

    jointParam = () => {
        const { searchParam } = this.state;
        const { otherParam } = this.props;
        const tableParam = Object.assign({}, searchParam || {}, otherParam);
        return tableParam;
    };

    onMouseEnter = e => {
        const { disabled } = this.props;
        clearTimeout(interVal);
        if (disabled) {
            this.setState({ isShowTooltip: true });
        }
    };

    onMouseLeave = e => {
        this.setState({ isShowTooltip: false });
    };

    hanldDel = record => () => {
        const { selectData } = this.state;
        const { rowKey, disabled } = this.props;
        if (disabled) return;
        if (Array.isArray(selectData) && selectData.length) {
            const filterArr = selectData.filter(({ [rowKey]: id }) => id !== record[rowKey]);
            this.setVal(cloneDeep(filterArr));
        }
    };

    handleBatchDel = () => {
        const { selectData, selectedRowKeys } = this.state;
        const { rowKey } = this.props;
        if (Array.isArray(selectedRowKeys)) {
            if (selectedRowKeys.length) {
                const filterArr = selectData.filter(({ [rowKey]: id }) => !selectedRowKeys.includes(id));
                this.setVal(cloneDeep(filterArr));
            }
        }
    };

    getCheckboxProps = () => {
        const { disabled } = this.props;
        return { disabled };
    };

    /**
     * 复选框选择后回调函数
     * @param {array} selectedRowKeys 选中数据的key,默认根据传入的rowKey字段去筛选
     * @param {array} selectedRows 选中的数据
     */
    onRowSelChange = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys });
    };

    genNewCols = () => {
        const { columns, disabled } = this.props;
        const newCols = columns.concat({
            title: "操作",
            dataIndex: "operation",
            fixed: "right",
            width: 120,
            render: (text, record, index) => {
                const button = (
                    <Button type = "primary" className = {`${styles["ml-btn-small"]}`} size = "small" disabled = {disabled}>
                        删除
                    </Button>
                );
                const ele = (
                    <div>
                        <Popconfirm placement = "topRight" title = "确定删除吗？" okText = "确定" cancelText = "取消" onConfirm = {this.hanldDel(record)}>
                            {button}
                        </Popconfirm>
                    </div>
                );
                return disabled ? button : ele;
            },
        });
        return newCols;
    };

    renderBatchDel = () => {
        const { disabled } = this.props;
        const button = (
            <Button type = "dashed" className = {styles["ml-small"]} disabled = {disabled}>
                批量删除
            </Button>
        );
        if (disabled) {
            return button;
        }

        return (
            <Popconfirm placement = "topRight" title = "确定删除吗?" okText = "确定" cancelText = "取消" onConfirm = {this.handleBatchDel}>
                {button}
            </Popconfirm>
        );
    };

    render() {
        const { value, visible, selectData, searchParam, isShowTooltip, selectedRowKeys } = this.state;
        const {
            title,
            disabled,
            columns,
            url,
            renderSearch,
            forceRender,
            showArea,
            renderTable,
            listParam,
            otherParam,
            promptMsg,
            isOpenTooltip,
            rowKey,
            modalListKey,
            showClear,
            checkType,
            size,
        } = this.props;
        const text = (selectData && selectData.length && `已选择${selectData.length}项`) || "请选择";

        const hideTable = classnames({
            [styles.hideTable]: visible || !selectData || selectData.length === 0,
        });

        const searchProps = {
            onSearch: this.onSearch,
        };

        const tableParam = this.jointParam();
        const rowSelection = {
            fixed: true,
            selectedRowKeys,
            onChange: this.onRowSelChange,
            getCheckboxProps: this.getCheckboxProps,
        };

        return (
            <div className = {styles["modal-list"]} onMouseLeave = {this.onMouseLeave}>
                <Tooltip title = {promptMsg} visible = {isOpenTooltip && isShowTooltip}>
                    <span onMouseEnter = {this.onMouseEnter}>
                        <Button type = "primary" onClick = {this.openModal} disabled = {disabled}>
                            {text}
                        </Button>
                        {showClear && (selectData && selectData.length) ? this.renderBatchDel() : ""}
                    </span>
                </Tooltip>

                <div className = {hideTable}>
                    <Table dataSource = {selectData || []} columns = {this.genNewCols()} pagination = {false} rowKey = {rowKey || "id"} rowSelection = {rowSelection} scroll = {{ x: "105%" }} />
                </div>
                <Modal title = {title} visible = {visible} onOk = {this.handleOk} onCancel = {this.handleCancel} className = {styles["modal-table"]}>
                    {renderSearch && showArea && renderSearch(searchProps)}
                    {(renderTable && renderTable(tableParam)) || (
                        <CommonTable
                            url = {url}
                            columns = {columns}
                            // rowKey = "groupId"
                            onSelectChange = {this.onSelectChange}
                            onRef = {this.onRef}
                            scroll = {{ y: 280, x: "105%" }}
                            tableParam = {tableParam}
                            visible = {visible}
                            rowKey = {rowKey || "id"}
                            showValue = {selectData}
                            checkType = {checkType}
                            size = {size}
                        />
                    )}
                </Modal>
            </div>
        );
    }
}

ModalList.defaultProps = defaultProps;
ModalList.propTypes = propTypes;

export default ModalList;
