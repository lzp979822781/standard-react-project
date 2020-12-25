import React, { Component } from "react";
import classnames from "classnames";

import { Form } from "antd";
import { EditTable } from "@/components/complex-table";
import { BtnGroup } from "@/components/complex-form";

import { lookCol, lookRewardInit, lookSingleRow, lookWholeRow } from "../TrainCreate/validate";

import styles from "./index.less";

const defaultProps = {
    textArr: [{ text: "按阅读完成度(每商品每篇)", value: 1 }, { text: "按阅读完成度(每商品整体)", value: 2 }],
};

class LookReward extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value || lookRewardInit,
        };
    }

    static getDerivedStateFromProps(props) {
        if ("value" in props) {
            return {
                value: props.value,
            };
        }
        return null;
    }

    onParChange = () => {
        const {
            form: { validateFields },
        } = this.props;
        validateFields((err, values) => {
            this.setVal(values);
        });
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    };

    isBtnSelect = (value, validVal) => {
        const { disabled } = this.props;
        return disabled || !value || value !== validVal;
    };

    isHide = (value, validVal) => !value || value !== validVal;

    genClass = selfDis =>
        classnames({
            [styles.hide]: selfDis,
        });

    render() {
        const {
            form: { getFieldDecorator },
            disabled,
            textArr,
        } = this.props;

        const {
            value: { rewardCycle, readSingle, readWhole },
        } = this.state;

        const readSingleDis = this.isBtnSelect(rewardCycle, 1);
        const totalWholeDis = this.isBtnSelect(rewardCycle, 2);

        const singleClass = this.genClass(this.isHide(rewardCycle, 1));
        const totalClass = this.genClass(this.isHide(rewardCycle, 2));
        return (
            <div className = {styles.look}>
                <Form.Item>
                    {getFieldDecorator("rewardCycle", {
                        initialValue: rewardCycle,
                    })(<BtnGroup textArr = {textArr} disabled = {disabled} onParChange = {this.onParChange} />)}
                </Form.Item>
                <Form.Item className = {singleClass}>
                    {getFieldDecorator("readSingle", {
                        initialValue: readSingle,
                        rules: [{ required: true }],
                    })(
                        <EditTable
                            columns = {lookCol}
                            emptyRow = {{ ...lookSingleRow, rewardType: 1 }}
                            // validate = {this.validate}
                            limit = {5}
                            disabled = {disabled || readSingleDis}
                            onParChange = {this.onParChange}
                        />
                    )}
                </Form.Item>
                <Form.Item className = {totalClass}>
                    {getFieldDecorator("readWhole", {
                        initialValue: readWhole,
                        rules: [{ required: true }],
                    })(
                        <EditTable
                            columns = {lookCol}
                            emptyRow = {{ ...lookWholeRow, rewardType: 2 }}
                            // validate = {this.validate}
                            limit = {5}
                            disabled = {disabled || totalWholeDis}
                            onParChange = {this.onParChange}
                        />
                    )}
                </Form.Item>
            </div>
        );
    }
}

LookReward.defaultProps = defaultProps;
export default Form.create()(LookReward);
