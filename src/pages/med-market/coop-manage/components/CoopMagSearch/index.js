/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import moment from "moment";
import { Form, Select, Input, Row, DatePicker, message } from "antd";

import SearchArea from "@/components/SearchArea";
import { multiColRow } from "@/utils/utils";
import { MultiItem } from "@/components/complex-form";
import FuzzySearch from "@/components/FuzzySearch";

import styles from "./index.less";

const { Option } = Select;
const resParam = {
    value: "id",
    text: "companyName",
};
const searchFields = {
    searchField: "companyName",
};

const format = "YYYY-MM-DD HH:mm:ss";
let dispatch;

const formatTime = time => (time && moment(time)) || time;
const validateTime = allValues => {
    const { startTime, endTime } = allValues;
    if (startTime && endTime && formatTime(startTime) - formatTime(endTime) > 0) {
        message.error("开始时间不能早于结束时间", 2);
        return false;
    }
    return true;
};

const onValuesChange = (props, changedValues, allValues) => {
    validateTime(allValues);
};

class CoopMagSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        dispatch = props.dispatch;
    }

    onSearch = () => {
        const {
            form: { validateFields },
        } = this.props;
        validateFields((err, values) => {
            if (!validateTime(values)) {
                return;
            }

            const { startTime, endTime, companyName: { venderId } = {} } = values;
            // const companyName = company.key ? company.key : '';
            const queryVal = Object.assign({}, values, {
                startTime: startTime ? moment(startTime).format(format) : undefined,
                endTime: endTime ? moment(endTime).format(format) : undefined,
                // validFlag: 1,
                currentPage: 1,
                venderId,
            });
            delete queryVal.companyName;
            dispatch({
                type: "market/queryData",
                payload: { ...queryVal },
            });
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
            <div className = {styles["coop-mag-search"]}>
                <SearchArea onSearch = {that.onSearch} onReset = {that.onReset} formLayout = {multiColRow} searchText = "查询" clearText = "重置">
                    <Row>
                        <MultiItem label = "任务名称">{getFieldDecorator("taskNameLike")(<Input placeholder = "请选择任务名称" />)}</MultiItem>
                        <MultiItem label = "公司名称">
                            {getFieldDecorator("companyName", {
                                initialValue: { key: "", label: "" },
                                rules: [
                                    {
                                        required: false,
                                    },
                                ],
                            })(
                                // <FuzzySearch url = "https://randomuser.me/api/?results=5" />
                                <FuzzySearch url = "/api/be/vender/factory/list" resParam = {resParam} searchFields = {searchFields} />
                            )}
                        </MultiItem>
                        <MultiItem label = "任务开始时间">{getFieldDecorator("startTime")(<DatePicker className = {styles.datepicker} format = {format} />)}</MultiItem>
                        <MultiItem label = "任务结束时间">{getFieldDecorator("endTime")(<DatePicker className = {styles.datepicker} format = {format} />)}</MultiItem>
                        <MultiItem label = "审核状态">
                            {getFieldDecorator("status", {
                                initialValue: "",
                                rules: [
                                    {
                                        required: false,
                                    },
                                ],
                            })(
                                <Select placeholder = "请选择运行状态">
                                    <Option value = "">全部</Option>
                                    <Option value = {1}>审核中</Option>
                                    <Option value = {2}>审核通过</Option>
                                    <Option value = {3}>审核驳回</Option>
                                </Select>
                            )}
                        </MultiItem>
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create({ onValuesChange })(CoopMagSearch);
