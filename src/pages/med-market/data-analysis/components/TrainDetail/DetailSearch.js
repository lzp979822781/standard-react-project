/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { Form, Select, Row } from "antd";
import { connect } from "dva";
import SearchArea from "@/components/SearchArea";
import { multiColRow, isGy, urlPrefix } from "@/utils/utils";
import { MultiItem } from "@/components/complex-form";
import FuzzySearch from "@/components/FuzzySearch";
import { genSearchField, taskPram, isFuzzyEmpty, trainRes, buyerArr, resetMap } from "../TrainAnalysis/commonData";

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
@connect(({ trainSale, loading }) => ({
    ...trainSale,
    loading,
}))
class DetailSearch extends Component {
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

            this.updateActInfo(values);
            // 请求
            // this.callModel("queryTrainInfo", this.getReqParam(values));
            this.callModel("queryDetailList", { currentPage: 1, pageSize: 10, ...this.getReqParam(values) });
        });
    };

    updateActInfo = searchParam => {
        const {
            activity,
            activity: { id, venderName: factoryName },
        } = searchParam;
        const { parContext } = this.props;
        parContext.actInfo = Object.assign({}, activity, { actId: id, factoryName });
    };

    getReqParam = values => {
        const {
            activity: { key: actId },
        } = values;
        return Object.assign({}, { actId });
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
        const { key: actTaskId } = this.getFromField("actTaskId") || {};
        if (!actTaskId) {
            return { currentPage: 1, pageSize: 10 };
        }
        const reqParam = {
            actTaskId,
            typeList: [4, 5],
            realStatus: 204,
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
        const { searchFun } = this.props;
        if (searchFun) searchFun();
    };

    getUrlParam = () => {
        const {
            location: {
                query: { id = 306 },
            },
        } = this.props;
        this.setState({ id }, () => {
            if (id) {
                this.queryList();
            }
        });
    };

    queryList = () => {
        const { id } = this.state;
        this.callModel("queryDetailList", { actId: id });
    };

    resetId = () => {
        this.props.form.resetFields();
        // this.callModel("resetActId", { field: "detailBaseParm" });
        const { searchFun } = this.props;
        if (searchFun) searchFun();
    };

    callModel = (type, data = {}, callback) => {
        dispatch({
            type: `trainSale/${type}`,
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
                        <MultiItem label = "培训活动">
                            {getFieldDecorator("activity", {
                                initialValue: { key: "", label: "" },
                                rules: [
                                    {
                                        required: true,
                                        message: "请选择培训活动",
                                    },
                                    { validator: this.trainValidate },
                                ],
                            })(
                                <FuzzySearch
                                    url = {`${urlPrefix}activity/queryActList`}
                                    resParam = {trainRes}
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

export default Form.create()(DetailSearch);
