import React, { Component } from "react";
import classnames from "classnames";
import { Form } from "antd";

import styles from "./index.less";

const defaultProps = {
    required: true,
};

class ComplexItem extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const that = this;
        const { children, ...otherProps } = that.props;
        const itemClass = classnames({
            [styles["complex-item"]]: true,
        });

        return (
            <Form.Item {...otherProps} className = {itemClass}>
                {children}
            </Form.Item>
        );
    }
}

ComplexItem.defaultProps = defaultProps;

export default ComplexItem;
