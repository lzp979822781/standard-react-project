/* eslint-disable no-return-assign */
import React, { Component } from "react";

import { Form } from "antd";

import Card from "./Card";
import { isObjNull } from "@/utils/utils";

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value = {form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

const titleRule = /^([\s\S]){5,15}$/;
const contentRule = /^([\s\S]){10,30}$/;

class EditableCell extends Component {
    state = {
        editing: true,
    };

    save = e => {
        e.persist();
        const { record, handleSave } = this.props;
        this.form.validateFields((error, values) => {
            /*  if (error && error[e.currentTarget.id]) {
                return;
            } */
            /* if (error) {
                return;
            } */
            handleSave({ ...record, ...values });
        });
    };

    onInput = () => {
        console.log("onInput");
    };

    handleValidator = (rule, val, callback) => {
        console.log("val", val);
        if (isObjNull(val)) {
            callback("请输入必输项");
        }

        const { title, content } = val;
        if (!titleRule.test(title)) callback("请输入5到15个字符的标题文本");
        if (!contentRule.test(content)) callback("请输入10到30个字符的内容文本");
        callback();
    };

    renderCell = form => {
        this.form = form;
        // eslint-disable-next-line no-unused-vars
        const { children, dataIndex, record, title, disabled } = this.props;
        const { editing } = this.state;
        return editing ? (
            <Form.Item style = {{ margin: 0 }}>
                {form.getFieldDecorator(dataIndex, {
                    rules: [
                        {
                            required: true,
                            message: `${title}是必输项.`,
                        },
                        {
                            validator: this.handleValidator,
                        },
                    ],
                    initialValue: record[dataIndex],
                })(
                    // <Input ref = {node => (this.input = node)} onPressEnter = {this.save} onBlur = {this.save} />
                    <Card onBlur = {this.save} disabled = {disabled} />
                )}
            </Form.Item>
        ) : (
            <div className = "editable-cell-value-wrap" style = {{ paddingRight: 24 }} onClick = {this.toggleEdit}>
                {children}
            </div>
        );
    };

    render() {
        const { editable, dataIndex, title, record, index, handleSave, children, ...restProps } = this.props;
        return <td {...restProps}>{editable ? <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer> : children}</td>;
    }
}

export { EditableFormRow, EditableCell };
