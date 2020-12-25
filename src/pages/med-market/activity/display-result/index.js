import React, { Component } from "react";
import { connect } from "dva";
import { Divider, Button, Input, Modal, Descriptions, Spin, Select, Tabs } from "antd";
import Link from "umi/link";
import moment from "moment";
import ComplexTable from "@/components/ComplexTable";
import { columns, formTplData } from "./templateData";
import YaoForm from "../list/YaoForm";
import ApplyNumList from "../apply-num-list";

import { resCallback, isGy } from "@/utils/utils";
import { actStatus } from "../list/actStatus";
import styles from "./index.less";

const { Option } = Select;
const { TabPane } = Tabs;

@connect(({ dispalyResult, loading }) => ({
    ...dispalyResult,
    loading: loading.effects["dispalyResult/getDetail"],
    listLoading: loading.effects["dispalyResult/getList"],
    checkLoading: loading.effects["dispalyResult/submitOpinion"],
}))
class Result extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1,
            pageSize: 10,
            visible: false,
            opinion: "",
            submitType: "agree",
            checkType: "single", // batch:批量，single:单个
            selectRecord: {},
            selectedRowKeys: [],
            selectedRows: [],
            fields: {},
        };
    }

    componentDidMount() {
        const {
            location: {
                query: { id },
            },
        } = this.props;
        this.getDetail(id);
        this.onSearch();
    }

    // 获取编辑数据
    getDetail = id => {
        const { dispatch } = this.props;
        dispatch({
            type: "dispalyResult/getDetail",
            payload: { actId: id },
        });
    };

    getList = values => {
        const { current, pageSize } = this.state;
        const {
            dispatch,
            location: {
                query: { id },
            },
        } = this.props;
        dispatch({
            type: "dispalyResult/getList",
            payload: { actId: Number(id), ...values, currentPage: current, pageSize },
        });
    };

    formatParam = values => ({
        name: values.userPin ? values.userPin : "",
        cycle: values.cycle ? Number(values.cycle) : "",
        auditStatus: values.auditStatus ? Number(values.auditStatus) : 0,
    });

    onSearch = (values = {}) => {
        this.setState(
            {
                current: 1,
            },
            () => {
                const param = this.formatParam(values);
                this.getList(param);
            }
        );
    };

    onSubmit = values => {
        this.onSearch(values);
    };

    onReset = () => {
        this.onSearch({});
        this.setState({ fields: {} });
    };

    onPageChange = pageNumber => {
        const { param } = this.props;
        this.setState(
            {
                current: pageNumber,
            },
            () => {
                this.getList(param);
            }
        );
    };

    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    };

    checkSingle = record => {
        this.setState({
            checkType: "single",
            selectRecord: record,
            visible: true,
        });
    };

    handleCancel = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    onOpinionChange = ({ target: { value } }) => {
        this.setState({
            opinion: value,
        });
    };

    judgeCheck = status => {
        const { checkType, selectRecord, selectedRows, opinion } = this.state;
        let idList;
        if (checkType === "single") {
            idList = [
                {
                    cycleId: selectRecord.cycleId,
                    opinion,
                    status,
                },
            ];
        } else {
            idList = selectedRows.map(item => ({
                opinion,
                cycleId: item.cycleId,
                status,
            }));
        }
        return idList;
    };

    pass = () => {
        const { dispatch } = this.props;
        // return;
        dispatch({
            type: "dispalyResult/submitOpinion",
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
            type: "dispalyResult/submitOpinion",
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
                this.onSearch();
            }
        );
    };

    checkBatch = () => {
        this.setState({
            checkType: "batch",
            visible: true,
        });
    };

    exportExcel = () => {
        const {
            dispatch,
            location: {
                query: { id },
            },
            param,
        } = this.props;
        dispatch({
            type: "dispalyResult/doExport",
            payload: { actId: id, pin: param.userPin || "" },
        });
    };

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    renderDetail = () => {
        const { loading, detail } = this.props;
        return (
            <Spin tip = "加载中..." spinning = {loading}>
                <Descriptions title = {detail.name}>
                    <Descriptions.Item label = "活动类型">陈列</Descriptions.Item>
                    <Descriptions.Item label = "活动开始时间">{detail.actStartTime ? moment(detail.actStartTime).format("YYYY-MM-DD") : "--"}</Descriptions.Item>
                    <Descriptions.Item label = "活动结束时间">{detail.actEndTime ? moment(detail.actEndTime).format("YYYY-MM-DD") : "--"}</Descriptions.Item>
                    <Descriptions.Item label = "活动状态">{detail.status ? actStatus[detail.status] : "--"}</Descriptions.Item>
                    <Descriptions.Item label = "考核周期">{detail.verifyCycle || "--"}天</Descriptions.Item>
                    <Descriptions.Item label = "每次上传间隔">{detail.uploadInterval || "--"}小时</Descriptions.Item>
                    <Descriptions.Item label = "上传规则">{`${detail.uploadDays || "--"}天${detail.uploadTimes || "--"}次 一次${detail.uploadNum || "--"}张`}</Descriptions.Item>
                    {isGy ? null : <Descriptions.Item label = "奖励上限">{detail.budget || "--"}元</Descriptions.Item>}
                    <Descriptions.Item label = "目前报名人数">{detail.currentApplyNum}人</Descriptions.Item>
                    <Descriptions.Item label = "审核通过数">{detail.applyPassNum}人</Descriptions.Item>
                </Descriptions>
            </Spin>
        );
    };

    renderCheckList = () => {
        const { list, listLoading, detail, total, current } = this.props;

        const { fields, selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: item => ({
                disabled: !item.cycleId,
            }),
        };

        // 组装考核周期筛选项
        let cycleNum = detail.cycleNum || 0;
        cycleNum = new Array(cycleNum).fill(1);
        const compType = (
            <Select placeholder = "考核周期">
                <Option value = {0}>全部</Option>
                {cycleNum.map((item, index) => (
                    <Option value = {index + 1}>{`第${index + 1}期`}</Option>
                ))}
            </Select>
        );
        formTplData[1].component = compType;

        // 拼接列表操作
        let columns1 = columns.concat([
            {
                title: "操作",
                dataIndex: "action",
                width: 200,
                render: (text, record) => (
                    <div>
                        <Link
                            to = {{
                                pathname: "./display-detail",
                                query: { applyId: record.applyId, record: JSON.stringify(record), paramDetail: JSON.stringify(detail), pageType: "view" },
                            }}
                        >
                            审核详情
                        </Link>
                        {record.cycleStatus === 2 && isGy ? (
                            <span>
                                <Divider type = "vertical" />
                                <a onClick = {() => this.checkSingle(record)}>快速审核</a>{" "}
                            </span>
                        ) : null}
                    </div>
                ),
            },
        ]);

        if (isGy) {
            columns1 = columns1.filter(item => item.dataIndex !== "rewardNum");
        }

        return (
            <>
                <YaoForm
                    items = {formTplData}
                    columns = {3}
                    layout = {{
                        labelCol: { span: 6 },
                        wrapperCol: { span: 18 },
                    }}
                    onChange = {this.handleFormChange}
                    fields = {{ ...fields }}
                    onReset = {this.onReset}
                    onSubmit = {this.onSubmit}
                />
                {selectedRowKeys.length > 0 || true ? (
                    <div
                        style = {{
                            marginBottom: 24,
                        }}
                    >
                        <Button type = "primary" onClick = {this.exportExcel}>
                            导出
                        </Button>
                        {isGy ? (
                            <Button onClick = {this.checkBatch} style = {{ marginLeft: 10 }}>
                                批量审核
                            </Button>
                        ) : null}
                    </div>
                ) : null}
                <ComplexTable
                    rowSelection = {rowSelection}
                    dataSource = {list}
                    columns = {columns1}
                    pagination = {{
                        showTotal: () => `共 ${total} 条`,
                        showQuickJumper: true,
                        current,
                        total,
                        onChange: this.onPageChange,
                    }}
                    bordered
                    rowKey = "cycleId"
                    loading = {listLoading}
                />
            </>
        );
    };

    renderModelContent = () => {
        const { checkLoading } = this.props;
        const { visible, selectRecord, selectedRows, submitType, checkType } = this.state;

        // 计算审核奖励金额
        let rewards = 0;
        if (checkType === "single") {
            rewards = selectRecord.reward;
        } else {
            selectedRows.forEach(item => {
                rewards += item.reward;
            });
        }

        return (
            <Modal title = "审核" visible = {visible} footer = {null} onOk = {this.handleOk} onCancel = {this.handleCancel}>
                <Descriptions column = {1}>
                    <Descriptions.Item label = "奖励金额">{rewards}</Descriptions.Item>
                    <Descriptions.Item label = "审核意见" span = {24}>
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
        );
    };

    renderDiffList = () => {
        const { location } = this.props;

        if (isGy) {
            return this.renderCheckList();
        }

        return (
            <Tabs type = "card">
                <TabPane tab = "报名人数" key = "1">
                    <ApplyNumList location = {location} />
                </TabPane>
                <TabPane tab = "审核通过数" key = "2">
                    {this.renderCheckList()}
                </TabPane>
            </Tabs>
        );
    };

    render() {
        return (
            <div className = {styles.tableList}>
                {this.renderDetail()}
                <Divider dashed>以上为基础信息</Divider>
                {this.renderDiffList()}
                {this.renderModelContent()}
            </div>
        );
    }
}

export default Result;
