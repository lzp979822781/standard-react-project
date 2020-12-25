/* eslint-disable import/extensions */
/* eslint-disable no-restricted-globals */
import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import cloneDeep from "lodash/cloneDeep";

import { InputNumber, Popconfirm, Icon, message } from "antd";

import { UUID } from "@/utils/utils";

import styles from "./index.less";

const defaultProps = {
    limit: undefined,
    rewardType: 1,
};

const propTypes = {
    limit: PropTypes.number,
    rewardType: PropTypes.number,
};

const MessageWrapper = (type, msg) => message[type](msg, 2);

class RebateTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.value || [
                {
                    rewardType: undefined,
                    meet: undefined,
                    reward: undefined,
                },
            ],
        };
    }

    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return { data: [...nextProps.value] || [] };
        }

        return null;
    }

    onSelect = record => value => {
        // console.log("select", record, value, otherProps);
        this.changeVal(record, { rewardType: value });
    };

    /**
     * @param {Object} record 当前行数据
     * @param {String} type type值为meet 标识件数, 为reward标识奖励金额
     */
    onBlur = (record, type) => e => {
        // e.persist();
        // console.log("e", e.target.value, typeof e.target.value);
        const { value } = e.target;
        if (typeof value !== "undefined" && value !== "") {
            const floatVal = parseFloat(value);
            if (!isNaN(floatVal)) {
                this.changeVal(record, { [type]: floatVal });
            }
        }
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        } else {
            this.setState({
                data: value,
            });
        }
    };

    /**
     *
     *
     * @param {*} record 当前更改的行数据
     */
    changeVal = (record, paramObj) => {
        const { data } = this.state;
        const tempVal = cloneDeep(data);
        const resData = tempVal.map(item => {
            let tempItem = cloneDeep(item);
            if (record.key === item.key) {
                tempItem = Object.assign({}, item, paramObj);
            }

            return tempItem;
        });

        // console.log("changeVal", resData);
        this.setVal(resData);
        return resData;
    };

    renderUI = () => {
        const { rewardType, disabled, limit } = this.props;
        const that = this;
        const { data } = that.state;
        const isArray = Array.isArray(data);
        if (isArray && data.length) {
            return data.map((item, index) => {
                const { key } = item;
                return (
                    <div key = {key} className = {styles["item-container"]}>
                        <div>
                            {this.genText("满")}
                            <InputNumber
                                step = {1}
                                min = {rewardType === 1 ? 1 : 0.01}
                                defaultValue = {item.meet}
                                precision = {rewardType === 1 ? 0 : 2}
                                onBlur = {this.onBlur(item, "meet")}
                                disabled = {disabled}
                            />
                            {rewardType === 1 ? this.genText("盒") : this.genText("元")}
                            {/* {rewardType === 1 ? this.genText("件") : this.genText("元")} */}
                        </div>
                        <div>
                            {rewardType === 1 ? this.genText("每盒返") : this.genText("返")}
                            {/* {this.genText("返")} */}
                            <InputNumber step = {1} min = {0.01} defaultValue = {item.reward} precision = {2} onBlur = {this.onBlur(item, "reward")} disabled = {disabled} />
                            {this.genText("元")}
                        </div>
                        {disabled || limit === 1 ? null : <div>{this.genIcon({ index, record: item })}</div>}
                    </div>
                );
            });
        }
        return "";
    };

    genIcon = paramObj => {
        const { index } = paramObj;
        const {
            data: { length = 0 },
        } = this.state;
        // 只有一个元素 渲染+号, 多个元素时，最后一个渲染 x 和 + 其余渲染x
        const that = this;

        const iconClass = classnames(styles["font-middle"], {
            "ml-small": length !== 1,
        });
        const Minus = (
            <Popconfirm title = "确定删除吗?" onConfirm = {that.handleDelete(paramObj)}>
                <Icon type = "close-circle" className = {styles["font-middle"]} />
            </Popconfirm>
        );
        const Plus = <Icon type = "plus-circle" className = {iconClass} onClick = {that.handleAdd} />;

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

            return isOnly ? Plus : compisite;
        }
        return "";
    };

    handleDelete = paramObj => () => {
        const {
            record: { key },
        } = paramObj;
        // const dataSource = [...this.state.dataSource];
        const { data } = this.state;
        const newData = data.filter(item => item.key !== key);
        this.updateVal(cloneDeep(newData));
    };

    handleAdd = () => {
        // 添加空行
        const {
            props: { emptyRow = {}, limit },
            state: {
                data,
                data: { length },
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
        this.updateVal([...cloneDeep(data), addRow]);
    };

    updateVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        } else {
            this.setState({
                data: value,
            });
        }
    };

    genText = text => <span className = {styles.space}>{text}</span>;

    render() {
        return <div className = {styles["rebate-table"]}>{this.renderUI()}</div>;
    }
}

RebateTable.propTypes = propTypes;
RebateTable.defaultProps = defaultProps;

export default RebateTable;
