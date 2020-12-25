import React from "react";
import { TextRender } from "@/components/complex-table";

// 表格模版数据

export const wareParmsColumns = [
    {
        title: "ERP商品编码",
        dataIndex: "erpCode",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "批准文号",
        dataIndex: "approvNum",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "规格参数",
        dataIndex: "packageSpec",
        width: 150,
        render: text => text || "--",
    },
    {
        title: "药品名称",
        dataIndex: "medicinesName",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "通用名称",
        dataIndex: "commonName",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
];

export const actGroupColumns = [
    {
        title: "活动组名称",
        dataIndex: "groupName",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "备注",
        dataIndex: "remark",
        width: 250,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "区域数量",
        dataIndex: "areaNum",
        width: 150,
        render: text => text || "--",
    },
    {
        title: "门店类型",
        dataIndex: "shopTypesView",
        width: 150,
        render: text => (text ? <TextRender multiEllipse = {2} text = {text} /> : "--"),
    },
    {
        title: "白名单",
        dataIndex: "whiteShopsNum",
        width: 50,
        render: text => text || "--",
    },
    {
        title: "黑名单",
        dataIndex: "blackShopsNum",
        width: 50,
        render: text => text || "--",
    },
];

//
export const formTplData = [
    {
        label: "ERP编码",
        key: "erpCode",
    },
    {
        label: "批准文号",
        key: "approvNum",
    },
    {
        label: "药品名称",
        key: "medicinesName",
    },
    // {
    //     label: "商家名称",
    //     key: "shopName",
    // },
];
