// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
// import classnames from "classnames";
import moment from "moment";
import { Form, Input, InputNumber, Select, DatePicker, Row, Col, Button, Icon } from "antd";
import YaoSelect from "./lib/YaoSelect";
import YaoSearchSelect from "./lib/YaoSearchSelect";
import styles from "./index.less";

const { Option } = Select;
const FormItem = Form.Item;
// 默认的layout
const defaultFormItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const responsive = {
    1: { xs: 24 },
    2: { xs: 24, sm: 12 },
    3: { xs: 24, sm: 12, md: 8 },
    4: { xs: 24, sm: 12, md: 6 },
};

class Template extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            expandForm: true,
        };
    }

    onEffect = effect => {
        const { form } = this.props;
        form.resetFields(effect);
    };

    // 渲染单个表单项
    renderFormItem = ({ item, layout, columns }) => {
        const { form, fields } = this.props;
        const { label, key, type, optionData, props = {}, options = {}, resetFields = [], extra, instantiation, component, params, bring } = item;

        const col = columns > 4 ? 4 : columns;

        if (resetFields && resetFields.length > 0) {
            props.onChange = () => {
                this.onEffect(resetFields);
            };
        }

        // 解析后端接口组件请求参数
        const newParam = {};
        if (params && params.length > 0) {
            params.forEach(pItem => {
                if (pItem.type === "1") {
                    // 直接有默认值
                    newParam[pItem.searchKey] = pItem.value;
                } else if (pItem.type === "2") {
                    newParam[pItem.searchKey] = fields[pItem.tplKey] && fields[pItem.tplKey].value ? fields[pItem.tplKey].value : "";
                } else if (pItem.type === "3") {
                    // 深度判断
                    newParam[pItem.searchKey] = fields[pItem.tplKey] && fields[pItem.tplKey].value ? fields[pItem.tplKey].value[pItem.valueKey] : "";
                } else if (pItem.type === "4") {
                    // moment一层
                    newParam[pItem.searchKey] = fields[pItem.tplKey] && fields[pItem.tplKey].value ? moment(fields[pItem.tplKey].value).format("YYYY-MM-DD") : "";
                } else if (pItem.type === "5") {
                    // moment二层
                    newParam[pItem.searchKey] = fields[pItem.tplKey] && fields[pItem.tplKey].value ? moment(fields[pItem.tplKey].value[pItem.valueKey]).format("YYYY-MM-DD") : "";
                } else if (pItem.type === "6") {
                    // moment数组, 日期区间
                    newParam[pItem.searchKey[0]] = fields[pItem.tplKey] && fields[pItem.tplKey].value ? moment(fields[pItem.tplKey].value[0]).format("YYYY-MM-DD") : "";
                    newParam[pItem.searchKey[1]] = fields[pItem.tplKey] && fields[pItem.tplKey].value ? moment(fields[pItem.tplKey].value[1]).format("YYYY-MM-DD") : "";
                }
            });
        }

        // 初始化组件为单行文本输入
        let comp = <Input {...props} />;

        // 不同type解析不同组件
        if (type === "text") {
            comp = <Input {...props} />;
        } else if (type === "number") {
            comp = <InputNumber {...props} />;
        } else if (type === "select" && optionData && optionData.length > 0) {
            comp = (
                <Select {...props}>
                    {optionData.map(ele => (
                        <Option key = {ele.value}>{ele.label}</Option>
                    ))}
                </Select>
            );
        } else if (type === "datePicker") {
            comp = <DatePicker {...props} />;
        } else if (type === "YaoSelect") {
            comp = <YaoSelect {...props} params = {{ ...newParam }} />;
        } else if (type === "YaoSearchSelect") {
            comp = (
                <YaoSearchSelect
                    {...props}
                    params = {{ ...newParam }}
                    onChange = {obj => {
                        this.onEffect(resetFields);
                        this.onChange(obj, bring);
                    }}
                />
            );
        } else if (instantiation) {
            comp = component;
        }

        return (
            <Col {...responsive[col]} key = {key}>
                <FormItem key = {key} label = {label} {...layout} extra = {extra}>
                    {form.getFieldDecorator(key, {
                        normalize: val => (typeof val === "string" ? val.trim() : val),
                        ...options,
                    })(comp)}
                </FormItem>
            </Col>
        );
    };

    onChange = (obj, bring) => {
        const { form } = this.props;
        if (bring && bring.length > 0) {
            bring.forEach(item => {
                form.setFieldsValue({
                    [item]: obj[item],
                });
            });
        }
    };

    onSubmit = e => {
        e.preventDefault();
        const { form, onSubmit } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                onSubmit(values);
            }
        });
    };

    onReset = () => {
        const { onReset, form } = this.props;
        form.resetFields();
        if (onReset) {
            onReset();
        }
    };

    toggleForm = () => {
        const { expandForm } = this.state;
        this.setState({
            expandForm: !expandForm,
        });
    };

    render() {
        // items格式即为上文配置的表单项
        const { items, layout, columns, less, size } = this.props;
        const { expandForm } = this.state;
        const col = columns > 4 ? 4 : columns;

        const newTplData = expandForm ? items : items.slice(0, less);

        // const searchClass = classnames({
        //     [styles.show]: expandForm,
        //     [styles.hide]: !expandForm,
        // });

        return (
            <div className = {styles["search-area"]}>
                <Form onSubmit = {this.onSubmit}>
                    <Row gutter = {{ md: 8, lg: 24, xl: 48 }} type = "flex" align = "top">
                        {newTplData.map(item => this.renderFormItem({ item, layout, columns }))}
                        {expandForm ? null : (
                            <Col {...responsive[col]}>
                                <FormItem>
                                    <span>
                                        <Button type = "primary" size = {size} htmlType = "submit">
                                            查询
                                        </Button>
                                        <Button
                                            style = {{
                                                marginLeft: 8,
                                            }}
                                            size = {size}
                                            onClick = {this.onReset}
                                        >
                                            重置
                                        </Button>
                                        {items.length > 2 ? (
                                            <a
                                                style = {{
                                                    marginLeft: 8,
                                                }}
                                                size = {size}
                                                onClick = {this.toggleForm}
                                            >
                                                展开 <Icon type = "down" />
                                            </a>
                                        ) : null}
                                    </span>
                                </FormItem>
                            </Col>
                        )}
                    </Row>
                    {expandForm ? (
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
                                <span>
                                    <Button type = "primary" size = {size} htmlType = "submit">
                                        查询
                                    </Button>
                                    <Button
                                        style = {{
                                            marginLeft: 8,
                                        }}
                                        size = {size}
                                        onClick = {this.onReset}
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
                                </span>
                            </div>
                        </div>
                    ) : null}
                </Form>
            </div>
        );
    }
}

// colums [1,2,3,4]
Template.propTypes = {
    items: PropTypes.array.isRequired,
    layout: PropTypes.object,
    globalParam: PropTypes.object,
    columns: PropTypes.number,
    form: PropTypes.object.isRequired,
    less: PropTypes.number,
    size: PropTypes.string,
};

Template.defaultProps = {
    layout: defaultFormItemLayout,
    columns: 3,
    less: 2,
    size: "default",
    globalParam: {},
};

// export default Form.create({ onValuesChange: handleFormChange })(YaoFormTemplate);

export default Form.create({
    mapPropsToFields(props) {
        const fieldsObj = {};
        const { fields } = props;
        Object.keys(fields).forEach(item => {
            fieldsObj[item] = Form.createFormField({
                ...fields[item],
                value: fields[item].value,
            });
        });
        return fieldsObj;
    },
    onFieldsChange: (props, changedFields) => {
        if (props.onChange) {
            props.onChange(changedFields);
        }
    },
})(Template);
