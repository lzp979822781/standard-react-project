import React from "react";
import { Select } from "antd";
// import moment from "moment";
import { TextRender } from "@/components/complex-table";

const { Option } = Select;

// 报名人数表格模版数据
export const columns = [
    {
        title: "序号",
        dataIndex: "index",
        width: 80,
        // fixed: "left",
        render: (text, record, index) => index + 1,
    },
    {
        title: "买家pin",
        dataIndex: "pin",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "买家名称",
        dataIndex: "name",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "买家类型",
        dataIndex: "userTypeName",
        width: 150,
        render: text => text || "--",
    },
    {
        title: "省市",
        dataIndex: "provinceName",
        width: 150,
        render: (text, record) => (record.provinceName || record.cityName ? record.provinceName + record.cityName : "--"),
    },
    {
        title: "区域",
        dataIndex: "countyName",
        width: 150,
        render: text => text || "--",
    },
    {
        title: "报名活动类型",
        dataIndex: "actTypeName",
        width: 120,
        render: text => text || "--",
    },
    {
        title: "报名活动名称",
        dataIndex: "actName",
        width: 220,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "报名时间",
        dataIndex: "applyTime",
        width: 240,
        render: text => text || "--",
    },
    {
        title: "客户经理",
        dataIndex: "userErp",
        width: 120,
        render: text => text || "--",
    },
    {
        title: "归属部门",
        dataIndex: "orgName",
        width: 120,
        render: text => text || "--",
    },
];

const compApplyType = (
    <Select placeholder = "选择状态" defaultValue = {0}>
        <Option value = {0}>全部</Option>
    </Select>
);

export const formTplData = [
    {
        label: "买家Pin",
        key: "pin",
        options: {
            initialValue: "",
        },
    },
    {
        label: "买家类型",
        key: "userType",
        type: "select",
        options: {
            initialValue: 0,
        },
        component: compApplyType,
    },
];
