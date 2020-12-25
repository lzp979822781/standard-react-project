import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Col } from "antd";

import styles from "./index.less";

const defaultProps = {
    title: "",
    required: true,
    colon: true,
};

const propTypes = {
    title: PropTypes.bool,
    colon: PropTypes.bool,
    required: PropTypes.bool,
};

class ComplexItem extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    genText = () => {
        const { colon, title, children } = this.props;
        let text = `${(children || title).trim()}:`;
        if (!colon && typeof text === "string" && text) {
            text = text.replace(/[：:]\s*$/, "");
        }
        return text;
    };

    render() {
        const that = this;
        const { required, labelCol } = that.props;
        const itemClass = classnames({
            "ant-form-item-required": required,
            [styles["complex-item"]]: true,
        });

        return (
            <Col {...labelCol}>
                <span className = {itemClass}>{this.genText()}</span>
            </Col>
        );
    }
}

ComplexItem.defaultProps = defaultProps;
ComplexItem.propTypes = propTypes;

export default ComplexItem;
