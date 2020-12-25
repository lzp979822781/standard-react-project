// standardForm.js
import React, { PureComponent } from "react";
import { Row, Col, Select } from "antd";

import YaoInputNumber from "./YaoInputNumber";

const { Option } = Select;

class UploadRules extends PureComponent {
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

    changeUploadDays = val => {
        const { data } = this.state;
        data.uploadDays = val;
        this.setState(
            {
                data,
            },
            () => {
                this.triggerChange();
            }
        );
    };

    changeUploadTimes = val => {
        const { data } = this.state;
        data.uploadTimes = val;
        this.setState(
            {
                data,
            },
            () => {
                this.triggerChange();
            }
        );
    };

    changeUploadNum = val => {
        const { data } = this.state;
        data.uploadNum = val;
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
        const { calcDays, disabled, maxDays } = this.props;
        const newCalcDays = calcDays.filter(item => item <= maxDays);
        return (
            <Row gutter = {16}>
                <Col span = {8}>
                    <Select value = {data.uploadDays} placeholder = "请选择" onChange = {this.changeUploadDays} disabled = {disabled}>
                        {newCalcDays.map(item => (
                            <Option key = {item} value = {item}>
                                {`${item}天`}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col span = {8}>
                    <YaoInputNumber value = {data.uploadTimes} min = {0} max = {data.uploadDays * 3} precision = {0} onChange = {this.changeUploadTimes} addonBefore = "上传" addonAfter = "次" disabled = {disabled} />
                </Col>
                <Col span = {8}>
                    <Select value = {data.uploadNum} onChange = {this.changeUploadNum} placeholder = "请选择" disabled = {disabled}>
                        {[1, 2, 3, 4, 5, 6].map((item, index) => (
                            <Option key = {item} value = {index + 1}>
                                {`${index + 1}张`}
                            </Option>
                        ))}
                    </Select>
                </Col>
            </Row>
        );
    }
}

export default UploadRules;
