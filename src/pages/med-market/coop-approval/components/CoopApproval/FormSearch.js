import React, { Component } from "react";
import { Form, Row, Col, Input, Select, Button, Icon } from "antd";
import FuzzySearch from "@/components/FuzzySearch";
import RangePicker from "./RangePicker";
import styles from "./index.less";

const FormItem = Form.Item;
const { Option } = Select;

const queryParam = {
    value: "id",
    text: "companyName",
};

class FormSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expandForm: false,
        };
    }

    componentDidMount() {}

    toggleForm = () => {
        const { expandForm } = this.state;
        this.setState({
            expandForm: !expandForm,
        });
    };

    renderSimpleForm() {
        const {
            form: { getFieldDecorator },
            onSearch,
            onReset,
        } = this.props;
        return (
            <Form onSubmit = {onSearch} layout = "inline">
                <Row
                    gutter = {{
                        md: 8,
                        lg: 24,
                        xl: 48,
                    }}
                >
                    <Col md = {8} sm = {24}>
                        <FormItem label = "公司名称">
                            {getFieldDecorator("companyName", {
                                initialValue: { key: "", label: "" },
                                rules: [
                                    {
                                        required: false,
                                    },
                                ],
                            })(
                                <FuzzySearch
                                    url = "/vender/factory/list"
                                    queryParam = {queryParam}
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col md = {8} sm = {24}>
                        <FormItem label = "任务时间">
                            <RangePicker {...this.props} />
                        </FormItem>
                    </Col>
                    <Col md = {8} sm = {24}>
                        <span className = {styles.submitButtons}>
                            <Button type = "primary" htmlType = "submit">
                                查询
                            </Button>
                            <Button
                                style = {{
                                    marginLeft: 8,
                                }}
                                onClick = {onReset}
                            >
                                重置
                            </Button>
                            <a
                                style = {{
                                    marginLeft: 8,
                                }}
                                onClick = {this.toggleForm}
                            >
                                展开 <Icon type = "down" />
                            </a>
                        </span>
                    </Col>
                </Row>
            </Form>
        );
    }

    renderAdvancedForm() {
        const {
            form: { getFieldDecorator },
            onSearch,
            onReset,
        } = this.props;
        return (
            <Form onSubmit = {onSearch} layout = "inline">
                <Row
                    gutter = {{
                        md: 8,
                        lg: 24,
                        xl: 48,
                    }}
                >
                    <Col md = {8} sm = {24}>
                        <FormItem label = "公司名称">
                            {getFieldDecorator("companyName", {
                                initialValue: { key: "", label: "" },
                            })(
                                <FuzzySearch
                                    url = "/vender/factory/list"
                                    queryParam = {queryParam}
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col md = {8} sm = {24}>
                        <FormItem label = "任务时间">
                            <RangePicker {...this.props} />
                        </FormItem>
                    </Col>
                    <Col md = {8} sm = {24}>
                        <FormItem label = "状态">
                            {getFieldDecorator("status", {
                                initialValue: "",
                            })(
                                <Select placeholder = "选择状态">
                                    <Option value = "">全部</Option>
                                    <Option value = "1">审核中</Option>
                                    <Option value = "2">审核通过</Option>
                                    <Option value = "3">审核驳回</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row
                    gutter = {{
                        md: 8,
                        lg: 24,
                        xl: 48,
                    }}
                >
                    <Col md = {8} sm = {24}>
                        <FormItem label = "任务名称">
                            {getFieldDecorator(`taskNameLike`)(
                                <Input placeholder = "搜索" />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <div
                    style = {{
                        overflow: "hidden",
                    }}
                >
                    <div
                        style = {{
                            float: "right",
                            marginBottom: 24,
                        }}
                    >
                        <Button type = "primary" htmlType = "submit">
                            查询
                        </Button>
                        <Button
                            style = {{
                                marginLeft: 8,
                            }}
                            onClick = {onReset}
                        >
                            重置
                        </Button>
                        <a
                            style = {{
                                marginLeft: 8,
                            }}
                            onClick = {this.toggleForm}
                        >
                            收起 <Icon type = "up" />
                        </a>
                    </div>
                </div>
            </Form>
        );
    }

    renderForm() {
        const { expandForm } = this.state;
        return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
    }

    render() {
        return <div className = {styles.tableListForm}>{this.renderForm()}</div>;
    }
}

export default FormSearch;
