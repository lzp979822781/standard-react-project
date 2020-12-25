/* eslint-disable react/no-unused-state */
import React, { Component } from "react";
import { connect } from "dva";
import router from "umi/router";
import { Button, Popconfirm, message } from "antd";
import ActGroupSearch from "../ActGroupSearch";
import ComplexTable from "@/components/ComplexTable";
import { TextRender, Loading } from "@/components/complex-table";
import { genPageObj } from "@/utils/utils";
// import classnames from 'classnames';

import styles from "./index.less";

let dispatch;

@connect(({ actGroupMag, loading }) => ({
    ...actGroupMag,
    loading: loading["actGroupMag/queryData"],
}))
class ActGroupList extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line prefer-destructuring
        dispatch = props.dispatch;
        this.state = {
            loading: false,
        };
        this.customPageObj = genPageObj(this, "abc");
        this.columns = [
            {
                title: "活动组ID",
                dataIndex: "groupId",
                width: 120,
                render: text => <TextRender multiEllipse = {2} text = {text} />,
            },
            {
                title: "活动组名称",
                dataIndex: "groupName",
                width: 120,
                render: text => <TextRender multiEllipse = {2} text = {text} />,
            },
            {
                title: "区域",
                dataIndex: "areaNum",
                width: 120,
            },
            {
                title: "门店类型",
                dataIndex: "shopTypesView",
                width: 120,
                render: text => <TextRender multiEllipse = {2} text = {text} />,
            },
            {
                title: "白名单门店",
                dataIndex: "whiteShopsNum",
                width: 120,
            },
            {
                title: "黑名单门店",
                dataIndex: "blackShopsNum",
                width: 120,
            },
            {
                title: "备注",
                dataIndex: "remark",
                render: text => <TextRender multiEllipse = {2} text = {text} />,
            },
            {
                title: "操作",
                dataIndex: "operation",
                fixed: "right",
                width: 240,
                render: (text, record) => {
                    const ele = (
                        <div className = {styles["row-btn-wrapper"]}>
                            <Button
                                type = "primary"
                                size = "small"
                                className = {styles["ml-btn-small"]}
                                onClick = {this.onComClick("edit", record)}
                            >
                                编辑
                            </Button>
                            <Button
                                type = "primary"
                                size = "small"
                                className = {styles["ml-btn-small"]}
                                onClick = {this.onComClick("detail", record)}
                            >
                                查看
                            </Button>
                            <Popconfirm
                                placement = "topRight"
                                title = "是否确定删除"
                                okText = "确定"
                                cancelText = "取消"
                                onConfirm = {this.onDelete(record)}
                            >
                                <Button
                                    type = "primary"
                                    className = {`${styles["ml-btn-small"]}`}
                                    size = "small"
                                >
                                    删除
                                </Button>
                            </Popconfirm>
                        </div>
                    );
                    return ele;
                },
            },
        ];
    }

    componentDidMount() {
        this.getData({});
    }

    /**
     * 当前方法为新增编辑查看公用方法
     * @param {string} operateId 操作动作表示，新增:add、编辑：edit、查看：detail
     */
    onComClick = (operateId, record) => () => {
        const pathname = "./create";
        router.push({
            pathname,
            query: {
                pageType: operateId,
                id: (record && record.id) || record.groupCode,
            },
        });
    };

    onDelete = record => () => {
        const { groupId, groupCode } = record;
        this.callModel("delData", { groupId, groupCode });
    };

    /**
     * 分页相关函数
     */
    onPageChange = type => (current, pageSize) => {
        const param = {
            currentPage: type === "current" ? current : 1,
            pageSize,
        };
        this.getData(param);
    };

    getData = data => {
        dispatch({
            type: "actGroupMag/queryData",
            payload: data,
            callback: ({
                type: msgType = "success",
                msg = "调用成功",
            } = {}) => {
                message[msgType](msg);
                this.setState({ loading: false });
            },
        });
    };

    /**
     * 导出列表
     */
    onExport = () => {
        const {
            pageReq: { currentPage, pageSize },
        } = this.props;
        this.callModel("exportList", { currentPage, pageSize });
    };

    callModel = (type, data) => {
        this.setState({ loading: true });
        dispatch({
            type: `actGroupMag/${type}`,
            payload: data,
            callback: ({
                type: msgType = "success",
                msg = "调用成功",
            } = {}) => {
                if (msgType === "success") {
                    // 删除或者其他请求成功后会刷新列表，此时当前操作不给出提示信息，刷新完成后提示
                    this.getData({ currentPage: 1 });
                } else {
                    message[msgType](msg);
                    this.setState({ loading: false });
                }
            },
        });
    };

    render() {
        const that = this;
        const {
            pageRes: { data, totalCount: total },
            pageReq: { currentPage: current, pageSize },
        } = that.props;
        const { loading } = that.state;
        return (
            <div className = {styles["act-group-list"]}>
                <ActGroupSearch dispatch = {dispatch} />
                <Loading spinning = {loading}>
                    <div className = {styles["btn-container"]}>
                        <Button type = "primary" onClick = {this.onComClick("add")}>
                            创建活动组
                        </Button>
                        <Button
                            type = "primary"
                            className = {styles["ml-btn-small"]}
                            onClick = {this.onExport}
                        >
                            批量导出
                        </Button>
                        <Button
                            type = "primary"
                            className = {styles["ml-btn-small"]}
                        >
                            批量导出
                        </Button>
                    </div>
                    <div>
                        <ComplexTable
                            dataSource = {data}
                            columns = {this.columns}
                            pagination = {{
                                ...this.customPageObj,
                                ...{ current, pageSize },
                                total,
                            }}
                            scroll = {{ x: "110%" }}
                            bordered
                            rowKey = "groupId"
                        />
                    </div>
                </Loading>
            </div>
        );
    }
}

export default ActGroupList;
