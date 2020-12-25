import React from "react";
import { Select } from "antd";
import moment from "moment";
import { TextRender, PicsComb } from "@/components/complex-table";

const { Option } = Select;

// 表格模版数据
export const columns = [
    {
        title: "买家信息",
        dataIndex: "name",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "经营地址",
        dataIndex: "area",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "审核状态",
        dataIndex: "cycleStatusText",
        width: 100,
        render: text => text || "--",
    },
    {
        title: "奖励（元）",
        dataIndex: "rewardNum",
        width: 100,
        render: text => text || "--",
    },
    {
        title: "本期效果数据",
        dataIndex: "picUrlList",
        width: 200,
        render: (data = []) => {
            const dataUrl = data.map((item, index) => ({
                url: item,
                uid: item + index,
            }));
            return <PicsComb num = {2} data = {dataUrl} imgKey = "uid" imgStyle = {{ width: 40, height: 40 }} />;
        },
    },
    {
        title: "发放状态",
        dataIndex: "sendResult",
        width: 80,
        render: text => {
            if (text) {
                return text === 1 ? "成功" : "失败";
            }
            return "--";
        },
    },
    {
        title: "发放时间",
        dataIndex: "sendDate",
        width: 100,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
];

const compType = (
    <Select placeholder = "考核周期">
        <Option key = "0" value = {0}>
            全部
        </Option>
    </Select>
);

const compStatus = (
    <Select placeholder = "选择状态">
        <Option value = "0">全部</Option>
        <Option value = "2">待审核</Option>
        <Option value = "1">审核通过</Option>
        <Option value = "3">审核驳回</Option>
        <Option value = "4">申诉-待审</Option>
        <Option value = "5">不达标</Option>
    </Select>
);

export const formTplData = [
    {
        label: "用户Pin",
        key: "userPin",
        options: {
            initialValue: "",
        },
    },
    {
        label: "考核周期",
        key: "cycle",
        options: {
            initialValue: 0,
        },
        component: compType,
    },
    {
        label: "审核状态",
        key: "auditStatus",
        type: "select",
        options: {
            initialValue: "0",
        },
        component: compStatus,
    },
];
