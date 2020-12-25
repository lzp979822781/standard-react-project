import React, { Component } from "react";
import Link from "umi/link";
import { Divider } from "antd";
import ComplexTable from "@/components/ComplexTable";
import TableHeader from "./TableHeader";
import { columnsCollect, collectHeader } from "./templateData";
import { isGy } from "@/utils/utils";

let newColumnsCollect = columnsCollect;
let newCollectHeader = collectHeader;
if (isGy) {
    newColumnsCollect = columnsCollect.filter(item => !item.hideGy);
    newCollectHeader = newCollectHeader.filter(item => !item.hideGy);
}

class Collect extends Component {
    onPageChange = pageNumber => {
        const { onPageChange } = this.props;
        onPageChange(pageNumber, 2);
    };

    onShowSizeChange = (current, size) => {
        const { onShowSizeChange } = this.props;
        onShowSizeChange(current, size, 2);
    };

    doExport = () => {
        const { doExport } = this.props;
        doExport(2);
    };

    render() {
        const { param, loading, data, header } = this.props;
        const analysisUrl = "./collect-analysis";
        const detailUrl = "./collect-detail";
        newColumnsCollect[newColumnsCollect.length - 1].width = "auto";
        const columns = newColumnsCollect.concat([
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
                <TableHeader param = {param} title = "采购活动" columns = {newCollectHeader} data = {header} type = {2} doExport = {this.doExport} />
                <ComplexTable
                    dataSource = {data.list || [{}]}
                    scroll = {{ x: isGy ? 1900 : 2900 }}
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

export default Collect;
