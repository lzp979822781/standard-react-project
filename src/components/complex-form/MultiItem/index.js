import React, { Component } from "react";
// import classnames from "classnames";
import { Col, Form } from "antd";

import { containerLayout } from "@/utils/utils";

const defaultProps = {
    colLayout: containerLayout,
};

class MultiItem extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const that = this;
        const { children, colLayout, ...otherProps } = that.props;
        return (
            <Col {...colLayout}>
                <Form.Item {...otherProps}>{children}</Form.Item>
            </Col>
        );
    }
}

MultiItem.defaultProps = defaultProps;

export default MultiItem;
