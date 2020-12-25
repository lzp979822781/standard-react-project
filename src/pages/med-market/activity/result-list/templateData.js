/* eslint-disable import/extensions */
import React from "react";
import { Select, DatePicker } from "antd";
import moment from "moment";
import { TextRender } from "@/components/complex-table";
import { isGy } from "@/utils/utils";

const { RangePicker } = DatePicker;
const { Option } = Select;
// 表格模版数据
export const columns = [
    {
        title: "活动名称",
        dataIndex: "name",
        width: 200,
        render: text => (text ? <TextRender multiEllipse = {1} text = {text} width = {170} /> : "--"),
    },
    {
        title: "活动类型",
        dataIndex: "typeName",
        width: 120,
    },
    {
        title: "活动状态",
        dataIndex: "realStatusName",
        width: 100,
        render: text => text || "--",
    },
    {
        title: "已报名人数",
        dataIndex: "joinNum",
        width: 120,
        render: text => text || "--",
    },
    {
        title: "任务开始时间",
        dataIndex: "actStartTime",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
    {
        title: "任务结束时间",
        dataIndex: "actEndTime",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
    {
        title: "创建人",
        dataIndex: "creator",
    },
];

const comRangePicker = <RangePicker />;

const compType = isGy ? (
    <Select placeholder = "选择状态">
        <Option value = "0">全部</Option>
        <Option value = "1">陈列</Option>
        <Option value = "3">动销</Option>
    </Select>
) : (
    <Select placeholder = "选择状态">
        <Option value = "0">全部</Option>
        <Option value = "1">陈列</Option>
        <Option value = "2">采购</Option>
        <Option value = "3">动销</Option>
    </Select>
);

const compStatus = (
    <Select placeholder = "选择状态">
        <Option value = "102,104,105">全部</Option>
        <Option value = "102">进行中</Option>
        <Option value = "105">已中止</Option>
        <Option value = "104">已结束</Option>
    </Select>
);

export const formTplData = [
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
        key: "realStatusList",
        type: "select",
        options: {
            initialValue: "102,104,105",
        },
        component: compStatus,
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
];
