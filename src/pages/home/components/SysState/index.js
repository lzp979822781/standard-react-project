// 组件第三方包引用
import React, { Component } from "react";
import { connect } from "dva";
// eslint-disable-next-line import/no-extraneous-dependencies
import router from "umi/router";
// import classnames from 'classnames';
import moment from "moment";
import {
    Button,
    Table,
    Form,
    Select,
    Input,
    Col,
    Row,
    // Modal, message, Icon
} from "antd";
import SearchArea from "@/components/SearchArea";

// 样式相关引用
import styles from "./index.less";

// 工具类相关引用
import { formItemLayout } from "@/utils/utils";

// 定义的变量
const format = "YYYY-MM-DD HH:mm:ss";

const { Option } = Select;
// let timeout;
// let currentValue;

@connect(({ home, loading }) => ({
    ...home,
    loading: loading.effects["home/query"],
}))
class SysState extends Component {
    rowSelection = {
        // eslint-disable-next-line no-unused-vars
        onChange: (selectedRowKeys, selectedRows) => {},
        getCheckboxProps: record => ({
            disabled: record.version === "Disabled User", // Column configuration not to be checked
            version: record.version,
        }),
    };

    columns = [
        {
            title: "状态",
            dataIndex: "online",
            render: text => <a>{text === 1 ? "在线" : "离线"}</a>,
        },
        {
            title: "版本",
            dataIndex: "version",
            render: text => <a>{text}</a>,
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
            render: (text, record) => (
                <div>
                    <Button
                        type = "primary"
                        className = {`${styles["ml-small"]}`}
                        onClick = {this.onComClick("detail", record)}
                    >
                        查看并发布
                    </Button>
                </div>
            ),
        },
    ];

    constructor(props) {
        super(props);
        this.state = {
            // versionVal: undefined
        };
        this.SearchForm = this.createForm(); // 初始化时将创建的SearchForm存到this对象中，防止组件重复渲染，直关现象是表单一直重置
    }

    componentDidMount() {
        const {
            dispatch,
            location: { state: routerParam },
        } = this.props;
        const { clusterRecord } = routerParam || {};
        dispatch({
            type: "home/queryPublishInfo",
            payload: {
                groupId: (clusterRecord && clusterRecord.id) || 0,
                // online: 1,
            },
        });
    }

    /**
     * 当前方法为新增编辑查看公用方法
     * @param {string} operateId 操作动作表示，新增:add、编辑：edit、查看：detail
     */
    onComClick = (operateId, record) => () => {
        const {
            location: {
                query: { groupId },
            },
        } = this.props;
        // const { clusterRecord } = routerParam || {};
        const pathname = "/home/sys-state-compage";
        router.push({
            pathname,
            query: {
                pageType: operateId,
                id: record && record.id,
                groupId,
            },
            state: {
                record,
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
        dispatch({
            type: "home/delSys",
            payload: {
                funcType: "sysEnv",
                id: record.id,
            },
        });
    };

    /**
     *
     * 分页参数的相关回调函数
     * @param {string} pagingType 操作类型标识，type值为pageIndex、pageSize
     */
    onPageChange = pagingType => (pageIndex, pageSize) => {
        const { dispatch } = this.props;
        dispatch({
            type: "home/queryPublishInfo",
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

    /**
     * 版本搜索onChange事件
     */
    /*     onSelectChange = value => {
        this.setState({
            versionVal: value
        })
    } */

    onSearch = value => {
        if (value) {
            // 执行搜索
            this.doSearch();
        } else {
            /* this.setState({
                versionVal: value
            }) */
        }
    };

    /* doSearch = value => {

        if(timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        currentValue = value;
        const { dispatch } = this.props;
        function getVersionData() {
            dispatch({
                type: 'home/doVersionSearch',
                payload: {
                    value
                }
            })
        }

        timeout = setTimeout(getVersionData, 300);
    } */

    createForm = () => {
        // 定义组件
        const SearchForm = Form.create()(props => {
            const { form } = props;
            const { getFieldDecorator } = form;
            const search = type => () => {
                const { dispatch } = this.props;
                if (type === "clear") form.resetFields();
                form.validateFields((err, values) => {
                    dispatch({
                        type: "home/queryPublishInfo",
                        payload: values,
                    });
                });
            };

            return (
                <SearchArea
                    onSearch = {search("search")}
                    onReset = {search("clear")}
                >
                    <Row gutter = {24}>
                        <Col span = {8}>
                            <Form.Item label = "运行状态" {...formItemLayout}>
                                {getFieldDecorator("online", {
                                    initialValue: "",
                                    rules: [
                                        {
                                            required: false,
                                        },
                                    ],
                                })(
                                    <Select placeholder = "请选择运行状态">
                                        <Option value = "" disabled>
                                            全部
                                        </Option>
                                        <Option value = {1}>在线</Option>
                                        <Option value = {2}>离线</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span = {8}>
                            <Form.Item label = "版本" {...formItemLayout}>
                                {getFieldDecorator("version", {
                                    initialValue: "",
                                })(<Input placeholder = "请输入版本号" />)}
                            </Form.Item>
                        </Col>
                    </Row>
                </SearchArea>
            );
        });

        return <SearchForm />;
    };

    render() {
        /* const selStyle = classnames({
            [styles['sys-select']]: true,
            [styles['ml-middle']]: true
        }); */
        // const { versionVal } = this.state;
        const {
            publishRes: { data, totalCount },
            publishReq: { currentPage },
        } = this.props;

        return (
            <div className = {styles["sys-state"]}>
                <div>{this.SearchForm}</div>
                <div className = {styles.btnCon}>
                    {/* <Select
                        showSearch
                        className = {selStyle}
                        onChange = {this.onSelectChange}
                        onSearch = {this.onSearch}
                        value = {versionVal}
                        placeholder = '版本'
                        showArrow = {false}
                        filterOption = {false}
                        notFoundContent = {null}
                    >
                        {this.generateOpts()}
                    </Select> */}
                    <div className = {styles["btn-innerCon"]}>
                        <Button
                            type = "primary"
                            className = {`${styles["mr-middle"]}`}
                            onClick = {this.onComClick("add")}
                        >
                            创建发布
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
                        rowKey = "id"
                    />
                </div>
            </div>
        );
    }
}

export default Form.create()(SysState);
