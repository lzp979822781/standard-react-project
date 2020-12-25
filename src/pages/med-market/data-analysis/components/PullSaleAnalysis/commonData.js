import React from "react";
import moment from "moment";
import pick from "lodash/pick";
import { TextRender, CombTextRender } from "@/components/complex-table";
import { isGy } from "@/utils/utils";

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
    goods: -1,
};

const resetMap = {
    venderId: pick(resetObj, ["actTaskId", "activity", "goods"]),
    actTaskId: pick(resetObj, ["activity", "goods"]),
    activity: pick(resetObj, ["goods"]),
};

const detailResetMap = {
    venderId: pick(resetObj, ["actTaskId", "activity"]),
    actTaskId: pick(resetObj, ["activity"]),
};

export { isFuzzyEmpty, resetMap, detailResetMap };

const actRes = {
    value: "id",
    text: "name",
};

const goodsRes = {
    value: "factorySkuId",
    text: "medicinesName",
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

/* const shopType = {
    1: "零售-单体药店",
    2: "零售-连锁总部",
    3: "批发-商业公司",
    4: "个体医疗/诊所",
    5: "营利性医疗机构",
    6: "非营利性医疗机构",
    7: "零售-连锁分公司",
    8: "零售-连锁门店",
    9: "工业",
}; */

const fieldArr = [
    { text: "报名门店数", field: "applyShopNum", title: "报名活动人员所属门店去重数量" },
    { text: "达成门店数", field: "finishShopNum", title: "参与活动并按照活动要求达成过动销奖励标准的人员所属门店去重数量" },
    { text: "报名人数", field: "applyPinNum", title: "报名活动的买家用户pin去重数量" },
    { text: "参与人数", field: "playPinNum", title: "参与活动的买家用户pin去重数量，只要按照活动要求提交过动销数据即可，无论是否达成均统计" },
    { text: "达成人数", field: "finishPinNum", title: "参与活动并按照活动要求达成过动销奖励标准的买家用户pin去重数量" },
    { text: "动销订单量", field: "orderNum", title: "参与活动人员上传并审批通过的小票数量之和" },
    { text: "动销数量", field: "packages", title: "参与活动人员上传并审批通过的动销数量之和" },
];

export { actRes, buyerArr, fieldArr, goodsRes };

const getStrDate = (date, format = "YYYY-MM-DD") => moment(date).format(format);

export { getStrDate };

function percentFormat(num, bits = 2) {
    if (typeof num === "number") {
        const parseNum = parseInt(num * 10 ** (bits + 2), 10) / 10 ** bits;
        return `${parseNum}%`;
    }

    return num;
}

function decimalFormat(num = "--", bits = 2) {
    if (typeof num === "number") {
        return parseInt(num * 10 ** bits, 10) / 10 ** bits;
    }

    return num;
}

const baseText = {
    applyShopNum: "报名活动的人员所属门店去重数量，与商品条件无关",
    finishShopNum: "参与活动并按照活动要求达成过动销奖励标准的人员所属门店去重数量，与商品条件无关",
    applyPinNum: "报名活动的买家用户pin去重数量，与商品条件无关",
    finishPinNum: "参与活动并按照活动要求达成过动销奖励标准的买家用户pin去重数量，与商品条件无关",
    packagesPercentage: "当前省份或城市动销数量占全部省份或城市的比例",
};

const commonCols = [
    {
        title: <CombTextRender text = "报名门店数" hoverText = {baseText.applyShopNum} />,
        dataIndex: "applyShopNum",
        width: 140,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成门店数" hoverText = {baseText.finishShopNum} />,
        dataIndex: "finishShopNum",
        width: 140,
        align: "right",
    },
    {
        title: <CombTextRender text = "报名人数" hoverText = {baseText.applyPinNum} />,
        dataIndex: "applyPinNum",
        width: 140,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "参与人数",
        dataIndex: "playPinNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成人数" hoverText = {baseText.finishPinNum} />,
        dataIndex: "finishPinNum",
        width: 130,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "动销订单量",
        dataIndex: "orderNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "动销数量",
        dataIndex: "packages",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {90} />,
    },
    {
        title: <CombTextRender text = "数量占比" hoverText = {baseText.packagesPercentage} />,
        dataIndex: "packagesPercentage",
        // width: 120,
        width: null,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text ? percentFormat(text, 4) : "--"} />,
    },
];
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
        width: 120,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
].concat(commonCols);

const cityCols = [
    {
        title: "排名",
        dataIndex: "index",
        width: 80,
        fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "城市",
        dataIndex: "city",
        width: 120,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
].concat(commonCols);

export { provinceCols, cityCols };

const detailComCols = [
    {
        title: "序号",
        dataIndex: "index",
        width: 80,
        fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "商品名称",
        dataIndex: "factorySkuName",
        width: 200,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "通用名",
        dataIndex: "factorySkuGenericName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "规格",
        dataIndex: "factorySkuSpecification",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "报名人员pin",
        dataIndex: "pin",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "所属门店名称",
        dataIndex: "shopName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
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
        dataIndex: "pinTypeStr",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "动销订单量",
        dataIndex: "orderNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "动销数量",
        dataIndex: "packages",
        // width: 160,
        align: "right",
        // render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
];

const rewardComCols = [
    {
        title: "序号",
        dataIndex: "index",
        width: 80,
        fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "报名人员pin",
        dataIndex: "pin",
        width: 200,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "所属门店名称",
        dataIndex: "shopName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
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
        dataIndex: "pinTypeStr",
        width: 200,
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
        // width: 160,
        // fixed: "right",
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
];

function genDifCols(data, index) {
    if (isGy) {
        data.splice(index, 1);
    }

    return data;
}

const detailCols = genDifCols(detailComCols, 4);
const rewardCols = genDifCols(rewardComCols, 1);

export { detailCols, rewardCols, decimalFormat };

const baseTableProp = {
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: totalNum => `共${totalNum}条`,
    pageSize: 10,
    position: "bottom",
};

export { baseTableProp };
