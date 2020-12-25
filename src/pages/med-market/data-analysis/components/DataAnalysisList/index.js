/* eslint-disable import/extensions */
import React, { Component } from "react";
import { connect } from "dva";
import { Descriptions, Tabs } from "antd";
import YaoForm from "../../../activity/list/YaoForm";
import { formTplData, formTplData1 } from "./templateData";
import { isGy, transCookie, getStrDate } from "@/utils/utils";
import Display from "./Display";
import Collect from "./Collect";
import PullSales from "./PullSales";
import Train from "./Train";

import styles from "./index.less";

const { TabPane } = Tabs;

@connect(({ dataAnalysisList, loading }) => ({
    ...dataAnalysisList,
    loading1: loading.effects["dataAnalysisList/getList1"],
    loading2: loading.effects["dataAnalysisList/getList2"],
    loading3: loading.effects["dataAnalysisList/getList3"],
    loading4: loading.effects["dataAnalysisList/getList4"],
}))
class DataAnalysisList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current1: 1,
            pageSize1: 10,
            current2: 1,
            pageSize2: 10,
            current3: 1,
            pageSize3: 10,
            current4: 1,
            pageSize4: 10,
            fields: {},
            exportFields: {},
            activeKey: "1",
        };
    }

    componentDidMount() {
        this.onSearch();
    }

    onSearch = (values = {}) => {
        const param = this.formatParam(values);
        this.getList(param, "all");
        this.getHeader(param, "all");
        this.getTotalHeader(param);
    };

    getList = (values, type) => {
        // 陈列
        if (type === "all" || type === 1) {
            this.getList1(values);
        }
        // 采购
        if (type === "all" || type === 2) {
            this.getList2(values);
        }

        // 动销
        if (type === "all" || type === 3) {
            this.getList3(values);
        }
        // 培训
        if (type === "all" || type === 4) {
            this.getList4(values);
        }
    };

    getHeader = (values, type) => {
        // 陈列
        if (type === "all" || type === 1) {
            this.getHeader1(values);
        }
        // 采购
        if (type === "all" || type === 2) {
            this.getHeader2(values);
        }

        // 动销
        if (type === "all" || type === 3) {
            this.getHeader3(values);
        }
        // 培训
        if (type === "all" || type === 4) {
            this.getHeader4(values);
        }
    };

    getList1 = values => {
        const { current1, pageSize1 } = this.state;
        const { dispatch } = this.props;
        // 陈列
        dispatch({
            type: "dataAnalysisList/getList1",
            payload: { ...values, currentPage: current1, pageSize: pageSize1 },
        });
    };

    getList2 = values => {
        const { current2, pageSize2 } = this.state;
        const { dispatch } = this.props;

        // 采购
        dispatch({
            type: "dataAnalysisList/getList2",
            payload: { ...values, currentPage: current2, pageSize: pageSize2 },
        });
    };

    getList3 = values => {
        const { current3, pageSize3 } = this.state;
        const { dispatch } = this.props;
        // 动销
        dispatch({
            type: "dataAnalysisList/getList3",
            payload: { ...values, currentPage: current3, pageSize: pageSize3 },
        });
    };

    getList4 = values => {
        const { current4, pageSize4 } = this.state;
        const { dispatch } = this.props;
        // 培训
        dispatch({
            type: "dataAnalysisList/getList4",
            payload: { ...values, currentPage: current4, pageSize: pageSize4 },
        });
    };

    getTotalHeader = (values = {}) => {
        // const { current1, pageSize1 } = this.state;
        const { dispatch } = this.props;
        // 陈列
        dispatch({
            type: "dataAnalysisList/getTotalHeader",
            payload: { ...values },
        });
    };

    getHeader1 = values => {
        const { current1, pageSize1 } = this.state;
        const { dispatch } = this.props;
        // 陈列
        dispatch({
            type: "dataAnalysisList/getHeader1",
            payload: { ...values, currentPage: current1, pageSize: pageSize1 },
        });
    };

    getHeader2 = values => {
        const { current2, pageSize2 } = this.state;
        const { dispatch } = this.props;

        // 采购
        dispatch({
            type: "dataAnalysisList/getHeader2",
            payload: { ...values, currentPage: current2, pageSize: pageSize2 },
        });
    };

    getHeader3 = values => {
        const { current3, pageSize3 } = this.state;
        const { dispatch } = this.props;
        // 动销
        dispatch({
            type: "dataAnalysisList/getHeader3",
            payload: { ...values, currentPage: current3, pageSize: pageSize3 },
        });
    };

    getHeader4 = values => {
        const { current4, pageSize4 } = this.state;
        const { dispatch } = this.props;
        // 培训
        dispatch({
            type: "dataAnalysisList/getHeader4",
            payload: { ...values, currentPage: current4, pageSize: pageSize4 },
        });
    };

    formatParam = values => ({
        factoryVenderId: values.venderId ? values.venderId.venderId : undefined,
        actTaskId: values.actTask ? values.actTask.key : undefined,
    });

    onSubmit = values => {
        const { fields } = this.state;
        this.setState(
            {
                current1: 1,
                exportFields: fields,
            },
            () => {
                this.onSearch(values);
            }
        );
    };

    onReset = () => {
        this.setState(
            {
                current1: 1,
            },
            () => {
                this.onSearch();
            }
        );
    };

    onPageChange = (pageNumber, type) => {
        const { param1, param2, param3, param4 } = this.props;
        if (type === 1) {
            this.setState(
                {
                    current1: pageNumber,
                },
                () => {
                    this.getList1(param1);
                }
            );
        } else if (type === 2) {
            this.setState(
                {
                    current2: pageNumber,
                },
                () => {
                    this.getList2(param2);
                }
            );
        } else if (type === 3) {
            this.setState(
                {
                    current3: pageNumber,
                },
                () => {
                    this.getList3(param3);
                }
            );
        } else if (type === 4) {
            this.setState(
                {
                    current4: pageNumber,
                },
                () => {
                    this.getList4(param4);
                }
            );
        }
    };

    onShowSizeChange = (current, size, type) => {
        const { param1, param2, param3, param4 } = this.props;
        if (type === 1) {
            this.setState(
                {
                    current1: current,
                    pageSize1: size,
                },
                () => {
                    this.getList1(param1);
                }
            );
        } else if (type === 2) {
            this.setState(
                {
                    current2: current,
                    pageSize2: size,
                },
                () => {
                    this.getList2(param2);
                }
            );
        } else if (type === 3) {
            this.setState(
                {
                    current3: current,
                    pageSize3: size,
                },
                () => {
                    this.getList3(param3);
                }
            );
        } else if (type === 4) {
            this.setState(
                {
                    current4: current,
                    pageSize4: size,
                },
                () => {
                    this.getList4(param4);
                }
            );
        }
    };

    renderPercent = percent => {
        const colorStart = "#f23030";
        let colorEnd = "#ffffff";
        let precentStart = percent - 10 > 0 ? percent - 10 : 0;
        let precentEnd = percent;

        if (percent === 100) {
            colorEnd = "#f23030";
        }
        if (percent > 90) {
            precentStart = percent;
            precentEnd = 100;
        }
        return (
            <div
                style = {{
                    width: 150,
                    height: 20,
                    border: "1px solid #ddd",
                    lineHeight: "20px",
                    textAlign: "center",
                    backgroundImage: `linear-gradient(to right, ${colorStart} ${precentStart}%, ${colorEnd} ${precentEnd}%)`,
                }}
            >
                {percent}%
            </div>
        );
    };

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    doExport = virtualActType => {
        const { dispatch } = this.props;
        const cancatTexts = ["", "陈列活动", "采购活动", "动销活动", "培训活动"];

        const {
            exportFields: { venderId, actTask },
        } = this.state;

        const factoryName = venderId && venderId.value && venderId.value.label ? venderId.value.label : "全部药企";
        const actTaskName = actTask && actTask.value && actTask.value.label ? actTask.value.label : "全部任务";
        const { pin } = transCookie() || {};
        const companyName = isGy ? pin : factoryName;
        const fileName = `${companyName}_${actTaskName}[${cancatTexts[virtualActType]}]_${getStrDate(undefined, "YYYYMMDDHHmmss")}.xls`;

        dispatch({
            type: "dataAnalysisList/doExport",
            payload: { virtualActType, fileName },
        });
    };

    changeTabs = activeKey => {
        this.setState({
            activeKey,
        });
    };

    render() {
        const { param, loading1, loading2, loading3, loading4, data1, data2, data3, data4, totalHeader, header1, header2, header3, header4 } = this.props;
        const { fields, activeKey } = this.state;
        return (
            <div className = {styles.pageCon}>
                {/* {this.renderPercent(1)} */}
                <YaoForm items = {isGy ? formTplData1 : formTplData} onReset = {this.onReset} onSubmit = {this.onSubmit} onChange = {this.handleFormChange} fields = {{ ...fields }} />
                {isGy ? null : (
                    <div style = {{ borderRadius: "4px", border: "1px solid #f5f5f5", padding: "10px 10px 0", background: "#f5f5f5" }}>
                        <Descriptions>
                            <Descriptions.Item label = "任务合同预算">{totalHeader.preSpend || "--"}</Descriptions.Item>
                            <Descriptions.Item label = "任务下活动累计预算">{totalHeader.budgets || "--"}</Descriptions.Item>
                            <Descriptions.Item label = "任务累计奖励金额">{totalHeader.rewards || "--"}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
                <Tabs animated = {false} activeKey = {activeKey} onChange = {this.changeTabs}>
                    <TabPane tab = "采购活动" key = "1">
                        <Collect param = {param} loading = {loading2} data = {data2} header = {header2} doExport = {this.doExport} onPageChange = {this.onPageChange} onShowSizeChange = {this.onShowSizeChange} />
                    </TabPane>
                    <TabPane tab = "陈列活动" key = "2">
                        <Display param = {param} loading = {loading1} data = {data1} header = {header1} doExport = {this.doExport} onPageChange = {this.onPageChange} onShowSizeChange = {this.onShowSizeChange} />
                    </TabPane>
                    <TabPane tab = "动销活动" key = "3">
                        <PullSales param = {param} loading = {loading3} data = {data3} header = {header3} doExport = {this.doExport} onPageChange = {this.onPageChange} onShowSizeChange = {this.onShowSizeChange} />
                    </TabPane>
                    <TabPane tab = "培训活动" key = "4">
                        <Train param = {param} loading = {loading4} data = {data4} header = {header4} doExport = {this.doExport} onPageChange = {this.onPageChange} onShowSizeChange = {this.onShowSizeChange} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default DataAnalysisList;
