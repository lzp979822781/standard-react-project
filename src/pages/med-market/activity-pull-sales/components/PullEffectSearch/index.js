/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { Form, Select, Row, Input } from "antd";

import SearchArea from "@/components/SearchArea";
import { multiColRow } from "@/utils/utils";
import { MultiItem } from "@/components/complex-form";

import styles from "./index.less";

const { Option } = Select;
let dispatch;

class PullEffectSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        ({ dispatch } = props);
    }

    onSearch = () => {
        const {
            form: { validateFields },
        } = this.props;
        validateFields((err, values) => {
            dispatch({
                type: "pullSale/getEffectDetail",
                payload: values,
            });

            const { getFullData } = this.props;
            if (getFullData) {
                getFullData();
            }
        });
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
            <div className = {styles["pull-effect-search"]}>
                <SearchArea onSearch = {that.onSearch} onReset = {that.onReset} formLayout = {multiColRow} searchText = "查询" clearText = "重置">
                    <Row>
                        <MultiItem label = "买家信息">
                            {getFieldDecorator("pin", {
                                rules: [
                                    {
                                        required: false,
                                    },
                                ],
                            })(<Input placeholder = "买家pin" />)}
                        </MultiItem>
                        <MultiItem label = "审核状态">
                            {getFieldDecorator("status", {
                                initialValue: 1,
                            })(
                                <Select placeholder = "请选择">
                                    <Option value = "">全部</Option>
                                    <Option value = {1}>待审核</Option>
                                    <Option value = {2}>通过</Option>
                                    <Option value = {3}>驳回</Option>
                                    <Option value = {5}>申诉驳回</Option>
                                </Select>
                            )}
                        </MultiItem>
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create()(PullEffectSearch);
