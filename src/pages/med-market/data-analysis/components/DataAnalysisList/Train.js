import React, { Component } from "react";
import Link from "umi/link";
import { Divider } from "antd";
import ComplexTable from "@/components/ComplexTable";
import TableHeader from "./TableHeader";
import { columnsTrain, trainHeader } from "./templateData";
import { isGy } from "@/utils/utils";

let newColumnsTrain = columnsTrain;
let newTrainHeader = trainHeader;
if (isGy) {
    newColumnsTrain = columnsTrain.filter(item => !item.hideGy);
    newTrainHeader = newTrainHeader.filter(item => !item.hideGy);
}
class Train extends Component {
    onPageChange = pageNumber => {
        const { onPageChange } = this.props;
        onPageChange(pageNumber, 4);
    };

    onShowSizeChange = (current, size) => {
        const { onShowSizeChange } = this.props;
        onShowSizeChange(current, size, 4);
    };

    doExport = () => {
        const { doExport } = this.props;
        doExport(4);
    };

    render() {
        const { param, loading, data, header } = this.props;
        const analysisUrl = "./train-analysis";
        const detailUrl = "./train-detail";
        newColumnsTrain[newColumnsTrain.length - 1].width = "auto";
        const columns = newColumnsTrain.concat([
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
                <TableHeader param = {param} title = "培训活动" columns = {newTrainHeader} data = {header} type = {4} doExport = {this.doExport} />
                <ComplexTable
                    dataSource = {data.list || [{}]}
                    scroll = {{ x: isGy ? 2000 : 3300 }}
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

export default Train;
