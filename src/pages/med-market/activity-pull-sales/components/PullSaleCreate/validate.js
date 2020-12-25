import React from "react";
import moment from "moment";
import { TextRender } from "@/components/complex-table";
import { UUID } from "@/utils/utils";

// 药企参数
const resParam = {
    value: "venderId",
    text: "companyName",
};

const facFields = { searchField: "companyName" };

function validFactory(rule, value, callback) {
    const { key } = value;
    if (!key) callback("请选择药企");
    callback();
}

// 任务参数
const taskPram = {
    value: "id",
    text: "taskName",
};

function genSearchField({ key = "venderId", value }) {
    return {
        id: {
            key,
            value,
        },
        searchField: "taskNameLike",
        otherParam: {
            status: 2,
        },
    };
}

// 活动组
const groupCols = [
    {
        title: "索引",
        dataIndex: "index",
        width: 80,
        render: (text, record, index) => index + 1,
    },
    {
        title: "活动组ID",
        dataIndex: "groupId",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "活动组名称",
        dataIndex: "groupName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "区域",
        dataIndex: "areaNum",
        width: 200,
    },
    {
        title: "门店类型",
        dataIndex: "shopTypesView",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "白名单门店",
        dataIndex: "whiteShopsNum",
        width: 120,
    },
    {
        title: "黑名单门店",
        dataIndex: "blackShopsNum",
        width: 120,
    },
    {
        title: "备注",
        dataIndex: "remark",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
];

function validGroup(rule, value, callback) {
    if (Array.isArray(value) && value.length > 1) {
        callback("活动组只能选一个");
    }
    callback();
}

// 商品
const goodsCol = [
    {
        title: "索引",
        dataIndex: "index",
        width: 80,
        render: (text, record, index) => index + 1,
    },
    {
        title: "ERP编码",
        dataIndex: "erpCode",
        width: 120,
    },
    {
        title: "批准文号",
        dataIndex: "approvNum",
        width: 200,
    },
    {
        title: "商品名称",
        dataIndex: "medicinesName",
        width: 200,
    },
    {
        title: "包装规格",
        dataIndex: "packageSpec",
        width: 200,
    },
];

const validGoods = (rule, value, callback) => {
    if (!value) {
        callback("请选择活动商品");
    }
    callback();
};

/**
 * 将字符串 时间戳 时间范围为时间
 * @param {*} data
 */
/* const transStrToMoment = data => {
    if (typeof data === "undefined") return data;
}; */

const tranToMoment = value => (moment.isMoment(value) && value) || moment(value);

const isBefore = (compareTime, refTime, scale) => tranToMoment(compareTime).isBefore(tranToMoment(refTime), scale);
const getStrDate = (date, format = "YYYY-MM-DD") => moment(date).format(format);

// 活动时间
const format = "YYYY-MM-DD";
function getTime(value) {
    if (value) {
        return value.map(item => moment(item).format(format));
    }
    return value;
}

// 活动说明
const actDes = [
    {
        required: true,
        message: "请输入活动说明",
    },
    { max: 2000, message: "至多输入2000个字" },
    { min: 100, message: "至少输入100个字" },
];

// 个人
const personCols = [
    {
        title: "condition",
        dataIndex: "condition",
        width: 150,
    },
    {
        title: "minPack",
        dataIndex: "minPack",
        width: 100,
        editable: true,
    },
    {
        title: "range",
        dataIndex: "range",
        width: 10,
    },

    {
        title: "maxPack",
        dataIndex: "maxPack",
        width: 100,
        editable: true,
    },
    {
        title: "descrip",
        dataIndex: "descrip",
        width: 200,
    },
    {
        title: "money",
        dataIndex: "money",
        width: 100,
        editable: true,
    },
    {
        title: "unit",
        dataIndex: "unit",
    },
];

const emptyPerRow = {
    condition: "当最小包装单位达",
    minPack: undefined,
    range: "至",
    maxPack: undefined,
    descrip: "时每最小包装单位奖励",
    money: undefined,
    unit: "元",
    buyerType: 1,
    key: UUID(),
};

const initPer = [emptyPerRow];

const perMsg = {
    empty: "请输入相关内容",
    money: "金额范围应该在0.1到999之间且最多保留两位小数",
    row: "上限值应该大于下限值",
    diffRow: "下一行的下限值应该大于上一行的上限值",
    diffMoney: "下一行的金额应该大于上一行的金额",
    beyondOne: "下一行的下限值应该为上一行上限值加一",
};

function isPerNull(value) {
    if (Array.isArray(value)) {
        if (!value.length) {
            return true;
        }
        const isNull = value.some(item => {
            const { maxPack, minPack, money } = item;
            return !maxPack || !minPack || !money;
        });

        return isNull;
    }
    return true;
}

function validPerDiffRow(value) {
    let temp = true;
    let isMoneyPass = true;
    let isNextGtPreOne = true;
    if (value.length > 1) {
        value.forEach(({ minPack, money }, index) => {
            if (index > 0 && minPack <= value[index - 1].maxPack) temp = false;
            if (index > 0 && money <= value[index - 1].money) isMoneyPass = false;
            // 下一行的下限值应该为上限值加一
            if (index > 0 && minPack > value[index - 1].maxPack + 1) isNextGtPreOne = false;
        });
    }

    return { isDiffPass: temp, isMoneyPass, isNextGtPreOne };
}

const genRule = num => new RegExp(`^[1-9][0-9]{0,${num - 1}}$`);
// const perMoneyRule = genRule(3);
const onePoint = /^\d*(\.\d{1,2})?$/;

/**
 * 当前行下限是否小于上限值
 */
function isRowPass(value) {
    return value.every(({ minPack, maxPack }) => minPack < maxPack);
}

function isFillRange(value, limit) {
    return value >= 0.1 && value <= limit && onePoint.test(value);
}

function ifMoneyPass(value) {
    return value.every(({ money }) => isFillRange(money, 999));
}

function validPerson(rule, value, callback) {
    if (isPerNull(value)) callback(perMsg.empty);
    if (!ifMoneyPass(value)) callback(perMsg.money);
    if (Array.isArray(value)) {
        if (!isRowPass(value)) {
            callback(perMsg.row);
        }

        const { isDiffPass, isMoneyPass: isDiffMoney, isNextGtPreOne } = validPerDiffRow(value);
        if (!isDiffPass) callback(perMsg.diffRow);
        if (!isDiffMoney) callback(perMsg.diffMoney);
        if (!isNextGtPreOne) callback(perMsg.beyondOne);
    }
    callback();
}

// 其他奖励
const commonCols = [
    {
        title: "condition",
        dataIndex: "condition",
        width: 150,
    },
    {
        title: "minPack",
        dataIndex: "minPack",
        width: 100,
        editable: true,
    },
    {
        title: "descrip",
        dataIndex: "descrip",
        width: 100,
    },
    {
        title: "money",
        dataIndex: "money",
        width: 100,
        editable: true,
    },
    {
        title: "unit",
        dataIndex: "unit",
    },
];

const shopObj = {
    monomer: 2,
    hq: 3,
    branch: 4,
    chainStore: 5,
    nonProfitMedical: 6,
    profitMedical: 7,
};

const emptyComRow = {
    condition: "当最小包装单位达",
    minPack: undefined,
    descrip: "时奖励门店",
    money: undefined,
    unit: "元",
    key: UUID(),
};

function genEmptyRow(type) {
    return { ...emptyComRow, ...{ buyerType: shopObj[type] } };
}

const isNotEmpty = data => {
    if (typeof data === "string") {
        return !!(data && data.trim());
    }

    return !!data;
};

const genRewTypeVal = values => {
    const fieldArr = ["monomer", "hq", "branch", "chainStore", "nonProfitMedical", "profitMedical"];
    return fieldArr.filter(item => {
        const { [item]: itemVal } = values;
        const res = itemVal.some(({ minPack, money } = {}) => isNotEmpty(minPack) || isNotEmpty(money));
        return res;
    });
};

const comMsg = {
    empty: "请输入相关内容",
    money: "金额范围应该在0.1到999元之间且最多保留两位小数",
    row: "上限值应该大于下限值",
    diffRow: "下一行的值应该大于上一行的值",
    diffMoney: "下一行的金额应该大于上一行的金额",
};

// const comNumRulw = genRule(6);
function validComNull(value) {
    if (Array.isArray(value)) {
        return value.some(({ minPack, money }) => !minPack || !money);
    }
    return true;
}

const validNotEmpty = value => {
    if (Array.isArray(value)) {
        return value.some(({ minPack, money }) => typeof minPack !== "undefined" || typeof money !== "undefined");
    }
    return false;
};

// const isUndefined = value => typeof value === 'undefined' || value === null;

/* function validNoContent(value) {
    if(Array.isArray(value)) {
        return value.every(({ minPack, money }) => isUndefined(minPack) && isUndefined(money));
    }
    return true;
} */

function validComDiffRow(value) {
    let temp = true;
    let isMoneyPass = true;
    if (value.length > 1) {
        value.forEach(({ minPack, money }, index) => {
            if (index > 0 && minPack <= value[index - 1].minPack) temp = false;
            if (index > 0 && money <= value[index - 1].money) isMoneyPass = false;
        });
    }

    return { isDiffPass: temp, isMoneyPass };
}

function validCom(rule, value, callback) {
    // 非空校验 先校验是否全部为空
    const hasVal = validNotEmpty(value);
    if (!hasVal) {
        callback();
    }
    const isNull = validComNull(value);
    if (isNull) callback(comMsg.empty);

    // 金额范围校验
    /* const isMoneyPass = value.every(({ money }) => comNumRulw.test(money));
    if (!isMoneyPass) callback(perMsg.money); */
    if (!ifMoneyPass(value)) callback(comMsg.money);

    const { isDiffPass, isMoneyPass: isDiffMoney } = validComDiffRow(value);
    if (!isDiffPass) callback(comMsg.diffRow);
    if (!isDiffMoney) callback(comMsg.diffMoney);

    callback();
}

// 奖励上限
function validRewLimit(rule, value, callback) {
    callback();
}

const requiredMsg = {
    individual: "请设置个体奖励",
    monomer: "请设置门店奖励",
    hq: "请设置连锁总部奖励",
    branch: "请设置连锁分公司奖励",
    chainStore: "请设置连锁门店奖励",
    nonProfitMedical: "请设置非盈利性医疗机构奖励", // 非盈利性医疗结构 20201207新增
    profitMedical: "请设置盈利性医疗机构奖励", // 盈利性医疗机构 20201207新增
};

// 将时间戳初始化为moment
function compatMoment(time) {
    const newTime = moment(time);
    return (moment.isMoment(newTime) && newTime) || moment();
}

const toMoment = time => {
    if (Array.isArray(time)) {
        return time.map(item => compatMoment(item));
    }

    return compatMoment(time);
};

// 上传文件处理
function hanleFile(fileList) {
    if (Array.isArray(fileList)) {
        return fileList.map(item => {
            const { type: imgType, path, name } = item;
            return {
                uid: `-${UUID()}`,
                status: "done",
                url: path,
                path,
                imgType,
                name,
            };
        });
    }

    return [];
}

const perData = {
    condition: "当最小包装单位达",
    range: "至",
    descrip: "时每最小包装单位奖励",
    unit: "元",
    key: UUID(),
};

const comData = {
    condition: "当最小包装单位达",
    descrip: "时奖励门店",
    unit: "元",
    key: UUID(),
};

const ruleItemFilter = ({ maxPack, minPack, money, buyerType }) => {
    const otherData = (buyerType === 1 && perData) || comData;
    return { maxPack, minPack, money, buyerType, ...otherData, key: UUID() };
};

const ruleFilter = (data, type) => {
    const res = data.filter(({ buyerType }) => buyerType === type);
    return res.map(ruleItemFilter);
};
// individual, monomer, hq, branch, chainStore
const ruleMapArr = [
    { field: "individual", type: 1 },
    { field: "monomer", type: 2 },
    { field: "hq", type: 3 },
    { field: "branch", type: 4 },
    { field: "chainStore", type: 5 },
    { field: "nonProfitMedical", type: 6 }, // 非盈利性医疗结构 20201207新增
    { field: "profitMedical", type: 7 }, // 盈利性医疗机构 20201207新增
];

/* const ruleMapObj = {
    individual: 1,
    monomer: 2,
    hq: 3,
    branch: 4,
    chainStore: 5,
} */

function handleRule(data) {
    const res = {};
    ruleMapArr.forEach(({ field, type }) => {
        const temp = ruleFilter(data, type);
        res[field] = temp.length ? temp : undefined;
    });
    return res;
}

// 查询到的行数据格式化为页面需要的数据
function handleRow(data) {
    // actMovePinFileVOList 活动图片list      actMovePinRuleVOList 奖励规则       skuList商品信息    actVerifyList审核信息 otherGood中包含活动actId、rewardCyCle、description、buyerType
    // otherRow 包括id name status type
    const {
        venderId: facId,
        actTaskId: taskId,
        applyStartTime,
        applyEndTime,
        actStartTime,
        actEndTime,
        actMoveVO: { actMovePinFileVOList: fileList, actMovePinRuleVOList, skuList: wareParms, actVerifyList, ...otherGood },
        ...otherRow
    } = data;
    // 拼接报名时间、活动时间
    const applyTime = toMoment([applyStartTime, applyEndTime]);
    const actTime = toMoment([actStartTime, actEndTime]);
    // 拼接药企、任务
    const venderId = { key: `${facId}`, label: "药企测试" };
    const actTaskId = { key: `${taskId}`, label: "任务测试" };
    const actMovePinFileVOList = hanleFile(fileList);
    const ruleObj = handleRule(actMovePinRuleVOList);

    return {
        applyTime,
        actTime,
        venderId,
        actTaskId,
        wareParms,
        actMovePinFileVOList,
        ...ruleObj,
        ...otherGood,
        ...otherRow,
    };
}

function validPass(rule, value, callback) {
    callback();
}

function genValid(isValid, fn) {
    return isValid ? fn : validPass;
}

const formatTime = (date, tempFormat = format) => {
    if (date) {
        return moment(date).format(tempFormat);
    }

    return "";
};

export { formatTime };

const resetObj = {
    actTaskId: { key: "", label: "" },
    applyTime: undefined,
    actTime: undefined,
    wareParms: undefined,
    budget: undefined,
};

export {
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
    actDes,
    personCols, // 个人奖励
    initPer,
    emptyPerRow,
    validPerson,
    commonCols, // 公共奖励
    genEmptyRow,
    validCom,
    genRule, // 产生验证规则
    validRewLimit,
    isBefore, // 时间比较
    getStrDate, // 获取时间字符串
    requiredMsg, // 必输项校验信息
    handleRow, // 格式化行数据
    validPass,
    genValid,
    genRewTypeVal,
    resetObj,
};
