import React, { Component } from "react";
import PropTypes from "prop-types";
// import classnames from 'classnames';
import { Table, Empty } from "antd";
import loadingImg from "@/assets/loading-jd.gif";

import styles from "./index.less";

const defaultProps = {
    pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共${total}条`,
        pageSize: 10,
        position: "bottom",
    },
    promptInfo: {
        text: "暂无数据",
        imgUrl: "http://static.360buyimg.com/yao_static/lib/man/img/yzd/resultnon.png",
    },
    loading: false,
};

const propTypes = {
    dataSource: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    promptInfo: PropTypes.object,
    loading: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

const innerLoading = {
    indicator: (
        <div className = {styles["img-wrapper"]}>
            <img src = {loadingImg || "https://static.360buyimg.com/yao_static/lib/man/img/loading-jd.gif"} alt = "加载中" />
        </div>
    ),
    // tip: "Loading..."
};

class ComplexTable extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderEmpty = () => {
        const that = this;
        const {
            promptInfo: { text, imgUrl },
        } = that.props;
        return (
            <Empty
                className = {styles.empty}
                image = {imgUrl}
                imageStyle = {{
                    height: 60,
                }}
                description = {text}
            />
        );
    };

    genLoding = () => {
        const that = this;
        const { loading } = that.props;
        const type = typeof loading;
        return Object.assign({}, innerLoading, type === "boolean" ? { spinning: loading } : loading);
    };

    render() {
        const that = this;
        const { dataSource, columns, loading, ...otherProps } = that.props;
        return (
            <div className = {styles.complexTable}>
                <Table
                    {...otherProps}
                    dataSource = {dataSource}
                    columns = {columns}
                    /* locale = {{
                        emptyText: that.renderEmpty(),
                    }} */
                    loading = {this.genLoding()}
                />
            </div>
        );
    }
}

ComplexTable.defaultProps = defaultProps;
ComplexTable.propTypes = propTypes;

export default ComplexTable;
