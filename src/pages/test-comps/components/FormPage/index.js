/* eslint-disable react/destructuring-assignment */
/* eslint-disable prefer-destructuring */
import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "dva";
import { Form, Input, Tooltip, Icon, Select, Checkbox, Button, AutoComplete, Row, InputNumber, Upload } from "antd";
import ReactEcharts from "echarts-for-react";

import {
    isNull,
    singleColRow,
    singleColMultiRow,
    multiColRow,
    transMoney,
    UUID,
    isObjNull,
    // validate
} from "@/utils/utils";
import { ComplexItem, MultiItem, City, Area, AreaButton, ModalList, BtnGroup } from "@/components/complex-form";
import UploadClip from "@/components/UploadClip";
import FuzzySearch from "@/components/FuzzySearch";
import { EditTable, CardTable, RebateTable } from "@/components/complex-table";
import GeoMap from "@/components/chart";
import Shop from "@/pages/med-market/activity-group-manage/components/Shop";

import styles from "./index.less";

import genRules from "@/utils/rules";

const editColums = [
    {
        title: "name",
        dataIndex: "name",
        editable: true,
        width: 130,
    },
    {
        title: "age",
        dataIndex: "age",
        width: 10,
    },
    {
        title: "address",
        dataIndex: "address",
        editable: true,
        width: 200,
    },
];

const singleCol = [
    {
        title: "name",
        dataIndex: "name",
        editable: true,
        width: 130,
    },
    {
        title: "age",
        dataIndex: "age",
        width: 10,
    },
    {
        title: "address",
        dataIndex: "address",
        width: 200,
    },
];

const trainCol = [
    {
        title: "索引",
        dataIndex: "index",
        width: 20,
        render: (text, record, index) => index,
    },
    {
        title: "培训",
        dataIndex: "train",
        editable: true,
        width: 300,
    },
];
const emptyRow = {
    name: undefined,
    age: 35,
    address: undefined,
};

const trainEmptyRow = {
    train: undefined,
};

const rebateRow = {
    rewardType: undefined,
    meet: undefined,
    reward: undefined,
};

/* console.log(
    genRules({
        required: true,
        max: 10,
    })
); */

const ruleObj = {
    empty: "请输入相关内容",
    noRule: "请输入验证规则",
    rowRule: "当前行的值应该大于上一行的值",
};

// 字段数组,防止后续做更改
const fieldArr = ["rewardType", "meet", "reward"];

const defaultList = [
    {
        uid: "-1",
        name: "image.png",
        status: "done",
        url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
    {
        uid: "-2",
        name: "image.png",
        status: "done",
        url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
    {
        uid: "-3",
        name: "image.png",
        status: "done",
        url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
];

const modalColumns = [
    {
        title: "索引",
        dataIndex: "index",
        width: 80,
        render: (text, record, index) => index,
    },
    {
        title: "ERP编码",
        dataIndex: "erpCode",
    },
    {
        title: "批准文号",
        dataIndex: "approvNum",
    },
    {
        title: "商品名称",
        dataIndex: "medicinesName",
    },
    {
        title: "包装规格",
        dataIndex: "packageSpec",
    },
];

const resParam = {
    value: "id",
    text: "taskName",
};

const searchFields = {
    id: {
        key: "venderId",
        value: "3861087",
    },
    searchField: "companyName",
};

const uploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
};

let dispatch;

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;

const option = {
    title: {
        text: "ECharts 入门示例",
    },
    tooltip: {},
    legend: {
        data: ["销量"],
    },
    xAxis: {
        data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
    },
    yAxis: {},
    series: [
        {
            name: "销量",
            type: "bar",
            data: [5, 20, 36, 10, 10, 20],
        },
    ],
};

@connect(state => state.test)
class FormPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDirty: false,
            autoCompleteResult: [],
        };
        dispatch = this.props.dispatch;
    }

    handleSubmit = e => {
        e.preventDefault();
    };

    handleConfirmBlur = e => {
        const { confirmDirty } = this.state;
        const { value } = e.target;
        this.setState({ confirmDirty: confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue("password")) {
            callback("Two passwords that you enter is inconsistent!");
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const { form } = this.props;
        const { confirmDirty } = this.state;
        if (value && confirmDirty) {
            form.validateFields(["confirm"], { force: true });
        }
        callback();
    };

    handleWebsiteChange = value => {
        let autoCompleteResult;
        if (!value) {
            autoCompleteResult = [];
        } else {
            autoCompleteResult = [".com", ".org", ".net"].map(domain => `${value}${domain}`);
        }
        this.setState({ autoCompleteResult });
    };

    onClick = () => {
        const {
            form: { validateFields },
        } = this.props;
        validateFields((err, values) => {
            console.log("values", values);
        });
    };

    changeVal = bits => e => {
        console.log("e", e, bits);
    };

    validate = isPass => {
        console.log("isPass", isPass);
    };

    /**
     * 奖励校验，分两种情况如果每行只有一个输入项 只进行行间校验，如果有两个输入，既要校验行间也要校验行内
     * @param {Object} colFieldObj { min: 'name', max: 'address'} 或者 { min: 'name'}
     * @memberof FormPage
     */
    handleValidator = colFieldObj => (rule, val, callback) => {
        if (isObjNull(val)) callback(ruleObj.empty);
        if (!colFieldObj) callback(ruleObj.noRule);
        const { min, max } = colFieldObj;
        if (!max) {
            // 表明只有行间校验
            const isValNull = val.some(item => isNull(item[min]));
            if (isValNull) {
                callback("请填写必输项");
                // return;
            }
            const isRowValPass = this.rowValidate(val, { min, max: min });
            if (!isRowValPass) {
                callback(ruleObj.rowRule);
            }
        } else {
            // 行内校验
            const isValNull = val.some(item => isNull(item[min]) || isNull(item[max]));
            console.log("isValNull", isValNull);
            if (isValNull) {
                callback("请填写必输项");
                // return;
            }
            const isColValPass = this.colValidate(val, callback, { min, max });
            const isRowValPass = this.rowValidate(val, callback, { min, max });
            if (!isColValPass) {
                callback(`同行内${max}的值应该大于${min}`);
            } else if (!isRowValPass) callback(ruleObj.rowRule);
        }

        callback();
    };

    /**
     * @param {*} val 当前字段值
     * @param {*} { min, max }
     */
    colValidate = (val, callback, { min, max }) => {
        let isPass = true;
        val.forEach(item => {
            if (!item[max] || !item[min]) {
                callback("请输入必填项");
                isPass = false;
            } else if (item[max] < item[min]) {
                isPass = false;
            }
        });

        return isPass;
    };

    rowValidate = (val, callback, compareObj) => {
        const { min, max } = compareObj;
        console.log("compareObj min max", compareObj, min, max);
        let isPass = true;
        val.forEach((item, index, arr) => {
            if (index > 0 && item[min] <= arr[index - 1][max]) isPass = false;
        });
        return isPass;
    };

    /**
     *
     * 返利校验
     * @param {*} rule
     * @param {*} val getFieldDecorator获取到的值
     * @param {*} callback 无论是否通过校验均需调用
     */
    handleReValalidate = (rule, val, callback) => {
        const that = this;
        const isNotNull = that.isNullValidate(val, callback);
        if (isNotNull) {
            that.specialRuleVad(val, callback);
        }
        // 非空校验
        callback();
    };

    /**
     * @returns {Boolean} isPass 是否通过校验，true为通过，false为未通过
     */
    isNullValidate = (val, callback) => {
        let isPass = true;
        isPass = val.every(item => {
            const temp = fieldArr.every(field => typeof item[field] !== "undefined");
            return temp;
        });
        if (!isPass) callback("请填写必输项");
        return isPass;
    };

    specialRuleVad = (val, callback) => {
        let isPass = true;
        const vadArr = fieldArr.slice(1);
        if (Array.isArray(val) && val.length > 1) {
            val.forEach((item, index, currentArr) => {
                if (index > 0) {
                    const temp = vadArr.some(field => item[field] <= currentArr[index - 1][field]);
                    if (temp) {
                        callback(`第${index + 1}行的值应该大于${index}行的值`);
                        isPass = false;
                    }
                }
            });
        }
        return isPass;
    };

    /**
     * 编辑完成后将返回的blob上传到后台
     * @param {*} {file, blob}
     */
    onEdit = async ({ file, blob }) => {
        console.log("dispatch", dispatch);
        let formData = new FormData();
        formData.append("files", blob);
        formData.append("id", file.uid);
        await dispatch({
            type: "test/uploadFile",
            payload: formData,
        });

        formData = null;
    };

    render() {
        const formClasses = classnames({
            [styles["form-page"]]: true,
            // 'standard-center': true
        });
        const {
            form: { getFieldDecorator },
        } = this.props;
        const { autoCompleteResult } = this.state;

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };
        const prefixSelector = getFieldDecorator("prefix", {
            initialValue: "86",
        })(
            <Select style = {{ width: 70 }}>
                <Option value = "86">+86</Option>
                <Option value = "87">+87</Option>
            </Select>
        );

        const websiteOptions = autoCompleteResult.map(website => <AutoCompleteOption key = {website}>{website}</AutoCompleteOption>);

        return (
            <div className = {formClasses}>
                <div className = {styles["area-header"]}>单列单行</div>

                <Form {...singleColRow}>
                    <Form.Item label = "附件上传">
                        {getFieldDecorator("appendix", {
                            /* initialValue: {
                                file: undefined,
                                fileList: [
                                    {
                                        uid: '-1',
                                        name: 'xxx.png',
                                        status: 'done',
                                        url: 'http://www.baidu.com/xxx.png'
                                    },
                                ]
                            }, */
                        })(
                            <Upload {...uploadProps} defaultFileList = {defaultList}>
                                <Button>
                                    <Icon type = "upload" /> Upload
                                </Button>
                            </Upload>
                        )}
                    </Form.Item>
                    <Form.Item label = "弹框列表">
                        {getFieldDecorator("modalList", {
                            // initialValue: [],
                            ...genRules({
                                required: true,
                            }),
                        })(<ModalList test = {Shop} renderSearch = {param => <Shop {...param} />} url = "/api/be/activity/sku/getWare" columns = {modalColumns} rowKey = "factorySkuId" />)}
                    </Form.Item>
                    <Form.Item label = "单选按钮">
                        {getFieldDecorator("redioBtn", {
                            initialValue: undefined,
                            ...genRules({
                                required: true,
                            }),
                        })(
                            <BtnGroup
                                textArr = {[
                                    {
                                        text: "按完成质量(每商品每句话)",
                                        value: 1,
                                    },
                                    {
                                        text: "按完成质量(每商品整体)",
                                        value: 2,
                                    },
                                ]}
                            />
                        )}
                    </Form.Item>
                    <Form.Item label = "奖励">
                        {getFieldDecorator("reward", {
                            initialValue: [
                                {
                                    key: UUID(),
                                    name: undefined,
                                    age: "32",
                                    address: undefined,
                                },
                            ],
                            rules: [
                                { required: true },
                                {
                                    validator: this.handleValidator({
                                        min: "name",
                                        max: "address",
                                    }),
                                },
                            ],
                        })(<EditTable columns = {editColums} emptyRow = {emptyRow} validate = {this.validate} limit = {5} />)}
                    </Form.Item>
                    <Form.Item label = "单列奖励">
                        {getFieldDecorator("singlereward", {
                            initialValue: [
                                {
                                    key: UUID(),
                                    name: undefined,
                                    age: "32",
                                    address: undefined,
                                },
                            ],
                            rules: [
                                { required: true },
                                {
                                    validator: this.handleValidator({
                                        min: "name",
                                        max: "name",
                                    }),
                                },
                            ],
                        })(<EditTable columns = {singleCol} emptyRow = {emptyRow} validate = {this.validate} limit = {5} />)}
                    </Form.Item>
                    <Form.Item label = "培训内容">
                        {getFieldDecorator("trainContent", {
                            initialValue: [
                                {
                                    key: UUID(),
                                    train: undefined,
                                },
                            ],
                            rules: [
                                { required: true, message: "请填写必输项" },
                                /* {
                                    validator: validate('train').trainContent
                                } */
                            ],
                        })(<CardTable columns = {trainCol} emptyRow = {trainEmptyRow} />)}
                    </Form.Item>
                    <Form.Item label = "返利">
                        {getFieldDecorator("rebate", {
                            initialValue: [
                                {
                                    key: UUID(),
                                    rewardType: undefined,
                                    meet: undefined,
                                    reward: undefined,
                                },
                            ],
                            rules: [
                                {
                                    required: true,
                                    validator: this.handleReValalidate,
                                },
                            ],
                        })(<RebateTable emptyRow = {rebateRow} limit = {5} />)}
                    </Form.Item>
                    <Form.Item label = "城市级联">
                        {getFieldDecorator("area", {
                            initialValue: undefined,
                            ...genRules({
                                required: true,
                            }),
                        })(<Area url = "/area/loadArea" maxTagCount = {3} />)}
                    </Form.Item>
                    <Form.Item label = "区域选择">
                        {getFieldDecorator("modalArea", {
                            initialValue: undefined,
                            ...genRules({
                                required: true,
                            }),
                        })(<AreaButton url = "/area/loadArea" />)}
                    </Form.Item>
                    <Form.Item label = "联想搜索">
                        {getFieldDecorator("companyName", {
                            initialValue: { key: "", label: "" },
                            rules: [
                                {
                                    required: false,
                                },
                            ],
                        })(
                            // <FuzzySearch url = "https://randomuser.me/api/?results=5" />
                            <FuzzySearch url = "/act/task/queryList" resParam = {resParam} searchFields = {searchFields} />
                        )}
                    </Form.Item>
                    <Form.Item label = "图片上传">
                        {getFieldDecorator("uploadImg", {
                            initialValue: defaultList,
                            ...genRules({
                                required: true,
                            }),
                        })(
                            <UploadClip
                                url = "https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                multiple
                                headers = {{}}
                                limitSize = {100} // 单位为M
                                limitNum = {5}
                                onPreview = {file => console.log("预览回调", file)}
                                onRemove = {file => {
                                    console.log("删除回调", file);
                                }}
                                showRemoveIcon
                                showPreviewIcon
                                showEditIcon
                                onEdit = {this.onEdit}
                            />
                        )}
                    </Form.Item>
                    <Form.Item label = "城市选择">
                        {getFieldDecorator("city", {
                            initialValue: [1, 2816],
                            ...genRules({
                                required: true,
                            }),
                        })(<City url = "/area/loadArea" />)}
                    </Form.Item>
                    <Form.Item label = "E-mail">
                        {getFieldDecorator(
                            "email",
                            genRules({
                                required: true,
                                email: true,
                            })
                        )(<Input />)}
                    </Form.Item>
                    <Form.Item label = "Password" hasFeedback>
                        {getFieldDecorator("password", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your password!",
                                },
                                {
                                    validator: this.validateToNextPassword,
                                },
                            ],
                        })(<Input.Password />)}
                    </Form.Item>
                    <Form.Item label = "Confirm Password" hasFeedback>
                        {getFieldDecorator("confirm", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please confirm your password!",
                                },
                                {
                                    validator: this.compareToFirstPassword,
                                },
                            ],
                        })(<Input.Password onBlur = {this.handleConfirmBlur} />)}
                    </Form.Item>
                    <Form.Item
                        label = {
                            <span>
                                Nickname&nbsp;
                                <Tooltip title = "What do you want others to call you?">
                                    <Icon type = "question-circle-o" />
                                </Tooltip>
                            </span>
                        }
                    >
                        {getFieldDecorator("nickname1", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your nickname!",
                                    whitespace: true,
                                },
                            ],
                        })(<Input />)}
                    </Form.Item>
                    <Form.Item label = "Phone Number">{getFieldDecorator("phone", genRules({ required: true }))(<Input addonBefore = {prefixSelector} style = {{ width: "100%" }} />)}</Form.Item>
                    <Form.Item label = "Website">
                        {getFieldDecorator("website", genRules({ required: true }))(
                            <AutoComplete dataSource = {websiteOptions} onChange = {this.handleWebsiteChange} placeholder = "website">
                                <Input />
                            </AutoComplete>
                        )}
                    </Form.Item>
                    <Form.Item {...tailFormItemLayout}>
                        {getFieldDecorator("agreement", {
                            valuePropName: "checked",
                        })(
                            <Checkbox>
                                I have read the <a href = "">agreement</a>
                            </Checkbox>
                        )}
                    </Form.Item>
                    <Form.Item {...tailFormItemLayout}>
                        <Button type = "primary" htmlType = "submit">
                            Register
                        </Button>
                    </Form.Item>
                </Form>
                <div className = {styles["area-header"]}>单列多行</div>
                <Form {...singleColMultiRow} className = {styles["multi-row"]} labelAlign = "left">
                    {/* <Col span = {6} offset = {9}>
                        <label className = "ant-form-item-required">email</label>
                    </Col> */}
                    {/* <Col> */}
                    {/* <Form.Item>
                        {getFieldDecorator('email', {
                            rules: [
                                {
                                    type: 'email',
                                    message: 'The input is not valid E-mail!',
                                },
                                {
                                    required: true,
                                    message: 'Please input your E-mail!',
                                },
                            ],
                        })(<Input />)}
                    </Form.Item> */}
                    <ComplexItem label = "Password">
                        {getFieldDecorator("abc", {
                            rules: [
                                {
                                    type: "email",
                                    message: "The input is not valid E-mail!",
                                },
                                {
                                    required: true,
                                },
                            ],
                        })(<Input />)}
                    </ComplexItem>
                    <ComplexItem label = "金额">
                        {getFieldDecorator("amount", {
                            getValueFromEvent: transMoney(3),
                            rules: [
                                {
                                    required: true,
                                },
                                {
                                    type: "number",
                                },
                            ],
                        })(<Input suffix = "元" />)}
                    </ComplexItem>
                    <ComplexItem label = "Confirm Password">
                        {getFieldDecorator("confirm password", {
                            rules: [
                                {
                                    type: "email",
                                    message: "The input is not valid E-mail!",
                                },
                                {
                                    required: true,
                                    message: "Please input your E-mail!",
                                },
                            ],
                        })(<Input />)}
                    </ComplexItem>
                    <ComplexItem label = "select city">
                        {getFieldDecorator("select", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please select your country!",
                                },
                            ],
                        })(
                            <Select placeholder = "Please select a country">
                                <Option value = "china">China</Option>
                                <Option value = "usa">U.S.A</Option>
                            </Select>
                        )}
                    </ComplexItem>
                </Form>
                <div className = {styles["area-header"]}>多列多行</div>
                <Form {...multiColRow} labelAlign = "right">
                    <Row>
                        <MultiItem label = "E-mail">
                            {getFieldDecorator(
                                "email",
                                genRules({
                                    required: true,
                                    email: true,
                                })
                            )(<Input />)}
                        </MultiItem>
                        <MultiItem label = "最大长度测试">
                            {getFieldDecorator(
                                "maxLength",
                                genRules({
                                    required: true,
                                    max: 10,
                                })
                            )(<Input />)}
                        </MultiItem>
                        <MultiItem label = "ID Number">
                            {getFieldDecorator("id", {
                                ...genRules({
                                    required: true,
                                    number: 0,
                                }),
                                initialValue: 1,
                            })(<InputNumber min = {1} className = {styles.fillWidth} step = {0.01} precision = {2} />)}
                        </MultiItem>
                        <MultiItem label = "Password" hasFeedback>
                            {getFieldDecorator("password1", {
                                rules: [
                                    {
                                        required: true,
                                        message: "Please input your password!",
                                    },
                                    {
                                        validator: this.validateToNextPassword,
                                    },
                                ],
                            })(<Input.Password />)}
                        </MultiItem>
                        <MultiItem label = "Confirm Password" hasFeedback>
                            {getFieldDecorator("confirm", {
                                rules: [
                                    {
                                        required: true,
                                        message: "Please confirm your password!",
                                    },
                                    {
                                        validator: this.compareToFirstPassword,
                                    },
                                ],
                            })(<Input.Password onBlur = {this.handleConfirmBlur} />)}
                        </MultiItem>
                        <MultiItem
                            label = {
                                <span>
                                    Nickname&nbsp;
                                    <Tooltip title = "What do you want others to call you?">
                                        <Icon type = "question-circle-o" />
                                    </Tooltip>
                                </span>
                            }
                        >
                            {getFieldDecorator("nickname", {
                                rules: [
                                    {
                                        required: true,
                                        message: "Please input your nickname!",
                                        whitespace: true,
                                    },
                                ],
                            })(<Input />)}
                        </MultiItem>
                        <MultiItem label = "Phone Number">
                            {getFieldDecorator("phone1", {
                                rules: [
                                    {
                                        required: true,
                                        message: "Please input your phone number!",
                                    },
                                ],
                            })(<Input addonBefore = {prefixSelector} style = {{ width: "100%" }} />)}
                        </MultiItem>
                        <MultiItem label = "Website">
                            {getFieldDecorator("website", {
                                rules: [
                                    {
                                        required: true,
                                        message: "Please input website!",
                                    },
                                ],
                            })(
                                <AutoComplete dataSource = {websiteOptions} onChange = {this.handleWebsiteChange} placeholder = "website">
                                    <Input />
                                </AutoComplete>
                            )}
                        </MultiItem>
                    </Row>
                </Form>
                <Button type = "primary" onClick = {this.onClick}>
                    提交
                </Button>
                <ReactEcharts option = {option} style = {{ height: "220px", width: "100%" }} />
                <GeoMap />
            </div>
        );
    }
}

export default Form.create()(FormPage);
