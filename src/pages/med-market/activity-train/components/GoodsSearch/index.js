/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { Form, Input, Row } from "antd";

import SearchArea from "@/components/SearchArea";
import { multiColRow } from "@/utils/utils";
import { MultiItem } from "@/components/complex-form";

import styles from "./index.less";

class GoodsSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onSearch = () => {
        const {
            form: { validateFields },
            onSearch,
        } = this.props;
        setTimeout(() => {
            validateFields((err, values) => {
                if (onSearch) onSearch(values);
            });
        }, 0);
    };

    onReset = () => {
        this.props.form.resetFields();
        this.onSearch();
    };

    render() {
        const that = this;
        const {
            form: { getFieldDecorator },
        } = that.props;
        return (
            <div className = {styles["goods-search"]}>
                <SearchArea onSearch = {that.onSearch} onReset = {that.onReset} formLayout = {multiColRow}>
                    <Row>
                        <MultiItem label = "批准文号">{getFieldDecorator("approvNum")(<Input placeholder = "请输入批准文号" />)}</MultiItem>
                        <MultiItem label = "商品名称">{getFieldDecorator("medicinesName")(<Input placeholder = "请输入商品名称" />)}</MultiItem>
                        <MultiItem label = "ERP编码">{getFieldDecorator("erpCode")(<Input placeholder = "请输入ERP编码" />)}</MultiItem>
                        {/* <MultiItem label = "商家名称">{getFieldDecorator("shopyName")(<Input placeholder = "请输入商家" />)}</MultiItem> */}
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create()(GoodsSearch);
