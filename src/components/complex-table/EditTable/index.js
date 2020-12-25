import React, { Component } from "react";
import cloneDeep from "lodash/cloneDeep";
import classnames from "classnames";
import PropTypes from "prop-types";
import { Table, Popconfirm, Icon, message } from "antd";
import { EditableCell, EditableFormRow } from "./EditCell";

import { UUID } from "@/utils/utils";
import styles from "./index.less";

const MessageWrapper = (type, msg) => message[type](msg, 2);

const defaultProps = {
    limit: undefined,
};

const propTypes = {
    emptyRow: PropTypes.object.isRequired,
    limit: PropTypes.number,
};

class EditTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: props.value || [
                {
                    key: UUID(),
                    name: "Edward King 0",
                    age: "32",
                    address: "London, Park Lane no. 0",
                },
            ],
        };
        this.genColumn(props);
    }

    /*     componentDidMount() {
        this.setVal();
    } */

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        const { value } = nextProps;
        if ("value" in nextProps) {
            return {
                dataSource: Array.isArray(value) ? value : [],
            };
        }
        return null;
    }

    genColumn = props => {
        const { columns: propColumn = [] } = props;
        const row = {
            title: "operation",
            dataIndex: "operation",
            width: 108,
            render: (text, record, index) => this.dynamicRender({ text, record, index }),
        };

        this.columns = [...propColumn, row];
    };

    dynamicRender = paramObj => {
        const { disabled } = this.props;
        const { index } = paramObj;
        const {
            dataSource: { length = 0 },
        } = this.state;
        // 只有一个元素 渲染+号, 多个元素时，最后一个渲染 x 和 + 其余渲染x
        const that = this;

        const iconClass = classnames(styles["font-middle"], {
            "ml-small": length !== 1,
        });
        const DelIcon = <Icon type = "close-circle" className = {styles["font-middle"]} />;
        const Minus = disabled ? (
            DelIcon
        ) : (
            <Popconfirm title = "确定删除吗?" onConfirm = {that.handleDelete(paramObj)}>
                {DelIcon}
            </Popconfirm>
        );
        const Plus = <Icon type = "plus-circle" className = {iconClass} onClick = {that.handleAdd(paramObj)} />;

        if (length) {
            const isOnly = length === 1;
            const isLast = isOnly || index === length - 1;
            const compisite = isLast ? (
                <div className = {styles["icon-wrap"]}>
                    {Minus}
                    {Plus}
                </div>
            ) : (
                Minus
            );

            return isOnly ? <Icon type = "plus-circle" className = {styles["font-middle"]} onClick = {that.handleAdd(paramObj)} /> : compisite;
        }
        return "";
    };

    handleDelete = paramObj => () => {
        const {
            record: { key },
        } = paramObj;
        const { disabled } = this.props;
        if (disabled) return;
        // const dataSource = [...this.state.dataSource];
        const { dataSource } = this.state;
        const newData = dataSource.filter(item => item.key !== key);
        this.updateVal(cloneDeep(newData));
        this.callPar();
        // this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
    };

    handleAdd = paramObj => () => {
        const { disabled } = this.props;
        if (disabled) return;
        console.log("paramObj", paramObj);
        const {
            props: { emptyRow = {}, limit },
            state: {
                dataSource,
                dataSource: { length },
            },
        } = this;
        if (typeof limit === "number" && limit > 0 && length + 1 > limit) {
            MessageWrapper("error", `只能添加${limit}条数据`);
            return;
        }
        const addRow = Object.assign({}, emptyRow, {
            key: UUID(),
        });
        // this.setState({ dataSource: [...cloneDeep(dataSource), addRow] })
        this.updateVal([...cloneDeep(dataSource), addRow]);
        this.callPar();
    };

    handleSave = row => {
        const { dataSource } = this.state;
        const newData = cloneDeep(dataSource);
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        this.updateVal(newData);
        this.callPar();
        /* if(onChange) onChange(newData);
        this.setState({ dataSource: newData }); */
    };

    setVal = () => {
        const {
            props: { onChange },
            state: { dataSource },
        } = this;
        if (onChange) {
            onChange(dataSource);
        }
    };

    updateVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    };

    // 回调父方法
    callPar = () => {
        const { onParChange } = this.props;
        if (onParChange) onParChange();
    };

    render() {
        const { dataSource } = this.state;
        const { disabled, rowKey } = this.props;
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columns = this.columns.map(col => {
            const { editable, dataIndex, title, _min } = col;
            if (!editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable,
                    dataIndex,
                    title,
                    handleSave: this.handleSave,
                    disabled,
                    _min,
                }),
            };
        });

        return (
            <div className = {styles["edit-table"]}>
                {/* <Button onClick = {this.handleAdd} type = "primary" style = {{ marginBottom: 16 }}>
                Add a row
                </Button> */}
                <Table
                    components = {components}
                    rowClassName = {() => "editable-row"}
                    dataSource = {dataSource}
                    columns = {columns}
                    pagination = {false}
                    bordered = {false}
                    showHeader = {false}
                    rowKey = {rowKey}
                    // scroll = {{ x: '110%' }}
                />
            </div>
        );
    }
}

EditTable.defaultProps = defaultProps;
EditTable.propTypes = propTypes;

export default EditTable;
