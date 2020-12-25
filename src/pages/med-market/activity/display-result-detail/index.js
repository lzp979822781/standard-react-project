import React, { Component } from "react";
import { connect } from "dva";
// import { routerRedux } from "dva/router";
import { Divider, Descriptions, Collapse, Card, Row, Col, Modal, Button, Input, Spin } from "antd";
import moment from "moment";
// import { actStatus } from "../list/actStatus";
import { resCallback, isGy } from "@/utils/utils";
import styles from "./index.less";

const { Panel } = Collapse;
const { Meta } = Card;

const manageTypes = ["未知", "零售-单体药店", "零售-连锁总部", "批发-商业公司", "个体医疗/诊所", "营利性医疗机构", "非营利性医疗机构", "零售-连锁分公司", "零售-连锁门店", "工业"];

@connect(({ dispalyResultDetail, loading }) => ({
    ...dispalyResultDetail,
    loading: loading.effects["dispalyResultDetail/getDetail"],
    checkLoading: loading.effects["dispalyResultDetail/submitOpinion"],
}))
class Result extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opinion: "",
            visible: false,
            submitType: "agree",
            selectRecord: {},
        };
    }

    componentDidMount() {
        this.getDetail();
    }

    // 获取编辑数据
    getDetail = () => {
        const {
            location: {
                query: { applyId },
            },
            dispatch,
        } = this.props;
        dispatch({
            type: "dispalyResultDetail/getDetail",
            payload: { applyId },
        });
    };

    renderPanel = detail => {
        const dataVOList = detail.dataVOList || [];
        return dataVOList.map((item, index) => (
            <Panel header = {<span style = {{ fontWeight: "bold" }}>{`第${item.sort}期`}</span>} key = {`${index + 1}`}>
                <Descriptions title = "审核信息">
                    <Descriptions.Item label = "审核状态">
                        {["", "审核通过", "待审核", "审核驳回"][item.status]}{" "}
                        {item.status === 2 && isGy ? (
                            <a
                                onClick = {() => {
                                    this.checkSingle(item);
                                }}
                                style = {{ marginLeft: 10 }}
                            >
                                立即审核
                            </a>
                        ) : null}{" "}
                    </Descriptions.Item>
                    <Descriptions.Item label = "次数">
                        {item.frequency}/{item.uploadTimes}
                    </Descriptions.Item>
                    <Descriptions.Item label = "时间">{`${moment(item.satrtDate).format("YYYY-MM-DD")}~${moment(item.endDate).format("YYYY-MM-DD")}`}</Descriptions.Item>
                </Descriptions>
                <div style = {{ marginBottom: 10 }}>
                    <Row gutter = {16}>
                        {item.imgList.map((imageItem, imageIndex) => (
                            <Col key = {`${imageIndex + 1}`} span = {4}>
                                <Card hoverable style = {{ width: 200 }} cover = {<img alt = "img" src = {imageItem} />}>
                                    <Meta
                                        description = {
                                            <span>
                                                上传时间：
                                                <br /> {moment(item.uploadDate).format("YYYY-MM-DD HH:mm")}{" "}
                                            </span>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
                <Descriptions title = "说明">
                    <Descriptions.Item label = "说明">{item.remark}</Descriptions.Item>
                </Descriptions>
                {item.status !== 2 ? (
                    <Descriptions title = {["", "通过信息", "待审核", "驳回信息"][item.status]}>
                        <Descriptions.Item label = "说明">{item.opinion || "--"}</Descriptions.Item>
                        <Descriptions.Item label = "审核人">{item.verifier || "--"}</Descriptions.Item>
                        <Descriptions.Item label = "审核时间">{item.verifyDate ? moment(item.verifyDate).format("YYYY-MM-DD HH:mm") : "--"}</Descriptions.Item>
                    </Descriptions>
                ) : null}
            </Panel>
        ));
    };

    onOpinionChange = ({ target: { value } }) => {
        this.setState({
            opinion: value,
        });
    };

    checkSingle = selectRecord => {
        this.setState({
            cycleId: selectRecord.cycleId,
            visible: true,
            selectRecord,
        });
    };

    handleCancel = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    judgeCheck = status => {
        const { opinion, cycleId } = this.state;
        const idList = [
            {
                cycleId,
                opinion,
                status,
            },
        ];
        return idList;
    };

    pass = () => {
        const { dispatch } = this.props;
        // return;
        dispatch({
            type: "dispalyResultDetail/submitOpinion",
            payload: this.judgeCheck(1),
            callback: response => {
                resCallback(response, this.submitOpinionCallback, "审核通过成功");
            },
        });
        this.setState({ submitType: "agree" });
    };

    reject = () => {
        const { opinion } = this.state;
        const { dispatch } = this.props;
        if (opinion === "") {
            this.textInput.focus();
            return;
        }

        dispatch({
            type: "dispalyResultDetail/submitOpinion",
            payload: this.judgeCheck(3),

            callback: response => {
                resCallback(response, this.submitOpinionCallback, "审核驳回成功");
            },
        });
        this.setState({ submitType: "reject" });
    };

    submitOpinionCallback = () => {
        this.setState(
            {
                visible: false,
            },
            () => {
                this.getDetail();
            }
        );
    };

    render() {
        const {
            location: {
                query: { record, paramDetail },
            },
            detail,
            checkLoading,
            loading,
        } = this.props;
        const { visible, submitType, selectRecord } = this.state;
        const newRecord = JSON.parse(record);
        const newParamDetail = JSON.parse(paramDetail);
        // debugger;
        return (
            <div className = {styles.tableList}>
                <Spin spinning = {loading} tip = "加载中...">
                    <Descriptions title = {newParamDetail.name}>
                        <Descriptions.Item label = "买家信息">{newRecord.name}</Descriptions.Item>
                        <Descriptions.Item label = "买家区域">{newRecord.area}</Descriptions.Item>
                        <Descriptions.Item label = "买家类型">{typeof detail.manageType === "number" ? manageTypes[detail.manageType] : "--"}</Descriptions.Item>
                        <Descriptions.Item label = "活动完成情况">{`${detail.completedCycleNum}/${detail.totaoCycleNum}`}</Descriptions.Item>
                        {isGy ? null : <Descriptions.Item label = "获得奖励">{detail.totalReward}</Descriptions.Item>}
                    </Descriptions>
                    <Divider />
                    <Collapse bordered defaultActiveKey = {["1"]} expandIconPosition = "right">
                        {this.renderPanel(detail, newRecord)}
                    </Collapse>
                </Spin>
                <Modal title = "审核" visible = {visible} footer = {null} onOk = {this.handleOk} onCancel = {this.handleCancel}>
                    <Descriptions column = {1}>
                        {isGy ? null : <Descriptions.Item label = "奖励金额">{selectRecord.reward}</Descriptions.Item>}
                        <Descriptions.Item label = "审核意见">
                            <Input
                                placeholder = "请填写审核意见，驳回时必填。"
                                ref = {input => {
                                    this.textInput = input;
                                }}
                                allowClear
                                onChange = {this.onOpinionChange}
                                style = {{ width: 300 }}
                            />
                        </Descriptions.Item>
                    </Descriptions>
                    <Button type = "primary" loading = {submitType === "agree" && checkLoading} onClick = {this.pass}>
                        审核通过
                    </Button>
                    <Button style = {{ marginLeft: 8 }} loading = {submitType === "reject" && checkLoading} onClick = {this.reject}>
                        审核驳回
                    </Button>
                </Modal>
            </div>
        );
    }
}

export default Result;
