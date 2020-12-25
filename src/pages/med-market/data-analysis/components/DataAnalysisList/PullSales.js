import React, { Component } from "react";
import Link from "umi/link";
import { Divider } from "antd";
import ComplexTable from "@/components/ComplexTable";
import TableHeader from "./TableHeader";
import { columnsPullSales, pullSalesHeader } from "./templateData";
import { isGy } from "@/utils/utils";

let newColumnsPullSales = columnsPullSales;
let newPullSalesHeader = pullSalesHeader;
if (isGy) {
    newColumnsPullSales = columnsPullSales.filter(item => !item.hideGy);
    newPullSalesHeader = newPullSalesHeader.filter(item => !item.hideGy);
}

class PullSales extends Component {
    onPageChange = pageNumber => {
        const { onPageChange } = this.props;
        onPageChange(pageNumber, 3);
    };

    onShowSizeChange = (current, size) => {
        const { onShowSizeChange } = this.props;
        onShowSizeChange(current, size, 3);
    };

    doExport = () => {
        const { doExport } = this.props;
        doExport(3);
    };

    render() {
        const { param, loading, data, header } = this.props;
        const analysisUrl = "./pull-sale-analysis";
        const detailUrl = "./pull-sale-detail";
        newColumnsPullSales[newColumnsPullSales.length - 1].width = "auto";
        const columns = newColumnsPullSales.concat([
            {
                title: "操作",
                dataIndex: "action",
                width: 170,
                fixed: "right",
                render: (text, record) => (
                    <span>
                        <Link
                            to = {{
                                pathname: analysisUrl,
                                query: { id: record.actId, type: record.actType },
                            }}
                        >
                            活动分析
                        </Link>
                        <Divider type = "vertical" />
                        <Link
                            to = {{
                                pathname: detailUrl,
                                query: { id: record.actId, type: record.actType },
                            }}
                        >
                            活动明细
                        </Link>
                    </span>
                ),
            },
        ]);
        return (
            <div style = {{ marginBottom: 20 }}>
                <TableHeader param = {param} title = "动销活动" columns = {newPullSalesHeader} data = {header} type = {3} doExport = {this.doExport} />
                <ComplexTable
                    dataSource = {data.list || [{}]}
                    scroll = {{ x: isGy ? 2200 : 3300 }}
                    columns = {columns}
                    pagination = {{
                        showTotal: () => `共 ${data.total} 条`,
                        showQuickJumper: true,
                        showSizeChanger: true,
                        current: data.current,
                        total: data.total,
                        pageSize: data.pageSize,
                        pageSizeOptions: ["10", "15", "20"],
                        onChange: this.onPageChange,
                        onShowSizeChange: this.onShowSizeChange,
                    }}
                    bordered
                    rowKey = "id"
                    loading = {loading}
                />
            </div>
        );
    }
}

export default PullSales;
