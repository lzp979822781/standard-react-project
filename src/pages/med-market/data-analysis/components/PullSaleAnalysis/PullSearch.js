/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { Form, Select, Row } from "antd";

import SearchArea from "@/components/SearchArea";
import { multiColRow, isGy, urlPrefix } from "@/utils/utils";
import { MultiItem } from "@/components/complex-form";
import FuzzySearch from "@/components/FuzzySearch";
import { genSearchField, taskPram, isFuzzyEmpty, actRes, /* goodsRes, */ buyerArr, resetMap, getStrDate } from "./commonData";

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
        this.state = {
            goodsOpts: [{ factorySkuId: -1, medicinesName: "全部商品" }],
        };
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
            this.updateActInfo(values);
            // 请求
            this.callModel("queryBaseInfo", this.getReqParam(values));
            this.callModel("queryAnalyseArea", { currentPage: 1, pageSize: 10 });
        });
    };

    getUrlParam = () => {
        const {
            location: {
                query: { id = 439, type },
            },
        } = this.props;
        this.queryAct({ id, type });
    };

    updateActInfo = searchParam => {
        const {
            activity,
            activity: { id, venderName: factoryName },
        } = searchParam;
        const { parContext } = this.props;
        parContext.actInfo = Object.assign({}, activity, { actId: id, factoryName });
    };

    queryAct = ({ id, type }) => {
        this.callModel("queryActs", { id, type }, ({ data }) => {
            if (data) {
                const { id: actId, actTaskId, venderId: factoryVenderId } = data;
                const baseReq = { actId, actTaskId, factoryVenderId, factorySkuId: -1 };
                this.callModel("queryBaseInfo", baseReq);
                this.callModel("queryAnalyseArea", { currentPage: 1, pageSize: 10 });
                this.queryWare(data);
            }
        });
    };

    getReqParam = values => {
        const {
            activity: { id: actId, actTaskId, venderId: factoryVenderId },
            pinType,
            goods: factorySkuId,
        } = values;
        return Object.assign({}, { actId, pinType, actTaskId, factoryVenderId, factorySkuId });
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
        } else {
            this.queryWare(value);
        }
        callback();
    };

    queryWare = (value = {}) => {
        const { id } = value;
        this.callModel("queryActGood", { id }, ({ data }) => {
            if (Array.isArray(data)) {
                const headGood = [{ factorySkuId: -1, medicinesName: "全部商品" }];
                this.setState({ goodsOpts: headGood.concat(data) });
            }
        });
    };

    jointActParam = () => {
        const { key: actTaskId } = this.getFromField("actTaskId") || {};
        if (!actTaskId) {
            return { currentPage: 1, pageSize: 10 };
        }
        const reqParam = {
            actTaskId,
            type: 3,
            realStatus: 201,
        };
        return {
            searchField: "name",
            otherParam: reqParam,
        };
    };

    jointGoodParam = () => {
        const { id: actId, actStartTime, actEndTime, venderId } = this.getFromField("activity") || {};
        const reqParam = {
            venderId,
            actId,
            actStartTime: getStrDate(actStartTime),
            actEndTime: getStrDate(actEndTime),
            type: 3,
        };
        return {
            searchField: "medicinesName",
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
        this.isQueryGood(fieldsValus);
    };

    isQueryGood = (fieldsValus = {}) => {
        const { activity } = fieldsValus;
        if (activity) {
            this.queryWare(activity);
        }
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
        const { searchFun } = this.props;
        if (searchFun) searchFun();
    };

    resetId = () => {
        this.callModel("resetActId", { field: "analyseBaseParm" });
    };

    callModel = (type, data, callback) => {
        dispatch({
            type: `pullSaleAnalyse/${type}`,
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
                })(
                    // <FuzzySearch url = "https://randomuser.me/api/?results=5" />
                    <FuzzySearch url = {`${urlPrefix}vender/factory/list`} resParam = {resParam} searchFields = {searchFields} />
                )}
            </MultiItem>
        );
    };

    /* renderGoods = () => {
        const { activity: { id: actId } = {} } = this.getValue() || {};
        const {
            form: { getFieldDecorator },
        } = this.props;
        return (
            <MultiItem label = "选择商品">
                {getFieldDecorator("goods", {
                    initialValue: { key: "", label: "" },
                    rules: [
                        {
                            required: false,
                            message: "请选择商品",
                        },
                    ],
                })(
                    <FuzzySearch
                        url = {`${urlPrefix}activity/sku/getWare`}
                        resParam = {goodsRes}
                        searchFields = {this.jointGoodParam()}
                        disabled = {isGy ? false : !actId}
                        notFoundContent = "未找到相关活动对应的商品"
                    />
                )}
            </MultiItem>
        );
    }; */

    genOpts = () => {
        const { goodsOpts = [] } = this.state;
        return goodsOpts.map(({ factorySkuId, medicinesName }) => (
            <Option key = {factorySkuId} value = {factorySkuId}>
                {medicinesName}
            </Option>
        ));
    };

    renderGoods = () => {
        const { activity: { id: actId } = {} } = this.getValue() || {};
        const {
            form: { getFieldDecorator },
        } = this.props;
        return (
            <MultiItem label = "选择商品">
                {getFieldDecorator("goods", {
                    initialValue: -1,
                    rules: [
                        {
                            required: false,
                            message: "请选择商品",
                        },
                    ],
                })(<Select disabled = {!actId}>{this.genOpts()}</Select>)}
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
                        <MultiItem label = "动销活动">
                            {getFieldDecorator("activity", {
                                initialValue: { key: "", label: "" },
                                rules: [
                                    {
                                        required: true,
                                        message: "请选择动销活动",
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
                        {this.renderGoods()}
                        {isGy ? (
                            ""
                        ) : (
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
