import React, { Component } from "react";
import { connect } from "dva";
import { Divider, Col, Row, Button, Input, Table, message } from "antd";
import moment from "moment";
import { TextRender } from "@/components/complex-table";
import { formatNum, resCallback } from "@/utils/utils";
import DescriptionItem from "./DescriptionItem";

const pStyle = {
    fontSize: 16,
    color: "rgba(0,0,0,0.85)",
    lineHeight: "24px",
    display: "block",
    marginBottom: 16,
};

const statusArray = ["", "审核中", "审核通过", "审核驳回", "审核通过", "审核驳回"];

@connect(({ coopApproval, loading }) => ({
    ...coopApproval,
    loading: loading.effects["coopApproval/submitOpinion"],
}))
class CoopAppOper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opinion: "",
            submitType: "agree",
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        const { dispatch, location } = this.props;
        dispatch({
            type: "coopApproval/getDetail",
            payload: { id: location.query.id },
        });
    };

    onChange = ({ target: { value } }) => {
        this.setState({
            opinion: value,
        });
    };

    pass = () => {
        const { opinion } = this.state;

        if (opinion.length > 200) {
            message.warning("文字过长，最多支持200字符");
            this.textInput.focus();
            return;
        }

        const { dispatch, location } = this.props;
        dispatch({
            type: "coopApproval/submitOpinion",
            payload: {
                type: "SUBMIT_PASS",
                taskId: location.query.id,
                opinion,
            },
            callback: response => {
                resCallback(
                    response,
                    () => {
                        this.loadData();
                        this.setState({ submitType: "agree" });
                    },
                    "审核通过成功"
                );
            },
        });
    };

    reject = () => {
        const { opinion } = this.state;
        if (opinion === "") {
            this.textInput.focus();
            return;
        }

        if (opinion.length > 200) {
            message.warning("文字过长，最多支持200字符");
            this.textInput.focus();
            return;
        }

        const { dispatch, location } = this.props;
        dispatch({
            type: "coopApproval/submitOpinion",
            payload: {
                type: "SUBMIT_REJECT",
                taskId: location.query.id,
                opinion,
            },
            callback: response => {
                resCallback(
                    response,
                    () => {
                        this.loadData();
                        this.setState({ submitType: "agree" });
                    },
                    "审核驳回成功"
                );
            },
        });
        this.setState({ submitType: "reject" });
    };

    render() {
        const { submitType } = this.state;
        const { detail, loading, location } = this.props;

        const columns = [
            {
                title: "审核人",
                dataIndex: "modifier",
                width: 150,
            },
            {
                title: "审核时间",
                dataIndex: "modified",
                render: text => moment(text).format("YYYY-MM-DD HH:mm:ss"),
                width: 150,
            },
            {
                title: "审核状态",
                dataIndex: "verifyStatus",
                render: text => statusArray[text],
                width: 150,
            },
            {
                title: "审核意见",
                dataIndex: "opinion",
                render: text => <TextRender multiEllipse = {2} text = {text} />,
                width: 300,
            },
        ];
        return (
            <div style = {{ padding: 24 }}>
                <div>
                    <p style = {{ ...pStyle, marginBottom: 24 }}>合作任务审核</p>
                    <Divider />
                    <Row>
                        <Col span = {12}>
                            <DescriptionItem title = "公司名称" content = {detail.companyName || "--"} />{" "}
                        </Col>
                        <Col span = {12}>
                            <DescriptionItem title = "任务名称" content = {detail.taskName || "--"} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span = {12}>
                            <DescriptionItem title = "费用收入" content = {formatNum(detail.income) || "--"} />
                        </Col>
                        <Col span = {12}>
                            <DescriptionItem
                                title = "活动预支出"
                                content = {detail.verifyPreSpend ? `${formatNum(detail.verifyPreSpend)} | (原预支出${formatNum(detail.preSpend)})` : formatNum(detail.preSpend)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span = {12}>
                            <DescriptionItem title = "回款时间" content = {moment(detail.returnTime).format("YYYY-MM-DD HH:mm:ss") || "--"} />
                        </Col>
                        <Col span = {12}>
                            <DescriptionItem
                                title = "任务时间"
                                content = {detail.startTime ? `${moment(detail.startTime).format("YYYY-MM-DD HH:mm:ss")} ~ ${moment(detail.endTime).format("YYYY-MM-DD HH:mm:ss")}` : "--"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span = {24}>
                            <DescriptionItem title = "备注" content = {detail.remark || "--"} />
                        </Col>
                        <Col span = {24}>
                            <DescriptionItem
                                title = "附件"
                                content = {
                                    detail.annex ? (
                                        <a href = {detail.annex} target = "_blank" rel = "noopener noreferrer">
                                            {detail.annexName || "--"}
                                        </a>
                                    ) : (
                                        <span>{detail.annexName || "--"}</span>
                                        // eslint-disable-next-line react/jsx-indent
                                    )
                                }
                            />
                        </Col>
                        <Col span = {12}>
                            <DescriptionItem title = "提交人" content = {detail.creator ? `${detail.creator} ${moment(detail.created).format("YYYY-MM-DD HH:mm:ss")}` : "--"} />
                        </Col>
                        <Col span = {24}>
                            <DescriptionItem title = "审核人" content = {detail.creator ? `${detail.creator}` : "--"} />
                        </Col>
                        <Col span = {24}>
                            <DescriptionItem title = "审核状态" content = {detail.status ? `${statusArray[detail.verifyStatus]}` : "--"} />
                        </Col>
                    </Row>
                    <Row>
                        {[1, 4].includes(detail.verifyStatus) && location.query.pageType === "check" ? (
                            <React.Fragment>
                                <Col span = {4}>
                                    <Button type = "primary" loading = {submitType === "agree" && loading} onClick = {this.pass}>
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
                                </Col>
                            </React.Fragment>
                        ) : (
                            <Col span = {12}>
                                <DescriptionItem title = "审核意见" content = {<Table columns = {columns} dataSource = {detail.verifyList || []} rowKey = "id" pagination = {false} />} />
                            </Col>
                        )}
                    </Row>
                </div>
            </div>
        );
    }
}

export default CoopAppOper;
