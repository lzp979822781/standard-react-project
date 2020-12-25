import React, { Component } from 'react'
// 组件第三方包引用
import { connect } from 'dva';
import router from 'umi/router';
// import moment from 'moment';
import {
    Form, Input, Button, Select,
    message, Spin
    // DatePicker
} from 'antd';
import Header from '@/components/Header';

// 样式相关引用
import styles from './index.less';

// 工具类相关引用

// 定义的变量
const modalLayout = {
    labelAlign: 'right',
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
}

const tailFormItemLayout = {
    wrapperCol: {
        xs: { span: 12, offset: 0 },
        sm: { span: 12, offset: 6 },
        md: { span: 12, offset: 6 },
        lg: { span: 12, offset: 6 },
    },
}
// const format = 'YYYY-MM-DD HH:mm:ss';
const { TextArea } = Input;
const { Option } = Select;

@connect(({ home, loading }) => ({
    home,
    loading: loading.effects['home/query'],
}))
class EnvComPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false
        }

    }

    /**
     * 当前设计为新增、编辑的公用保存方法
     */
    onSave = () => {
        const { form, dispatch, location: { query: { sysId } } } = this.props;
        form.validateFields((err, values) => {
            if(!err) {
                // 如果不存在错误，执行保存
                const newValue = Object.assign({}, values, { sysId: sysId || 0 })
                this.setState({ isShow: true })
                dispatch({
                    type: 'home/sysSave',
                    payload: {
                        funcType: 'sysEnvCreate',
                        saveValue: newValue
                    },
                    callback: (msg) => {
                        message.info(msg, 2);
                        this.setState({ isShow: false });

                        setTimeout(() => {
                            this.goBack();
                        }, 200)
                    }
                })
            }

        })
    }

    goBack = () => {
        const { location: { query: { sysId } } } = this.props;
        if(sysId) {
            window.history.go(-1);
            return;
        }
        router.push({
            pathname: '/home/sys-env',
            query: {}
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { isShow } = this.state;

        return (
            <div className = {styles['env-com-page']}>
                <Header
                    title = '创建集群'
                    back
                    backFn = {this.goBack}
                />
                <div className = {styles.content}>
                    <Spin size = "small" tip = "Loading..." spinning = {isShow}>
                        <Form className = {styles['ant-advanced-search-form']} {...modalLayout}>
                            <Form.Item label = "集群标识">
                                {getFieldDecorator('profile', {
                                    initialValue: 1,
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择集群标识'
                                        },
                                    ],
                                })(
                                    <Select>
                                        <Option value = {1}>测试</Option>
                                        <Option value = {2}>预发</Option>
                                        <Option value = {3}>线上</Option>
                                    </Select>
                                )}
                            </Form.Item>
                            <Form.Item label = '集群名称'>
                                {getFieldDecorator('profileName', {
                                    initialValue: '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入集群名称'
                                        },
                                    ],
                                })(<Input placeholder = "请输入集群名称" />)}
                            </Form.Item>
                            <Form.Item label = '集群配置'>
                                {getFieldDecorator('profileTarget', {
                                    initialValue: '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入集群配置'
                                        },
                                        {
                                            pattern: /^[^\u4e00-\u9fa5]+$/,
                                            message: '请输入非中文字符'
                                        },
                                    ],
                                })(<Input placeholder = "请输入集群配置" />)}
                            </Form.Item>
                            {/* <Form.Item label = '创建时间'>
                                {getFieldDecorator('created', {
                                    initialValue: moment(),
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择创建时间'
                                        },
                                    ],
                                })(
                                    <DatePicker
                                        className = {styles.time}
                                        showTime
                                        format = {format}
                                    />
                                )}
                            </Form.Item> */}
                            <Form.Item label = '集群描述'>
                                {getFieldDecorator('des', {
                                    initialValue: '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入集群描述信息'
                                        },
                                    ],
                                })(<TextArea rows = {4} placeholder = "请输入集群描述信息" />)}
                            </Form.Item>
                            <Form.Item {...tailFormItemLayout}>
                                <Button type = 'primary' onClick = {this.onSave}>
                                    创建
                                </Button>
                            </Form.Item>
                        </Form>
                    </Spin>
                </div>
            </div>
        )
    }
}

export default Form.create()(EnvComPage);