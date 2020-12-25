/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";

import { Form } from "antd";

import styles from "./index.less";

class ComplexForm extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { children, ...otherProps } = this.props;

        return (
            <div className = {styles["complex-form"]}>
                <Form {...otherProps} onSubmit = {this.handleSubmit}>
                    {children}
                </Form>
            </div>
        );
    }
}

export default ComplexForm;
