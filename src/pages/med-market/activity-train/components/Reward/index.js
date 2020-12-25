import React, { Component } from "react";
import classnames from "classnames";

import { Form } from "antd";
import { EditTable } from "@/components/complex-table";
import { BtnGroup } from "@/components/complex-form";

import { qualityCol, quaSingleRow, quaWholeRow, totalSingleCol, totalSingleRow, totalWholeRow, rewardInit } from "../TrainCreate/validate";

import styles from "./index.less";

const defaultProps = {
    textArr: [{ text: "按完成质量(每商品每句话)", value: 1 }, { text: "按完成质量(每商品整体)", value: 2 }],
    qualityArr: [{ text: "按完成质量(每商品每句话)", value: 1, disabled: false }, { text: "按完成质量(每商品整体)", value: 2, disabled: false }],
    totalArr: [{ text: "按累计次数(每商品每句话)", value: 1, disabled: false }, { text: "按累计次数(每商品整体)", value: 2, disabled: false }],
};

class Reward extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value || rewardInit,
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
            qualityArr,
            totalArr,
        } = this.props;

        const {
            value: { rewardQuality, rewardNum, qualitySingle, qualityWhole, totalSingle, totalWhole },
        } = this.state;

        const quaSingleDis = this.isBtnSelect(rewardQuality, 1);
        const quaWholeDis = this.isBtnSelect(rewardQuality, 2);
        const totalSingleDis = this.isBtnSelect(rewardNum, 1);
        const totalWholeDis = this.isBtnSelect(rewardNum, 2);

        const quaSingleClass = this.genClass(this.isHide(rewardQuality, 1));
        const quaWholeClass = this.genClass(this.isHide(rewardQuality, 2));
        const totalSingleClass = this.genClass(this.isHide(rewardNum, 1));
        const totalWholeClass = this.genClass(this.isHide(rewardNum, 2));

        return (
            <div className = {styles.reward}>
                <Form.Item>
                    {getFieldDecorator("rewardQuality", {
                        initialValue: rewardQuality,
                    })(<BtnGroup textArr = {qualityArr} disabled = {disabled} onParChange = {this.onParChange} />)}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator("rewardNum", {
                        initialValue: rewardNum,
                    })(<BtnGroup textArr = {totalArr} disabled = {disabled} onParChange = {this.onParChange} />)}
                </Form.Item>
                <Form.Item className = {quaSingleClass}>
                    <div className = {styles["qua-header"]}>完成质量(每商品每句话)</div>
                    {getFieldDecorator("qualitySingle", {
                        initialValue: qualitySingle,
                        rules: [{ required: true }],
                    })(
                        <EditTable
                            columns = {qualityCol}
                            emptyRow = {quaSingleRow}
                            // validate = {this.validate}
                            limit = {5}
                            disabled = {disabled || quaSingleDis}
                            onParChange = {this.onParChange}
                        />
                    )}
                </Form.Item>
                <Form.Item className = {quaWholeClass}>
                    <div className = {styles["qua-header"]}>完成质量(每商品整体)</div>
                    {getFieldDecorator("qualityWhole", {
                        initialValue: qualityWhole,
                        rules: [{ required: true }],
                    })(
                        <EditTable
                            columns = {qualityCol}
                            emptyRow = {quaWholeRow}
                            // validate = {this.validate}
                            limit = {5}
                            disabled = {disabled || quaWholeDis}
                            onParChange = {this.onParChange}
                        />
                    )}
                </Form.Item>
                <Form.Item className = {totalSingleClass}>
                    <div className = {styles["total-header"]}>累积次数(每商品每句话)</div>
                    {getFieldDecorator("totalSingle", {
                        initialValue: totalSingle,
                        rules: [{ required: true }],
                    })(
                        <EditTable
                            columns = {totalSingleCol}
                            emptyRow = {totalSingleRow}
                            // validate = {this.validate}
                            limit = {5}
                            disabled = {disabled || totalSingleDis}
                            onParChange = {this.onParChange}
                        />
                    )}
                </Form.Item>
                <Form.Item className = {totalWholeClass}>
                    <div className = {styles["total-header"]}>累积次数(每商品整体)</div>
                    {getFieldDecorator("totalWhole", {
                        initialValue: totalWhole,
                        rules: [{ required: true }],
                    })(
                        <EditTable
                            columns = {totalSingleCol}
                            emptyRow = {totalWholeRow}
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

Reward.defaultProps = defaultProps;
export default Form.create()(Reward);
