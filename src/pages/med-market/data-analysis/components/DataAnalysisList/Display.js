import React, { Component } from "react";
import Link from "umi/link";
import { Divider } from "antd";
import ComplexTable from "@/components/ComplexTable";
import TableHeader from "./TableHeader";
import { columnsDisplay, displayHeader } from "./templateData";
import { isGy } from "@/utils/utils";

let newColumnsDisplay = columnsDisplay;
let newDisplayHeader = displayHeader;
if (isGy) {
    newColumnsDisplay = columnsDisplay.filter(item => !item.hideGy);
    newDisplayHeader = newDisplayHeader.filter(item => !item.hideGy);
}
// newColumnsDisplay.splice(11, 1)

class Display extends Component {
    onPageChange = pageNumber => {
        const { onPageChange } = this.props;
        onPageChange(pageNumber, 1);
    };

    onShowSizeChange = (current, size) => {
        const { onShowSizeChange } = this.props;
        onShowSizeChange(current, size, 1);
    };

    doExport = () => {
        const { doExport } = this.props;
        doExport(1);
    };

    render() {
        const { param, loading, data, header } = this.props;
        const analysisUrl = "./display-analysis";
        const detailUrl = "./display-detail";
        newColumnsDisplay[newColumnsDisplay.length - 1].width = "auto";
        const columns = newColumnsDisplay.concat([
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
                        {isGy ? null : (
                            <>
                                <Divider type = "vertical" />
                                <Link
                                    to = {{
                                        pathname: detailUrl,
                                        query: { id: record.actId, type: record.actType },
                                    }}
                                >
                                    活动明细
                                </Link>
                            </>
                        )}
                    </span>
                ),
            },
        ]);
        return (
            <div style = {{ marginBottom: 20 }}>
                <TableHeader param = {param} title = "陈列活动" columns = {newDisplayHeader} data = {header} type = {1} doExport = {this.doExport} />
                <ComplexTable
                    dataSource = {data.list || [{}]}
                    scroll = {{ x: isGy ? 1600 : 2900 }}
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

export default Display;
