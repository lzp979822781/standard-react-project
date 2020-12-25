import React, { Component } from "react";
// 组件第三方包引用
import { connect } from "dva";
// eslint-disable-next-line import/no-extraneous-dependencies
import router from "umi/router";
import moment from "moment";
import {
    Form,
    Input,
    Button,
    message,
    Spin,
    // DatePicker
} from "antd";
import Header from "@/components/Header";

// 样式相关引用
import styles from "./index.less";

// 工具类相关引用

// 定义的变量
const modalLayout = {
    labelAlign: "right",
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
        md: { span: 6 },
        lg: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 12 },
        sm: { span: 12 },
        md: { span: 12 },
        lg: { span: 12 },
    },
};

let pageId = 0;

const tailFormItemLayout = {
    wrapperCol: {
        xs: { span: 12, offset: 0 },
        sm: { span: 12, offset: 6 },
        md: { span: 12, offset: 6 },
        lg: { span: 12, offset: 6 },
    },
};

// const format = 'YYYY-MM-DD HH:mm:ss';

const { TextArea } = Input;

@connect(({ home, loading }) => ({
    ...home,
    loading: loading.effects["home/query"],
}))
class SysStateComPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            record: {},
            isShow: false,
        };
    }

    componentDidMount() {
        const {
            location: { query },
            dispatch,
        } = this.props;
        const { pageType, id, groupId } = query || {};
        if (groupId) pageId = groupId;
        if (pageType === "detail") {
            dispatch({
                type: "home/queryPublishDetail",
                payload: {
                    id,
                },
                callback: record => {
                    this.setState({
                        record,
                    });
                },
            });
        }
    }

    /**
     * 当前设计为新增、编辑的公用保存方法
     */
    onSave = (pageType, record) => () => {
        const { form, dispatch } = this.props;

        if (pageType === "detail") {
            // 执行上线
            dispatch({
                type: "home/doPublish",
                payload: {
                    record,
                },
                callback: msg => {
                    message.info(msg || "发布成功");
                    // 发布成功后重新刷新
                    setTimeout(() => {
                        this.goBack();
                    }, 1000);
                },
            });
        } else {
            form.validateFields((err, values) => {
                if (!err) {
                    // 如果不存在错误，执行保存
                    this.setState({
                        isShow: true,
                    });
                    dispatch({
                        type: "home/sysSave",
                        payload: {
                            funcType: "sysPubCreate",
                            saveValue: Object.assign({}, values, {
                                groupId: pageId,
                            }),
                        },
                        callback: msg => {
                            message.info(msg);
                            this.setState({
                                isShow: false,
                            });
                            if (msg === "创建成功") {
                                this.goBack();
                            }
                        },
                    });
                }
            });
        }
    };

    goBack = () => {
        if (pageId) {
            window.history.go(-1);
            return;
        }
        router.push({
            pathname: "/home/sys-state",
            query: {},
        });
    };

    disabledStartDate = current => current < moment().startOf("day");

    render() {
        const {
            form: { getFieldDecorator },
        } = this.props;
        const {
            location: { query },
        } = this.props;
        const { pageType } = query;
        const isDisabled = pageType === "detail";
        const { record, isShow } = this.state;

        return (
            <div className = {styles["sys-state-compage"]}>
                <Header
                    title = {pageType === "add" ? "创建版本" : "上线发布"}
                    back
                    backFn = {this.goBack}
                />
                <div className = {styles.content}>
                    <Spin tip = "Loading..." spinning = {isShow}>
                        <Form
                            className = {styles["ant-advanced-search-form"]}
                            {...modalLayout}
                        >
                            <Form.Item label = "版本">
                                {getFieldDecorator("version", {
                                    initialValue:
                                        (record && record.version) || "",
                                    validateTrigger: "onBlur",
                                    rules: [
                                        {
                                            required: true,
                                            message: "请输入版本号",
                                        },
                                    ],
                                })(
                                    <Input
                                        placeholder = "请输入版本号"
                                        disabled = {isDisabled}
                                    />
                                )}
                            </Form.Item>
                            {/* <Form.Item label = '创建时间'>
                                {getFieldDecorator('created', {

                                    initialValue: record && moment(record.created) || moment(),
                                    // validateTrigger: 'onBlur', //设置触发时机会报错
                                    rules: [
                                        {
                                            type: 'object',
                                            required: true,
                                            message: '请选择创建时间'
                                        },
                                    ],
                                })(
                                    <DatePicker
                                        className = {styles.time}
                                        showTime
                                        format = {format}
                                        disabled = {isDisabled}
                                        disabledDate = {this.disabledStartDate}
                                    />
                                )}
                            </Form.Item> */}
                            {isDisabled ? (
                                <Form.Item label = "创建人">
                                    {getFieldDecorator("creator", {
                                        initialValue:
                                            (record && record.creator) || "",
                                    })(<Input disabled />)}
                                </Form.Item>
                            ) : (
                                ""
                            )}

                            <Form.Item label = "集群描述">
                                {getFieldDecorator("des", {
                                    initialValue: (record && record.des) || "",
                                    validateTrigger: "onBlur",
                                    rules: [
                                        {
                                            required: true,
                                            message: "请输入集群描述信息",
                                        },
                                    ],
                                })(
                                    <TextArea
                                        rows = {4}
                                        placeholder = "请输入集群描述信息"
                                        disabled = {isDisabled}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label = "发布内容">
                                {getFieldDecorator("file", {
                                    initialValue: (record && record.file) || "",
                                    validateTrigger: "onBlur",
                                    rules: [
                                        {
                                            required: true,
                                            message: "请输入发布内容",
                                        },
                                    ],
                                })(
                                    <TextArea
                                        rows = {4}
                                        placeholder = "请输入发布内容"
                                        disabled = {isDisabled}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item {...tailFormItemLayout}>
                                <Button
                                    type = "primary"
                                    onClick = {this.onSave(pageType, record)}
                                    disabled = {
                                        pageType === "detail" &&
                                        record.online === 1
                                    }
                                >
                                    {pageType === "detail"
                                        ? "上线"
                                        : "创建发布"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Spin>
                </div>
            </div>
        );
    }
}

export default Form.create()(SysStateComPage);
