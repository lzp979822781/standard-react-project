// standardForm.js
import React, { Component } from "react";
import { Row, Col, Select } from "antd";

const { Option } = Select;

class UploadRules extends Component {
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {
                data: nextProps.value || {},
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        const value = props.value || {};
        this.state = {
            data: value,
        };
    }

    changeRewardCycle = value => {
        const { data } = this.state;
        data.rewardCycle = value;
        this.setState(
            {
                data,
            },
            () => {
                this.triggerChange();
            }
        );
    };

    changeRewardTime = value => {
        const { data } = this.state;
        data.rewardTime = value;
        this.setState(
            {
                data,
            },
            () => {
                this.triggerChange();
            }
        );
    };

    triggerChange = () => {
        const { onChange } = this.props;
        const { data } = this.state;
        if (onChange) {
            onChange(data);
        }
    };

    render() {
        const { data } = this.state;
        const { disabled } = this.props;
        return (
            <Row gutter = {16}>
                <Col span = {8}>
                    <Select value = {data.rewardCycle} onChange = {this.changeRewardCycle} placeholder = "请选择" disabled = {disabled}>
                        <Option value = {1}>以单笔成交</Option>
                        <Option value = {2}>活动时间内成交</Option>
                    </Select>
                </Col>
                <Col span = {8}>
                    <Select value = {data.rewardTime} onChange = {this.changeRewardTime} placeholder = "请选择" disabled = {disabled}>
                        <Option value = {1}>只返一次</Option>
                        <Option value = {2}>累计返利</Option>
                    </Select>
                </Col>
            </Row>
        );
    }
}

export default UploadRules;
