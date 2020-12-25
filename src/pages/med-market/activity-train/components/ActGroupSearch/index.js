/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { Form, Select, Input, Row } from "antd";

import SearchArea from "@/components/SearchArea";
import { multiColRow } from "@/utils/utils";
import { MultiItem, City } from "@/components/complex-form";

import styles from "./index.less";

const { Option } = Select;

class ActGroupSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buyerTypes: [],
        };
    }

    componentDidMount() {
        this.callModel("queryBuyerType", {}, this.buyerTypeCall);
    }

    buyerTypeCall = ({ data }) => {
        if (data) {
            this.setState({ buyerTypes: data });
        }
    };

    renderTypes = () => {
        const { buyerTypes } = this.state;
        if (Array.isArray(buyerTypes)) {
            return buyerTypes.map(({ name, categoryId } = {}) => <Option value = {categoryId}>{name}</Option>);
        }
        return "";
    };

    onSearch = () => {
        const {
            form: { validateFields },
            onSearch,
        } = this.props;
        validateFields((err, values) => {
            const { city: [provinceId, cityId, countyId] = [], ...otherValue } = values;
            const queryVal = Object.assign({}, otherValue, {
                provinceId,
                cityId,
                countyId,
            });
            if (onSearch) onSearch(queryVal);
        });
    };

    onReset = () => {
        this.props.form.resetFields();
        this.onSearch();
    };

    callModel = (type, data, callback) => {
        const { dispatch } = this.props;
        if (dispatch) {
            dispatch({
                type: `train/${type}`,
                payload: data,
                callback,
            });
        }
    };

    render() {
        const that = this;
        const {
            form: { getFieldDecorator },
        } = that.props;
        return (
            <div className = {styles["act-group-search"]}>
                <SearchArea onSearch = {that.onSearch} onReset = {that.onReset} formLayout = {multiColRow}>
                    <Row>
                        <MultiItem label = "活动组名称">{getFieldDecorator("groupName")(<Input size = "small" placeholder = "请输入活动组名称" />)}</MultiItem>
                        <MultiItem label = "区域">{getFieldDecorator("city")(<City size = "small" url = "/api/be/area/loadArea" />)}</MultiItem>
                        <MultiItem label = "门店">{getFieldDecorator("shopyName")(<Input size = "small" placeholder = "请输入门店" />)}</MultiItem>
                        <MultiItem label = "门店类型">
                            {getFieldDecorator("shopType")(
                                <Select size = "small" placeholder = "请选择门店类型">
                                    {this.renderTypes()}
                                </Select>
                            )}
                        </MultiItem>
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create()(ActGroupSearch);
