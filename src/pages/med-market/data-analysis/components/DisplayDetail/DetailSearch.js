/* eslint-disable import/extensions */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { Form, Select, Row } from "antd";

import SearchArea from "@/components/SearchArea";
import { multiColRow, isGy, urlPrefix } from "@/utils/utils";
import { MultiItem } from "@/components/complex-form";
import FuzzySearch from "@/components/FuzzySearch";
import { genSearchField, taskPram, isFuzzyEmpty, actRes, buyerArr, resetMap } from "../PullSaleAnalysis/commonData";

import styles from "./index.less";

const { Option } = Select;
const resParam = {
    value: "venderId",
    text: "companyName",
};
const searchFields = {
    searchField: "companyName",
};

let isNormalValid = true;

let dispatch;

class DisplaySearch extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        dispatch = props.dispatch;
        this.props.onRef(this);
    }

    onSearch = () => {
        const {
            form: { validateFields },
        } = this.props;
        isNormalValid = false;
        validateFields((err, values) => {
            isNormalValid = true;
            console.log("searchValues", values);
            if (err) {
                return;
            }
            // 请求
            // this.callModel("queryBaseInfo", this.getReqParam(values));
            // this.callModel("queryAnalyseArea", { currentPage: 1, pageSize: 10 });

            this.callModel("queryDetailInfo", this.getReqParam(values));
            this.callModel("queryDetailList", { currentPage: 1, pageSize: 10, ...this.getReqParam(values) });
            // if (!isGy) {
            //     this.callModel("queryReward", { currentPage: 1, pageSize: 10, ...this.getReqParam(values) });
            // }
            this.updateActInfo(values);
        });
    };

    getReqParam = values => {
        const {
            activity: { actId, actTaskId, venderId: factoryVenderId },
        } = values;
        return Object.assign({}, { actId, actTaskId, factoryVenderId });
    };

    updateActInfo = searchParam => {
        const {
            activity,
            activity: { actId, factoryName },
        } = searchParam;
        const { parContext } = this.props;
        parContext.actInfo = Object.assign({}, activity, { actId, factoryName });
    };

    getUrlParam = () => {
        const {
            location: {
                query: { id = 433, type },
            },
        } = this.props;
        this.queryAct({ id, type });
    };

    queryAct = ({ id, type }) => {
        this.callModel("queryActs", { id, type }, ({ data }) => {
            if (data) {
                const { id: actId, actTaskId, venderId: factoryVenderId } = data;
                const baseReq = { actId, actTaskId, factoryVenderId };
                this.callModel("queryDetailInfo", baseReq);
                this.callModel("queryDetailList", { currentPage: 1, pageSize: 10 });
                // if (!isGy) {
                //     this.callModel("queryReward", { currentPage: 1, pageSize: 10 });
                // }
            }
        });
    };

    facValid = (rule, value = {}, callback) => {
        this.complexSetValues("venderId");
        if (isFuzzyEmpty(value)) {
            callback("请选择药企");
        }
        callback();
    };

    /**
     * 任务validate函数
     */
    taskValidate = (rule, value = {}, callback) => {
        this.complexSetValues("actTaskId");
        if (isFuzzyEmpty(value)) {
            callback("请选择任务");
        }

        callback();
    };

    trainValidate = (rule, value = {}, callback) => {
        if (isFuzzyEmpty(value)) {
            callback("请选择活动");
        }
        callback();
    };

    jointActParam = () => {
        const { key: actTaskId, startTime: actStartTime, endTime: actEndTime } = this.getFromField("actTaskId") || {};
        if (!actTaskId) {
            return { currentPage: 1, pageSize: 10 };
        }
        const reqParam = {
            actTaskId,
            actStartTime,
            actEndTime,
            type: 1,
        };
        return {
            searchField: "name",
            otherParam: reqParam,
        };
    };

    getValue = () => {
        const {
            form: { getFieldsValue },
        } = this.props;
        return getFieldsValue();
    };

    getFromField = field => {
        const {
            form: { getFieldValue },
        } = this.props;
        return getFieldValue(field);
    };

    setValues = fieldsValus => {
        const {
            form: { setFieldsValue },
        } = this.props;
        setFieldsValue(fieldsValus);
    };

    complexSetValues = field => {
        const {
            form: { setFieldsValue },
        } = this.props;
        if (isNormalValid) {
            setFieldsValue(resetMap[field]);
        }
    };

    onReset = () => {
        this.props.form.resetFields();
        // this.getUrlParam();
        const { searchFun } = this.props;
        if (searchFun) searchFun();
    };

    resetId = () => {
        this.callModel("resetActId", { field: "analyseBaseParm" });
    };

    callModel = (type, data, callback) => {
        dispatch({
            type: `displayAnalyse/${type}`,
            payload: data,
            callback,
        });
    };

    renderFactory = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;
        if (isGy) return "";
        return (
            <MultiItem label = "药企名称">
                {getFieldDecorator("venderId", {
                    initialValue: { key: "", label: "" },
                    rules: [
                        {
                            required: true,
                            message: "请选择药企",
                        },
                        { validator: this.facValid },
                    ],
                })(<FuzzySearch url = {`${urlPrefix}vender/factory/list`} resParam = {resParam} searchFields = {searchFields} />)}
            </MultiItem>
        );
    };

    renderBuyer = () =>
        buyerArr.map(({ key, text }) => (
            <Option key = {key} value = {key}>
                {text}
            </Option>
        ));

    render() {
        const that = this;
        const {
            form: { getFieldDecorator },
        } = that.props;

        const { venderId: { key: venderId } = {}, actTaskId: { key: actTaskId } = {} } = this.getValue() || {};
        return (
            <div className = {styles["train-analy-search"]}>
                <SearchArea onSearch = {that.onSearch} onReset = {that.onReset} formLayout = {multiColRow} searchText = "查询" clearText = "重置">
                    <Row>
                        {this.renderFactory()}
                        <MultiItem label = "关联任务">
                            {getFieldDecorator("actTaskId", {
                                initialValue: { key: "", label: "" },
                                rules: [
                                    {
                                        required: true,
                                        message: "请选择任务",
                                    },
                                    { validator: this.taskValidate },
                                ],
                            })(
                                <FuzzySearch
                                    url = {`${urlPrefix}act/task/queryList`}
                                    resParam = {taskPram}
                                    searchFields = {genSearchField({
                                        value: venderId,
                                    })}
                                    disabled = {isGy ? false : !venderId}
                                    notFoundContent = "系统没有找到当前药企下在有效期内的任何任务，请先创建任务哦～"
                                />
                            )}
                        </MultiItem>
                        <MultiItem label = "陈列活动">
                            {getFieldDecorator("activity", {
                                initialValue: { key: "", label: "" },
                                rules: [
                                    {
                                        required: true,
                                        message: "请选择陈列活动",
                                    },
                                    { validator: this.trainValidate },
                                ],
                            })(
                                <FuzzySearch
                                    url = {`${urlPrefix}activity/queryActList`}
                                    resParam = {actRes}
                                    searchFields = {this.jointActParam()}
                                    disabled = {isGy ? false : !actTaskId}
                                    notFoundContent = "系统没有找到当前药企下在有效期内的任何任务，请先创建任务哦～"
                                />
                            )}
                        </MultiItem>
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create()(DisplaySearch);
