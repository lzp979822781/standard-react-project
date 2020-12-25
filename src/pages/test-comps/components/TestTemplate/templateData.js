import React from "react";
import { Select, DatePicker } from "antd";

const { RangePicker } = DatePicker;
const { Option } = Select;

const compType = (
    <Select placeholder = "选择状态">
        <Option value = "0">全部</Option>
        <Option value = "1">陈列</Option>
        <Option value = "2">采购</Option>
        <Option value = "3">动销</Option>
        <Option value = "4">培训-开口说</Option>
        <Option value = "5">培训-用心看</Option>
    </Select>
);

// eslint-disable-next-line import/prefer-default-export
export const formTplData = [
    {
        label: "单行文本",
        key: "key1",
        type: "text",
        props: {
            addonBefore: "Http://",
        },
        options: {
            initialValue: "ok",
        },
    },
    {
        label: "数字",
        key: "key2",
        type: "number",
        props: {
            addonBefore: "Http://",
        },
        options: {
            initialValue: 2,
        },
    },
    {
        label: "下拉选择",
        key: "key3",
        type: "select",
        optionData: [{ label: "杨天明", value: "ytm" }, { label: "简简", value: "jj" }],
        props: {
            style: { width: 200 }, // 可以定义样式
        },
        options: {
            initialValue: "ytm",
        },
    },
    {
        label: "日期选择",
        key: "key4",
        type: "datePicker",
        props: {
            showTime: { format: "HH:mm" },
        },
    },
    {
        label: "影响key6",
        key: "key5",
        type: "datePicker",
        resetFields: ["key6"], // 改变需要清空的项
    },
    {
        label: "依赖影响key6",
        key: "key6",
        options: {
            initialValue: "",
        },
    },
    {
        label: "自定义非实例化",
        key: "key7",
        props: {}, // 组件属性
        options: {}, // form属性
        component: RangePicker, // 组件名
    },
    {
        label: "实例化",
        key: "key8",
        type: "select",
        options: {
            initialValue: "0",
        },
        component: compType,
        instantiation: true,
    },
    {
        label: "后端接口数据",
        key: "key9",
        options: {
            initialValue: "",
        },
        type: "YaoSelect", // 组件名
    },
    {
        label: "药企名称",
        key: "key10",
        props: {
            searchKey: "companyName",
            returnMap: {
                key: "venderId",
                label: "companyName",
            },
        },
        options: {
            initialValue: {},
        },
        type: "YaoSearchSelect", // 组件名
        resetFields: ["key11"],
    },
    {
        label: "任务名称",
        key: "key11",
        props: {
            url: "/api/be/act/task/queryList",
            searchKey: "taskNameLike",
            returnMap: {
                key: "id",
                label: "taskName",
            },
        },
        options: {
            initialValue: {},
        },
        type: "YaoSearchSelect", // 组件名
        params: [
            { type: "1", searchKey: "type", value: 1 }, // 写固定的值
            { type: "2", searchKey: "type", tplKey: "key8" }, // 存在一层直接可取的值
            { type: "3", searchKey: "venderId", tplKey: "key10", valueKey: "key" }, // 需要取二层可取的值
        ],
        bring: ["creator", "income"],
    },
    {
        label: "创建人",
        key: "creator",
        type: "text",
        props: {},
        options: {
            initialValue: "",
        },
    },
    {
        label: "收入",
        key: "income",
        type: "number",
        props: {},
        options: {
            initialValue: 0,
        },
    },
];
