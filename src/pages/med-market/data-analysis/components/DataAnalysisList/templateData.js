import React from "react";
import { Icon, Tooltip } from "antd";
import moment from "moment";
import { TextRender } from "@/components/complex-table";
import FuzzySearch from "@/components/FuzzySearch";
import PercentageBar from "./PercentageBar";
import { urlPrefix, formatNum } from "@/utils/utils";
import { taskPram, genSearchField } from "../../../activity-pull-sales/components/PullSaleCreate/validate";

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

export const formTplData = [
    {
        label: "药企名称",
        key: "venderId",
        options: {
            initialValue: { key: "", label: "" },
        },
        props: {
            url: `${urlPrefix}vender/factory/list`,
            resParam: {
                value: "venderId",
                text: "companyName",
            },
            searchFields: {
                searchField: "companyName",
            },
        },
        component: FuzzySearch,
        init: 1, // 1为初始化，2初始化
        effect: ["actTask"],
    },
    {
        label: "任务名称",
        key: "actTask",
        // component: (
        //     <FuzzySearch
        //         url = {`${urlPrefix}act/task/queryList`}
        //         resParam = {taskPram}
        //         searchFields = {genSearchField({
        //             value: "",
        //         })}
        //     />
        // ),
        init: 1, // 1为初始化，2初始化
        component: FuzzySearch,
        param: "venderId",
        props: {
            url: `${urlPrefix}act/task/queryList`,
            resParam: taskPram,
            searchFields: genSearchField({
                value: "",
            }),
        },
        options: {
            initialValue: { key: "", label: "" },
        },
    },
];

export const formTplData1 = [
    {
        label: "任务名称",
        key: "actTask",
        // component: (
        //     <FuzzySearch
        //         url = {`${urlPrefix}act/task/queryList`}
        //         resParam = {taskPram}
        //         searchFields = {genSearchField({
        //             value: "",
        //         })}
        //     />
        // ),
        init: 1, // 1为初始化，2初始化
        component: FuzzySearch,
        param: "venderId",
        props: {
            url: `${urlPrefix}act/task/queryList`,
            resParam: taskPram,
            searchFields: genSearchField({
                value: "",
            }),
        },
        options: {
            initialValue: { key: "", label: "" },
        },
    },
];

const baseColumus = [
    {
        title: "活动ID",
        dataIndex: "actId",
        width: 100,
        fixed: "left",
    },
    {
        title: "活动名称",
        dataIndex: "actName",
        width: 180,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {150} />,
    },
    {
        title: "活动开始时间",
        dataIndex: "actStartTime",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
    {
        title: "活动结束时间",
        dataIndex: "actEndTime",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
    {
        title: "活动创建时间",
        dataIndex: "actCreated",
        width: 200,
        render: text => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
        title: "活动状态",
        dataIndex: "actStatusName",
        width: 150,
    },
    {
        title: "活动预算",
        dataIndex: "actBudget",
        width: 150,
        hideGy: true,
        align: "right",
        render: text => text || "--",
        // render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: "已奖励金额",
        dataIndex: "alreadyRewardsAmount",
        width: 150,
        hideGy: true,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("奖金池发放占比", "活动累计已发放奖金/活动设置的奖金上限"),
        dataIndex: "rewardedPercentage",
        width: 220,
        hideGy: true,
        render: text => <PercentageBar percent = {text} />,
    },
];

const baseColumusTrain = [
    {
        title: "活动ID",
        dataIndex: "actId",
        width: 100,
        fixed: "left",
    },
    {
        title: "活动名称",
        dataIndex: "actName",
        width: 180,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {150} />,
    },
    {
        title: "培训类型",
        dataIndex: "actType",
        width: 150,
        render: text => (text === 4 ? "京采说" : "用心看"),
    },
    {
        title: "活动开始时间",
        dataIndex: "actStartTime",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
    {
        title: "活动结束时间",
        dataIndex: "actEndTime",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
    {
        title: "活动创建时间",
        dataIndex: "actCreated",
        width: 200,
        render: text => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
        title: "活动状态",
        dataIndex: "actStatusName",
        width: 150,
    },
    {
        title: "活动预算",
        dataIndex: "actBudget",
        width: 150,
        hideGy: true,
        align: "right",
        render: text => text || "--",
        // render: text => <TextRender multiEllipse = {1} text = {typeof text === "number" ? text : "--"} />,
    },
    {
        title: "已奖励金额",
        dataIndex: "alreadyRewardsAmount",
        width: 150,
        hideGy: true,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("奖金池发放占比", "活动累计已发放奖金/活动设置的奖金上限"),
        dataIndex: "rewardedPercentage",
        width: 220,
        hideGy: true,
        render: text => <PercentageBar percent = {text} />,
    },
];

// 采购表格模版数据
const columnsCollect = baseColumus.concat([
    {
        title: renderTitle("报名买家数", "报名活动的买家去重数量"),
        dataIndex: "applyPinNum",
        width: 150,
        align: "right",
    },
    {
        title: renderTitle("参与买家数", "参与活动的买家去重数量，只要按照活动要求在活动内有过采购记录即可，无论是否达成均统计"),
        dataIndex: "playPinNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("达成买家数", "参与活动并按照活动要求达成过采购奖励标准的买家去重数量"),
        dataIndex: "finishPinNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("出库订单量", "参与活动的买家采购订单量，按照出库口径"),
        dataIndex: "orderOutNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("出库数量", "参与活动的买家采购数量，按照出库口径"),
        dataIndex: "skuOutNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("出库金额", "参与活动的买家采购应付金额，按照出库口径"),
        dataIndex: "skuOutAmount",
        width: 150,
        align: "right",
        hideGy: true,
        render: text => formatNum(text),
    },
    {
        title: renderTitle("门店奖励金额", "门店采购获得的奖励金额，除连锁以外的买家类型均记为门店"),
        dataIndex: "storesRewards",
        width: 150,
        align: "right",
        hideGy: true,
        render: text => text || "--",
        // render: text => formatNum(text),
    },
    {
        title: renderTitle("总部奖励金额", "连锁店总部采购获得的奖励金额"),
        dataIndex: "headquarterRewards",
        width: 150,
        align: "right",
        hideGy: true,
        render: text => text || "--",
        // render: text => formatNum(text),
    },
]);

// 陈列表格模版数据
const columnsDisplay = baseColumus.concat([
    {
        title: renderTitle("报名门店数", "报名活动的门店去重数量"),
        dataIndex: "applyShopNum",
        width: 150,
        align: "right",
    },
    {
        title: renderTitle("参与门店数", "参与活动的门店去重数量，只要按照活动要求有过陈列活动提交记录即可，无论是否达成均统计"),
        dataIndex: "playShopNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("达成门店数", "参与活动并按照活动要求有过审批通过记录的门店去重数量"),
        dataIndex: "finishShopNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("门店陈列天数", "参与活动门店达成的陈列天数之和，单门店陈列天数=门店每陈列周期天数×审批通过的周期数"),
        dataIndex: "displayDays",
        width: 150,
        align: "right",
        hideGy: true,
        render: text => text || "--",
    },
    {
        title: renderTitle("店员奖励金额", "店员pin获得奖励的金额"),
        dataIndex: "clerkRewards",
        width: 150,
        align: "right",
        hideGy: true,
        render: text => text || "--",
    },
    {
        title: renderTitle("门店奖励金额", "店长pin获得的奖励金额+店长下级返给店长的奖励金额"),
        dataIndex: "storesRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
        // render: text => formatNum(text),
    },
    {
        title: renderTitle("分公司奖励金额", "分公司pin获得的奖励金额+分公司下级返给分公司的奖励金额"),
        dataIndex: "branchRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
        // render: text => formatNum(text),
    },
    {
        title: renderTitle("总部奖励金额", "总部pin获得的奖励金额+总部下级返给总部的奖励金额"),
        dataIndex: "headquarterRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
        // render: text => formatNum(text),
    },
]);

// 动销表格模版数据
const columnsPullSales = baseColumus.concat([
    {
        title: renderTitle("报名门店数", "报名活动人员所属门店去重数量"),
        dataIndex: "applyShopNum",
        width: 150,
        align: "right",
    },
    {
        title: renderTitle("达成门店数", "参与活动并按照活动要求达成过动销奖励标准的人员所属门店去重数量"),
        dataIndex: "finishShopNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("报名人数", "报名活动的买家用户pin去重数量"),
        dataIndex: "applyPeopleNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("参与人数", "参与活动的买家用户pin去重数量，只要按照活动要求提交过动销数据即可，无论是否达成均统计"),
        dataIndex: "playPeopleNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("达成人数", "参与活动并按照活动要求达成过动销奖励标准的买家用户pin去重数量"),
        dataIndex: "finishPeopleNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("动销订单量", "参与活动人员上传并审批通过的小票数量之和"),
        dataIndex: "movePinOrderNum",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("动销数量", "参与活动人员上传并审批通过的动销数量之和"),
        dataIndex: "movePinPackages",
        width: 150,
        align: "right",
        render: text => text || "--",
    },
    {
        title: renderTitle("店员奖励金额", "店员pin获得奖励的金额"),
        dataIndex: "clerkRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
    },
    {
        title: renderTitle("门店奖励金额", "店长pin获得的奖励金额+店长下级返给店长的奖励金额"),
        dataIndex: "storesRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
    },
    {
        title: renderTitle("分公司奖励金额", "分公司pin获得的奖励金额+分公司下级返给分公司的奖励金额"),
        dataIndex: "branchRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
    },
    {
        title: renderTitle("总部奖励金额", "总部pin获得的奖励金额+总部下级返给总部的奖励金额"),
        dataIndex: "headquarterRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
    },
]);

// 培训表格模版数据
const columnsTrain = baseColumusTrain.concat([
    {
        title: renderTitle("参与门店数", "参与活动人员所属门店去重数量，只要按照活动要求有过参与记录即可，无论是否达成均统计"),
        dataIndex: "playShopNum",
        width: 150,
        align: "right",
    },
    {
        title: renderTitle("达成门店数", "参与活动并按照活动要求达成过培训奖励标准的人员所属门店去重数量"),
        dataIndex: "finishShopNum",
        width: 150,
        align: "right",
        hideGy: true,
    },
    {
        title: renderTitle("参与人数", "参与活动的买家用户pin去重数量，只要按照活动要求有过参与记录即可，无论是否达成均统计"),
        dataIndex: "playPeopleNum",
        width: 150,
        align: "right",
    },
    {
        title: renderTitle("达成人数", "参与活动并按照活动要求达成过培训奖励标准的买家用户pin去重数量"),
        dataIndex: "finishPeopleNum",
        width: 150,
        align: "right",
    },
    {
        title: renderTitle("参与人次", "买家用户pin参与活动的次数之和，每个周期内只要有过参与记录即算作参与一次，一个周期内达成多个阶梯依然算参与一次"),
        dataIndex: "applyNum",
        width: 150,
        align: "right",
    },
    {
        title: renderTitle("达成人次", "买家用户pin参与活动并达成的次数之和，每个周期内只要有过参与记录并审批通过即算作达成一次，一个周期内达成多个阶梯依然算达成一次"),
        dataIndex: "finishNum",
        width: 150,
        align: "right",
    },
    {
        title: renderTitle("店员奖励金额", "店员pin获得奖励的金额"),
        dataIndex: "clerkRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
    },
    {
        title: renderTitle("门店奖励金额", "店长pin获得的奖励金额"),
        dataIndex: "storesRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
    },
    {
        title: renderTitle("分公司奖励金额", "分公司pin获得的奖励金额"),
        dataIndex: "branchRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
    },
    {
        title: renderTitle("总部奖励金额", "总部pin获得的奖励金额"),
        dataIndex: "headquarterRewards",
        width: 150,
        align: "right",
        render: text => text || "--",
        hideGy: true,
    },
]);

export const collectHeader = [
    { label: "活动数量", key: "actNum" },
    { label: "累计出库数量", key: "skuOutNum" },
    { label: "累计出库金额", key: "skuOutAmount", hideGy: true },
    { label: "累计奖励金额", key: "rewards", hideGy: true },
];
export const displayHeader = [
    { label: "活动数量", key: "actNum" },
    { label: "累计陈列天数", key: "displayDays" },
    { label: "累计奖励金额", key: "rewards", hideGy: true },
    { label: "累计达成门店数", key: "finishShopNum" },
];
export const pullSalesHeader = [
    { label: "活动数量", key: "actNum" },
    { label: "累计动销数量", key: "movePinNum" },
    { label: "累计奖励金额", key: "rewards", hideGy: true },
    { label: "累计达成人数", key: "num" },
];
export const trainHeader = [
    { label: "活动数量", key: "actNum" },
    { label: "累计达成人次", key: "finishNum" },
    { label: "累计奖励金额", key: "rewards", hideGy: true },
    { label: "累计达成人数", key: "num" },
];

export { columnsCollect, columnsDisplay, columnsPullSales, columnsTrain };
