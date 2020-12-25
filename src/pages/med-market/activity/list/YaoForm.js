// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Form, Input, Row, Col, Button, Icon } from "antd";
import { genSearchField } from "../../activity-pull-sales/components/PullSaleCreate/validate";

import styles from "./index.less";

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

// 监听表单变化
// const handleFormChange = (props, changedValues, allValues) => {
//     if (props.onChange) {
//         props.onChange(allValues);
//     }
// };
class YaoForm extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            expandForm: !props.expandFormhide,
        };
    }

    // 渲染单个表单项
    renderFormItem = ({ item, layout, form, columns }) => {
        const {
            form: { getFieldValue },
            size,
        } = this.props;
        const { label, key, required, component, options = {}, rules, extra, init, props = {}, param } = item;

        const col = columns > 4 ? 4 : columns;

        let comp = component;

        // 暂时针对药企和任务名称联动处理
        if (init === 1) {
            if (param) {
                comp = (
                    <item.component
                        {...props}
                        searchFields = {genSearchField({
                            value: getFieldValue("venderId") && getFieldValue("venderId").venderId ? getFieldValue("venderId").venderId : "",
                        })}
                    />
                );
            } else {
                comp = <item.component {...props} onChange = {this.effectChange} />;
            }
        }
        return (
            <Col {...responsive[col]} key = {key}>
                <FormItem key = {key} label = {label} {...layout} extra = {extra}>
                    {form.getFieldDecorator(key, {
                        normalize: val => (typeof val === "string" ? val.trim() : val),
                        ...options,
                        form, // 处理复杂的表单校验
                        rules: rules || [{ required, message: `${label}不能为空` }],
                    })(comp || <Input size = {size} />)}
                </FormItem>
            </Col>
        );
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

        // 兼容自定义组件任务名称，药企名称
        form.setFieldsValue({
            actTask: { key: "", label: "" },
            venderId: { key: "", label: "" },
        });

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

    effectChange = () => {
        const { form } = this.props;
        form.setFieldsValue({
            actTask: { key: "", label: "" },
        });
    };

    render() {
        // items格式即为上文配置的表单项
        const { items, layout, columns, form, less, size } = this.props;
        const { expandForm } = this.state;
        const col = columns > 4 ? 4 : columns;

        const newTplData = expandForm ? items : items.slice(0, less);

        // const searchClass = classnames({
        //     [styles.show]: expandForm,
        //     [styles.hide]: !expandForm,
        // });

        return (
            <div className = {styles["search-area"]}>
                <Form className = {styles["search-form"]} onSubmit = {this.onSubmit}>
                    <Row gutter = {{ md: 8, lg: 24, xl: 48 }} type = "flex" align = "top">
                        {newTplData.map(item => this.renderFormItem({ item, layout, form, columns }))}
                        {expandForm && items.length > 2 ? null : (
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
                    {expandForm && items.length > 2 ? (
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
YaoForm.propTypes = {
    items: PropTypes.array,
    layout: PropTypes.object,
    columns: PropTypes.number,
    form: PropTypes.object.isRequired,
    less: PropTypes.number,
    size: PropTypes.string,
};

YaoForm.defaultProps = {
    items: [],
    layout: defaultFormItemLayout,
    columns: 3,
    less: 2,
    size: "default",
};

// export default Form.create({ onValuesChange: handleFormChange })(YaoForm);

export default Form.create({
    mapPropsToFields(props) {
        const fieldsObj = {};
        const { fields = {} } = props;
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
})(YaoForm);
