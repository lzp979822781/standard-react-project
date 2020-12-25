// 组件第三方包引用
import React, { Component } from "react";
import { connect } from "dva";
// eslint-disable-next-line import/no-extraneous-dependencies
import router from "umi/router";
import classnames from "classnames";
import moment from "moment";
import {
    Button,
    Table,
    Form,
    Select,
    Popconfirm,
    message,
    Spin,
    Tag,
} from "antd";

// 样式相关引用
import styles from "./index.less";

// 工具类相关引用

// 定义的变量
const { Option } = Select;
const format = "YYYY-MM-DD HH:mm:ss";
const optionTxtArr = [
    { text: "所有", color: "#fff" }, // 白色
    { text: "测", color: "gold" }, // 黄色
    { text: "预", color: "blue" }, // 蓝色
    { text: "线", color: "#00FF00" }, // 绿色
];

@connect(({ home, loading }) => ({
    ...home,
    loading: loading.effects["home/queryGroupInfo"],
}))
class SysEnv extends Component {
    rowSelection = {
        // eslint-disable-next-line no-unused-vars
        onChange: (selectedRowKeys, selectedRows) => {
            /* console.log(
                `selectedRowKeys: ${selectedRowKeys}`,
                "selectedRows: ",
                selectedRows
            ); */
        },
        getCheckboxProps: record => ({
            disabled: record.profileName === "Disabled User", // Column configuration not to be checked
            profileName: record.profileName,
        }),
    };

    columns = [
        {
            title: "集群名称",
            dataIndex: "profileName",
            render: (text, record) => (
                <div>
                    {record.profile ? (
                        <Tag color = {optionTxtArr[record.profile].color}>
                            {optionTxtArr[record.profile].text}
                        </Tag>
                    ) : (
                        ""
                    )}
                    <a>{text}</a>
                </div>
            ),
        },
        {
            title: "集群配置",
            dataIndex: "profileTarget",
        },
        {
            title: "集群描述",
            dataIndex: "des",
        },
        {
            title: "创建时间",
            dataIndex: "created",
            render: text => moment(text).format(format),
        },
        {
            title: "创建人",
            dataIndex: "creator",
        },
        {
            title: "操作",
            dataIndex: "operation",
            width: 150,
            render: (text, record) => (
                <div>
                    <Popconfirm
                        placement = "topRight"
                        title = "是否确定删除"
                        onConfirm = {this.onDelete(record)}
                        okText = "确定"
                        cancelText = "取消"
                    >
                        <Button
                            type = "primary"
                            className = {`${styles["ml-small"]}`}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    constructor(props) {
        super(props);
        this.state = {
            showLoding: false,
        };
    }

    componentDidMount() {
        const {
            dispatch,
            location: {
                query: { sysId },
            },
        } = this.props;
        dispatch({
            type: "home/queryGroupInfo",
            payload: {
                sysId: sysId || 0,
            },
        });
    }

    /**
     * 当前方法为新增编辑查看公用方法
     * @param {string} operateId 操作动作表示，新增:add、编辑：edit、查看：detail
     */
    onComClick = operateId => () => {
        const {
            groupReq: { sysId },
        } = this.props;
        const pathname = "/home/env-compage";
        router.push({
            pathname,
            query: {
                pageType: operateId,
                sysId,
            },
        });
    };

    /**
     *
     * 系统删除事件
     * @param {Object} record 为行数据
     */
    onDelete = record => () => {
        const { dispatch } = this.props;
        this.setState({ showLoding: true });
        dispatch({
            type: "home/delSys",
            payload: {
                funcType: "sysEnv",
                id: record.id,
            },
            callback: msg => {
                message.info(msg, 2);
                this.componentDidMount();
                this.setState({ showLoding: false });
            },
        });
    };

    onDoubleClick = record => () => {
        router.push({
            pathname: "/home/sys-state",
            query: {
                groupId: record.id,
            },
            state: {
                clusterRecord: record,
            },
        });
    };

    onSelectChannge = value => {
        const { dispatch } = this.props;
        dispatch({
            type: "home/queryGroupInfo",
            payload: {
                profile: value,
            },
        });
    };

    /**
     *
     * 分页组件索引、页数变化回调函数
     * @param {string} pagingType 分页操作标识 值为pageIndex、pageSize
     * @param {string} type 操作类型标识，type值为pageIndex、pageSize
     */
    onPageChange = pagingType => (pageIndex, pageSize) => {
        const { dispatch } = this.props;
        dispatch({
            type: "home/queryGroupInfo",
            payload: {
                currentPage: pagingType === "pageIndex" ? pageIndex : 1,
                pageSize,
            },
        });
    };

    generateOpts = () => {
        const { selOptions = [] } = this.props;
        return selOptions.length
            ? selOptions.map(item => (
                <Option value = {item.key} key = {item.key}>
                    {item.value}
                </Option>
            ))
            : "";
    };

    render() {
        const selStyle = classnames({
            [styles["sys-select"]]: true,
            [styles["ml-middle"]]: true,
        });
        // eslint-disable-next-line prefer-const
        const {
            groupRes: { data, totalCount },
            groupReq: { currentPage },
        } = this.props;
        const { showLoding } = this.state;
        return (
            <div className = {styles["sys-env"]}>
                <Spin tip = "Loading..." spinning = {showLoding}>
                    <div className = {styles.btnCon}>
                        <Select
                            defaultValue = {0}
                            className = {selStyle}
                            onChange = {this.onSelectChannge}
                        >
                            {/* {this.generateOpts()} */}
                            <Option value = {0}>所有</Option>
                            <Option value = {1}>测试</Option>
                            <Option value = {2}>预发</Option>
                            <Option value = {3}>线上</Option>
                        </Select>
                        <div className = {styles["btn-innerCon"]}>
                            <Button
                                type = "primary"
                                className = {`${styles["mr-middle"]}`}
                                onClick = {this.onComClick("add")}
                            >
                                创建集群
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Table
                            rowSelection = {this.rowSelection}
                            columns = {this.columns}
                            dataSource = {data}
                            pagination = {{
                                showSizeChanger: true,
                                onShowSizeChange: this.onPageChange("pageSize"),
                                onChange: this.onPageChange("pageIndex"),
                                total: totalCount,
                                current: currentPage,
                            }}
                            onRow = {record => ({
                                onDoubleClick: this.onDoubleClick(record),
                            })}
                            rowKey = "id"
                        />
                    </div>
                </Spin>
            </div>
        );
    }
}

export default Form.create()(SysEnv);
