/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import moment from "moment";
import { Form, Select, Input, Row, message } from "antd";

import SearchArea from "@/components/SearchArea";
import { multiColRow } from "@/utils/utils";
import { MultiItem, City } from "@/components/complex-form";

import styles from "./index.less";

const { Option } = Select;

let dispatch;

const formatTime = time => (time && moment(time)) || time;
const validateTime = allValues => {
    const { startTime, endTime } = allValues;
    if (
        startTime &&
        endTime &&
        formatTime(startTime) - formatTime(endTime) > 0
    ) {
        message.error("开始时间不能早于结束时间", 2);
        return false;
    }
    return true;
};

const onValuesChange = (props, changedValues, allValues) => {
    validateTime(allValues);
};

class ActGroupSearch extends Component {
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
            const {
                city: [provinceId, cityId, countyId] = [],
                ...otherValue
            } = values;
            const queryVal = Object.assign({}, otherValue, {
                provinceId,
                cityId,
                countyId,
            });
            dispatch({
                type: "actGroupMag/queryData",
                payload: queryVal,
            });
        });
    };

    onReset = () => {
        this.props.form.resetFields();
    };

    /**
     *
     * @param {String} type 标识省市区类型
     * @memberof ActGroupSearch
     */
    onChange = type => value => {
        console.log("type value", type, value);
    };

    render() {
        const that = this;
        const {
            form: { getFieldDecorator },
        } = that.props;
        return (
            <div className = {styles["act-group-search"]}>
                <SearchArea
                    onSearch = {that.onSearch}
                    onReset = {that.onReset}
                    formLayout = {multiColRow}
                >
                    <Row>
                        <MultiItem label = "活动组名称">
                            {getFieldDecorator("groupName")(
                                <Input placeholder = "请输入活动组名称" />
                            )}
                        </MultiItem>
                        <MultiItem label = "区域">
                            {getFieldDecorator("city")(
                                <City url = "/area/loadArea" />
                            )}
                        </MultiItem>
                        <MultiItem label = "门店">
                            {getFieldDecorator("shopyName")(
                                <Input placeholder = "请输入门店" />
                            )}
                        </MultiItem>
                        <MultiItem label = "门店类型">
                            {getFieldDecorator("shopType")(
                                <Select placeholder = "请选择门店类型">
                                    <Option value = {1}>待审</Option>
                                    <Option value = {2}>审核通过</Option>
                                    <Option value = {3}>驳回</Option>
                                </Select>
                            )}
                        </MultiItem>
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create({ onValuesChange })(ActGroupSearch);
