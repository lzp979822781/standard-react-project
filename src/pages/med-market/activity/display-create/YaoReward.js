// standardForm.js
import React, { PureComponent } from "react";
import { Row, Col } from "antd";
import YaoInputNumber from "./YaoInputNumber";

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

    onChange = (val, key) => {
        const { data } = this.state;
        data[key] = val;
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
                <Col span = {12}>
                    <YaoInputNumber
                        value = {data.participantReward}
                        precision = {2}
                        min = {0}
                        onChange = {val => {
                            this.onChange(val, "participantReward");
                        }}
                        addonBefore = "参与者奖励"
                        addonAfter = "元"
                        disabled = {disabled}
                    />
                </Col>
                <Col span = {12}>
                    <YaoInputNumber
                        value = {data.clerkReward}
                        precision = {2}
                        min = {0}
                        onChange = {val => {
                            this.onChange(val, "clerkReward");
                        }}
                        addonBefore = "门店奖励"
                        addonAfter = "元"
                        disabled = {disabled}
                    />
                </Col>
                <Col span = {12}>
                    <YaoInputNumber
                        value = {data.storeReward}
                        precision = {2}
                        min = {0}
                        onChange = {val => {
                            this.onChange(val, "storeReward");
                        }}
                        addonBefore = "分公司奖励"
                        addonAfter = "元"
                        disabled = {disabled}
                    />
                </Col>
                <Col span = {12}>
                    <YaoInputNumber
                        value = {data.headquartersReward}
                        precision = {2}
                        min = {0}
                        onChange = {val => {
                            this.onChange(val, "headquartersReward");
                        }}
                        addonBefore = "总部奖励"
                        addonAfter = "元"
                        disabled = {disabled}
                    />
                </Col>
            </Row>
        );
    }
}

export default UploadRules;
