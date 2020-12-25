import React, { Component } from "react";
import { Input, Form } from "antd";

import { goodsList } from "../TrainCreate/validate";

import styles from "./index.less";

const validRule = /，/;

const defaultProps = {
    data: goodsList || [],
    contentId: "id",
    placeholder: '在这里输入文章ID,多篇文章用","隔开',
};
class Articles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.value || [],
        };
    }

    static getDerivedStateFromProps(props) {
        if ("value" in props) {
            return {
                data: props.value || [],
            };
        }
        return null;
    }

    filterData = values => {
        const { data } = this.state;
        const { contentId: tempId } = this.props;
        return data.map(item => {
            const { [tempId]: rowId } = item;
            const fileItem = { contentList: values[rowId] };
            return Object.assign({}, item, fileItem);
        });
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        } else {
            this.setState({ data: value });
        }
    };

    save = e => {
        e.persist();
        const { form } = this.props;
        // 触发父级保存
        form.validateFields((error, values) => {
            console.log("article", values);
            const filterArr = this.filterData(values);
            this.setVal(filterArr);
        });
    };

    handleValid = (rule, value, callback) => {
        if (!value) callback("请输入文章ID");
        if (validRule.test(value)) callback("请输入英文状态逗号");
        callback();
    };

    renderList = () => {
        const { data } = this.state;
        const {
            form: { getFieldDecorator },
            placeholder,
            disabled,
        } = this.props;
        if (Array.isArray(data) && data.length) {
            return data.map(item => {
                const { id, medicinesName, contentList } = item;
                return (
                    <div key = {id}>
                        <div className = {styles.header}>{medicinesName}</div>
                        <Form.Item>
                            {getFieldDecorator(`${id}`, {
                                initialValue: contentList,
                                rules: [{ validator: this.handleValid }],
                            })(<Input disabled = {disabled} placeholder = {placeholder} onPressEnter = {this.save} onBlur = {this.save} />)}
                        </Form.Item>
                    </div>
                );
            });
        }

        return "";
    };

    render() {
        return <div className = {styles.articles}>{this.renderList()}</div>;
    }
}

Articles.defaultProps = defaultProps;

export default Form.create()(Articles);
