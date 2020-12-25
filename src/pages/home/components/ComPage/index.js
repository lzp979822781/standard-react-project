import React, { Component } from "react";
// 组件第三方包引用
import { connect } from "dva";
// eslint-disable-next-line import/no-extraneous-dependencies
import router from "umi/router";
import { Prompt } from "react-router-dom";
import { Form, Input, Button, message, Spin } from "antd";
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

const tailFormItemLayout = {
    wrapperCol: {
        xs: { span: 12, offset: 0 },
        sm: { span: 12, offset: 6 },
        md: { span: 12, offset: 6 },
        lg: { span: 12, offset: 6 },
    },
};

const { TextArea } = Input;

@connect(({ home, loading }) => ({
    home,
    loading: loading.effects["home/query"],
}))
class ComPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            isSaved: false,
        };
    }

    /**
     * 当前设计为新增、编辑的公用保存方法
     */
    onSave = () => {
        const { form, dispatch } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                // 如果不存在错误，执行保存
                this.setState({ isShow: true });
                dispatch({
                    type: "home/sysSave",
                    payload: {
                        funcType: "sysCreate",
                        saveValue: values,
                    },
                    callback: msg => {
                        message.info(msg, 2);
                        this.setState({
                            isShow: false,
                            isSaved: true,
                        });
                        setTimeout(() => {
                            this.goBack();
                        }, 200);
                    },
                });
            }
        });
    };

    goBack = () => {
        router.push({
            pathname: "/home/index",
            query: {},
        });
    };

    onLeave = () => {
        const { isSaved } = this.state;
        if (isSaved) {
            return true;
        }

        // eslint-disable-next-line no-alert
        const isOk = window.confirm("当前页面未保存");
        return isOk;
    };

    render() {
        // eslint-disable-next-line react/destructuring-assignment
        const { getFieldDecorator } = this.props.form;
        const { isShow } = this.state;

        return (
            <div className = {styles.compage}>
                <Prompt message = {this.onLeave} />
                <Header title = "创建系统" back backFn = {this.goBack} />
                <Spin size = "small" tip = "Loading..." spinning = {isShow}>
                    <div className = {styles.content}>
                        <Form
                            className = {styles["ant-advanced-search-form"]}
                            {...modalLayout}
                        >
                            <Form.Item label = "系统名称">
                                {getFieldDecorator("sysName", {
                                    initialValue: "",
                                    validateTrigger: "onBlur",
                                    rules: [
                                        {
                                            required: true,
                                            message: "请输入系统名称",
                                        },
                                    ],
                                })(<Input placeholder = "请输入系统名称" />)}
                            </Form.Item>
                            <Form.Item label = "系统描述">
                                {getFieldDecorator("sysDes", {
                                    initialValue: "",
                                    validateTrigger: "onBlur",
                                    rules: [
                                        {
                                            required: true,
                                            message: "请输入描述信息",
                                        },
                                    ],
                                })(
                                    <TextArea
                                        rows = {4}
                                        placeholder = "请输入描述信息"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item {...tailFormItemLayout}>
                                <Button type = "primary" onClick = {this.onSave}>
                                    创建
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Spin>
            </div>
        );
    }
}

export default Form.create()(ComPage);
