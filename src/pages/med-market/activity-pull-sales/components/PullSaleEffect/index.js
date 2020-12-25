import React, { Component } from "react";
import { connect } from "dva";
import cloneDeep from "lodash/cloneDeep";
import { Form, Modal, Descriptions, Table, Button, Tooltip, Icon, Input, Divider, Tabs } from "antd";
import PullEffectSearch from "../PullEffectSearch";
import ApplyNumList from "../../../activity/apply-num-list";
import { PicsComb } from "@/components/complex-table";
import styles from "./index.less";
import { formatTime, goodsCol } from "../PullSaleCreate/validate";
import { genPageObj, success, err, info, isGy, UUID } from "@/utils/utils";

const { TextArea } = Input;
const { TabPane } = Tabs;
const format = "YYYY-MM-DD HH:mm:ss";
const singleColRow = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
        md: { span: 6 },
        lg: { span: 6 },
        xl: { span: 6 },
        xxl: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
        lg: { span: 12 },
        xl: { span: 12 },
        xxl: { span: 12 },
    },
};

const statusObj = {
    1: "待审",
    2: "通过",
    3: "驳回",
    4: "审核中",
    5: "申诉驳回",
};

const buyTypeParam = {
    1: "员工",
    2: "单体门店",
    3: "连锁总部",
    4: "连锁分公司",
    5: "连锁门店",
    6: "非营利性医疗机构",
    7: "营利性医疗机构",
};

let dispatch;
@connect(({ pullSale, loading }) => ({ ...pullSale, loading }))
class PullSaleEffect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goodList: [],
            approvalRow: [],
            selectedRowKeys: [],
            selectedRows: [],
            actId: undefined,
            fullData: [],
        };
        ({ dispatch } = props);
        this.customPageObj = genPageObj(this, "abc");
        this.columns = this.genCols();
    }

    componentDidMount() {
        this.getUrlParam();
    }

    genCols = () => {
        const commonCols = [
            {
                title: "索引",
                dataIndex: "index",
                width: 80,
                render: (text, record, index) => index + 1,
            },
            {
                title: "买家信息",
                dataIndex: "pin",
                key: "pin",
                width: 120,
            },
            {
                title: "区域",
                dataIndex: "area",
                key: "area",
                width: 200,
            },
            {
                title: "类型",
                dataIndex: "buyerType",
                key: "buyerType",
                width: 200,
                render: text => buyTypeParam[text],
            },
            {
                title: "提交时间",
                dataIndex: "modified",
                key: "modified",
                width: 200,
                render: text => formatTime(text, format),
            },
            {
                title: "审核状态",
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (text, record) => this.renderApproval(record),
            },
            {
                title: "小票图片",
                dataIndex: "imgPath",
                key: "imgPath",
                align: "center",
                width: 200,
                render: text => {
                    if (!text) return "";
                    const imgData = [{ uid: UUID(), url: text }];
                    return <PicsComb num = {1} data = {imgData} imgKey = "uid" imgStyle = {{ width: 60, height: 60 }} />;
                },
            },
            {
                title: "最小包装单位数",
                dataIndex: "packages",
                key: "packages",
                width: 300,
            },
        ];
        const operation = [
            {
                title: "操作",
                dataIndex: "operation",
                key: "operation",
                width: 200,
                fixed: "right",
                render: (text, record) => this.renderOper(record),
            },
        ];
        return isGy ? commonCols.concat(operation) : commonCols;
    };

    /**
     * 审核驳回、申诉驳回状态下需要显示小问号,并hover显示驳回原因
     * @returns {React}
     */
    renderApproval = record => {
        const { status, rejectReason } = record;
        if (status !== 3 && status !== 5) return statusObj[status];
        return (
            <Tooltip title = {rejectReason}>
                {statusObj[status]}
                <Icon type = "question-circle" style = {{ marginLeft: "2px" }} />
            </Tooltip>
        );
    };

    getPendingData = () => {
        const statusArr = [1, 4];
        const { effectRes: data } = this.props;
        const { fullData } = this.state;
        if (Array.isArray(fullData)) {
            return fullData.filter(({ status }) => statusArr.includes(status));
        }
        return data.filter(({ status }) => statusArr.includes(status));
    };

    judgeFirst = record => {
        const pendingData = this.getPendingData();
        const index = pendingData.findIndex(({ id }) => id === record.id);
        if (index > 0) return false;
        return true;
    };

    renderOper = record => {
        const { status } = record;
        if (!isGy) return "";
        if ([1, 4].includes(status)) {
            // if (isCease === 1) return "已达奖励上限不可审核";
            const isFirst = this.judgeFirst(record);
            return (
                <div>
                    <Button type = "primary" size = "small" disabled = {!isFirst} onClick = {this.callApproval("approval", record)}>
                        审核通过
                    </Button>
                    <Button type = "primary" size = "small" disabled = {!isFirst} className = {styles.ml} onClick = {this.callApproval("reject", record)}>
                        审核驳回
                    </Button>
                </div>
            );
        }
        return "";
    };

    getUrlParam = () => {
        const {
            location: {
                query: { id = 246 },
            },
        } = this.props;
        if (id) {
            this.setState({ actId: id });
            this.callModel("getEffectDetail", { actId: id }, this.getCallback);
            this.callModel("getEffectBaseInfo", { id }, this.getCallback);
            this.getGoods(id);
            this.callModel("getEeffectFull", { actId: id }, this.getFullBack);
        }
    };

    reGetFullData = () => {
        const {
            location: {
                query: { id },
            },
        } = this.props;

        this.callModel("getEeffectFull", { actId: id }, this.getFullBack);
    };

    /**
     * 查询列表回调
     * @param {*} { type, msg }
     */
    getCallback = ({ type, msg }) => {
        if (type === "error") {
            err(msg);
        }
    };

    getFullBack = ({ data }) => {
        if (Array.isArray(data)) {
            this.setState({
                fullData: data,
            });
        }
    };

    /**
     * 除查询列表外其他请求回调
     * @param {*} { type, msg }
     */
    otherCallback = ({ type, msg }) => {
        if (type === "success") {
            success({ content: msg });
        } else {
            err(msg);
        }
    };

    /**
     * 分页相关函数
     */
    onPageChange = type => (current, pageSize) => {
        const param = {
            currentPage: type === "current" ? current : 1,
            pageSize,
        };
        this.callModel("getEffectDetail", param, this.getCallback);
    };

    getGoods = id => {
        this.callModel("getGood", { id }, ({ data: goodList }) => {
            if (Array.isArray(goodList) && goodList.length) {
                this.setState({ goodList });
            }
        });
    };

    hasSelectData = () => {
        const { selectedRows } = this.state;
        if (!selectedRows.length) {
            info({ content: "请选择审批数据", title: "审批提示" });
            return false;
        }

        return true;
    };

    handleExport = () => {
        // 导出
        const { actId } = this.state;
        const { effectParam } = this.props;
        // if (!this.hasSelectData()) return;
        this.callModel("doExport", { ...effectParam, actId }, this.otherCallback);
    };

    /**
     * 批量审批
     * @param {string} type 操作标识 [approval|reject] [同意|驳回]
     */
    batchApproval = type => () => {
        const { selectedRows, fullData: data } = this.state;
        if (!this.hasSelectData()) return;
        // const { effectRes: data } = this.props;
        // 过滤待审数据
        const lastSelectData = selectedRows[selectedRows.length - 1];
        const lastSelectIndex = data.findIndex(({ id }) => id === lastSelectData.id);
        const filterData = data.slice(0, lastSelectIndex + 1).filter(({ status }) => status === 1 || status === 4);

        if (filterData.length !== selectedRows.length) {
            err("请注意，动销审核需要按用户提交时间顺序审核哦，请重新选择～");
        } else {
            // 调用批量审批接口或者弹出审批窗口
            this.callApproval(type, cloneDeep(selectedRows))();
        }
    };

    /**
     * 审核和驳回复合时间
     * @param {string} type 操作标识 [approval|reject] [同意|驳回]
     */
    callApproval = (type, record) => () => {
        const { form } = this.props;
        const data = Array.isArray(record) ? record : [record];
        // const params = data.map(item => ({ ...item, status: type === "approval" ? 2 : 3 }));
        if (type === "approval") {
            const params = data.map(item => {
                const { status } = item;
                const rejectStatus = status === 1 ? 3 : 5;
                return { ...item, status: type === "approval" ? 2 : rejectStatus };
            });
            this.execApproval(params);
        } else {
            this.setState({
                approvalRow: record,
                visible: true,
            });
            form.resetFields();
        }
    };

    execApproval = data => {
        console.log("approvalData", data);
        // 调用审批接口
        this.callModel("doApproval", data, ({ type, msg }) => {
            const { actId } = this.state;
            if (type === "success") {
                success({ content: msg }, () => {
                    this.setState({
                        visible: false,
                    });
                });
            } else {
                err(msg);
            }
            this.callModel("getEeffectFull", { actId }, this.getFullBack);
        });
    };

    handleSubmit = () => {
        const {
            form: { validateFieldsAndScroll },
        } = this.props;
        const { approvalRow } = this.state;
        const approvalData = Array.isArray(approvalRow) ? approvalRow : [approvalRow];
        validateFieldsAndScroll((error, values) => {
            if (error) return;
            // const res = approvalRow.map(row => ({ ...row, ...values, status: 3 }));
            const res = approvalData.map(item => {
                const { status } = item;
                return { ...item, ...values, status: status === 1 ? 3 : 5 };
            });
            this.execApproval(res);
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    /**
     *
     * @param {array} selectedRowKeys 选中项的key组成的数组
     * @param {array} selectedRows 选中的数组组成的数组
     */
    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    };

    getCheckboxProps = record => {
        const statusArr = [1, 4];
        const { status } = record;
        return { disabled: !statusArr.includes(status) };
    };

    callModel = (type, data, callback) => {
        dispatch({
            type: `pullSale/${type}`,
            payload: data,
            callback,
        });
    };

    getRowSelection = () => ({
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
        },
        getCheckboxProps: record => ({
            disabled: record.name === "Disabled User", // Column configuration not to be checked
            name: record.name,
        }),
    });

    getStatusText = () => {
        const {
            location: {
                query: { statusText },
            },
        } = this.props;
        return statusText ? decodeURIComponent(statusText) : "";
    };

    renderDetail = () => {
        const { goodList } = this.state;
        const {
            effectBaseInfo: { name, actStartTime, actEndTime, joinNum = 0, joinPass = 0, joinReject = 0, joinOnVerify },
        } = this.props;
        return (
            <div>
                <Descriptions title = {name || "动销活动"}>
                    <Descriptions.Item label = "活动类型">动销</Descriptions.Item>
                    <Descriptions.Item label = "活动开始时间">{formatTime(actStartTime)}</Descriptions.Item>
                    <Descriptions.Item label = "活动结束时间">{formatTime(actEndTime)}</Descriptions.Item>
                    <Descriptions.Item label = "活动状态">{this.getStatusText()}</Descriptions.Item>
                    <Descriptions.Item label = "目前参与人数">{joinNum}</Descriptions.Item>
                    <Descriptions.Item label = "审核通过数">{joinPass}</Descriptions.Item>
                    <Descriptions.Item label = "审核驳回数">{joinReject}</Descriptions.Item>
                    <Descriptions.Item label = "待审核数">{joinOnVerify}</Descriptions.Item>
                </Descriptions>
                <Descriptions title = "">
                    <Descriptions.Item label = "活动商品">
                        <Table dataSource = {goodList} columns = {goodsCol} pagination = {false} rowKey = "factorySkuId" bordered />
                    </Descriptions.Item>
                </Descriptions>
            </div>
        );
    };

    renderBatchApproval = () => {
        if (!isGy) return "";
        return (
            <>
                <Button type = "primary" onClick = {this.batchApproval("approval")} className = {styles.ml}>
                    批量审批通过
                </Button>
                <Button type = "primary" onClick = {this.batchApproval("reject")} className = {styles.ml}>
                    批量审批驳回
                </Button>
            </>
        );
    };

    renderCheckList = () => {
        const { selectedRowKeys } = this.state;
        const {
            effectRes: data,
            effectPageRes: { total },
            effectParam: { currentPage: current, pageSize },
            loading: { effects: { "pullSale/getEffectDetail": loading } = {} },
        } = this.props;

        const rowSelection = {
            fixed: true,
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: this.getCheckboxProps,
        };

        return (
            <>
                <PullEffectSearch dispatch = {dispatch} getFullData = {this.reGetFullData} />
                <div className = {styles.btnArea}>
                    <Button type = "primary" onClick = {this.handleExport} disabled = {!(Array.isArray(data) && data.length)}>
                        导出
                    </Button>
                    {this.renderBatchApproval()}
                </div>
                <Table
                    rowSelection = {rowSelection}
                    dataSource = {data}
                    columns = {this.columns}
                    pagination = {{
                        ...this.customPageObj,
                        ...{ pageSizeOptions: ["10", "15", "20"] },
                        ...{ current, pageSize },
                        total,
                    }}
                    scroll = {{ x: "101%" }}
                    bordered
                    rowKey = "id"
                    loading = {loading}
                />
            </>
        );
    };

    renderModelContent = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;
        const { visible } = this.state;

        return (
            <Modal title = "审核提示" visible = {visible} onCancel = {this.handleCancel} footer = {null}>
                <Form {...singleColRow}>
                    {/* <Form.Item label = "审核操作">
                {getFieldDecorator("approval", {
                    rules: [{ required: true }],
                })(
                    <Radio.Group>
                        <Radio value = {1}>通过</Radio>
                        <Radio value = {2}>驳回</Radio>
                    </Radio.Group>
                )}
            </Form.Item> */}
                    <Form.Item label = "审批意见">
                        {getFieldDecorator("rejectReason", {
                            rules: [{ required: true, message: "请输入审批意见" }],
                        })(<TextArea rows = {4} />)}
                    </Form.Item>
                </Form>
                <div className = {styles.appBtns}>
                    <Button type = "primary" onClick = {this.handleSubmit}>
                        提交
                    </Button>
                </div>
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
            <div className = {styles["pull-sale-effect"]}>
                {this.renderDetail()}
                <Divider dashed>以上为基础信息</Divider>
                {this.renderDiffList()}
                {this.renderModelContent()}
            </div>
        );
    }
}

export default Form.create()(PullSaleEffect);
