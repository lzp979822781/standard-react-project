import React, { Component } from "react";
import classnames from "classnames";
import { Input } from "antd";

import styles from "./index.less";

const { TextArea } = Input;

class Card extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // value: undefined,
            title: "",
            content: "",
        };
    }

    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return { ...(nextProps.value || {}) };
        }

        return null;
    }

    /**
     * title、content改变后公共回调方法
     * @params {String} type type值为title或content,标识title和content的改变
     */
    onChange = type => e => {
        const { value } = e.target;
        const { title, content } = this.state;
        const updateVal = { title, content, ...{ [type]: value } };
        // console.log('updateV', updateVal);
        this.setVal(updateVal);
        this.setState({ [type]: value });
        // 主动调用失焦保存
        // eslint-disable-next-line react/destructuring-assignment
        this.props.onBlur(e);
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    };

    onBlur = e => {
        console.log("e", e);
    };

    render() {
        const { value, className, disabled, onBlur } = this.props;
        const { title, content } = value || {};
        const cardClass = classnames(styles["card-table"], {
            [className]: className,
        });
        return (
            <div className = {cardClass} onBlur = {onBlur}>
                <Input placeholder = "title" onChange = {this.onChange("title")} value = {title || ""} disabled = {disabled} className = {styles.title} maxLength = {15} onPressEnter = {this.onChange("title")} />
                <TextArea rows = {3} onChange = {this.onChange("content")} value = {content || ""} className = {styles.content} maxLength = {30} disabled = {disabled} />
            </div>
        );
    }
}

export default Card;
