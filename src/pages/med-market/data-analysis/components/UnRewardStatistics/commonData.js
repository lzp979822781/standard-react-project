import React from "react";
import moment from "moment";
import pick from "lodash/pick";
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
};

const resetMap = {
    venderId: pick(resetObj, ["actTaskId"]),
};

export { isFuzzyEmpty, resetMap };

const actObj = {
    1: "陈列",
    2: "采购",
    3: "动销",
    4: "培训-京采说",
    5: "培训-用心看",
};

// 获取活动类型
const getActType = type => {
    if (type) {
        return actObj[type];
    }
    return "";
};

const getStrDate = (date, format = "YYYY-MM-DD") => (typeof date !== "undefined" ? moment(date).format(format) : "");

const getTimeStamp = date => (typeof date !== "undefined" ? moment(date).valueOf() : date);

export { getActType, getStrDate, getTimeStamp };

const detailText = {
    finishPinNum: "参与活动并按照活动要求达成过活动奖励标准的用户pin去重数量",
    preRewards: "不考虑奖金池上限情况下，根据达成情况应奖励的金额",
    rewardPinNum: "达成活动奖励标准并实际获得奖励的用户pin去重数量",
    realRewards: "达成活动奖励标准并实际获得奖励的金额",
    noRewardPinNum: "达成活动奖励标准但未获得奖励的用户pin去重数量",
    noRewards: "达成活动奖励标准但未获得奖励的金额",
};
const detailCols = [
    {
        title: "序号",
        dataIndex: "index",
        width: 80,
        fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "活动id",
        dataIndex: "actId",
        width: 120,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "活动名称",
        dataIndex: "actName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "活动开始时间",
        dataIndex: "actStartTime",
        width: 150,
        render: text => <TextRender multiEllipse = {1} text = {getStrDate(text)} width = {120} />,
    },
    {
        title: "活动结束时间",
        dataIndex: "actEndTime",
        width: 150,
        render: text => <TextRender multiEllipse = {1} text = {getStrDate(text)} width = {120} />,
    },
    {
        title: "活动创建时间",
        dataIndex: "actCreated",
        width: 240,
        render: text => <TextRender multiEllipse = {1} text = {getStrDate(text, "YYYY-MM-DD HH:mm:ss")} width = {210} />,
    },
    {
        title: "活动类型",
        dataIndex: "actTypeText",
        width: 120,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成人数" hoverText = {detailText.applyShopNum} />,
        dataIndex: "finishPinNum",
        width: 140,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "应奖励金额" hoverText = {detailText.preRewards} />,
        dataIndex: "preRewards",
        width: 150,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成且奖励人数" hoverText = {detailText.rewardPinNum} />,
        dataIndex: "rewardPinNum",
        width: 180,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "实际奖励金额" hoverText = {detailText.realRewards} />,
        dataIndex: "realRewards",
        width: 160,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成未奖励人数" hoverText = {detailText.noRewardPinNum} />,
        dataIndex: "noRewardPinNum",
        width: 180,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成未奖励金额" hoverText = {detailText.noRewards} />,
        dataIndex: "noRewards",
        width: null,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {130} />,
    },
];

const checkText = {
    preRewards: "不考虑奖金池上限情况下，根据达成情况应奖励的金额",
    realRewards: "参与活动并实际获得奖励的金额",
    noRewards: "达成活动且未获得奖励的金额",
};

const checkListCols = [
    {
        title: "序号",
        dataIndex: "index",
        width: 80,
        // fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "达成未奖励账号",
        dataIndex: "noRewardPin",
        width: 150,
        // fixed: 'left',
        render: text => <TextRender multiEllipse = {1} text = {text} width = {120} />,
    },
    {
        title: "买家公司名称",
        dataIndex: "company",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "账号类型",
        dataIndex: "pinTypeText",
        width: 150,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "应奖励金额" hoverText = {checkText.preRewards} />,
        dataIndex: "preRewards",
        width: 160,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "实际奖励金额" hoverText = {checkText.realRewards} />,
        dataIndex: "realRewards",
        width: 200,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: <CombTextRender text = "达成未奖励金额" hoverText = {checkText.noRewards} />,
        dataIndex: "noRewards",
        width: 160,
        align: "right",
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
];

export { detailCols, checkListCols };
