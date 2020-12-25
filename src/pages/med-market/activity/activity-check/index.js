import React, { Component } from "react";
import router from "umi/router";
import { connect } from "dva";
import { Col, Row, Button, Input, Alert } from "antd";
import { resCallback } from "@/utils/utils";

const textTooltip = ["", "可以审核", "报名超时, 请驳回重新编辑", "开始时间超时, 请驳回重新编辑", "商业未全部授权, 请授权"];
@connect(({ activityCheck, loading }) => ({
    ...activityCheck,
    loading: loading.effects["activityCheck/submitOpinion"],
}))
class Check extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opinion: "",
            submitType: "agree",
        };
    }

    onChange = ({ target: { value } }) => {
        this.setState({
            opinion: value,
        });
    };

    callback = () => {
        const { location } = this.props;
        let path = "";
        if (location.query.checkType === "op") {
            path = "../check-list-op";
        } else {
            path = "../check-list-gy";
        }
        router.push(path);
    };

    pass = () => {
        const { opinion } = this.state;
        const { dispatch, location } = this.props;
        // checkType 药企：gy 运营：op
        dispatch({
            type: "activityCheck/submitOpinion",
            payload: {
                type: location.query.checkType === "op" ? "CHECK_OP" : "CHECK_GY",
                id: location.query.id,
                opinion,
                status: location.query.checkType === "op" ? 3 : 5,
            },
            callback: response => {
                resCallback(response, this.callback, "审核通过成功");
            },
        });
        this.setState({ submitType: "agree" });
    };

    reject = () => {
        const { opinion } = this.state;

        if (opinion === "") {
            this.textInput.focus();
            return;
        }

        const {
            dispatch,
            location: {
                query: { checkType, id },
            },
        } = this.props;

        dispatch({
            type: "activityCheck/submitOpinion",
            payload: {
                type: checkType === "op" ? "CHECK_OP" : "CHECK_GY",
                id,
                opinion,
                status: checkType === "op" ? 4 : 6,
            },
            callback: response => {
                resCallback(response, this.callback, "审核驳回成功");
            },
        });
        this.setState({ submitType: "reject" });
    };

    render() {
        const { loading, location } = this.props;
        const { submitType } = this.state;

        return (
            <div style = {{ padding: 24 }}>
                <Row>
                    <Col span = {4}>
                        <Button type = "primary" disabled = {Number(location.query.verified) !== 1} loading = {submitType === "agree" && loading} onClick = {this.pass}>
                            审核通过
                        </Button>
                        <Button style = {{ marginLeft: 8 }} loading = {submitType === "reject" && loading} onClick = {this.reject}>
                            审核驳回
                        </Button>
                    </Col>
                    <Col span = {6}>
                        <Input
                            placeholder = "请填写审核意见，驳回时必填。"
                            ref = {input => {
                                this.textInput = input;
                            }}
                            allowClear
                            onChange = {this.onChange}
                        />
                        {}
                    </Col>
                </Row>
                {Number(location.query.verified) === 1 ? null : (
                    <div style = {{ marginTop: 10 }}>
                        <Alert message = {textTooltip[location.query.verified]} type = "warning" showIcon />
                    </div>
                )}
            </div>
        );
    }
}

export default Check;
