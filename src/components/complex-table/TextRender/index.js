import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { Tooltip } from "antd";

import styles from "./index.less";

const defaultProps = {
    multiEllipse: 0,
};

const propTypes = {
    multiEllipse: PropTypes.number,
};

class TextRender extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { text, multiEllipse, width, hoverText } = this.props;
        const renderClasses = classnames({
            // [styles['render-text']]: true,
            [styles[`ellipse-${multiEllipse}`]]: multiEllipse,
        });

        return (
            <Tooltip placement = "top" title = {hoverText || text} className = {styles["render-text"]}>
                <div
                    style = {{
                        width,
                    }}
                    className = {renderClasses}
                >
                    {text}
                </div>
            </Tooltip>
        );
    }
}

TextRender.defaultProps = defaultProps;
TextRender.propTypes = propTypes;

export default TextRender;
