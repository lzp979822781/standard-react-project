/* eslint-disable import/extensions */
import React from "react";
import { Icon, Tooltip } from "antd";
import moment from "moment";
import pick from "lodash/pick";
// import { formatNum } from "@/utils/utils";
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

export { genSearchField, taskPram };

// FuzzySearch 非空验证函数
function isFuzzyEmpty(value = {}) {
    const { key } = value;
    return !key;
}

//  重置时初值对象
const resetObj = {
    taskId: { key: "", label: "" },
    activity: { key: "", label: "" },
};

const resetMap = {
    venderId: pick(resetObj, ["taskId", "activity"]),
    actTaskId: pick(resetObj, ["activity"]),
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
    { text: "活动出库订单量", field: "orderOutNum", title: "活动出库订单量" },
    { text: "活动出库数量", field: "skuOutNum", title: "活动出库数量" },
    { text: "报名买家数", field: "applyPinNum", title: "报名活动的买家去重数量，与商品及商业公司条件无关" },
    { text: "参与买家数", field: "playPinNum", title: "参与活动，且购买对应商业公司、对应商品的买家去重数量，只要按照活动要求在活动内有过采购记录即可，无论是否达成均统计" },
    { text: "达成买家数", field: "finishPinNum", title: "参与活动并按照活动要求达成过采购奖励标准的买家去重数量，与商品及商业公司条件无关" },
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

// function decimalFormat(num, bits = 2) {
//     if (typeof num === "number") {
//         return parseInt(num * 10 ** bits, 10) / 10 ** bits;
//     }

//     return num;
// }

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
        title: renderTitle("出库订单量", "参与活动的买家采购订单量，按照出库口径"),
        dataIndex: "orderOutNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("出库数量", "参与活动的买家采购数量，按照出库口径"),
        dataIndex: "skuOutNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("数量占比", "当前省份或城市出库数量占全部省份或城市的比例"),
        dataIndex: "outNumPercentage",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? percentFormat(text, 4) : "--"} />,
    },
    {
        title: renderTitle("报名买家数", "报名活动的买家去重数量，与商品及商业公司条件无关"),
        dataIndex: "applyPinNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("参与买家数", "参与活动，且购买对应商业公司、对应商品的买家去重数量，只要按照活动要求在活动内有过采购记录即可，无论是否达成均统计"),
        dataIndex: "playPinNum",
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    // {
    //     title: renderTitle("达成买家数", "参与活动并按照活动要求达成过采购奖励标准的买家去重数量，与商品及商业公司条件无关"),
    //     dataIndex: "finishPinNum",
    //     align: "right",
    //     render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    // }
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

const detailCols = [
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
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} width = {170} />,
    },
    {
        title: "通用名",
        dataIndex: "factorySkuGenericName",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} width = {100} />,
    },
    {
        title: "规格",
        dataIndex: "factorySkuSpecification",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} />,
    },
    {
        title: "商业公司名称",
        dataIndex: "venderName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} width = {170} />,
    },
    {
        title: "买家公司名称",
        dataIndex: "pinName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} width = {170} />,
    },
    {
        title: "省份",
        dataIndex: "province",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} />,
    },
    {
        title: "城市",
        dataIndex: "city",
        width: 140,
    },
    {
        title: "地区",
        dataIndex: "county",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} />,
    },
    {
        title: "买家类型",
        dataIndex: "pinTypeName",
        width: 150,
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} />,
    },
    {
        title: renderTitle("出库订单量", "参与活动的买家采购订单量，按照出库口径"),
        dataIndex: "orderOutNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("出库数量", "参与活动的买家采购数量，按照出库口径"),
        dataIndex: "skuOutNum",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: renderTitle("出库金额", "参与活动的买家采购应付金额，按照出库口径"),
        dataIndex: "skuOutAmount",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
        hideGy: true,
    },
];

const rewardCols = [
    {
        title: "序号",
        dataIndex: "index",
        width: 80,
        fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "买家pin",
        dataIndex: "pin",
        width: 200,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "买家公司名",
        dataIndex: "pinCompanyName",
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
        title: "买家类型",
        dataIndex: "pinTypeName",
        width: 150,
        render: text => <TextRender multiEllipse = {1} text = {text || "--"} />,
    },
    {
        title: "门店奖励金额",
        dataIndex: "shopRewards",
        width: 120,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
        hideGy: true,
    },
    {
        title: "总部奖励金额",
        dataIndex: "headquarterRewards",
        width: 200,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
        hideGy: true,
    },
];

export { detailCols, rewardCols };

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
