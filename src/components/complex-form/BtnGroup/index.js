import React, { Component } from "react";

import { Button, Radio } from "antd";

import styles from "./index.less";

const defaultProps = {
    textArr: [{ text: "按完成质量(每商品每句话)", value: 1 }, { text: "按完成质量(每商品整体)", value: 2 }],
    showClear: true,
};

class BtnGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static getDerivedStateFromProps(props) {
        if ("value" in props) {
            return {
                value: props.value,
            };
        }
        return null;
    }

    handleChange = e => {
        this.setVal(e.target.value);
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
        this.callPar();
    };

    handleClear = () => {
        this.setVal(undefined);
    };

    // 回调父方法
    callPar = () => {
        const { onParChange } = this.props;
        if (onParChange) onParChange();
    };

    render() {
        const { value, textArr, showClear, disabled } = this.props;
        return (
            <div className = {styles["btn-group"]}>
                <div className = {styles["btn-container"]}>
                    <Radio.Group buttonStyle = "solid" value = {value} onChange = {this.handleChange} disabled = {disabled}>
                        {textArr.map(item => {
                            const { text, value: optionVal, disabled: itemDisabled = false } = item;
                            return (
                                <Radio.Button key = {optionVal} value = {optionVal} disabled = {itemDisabled}>
                                    {text}
                                </Radio.Button>
                            );
                        })}
                    </Radio.Group>
                    {showClear && (
                        <Button type = "dashed" onClick = {this.handleClear} className = {styles["ml-small"]} disabled = {disabled}>
                            清除
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}

BtnGroup.defaultProps = defaultProps;
export default BtnGroup;
