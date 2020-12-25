/* eslint-disable react/no-unused-state */
/* eslint-disable no-restricted-globals */
/* eslint-disable prefer-destructuring */
import React, { Component } from "react";
import { connect } from "dva";
import router from "umi/router";
import classnames from "classnames";
import cloneDeep from "lodash/cloneDeep";
import omit from "lodash/omit";
import moment from "moment";
import { Form, Steps, Row, Col, Input, DatePicker, Button, message, Radio, Upload, Icon, Select } from "antd";

// import Header from "@/components/Header";
import FuzzySearch from "@/components/FuzzySearch";
import { Loading } from "@/components";
import { MultiItem, openNotification } from "@/components/complex-form";
import { containerLayout, getTime, normalFormat, genInitVal, isBefore, formatTime, success as sucFunc, err as failFunc } from "@/utils/utils";
import handleRow from "./validate";

import { validateNum, genNumValidate } from "@/utils/rules";

import styles from "./index.less";
// import FormPage from "@/pages/test-comps/components/FormPage";

const { Step } = Steps;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const MessageWrapper = (type, msg) => message[type](msg, 2);
let dispatch;

const magColRow = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        md: { span: 8 },
        lg: { span: 8 },
        xxl: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 14 },
        lg: { span: 14 },
        // xl: { span: 14, },
        xxl: { span: 14 },
    },
};

const lengthRule = [
    {
        required: true,
        message: "请输入任务名称",
    },
    {
        pattern: validateNum,
        message: "请输入中文英文数字不超过60",
    },
];

// console.log("validateNum", validateNum, validateNum.test("1a中fdafda"));

const resParam = {
    value: "venderId",
    text: "companyName",
};

const searchFields = {
    searchField: "companyName",
};

const format = "YYYY年MM月DD日";

/* const formatAmount = (values, fieldArr) => {
    // 将金额类的组件值转换为数字
    const newVal = cloneDeep(values);
    const resObj = {};
    fieldArr.forEach(item => {
        resObj[item] = parseFloat(resObj[item]);
    })
    return Object.assign({}, newVal, resObj);
} */

// 任务周期不超过一年，开始时间不早于当前时间
const validateTime = allValues => {
    const { taskTime } = allValues;

    if (taskTime) {
        const diffVal = taskTime[1].diff(taskTime[0], "years", true);
        if (diffVal > 1) {
            MessageWrapper("error", "任务周期不得大于1年");
            return false;
        }
        const resObj = getTime(taskTime);
        // console.log("time", resObj);
        return resObj;
    }
    return false;
};

const parseStrToNum = (allValues, arr) => arr.map(item => parseFloat(allValues[item]));

// 验证金额
const validateMoney = allValues => {
    const newArr = parseStrToNum(allValues, ["preSpend", "income"]);
    const isSomeNaN = newArr.some(item => isNaN(item));
    if (isSomeNaN) return false;
    const [preSpend, income] = newArr;

    if (!isSomeNaN && preSpend > income) {
        openNotification("警告", "预支出金额大于收入");
        return false;
    }

    return {
        preSpend,
        income,
    };
};

const validate = allValues => {
    /* if () {
        message.error("开始时间不能早于结束时间", 2);
        return false;
    }
    return true; */
    const timeVal = validateTime(allValues);
    // const moneyVal = validateMoney(allValues, props);
    const moneyVal = validateMoney(allValues);
    if (!timeVal || !moneyVal) return false;
    return {
        timeVal,
        moneyVal,
    };
};

const onValuesChange = (props, changedValues, allValues) => {
    // 时间校验，开始时间和结束时间不超过1年， 并且活动时间要小于等于任务开始时间
    validate(allValues);
};

/* const formatTime = (values) => {

} */

const remarkPlace = {
    1: "不超出200个字符",
    2: "请填写打款公司全称，并与其保持一致",
};

@connect(({ market, loading }) => ({
    ...market,
    loading,
}))
class CoopOperation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: {
                pageType: "add",
                id: undefined,
            },
            rowData: {},
            spinning: false,
            stepItems: [],
        };
        dispatch = props.dispatch;
        this.statusObj = {};
        this.promptMsg = "";
        this.current = 0;
    }

    async componentDidMount() {
        // 获取url上的id,根据id 请求数据
        const that = this;
        const {
            location: { query },
        } = that.props;
        const { id, pageType } = query || {};
        that.setState({ query }, () => {
            this.current = this.genCurrent();
            this.genStep();
        });

        if (pageType && pageType !== "add") {
            await that.callModel("queryDetail", { id: parseFloat(id) }, (data, success) => {
                if (!success) MessageWrapper("error", "未查询到该条数据");
                const newData = handleRow(data);
                that.setState(
                    {
                        rowData: newData,
                        spinning: false,
                    },
                    () => {
                        this.current = this.genCurrent();
                    }
                );
                this.genStep();
            });
        }
    }

    /**
     * 创建和编辑保存复合事件，编辑保存时要加提示框
     *
     */
    onComClick = () => {
        const that = this;
        const {
            form: { validateFields },
        } = that.props;
        validateFields((err, values) => {
            console.log("values", values);
            if (err) return;

            const {
                query: { pageType, id },
            } = that.state;

            // 业务校验包括金额和实际校验
            const validateVal = validate(cloneDeep(values));
            if (!validateVal) return;

            const { moneyVal, timeVal } = validateVal;
            /* console.log(
                "save value",
                Object.assign({}, values, moneyVal, timeVal, {
                    returnTime: moment(values.returnTime).format(normalFormat),
                    venderId: parseFloat(values.companyName.key),
                })
            ); */
            console.log("otherValue", omit(values, ["taskTime", "contractTime", "annex", "companyName", "returnTime"]));
            const tempValue = Object.assign(
                {},
                omit(values, ["taskTime", "contractTime", "annex", "companyName", "returnTime"]),
                moneyVal,
                timeVal,
                {
                    returnTime: moment(values.returnTime).format(normalFormat),
                    venderId: values.companyName.key,
                },
                this.transDate(),
                this.transFile()
            );

            // 根据新增和编辑拼接返回值
            const saveValue = pageType === "add" ? tempValue : { id, ...tempValue };
            console.log("save value", saveValue);
            this.callModel("commonSave", saveValue, that.saveCallback, pageType);
            this.message = pageType === "add" ? "创建成功" : "编辑保存成功";
        });
    };

    transDate = () => {
        const { contractTime } = this.getValue();
        const [contractStartDate, contractEndDate] = formatTime(contractTime) || [];
        return { contractStartDate, contractEndDate };
    };

    transFile = () => {
        const { annex } = this.getValue();
        if (Array.isArray(annex)) {
            const { url, response: { data: path } = {}, name } = annex[0] || {};
            return { annex: url || path, annexName: name };
        }
        return { annex: undefined, annexName: undefined };
    };

    saveCallback = ({ msg, msgType }) => {
        this.setState({ spinning: false });
        // message[msgType](msg || "保存成功", 2);
        if (msgType === "success") {
            sucFunc({ content: "保存成功", title: "提示信息" }, () => {
                router.push({
                    pathname: "./list",
                });
            });
        } else {
            failFunc(msg || "保存失败", "提示信息");
        }
    };

    callModel = async (method, param, callBack, pageType) => {
        this.setState({ spinning: true });
        await dispatch({
            type: `market/${method}`,
            payload: param,
            pageType,
            callBack,
        });
    };

    disabledDate = current => current && current < moment().endOf("day");

    disabledTaskDate = current => {
        const { contractTime: [contractStart, contractEnd] = [] } = this.getValue();
        const normalRule = current && current < moment().endOf("day");
        if (contractStart && contractEnd) {
            return normalRule || current < moment(contractStart).startOf("day") || current > moment(contractEnd).endOf("day");
        }
        return normalRule;
    };

    /**
     * 生成步骤条方法
     * @returns Array Step组件组成的数组
     */
    genStep = () => {
        const {
            rowData: { status = 1 },
        } = this.state;
        // 不同审核状态 步骤条对应的描述
        const apprStepMap = new Map([[1, "待审核"], [3, `审核驳回:驳回字段待定`]]);

        const stepArr = [
            {
                title: "任务创建",
                description: "",
            },
            {
                title: "任务审核",
                description: apprStepMap.get(status),
            },
            {
                title: "任务待开始",
                description: "审核通过:未到开始时间",
            },
            {
                title: "任务开始",
                description: "",
            },
            {
                title: "任务结束",
                description: "",
            },
        ];
        const res = stepArr.map((item, key) => {
            const { title, description } = item;
            return (
                <Step
                    title = {title}
                    description = {description}
                    // eslint-disable-next-line react/no-array-index-key
                    key = {key}
                />
            );
        });
        this.setState({ stepItems: res });
    };

    /**
     * 判断当前进行到步骤条的哪一步 默认status为1 待审状态
     * pageType为add current 为0, 为edit current为1
     * @returns {Number} current 当前选中的步骤条
     */
    genCurrent = () => {
        const {
            rowData: { startTime, endTime, status = 1 },
            query: { pageType },
        } = this.state;
        let current = 0;
        if (pageType !== "add") {
            const isBeforeStart = moment().isBefore(moment(startTime));
            const isAfter = moment().isAfter(moment(endTime));
            const isMiddle = moment().isAfter(moment(startTime)) && moment().isBefore(moment(endTime));
            if (status !== 2) {
                current = 1; // 待审或者被拒
            } else {
                // 审核通过
                if (isBeforeStart) current = 2;
                if (isMiddle) current = 3;
                if (isAfter) current = 4;
            }
        }

        return current;
    };

    validActSettleId = (rule, value, callback) => {
        const { returnMoneyType } = this.getValue();
        const {
            form: { validateFields },
        } = this.props;
        if (returnMoneyType === 1) {
            validateFields(["returnMoneyType"], err => {
                console.log("err", err);
                callback();
            });
        }
        callback();
    };

    /**
     * 回款类型校验
     */
    validRefund = (rule, value, callback) => {
        const { actSettleId } = this.getValue();
        if (value === 1 && !actSettleId) {
            callback("选择活动前付费则活动费结算ID不能为空");
        }
        callback();
    };

    /**
     * 合同时间校验,合同周期不超过1年，任务时间应该在合同时间内
     */
    validContractTime = (rule, value, callback) => {
        const { taskTime: [taskStart, taskEnd] = [] } = this.getValue();
        const [contractStart, contractEnd] = value || [];
        if (Array.isArray(value)) {
            if (taskStart && (isBefore(taskStart, contractStart, "day") || isBefore(contractEnd, taskEnd, "day"))) {
                callback("合同时间应该包含任务时间");
            }

            if (value[1].diff(value[0], "y", true) > 1) callback("合同周期不超过1年");
            if (value[1].diff(moment().endOf("day"), "days", true) <= 0) callback("合同结束时间不得早于当前时间");
        } else {
            callback("请设置合同时间");
        }
        callback();
    };

    validTaskTime = (rule, value, callback) => {
        const [taskStart, taskEnd] = value || [];
        const { contractTime: [contractStart, contractEnd] = [] } = this.getValue();
        if (taskStart) {
            if (!contractStart) {
                callback("请先设置合同时间");
            } else if (isBefore(taskStart, contractStart, "day") || isBefore(contractEnd, taskEnd, "day")) {
                callback("任务时间应该在合同时间范围内");
            }
            if (taskEnd.diff(taskStart, "y", true) > 1) callback("任务周期不超过1年");
        } else {
            callback("请设置任务时间");
        }
        callback();
    };

    validCompany = (rule, value, callback) => {
        const { key } = value || {};
        if (!key) {
            callback("请选择公司");
        }
        callback();
    };

    getValue = () => {
        const {
            form: { getFieldsValue },
        } = this.props;
        return getFieldsValue();
    };

    getRowData = field => {
        const { rowData } = this.state;
        return rowData[field];
    };

    getVendorId = () => ({ key: this.getRowData("venderId") ? `${this.getRowData("venderId")}` : "", label: "" });

    // genInitialVal = (value) => ( typeof value !== 'undefined' ? { initialValue: value } : {})
    getDefaultFile = () => {
        const file = this.getRowData("annex");
        return file ? [file] : "";
    };

    validFile = (rule, value, callback) => {
        if (Array.isArray(value) && value.length > 1) {
            callback("目前只支持上传单个附件");
        }

        if (Array.isArray(value)) {
            console.log("file", value);
            const isFail = value.some(({ response: { success } = {}, status, path }) => !path && !success && status === "done");
            if (isFail) callback("上传接口异常");
        }
        callback();
    };

    validRemark = (rule, value, callback) => {
        const { feeSource } = this.getValue();
        if (feeSource === 2 && this.isNull(value)) {
            callback("费用来源为药交会时,备注内容为必填项");
        }
        callback();
    };

    validFeeSource = (rule, value, callback) => {
        const { form: { validateFields } = {} } = this.props;
        validateFields(["remark"], () => {
            callback();
        });
        callback();
    };

    isNull = data => typeof data === "undefined" || (typeof data === "string" && !data.trim());

    normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    render() {
        const that = this;
        const {
            query: { pageType },
            rowData,
            spinning,
            stepItems,
        } = that.state;
        const {
            form: { getFieldDecorator },
        } = that.props;

        const btnCon = classnames({
            [styles["btn-container"]]: true,
            [styles.hide]: pageType === "detail",
        });

        // 任务状态：1创建待审核，2审核通过，3审核驳回
        const { status = 0, taskName, income, returnTime, preSpend, startTime, endTime, remark, contractCode, contractEndDate, contractStartDate } = rowData;
        const isAllDisabled = pageType === "detail" || (pageType === "edit" && status === 2);
        const isSomeDis = pageType === "detail";
        const { contractTime, feeSource = 1 } = this.getValue();

        return (
            <div className = {styles["mag-com"]}>
                <Loading spinning = {spinning}>
                    <div>
                        <Steps current = {this.current} style = {{ padding: "24px 8%" }}>
                            {stepItems}
                        </Steps>
                        <div className = {styles["form-holder"]}>
                            <Form {...magColRow} labelAlign = "right">
                                <Row>
                                    <MultiItem label = "公司名称">
                                        {getFieldDecorator("companyName", {
                                            initialValue: this.getVendorId(),
                                            rules: [{ required: true, message: "请选择公司" }, { validator: this.validCompany }],
                                        })(<FuzzySearch url = "/api/be/vender/factory/list" resParam = {resParam} searchFields = {searchFields} disabled = {isAllDisabled} />)}
                                    </MultiItem>
                                </Row>
                                <Row>
                                    <MultiItem label = "任务名称">
                                        {getFieldDecorator("taskName", {
                                            ...genInitVal({ value: taskName }),
                                            rules: lengthRule,
                                        })(<Input disabled = {isAllDisabled} placeholder = "60字符" />)}
                                    </MultiItem>
                                    <MultiItem label = "费用收入">
                                        {getFieldDecorator("income", {
                                            ...genInitVal({ value: income }),
                                            rules: [
                                                {
                                                    required: true,
                                                    message: "请填写费用收入",
                                                },
                                                {
                                                    pattern: /^(([1-9][0-9]*)|0)(\.[0-9]{1,2})?$/,
                                                    message: "请输入0或不超过两位小数的正数",
                                                },
                                            ],
                                        })(<Input suffix = "元" disabled = {isAllDisabled} />)}
                                    </MultiItem>
                                    <MultiItem label = "回款时间">
                                        {getFieldDecorator("returnTime", {
                                            ...genInitVal({
                                                type: "time",
                                                value: returnTime,
                                            }),
                                            rules: [{ required: true, message: "请选择回款时间" }],
                                        })(<DatePicker className = "w-full" format = {format} disabled = {isSomeDis} disabledDate = {this.disabledDate} />)}
                                    </MultiItem>
                                    <MultiItem label = "活动预支出">
                                        {getFieldDecorator("preSpend", {
                                            ...genInitVal({ value: preSpend }),
                                            rules: [
                                                {
                                                    required: true,
                                                    message: "请填写活动预支出",
                                                },
                                                {
                                                    pattern: /^(([1-9][0-9]*)|0)(\.[0-9]{1,2})?$/,
                                                    message: "请输入0或不超过两位小数的正数",
                                                },
                                            ],
                                        })(<Input suffix = "元" disabled = {isSomeDis} placeholder = "60字符" />)}
                                    </MultiItem>
                                    <MultiItem label = "合同时间">
                                        {getFieldDecorator("contractTime", {
                                            ...genInitVal({
                                                type: "time",
                                                value: [contractStartDate, contractEndDate],
                                            }),
                                            rules: [
                                                { required: true, message: " " },
                                                {
                                                    validator: this.validContractTime,
                                                },
                                            ],
                                        })(<RangePicker className = "w-full" format = {format} disabled = {isAllDisabled} allowClear = {false} />)}
                                    </MultiItem>
                                    <MultiItem label = "合同编号">
                                        {getFieldDecorator("contractCode", {
                                            ...genInitVal({
                                                value: contractCode,
                                            }),
                                            rules: [
                                                {
                                                    required: true,
                                                    message: "请输入合同编号",
                                                },
                                                {
                                                    pattern: validateNum,
                                                    message: "请输入中文英文数字不超过60",
                                                },
                                            ],
                                        })(<Input disabled = {isAllDisabled} placeholder = "60字符" />)}
                                    </MultiItem>
                                    <MultiItem label = "任务时间">
                                        {getFieldDecorator("taskTime", {
                                            ...genInitVal({
                                                type: "time",
                                                value: [startTime, endTime],
                                            }),
                                            rules: [
                                                { required: true, message: " " },
                                                {
                                                    validator: this.validTaskTime,
                                                },
                                            ],
                                        })(<RangePicker className = "w-full" format = {format} disabledDate = {this.disabledTaskDate} disabled = {isAllDisabled || !contractTime} />)}
                                    </MultiItem>
                                    <MultiItem label = "活动费结算ID">
                                        {getFieldDecorator("actSettleId", {
                                            ...genInitVal({ value: this.getRowData("actSettleId") }),
                                            rules: [
                                                {
                                                    required: false,
                                                    message: "请输入活动费结算ID",
                                                },
                                                {
                                                    pattern: validateNum,
                                                    message: "请输入中文英文数字不超过60",
                                                },
                                                {
                                                    validator: this.validActSettleId,
                                                },
                                            ],
                                        })(<Input disabled = {isAllDisabled} placeholder = "60字符" />)}
                                    </MultiItem>
                                    <MultiItem label = "回款类型">
                                        {getFieldDecorator("returnMoneyType", {
                                            ...genInitVal({ value: this.getRowData("returnMoneyType") }),
                                            rules: [
                                                {
                                                    required: true,
                                                    message: "请选择回款类型",
                                                },
                                                { validator: this.validRefund },
                                            ],
                                        })(
                                            <Radio.Group disabled = {isAllDisabled}>
                                                <Radio value = {1}>活动前付费</Radio>
                                                <Radio value = {2}>活动后付费</Radio>
                                            </Radio.Group>
                                        )}
                                    </MultiItem>

                                    {/* <MultiItem label = "任务结束时间">
                                        {getFieldDecorator("endTime", {
                                            rules: [
                                                {
                                                    required: true,
                                                },
                                            ],
                                        })(<DatePicker
                                            className = "w-full"
                                            format = {format}
                                        />)}
                                    </MultiItem> */}
                                    {/* <MultiItem label = "机构ID">
                                        {getFieldDecorator("institutionId", {
                                            ...genInitVal({ value: this.getRowData("institutionId") }),
                                        })(<Input disabled = {isSomeDis} placeholder = "100字符" maxLength = {100} />)}
                                    </MultiItem> */}
                                    {/* <MultiItem label = "主体名称">
                                        {getFieldDecorator("mainBodyName", {
                                            ...genInitVal({ value: this.getRowData("mainBodyName") }),
                                        })(<Input disabled = {isSomeDis} placeholder = "200字符" maxLength = {200} />)}
                                    </MultiItem> */}
                                    {/* <MultiItem label = "费用类型">
                                        {getFieldDecorator("feeType", {
                                            ...genInitVal({ value: this.getRowData("feeType") }),
                                        })(<Input disabled = {isSomeDis} placeholder = "100字符" maxLength = {100} />)}
                                    </MultiItem> */}
                                    <MultiItem label = "费用来源">
                                        {getFieldDecorator("feeSource", {
                                            ...genInitVal({ value: this.getRowData("feeSource") || 1 }),
                                            rules: [{ validator: this.validFeeSource }],
                                        })(
                                            <Select disabled = {isSomeDis} placeholder = "请选择费用来源">
                                                <Option value = {1}>药企营销</Option>
                                                <Option value = {2}>线下药交会</Option>
                                            </Select>
                                        )}
                                    </MultiItem>
                                </Row>
                                <Row>
                                    <Col {...containerLayout}>
                                        <Form.Item label = "备注">
                                            {getFieldDecorator("remark", {
                                                initialValue: typeof remark !== "undefined" ? remark.trim() : undefined,
                                                rules: [
                                                    {
                                                        pattern: genNumValidate(200),
                                                        message: "请输入中英文数字且不超过200字符",
                                                    },
                                                    { validator: this.validRemark },
                                                ],
                                            })(
                                                <TextArea
                                                    autoSize = {{
                                                        minRows: 4,
                                                        maxRows: 6,
                                                    }}
                                                    maxLength = {200}
                                                    placeholder = {remarkPlace[feeSource]}
                                                    disabled = {isAllDisabled}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <MultiItem label = "附件">
                                        {getFieldDecorator("annex", {
                                            initialValue: this.getRowData("annex"),
                                            valuePropName: "fileList",
                                            getValueFromEvent: this.normFile,
                                            rules: [{ validator: this.validFile }],
                                        })(
                                            <Upload name = "file" action = "/api/be/upload/file" disabled = {isAllDisabled}>
                                                <Button>
                                                    <Icon type = "upload" /> 点击上传
                                                </Button>
                                            </Upload>
                                        )}
                                    </MultiItem>
                                </Row>
                            </Form>
                        </div>
                        <div className = {btnCon}>
                            <Button type = "primary" onClick = {this.onComClick}>
                                {pageType === "add" ? "提交任务" : "编辑保存"}
                            </Button>
                        </div>
                    </div>
                </Loading>
            </div>
        );
    }
}

export default Form.create({ onValuesChange })(CoopOperation);
