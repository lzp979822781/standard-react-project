// 组件第三方包引用
import React, { Component } from "react";
import { connect } from "dva";
// eslint-disable-next-line import/no-extraneous-dependencies
import router from "umi/router";
// import moment from 'moment';
import {
    Button,
    Table,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Spin,
} from "antd";

// 样式相关引用
import styles from "./index.less";

// 工具类相关引用

// 定义的变量
// const format = 'YYYY-MM-DD HH:mm:ss';
@connect(({ home, loading }) => ({
    ...home,
    loading: loading.effects["home/query"],
}))
class Home extends Component {
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
            disabled: record.sysName === "Disabled User", // Column configuration not to be checked
            sysName: record.sysName,
        }),
    };

    columns = [
        {
            title: "系统名称",
            dataIndex: "sysName",
            render: text => <a>{text}</a>,
        },
        {
            title: "系统描述",
            dataIndex: "sysDes",
        },
        {
            title: "创建时间",
            dataIndex: "created",
        },
        {
            title: "创建人",
            dataIndex: "creator",
        },
        {
            title: "操作",
            dataIndex: "operation",
            render: (text, record) => (
                <div>
                    <Button
                        type = "primary"
                        onClick = {this.getSecretKey(record)}
                        size = "small"
                    >
                        获取秘钥
                    </Button>
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
                            size = "small"
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
            showSecModal: false, // 是否展示复制秘钥弹出框
            showLoding: false,
            // inputVal: 'aasssdafdafdf'
        };

        this.setKeyRef = ele => {
            this.keyInput = ele;
        };
    }

    componentDidMount() {
        const { dispatch } = this.props;
        /* this.props.router.setRouteLeaveHook(
            this.props.route,
            this.routerWillLeave
        ) */
        dispatch({
            type: "home/query",
            payload: {
                paging: {
                    pageSize: 10,
                    currentPage: 1,
                },
            },
        });
    }

    /**
     * 当前方法为新增编辑查看公用方法
     * @param {string} operateId 操作动作表示，新增:add、编辑：edit、查看：detail
     */
    onComClick = operateId => () => {
        const pathname = "/home/compage";
        router.push({
            pathname,
            query: {
                pageType: operateId,
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
                funcType: "sys",
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
            pathname: "/home/sys-env",
            query: {
                sysId: record.id,
            },
        });
    };

    /**
     *
     *
     * @param {string} pagingType 操作类型标识，pagingType值为pageIndex、pageSize
     */
    onPageChange = pagingType => (pageIndex, pageSize) => {
        const { dispatch } = this.props;
        dispatch({
            type: "home/query",
            payload: {
                paging: {
                    currentPage: pagingType === "pageIndex" ? pageIndex : 1,
                    pageSize,
                },
            },
        });
    };

    /**
     * 密钥输入框onChange事件,这里采用的是受控的input组件
     */
    /* onInputChange = (e) => {
        this.setState({
            inputVal: e.target.value
        })
    } */

    /**
     *
     * 获取当前行数据对应的密钥，获取完成后打开弹窗
     * @param record
     */
    getSecretKey = record => () => {
        const { dispatch } = this.props;
        dispatch({
            type: "home/getSecretKey",
            payload: {
                id: record.id,
            },
            callback: () => {
                this.setState({
                    showSecModal: true,
                });
            },
        });
        this.setState({
            showSecModal: true,
        });
    };

    onModalBtnClick = isShow => {
        if (isShow) {
            // 执行复制值密钥
            const copytNode = document.querySelector(".inputBox input");
            const range = document.createRange();
            range.selectNode(copytNode);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            const tag = document.execCommand("copy");
            if (tag) {
                message.success("复制成功");
            }
        }

        this.setState({
            showSecModal: false,
        });
    };

    render() {
        const { showSecModal, showLoding } = this.state;
        const {
            sys: { data, totalCount },
            secretKey,
            sysReq: { currentPage },
        } = this.props;

        return (
            <div className = {styles.home}>
                <Spin tip = "Loading..." spinning = {showLoding}>
                    <div className = {styles.btnCon}>
                        <Button
                            type = "primary"
                            className = {`${styles["ml-middle"]}`}
                            onClick = {this.onComClick("add")}
                        >
                            创建系统
                        </Button>
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

                    {/* 复制秘钥弹框 */}
                    <div>
                        <Modal
                            title = "系统秘钥"
                            centered
                            visible = {showSecModal}
                            onOk = {() => this.onModalBtnClick(true)}
                            onCancel = {() => this.onModalBtnClick(false)}
                            okText = "复制"
                        >
                            <Form
                                className = {styles["ant-advanced-search-form"]}
                            >
                                <Form.Item className = "inputBox">
                                    <Input
                                        placeholder = "秘钥"
                                        value = {secretKey}
                                    />
                                </Form.Item>
                            </Form>
                        </Modal>
                    </div>
                </Spin>
            </div>
        );
    }
}

export default Form.create()(Home);
