import React, { Component } from "react";
import { connect } from "dva";
import router from "umi/router";
import { Prompt } from "react-router-dom";
import moment from "moment";
import omit from "lodash/omit";
import pick from "lodash/pick";
import cloneDeep from "lodash/cloneDeep";
import classnames from "classnames";
import { Form, Input, Button, InputNumber, DatePicker, Modal } from "antd";

import { singleColRow, success, err, renderAlert, urlPrefix, isGy } from "@/utils/utils";
import FuzzySearch from "@/components/FuzzySearch";
import { ModalList, BtnGroup } from "@/components/complex-form";
import { EditTable, Loading } from "@/components/complex-table";
import { ActGroupSearch, GoodsSearch } from "@/pages/med-market/activity-train";
import UploadClip from "@/components/UploadClip";
import Header from "@/components/Header";
import YaoTextArea from "@/components/YaoTextArea";
import CheckRecordTable from "@/pages/med-market/activity/display-create/CheckRecordTable";
import ActivityCheck from "@/pages/med-market/activity/activity-check";

import {
    resParam,
    facFields,
    validFactory,
    taskPram,
    genSearchField,
    groupCols,
    validGroup,
    goodsCol,
    validGoods,
    format,
    getTime,
    isBefore,
    getStrDate,
    actDes,
    personCols,
    initPer,
    emptyPerRow,
    commonCols,
    genEmptyRow,
    validPerson,
    validCom,
    requiredMsg,
    handleRow,
    genRewTypeVal,
    resetObj,
} from "./validate";

import styles from "./index.less";

const { RangePicker } = DatePicker;

let form;
let dispatch;

let isNormalValid = true;

const resetMap = {
    venderId: pick(resetObj, ["actTaskId", "applyTime", "actTime", "wareParms", "budget"]),
    actTaskId: pick(resetObj, ["applyTime", "actTime", "wareParms", "budget"]),
    actGroup: pick(resetObj, ["wareParms"]),
    applyTime: pick(resetObj, ["wareParms", "actTime"]),
    actTime: pick(resetObj, ["wareParms"]),
};

@connect(({ pullSale, loading }) => ({ ...pullSale, loading }))
class PullSaleCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buget: undefined,
            loading: false,
            // eslint-disable-next-line react/no-unused-state
            id: undefined,
            pageType: "add",
            rowData: {},
        };
        ({ form, dispatch } = props);
        this.isSave = false;
    }

    componentDidMount() {
        this.getUrlParam();
        // this.getList();
    }

    getList = () => {
        this.callModel("getList", {});
    };

    getUrlParam = () => {
        const {
            location: {
                // eslint-disable-next-line no-unused-vars
                query: { id, pageType = "add" },
            },
        } = this.props;
        this.setState({ pageType });
        if (pageType !== "add" || id) {
            this.setState({ loading: true });
            // 请求数据
            this.callModel("query", { id }, ({ data }) => {
                this.setState({ loading: false });
                if (data) {
                    // 对数据进行处理
                    const newData = handleRow(cloneDeep(data));
                    this.setState({
                        rowData: newData,
                    });
                    // 获取商品数据
                    this.getEditGood(data);
                    this.getTask(data);
                    this.getGroup(data);
                    // this.setState({ rowData: data})
                }
            });
        }
    };

    getEditGood = (rowData = {}) => {
        const { id } = rowData;
        this.callModel("getGood", { id }, ({ data: goodList }) => {
            if (Array.isArray(goodList) && goodList.length) {
                this.setState({ goodList });
            }
        });
    };

    /**
     * 获取任务回显值全量数据
     */
    getTask = rowData => {
        const { pageType } = this.state;
        const { actTaskId } = rowData || {};
        if (actTaskId) {
            this.callModel("queryTask", { id: actTaskId }, ({ data }) => {
                const { id, taskName } = data || {};
                // this.setState({ taskVal: { key: id, label: taskName, ...data } });
                const {
                    form: { setFieldsValue },
                } = this.props;
                setFieldsValue({
                    actTaskId: { key: id, label: taskName, ...data },
                });
                if (["add", "edit"].includes(pageType)) {
                    setTimeout(() => this.queryBudget(), 0);
                }
            });
        }
    };

    /**
     * 获取活动组信息
     * @param {Object} rowData 查询到的行数据
     * @returns {Object} data 需要将返回的数据转换为数组
     */
    getGroup = rowData => {
        const { actGroupCode: groupCode } = rowData;
        if (groupCode) {
            this.callModel("queryGroup", { groupCode }, ({ data: { result } = {} }) => {
                const { setFieldsValue } = form;
                if (Array.isArray(result) && result.length) {
                    setFieldsValue({ actGroup: result });
                }
            });
        }
    };

    /**
     * onSave 为公共保存方法
     * @param {string} type draft标识草稿状态 offical表示正式正式状态
     * @memberof TrainCreate
     */
    // eslint-disable-next-line no-unused-vars
    onSave = type => () => {
        const { validateFieldsAndScroll } = form;
        // const isDraft = type === "draft";
        isNormalValid = false;

        validateFieldsAndScroll((error, values) => {
            // console.log("err, values", err, values);
            // 获取商品相关数据
            const saveVal = this.transValue(cloneDeep(values));
            console.log("saveVal", saveVal);
            const {
                rowData: { actId },
                pageType,
            } = this.state;
            isNormalValid = true;
            if (error) return;
            this.doSave("save", Object.assign({}, { actId, pageType }, saveVal, this.transStatus(type)), type);
        });
    };

    transStatus = btnType => ({ status: btnType === "draft" ? 1 : 2 });

    transValue = values => {
        const { pageType } = this.state;
        const otherVal = omit(values, ["applyTime", "actTime", "individual", "monomer", "hq", "branch", "chainStore", "nonProfitMedical", "profitMedical"]);
        // 获取编辑时需要的数据
        return Object.assign(
            {},
            otherVal,
            this.transDate(),
            this.getFuzzyData(["venderId", "actTaskId"]),
            {
                actMovePinRuleVOList: this.jointReward(),
            },
            {
                actMovePinFileVOList: this.tranPics(),
            },
            { pageType, type: 3 },
            this.transGroup(),
            this.getEditRow()
        );
    };

    getEditRow = () => {
        const {
            rowData: { status, actId },
        } = this.state;
        return { status, actId };
    };

    transDate = () => {
        const { applyTime, actTime } = this.getValue();
        const [applyStartTime, applyEndTime] = getTime(applyTime) || [];
        const [actStartTime, actEndTime] = getTime(actTime) || [];
        return { applyStartTime, applyEndTime, actStartTime, actEndTime };
    };

    transGroup = () => {
        const { actGroup } = this.getValue();
        if (Array.isArray(actGroup) && actGroup.length) {
            const { groupId: actGroupId, groupCode: actGroupCode } = actGroup[0];
            return { actGroupId, actGroupCode };
        }

        return { actGroupId: undefined, actGroupCode: undefined };
    };

    /**
     * 拼接查询到的图片列表数据
     */
    tranPics = () => {
        const { actMovePinFileVOList = [] } = this.getValue();
        return actMovePinFileVOList.map(item => {
            const { name, response: { data: imgPath } = {}, path, imgType } = item;
            return {
                name,
                type: imgType || 1,
                path: path || imgPath,
            };
        });
    };

    getFuzzyData = fieldArr => {
        const values = this.getValue();
        const res = fieldArr.map(field => {
            const {
                [field]: { key },
            } = values;
            return {
                [field]: Number(key),
            };
        });
        return Object.assign({}, ...res);
    };

    jointReward = () => {
        const { individual, monomer, hq, branch, chainStore, nonProfitMedical, profitMedical } = this.getValue();
        // const rewardArr = [...individual, ...monomer, ...hq, ...branch, ...chainStore];
        // return rewardArr;
        const temp = [...monomer, ...hq, ...branch, ...chainStore, ...nonProfitMedical, ...profitMedical].filter(({ minPack, money }) => minPack && money);
        return [...individual, ...temp];
    };

    /**
     * 药企选择校验函数
     */
    validFac = (rule, value, callback) => {
        // this.setValues(pick(resetObj, ["actTaskId", 'applyTime', "actTime", "wareParms", "budget"]));
        this.complexSetValues("venderId");
        validFactory(rule, value, callback);
    };

    /**
     * 任务时间验证
     */
    validTask = (rule, value, callback) => {
        const { key } = value;
        this.complexSetValues("actTaskId");
        if (!key) {
            callback("请选择任务");
        } else {
            const reqParam = {
                actTaskId: key,
            };
            this.callModel("getBuget", reqParam, data => {
                this.setState({
                    buget: data,
                });
            });

            // 当前任务结束时间小于当天
            const { endTime } = value;
            if (isBefore(endTime, moment())) callback("当前任务已结束");
        }
        callback();
    };

    /**
     * 查询预算
     * @param {string} key 已选择的任务key值
     */
    queryBudget = () => {
        const { key } = this.getFromField("actTaskId");
        // const {key} = this.getFromField('actTaskId');
        const {
            rowData: { actId },
        } = this.state;
        const idObj = actId ? { actId } : {};
        const reqParam = {
            actTaskId: key,
            ...idObj,
        };
        this.callModel("getBuget", reqParam, data => {
            this.setState({
                buget: data,
            });
        });
    };

    validActGroup = (rule, value, callback) => {
        this.complexSetValues("actGroup");
        validGroup(rule, value, callback);
    };

    /**
     * 报名时间验证函数
     */
    applyValidate = (rule, value, callback) => {
        this.complexSetValues("applyTime");
        const [applyStart, applyEnd] = value || [];
        // this.setValues(pick(resetObj, [ "wareParms", "actTime"]));
        if (applyStart) {
            // 判断开始和结束时间是否超过30天
            if (applyEnd.diff(applyStart, "days", true) > 30) {
                callback("报名周期不超过30天");
            }

            const { actTaskId: { startTime: taskStart, endTime: taskEnd } = {} } = cloneDeep(this.getValue());
            if (!taskStart) {
                callback("请选择任务");
            } else if (isBefore(applyStart, taskStart, "day") || isBefore(taskEnd, applyEnd)) {
                callback(`报名起止时间应该在任务开始时间范围内${moment(taskStart).format(format)}~${moment(taskEnd).format(format)}`);
            }
        }
        callback();
    };

    // 任务时间测试数据为 startTime: 1569340800000 endTime: 1569599999000
    disApplyTime = current => {
        const { actTaskId: { startTime, endTime } = {} } = this.getValue();
        const normalRule = current && current < moment().endOf("day");

        if (startTime && endTime) {
            if (isBefore(endTime, moment())) {
                return normalRule;
            }
            return current < moment(startTime).startOf("day") || normalRule || current > moment(endTime).endOf("day");
        }
        return normalRule;
    };

    disActTime = current => {
        const { applyTime: [applyStart, applyEnd] = [], actTaskId: { endTime } = {} } = this.getValue();
        const normalRule = current && current < moment().endOf("day");
        if (applyStart && applyEnd) {
            return (current && current <= moment(applyEnd).endOf("day")) || current > moment(endTime).endOf("day");
        }

        return normalRule;
    };

    actTimeValidate = (rule, value, callback) => {
        this.complexSetValues("actTime");
        if (value) {
            this.setState({
                // cycleArr: getDiffDays(value),
            });

            if (value[1].diff(value[0], "days", true) > 100) callback("活动时间不超过100天");

            // eslint-disable-next-line no-unused-vars
            const [actStart, actEnd] = value;
            const [applyStart, applyEnd] = this.getFromField("applyTime") || [];
            if (!applyStart || !applyEnd) {
                callback("请先设置报名起止时间");
            }
            if (!isBefore(applyEnd, actStart)) callback(`活动开始时间应该大于报名截止时间${getStrDate(applyEnd)}`);

            const { startTime: taskStart, endTime: taskEnd } = this.getFromField("actTaskId");
            if (!taskStart || !taskEnd) callback("请先选择任务");
            if (isBefore(value[0], taskStart) || isBefore(taskEnd, value[1])) {
                callback(`活动起止时间应该在任务时间内 ${getStrDate(taskStart)}~${getStrDate(taskEnd)}`);
            }
        }
        callback();
    };

    validRewLimit = (rule, value, callback) => {
        const {
            form: { validateFields },
        } = this.props;
        const fieldArr = ["individual", ...genRewTypeVal(this.getValue())];
        validateFields(fieldArr, error => {
            if (error) {
                callback("请正确设置各级别奖励");
            } else {
                const rewardArr = this.jointReward();
                const taskReward = rewardArr.reduce((total = 0, { y }) => total + y, 0);
                const { buget } = this.state;
                if (value < taskReward) callback(`所设奖励上限不能小于各奖励之和~${taskReward}`);
                if (buget === 0) callback("当前已无剩余预算");
                if (value > buget) callback(`所设奖励上限不能超过剩余预算~${buget}`);
            }
        });

        callback();
    };

    getValue = () => {
        const { getFieldsValue } = form;
        return getFieldsValue();
    };

    getFromField = field => {
        const { getFieldValue } = form;
        return getFieldValue(field);
    };

    setValues = fieldsValus => {
        const { setFieldsValue } = form;
        setFieldsValue(fieldsValus);
    };

    complexSetValues = field => {
        const { setFieldsValue } = form;
        if (isNormalValid && resetMap[field]) {
            setFieldsValue(resetMap[field]);
        }
    };

    callModel = (type, data, callback) => {
        dispatch({
            type: `pullSale/${type}`,
            payload: data,
            callback,
        });
    };

    doSave = (method, data, type) => {
        this.setState({ loading: true });
        dispatch({
            type: `pullSale/${method}`,
            payload: data,
            callback: ({ type: msgType = "success", msg = "保存成功" } = {}) => {
                this.setState({ loading: false });
                if (msgType === "success") {
                    const sucMsg = type === "offical" ? "提交成功，请等待运营人员进行审核" : msg;
                    success({ content: sucMsg }, this.goBack);
                } else {
                    err(msg);
                }
                this.isSave = true;
            },
        });
    };

    getRowData = field => {
        const { rowData } = this.state;
        return rowData[field];
    };

    genAlert = () => {
        const { pageType } = this.state;
        const pageTypes = ["add", "edit"];
        const msg = "任务、时间、商品有关联关系,任意的重选会导致相关商品清空，请谨慎选择";
        return pageTypes.includes(pageType) ? renderAlert(msg) : "";
    };

    isBtnShow = () => {
        const {
            rowData: { status },
        } = this.state;
        return !status || [1, 4, 6].includes(status);
    };

    handlePrompt = location => {
        const { pageType } = this.state;
        const arr = ["add", "edit"];
        const showPrompt = !pageType || arr.includes(pageType);
        if (!this.isSave && showPrompt) {
            this.showConfirm(location);
            return false;
        }
        return true;
    };

    showConfirm = location => {
        Modal.confirm({
            title: "是否保存",
            content: "当前尚有未保存的活动信息，是否需要保存草稿",
            okText: "确认",
            cancelText: "取消",
            onOk: () => {
                // 执行保存
                this.onSave("draft")();
            },
            onCancel: () => {
                this.isSave = true;
                setTimeout(() => router.push({ pathname: location.pathname }), 0);
            },
        });
    };

    goBack = () => {
        router.push({
            pathname: "../list",
            query: {},
        });
    };

    getFlowState = () => {
        const {
            location: {
                query: { pageType },
            },
        } = this.props;
        // 审核状态下显示
        const showCheck = ["check"].includes(pageType);

        // 审核查看状态下显示审核信息
        const showCheckList = ["view", "check"].includes(pageType);

        // 新增编辑提交按钮，查看和审核的时候不可用，也不可编辑
        const hideSubmit = showCheckList;
        return { hideSubmit, showCheck, showCheckList };
    };

    getRewardClass = () => classnames({ [styles.hide]: isGy });

    jointId = () => {
        const {
            rowData: { actId },
        } = this.state;
        return actId ? { actId } : {};
    };

    jointActGroupParam = () => {
        const { actGroup } = this.getValue();
        if (Array.isArray(actGroup) && actGroup.length) {
            const { groupCode: actGroupCode } = actGroup[0];
            return { actGroupCode };
        }

        return {};
    };

    render() {
        const {
            form: { getFieldDecorator },
            location,
            location: {
                query: { id },
            },
        } = this.props;
        const { venderId: { key: venderId } = {}, actTaskId: { key: actTaskId } = {}, actTime, applyTime } = this.getValue();
        const [actStartTime, actEndTime] = getTime(actTime) || [];
        const { loading, goodList } = this.state;
        const goodsParams = {
            venderId,
            type: 3,
            actStartTime,
            actEndTime,
            ...this.jointId(),
            ...this.jointActGroupParam(),
        };
        const isBtnShow = this.isBtnShow();

        const { hideSubmit, showCheck, showCheckList } = this.getFlowState();

        return (
            <div className = {styles["pull-sale"]}>
                <Prompt message = {this.handlePrompt} />
                <Header title = "动销活动" />
                <Loading spinning = {loading}>
                    <div className = {styles.container}>
                        <div className = {styles.prompt}>{this.genAlert()}</div>
                        <Form {...singleColRow}>
                            <Form.Item label = "选择药企">
                                {getFieldDecorator("venderId", {
                                    initialValue: this.getRowData("venderId") || { key: "", label: "" },
                                    rules: [{ validator: this.validFac }],
                                })(
                                    <FuzzySearch
                                        url = {`${urlPrefix}vender/factory/list`}
                                        resParam = {resParam}
                                        searchFields = {facFields}
                                        notFoundContent = "未查询到您要搜索的内容，请搜索其他关键词试试"
                                        disabled = {hideSubmit}
                                    />
                                )}
                            </Form.Item>
                            {/* extra = {!venderId && '请先选择药企' || ''} */}
                            <Form.Item label = "关联任务" extra = {(!venderId && "请先选择药企信息后再来选择任务") || ""}>
                                {getFieldDecorator("actTaskId", {
                                    initialValue: this.getRowData("actTaskId") || { key: "", label: "" },
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择任务",
                                        },
                                        {
                                            validator: this.validTask,
                                        },
                                    ],
                                })(
                                    <FuzzySearch
                                        url = {`${urlPrefix}act/task/queryList`}
                                        resParam = {taskPram}
                                        searchFields = {genSearchField({
                                            value: venderId,
                                        })}
                                        notFoundContent = "系统没有找到当前药企下在有效期内的任何任务，请先创建任务哦"
                                        disabled = {hideSubmit || !venderId}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "设置活动组">
                                {getFieldDecorator("actGroup", {
                                    initialValue: [],
                                    rules: [{ validator: this.validActGroup }],
                                })(
                                    <ModalList
                                        renderSearch = {param => <ActGroupSearch {...{ ...param, dispatch }} />}
                                        url = {`${urlPrefix}act/group/queryList`}
                                        columns = {groupCols}
                                        promptMsg = "请先选择药企信息后再来选择商品"
                                        rowKey = "groupId"
                                        disabled = {hideSubmit}
                                        checkType = "radio"
                                        size = "small"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "活动名称">
                                {getFieldDecorator("name", {
                                    initialValue: this.getRowData("name") || undefined,
                                    rules: [{ required: true, message: "请输入活动名称" }],
                                })(<Input placeholder = "不超过40个字符" disabled = {hideSubmit} />)}
                            </Form.Item>
                            {/* extra = {!actTaskId ? '请先选择任务' : ''}  使用help后callback不提示错误信息 */}
                            <Form.Item label = "报名起止时间" extra = {!actTaskId ? "请先选择任务" : ""}>
                                {getFieldDecorator("applyTime", {
                                    initialValue: this.getRowData("applyTime") || undefined,
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择报名起止时间",
                                        },
                                        {
                                            validator: this.applyValidate,
                                        },
                                    ],
                                })(<RangePicker className = {styles["fill-width"]} disabledDate = {this.disApplyTime} format = "YYYY-MM-DD" disabled = {hideSubmit || !actTaskId} />)}
                            </Form.Item>
                            <Form.Item label = "活动起止时间">
                                {getFieldDecorator("actTime", {
                                    initialValue: this.getRowData("actTime") || undefined,
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择活动起止时间",
                                        },
                                        {
                                            validator: this.actTimeValidate,
                                        },
                                    ],
                                })(<RangePicker className = {styles["fill-width"]} disabled = {hideSubmit || !applyTime} disabledDate = {this.disActTime} format = "YYYY-MM-DD" />)}
                            </Form.Item>
                            <Form.Item label = "活动商品">
                                {getFieldDecorator("wareParms", {
                                    initialValue: goodList || undefined,
                                    // initialValue: this.getRowData('wareParms') || undefined,
                                    rules: [
                                        {
                                            required: true,
                                            message: " ",
                                        },
                                        { validator: validGoods },
                                    ],
                                })(
                                    <ModalList
                                        renderSearch = {param => <GoodsSearch {...param} />}
                                        url = {`${urlPrefix}activity/sku/getWare`}
                                        columns = {goodsCol}
                                        otherParam = {goodsParams}
                                        // disabled = {!venderId || !actTime}
                                        disabled = {hideSubmit || !actTime}
                                        rowKey = "factorySkuId"
                                    />
                                )}
                            </Form.Item>
                            <div className = {this.getRewardClass()}>
                                <Form.Item label = "设置活动奖励">
                                    {getFieldDecorator("rewardCycle", {
                                        initialValue: this.getRowData("rewardCycle") || undefined,
                                        rules: [{ required: true, message: "请设置活动奖励" }],
                                    })(
                                        <BtnGroup
                                            textArr = {[
                                                {
                                                    text: "按最小包装单位立即返",
                                                    value: 1,
                                                },
                                                {
                                                    text: "按最小包装单位统一返",
                                                    value: 2,
                                                },
                                            ]}
                                            disabled = {hideSubmit}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label = "对个体" wrapperCol = {{ span: 12 }}>
                                    {getFieldDecorator("individual", {
                                        initialValue: this.getRowData("individual") || initPer,
                                        rules: [
                                            {
                                                required: true,
                                                message: `${requiredMsg.individual}`,
                                            },
                                            { validator: validPerson },
                                        ],
                                    })(
                                        <EditTable
                                            columns = {personCols}
                                            emptyRow = {emptyPerRow}
                                            limit = {5}
                                            disabled = {hideSubmit}
                                            // keyField = "individual"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label = "对单体门店">
                                    {getFieldDecorator("monomer", {
                                        initialValue: this.getRowData("monomer") || [genEmptyRow("monomer")],
                                        rules: [
                                            {
                                                required: false,
                                                message: `${requiredMsg.monomer}`,
                                            },
                                            { validator: validCom },
                                        ],
                                    })(<EditTable columns = {commonCols} emptyRow = {genEmptyRow("monomer")} limit = {5} disabled = {hideSubmit} />)}
                                </Form.Item>
                                <Form.Item label = "对连锁总部">
                                    {getFieldDecorator("hq", {
                                        initialValue: this.getRowData("hq") || [genEmptyRow("hq")],
                                        rules: [
                                            {
                                                required: false,
                                                message: `${requiredMsg.hq}`,
                                            },
                                            { validator: validCom },
                                        ],
                                    })(
                                        <EditTable
                                            columns = {commonCols}
                                            emptyRow = {genEmptyRow("hq")}
                                            // validate = {this.validate}
                                            limit = {5}
                                            disabled = {hideSubmit}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label = "对连锁分公司">
                                    {getFieldDecorator("branch", {
                                        initialValue: this.getRowData("branch") || [genEmptyRow("branch")],
                                        rules: [
                                            {
                                                required: false,
                                                message: `${requiredMsg.branch}`,
                                            },
                                            { validator: validCom },
                                        ],
                                    })(
                                        <EditTable
                                            columns = {commonCols}
                                            emptyRow = {genEmptyRow("branch")}
                                            // validate = {this.validate}
                                            limit = {5}
                                            disabled = {hideSubmit}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label = "对连锁门店">
                                    {getFieldDecorator("chainStore", {
                                        initialValue: this.getRowData("chainStore") || [genEmptyRow("chainStore")],
                                        rules: [
                                            {
                                                required: false,
                                                message: `${requiredMsg.chainStore}`,
                                            },
                                            { validator: validCom },
                                        ],
                                    })(
                                        <EditTable
                                            columns = {commonCols}
                                            emptyRow = {genEmptyRow("chainStore")}
                                            // validate = {this.validate}
                                            limit = {5}
                                            disabled = {hideSubmit}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label = "非盈利性医疗机构">
                                    {getFieldDecorator("nonProfitMedical", {
                                        initialValue: this.getRowData("nonProfitMedical") || [genEmptyRow("nonProfitMedical")],
                                        rules: [
                                            {
                                                required: false,
                                                message: `${requiredMsg.nonProfitMedical}`,
                                            },
                                            { validator: validCom },
                                        ],
                                    })(
                                        <EditTable
                                            columns = {commonCols}
                                            emptyRow = {genEmptyRow("nonProfitMedical")}
                                            // validate = {this.validate}
                                            limit = {5}
                                            disabled = {hideSubmit}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label = "盈利性医疗机构">
                                    {getFieldDecorator("profitMedical", {
                                        initialValue: this.getRowData("profitMedical") || [genEmptyRow("profitMedical")],
                                        rules: [
                                            {
                                                required: false,
                                                message: `${requiredMsg.profitMedical}`,
                                            },
                                            { validator: validCom },
                                        ],
                                    })(
                                        <EditTable
                                            columns = {commonCols}
                                            emptyRow = {genEmptyRow("profitMedical")}
                                            // validate = {this.validate}
                                            limit = {5}
                                            disabled = {hideSubmit}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label = "奖励上限" extra = {!actTaskId ? "请先设置任务" : ""}>
                                    {getFieldDecorator("budget", {
                                        initialValue: this.getRowData("budget") || undefined,
                                        rules: [
                                            {
                                                required: true,
                                                message: "请选择奖励上限",
                                            },
                                            {
                                                pattern: /^[1-9][0-9]{0,7}$/,
                                                message: "奖励上限不超过99999999",
                                            },
                                            { validator: this.validRewLimit },
                                        ],
                                    })(<InputNumber disabled = {hideSubmit || !actTaskId} min = {1} step = {1} className = {styles["fill-width"]} />)}
                                </Form.Item>
                            </div>
                            {/* <Form.Item label = "设置活动奖励">
                                {getFieldDecorator("rewardCycle", {
                                    initialValue: this.getRowData("rewardCycle") || undefined,
                                    rules: [{ required: true, message: "请设置活动奖励" }],
                                })(
                                    <BtnGroup
                                        textArr = {[
                                            {
                                                text: "按最小包装单位立即返",
                                                value: 1,
                                            },
                                            {
                                                text: "按最小包装单位统一返",
                                                value: 2,
                                            },
                                        ]}
                                        disabled = {hideSubmit}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "对个体" wrapperCol = {{ span: 12 }}>
                                {getFieldDecorator("individual", {
                                    initialValue: this.getRowData("individual") || initPer,
                                    rules: [
                                        {
                                            required: true,
                                            message: `${requiredMsg.individual}`,
                                        },
                                        { validator: validPerson },
                                    ],
                                })(
                                    <EditTable
                                        columns = {personCols}
                                        emptyRow = {emptyPerRow}
                                        limit = {5}
                                        disabled = {hideSubmit}
                                        // keyField = "individual"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "对单体门店">
                                {getFieldDecorator("monomer", {
                                    initialValue: this.getRowData("monomer") || [genEmptyRow("monomer")],
                                    rules: [
                                        {
                                            required: false,
                                            message: `${requiredMsg.monomer}`,
                                        },
                                        { validator: validCom },
                                    ],
                                })(<EditTable columns = {commonCols} emptyRow = {genEmptyRow("monomer")} limit = {5} disabled = {hideSubmit} />)}
                            </Form.Item>
                            <Form.Item label = "对连锁总部">
                                {getFieldDecorator("hq", {
                                    initialValue: this.getRowData("hq") || [genEmptyRow("hq")],
                                    rules: [
                                        {
                                            required: false,
                                            message: `${requiredMsg.hq}`,
                                        },
                                        { validator: validCom },
                                    ],
                                })(
                                    <EditTable
                                        columns = {commonCols}
                                        emptyRow = {genEmptyRow("hq")}
                                        // validate = {this.validate}
                                        limit = {5}
                                        disabled = {hideSubmit}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "对连锁分公司">
                                {getFieldDecorator("branch", {
                                    initialValue: this.getRowData("branch") || [genEmptyRow("branch")],
                                    rules: [
                                        {
                                            required: false,
                                            message: `${requiredMsg.branch}`,
                                        },
                                        { validator: validCom },
                                    ],
                                })(
                                    <EditTable
                                        columns = {commonCols}
                                        emptyRow = {genEmptyRow("branch")}
                                        // validate = {this.validate}
                                        limit = {5}
                                        disabled = {hideSubmit}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "对连锁门店">
                                {getFieldDecorator("chainStore", {
                                    initialValue: this.getRowData("chainStore") || [genEmptyRow("chainStore")],
                                    rules: [
                                        {
                                            required: false,
                                            message: `${requiredMsg.chainStore}`,
                                        },
                                        { validator: validCom },
                                    ],
                                })(
                                    <EditTable
                                        columns = {commonCols}
                                        emptyRow = {genEmptyRow("chainStore")}
                                        // validate = {this.validate}
                                        limit = {5}
                                        disabled = {hideSubmit}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "奖励上限" extra = {!actTaskId ? "请先设置任务" : ""}>
                                {getFieldDecorator("budget", {
                                    initialValue: this.getRowData("budget") || undefined,
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择奖励上限",
                                        },
                                        {
                                            pattern: /^[1-9][0-9]{0,7}$/,
                                            message: "奖励上限不超过99999999",
                                        },
                                        { validator: this.validRewLimit },
                                    ],
                                })(<InputNumber disabled = {hideSubmit || !actTaskId} min = {1} step = {1} className = {styles["fill-width"]} />)}
                            </Form.Item> */}
                            <Form.Item label = "报名上限">
                                {getFieldDecorator("applyNum", {
                                    initialValue: this.getRowData("applyNum") || undefined,
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择报名上限",
                                        },
                                        {
                                            pattern: /^[1-9][0-9]{0,7}$/,
                                            message: "报名上限人数不超过99999999",
                                        },
                                    ],
                                })(<InputNumber disabled = {hideSubmit} min = {1} step = {1} className = {styles["fill-width"]} />)}
                            </Form.Item>
                            <Form.Item label = "设置活动图片" extra = "图片大小应为 690*392">
                                {getFieldDecorator("actMovePinFileVOList", {
                                    initialValue:
                                        this.getRowData("actMovePinFileVOList") ||
                                        [
                                            /* {
                                            uid: "-1",
                                            name: "image.png",
                                            // type: 1,
                                            status: "done",
                                            url:
                                                "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
                                        }, */
                                        ],
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择活动图片",
                                        },
                                    ],
                                })(
                                    <UploadClip
                                        url = "/api/be/upload/img"
                                        name = "imgFile"
                                        data = {{ imageEnum: "LOGO" }}
                                        multiple
                                        limitSize = {5} // 单位为M
                                        limitNum = {6}
                                        showRemoveIcon
                                        showPreviewIcon
                                        disabled = {hideSubmit}
                                        limitPixel = {{ width: 690, height: 392 }}
                                        // limitPixel = {{ width: 345, height: 196 }}
                                        // ratio = {2}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "活动说明">
                                {getFieldDecorator("description", {
                                    initialValue: this.getRowData("description") || undefined,
                                    rules: actDes,
                                })(<YaoTextArea showCount maxLength = {2000} disabled = {hideSubmit} rows = {4} placeholder = "请输入100到2000个字符" />)}
                            </Form.Item>
                        </Form>
                        {hideSubmit ? (
                            ""
                        ) : (
                            <div className = {styles["btn-container"]}>
                                <Button type = "primary" onClick = {this.onSave("draft")} disabled = {!isBtnShow}>
                                    保存草稿
                                </Button>
                                <Button type = "primary" onClick = {this.onSave("offical")} disabled = {!isBtnShow}>
                                    创建完成提交审核
                                </Button>
                            </div>
                        )}
                    </div>
                </Loading>
                {showCheck ? <ActivityCheck location = {location} /> : null}
                {showCheckList ? <CheckRecordTable actId = {id} /> : null}
            </div>
        );
    }
}

export default Form.create()(PullSaleCreate);
