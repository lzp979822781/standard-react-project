/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { Form, Row, DatePicker } from "antd";
import { connect } from "dva";
import moment from "moment";
import SearchArea from "@/components/SearchArea";
import { multiColRow, isGy, urlPrefix, err as genError } from "@/utils/utils";
import { MultiItem } from "@/components/complex-form";
import FuzzySearch from "@/components/FuzzySearch";
import { genSearchField, taskPram, isFuzzyEmpty, resetMap, getTimeStamp } from "./commonData";

import styles from "./index.less";

const { RangePicker } = DatePicker;

const resParam = {
    value: "venderId",
    text: "companyName",
};
const searchFields = {
    searchField: "companyName",
};

let isNormalValid = true;
let dispatch;
@connect(({ reward, loading }) => ({
    ...reward,
    loading,
}))
class DetailSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        dispatch = props.dispatch;
    }

    componentDidMount() {
        this.initSearch();
    }

    initSearch = () => {
        const facReq = {
            companyName: "",
            currentPage: 1,
            pageSize: 10,
            type: "company",
        };

        this.initActTime();
        this.callModel("initSearch", facReq, ({ data: { result } = {} }) => {
            if (Array.isArray(result) && result.length) {
                this.initCompany(result);
                this.queryTask(result);
            }
        });
    };

    initCompany = result => {
        const { venderId: key, companyName: label } = result[0];
        this.setValues({ venderId: Object.assign({}, { key, label }, result[0]) });
    };

    queryTask = result => {
        const { venderId } = result[0];
        if (venderId) {
            const taskReq = { venderId, currentPage: 1, pageSize: 10, status: 2, type: "task" };
            this.callModel("initSearch", taskReq, this.initTask);
        }
    };

    initTask = ({ data: { result } = {} }) => {
        if (Array.isArray(result) && result.length) {
            const { id, taskName } = result[0];
            this.setValues({ actTaskId: Object.assign({}, { key: id, label: taskName }, result[0]) });
            this.onSearch();
        } else {
            this.setValues({ actTaskId: { key: "", label: "" } });
            this.callModel("updateState", {
                detailListRes: { totalCount: 0, data: [] },
                detailListParam: {
                    currentPage: 1,
                    pageSize: 10,
                },
            });
        }
    };

    initActTime = () => {
        const start = moment()
            .subtract(1, "months")
            .add(1, "d")
            .startOf("d");
        const end = moment();
        this.setValues({ actTime: [start, end] });
    };

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
            // this.callModel("queryTrainInfo", this.getReqParam(values));
            this.callModel("queryDetailList", { currentPage: 1, pageSize: 10, ...this.getReqParam(values) }, this.errCallback);
            this.updateActInfo(values);
        });
    };

    errCallback = ({ type, msg }) => {
        if (type === "error") {
            genError(msg);
        }
    };

    getReqParam = values => {
        const {
            actTaskId: { id: actTaskId },
            actTime: [startTime, endTime] = [],
        } = values;
        return Object.assign({}, { actTaskId, startTime: startTime ? getTimeStamp(startTime) : undefined, endTime: endTime ? getTimeStamp(endTime) : undefined });
    };

    updateActInfo = searchParam => {
        const { actTaskId } = searchParam;
        const { parContext } = this.props;
        parContext.actInfo = Object.assign({}, actTaskId);
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
        if (isFuzzyEmpty(value)) {
            callback("请选择任务");
        }

        callback();
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

    disApplyTime = current => current < moment().subtract(1, "months") || current > moment().endOf("day");

    onReset = () => {
        // this.props.form.resetFields();
        this.initSearch();
    };

    resetId = () => {
        this.callModel("resetActId", { field: "detailBaseParm" });
    };

    callModel = (type, data = {}, callback) => {
        dispatch({
            type: `reward/${type}`,
            payload: data,
            callback,
        });
    };

    renderFactory = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;
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

    render() {
        const that = this;
        const {
            form: { getFieldDecorator },
        } = that.props;

        const { venderId: { key: venderId } = {} } = this.getValue() || {};
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
                        <MultiItem label = "活动起止时间">{getFieldDecorator("actTime")(<RangePicker className = {styles["fill-width"]} />)}</MultiItem>
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create()(DetailSearch);
