import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { Icon, Tooltip } from "antd";

import styles from "./index.less";

const defaultProps = {
    multiEllipse: 0,
};

const propTypes = {
    multiEllipse: PropTypes.number,
};

class CombTextRender extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderIcon = () => (
        <span className = {styles.icon}>
            <Icon type = "question-circle" />
        </span>
    );

    render() {
        const { text, multiEllipse, width, hoverText } = this.props;
        const renderClasses = classnames({
            // [styles['render-text']]: true,
            [styles[`ellipse-${multiEllipse}`]]: multiEllipse,
        });

        return (
            <span
                style = {{
                    width,
                }}
                className = {renderClasses}
            >
                <Tooltip placement = "top" title = {hoverText || text} className = {styles["render-text"]}>
                    {text}
                    <Icon type = "question-circle" className = {styles.icon} />
                </Tooltip>
            </span>
        );
    }
}

CombTextRender.defaultProps = defaultProps;
CombTextRender.propTypes = propTypes;

export default CombTextRender;
