/* eslint-disable import/extensions */
import Link from "umi/link";
import React from "react";
import { Divider, Select, DatePicker } from "antd";
import moment from "moment";
import { formatNum } from "@/utils/utils";
import { TextRender } from "@/components/complex-table";
import FuzzySearch from "@/components/FuzzySearch";

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusArray = ["", "审核中", "审核通过", "审核驳回", "审核中", "审核驳回"];

// 表格模版数据
export const columns = [
    {
        title: "公司名称",
        dataIndex: "companyName",
        width: 200,
        // fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "任务名称",
        dataIndex: "taskName",
        width: 200,
        // fixed: "left",
        render: text => <TextRender multiEllipse = {1} text = {text} width = {170} />,
    },
    {
        title: "状态",
        dataIndex: "verifyStatus",
        width: 150,
        render: text => statusArray[text],
    },
    {
        title: "费用收入",
        dataIndex: "income",
        width: 150,
        render: text => <TextRender multiEllipse = {2} text = {formatNum(text)} />,
    },
    {
        title: "活动预支出",
        dataIndex: "verifyPreSpend",
        width: 300,
        render: (text, record) => (text ? `${formatNum(text)} | (原预支出${formatNum(record.preSpend)})` : formatNum(record.preSpend)),
    },
    {
        title: "任务开始时间",
        dataIndex: "startTime",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
    {
        title: "任务结束时间",
        dataIndex: "endTime",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
    {
        title: "创建人",
        dataIndex: "creator",
        width: 120,
    },
    {
        title: "审核人",
        dataIndex: "auditor",
        render: text => text || "--",
    },
    {
        title: "操作",
        dataIndex: "action",
        width: 150,
        fixed: "right",
        render: (text, record) => (
            <span>
                <Link
                    to = {{
                        pathname: `./operation`,
                        query: { id: record.id, pageType: "view" },
                    }}
                >
                    查看
                </Link>
                {[1, 4].includes(record.verifyStatus) ? (
                    <React.Fragment>
                        <Divider type = "vertical" />
                        <Link
                            to = {{
                                pathname: `./operation`,
                                query: { id: record.id, pageType: "check" },
                            }}
                        >
                            审核
                        </Link>
                    </React.Fragment>
                ) : null}
            </span>
        ),
    },
];

// 表单模版数据
const compFuzzySearch = (
    <FuzzySearch
        url = "/api/be/vender/factory/list"
        resParam = {{
            value: "venderId",
            text: "companyName",
        }}
        searchFields = {{
            searchField: "companyName",
        }}
    />
);

const comRangePicker = <RangePicker />;
const compStatus = (
    <Select placeholder = "选择状态">
        <Option value = "">全部</Option>
        <Option value = "1">审核中</Option>
        <Option value = "2">审核通过</Option>
        <Option value = "3">审核驳回</Option>
    </Select>
);

export const formTplData = [
    {
        label: "公司名称",
        key: "venderId",
        options: {
            initialValue: {
                key: "",
                label: "",
            },
        },
        component: compFuzzySearch,
    },
    {
        label: "任务时间",
        key: "rangeTime",
        component: comRangePicker,
    },
    {
        label: "状态",
        key: "status",
        type: "select",
        options: {
            initialValue: "",
        },
        component: compStatus,
    },
    {
        label: "任务名称",
        key: "taskNameLike",
    },
];
