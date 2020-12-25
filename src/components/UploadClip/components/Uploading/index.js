import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Icon, Progress, Tooltip } from "antd";
// import cloneDeep from "lodash/cloneDeep";

// eslint-disable-next-line no-unused-vars
import styles from "./index.less";

const defaultProps = {};

const propTypes = {
    file: PropTypes.isRequired,
};

/* const listItem = classnames({
    "ant-upload-list-item": true,
    // [`ant-upload-list-item-${uploadState}`]: true,
    [styles["list-item"]]: true,
}); */

class Uploading extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            file: { status, progress = 0, name },
        } = this.props;
        const item = classnames({
            "ant-upload-list-item": true,
            // [`ant-upload-list-item-${uploadState}`]: true,
            [styles["list-item"]]: true,
            [styles["upload-item"]]: true,
            [styles["upload-error"]]: status === "error",
        });
        const uplodingStyle = classnames({
            [styles["uploading-text"]]: true,
            [styles["uploading-text-error"]]: status === "error",
        });

        return (
            <div className = {`${item}`}>
                <div
                    className = {`ant-upload-list-item-info ${
                        styles["item-info"]
                    } ${styles["upload-item-info"]} `}
                >
                    <span>
                        <div className = {`${uplodingStyle}`}>
                            {status !== "error" ? "文件上传中" : "上传错误"}
                            <Tooltip placement = "topLeft" title = {name}>
                                <p className = {styles["ellipse-show"]}>{name}</p>
                            </Tooltip>
                        </div>
                    </span>
                </div>
                <Icon
                    type = "close"
                    className = {styles["item-close"]}
                    onClick = {this.onStopUpload}
                />
                <Progress
                    percent = {progress}
                    size = "small"
                    className = {`${styles["upload-progress"]}`}
                />
            </div>
        );
    }
}

Uploading.defaultProps = defaultProps;
Uploading.propTypes = propTypes;

export default Uploading;
