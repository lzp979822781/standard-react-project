import React, { Component } from "react";
import { connect } from "dva";
import moment from "moment";
import { Divider, Button, Descriptions, Spin, Tabs } from "antd";
import ComplexTable from "@/components/ComplexTable";
import YaoForm from "../list/YaoForm";
import ApplyNumList from "../apply-num-list";
import { columns, formTplData } from "./templateData";
import { isGy } from "@/utils/utils";
import { wareParmsColumns } from "../collect-create/templateData";
import { actStatus } from "../list/actStatus";
import styles from "./index.less";

const { TabPane } = Tabs;

@connect(({ collectResult, loading }) => ({
    ...collectResult,
    loading: loading.effects["collectResult/getDetail"],
    listLoading: loading.effects["collectResult/getList"],
}))
class Result extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1,
            pageSize: 10,
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
            type: "collectResult/getDetail",
            payload: { actId: id },
        });
    };

    getList = values => {
        const {
            location: {
                query: { id },
            },
        } = this.props;
        const { current, pageSize } = this.state;
        const { dispatch } = this.props;
        dispatch({
            type: "collectResult/getList",
            payload: { actId: Number(id), ...values, currentPage: current, pageSize },
        });
    };

    formatParam = values => ({
        userPin: values.userPin,
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

    exportExcel = () => {
        const {
            dispatch,
            location: {
                query: { id },
            },
            param,
        } = this.props;
        // 采购
        dispatch({
            type: "collectResult/doExport",
            payload: { actId: id, buyerPin: param.userPin || "" },
        });
    };

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    renderDetail = () => {
        const { loading, detail } = this.props;
        const saleRulesLen = detail.saleRules.length;

        const nodeSaleRules = detail.saleRules.map((item, index) => (
            <span key = {item.meet}>
                {`${item.rewardType === 1 ? "采购数量:" : "订单金额:"} 满${item.meet}${item.rewardType === 1 ? "件" : "元"} 返${item.reward}元 `}
                {index === saleRulesLen - 1 ? null : <Divider type = "vertical" />}
            </span>
        ));

        return (
            <Spin tip = "加载中..." spinning = {loading}>
                <Descriptions column = {2} title = {detail.name}>
                    <Descriptions.Item label = "活动类型">采购</Descriptions.Item>
                    <Descriptions.Item label = "活动开始时间">{detail.actStartTime ? moment(detail.actStartTime).format("YYYY-MM-DD") : "--"}</Descriptions.Item>
                    <Descriptions.Item label = "活动结束时间">{detail.actEndTime ? moment(detail.actEndTime).format("YYYY-MM-DD") : "--"}</Descriptions.Item>
                    <Descriptions.Item label = "活动状态">{detail.status ? actStatus[detail.status] : "--"}</Descriptions.Item>
                    {isGy ? null : <Descriptions.Item label = "商品叠加规则">{detail.stackType === 1 ? "单商品叠加" : "全部商品叠加"}</Descriptions.Item>}
                    {isGy ? null : (
                        <Descriptions.Item label = "奖励规则">
                            {detail.rewardCycle === 1 ? "以单笔成交 " : "活动时间内成交"}
                            {detail.rewardTime === 1 ? "只返一次" : "累计返利"}
                        </Descriptions.Item>
                    )}
                    {isGy ? null : <Descriptions.Item label = "返利规则">{nodeSaleRules || "--"}</Descriptions.Item>}
                    {isGy ? null : <Descriptions.Item label = "奖励上限">{detail.budget || "--"}元</Descriptions.Item>}
                    <Descriptions.Item label = "目前满足人数">{detail.saleMeetNum}</Descriptions.Item>
                    <Descriptions.Item label = "目前报名人数">{detail.joinNum}人</Descriptions.Item>
                    <Descriptions.Item label = "活动商品" span = {2}>
                        <ComplexTable
                            columns = {wareParmsColumns}
                            dataSource = {detail.wareParms}
                            pagination = {false}
                            rowKey = "id"
                            bordered
                            // loading = {loading}
                            defaultExpandAllRows
                            expandedRowRender = {record => {
                                const columns3 = [
                                    { title: "商家名称", dataIndex: "shopName" },
                                    {
                                        title: "药品名称",
                                        dataIndex: "medicinesName",
                                    },
                                ];

                                // 只显示选中flag值为1的
                                const data3 = record.skuInfoList.filter(item => item.flag === 1);
                                return <ComplexTable bordered = {false} columns = {columns3} dataSource = {data3} pagination = {false} rowKey = "skuId" />;
                            }}
                        />
                    </Descriptions.Item>
                </Descriptions>
            </Spin>
        );
    };

    renderCheckList = () => {
        const { listLoading, total, current, list } = this.props;
        const { fields } = this.state;

        let columns1 = columns;

        if (isGy) {
            columns1 = columns.filter(item => !["validCount", "amount"].includes(item.dataIndex));
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
                <div
                    style = {{
                        marginBottom: 24,
                    }}
                >
                    <Button type = "primary" onClick = {this.exportExcel}>
                        导出
                    </Button>
                </div>
                <ComplexTable
                    dataSource = {list || [{}]}
                    columns = {columns1}
                    pagination = {{
                        showTotal: () => `共 ${total} 条`,
                        showQuickJumper: true,
                        current,
                        total,
                        onChange: this.onPageChange,
                    }}
                    bordered
                    rowKey = "id"
                    loading = {listLoading}
                />
            </>
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
            </div>
        );
    }
}

export default Result;
