import React from "react";
import moment from "moment";
import pick from "lodash/pick";
import { isGy } from "@/utils/utils";
import { TextRender, CombTextRender } from "@/components/complex-table";

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

export { genSearchField, taskPram };

// FuzzySearch 非空验证函数
function isFuzzyEmpty(value = {}) {
    const { key } = value;
    return !key;
}

//  重置时初值对象
const resetObj = {
    actTaskId: { key: "", label: "" },
    activity: { key: "", label: "" },
};

const resetMap = {
    venderId: pick(resetObj, ["actTaskId", "activity"]),
    actTaskId: pick(resetObj, ["activity"]),
};

export { isFuzzyEmpty, resetMap };

const trainRes = {
    value: "id",
    text: "name",
};

// 买家类型数据
const buyerArr = [
    { key: -1, text: "全部" },
    { key: 1, text: "零售-单体药店" },
    { key: 2, text: "零售-连锁总部" },
    { key: 3, text: "批发-商业公司" },
    { key: 4, text: "个体医疗/诊所" },
    { key: 5, text: "营利性医疗机构" },
    { key: 6, text: "非营利性医疗机构" },
    { key: 7, text: "零售-连锁分公司" },
    { key: 8, text: "零售-连锁门店" },
    { key: 9, text: "工业" },
];

const shopType = {
    1: "零售-单体药店",
    2: "零售-连锁总部",
    3: "批发-商业公司",
    4: "个体医疗/诊所",
    5: "营利性医疗机构",
    6: "非营利性医疗机构",
    7: "零售-连锁分公司",
    8: "零售-连锁门店",
    9: "工业",
};
const commonArr = [
    { text: "参与门店数", field: "applyShopNum", title: "参与活动人员所属门店去重数量，只要按照活动要求有过参与记录即可，无论是否达成均统计" },
    { text: "参与人数", field: "applyPinNum", title: "参与活动的买家用户pin去重数量，只要按照活动要求有过参与记录即可，无论是否达成均统计" },
    { text: "达成人数", field: "finishPinNum", title: "参与活动并按照活动要求达成过培训奖励标准的买家用户pin去重数量" },
    { text: "参与人次", field: "applyNum", title: "买家用户pin参与活动的次数之和，每个周期内只要有过参与记录即算作参与一次，一个周期内达成多个阶梯依然算参与一次" },
    { text: "达成人次", field: "applyNum", title: "买家用户pin参与活动并达成的次数之和，每个周期内只要有过参与记录并审批通过即算作达成一次，一个周期内达成多个阶梯依然算达成一次" },
];

const manObj = { text: "达成门店数", field: "finishShopNum", title: "参与活动并按照活动要求达成过培训奖励标准的人员所属门店去重数量" };
function genFieldArr(data, insertObj) {
    if (!isGy) {
        data.splice(1, 0, insertObj);
    }

    return data;
}

const fieldArr = genFieldArr(commonArr, manObj);

export { trainRes, buyerArr, fieldArr };

// 获取活动类型
const getActType = type => {
    if (type) {
        return type === 4 ? "京采说" : "用心看";
    }
    return "";
};

const getStrDate = (date, format = "YYYY-MM-DD") => moment(date).format(format);

export { getActType, getStrDate };

/* function percentFormat(num, bits = 4) {
    if (typeof num === "number") {
        const parseNum = parseInt(num * 10 ** (bits + 2), 10) / 10 ** bits;
        return `${parseNum}%`;
    }

    return num;
} */

const baseText = {
    finishPinNumPercentage: "当前省份或城市达成人数占全部省份或城市的比例",
    finishNumPercentage: "当前省份或城市达成人次占全部省份或城市的比例",
};

const baseCols = [
    {
        title: "参与门店数",
        dataIndex: "applyShopNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "参与人数",
        dataIndex: "applyPinNum",
        width: 100,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "达成人数",
        dataIndex: "finishPinNum",
        width: 100,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成人数占比" hoverText = {baseText.finishPinNumPercentage} />,
        dataIndex: "finishPinNumPercentage",
        width: 160,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text ? `${text}%` : ""} />,
    },
    {
        title: "参与人次",
        dataIndex: "applyNum",
        width: 100,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "达成人次",
        dataIndex: "finishNum",
        width: 100,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成人次占比" hoverText = {baseText.finishNumPercentage} />,
        dataIndex: "finishNumPercentage",
        width: null,
        align: "right",
        render: text => <TextRender multiEllipse = {2} text = {text ? `${text}%` : ""} />,
    },
];

const manCol = {
    title: "达成门店数",
    dataIndex: "finishShopNum",
    width: 120,
    align: "right",
};

const commonCols = genFieldArr(baseCols, manCol);

const provinceCols = [
    {
        title: "排名",
        dataIndex: "index",
        width: 80,
        fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "省份",
        dataIndex: "province",
        width: 80,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {30} />,
    },
].concat(commonCols);

const cityCols = [
    {
        title: "排名",
        dataIndex: "index",
        width: 50,
        fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "城市",
        dataIndex: "city",
        width: 50,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {50} />,
    },
].concat(commonCols);

export { provinceCols, cityCols };

const detailCols = [
    {
        title: "序号",
        dataIndex: "index",
        width: 80,
        fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "参与店员pin",
        dataIndex: "pin",
        fixed: "left",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} width = {90} />,
    },
    {
        title: "参与门店名称",
        dataIndex: "shopName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "省份",
        dataIndex: "province",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "城市",
        dataIndex: "city",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "地区",
        dataIndex: "county",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "门店类型",
        dataIndex: "shopType",
        width: 160,
        render: text => <TextRender multiEllipse = {1} text = {text ? shopType[text] : text} />,
    },
    {
        title: "参与次数",
        dataIndex: "applyNum",
        width: 120,
        align: "rigth",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "达成次数",
        dataIndex: "finishNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "店员奖励金额",
        dataIndex: "clerkRewards",
        width: 160,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "门店奖励金额",
        dataIndex: "storesRewards",
        width: 160,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "分公司奖励金额",
        dataIndex: "branchRewards",
        width: 160,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "总部奖励金额",
        dataIndex: "headquarterRewards",
        width: null,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
];

export { detailCols };
