/* eslint-disable import/extensions */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { Form, Select, Row } from "antd";

import SearchArea from "@/components/SearchArea";
import { multiColRow, isGy, urlPrefix } from "@/utils/utils";
import { MultiItem } from "@/components/complex-form";
import FuzzySearch from "@/components/FuzzySearch";
import { genSearchField, taskPram, isFuzzyEmpty, actRes, buyerArr, resetMap } from "./commonData";

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

class PullSearch extends Component {
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
            this.callModel("getEchart", this.getReqParam(values));
            this.callModel("queryBaseInfo", this.getReqParam(values));
            this.callModel("queryAnalyseArea", { currentPage: 1, pageSize: 10 });
            this.updateActInfo(values);
        });
    };

    getUrlParam = () => {
        const {
            location: {
                query: { id, type },
            },
        } = this.props;
        this.queryAct({ id, type });
    };

    queryAct = ({ id, type }) => {
        this.callModel("queryActs", { id, type }, ({ data }) => {
            if (data) {
                const { id: actId, actTaskId, venderId: factoryVenderId } = data;
                const baseReq = { actId, actTaskId, factoryVenderId };
                this.callModel("getEchart", baseReq);
                this.callModel("queryBaseInfo", baseReq);
                this.callModel("queryAnalyseArea", { currentPage: 1, pageSize: 10 });
            }
        });
    };

    getReqParam = values => {
        const {
            activity: { actId, actTaskId, venderId: factoryVenderId },
            pinType,
            businessCompany,
            goods,
        } = values;

        return Object.assign({}, { actId, pinType, actTaskId, factoryVenderId, factorySkuId: goods, venderId: businessCompany });
    };

    updateActInfo = searchParam => {
        const {
            activity,
            activity: { actId, factoryName },
        } = searchParam;
        const { parContext } = this.props;
        parContext.actInfo = Object.assign({}, activity, { actId, factoryName });
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
        this.complexSetValues("activity");
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
            type: 2,
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
            type: `collectAnalyse/${type}`,
            payload: data,
            callback,
        });
    };

    renderFactory = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;
        if (isGy) return null;
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

    renderGoods = () => {
        const { condition } = this.props;
        const factorySkus = condition.factorySkus;
        return factorySkus.map(({ key, value }) => (
            <Option key = {key} value = {key}>
                {value}
            </Option>
        ));
    };

    renderBusinessCompany = () => {
        // const { activity: { id } = {} } = this.getValue() || {};
        const { condition } = this.props;
        const venderInfos = condition.venderInfos;
        return venderInfos.map(({ key, value }) => (
            <Option key = {key} value = {key}>
                {value}
            </Option>
        ));
    };

    getCondition = () => {
        const activity = this.getFromField("activity") || {};
        const reqParam = {
            actId: activity.key,
        };
        dispatch({
            type: `collectAnalyse/getCondition`,
            payload: reqParam,
        });
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

        const { activity = {} } = this.getValue() || {};
        const { venderId: { key: venderId } = {}, actTaskId: { key: actTaskId } = {} } = this.getValue() || {};
        return (
            <div className = {styles["train-analy-search"]}>
                <SearchArea onSearch = {that.onSearch} onReset = {that.onReset} formLayout = {multiColRow} searchText = "查询" clearText = "重置">
                    <Row>
                        {isGy ? null : this.renderFactory()}
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
                                    // disabled = {!isGy || !venderId}
                                    notFoundContent = "系统没有找到当前药企下在有效期内的任何任务，请先创建任务哦～"
                                />
                            )}
                        </MultiItem>
                        <MultiItem label = "采购活动">
                            {getFieldDecorator("activity", {
                                initialValue: { key: "", label: "" },
                                rules: [
                                    {
                                        required: true,
                                        message: "请选择采购活动",
                                    },
                                    { validator: this.trainValidate },
                                ],
                            })(
                                <FuzzySearch
                                    url = {`${urlPrefix}activity/queryActList`}
                                    resParam = {actRes}
                                    searchFields = {this.jointActParam()}
                                    disabled = {!actTaskId}
                                    notFoundContent = "系统没有找到当前药企下在有效期内的任何任务，请先创建任务哦～"
                                    onChange = {this.getCondition}
                                />
                            )}
                        </MultiItem>
                        <MultiItem label = "选择商品">
                            {getFieldDecorator("goods", {
                                initialValue: "-1",
                                rules: [
                                    {
                                        required: false,
                                        message: "请选择商品",
                                    },
                                ],
                            })(
                                <Select disabled = {!activity.key} placeholder = "请选择商品">
                                    {this.renderGoods()}
                                </Select>
                            )}
                        </MultiItem>
                        <MultiItem label = "选择商业公司">
                            {getFieldDecorator("businessCompany", {
                                initialValue: "-1",
                                rules: [
                                    {
                                        required: false,
                                        message: "请选商业公司",
                                    },
                                ],
                            })(
                                <Select disabled = {!activity.key} placeholder = "请选商业公司">
                                    {this.renderBusinessCompany()}
                                </Select>
                            )}
                        </MultiItem>
                        {isGy ? null : (
                            <MultiItem label = "买家类型">
                                {getFieldDecorator("pinType", {
                                    initialValue: -1,
                                    rules: [
                                        {
                                            required: false,
                                        },
                                    ],
                                })(<Select placeholder = "请选择运行状态">{this.renderBuyer()}</Select>)}
                            </MultiItem>
                        )}
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create()(PullSearch);
