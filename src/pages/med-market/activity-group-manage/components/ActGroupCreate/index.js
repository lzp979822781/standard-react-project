import React, { Component } from "react";
import { connect } from "dva";
// import classnames from 'classnames';
import { Form, Input, Button, Select, message } from "antd";

import { AreaButton } from "@/components/complex-form";

import { singleColRow } from "@/utils/utils";
import genRules from "@/utils/rules";

import styles from "./index.less";

const { TextArea } = Input;
const { Option } = Select;

const numRule = genRules({
    required: true,
    max: 50,
});

let dispatch;
@connect(({ actGroupMag, loading }) => ({
    ...actGroupMag,
    loading: loading["actGroupMag/saveData"],
}))
class ActGroupCreate extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line prefer-destructuring
        dispatch = props.dispatch;
        this.state = {
            loading: false,
        };
    }

    componentDidMount() {
        // const {pageType} = this.getURLParam();
    }

    getURLParam = () => {
        // const { location: } = this.props;
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
                    //
                }
                message[msgType](msg);
                this.setState({ loading: false });
            },
        });
    };

    render() {
        const { loading } = this.state;
        const {
            form: { getFieldDecorator },
        } = this.props;
        return (
            <div className = {styles["act-group-create"]}>
                <Form {...singleColRow}>
                    <Form.Item label = "活动组名称">
                        {getFieldDecorator("groupName", {
                            initialValue: "",
                            rules: [
                                ...numRule.rules,
                                {
                                    pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\u4e00-\u9fa5])[a-zA-Z\d\u4e00-\u9fa5]{1,50}$/,
                                    message: "只能输入中英文数字",
                                },
                            ],
                        })(<Input placeholder = "不超出50个字符" />)}
                    </Form.Item>
                    <Form.Item label = "活动组备注">
                        {getFieldDecorator("remark", {
                            initialValue: "",
                            ...numRule,
                        })(
                            <TextArea
                                autosize = {{
                                    minRows: 4,
                                    maxRows: 6,
                                }}
                                placeholder = "不超出50个字符"
                            />
                        )}
                    </Form.Item>
                    <Form.Item label = "区域">
                        {getFieldDecorator("areaIds", {
                            initialValue: undefined,
                        })(<AreaButton url = "/area/loadArea" />)}
                    </Form.Item>
                    <Form.Item label = "门店类型">
                        {getFieldDecorator("companyTypes", {
                            initialValue: undefined,
                        })(
                            <Select
                                placeholder = "请选择门店类型"
                                mode = "multiple"
                                maxTagCount = {5}
                                maxTagTextLength = {5}
                            >
                                <Option value = "jack">Jack</Option>
                                <Option value = "lucy">Lucy</Option>
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label = "白名单">
                        {getFieldDecorator("whiteList", {
                            initialValue: undefined,
                        })(<Button type = "primary">白名单</Button>)}
                    </Form.Item>
                    <Form.Item label = "黑名单">
                        {getFieldDecorator("blackList", {
                            initialValue: undefined,
                        })(<Button type = "primary">黑名单</Button>)}
                    </Form.Item>
                </Form>
                <div className = {styles.center}>
                    <Button type = "primary" disabled = {loading}>
                        保存
                    </Button>
                </div>
            </div>
        );
    }
}

export default Form.create()(ActGroupCreate);
