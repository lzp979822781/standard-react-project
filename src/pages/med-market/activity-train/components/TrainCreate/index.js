/* eslint-disable prefer-destructuring */
import React, { Component } from "react";
import { connect } from "dva";
import router from "umi/router";
import moment from "moment";
import omit from "lodash/omit";
import pick from "lodash/pick";
import cloneDeep from "lodash/cloneDeep";
import { Prompt } from "react-router-dom";
import { Form, Input, Button, InputNumber, Radio, DatePicker, Select, Modal } from "antd";

import { singleColRow, UUID, success, err as error, renderAlert, urlPrefix, isGy } from "@/utils/utils";
import {
    groupCols,
    genSearchField,
    taskPram,
    goodsList,
    goodsCol,
    // validContent,
    rewardInit,
    validReward,
    // goodsFile,
    validConCahe,
    getDiffDays,
    // goodsRealList,
    // initContent,
    genNewContent, // 产生京采说、用心看新内容
    initLookContent,
    // lookGoodList,
    lookRewardInit,
    isBefore,
    getStrDate,
    getTime,
    transContent,
    transArticle,
    handleRow,
    handleLookRow,
    ruleValidQua,
    isLengthEqOne,
    genTextArr,
    qualityTitleArr,
    totalTitleArr,
    readArr,
    isQuaqtityFit,
    getReChecked,
    validLookWhole,
    validGroup,
    loolConField,
    // isObtCHComma,
    isBeyondLimit,
    isLoolEQOne,
    isLkConEqual,
    lookConValid,
    validMinRewGTArts,
    resetObj,
} from "./validate";

import FuzzySearch from "@/components/FuzzySearch";
import { ModalList } from "@/components/complex-form";
import ActGroupSearch from "../ActGroupSearch";
import GoodsSearch from "../GoodsSearch";
import TrainContent from "../TrainContent/cache";
// import PictureList from "../PictureList";
import UploadClip from "@/components/UploadClip";
import Articles from "../Articles";
import LookReward from "../LookReward";

import styles from "./index.less";
import Reward from "../Reward";
import { Loading } from "@/components/complex-table";
import Header from "@/components/Header";
import YaoTextArea from "@/components/YaoTextArea";
import CheckRecordTable from "@/pages/med-market/activity/display-create/CheckRecordTable";
import ActivityCheck from "@/pages/med-market/activity/activity-check";

const { RangePicker } = DatePicker;

const resParam = {
    value: "venderId",
    text: "companyName",
};

const { Option } = Select;
const facFields = { searchField: "companyName" };

// const format = "YYYY-MM-DD";

let form;

let isNormalValid = true;

const resetMap = {
    venderId: pick(resetObj, ["actTaskId", "actTime", "skuList", "budget", "cycleNum"]),
    actTaskId: pick(resetObj, ["actTime", "skuList", "budget", "cycleNum"]),
    actGroup: pick(resetObj, ["skuList"]),
    actTime: pick(resetObj, ["skuList", "cycleNum"]),
};

let dispatch;
@connect(({ actGroupMag, loading }) => ({
    ...actGroupMag,
    loading: loading["actGroupMag/saveData"],
}))
class TrainCreate extends Component {
    constructor(props) {
        super(props);
        dispatch = props.dispatch;
        ({ form } = props);
        this.state = {
            rewardQuality: undefined,
            rewardNum: undefined,
            cycleArr: [],
            // goodsArr: initContent(goodsRealList),
            goodsArr: undefined,
            type: 5,
            // ifReward: 1,
            buget: undefined,
            pageType: "add",
            loading: false,
            rowData: { status: 1 },
            wholeDisabled: true,
            totalWholeDis: false,
            readDis: false,
        };
    }

    componentDidMount() {
        this.getUrlParam();
        window.onbeforeunload = this.closeBrowser;
    }

    componentWillUnmount() {
        window.onbeforeunload = null;
    }

    closeBrowser = event => {
        const e = event || window.event;

        const msg = "当前尚有未保存的活动信息，是否需要保存草稿";
        if (e) {
            e.returnValue = msg;
        }

        return msg;
    };

    getUrlParam = () => {
        // 京采说id 72 用心看78
        const {
            location: {
                query: { id, pageType = "add", type },
            },
        } = this.props;
        this.setState({ id, pageType, type: type ? parseInt(type, 10) : 4 }, () => {
            if (pageType !== "add" || id) {
                this.setState({ loading: true });
                this.queryRow();
            }
        });
    };

    queryRow = () => {
        const { id } = this.state;
        const { type = 4 } = this.getValue();
        this.callModel("queryDetail", { id, type }, ({ data }) => {
            this.setState({ loading: false });
            const { rewardNum, rewardQuality } = data || {};
            if (data) {
                const newData = type === 4 ? handleRow(cloneDeep(data)) : handleLookRow(data);
                console.log("newData", newData);
                setTimeout(() => {
                    this.setEditVal(newData);
                }, 0);
                this.setState({ rowData: newData, rewardNum, rewardQuality });
                this.getTask(data);
                // 获取活动组
                this.getGroup(data);
            }
        });
    };

    setEditVal = newData => {
        const { setFieldsValue } = form;
        const { skuList, actTime, trainContent, lookContent } = newData;
        if (Array.isArray(skuList) && skuList.length) {
            setFieldsValue({ skuList });
        }
        this.setRewardState(trainContent);
        this.setCycle(actTime);
        this.setLookReward(lookContent);
        this.setLookValue(newData);
    };

    setLookValue = newData => {
        const { type } = this.state;
        if (type === 4) return;
        const { ifReward } = newData;
        this.setValue("ifReward", ifReward);
    };

    setCycle = value => {
        this.setState({
            cycleArr: getDiffDays(value),
        });
    };

    /**
     * 获取任务回显值全量数据
     */
    /* getTask = rowData => {
        const { actTaskId } = rowData || {};
        if (actTaskId) {
            this.callModel("queryTask", { id: actTaskId }, ({ data }) => {
                const { id, taskName } = data || {};
                // this.setState({ taskVal: { key: id, label: taskName, ...data } });
                const {
                    form: { setFieldsValue },
                } = this.props;
                if (id) {
                    setFieldsValue({
                        actTaskId: { key: id, label: taskName, ...data },
                    });
                }
            });
        }
    }; */

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
    onSave = type => () => {
        const { validateFieldsAndScroll } = form;
        isNormalValid = false;
        // const isDraft = type === "draft";
        validateFieldsAndScroll((err, values) => {
            const {
                pageType,
                rowData: { status = 1, actId },
            } = this.state;
            isNormalValid = true;
            // 获取商品相关数据
            const saveVal = this.transValue(cloneDeep(values));
            if (!err) {
                this.callModel("save", { ...saveVal, pageType, status, actId, ...this.transStatus(type) }, this.saveCallback(type));
            }

            console.log("saveVal", { ...saveVal, pageType, status, actId, ...this.transStatus(type) });
        });
    };

    saveCallback = btnType => ({ type, msg } = {}) => {
        this.setState({ loading: false });
        if (type === "success") {
            const sucMsg = btnType === "offical" ? "提交成功，请等待运营人员进行审核" : msg;
            this.isSave = true;
            success({ content: sucMsg }, this.goBack);
        } else {
            error(msg);
        }
    };

    transStatus = btnType => ({ status: btnType === "draft" ? 1 : 2 });

    transValue = values => {
        const { type } = values;
        let res = {};
        const otherVal = omit(values, ["reward", "skuList", "trainContent", "actTime", "venderId", "actTaskId", "imgList", "lookContent", "trainingRuleList", "actGroup"]);
        res = Object.assign({}, this.transDate(), this.getFuzzyData(["venderId", "actTaskId"]), this.transFile(), type === 4 ? this.compatSku() : this.compatLookSku(), this.transGroup(), otherVal);

        return res;
    };

    transGroup = () => {
        const { actGroup } = this.getValue();
        if (Array.isArray(actGroup) && actGroup.length) {
            const { groupId: actGroupId, groupCode: actGroupCode } = actGroup[0];
            return { actGroupId, actGroupCode };
        }

        return { actGroupId: undefined, actGroupCode: undefined };
    };

    compatSku = () => {
        const { skuList } = this.getValue();
        return Array.isArray(skuList) && skuList.length ? { ...this.transReward(), ...this.transSayGoods() } : {};
    };

    /**
     * 日期范围转换为日期字符串数组
     * @returns [string, string]
     */
    transDate = () => {
        const { actTime } = this.getValue();
        const [actStartTime, actEndTime] = getTime(actTime) || [];
        return { actStartTime, actEndTime };
    };

    /**
     * 返回模糊搜索字段的值 原始值格式为{ key: '', value: ''}
     * @returns {[field]: key}
     */
    getFuzzyData = fieldArr => {
        const values = this.getValue();
        const res = fieldArr.map(field => {
            const {
                [field]: { key },
            } = values;
            return {
                [field]: (key && Number(key)) || undefined,
            };
        });
        return Object.assign({}, ...res);
    };

    /**
     * 获取奖励按质量rewardQuality、奖励按次数rewardNum、奖励具体规则
     */
    transReward = () => {
        const {
            reward: { rewardQuality, rewardNum },
            reward,
        } = this.getValue();
        const rewardObj = this.jointRewardRule(reward);
        return Object.assign({}, { rewardQuality, rewardNum }, rewardObj);
    };

    jointRewardRule = reward => {
        // const flatArr = Object.keys(otherReward).reduce((total, key) => total.concat(otherReward[key]), []);
        const flatArr = getReChecked(reward);
        // 过滤有值数组
        const res = flatArr.filter(({ x, y } = {}) => x || y);
        return { ruleList: res };
    };

    /**
     * 将商品和内容组合到一起
     */
    transSayGoods = () => {
        const { trainContent, skuList } = this.getValue();
        if (Array.isArray(skuList) && skuList.length) {
            const filterContent = trainContent.map(item => {
                const { contentList, ...otherItem } = item;
                return Object.assign({}, { contentList: transContent(contentList) }, otherItem);
            });
            return { skuList: filterContent };
        }
        return { skuList: undefined };
    };

    /**
     * 获取用心看内容列表
     */
    compatLookSku = () => Object.assign({}, this.transLookGoods(), this.transLookRule());

    transLookGoods = () => {
        const { lookContent } = this.getValue();
        if (Array.isArray(lookContent) && lookContent.length) {
            const lookSkus = lookContent.map(({ contentList, ...otherData }) => ({
                ...transArticle(contentList),
                ...otherData,
            }));

            return { skuList: lookSkus };
        }

        return { skuList: undefined };
    };

    transLookRule = () => {
        const { ifReward, trainingRuleList: { rewardCycle, readSingle, readWhole } = {} } = this.getValue();

        if (ifReward) {
            const lookChecked = (rewardCycle && (rewardCycle === 1 ? readSingle : readWhole)) || [];
            const res = lookChecked.filter(({ x, y }) => x || y);
            return Object.assign({}, { rewardCycle, ruleList: res });
        }
        return { ruleList: undefined, rewardCycle };
    };

    transFile = () => {
        const { imgList } = this.getValue();
        if (Array.isArray(imgList)) {
            const res = imgList.map((item, index) => {
                const { name, response: { data: filePath } = {}, path } = item;
                return { name, path: path || filePath, sort: index };
            });
            return { imgList: res };
        }
        return { imgList: undefined };
    };

    validType = (rule, value, callback) => {
        this.setState({ type: value });
        // 判断名称是否唯一
        callback();
    };

    /**
     * 药企校验
     */
    factoryValidate = (rule, value, callback) => {
        const { key } = value;
        if (!key) callback("请选择药企");
        this.complexSetValues("venderId");
        // this.setValues(pick(resetObj, ["actTaskId", "actTime", "skuList", "budget", "cycleNum"]));
        this.setState({ cycleArr: [] });
        // 判断名称是否唯一
        callback();
    };

    /**
     * 任务校验
     */
    taskValidate = async (rule, value, callback) => {
        // console.log("任务 rule value", rule, value);
        // 判断名称是否唯一
        const { key, endTime } = value || {};
        this.setState({ cycleArr: [] });
        this.complexSetValues("actTaskId");
        // this.setValues(pick(resetObj, ["actTime", "skuList", "budget", "cycleNum"]));
        if (!key) {
            callback("请选择任务");
        } else {
            setTimeout(() => this.queryBudget(), 0);
            // 当前任务结束时间小于当天
            if (isBefore(endTime, moment(), "day")) callback("当前任务已结束");
        }

        callback();
    };

    validActGroup = (rule, value, callback) => {
        // this.setValues(pick(resetObj, ["skuList"]));
        this.complexSetValues("actGroup");
        validGroup(rule, value, callback);
    };

    /**
     * 获取任务回显值全量数据
     */
    getTask = rowData => {
        const { actTaskId } = rowData || {};
        const { pageType } = this.state;
        if (actTaskId) {
            this.callModel("queryTask", { id: actTaskId }, ({ data }) => {
                const { id, taskName } = data || {};
                // this.setState({ taskVal: { key: id, label: taskName, ...data } });
                const {
                    form: { setFieldsValue },
                } = this.props;
                if (id) {
                    setFieldsValue({
                        actTaskId: { key: id, label: taskName, ...data },
                    });
                    if (["add", "edit"].includes(pageType)) {
                        setTimeout(() => this.queryBudget(), 0);
                    }
                }
            });
        }
    };

    /**
     * 活动时间校验
     */
    actTimeValidate = (rule, value, callback) => {
        // this.setValues(pick(resetObj, ["skuList", "cycleNum"]));
        this.complexSetValues("actTime");
        if (value) {
            this.setState({
                cycleArr: getDiffDays(value),
            });

            if (value[1].diff(value[0], "days", true) > 100) callback("活动时间不超过100天");

            // eslint-disable-next-line no-unused-vars
            const [actStart, actEnd] = value;
            const { startTime: taskStart, endTime: taskEnd } = this.getFromField("actTaskId");
            if (!taskStart || !taskEnd) callback("请先选择任务");
            if (isBefore(taskEnd, value[1])) {
                callback("该任务已过期");
            }
            if (isBefore(value[0], taskStart, "day") || isBefore(taskEnd, value[1], "day")) {
                callback(`活动起止时间应该在任务时间内 ${getStrDate(taskStart)}~${getStrDate(taskEnd)}`);
            }
        } else {
            this.setState({ cycleArr: [] });
            callback("请设置活动时间");
        }
        callback();
    };

    /**
     * 校验京采说奖励是每商品整体按钮的禁用状态
     */
    validSayCon = (rule, value, callback) => {
        this.setRewardState(value);
        validConCahe(rule, value, callback);
    };

    setRewardState = data => {
        if (Array.isArray(data) && data.length) {
            // 检查所有商品下是不是只有一个句子
            this.setState({
                wholeDisabled: isLengthEqOne(data),
                totalWholeDis: !isQuaqtityFit(data),
            });
        }
    };

    /**
     * 奖励校验
     */
    validRew = (rule, value, callback) => {
        const { rewardQuality, rewardNum } = value;
        this.setState({ rewardQuality, rewardNum });
        validReward(rule, value, callback);
        this.validReTotal(rule, value, callback);
        callback();
    };

    /**
     * 如果选择的是按累积次数每商品整体，则检验每商品的句子数量是否一致
     */
    validReTotal = (rule, value, callback) => {
        const { rewardNum } = value;
        const trainContent = this.getFromField("trainContent");
        if (rewardNum && rewardNum === 2 && !isQuaqtityFit(trainContent)) {
            callback("奖励规则:累积次数每商品整体 对应的多个活动商品下的京采说句子数量不一致不能选择");
        }
    };

    validPics = (rule, value, callback) => {
        if (!value && !value.length) callback("请选择活动图片");
        callback();
    };

    validFreq = (rule, value, callback) => {
        callback();
    };

    /* getValue = field => {
        const { validateFields } = form;
        validateFields([field], (err, venderVal) => {
            const { [field]: resVal } = venderVal;
            const hasErr = err || !resVal;
            return { hasErr, value: resVal };
        });
    }; */

    genGoodInitVal = () => {
        let res = {};
        goodsList.map(item => {
            const { id } = item;
            res = Object.assign(res, {
                [id]: [{ key: UUID(), train: undefined }],
            });
            return item;
        });
        return res;
    };

    /**
     * 商品选择完后的回调数
     */
    validGoods = (rule, value, callback) => {
        if (!value) {
            callback("请选择活动商品");
        } else {
            // 获取设置内容
            this.setContent(value);
        }
        callback();
    };

    setContent = skuVal => {
        const { setFieldsValue } = form;
        const { type } = this.state;
        const field = type === 4 ? "trainContent" : "lookContent";
        const { [field]: content } = this.getValue();
        // 过滤当前内容中商品与重新选择商品后重合的项
        const newContent = genNewContent(content || [], skuVal, type);
        setTimeout(() => {
            setFieldsValue({ [field]: newContent });
        }, 0);
    };

    /**
     * 考核周期相关
     */
    renderCycle = () => {
        const { cycleArr } = this.state;
        if (Array.isArray(cycleArr) && cycleArr.length) {
            return cycleArr.map(item => (
                <Option key = {item} value = {item}>
                    {item}
                </Option>
            ));
        }
        return "";
    };

    /**
     * 奖励上限校验
     */
    validRewardLimit = (rule, value, callback) => {
        const {
            form: { validateFields },
        } = this.props;
        const { type } = this.getValue();
        const validRule = /^[1-9][0-9]{0,7}$/;
        if (value && !validRule.test(value)) callback("请输入1至99999999的数字");
        if (type === 4) {
            validateFields(["reward"], (err, values) => {
                console.log("奖励 err values", err, values);
                if (err) {
                    callback("请正确设置各级别奖励");
                } else {
                    // const rewardTotal = this.jointReward();
                    const { buget } = this.state;
                    // if (value < rewardTotal) callback(`所设奖励上限不能小于各奖励之和~${rewardTotal}`);
                    if (buget === 0) callback("当前已无剩余预算");
                    if (value > buget) callback(`当前任务下剩余金额为${buget}元,请设置小于等于${buget}元的奖励上限`);
                }
            });
        } else {
            validateFields([], err => {
                if (err) {
                    callback("请正确设置各级别奖励");
                } else {
                    const { buget } = this.state;
                    if (buget === 0) callback("当前已无剩余预算");
                    if (value > buget) callback(`当前任务下剩余金额为${buget}元,请设置小于等于${buget}元的奖励上限`);
                }
            });
        }

        callback();
    };

    validLookRewLimit = (rule, value, callback) => {
        const { trainingRuleList: { rewardCycle, readSingle, readWhole } = {}, ifReward = 1 } = this.getValue();
        if (!ifReward) callback();

        if (!rewardCycle) {
            callback("请设置奖励");
        } else {
            // 当选则的是按阅读完成度(每商品整体)
            if (rewardCycle && rewardCycle === 2) {
                validLookWhole(this.getFromField("lookContent"), callback);
                validMinRewGTArts(this.getFromField("lookContent"), value, callback);
            }

            // 校验必输
            // const tiledArr = tileArr(readSingle, readWhole);
            const checkedArr = rewardCycle === 1 ? readSingle : readWhole;
            // 奖励校验
            ruleValidQua(checkedArr, callback);
            // 计算填写的所有奖励
            const rewardVal = checkedArr.reduce((total = 0, { y = 0 }) => total + y, 0);
            if (value < rewardVal) {
                callback("奖励上限应该超过当前所设奖励之和");
            }
        }

        callback();
    };

    jointReward = () => {
        const {
            // reward: { qualitySingle, qualityWhole, totalSingle, totalWhole },
            reward,
        } = this.getValue();
        // const newArr = [...qualitySingle, ...qualityWhole, ...totalSingle, ...totalWhole];
        const newArr = getReChecked(reward);
        return newArr.reduce((total = 0, { y = 0 }) => total + y, 0);
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

    getFromField = field => {
        const { getFieldValue } = form;
        return getFieldValue(field);
    };

    callModel = (type, data, callback) => {
        dispatch({
            type: `train/${type}`,
            payload: data,
            callback,
        });
    };

    getValue = () => {
        const {
            form: { getFieldsValue },
        } = this.props;
        return getFieldsValue();
    };

    setValue = (key, value) => {
        const { setFieldsValue } = form;
        setFieldsValue({ [key]: value });
    };

    complexSetValues = field => {
        const { setFieldsValue } = form;
        if (isNormalValid && resetMap[field]) {
            setFieldsValue(resetMap[field]);
        }
    };

    setValues = fieldsValus => {
        const { setFieldsValue } = form;
        setFieldsValue(fieldsValus);
    };

    /**
     * // 任务时间测试数据为 startTime: 1569340800000 endTime: 1569599999000
     * @param  current
     * @returns
     */
    disApplyTime = current => {
        const { actTaskId: { startTime, endTime } = {} } = this.getValue();
        const normalRule = current && current < moment().endOf("day");
        if (startTime && endTime) {
            if (isBefore(endTime, moment(), "day")) {
                return normalRule;
            }
            return current < moment(startTime).startOf("day") || normalRule || current > moment(endTime).endOf("day");
        }
        return normalRule;
    };

    goBack = () => {
        router.push({
            pathname: "../list",
            query: {},
        });
    };

    /**
     * 渲染用心看内容
     */
    renderLookCon = () => {
        const { getFieldDecorator } = form;
        const { skuList } = this.getValue();
        const { hideSubmit } = this.getFlowState();
        return (
            <Form.Item label = "绑定内容">
                {getFieldDecorator("lookContent", {
                    initialValue: this.getRowData("lookContent") || initLookContent(skuList),
                    // initialValue: lookGoodList,
                    rules: [{ required: true, message: "请填写必输项" }, { validator: this.validLookCont }],
                })(<Articles disabled = {hideSubmit} />)}
            </Form.Item>
        );
    };

    renderLookReward = () => {
        const { getFieldDecorator } = form;
        const { ifReward: isShowReward = 1 } = this.getValue();
        const { readDis } = this.state;
        const { hideSubmit } = this.getFlowState();
        return (
            <div>
                <Form.Item label = "是否设置奖励">
                    {getFieldDecorator("ifReward", {
                        // initialValue: this.genGoodInitVal(goodsList),
                        initialValue: isShowReward,
                        rules: [{ required: true, message: "请选择是否设置奖励" }],
                    })(
                        <Radio.Group disabled = {hideSubmit}>
                            <Radio value = {0}>不奖励</Radio>
                            <Radio value = {1}>奖励</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>
                {isShowReward === 1 ? (
                    <Form.Item label = "奖励规则" wrapperCol = {{ span: 14 }}>
                        {getFieldDecorator("trainingRuleList", {
                            // initialValue: this.genGoodInitVal(goodsList),
                            initialValue: this.getRowData("trainingRuleList") || lookRewardInit,
                            rules: [{ required: true, message: "请填写必输项" }, { validator: this.validLookRewLimit }],
                        })(<LookReward disabled = {hideSubmit || !isShowReward} textArr = {genTextArr(readArr, readDis)} />)}
                    </Form.Item>
                ) : (
                    ""
                )}
            </div>
        );
    };

    renderLook = () => {
        const { getFieldDecorator } = form;
        const { ifReward: isShowReward = 1, skuList } = this.getValue();
        const { readDis } = this.state;
        const { hideSubmit } = this.getFlowState();
        return (
            <div>
                <Form.Item label = "是否设置奖励">
                    {getFieldDecorator("ifReward", {
                        // initialValue: this.genGoodInitVal(goodsList),
                        initialValue: isShowReward,
                        rules: [{ required: true, message: "请选择是否设置奖励" }],
                    })(
                        <Radio.Group disabled = {hideSubmit}>
                            <Radio value = {0}>不奖励</Radio>
                            <Radio value = {1}>奖励</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>
                <Form.Item label = "绑定内容">
                    {getFieldDecorator("lookContent", {
                        initialValue: this.getRowData("lookContent") || initLookContent(skuList),
                        // initialValue: lookGoodList,
                        rules: [{ required: true, message: "请填写必输项" }, { validator: this.validLookCont }],
                    })(<Articles disabled = {hideSubmit} />)}
                </Form.Item>
                {isShowReward === 1 ? (
                    <Form.Item label = "奖励规则" wrapperCol = {{ span: 14 }}>
                        {getFieldDecorator("trainingRuleList", {
                            // initialValue: this.genGoodInitVal(goodsList),
                            initialValue: this.getRowData("trainingRuleList") || lookRewardInit,
                            rules: [{ required: true, message: "请填写必输项" }, { validator: this.validLookRewLimit }],
                        })(<LookReward disabled = {hideSubmit || !isShowReward} textArr = {genTextArr(readArr, readDis)} />)}
                    </Form.Item>
                ) : (
                    ""
                )}
            </div>
        );
    };

    validLookCont = (rule, value, callback) => {
        const { validateFields } = form;
        if (Array.isArray(value)) {
            const isNull = value.some(item => !item[loolConField]);
            if (isNull) {
                callback("请输入文章ID");
            } else {
                if (lookConValid(value)) callback("只能输入数字和英文状态逗号, 且末尾不带逗号");
                // if (isObtCHComma(value)) callback("请输入英文状态逗号");
                if (isBeyondLimit(value)) callback("文章个数不能超过100");
                this.setLookReward(value);
                validateFields(["trainingRuleList"], () => {});
            }
        } else {
            callback("返回值格式不正确");
        }
        callback();
    };

    /**
     * 设置奖励按整体 按钮的禁用状态
     * @param {*} value
     */
    setLookReward = value => {
        this.setState({
            readDis: isLoolEQOne(value) || !isLkConEqual(value),
        });
    };

    getRowData = field => {
        const { rowData } = this.state;
        return rowData[field];
    };

    genAlert = () => {
        const { pageType } = this.state;
        const pageTypes = ["add", "edit"];
        const msg = "药企、任务、时间、商品有关联关系,任意的重选会导致相关商品清空，请谨慎选择";
        return pageTypes.includes(pageType) ? renderAlert(msg) : "";
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
                setTimeout(() => {
                    if (location) {
                        router.push({ pathname: location.pathname });
                    } else {
                        router.push({
                            pathname: "../../list",
                        });
                    }
                }, 0);
            },
        });
    };

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
            location: {
                query: { id },
            },
            location,
        } = this.props;
        const { type, goodsArr, loading, wholeDisabled, totalWholeDis, rewardQuality, rewardNum } = this.state;
        const { venderId: { key: venderId } = {}, actTaskId: { key: actTaskId } = {}, actTime, frequency, skuList, ifReward = 1 } = this.getValue();
        const [actStartTime, actEndTime] = getTime(actTime) || [];
        const isSay = type === 4;
        const isCycleNumShow = (rewardQuality && frequency === 2) || (!isSay && frequency === 2);
        const goodsParams = {
            venderId,
            type,
            actStartTime,
            actEndTime,
            ...this.jointId(),
            ...this.jointActGroupParam(),
        };
        const { hideSubmit, showCheck, showCheckList } = this.getFlowState();

        return (
            <div className = {styles.train}>
                <Prompt message = {this.handlePrompt} />
                <Header title = {`培训-${isSay ? "京采说" : "用心看"}`} />
                <Loading spinning = {loading}>
                    <div className = {styles.content}>
                        <div className = {styles.prompt}>{this.genAlert()}</div>
                        <Form {...singleColRow}>
                            <Form.Item label = "活动类型">
                                {getFieldDecorator("type", {
                                    initialValue: type,
                                    rules: [{ validator: this.validType }],
                                })(
                                    <Radio.Group disabled>
                                        <Radio.Button value = {4}>京采说</Radio.Button>
                                        <Radio.Button value = {5}>用心看</Radio.Button>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                            <Form.Item label = "选择药企">
                                {getFieldDecorator("venderId", {
                                    initialValue: this.getRowData("venderId") || { key: "", label: "" },
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择药企",
                                        },
                                        { validator: this.factoryValidate },
                                    ],
                                })(
                                    <FuzzySearch
                                        disabled = {hideSubmit}
                                        url = {`${urlPrefix}vender/factory/list`}
                                        resParam = {resParam}
                                        searchFields = {facFields}
                                        notFoundContent = "未查询到您要搜索的内容，请搜索其他关键词试试"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "关联任务" extra = {(!venderId && "请先选择药企信息后再来选择任务") || ""}>
                                {getFieldDecorator("actTaskId", {
                                    initialValue: this.getRowData("actTaskId") || { key: "", label: "" },
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
                                        disabled = {hideSubmit || !venderId}
                                        notFoundContent = "系统没有找到当前药企下在有效期内的任何任务，请先创建任务哦～"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "设置活动组">
                                {getFieldDecorator("actGroup", {
                                    initialValue: [],
                                    rules: [{ validator: this.validActGroup }],
                                })(
                                    <ModalList
                                        checkType = "radio"
                                        disabled = {hideSubmit}
                                        renderSearch = {param => <ActGroupSearch {...{ ...param, dispatch }} />}
                                        url = {`${urlPrefix}act/group/queryList`}
                                        columns = {groupCols}
                                        rowKey = "groupId"
                                        size = "small"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "活动名称">
                                {getFieldDecorator("name", {
                                    initialValue: this.getRowData("name"),
                                    rules: [{ required: true, message: "请输入活动名称" }, { max: 40, message: "活动名称不超过40个字" }],
                                })(<Input placeholder = "不超过40个字符" disabled = {hideSubmit} />)}
                            </Form.Item>
                            <Form.Item label = "活动起止时间">
                                {getFieldDecorator("actTime", {
                                    initialValue: this.getRowData("actTime"),
                                    rules: [{ validator: this.actTimeValidate }],
                                })(<RangePicker className = {styles["fill-width"]} disabledDate = {this.disApplyTime} disabled = {hideSubmit || !actTaskId} />)}
                            </Form.Item>
                            <Form.Item label = "活动商品">
                                {getFieldDecorator("skuList", {
                                    initialValue: this.getRowData("skuList") || [],
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择活动商品",
                                        },
                                        { validator: this.validGoods },
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
                            {/* {lookGoodList ? ( */}
                            {Array.isArray(skuList) && skuList.length ? (
                                <>
                                    {isSay ? (
                                        <Form.Item label = "设置内容">
                                            {getFieldDecorator("trainContent", {
                                                // initialValue: this.genGoodInitVal(goodsList),
                                                initialValue: this.getRowData("trainContent") || goodsArr,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请填写必输项",
                                                    },
                                                    // { validator: validContent },
                                                    {
                                                        validator: this.validSayCon,
                                                    },
                                                ],
                                            })(<TrainContent disabled = {hideSubmit} data = {goodsList} />)}
                                        </Form.Item>
                                    ) : (
                                        this.renderLookCon()
                                    )}
                                </>
                            ) : (
                                ""
                            )}
                            {Array.isArray(skuList) && skuList.length ? (
                                <div>
                                    {/* {isSay ? (
                                        <div>
                                            <Form.Item label = "设置内容">
                                                {getFieldDecorator("trainContent", {
                                                    // initialValue: this.genGoodInitVal(goodsList),
                                                    initialValue: this.getRowData("trainContent") || goodsArr,
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请填写必输项",
                                                        },
                                                        // { validator: validContent },
                                                        {
                                                            validator: this.validSayCon,
                                                        },
                                                    ],
                                                })(<TrainContent disabled = {hideSubmit} data = {goodsList} />)}
                                            </Form.Item>
                                            <Form.Item label = "设置活动奖励" wrapperCol = {{ span: 14 }}>
                                                {getFieldDecorator("reward", {
                                                    initialValue: this.getRowData("reward") || rewardInit,
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请设置活动奖励",
                                                        },
                                                        {
                                                            validator: this.validRew,
                                                        },
                                                    ],
                                                })(
                                                    <Reward
                                                        qualityArr = {genTextArr(qualityTitleArr, wholeDisabled)}
                                                        totalArr = {genTextArr(totalTitleArr, wholeDisabled || totalWholeDis)}
                                                        disabled = {hideSubmit}
                                                    />
                                                )}
                                            </Form.Item>
                                        </div>
                                    ) : (
                                        this.renderLook()
                                    )} */}

                                    {/* {rewardQuality || (!isSay && ifReward === 1) ? (
                                        <Form.Item label = "奖励频次">
                                            {getFieldDecorator("frequency", {
                                                initialValue: this.getRowData("frequency") || undefined,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请设置奖励频次",
                                                    },
                                                    {
                                                        validator: this.validFreq,
                                                    },
                                                ],
                                            })(
                                                <Radio.Group disabled = {hideSubmit}>
                                                    <Radio value = {1}>{type === 4 ? "活动时间段内取质量最高分返一次" : "活动时间段内仅返一次"}</Radio>
                                                    <Radio value = {2}>{type === 4 ? "活动时间段内自定义周期中质量最高分返一次共返多次" : "活动时间段内自定义周期中仅返一次 共返多次"}</Radio>
                                                </Radio.Group>
                                            )}
                                        </Form.Item>
                                    ) : (
                                        ""
                                    )}
                                    {isCycleNumShow ? (
                                        <Form.Item label = "考核周期">
                                            {getFieldDecorator("cycleNum", {
                                                initialValue: this.getRowData("cycleNum") || undefined,
                                                rules: [{ required: true, message: "请设置考核周期" }],
                                            })(<Select disabled = {hideSubmit}>{this.renderCycle()}</Select>)}
                                        </Form.Item>
                                    ) : (
                                        ""
                                    )}
                                    {rewardNum ? (
                                        <Form.Item label = "计次上限">
                                            {getFieldDecorator("maxNum", {
                                                initialValue: this.getRowData("maxNum") || undefined,
                                                rules: [
                                                    { required: true, message: "请设置计次上限" },
                                                    {
                                                        pattern: /^[1-9][0-9]{0,4}$/,
                                                        message: "请输入1到99999的整数",
                                                    },
                                                ],
                                            })(<InputNumber disabled = {hideSubmit} min = {1} max = {99999} step = {1} className = {styles["fill-width"]} />)}
                                        </Form.Item>
                                    ) : (
                                        ""
                                    )} */}
                                    {/* <Form.Item label = "设置活动图片">
                                    {getFieldDecorator("actPics", {
                                        initialValue: goodsFile,
                                        rules: [
                                            {
                                                required: true,
                                                message: "请选择活动图片",
                                            },
                                            { validator: validPics },
                                        ],
                                    })(
                                        <PictureList url = "https://www.mocky.io/v2/5cc8019d300000980a055e76" />
                                    )}
                                </Form.Item> */}
                                    {/* {isSay || (!isSay && ifReward === 1) ? (
                                        <Form.Item label = "奖励上限">
                                            {getFieldDecorator("budget", {
                                                initialValue: this.getRowData("budget") || undefined,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请选择奖励上限",
                                                    },
                                                    {
                                                        validator: this.validRewardLimit,
                                                    },
                                                ],
                                            })(<InputNumber disabled = {hideSubmit} min = {1} max = {99999999} step = {0.05} className = {styles["fill-width"]} />)}
                                        </Form.Item>
                                    ) : (
                                        ""
                                    )} */}
                                </div>
                            ) : (
                                ""
                            )}

                            {!isGy ? (
                                <>
                                    {isSay ? (
                                        <>
                                            <Form.Item label = "设置活动奖励" wrapperCol = {{ span: 14 }}>
                                                {getFieldDecorator("reward", {
                                                    initialValue: this.getRowData("reward") || rewardInit,
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请设置活动奖励",
                                                        },
                                                        {
                                                            validator: this.validRew,
                                                        },
                                                    ],
                                                })(
                                                    <Reward
                                                        qualityArr = {genTextArr(qualityTitleArr, wholeDisabled)}
                                                        totalArr = {genTextArr(totalTitleArr, wholeDisabled || totalWholeDis)}
                                                        disabled = {hideSubmit}
                                                    />
                                                )}
                                            </Form.Item>
                                        </>
                                    ) : (
                                        this.renderLookReward()
                                    )}
                                    {rewardQuality || (!isSay && ifReward === 1) ? (
                                        <Form.Item label = "奖励频次">
                                            {getFieldDecorator("frequency", {
                                                initialValue: this.getRowData("frequency") || undefined,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请设置奖励频次",
                                                    },
                                                    {
                                                        validator: this.validFreq,
                                                    },
                                                ],
                                            })(
                                                <Radio.Group disabled = {hideSubmit}>
                                                    <Radio value = {1}>{type === 4 ? "活动时间段内取质量最高分返一次" : "活动时间段内仅返一次"}</Radio>
                                                    <Radio value = {2}>{type === 4 ? "活动时间段内自定义周期中质量最高分返一次共返多次" : "活动时间段内自定义周期中仅返一次 共返多次"}</Radio>
                                                </Radio.Group>
                                            )}
                                        </Form.Item>
                                    ) : (
                                        ""
                                    )}
                                    {isCycleNumShow ? (
                                        <Form.Item label = "考核周期">
                                            {getFieldDecorator("cycleNum", {
                                                initialValue: this.getRowData("cycleNum") || undefined,
                                                rules: [{ required: true, message: "请设置考核周期" }],
                                            })(<Select disabled = {hideSubmit}>{this.renderCycle()}</Select>)}
                                        </Form.Item>
                                    ) : (
                                        ""
                                    )}
                                    {rewardNum ? (
                                        <Form.Item label = "计次上限">
                                            {getFieldDecorator("maxNum", {
                                                initialValue: this.getRowData("maxNum") || undefined,
                                                rules: [
                                                    { required: true, message: "请设置计次上限" },
                                                    {
                                                        pattern: /^[1-9][0-9]{0,4}$/,
                                                        message: "请输入1到99999的整数",
                                                    },
                                                ],
                                            })(<InputNumber disabled = {hideSubmit} min = {1} max = {99999} step = {1} className = {styles["fill-width"]} />)}
                                        </Form.Item>
                                    ) : (
                                        ""
                                    )}
                                    {isSay || (!isSay && ifReward === 1) ? (
                                        <Form.Item label = "奖励上限">
                                            {getFieldDecorator("budget", {
                                                initialValue: this.getRowData("budget") || undefined,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请选择奖励上限",
                                                    },
                                                    {
                                                        validator: this.validRewardLimit,
                                                    },
                                                ],
                                            })(<InputNumber disabled = {hideSubmit} min = {1} max = {99999999} step = {0.05} className = {styles["fill-width"]} />)}
                                        </Form.Item>
                                    ) : (
                                        ""
                                    )}
                                </>
                            ) : (
                                ""
                            )}

                            {/* {isSay ? (
                                <>
                                    <Form.Item label = "设置活动奖励" wrapperCol = {{ span: 14 }}>
                                        {getFieldDecorator("reward", {
                                            initialValue: this.getRowData("reward") || rewardInit,
                                            rules: [
                                                {
                                                    required: true,
                                                    message: "请设置活动奖励",
                                                },
                                                {
                                                    validator: this.validRew,
                                                },
                                            ],
                                        })(
                                            <Reward
                                                qualityArr = {genTextArr(qualityTitleArr, wholeDisabled)}
                                                totalArr = {genTextArr(totalTitleArr, wholeDisabled || totalWholeDis)}
                                                disabled = {hideSubmit}
                                            />
                                        )}
                                    </Form.Item>
                                </>
                            ) : (
                                this.renderLookReward()
                            )}
                            {rewardQuality || (!isSay && ifReward === 1) ? (
                                <Form.Item label = "奖励频次">
                                    {getFieldDecorator("frequency", {
                                        initialValue: this.getRowData("frequency") || undefined,
                                        rules: [
                                            {
                                                required: true,
                                                message: "请设置奖励频次",
                                            },
                                            {
                                                validator: this.validFreq,
                                            },
                                        ],
                                    })(
                                        <Radio.Group disabled = {hideSubmit}>
                                            <Radio value = {1}>{type === 4 ? "活动时间段内取质量最高分返一次" : "活动时间段内仅返一次"}</Radio>
                                            <Radio value = {2}>{type === 4 ? "活动时间段内自定义周期中质量最高分返一次共返多次" : "活动时间段内自定义周期中仅返一次 共返多次"}</Radio>
                                        </Radio.Group>
                                    )}
                                </Form.Item>
                            ) : (
                                ""
                            )}
                            {isCycleNumShow ? (
                                <Form.Item label = "考核周期">
                                    {getFieldDecorator("cycleNum", {
                                        initialValue: this.getRowData("cycleNum") || undefined,
                                        rules: [{ required: true, message: "请设置考核周期" }],
                                    })(<Select disabled = {hideSubmit}>{this.renderCycle()}</Select>)}
                                </Form.Item>
                            ) : (
                                ""
                            )}
                            {rewardNum ? (
                                <Form.Item label = "计次上限">
                                    {getFieldDecorator("maxNum", {
                                        initialValue: this.getRowData("maxNum") || undefined,
                                        rules: [
                                            { required: true, message: "请设置计次上限" },
                                            {
                                                pattern: /^[1-9][0-9]{0,4}$/,
                                                message: "请输入1到99999的整数",
                                            },
                                        ],
                                    })(<InputNumber disabled = {hideSubmit} min = {1} max = {99999} step = {1} className = {styles["fill-width"]} />)}
                                </Form.Item>
                            ) : (
                                ""
                            )}
                            {isSay || (!isSay && ifReward === 1) ? (
                                <Form.Item label = "奖励上限">
                                    {getFieldDecorator("budget", {
                                        initialValue: this.getRowData("budget") || undefined,
                                        rules: [
                                            {
                                                required: true,
                                                message: "请选择奖励上限",
                                            },
                                            {
                                                validator: this.validRewardLimit,
                                            },
                                        ],
                                    })(<InputNumber disabled = {hideSubmit} min = {1} max = {99999999} step = {0.05} className = {styles["fill-width"]} />)}
                                </Form.Item>
                            ) : (
                                ""
                            )} */}
                            <Form.Item label = "设置活动图片" extra = "图片大小应为 690*392">
                                {getFieldDecorator("imgList", {
                                    initialValue: this.getRowData("imgList") || [],
                                    rules: [
                                        {
                                            required: true,
                                            message: "请选择活动图片",
                                        },
                                        { validator: this.validPics },
                                    ],
                                })(
                                    <UploadClip
                                        url = "/api/be/upload/img"
                                        multiple
                                        limitSize = {5} // 单位为M
                                        limitNum = {6}
                                        onPreview = {file => console.log("预览回调", file)}
                                        onRemove = {file => {
                                            console.log("删除回调", file);
                                        }}
                                        showRemoveIcon
                                        showPreviewIcon
                                        showEditIcon = {false}
                                        name = "imgFile"
                                        data = {{ imageEnum: "LOGO" }}
                                        disabled = {hideSubmit}
                                        limitPixel = {{ width: 690, height: 392 }}
                                        // ratio = {2}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "活动说明">
                                {getFieldDecorator("description", {
                                    initialValue: this.getRowData("description"),
                                    rules: [
                                        {
                                            required: true,
                                            message: "请输入活动说明",
                                        },
                                        {
                                            max: 2000,
                                            message: "至多输入2000个字",
                                        },
                                        {
                                            min: 100,
                                            message: "至少输入100个字",
                                        },
                                    ],
                                })(<YaoTextArea showCount maxLength = {2000} disabled = {hideSubmit} rows = {4} placeholder = "请输入100到2000个字符" />)}
                            </Form.Item>
                        </Form>
                        {hideSubmit ? (
                            ""
                        ) : (
                            <div className = {styles["btn-container"]}>
                                <Button type = "primary" onClick = {this.onSave("draft")}>
                                    保存草稿
                                </Button>
                                <Button type = "primary" onClick = {this.onSave("offical")}>
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

export default Form.create()(TrainCreate);
