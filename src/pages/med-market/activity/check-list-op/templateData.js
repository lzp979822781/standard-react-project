/* eslint-disable import/extensions */
import React from "react";
import { Select, DatePicker } from "antd";
import moment from "moment";
import { TextRender } from "@/components/complex-table";
// import { actType, actStatus } from "../list/actStatus";

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
        title: "活动类型",
        dataIndex: "typeText",
        width: 100,
    },
    {
        title: "运营审核",
        dataIndex: "opText",
        width: 150,
        render: text => text || "--",
        // render: text => actStatus[text],
    },
    {
        title: "药企审核",
        dataIndex: "gyText",
        width: 150,
        render: text => text || "--",
        // render: text => actStatus[text],
    },
    {
        title: "审核人",
        dataIndex: "verifier",
        width: 150,
        render: text => text || "--",
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
        title: "创建人",
        dataIndex: "creator",
        width: 120,
    },
    {
        title: "审核意见",
        dataIndex: "opinion",
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
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
        <Option value = "2">运营待审核</Option>
        <Option value = "3">运营审核通过</Option>
        <Option value = "99">药企待审核</Option>
        <Option value = "4">运营审核驳回</Option>
        <Option value = "5">药企审核通过</Option>
        <Option value = "6">药企审核驳回</Option>
    </Select>
);

export const formTplData = [
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
        label: "审核状态",
        key: "status",
        type: "select",
        options: {
            initialValue: "0",
        },
        component: compStatus,
    },
];
