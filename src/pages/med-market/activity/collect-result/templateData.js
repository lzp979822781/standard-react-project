import React from "react";
import moment from "moment";
import { TextRender } from "@/components/complex-table";
// import FuzzySearch from "@/components/FuzzySearch";
// import { actType, actStatus } from "../list/actStatus";

// 表格模版数据
export const columns = [
    {
        title: "买家信息",
        dataIndex: "companyName",
        width: 150,
        render: text => <TextRender multiEllipse = {2} text = {text} />,
    },
    {
        title: "经营地址",
        dataIndex: "areaStr",
        width: 150,
        render: text => <TextRender multiEllipse = {2} text = {text} />,
    },
    {
        title: "订单号",
        dataIndex: "orderIds",
        width: 150,
    },
    {
        title: "件数/金额",
        dataIndex: "validCount",
        width: 100,
        render: (text, record) => `${text} ${record.rewardType === 1 ? "件" : "元"}`,
    },
    {
        title: "获取奖励（元）",
        dataIndex: "amount",
        width: 150,
    },
    {
        title: "发放状态",
        dataIndex: "statusText",
        width: 150,
        // render: text => (text === 1 ? "待发放" : "已发放"),
    },
    {
        title: "发放时间",
        dataIndex: "modified",
        width: 150,
        render: text => moment(text).format("YYYY-MM-DD"),
    },
];

export const formTplData = [
    {
        label: "用户Pin",
        key: "userPin",
        options: {
            initialValue: "",
        },
        // component: (
        //     <FuzzySearch
        //         url="/api/be/vender/factory/list"
        //         resParam={{
        //             value: "venderId",
        //             text: "companyName",
        //         }}
        //         searchFields={{
        //             searchField: "companyName",
        //         }}
        //     />
        // ),
    },
];
