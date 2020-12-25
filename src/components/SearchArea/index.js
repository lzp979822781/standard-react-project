import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Form, Row, Col, Button, Icon } from "antd";

import styles from "./index.less";

const propTypes = {
    onSearch: PropTypes.func,
    onReset: PropTypes.func,
    searchText: PropTypes.string,
    clearText: PropTypes.string,
    expand: PropTypes.bool,
};

const defaultProps = {
    searchText: "搜索",
    clearText: "重置",
    onSearch: () => {},
    onReset: () => {},
    expand: true,
};

const formItemLayout = {
    labelAlign: "right",
    labelCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
        lg: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
        lg: { span: 12 },
    },
};

class SearchArea extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expand: props.expand || true,
        };
    }

    handleSearch = () => {
        // 搜索方法
        // eslint-disable-next-line react/destructuring-assignment
        this.props.onSearch();
    };

    handleReset = () => {
        // 重置方法
        // eslint-disable-next-line react/destructuring-assignment
        this.props.onReset();
    };

    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
    };

    render() {
        const { children, searchText, clearText, formLayout } = this.props;
        const { expand } = this.state;
        const searchClass = classnames({
            [styles.show]: expand,
            [styles.hide]: !expand,
        });

        const btnClass = classnames({
            [styles["inline-show"]]: expand,
            [styles.hide]: !expand,
        });

        const layout = formLayout || formItemLayout;

        return (
            <div className = {styles["search-area"]}>
                <Form className = {styles["search-form"]} {...layout}>
                    <div className = {searchClass}>{children}</div>
                    <Row gutter = {24}>
                        <Col span = {24} style = {{ textAlign: "right" }}>
                            <span className = {btnClass}>
                                <Button type = "primary" onClick = {this.handleSearch}>
                                    {searchText}
                                </Button>
                                <Button className = {styles.ml8} onClick = {this.handleReset}>
                                    {clearText}
                                </Button>
                            </span>

                            <a className = {`${styles.ml8} ${styles["font-normal"]}`} onClick = {this.toggle}>
                                {expand ? "收起" : "下拉"} <Icon type = {expand ? "up" : "down"} />
                            </a>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}

SearchArea.propTypes = propTypes;
SearchArea.defaultProps = defaultProps;

export default Form.create()(SearchArea);
