/* eslint-disable no-return-assign */
import React, { Component } from "react";

import { Form, InputNumber } from "antd";

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value = {form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
const widthFull = { width: "100%" };

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

    renderCell = form => {
        this.form = form;
        const { children, dataIndex, record, title, disabled, _min = 0.1 } = this.props;
        const { editing } = this.state;
        return editing ? (
            <Form.Item style = {{ margin: 0 }}>
                {form.getFieldDecorator(dataIndex, {
                    rules: [
                        {
                            required: false,
                            message: `${title} is required.`,
                        },
                    ],
                    initialValue: record[dataIndex],
                })(<InputNumber ref = {node => (this.input = node)} onPressEnter = {this.save} onBlur = {this.save} disabled = {disabled} min = {_min} style = {widthFull} />)}
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
