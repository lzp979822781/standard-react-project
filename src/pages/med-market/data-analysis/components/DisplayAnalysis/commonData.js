/* eslint-disable import/extensions */
import React from "react";
import { Icon, Tooltip } from "antd";
import moment from "moment";
import pick from "lodash/pick";
import { TextRender } from "@/components/complex-table";

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

// function decimalFormat(num, bits = 2) {
//     if (typeof num === "number") {
//         return parseInt(num * 10 ** bits, 10) / 10 ** bits;
//     }

//     return num;
// }

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
    goods: { key: "", label: "" },
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
    { text: "报名门店数", field: "applyPinNum", title: "报名活动的门店去重数量" },
    { text: "参与门店数", field: "playPinNum", title: "参与活动的门店去重数量，只要按照活动要求有过陈列活动提交记录即可，无论是否达成均统计" },
    { text: "达成门店数", field: "finishPinNum", title: "参与活动并按照活动要求有过审批通过记录的门店去重数量" },
    { text: "门店陈列天数", field: "displayDays", title: "参与活动门店达成的陈列天数之和，单门店陈列天数=门店每陈列周期天数×审批通过的周期数" },
];

const fieldArrGy = [
    { text: "报名门店数", field: "applyPinNum", title: "报名活动的门店去重数量" },
    { text: "参与门店数", field: "playPinNum", title: "参与活动的门店去重数量，只要按照活动要求有过陈列活动提交记录即可，无论是否达成均统计" },
    { text: "达成门店数", field: "finishPinNum", title: "参与活动并按照活动要求有过审批通过记录的门店去重数量" },
];

export { actRes, buyerArr, fieldArr, goodsRes, fieldArrGy };

const getStrDate = (date, format = "YYYY-MM-DD") => moment(date).format(format);

export { getStrDate };

function percentFormat(num, bits = 2) {
    if (typeof num === "number") {
        const parseNum = parseInt(num * 10 ** (bits + 2), 10) / 10 ** bits;
        return `${parseNum}%`;
    }

    return num;
}

const renderTitle = (title, desc) => (
    <div>
        {title}
        <Tooltip placement = "top" title = {desc}>
            <span style = {{ marginLeft: 4 }}>
                <Icon type = "question-circle" />
            </span>
        </Tooltip>
    </div>
);

const commonCols = [
    {
        title: renderTitle("报名门店数", "报名活动的门店去重数量"),
        dataIndex: "applyPinNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("参与门店数", "参与活动的门店去重数量，只要按照活动要求有过陈列活动提交记录即可，无论是否达成均统计"),
        dataIndex: "playPinNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("达成门店数", "参与活动并按照活动要求有过审批通过记录的门店去重数量"),
        dataIndex: "finishPinNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("门店陈列天数", "参与活动门店达成的陈列天数之和，单门店陈列天数=门店每陈列周期天数×审批通过的周期数"),
        dataIndex: "displayDays",
        width: 120,
        hideGy: true,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("天数占比", "当前省份或城市陈列天数占全部省份或城市的比例"),
        dataIndex: "displayDaysPercentage",
        align: "right",
        render: text => (text ? percentFormat(text, 4) : "--"),
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
        render: text => <TextRender multiEllipse = {1} text = {text} width = {90} />,
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
        render: text => <TextRender multiEllipse = {1} text = {text} width = {90} />,
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
        title: "报名人员pin",
        dataIndex: "pin",
        width: 150,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {120} />,
    },
    {
        title: "报名门店名称",
        dataIndex: "pinName",
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
        width: 140,
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
        width: 120,
        align: "right",
        hideGy: true,
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: "门店奖励金额",
        dataIndex: "storesRewards",
        width: 120,
        align: "right",
        hideGy: true,
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
        // render: text => <TextRender multiEllipse = {1} text = {text && typeof text !== "number" ? decimalFormat(text) : "--"} />,
    },
    {
        title: "分公司奖励金额",
        dataIndex: "branchRewards",
        width: 150,
        align: "right",
        hideGy: true,
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
        // render: text => <TextRender multiEllipse = {1} text = {text && typeof text !== "number" ? decimalFormat(text) : "--"} />,
    },
    {
        title: "总部奖励金额",
        dataIndex: "headquarterRewards",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
        hideGy: true,
        // render: text => <TextRender multiEllipse = {1} text = {text && typeof text !== "number" ? decimalFormat(text) : "--"} />,
    },
    {
        title: "门店陈列天数",
        dataIndex: "displayDays",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
];

export { detailCols };

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
