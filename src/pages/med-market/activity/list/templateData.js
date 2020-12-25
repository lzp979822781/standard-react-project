/* eslint-disable import/extensions */
import React from "react";
import { Select, DatePicker, Tooltip, Icon } from "antd";
import moment from "moment";
import { TextRender } from "@/components/complex-table";
import FuzzySearch from "@/components/FuzzySearch";
import { urlPrefix } from "@/utils/utils";
// import YaoSelect from "../display-create/YaoSelect";
import { actType, actStatus } from "./actStatus";
import { taskPram, genSearchField } from "../../activity-pull-sales/components/PullSaleCreate/validate";

const { RangePicker } = DatePicker;
const { Option } = Select;

// 表格模版数据
export const columns = [
    {
        title: "活动名称",
        dataIndex: "name",
        width: 200,
        fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "药企名称",
        dataIndex: "venderName",
        width: 200,
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "任务ID",
        dataIndex: "actTaskId",
        width: 100,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
    },
    {
        title: "任务名称",
        dataIndex: "actTaskName",
        width: 180,
        render: text => <TextRender multiEllipse = {1} text = {text} width = {150} />,
    },
    {
        title: "活动类型",
        dataIndex: "type",
        width: 120,
        render: text => actType[text - 1],
    },
    {
        title: "活动ID",
        dataIndex: "id",
        width: 150,
        render: text => <TextRender multiEllipse = {1} text = {text} />,
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
        title: "活动状态",
        dataIndex: "realStatus",
        width: 150,
        render: (text, record) => (
            <div>
                <span style = {{ marginRight: 6 }}>{actStatus[text]}</span>
                {[4, 6].includes(text) ? (
                    <Tooltip title = {record.opinion || "--"}>
                        <Icon type = "question-circle" />
                    </Tooltip>
                ) : null}
            </div>
        ),
    },
    {
        title: "审核人",
        dataIndex: "auditor",
        width: 150,
        render: text => text || "--",
    },
    {
        title: "创建/操作人",
        dataIndex: "creator",
    },
];

const comRangePicker = <RangePicker />;

const compType = (
    <Select placeholder = "选择状态">
        <Option value = "0">全部</Option>
        <Option value = "1">陈列</Option>
        <Option value = "2">采购</Option>
        <Option value = "3">动销</Option>
        <Option value = "4">培训-京采说</Option>
        <Option value = "5">培训-用心看</Option>
    </Select>
);

const compStatus = (
    <Select placeholder = "选择状态">
        <Option value = "0">全部</Option>
        <Option value = "1">草稿</Option>
        <Option value = "2">运营待审核</Option>
        <Option value = "3">药企待审核</Option>
        <Option value = "4">运营审核驳回</Option>
        <Option value = "5">药企审核通过</Option>
        <Option value = "6">药企审核驳回</Option>
        <Option value = "105">已中止</Option>
        <Option value = "100">等待报名</Option>
        <Option value = "101">报名中</Option>
        <Option value = "103">等待进行中</Option>
        <Option value = "102">进行中</Option>
        <Option value = "104">已结束</Option>
    </Select>
);

export const formTplData = [
    {
        label: "活动ID",
        key: "id",
    },
    {
        label: "活动名称",
        key: "name",
    },
    {
        label: "活动时间",
        key: "rangeTime",
        component: comRangePicker,
    },
    {
        label: "活动类型",
        key: "type",
        type: "select",
        options: {
            initialValue: "0",
        },
        component: compType,
    },
    {
        label: "活动状态",
        key: "status",
        type: "select",
        options: {
            initialValue: "0",
        },
        component: compStatus,
    },
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
    {
        label: "任务ID",
        key: "actTaskId",
    },
];
