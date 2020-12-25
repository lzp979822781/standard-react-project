import React from "react";
import moment from "moment";
import { Alert } from "antd";
import omit from "lodash/omit";
// import pick from "lodash/pick";
import { TextRender } from "@/components/complex-table";
import { UUID } from "@/utils/utils";

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
        width: 300,
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

// 活动任务
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

const taskPram = {
    value: "id",
    text: "taskName",
};

// 活动时间
function getDiffDays(value) {
    const days = value[1].diff(value[0], "day");
    const searchVal = days + 1;
    const res = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1, len = parseInt(searchVal / 2, 10) + 1; i < len; i++) {
        if (searchVal % i === 0) {
            res.push(i);
        }
    }

    if (!res.includes(searchVal)) res.push(searchVal);

    return res;
}

// 商品
const goodsList = [
    {
        id: 111,
        medicinesName: "测试商品一",
        contentList: [
            {
                key: UUID(),
                train: undefined,
            },
        ],
    },
    {
        id: 222,
        medicinesName: "测试商品二",
        contentList: [
            {
                key: UUID(),
                train: undefined,
            },
        ],
    },
];

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
        width: 300,
    },
];

// 内容
const trainCol = [
    {
        title: "索引",
        dataIndex: "index",
        width: 20,
        render: (text, record, index) => index + 1,
    },
    {
        title: "培训",
        dataIndex: "train",
        editable: true,
        width: 300,
    },
];

// 活动组校验
function validGroup(rule, value, callback) {
    if (Array.isArray(value) && value.length > 1) {
        callback("活动组只能选一个");
    }
    callback();
}

// 内容校验
const titleRule = /^([\s\S]){5,15}$/;
const contentRule = /^([\s\S]){10,30}$/;

const isFullfillRule = ({ title, content } = {}) => {
    const isTitlePass = titleRule.test(title);
    const isConPass = contentRule.test(content);
    return isTitlePass && isConPass;
};

const validContent = (rule, value, callback) => {
    const keys = Object.keys(value);
    let isPassRule = true;
    keys.map(item => {
        const arr = value[item];
        const isPass = arr.every(childItem => {
            const { train: { title, content } = {}, train } = childItem;
            if (isPassRule) isPassRule = isFullfillRule(train);
            return train && title && content;
        });
        if (!isPass) {
            callback("请输入必输内容");
        } else if (!isFullfillRule) {
            callback("标题为5-15字符,内容为10-30个字符");
        }
        return item;
    });
    callback();
};

const validConCahe = (rule, value, callback) => {
    if (!value) {
        callback("请设置内容");
    }
    const isNotPass = value.some(item => {
        const { contentList } = item;
        return !contentList || contentList.length < 1;
    });

    if (isNotPass) callback("每个商品至少设置一个内容");
    let isPassRule = true;
    const isConPass = value.every(item => {
        const { contentList } = item;
        const isNullPass = contentList.every(childItem => {
            const { train: { title, content } = {}, train } = childItem;
            if (isPassRule) isPassRule = isFullfillRule(train);
            return train && title && content;
        });
        return isNullPass;
    });
    if (!isConPass) callback("请填写标题和内容");
    if (!isPassRule) callback("标题为5-15字符,内容为10-30个字符");
    callback();
};

const isLengthEqOne = data => data.some(({ contentList }) => contentList.length === 1);

const qualityTitleArr = [{ text: "按完成质量(每商品每句话)", value: 1, disabled: false }, { text: "按完成质量(每商品整体)", value: 2, disabled: false }];

const totalTitleArr = [{ text: "按累计次数(每商品每句话)", value: 1, disabled: false }, { text: "按累计次数(每商品整体)", value: 2, disabled: false }];

const readArr = [{ text: "按阅读完成度(每商品每篇)", value: 1, disabled: false }, { text: "按阅读完成度(每商品整体)", value: 2, disabled: false }];

// 根据验证规则设置奖励按钮禁用状态并返回值
const genTextArr = (data, isDisabled = false) => {
    if (isDisabled) {
        return data.map(item => ({ ...item, disabled: item.value === 2 && isDisabled }));
    }

    return data;
};

const isQuaqtityFit = data => {
    if (Array.isArray(data) && data.length) {
        const newArr = data.map(({ contentList }) => (Array.isArray(contentList) && contentList.length) || 0);
        return new Set(newArr).size === 1;
    }
    return false;
};

const trainEmptyRow = {
    train: undefined,
};

// 奖励
const qualityCol = [
    {
        title: "condition",
        dataIndex: "condition",
        width: 150,
    },
    {
        title: "mark",
        dataIndex: "x",
        width: 100,
        editable: true,
    },
    {
        title: "descrip",
        dataIndex: "descrip",
        width: 50,
    },
    {
        title: "money",
        dataIndex: "y",
        editable: true,
        width: 100,
    },
    {
        title: "unit",
        dataIndex: "unit",
        width: 50,
    },
];

const quaSingleRow = {
    condition: "每商品每句话完成质量达",
    x: undefined,
    descrip: "分奖励",
    y: undefined,
    unit: "元",
    rewardType: 1,
};

const quaWholeRow = {
    condition: "每商品整体完成质量达",
    x: undefined,
    descrip: "分奖励",
    y: undefined,
    unit: "元",
    rewardType: 1,
};

const totalSingleCol = [
    {
        title: "condition",
        dataIndex: "condition",
        width: 150,
    },
    {
        title: "x",
        dataIndex: "x",
        width: 100,
        editable: true,
    },
    {
        title: "descrip",
        dataIndex: "descrip",
        width: 50,
    },
    {
        title: "money",
        dataIndex: "y",
        editable: true,
        width: 100,
    },
    {
        title: "unit",
        dataIndex: "unit",
        width: 50,
    },
];

const totalSingleRow = {
    condition: "每商品每句话累积次数",
    x: undefined,
    descrip: "次奖励",
    y: undefined,
    unit: "元",
    rewardType: 2,
};

const totalWholeRow = {
    condition: "每商品整体累积次数",
    x: undefined,
    descrip: "次奖励",
    y: undefined,
    unit: "元",
    rewardType: 2,
};

const rewardInit = {
    rewardQuality: undefined,
    rewardNum: undefined,
    qualitySingle: [
        {
            key: UUID(),
            ...quaSingleRow,
        },
    ],
    qualityWhole: [
        {
            key: UUID(),
            ...quaWholeRow,
        },
    ],
    totalSingle: [
        {
            key: UUID(),
            ...totalSingleRow,
        },
    ],
    totalWhole: [
        {
            key: UUID(),
            ...totalWholeRow,
        },
    ],
};

const rewardObj = {
    rewardQuality: {
        1: "qualitySingle",
        2: "qualityWhole",
    },
    rewardNum: {
        1: "totalSingle",
        2: "totalWhole",
    },
};

function isUndefined(item) {
    const { x, y } = item;
    return typeof x === "undefined" || typeof y === "undefined";
}

const quaXRule = /^([1-9][0-9]?|100)$/;
const quaYRule = /^[1-9][0-9]{0,2}$/;
const onePoint = /^\d*(\.\d{1,2})?$/;

function isFillRange(value, limit) {
    return value >= 0.1 && value <= limit && onePoint.test(value);
}

function ruleValidQua(data, callback) {
    const { length } = data;
    // 非空校验
    const isNull = data.some(isUndefined);

    if (isNull) {
        callback("请填写必输内容");
    } else {
        if (length > 1) {
            // 下个数的值大于上个数的值
            const isNextGtPre = data.some((item, index) => {
                if (index > 0) {
                    return item.x <= data[index - 1].x || item.y <= data[index - 1].y;
                }
                return false;
            });
            if (isNextGtPre) callback("下一行的值应该大于上一行的值");
        }
        const isXFull = data.every(item => quaXRule.test(item.x));
        if (!isXFull) callback("分数范围应该在1到100且为整数");

        // const isYFull = data.every(item => quaYRule.test(item.y));
        const isYFull = data.every(item => isFillRange(item.y, 999));
        if (!isYFull) callback("金额范围应该在0.1到999且最多保留两位小数");
    }
}

const totalSingleX = /^[1-9][0-9]{0,3}$/;
const totalWholeX = /^[1-9][0-9]{0,4}$/;
// const totalY = /^[1-9][0-9]{0,2}$/;

const totalXObj = {
    totalSingle: totalSingleX,
    totalWhole: totalWholeX,
};

const msgXObj = {
    totalSingle: "次数范围应在1到9999且为整数",
    totalWhole: "次数范围应该在1-99999且为整数",
};

function totalRule(data, field, callback) {
    const { length } = data;
    // 非空校验
    const isNull = data.some(isUndefined);

    if (isNull) {
        callback("请填写必输内容");
    } else {
        const isXFull = data.every(item => totalXObj[field].test(item.x));
        if (!isXFull) callback(msgXObj[field]);

        // const isYFull = data.every(item => totalY.test(item.y));
        /*         const isYFull = data.every(item => item.y >= 1 && item.y <= 999 );
        if (!isYFull) callback("金额范围应该在1到999");
        const isOnePoint = data.every(item => onePoint.test(item.y));
        if(!isOnePoint) callback("金额只能包含一个小数"); */
        const isYFull = data.every(item => isFillRange(item.y, 999));
        if (!isYFull) callback("金额范围应该在0.1到999且最多保留两位小数");

        if (length > 1) {
            // 下个数的值大于上个数的值
            const isNextGtPre = data.some((item, index) => {
                if (index > 0) {
                    return item.x <= data[index - 1].x || item.y <= data[index - 1].y;
                }
                return false;
            });
            if (isNextGtPre) callback("下一行的值应该大于上一行的值");
        }
    }
}

function validReward(rule, value, callback) {
    const { rewardQuality, rewardNum } = value;
    if (!rewardQuality && !rewardNum) {
        callback("按质量和按累积次数至少选择一个");
    }

    if (rewardQuality) {
        const quaField = rewardObj.rewardQuality[rewardQuality];
        ruleValidQua(value[quaField], callback);
    }
    if (rewardNum) {
        const totalField = rewardObj.rewardNum[rewardNum];
        totalRule(value[totalField], totalField, callback);
    }
    // callback();
}

const getChildReCheck = (checknum, single, whole) => {
    if (checknum) {
        return checknum === 1 ? single : whole;
    }
    return [];
};

const getReChecked = reward => {
    const { rewardQuality, rewardNum, qualitySingle, qualityWhole, totalSingle, totalWhole } = reward;
    const resQuality = getChildReCheck(rewardQuality, qualitySingle, qualityWhole);
    const resTotal = getChildReCheck(rewardNum, totalSingle, totalWhole);
    return [...resQuality, ...resTotal];
};

function getEveryData(values, field) {
    const { [field]: btnVal } = values;
    if (btnVal) {
        const tempField = rewardObj[field][btnVal];
        return values[tempField];
    }
    return [];
}

function getReward(values) {
    const { reward } = values;
    const quaVal = getEveryData(reward, "rewardQuality");
    const totalVal = getEveryData(reward, "rewardNum");
    return quaVal.concat(totalVal);
}

// 文件列表
const goodsFile = [
    {
        id: 111,
        medicinesName: "测试商品一",
        trainingFileList: [],
    },
    {
        id: 222,
        medicinesName: "测试商品二",
        trainingFileList: [],
    },
];

function validPics(rule, value, callback) {
    const isNotPass = value.some(item => {
        const { trainingFileList } = item;
        return !trainingFileList || trainingFileList < 1;
    });
    if (isNotPass) callback("请上传至少一个文件");
    callback();
}

const goodsRealList = [
    {
        approvNum: "a",
        commonName: "商品名称",
        erpCode: "商品名称",
        factorySkuId: 100000166,
        id: 60,
        medicinesName: "商品名称",
        packageSpec: "商品名称",
        skuInfoList: [
            {
                flag: 0,
                medicinesName: "----",
                shopName: "----",
                shopVenderId: 48384,
                skuId: 10001025757,
                state: 1,
            },
        ],
        status: 1,
        key: "8b3f6f7d-0bb5-4302-a98a-4d2b6f1fb53b",
    },
    {
        approvNum: "a",
        commonName: "df",
        erpCode: "df",
        factorySkuId: 100000163,
        id: 57,
        medicinesName: "df",
        packageSpec: "df",
        skuInfoList: [
            {
                flag: 0,
                medicinesName: "----",
                shopName: "----",
                shopVenderId: 48384,
                skuId: 10001025757,
                state: 1,
            },
        ],
        status: 1,
        key: "03426d79-b33b-453a-90b9-be0b284f6fd9",
    },
];

const initContent = data => {
    const initVal = {
        contentList: [
            {
                key: UUID(),
                train: undefined,
            },
        ],
    };
    return data.map(item => ({ ...item, ...initVal }));
};

const initLookContent = data => data.map(item => ({ ...item, contentList: undefined }));

// 商品变化以后重新设置活动内容
function filterRes(currentCon, content) {
    return currentCon.map(item => {
        const { factorySkuId } = item;
        const curCon = content.filter(({ factorySkuId: id } = {}) => factorySkuId === id);
        return curCon.length ? curCon[0] : item;
    });
}

const initSkuObj = {
    4: initContent,
    5: initLookContent,
};

// 根据商品变化重新设置内容，并保留前面的设置项
const genNewContent = (content, skuVal, type) => {
    if (typeof type === "undefined") {
        console.log("type 类型值未正确获取");
    }
    const currentCon = initSkuObj[type](skuVal);
    const res = filterRes(currentCon, content);
    return res;
};

// 用心看
// 绑定内容
const lookGoodList = [
    {
        id: 111,
        medicinesName: "测试商品一",
        contentList: undefined,
    },
    {
        id: 222,
        medicinesName: "测试商品二",
        contentList: undefined,
    },
];

const loolConField = "contentList";
const conRule = /，/;
const lookConRule = /^(\d{1,},)*\d+$/;
const isBeyondLimit = value => {
    // 不能超过100
    let isBeyond = false;
    value.forEach(({ [loolConField]: contentList }) => {
        const articelArr = contentList.split(",");
        if (articelArr.length > 100) {
            isBeyond = true;
        }
    });
    return isBeyond;
};

const isObtCHComma = value => value.some(item => conRule.test(item[loolConField]));

// 验证只能输入数字和英文逗号
const lookConValid = value => value.some(item => !lookConRule.test(item[loolConField]));

const validLookCont = (rule, value, callback) => {
    if (Array.isArray(value)) {
        const isNull = value.some(item => !item[loolConField]);
        if (isNull) {
            callback("请输入文章ID");
        } else {
            if (isObtCHComma(value)) callback("请输入英文状态逗号");
            if (isBeyondLimit(value)) callback("文章个数不能超过100");
        }
    } else {
        callback("返回值格式不正确");
    }
    callback();
};

const getLookWholeLength = data => {
    if (data) {
        const splitArr = data.split(",").filter(item => item);
        return Array.isArray(splitArr) ? splitArr.length : 0;
    }
    return 0;
};

const getLengthArr = data => {
    if (Array.isArray(data) && data.length) {
        return data.map(({ contentList }) => getLookWholeLength(contentList));
    }

    return [];
};

const isLoolEQOne = data => {
    if (Array.isArray(data) && data.length) {
        const arr = getLengthArr(data);
        return arr.some(item => item === 1);
    }
    return false;
};

const isLkConEqual = data => {
    if (Array.isArray(data) && data.length) {
        const arr = getLengthArr(data);
        return new Set(arr).size === 1;
    }
    return false;
};

const getMinRew = (value = {}) => {
    const { readWhole: [{ x = 0 } = {}] = [] } = value;
    return x;
};

const validLookWhole = (data, callback) => {
    if (Array.isArray(data) && data.length) {
        const artLenArr = data.map(({ contentList }) => getLookWholeLength(contentList));
        if (new Set(artLenArr).size > 1) {
            callback("当前奖励规则对应的多个活动商品下的资讯数量不一致 不能选择奖励规则:按阅读完成度（每商品整体）");
        }
    }
};

const validMinRewGTArts = (content, reward, callback) => {
    if (Array.isArray(content) && content.length) {
        const artLenArr = content.map(({ contentList }) => getLookWholeLength(contentList));
        const maxConLen = Math.max(...artLenArr);
        const minRew = getMinRew(reward);
        if (maxConLen < minRew) {
            callback("每商品完整阅读篇数最小值超过文章篇数最大值, 此活动无法达成奖励");
        }
    }
};

// 用心看奖励规则
const lookCol = [
    {
        title: "condition",
        dataIndex: "condition",
        width: 150,
    },
    {
        title: "x",
        dataIndex: "x",
        width: 100,
        editable: true,
        _min: 1,
    },
    {
        title: "descrip",
        dataIndex: "descrip",
        width: 100,
        align: "center",
    },
    {
        title: "money",
        dataIndex: "y",
        editable: true,
        width: 100,
        align: "center",
    },
    {
        title: "unit",
        dataIndex: "unit",
        width: 50,
    },
];

const lookSingleRow = {
    condition: "每商品每篇阅读完成度达",
    x: undefined,
    descrip: "% 奖励",
    y: undefined,
    unit: "元",
};

const lookWholeRow = Object.assign({}, lookSingleRow, {
    condition: "每商品完整阅读篇数达",
    descrip: "篇 奖励",
});

const lookRewardInit = {
    rewardCycle: undefined,
    readSingle: [{ key: UUID(), ...lookSingleRow, rewardType: 1 }],
    readWhole: [{ key: UUID(), ...lookWholeRow, rewardType: 2 }],
};

function validRewRule(data, callback) {
    const { length } = data || [];
    // 非空校验
    const isNull = data.some(isUndefined);

    if (isNull) {
        callback("请填写必输内容");
    } else {
        if (length > 1) {
            // 下个数的值大于上个数的值
            const isNextGtPre = data.some((item, index) => {
                if (index > 0) {
                    return item.x <= data[index - 1].x || item.y < data[index - 1].y;
                }
                return false;
            });
            if (isNextGtPre) callback("下一行的值应该大于上一行的值");
        }
        const isXFull = data.every(item => quaXRule.test(item.x));
        if (!isXFull) callback("分数范围应该在1到100");

        const isYFull = data.every(item => quaYRule.test(item.y));
        if (!isYFull) callback("金额范围应该在1到999");
    }
    callback();
}

/**
 * 将字符串 时间戳 时间范围为时间
 * @param {*} data
 */
/* const transStrToMoment = data => {
    if (typeof data === "undefined") return data;
}; */

const tranToMoment = value => (moment.isMoment(value) && value) || moment(value);

const isBefore = (compareTime, refTime, scale = "second") => tranToMoment(compareTime).isBefore(tranToMoment(refTime), scale);
const getStrDate = (date, format = "YYYY-MM-DD") => moment(date).format(format);

// 活动时间
const format = "YYYY-MM-DD";
function getTime(value) {
    if (value) {
        return value.map(item => moment(item).format(format));
    }
    return value;
}

// 数据转换
const transContent = content => {
    if (Array.isArray(content) && content.length) {
        return content.map(item => {
            const { train: childItem = { title: "", content: "" } } = item;
            return childItem;
        });
    }

    return undefined;
};

// 将数组拍平
function tileArr(...otherProps) {
    const res = [];
    otherProps.forEach(item => res.push(...item));
    return res;
}

function transArticle(articleStr = "") {
    const splitArr = articleStr
        .split(",")
        .filter(item => item.replace(/\s*/g, ""))
        .map(item => ({ articleId: item }));
    return {
        contentList: splitArr,
    };
}

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

// 返回页面需要内容结构
function handleContent(data) {
    return data.map(item => Object.assign({}, { key: UUID() }, { train: { ...item } }));
}

function jointSaveContent(skuList) {
    if (Array.isArray(skuList) && skuList.length) {
        return skuList.map(item => {
            const { contentList, ...otherItem } = item;
            const newContent = handleContent(contentList);
            return { ...otherItem, contentList: newContent };
        });
    }
    return undefined;
}

function handleSku(data) {
    return data.map(({ contentList, ...otherData }) => otherData);
}

const qualityObj = {
    qualitySingle: [{ key: UUID(), ...quaSingleRow }],
    qualityWhole: [{ key: UUID(), ...quaWholeRow }],
};

const totalObj = {
    totalSingle: [{ key: UUID(), ...totalSingleRow }],
    totalWhole: [{ key: UUID(), ...totalWholeRow }],
};

// 1为按质量 2为按次数
const typeArr = [1, 2];

function filterTypeData(data, type) {
    // eslint-disable-next-line eqeqeq
    return data.filter(({ rewardType }) => rewardType == type);
}

const resRuleObj = {
    rewardQuality: {
        1: { field: "qualitySingle", value: quaSingleRow },
        2: { field: "qualityWhole", value: quaWholeRow },
    },
    rewardNum: {
        1: { field: "totalSingle", value: totalSingleRow },
        2: { field: "totalWhole", value: totalWholeRow },
    },
};

function filterChiidType(type, typeVal, data) {
    const { field, value } = resRuleObj[type][typeVal];
    const res = data.map(item => {
        const temp = Object.assign({}, { key: UUID() }, value, item);
        return temp;
    });

    return { [field]: res };
}

function filterTypeReward(data) {
    const { rewardQuality, rewardNum, ruleList } = data;
    const [qualityArr, totalArr] = typeArr.map(item => filterTypeData(ruleList, item));

    const qualityRes = Object.assign({}, qualityObj, rewardQuality ? filterChiidType("rewardQuality", rewardQuality, qualityArr) : {});
    const totalRes = Object.assign({}, totalObj, rewardNum ? filterChiidType("rewardNum", rewardNum, totalArr) : {});

    return { ...qualityRes, ...totalRes };
}

// 处理返回的规则
function handleRule(data) {
    const { rewardQuality, rewardNum } = data;
    if (!rewardQuality && !rewardNum) {
        return rewardInit;
    }
    const res = filterTypeReward(data);
    return { rewardQuality, rewardNum, ...res };
}

// 上传文件处理
function hanleFile(fileList) {
    if (Array.isArray(fileList)) {
        return fileList.map(item => {
            const { path, name } = item;
            return {
                uid: `-${UUID()}`,
                status: "done",
                url: path,
                path,
                name,
            };
        });
    }

    return [];
}

// 处理用心看内容回显
function jointLookCon(data) {
    const { skuList } = data;
    if (Array.isArray(skuList) && skuList.length) {
        const res = skuList.map(({ contentList, ...otherData }) => ({
            ...otherData,
            contentList: contentList.map(({ articleId }) => articleId).join(","),
        }));
        return { lookContent: res };
    }

    return { lookContent: undefined };
}

const lookRuleObj = {
    1: lookRewardInit.readSingle[0],
    2: lookRewardInit.readWhole[0],
};

function initLookEditRow(ruleList, row) {
    return ruleList.map(item => Object.assign({}, row, item, { key: UUID() }));
}

function jointLookRule(data) {
    const { rewardCycle, ruleList } = data;
    if (rewardCycle) {
        // eslint-disable-next-line eqeqeq
        const field = (rewardCycle == 1 && "readSingle") || "readWhole";
        return {
            trainingRuleList: Object.assign({}, { rewardCycle }, omit(lookRewardInit, ["rewardCycle"]), {
                [field]: initLookEditRow(ruleList, lookRuleObj[rewardCycle]),
            }),
        };
    }
    return { trainingRuleList: lookRewardInit };
}

function handleComRow(data) {
    const { venderId: facId, actTaskId: taskId, actStartTime, actEndTime, imgList, skuList, ...otherRow } = data;

    // 拼接报名时间、活动时间
    const actTime = toMoment([actStartTime, actEndTime]);
    // 拼接药企、任务
    const venderId = { key: `${facId}`, label: "药企测试" };
    const actTaskId = { key: `${taskId}`, label: "任务测试" };
    const otherData = omit(otherRow, ["rewardNum", "rewardQuality", "ruleList", "skuList"]);

    return {
        actTime,
        venderId,
        actTaskId,
        imgList: hanleFile(imgList),
        skuList: handleSku(skuList),
        ...otherData,
    };
}

function handleRow(data) {
    const { venderId: facId, actTaskId: taskId, actStartTime, actEndTime, skuList, ruleList, imgList, ...otherRow } = data;
    // 拼接报名时间、活动时间
    const actTime = toMoment([actStartTime, actEndTime]);
    // 拼接药企、任务
    const venderId = { key: `${facId}`, label: "药企测试" };
    const actTaskId = { key: `${taskId}`, label: "任务测试" };
    const newSkuList = handleSku(skuList);
    const trainContent = jointSaveContent(skuList);
    const ruleObj = { reward: handleRule(data) };
    const otherData = omit(otherRow, ["rewardNum", "rewardQuality", "ruleList"]);

    return {
        actTime,
        venderId,
        actTaskId,
        skuList: newSkuList,
        imgList: hanleFile(imgList),
        trainContent,
        ...ruleObj,
        ...otherData,
    };
}

function handleLookRow(data) {
    return {
        ...handleComRow(data),
        ...jointLookCon(data),
        ...jointLookRule(data),
    };
}

//  重置时初值对象
const resetObj = {
    actTaskId: { key: "", label: "" },
    actTime: undefined,
    skuList: [],
    budget: undefined,
    cycleNum: undefined,
    frequency: undefined,
};

function renderAlert(msg, { type = "error" } = {}) {
    return <Alert message = {msg} type = {type} showIcon />;
}

export {
    groupCols, // 活动组列定义
    genSearchField, // 任务请求
    taskPram, // 任务返回结果参数
    goodsList, // 商品列表
    trainCol, // 培训内容列定义
    trainEmptyRow, // 培训内容空行
    goodsCol, // 商品列定义
    validContent, // 内容验证方法
    validConCahe, // 内容验证商品列表初始化
    validGroup, // 活动组验证
    isLengthEqOne, // 每个商品只有一句话的校验
    isQuaqtityFit, // 按累积次数每商品整体验证
    qualityCol, // 每句话完成质量 整体完成质量
    quaSingleRow, // 每句话完成质量空行
    quaWholeRow, // 整体完成质量
    totalSingleCol, // 每句话累积次数
    totalSingleRow, // 每句话累积次数空行
    totalWholeRow, // 整体累积次数空行
    rewardInit, // 奖励组件无数据初始化值
    validReward, // 奖励验证
    getReward, // 获取分配奖励的值
    goodsFile, // 带商品的文件列表
    validPics, // 图片验证
    getDiffDays, // 获取考核周期
    goodsRealList,
    initContent,
    lookGoodList, // 用心看文章内容测试数据
    validLookCont, // 用心看内容验证
    validLookWhole, // 用心看每商品整体校验
    validMinRewGTArts, // 用心看奖励的最小值应该大于文档篇数的最大值
    lookCol, // 用心看列定义
    lookRewardInit, // 用心看初始化
    lookSingleRow,
    lookWholeRow,
    isBefore,
    getStrDate,
    getTime,
    transContent,
    tileArr,
    transArticle,
    handleRow,
    handleLookRow,
    initLookContent,
    ruleValidQua,
    validRewRule,
    genTextArr,
    qualityTitleArr,
    totalTitleArr,
    readArr,
    getReChecked,
    genNewContent,
    loolConField,
    isObtCHComma,
    isBeyondLimit,
    isLoolEQOne,
    isLkConEqual,
    lookConValid,
    resetObj, // 重置对象
    renderAlert, // 渲染警告框
};
