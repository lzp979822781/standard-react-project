/* eslint-disable import/extensions */
import React, { Component } from "react";
// import { connect } from "dva";
import { Button, DatePicker, Form, Input, Radio, Select, Modal } from "antd";
import moment from "moment";
import { Prompt } from "react-router-dom";
import router from "umi/router";
import request from "@/utils/request";
import { UUID, resCallback, urlPrefix } from "@/utils/utils";
import YaoModel from "../display-create/YaoModel";
import YaoModelTree from "./YaoModelTree";

import { wareParmsColumns, actGroupColumns, formTplData } from "./templateData";
import YaoInputNumber from "../display-create/YaoInputNumber";
import YaoRewardRules from "./YaoRewardRules";
import YaoRebateTable from "./YaoRebateTable";

import UploadClip from "@/components/UploadClip";
import FuzzySearch from "@/components/FuzzySearch";
import YaoTextArea from "@/components/YaoTextArea";
import { isBefore, taskPram, genSearchField } from "../../activity-pull-sales/components/PullSaleCreate/validate";

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

const rebateRow = {
    meet: undefined,
    reward: undefined,
};

// 字段数组,防止后续做更改
const fieldArr = ["meet", "reward"];

class PageForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 0,
            fetching: false,
        };
    }

    formatParam = values => {
        let images = values.images.map((item, index) => {
            if (item.response && index === 0) {
                return {
                    type: 2,
                    imageUrl: item.response.data,
                    sort: index + 1,
                };
            }

            if (item.response && index > 0) {
                return {
                    type: 3,
                    imageUrl: item.response.data,
                    sort: index + 1,
                };
            }

            if (index === 0) {
                return {
                    type: 2,
                    imageUrl: item.url,
                    sort: index + 1,
                };
            }

            return { type: 3, imageUrl: item.url, sort: index + 1 };
        });

        images = images.filter(item => item.imageUrl);
        images = images.map((item, index) => ({
            ...item,
            sort: index + 1,
        }));

        const saleRules = values.saleRules.map((item, index) => ({
            meet: item.meet,
            reward: item.reward,
            sort: index + 1,
            rewardType: values.rewardType,
        }));
        return {
            venderId: values.venderId.venderId, // 药企venderId
            venderName: values.venderId.companyName, // 药企名称
            actTaskId: values.actTaskId.key,
            actTaskName: values.actTaskId.label,
            applyNum: values.applyNum,
            name: values.name,
            applyStartTime: `${moment(values.applytime[0]).format("YYYY-MM-DD")} 00:00:00`,
            applyEndTime: `${moment(values.applytime[1]).format("YYYY-MM-DD")} 23:59:59`,
            actStartTime: `${moment(values.acttime[0]).format("YYYY-MM-DD")} 00:00:00`,
            actEndTime: `${moment(values.acttime[1]).format("YYYY-MM-DD")} 23:59:59`,
            actGroupId: values.actGroup && values.actGroup[0] ? values.actGroup[0].groupId : "", // 活动组id
            actGroupCode: values.actGroup && values.actGroup[0] ? values.actGroup[0].groupCode : "", // 活动组code码
            actGroupName: values.actGroup && values.actGroup[0] ? values.actGroup[0].groupName : "", // 活动组名称
            wareParms: values.wareParms, // 参加活动商品
            stackType: values.stackType, // 商品叠加规则
            rewardCycle: values.reward.rewardCycle, // 奖励规则
            rewardTime: values.reward.rewardTime, // 奖励次数
            saleRules, // 返利规则
            budget: values.budget, // 奖励上限
            saleImages: images, // 活动效果图
            description: values.description, // 活动说明
        };
    };

    // status 1保存草稿，2提交审核
    validate = status => {
        const { location } = this.props;
        const {
            form: { validateFieldsAndScroll },
        } = this.props;
        validateFieldsAndScroll(async (error, values) => {
            if (!error) {
                let params = this.formatParam(values);
                if (location.query.id) {
                    params = {
                        ...params,
                        status,
                        actId: Number(location.query.id),
                    };
                } else {
                    params = { ...params, status };
                }

                this.setState({ status, fetching: true });
                // const asyncFunc = async () => {
                const res = await request("/api/be/activity/sale/save", {
                    method: "POST",
                    data: params,
                });

                resCallback(
                    res,
                    () => {
                        this.isSave = true;
                        router.push("../list");
                    },
                    "提交成功"
                );
                this.setState({ fetching: false });
                // };

                // asyncFunc();
            }
        });
    };

    normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    effectChange = effect => {
        const { form } = this.props;
        if (effect === 1) {
            form.setFieldsValue({
                actTaskId: { key: "", label: "" },
                applytime: undefined,
                acttime: undefined,
                wareParms: undefined,
            });
        } else if (effect === 2) {
            form.setFieldsValue({
                applytime: undefined,
                acttime: undefined,
                wareParms: undefined,
            });
        } else if (effect === 3) {
            form.setFieldsValue({
                acttime: undefined,
                wareParms: undefined,
            });
        } else if (effect === 4) {
            form.setFieldsValue({
                wareParms: undefined,
            });
        }
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
        const { rewardType } = this.getValue();
        let isPass = true;
        if (Array.isArray(val) && val.length > 1) {
            val.forEach((item, index, currentArr) => {
                if (index > 0) {
                    const temp = fieldArr.some(field => {
                        const testField = item[field];
                        const currentField = currentArr[index - 1][field];
                        return testField <= currentField;
                    });
                    if (temp) {
                        callback(`第${index + 1}行的值应该大于${index}行的值`);
                        isPass = false;
                    }
                }
            });

            // 比率必须大于上一条验证
            if (rewardType === 2) {
                val.forEach((item, index, currentArr) => {
                    if (index > 0) {
                        const current = item[fieldArr[1]] / item[fieldArr[0]];
                        const pre = currentArr[index - 1][fieldArr[1]] / currentArr[index - 1][fieldArr[0]];

                        if (current <= pre) {
                            callback(`第${index + 1}行的比率值应该大于${index}行的比率值`);
                            isPass = false;
                        }
                    }
                });
            }
        }
        return isPass;
    };

    timeChange = () => {
        const { form } = this.props;
        form.setFieldsValue({
            wareParms: [],
        });
    };

    handlePrompt = local => {
        const { location } = this.props;

        // 审核状态下显示
        const arr = ["add", "edit"];
        const showPrompt = arr.includes(location.query.pageType);
        if (!this.isSave && showPrompt) {
            this.showConfirm(local);
            return false;
        }
        return true;
    };

    showConfirm = location => {
        Modal.confirm({
            title: "是否保存",
            content: "有未保存的信息，是否停留本页",
            okText: "确定",
            cancelText: "取消",
            onOk: () => {
                // 执行保存
                // this.validate(1);
            },
            onCancel: () => {
                this.isSave = true;
                setTimeout(() => router.push({ pathname: location.pathname }), 0);
            },
        });
    };

    /**
     * 任务校验
     */
    taskValidate = async (rule, value, callback) => {
        // console.log("任务 rule value", rule, value);
        // 判断名称是否唯一
        const { key, endTime } = value || {};
        if (!key) {
            callback("请选择任务");
        } else {
            // setTimeout(() => this.queryBudget(), 0);
            // 当前任务结束时间小于当天
            // eslint-disable-next-line no-lonely-if
            if (isBefore(endTime, moment())) callback("当前任务已结束");
        }

        callback();
    };

    /**
     * 查询预算
     * @param {string} key 已选择的任务key值
     */
    // queryBudget = () => {
    //     const { key } = this.getFromField("actTaskId");
    //     // const {key} = this.getFromField('actTaskId');
    //     const reqParam = {
    //         actTaskId: key,
    //     };
    //     this.callModel(reqParam, data => {
    //         this.setState({
    //             buget: data.data,
    //         });
    //     });
    // };

    getValue = () => {
        const {
            form: { getFieldsValue },
        } = this.props;
        return getFieldsValue();
    };

    // getFromField = field => {
    //     const {
    //         form: { getFieldValue },
    //     } = this.props;
    //     return getFieldValue(field);
    // };

    // callModel = (data, callback) => {
    //     const asyncFunc = async () => {
    //         const res = await request(`/api/be/act/task/getRemainBudget`, {
    //             method: "GET",
    //             params: data,
    //         });
    //         if (res && res.code === 1) {
    //             callback(res);
    //         }
    //     };

    //     asyncFunc();
    // };

    // 任务时间测试数据为 startTime: 1569340800000 endTime: 1569599999000
    disApplyTime = current => {
        const { actTaskId: { startTime, endTime } = {} } = this.getValue();
        const normalRule = current && current < moment().endOf("day");

        if (startTime && endTime) {
            if (isBefore(endTime, moment())) {
                return normalRule;
            }
            return current < moment(startTime).startOf("day") || normalRule || current > moment(endTime).endOf("day");
        }
        return normalRule;
    };

    disActTime = current => {
        const { applytime: [applyStart, applyEnd] = [], actTaskId: { endTime } = {} } = this.getValue();
        const normalRule = current && current < moment().endOf("day");
        if (applyStart && applyEnd) {
            return (current && current <= moment(applyEnd).endOf("day")) || current > moment(endTime).endOf("day");
        }

        return normalRule;
    };

    /**
     * 报名时间验证函数
     */
    applyValidate = (rule, value, callback) => {
        const [applyStart, applyEnd] = value || [];
        // this.setValues(pick(resetObj, [ "wareParms", "actTime"]));
        if (applyStart) {
            // 判断开始和结束时间是否超过30天
            if (applyEnd.diff(applyStart, "days", true) > 30) {
                callback("报名周期不超过30天");
            }
        }
        callback();
    };

    actTimeValidate = (rule, value, callback) => {
        if (value) {
            if (value[1].diff(value[0], "days", true) > 100) callback("活动时间不超过100天");
        }
        callback();
    };

    // changeReward = () => {
    //     const { form } = this.props;
    //     form.setFieldsValue({
    //         saleRules: [
    //             {
    //                 key: UUID(),
    //                 rewardType: undefined,
    //                 meet: undefined,
    //                 reward: undefined,
    //             },
    //         ],
    //     });
    // };

    render() {
        const { status, fetching } = this.state;
        const {
            form: { getFieldDecorator, getFieldValue, setFieldsValue },
            fields,
            hideSubmit,
            location: {
                query: { checkType },
            },
        } = this.props;

        const formItemLayout = {
            labelCol: {
                xs: {
                    span: 24,
                },
                sm: {
                    span: 7,
                },
            },
            wrapperCol: {
                xs: {
                    span: 24,
                },
                sm: {
                    span: 12,
                },
                md: {
                    span: 10,
                },
            },
        };
        const submitFormLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 10,
                    offset: 7,
                },
            },
        };

        // 任务名称字段参数
        const venderId = getFieldValue("venderId") && getFieldValue("venderId").venderId ? getFieldValue("venderId").venderId : "";
        const actTaskIdDisabled = !venderId;

        // 获取返利类型 控制显示文字，元，件
        const rewardType = getFieldValue("rewardType");
        // const reward = getFieldValue("reward");

        // 保证顺序输入 任务，报名起止时间，活动起止时间
        const hasActTaskId = getFieldValue("actTaskId");
        const hasApplytime = getFieldValue("applytime");
        const hasActtime = getFieldValue("acttime");

        // 活动商品筛选
        const startTime = hasApplytime ? moment(getFieldValue("applytime")[0]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const endTime = hasActtime ? moment(getFieldValue("acttime")[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");

        return (
            <Form>
                <Prompt message = {this.handlePrompt} />
                <FormItem {...formItemLayout} label = "药企名称">
                    {getFieldDecorator("venderId", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                        ],
                    })(
                        <FuzzySearch
                            url = {`${urlPrefix}vender/factory/list`}
                            resParam = {{
                                value: "venderId",
                                text: "companyName",
                            }}
                            searchFields = {{
                                searchField: "companyName",
                            }}
                            onChange = {() => {
                                this.effectChange(1);
                            }}
                            disabled = {hideSubmit}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "关联任务">
                    {getFieldDecorator("actTaskId", {
                        initialValue: { key: "", label: "" },
                        rules: [
                            {
                                required: true,
                                message: "请选择任务",
                            },
                            { validator: this.taskValidate },
                        ],
                    })(
                        <FuzzySearch
                            url = {`${urlPrefix}act/task/queryList`}
                            resParam = {taskPram}
                            searchFields = {genSearchField({
                                value: venderId,
                            })}
                            onChange = {() => {
                                this.effectChange(2);
                            }}
                            disabled = {actTaskIdDisabled || hideSubmit}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "活动名称">
                    {getFieldDecorator("name", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                            {
                                message: "长度超出",
                                max: 40,
                            },
                        ],
                    })(<Input disabled = {hideSubmit} placeholder = "请输入" />)}
                </FormItem>
                <FormItem {...formItemLayout} label = "报名起止时间">
                    {getFieldDecorator("applytime", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                            {
                                validator: this.applyValidate,
                            },
                        ],
                    })(
                        <RangePicker
                            onChange = {this.timeChange}
                            disabledDate = {this.disApplyTime}
                            placeholder = {["开始日期", "结束日期"]}
                            disabled = {hideSubmit || !hasActTaskId}
                            // eslint-disable-next-line react/jsx-no-duplicate-props
                            onChange = {() => {
                                this.effectChange(3);
                            }}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "活动起止时间">
                    {getFieldDecorator("acttime", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                            {
                                validator: this.actTimeValidate,
                            },
                        ],
                    })(
                        <RangePicker
                            onChange = {this.timeChange}
                            disabledDate = {this.disActTime}
                            placeholder = {["开始日期", "结束日期"]}
                            disabled = {hideSubmit || !hasApplytime}
                            // eslint-disable-next-line react/jsx-no-duplicate-props
                            onChange = {() => {
                                this.effectChange(4);
                            }}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "活动组设置" extra = "注：未选择时，则默认所有用户可参与">
                    {getFieldDecorator("actGroup", {
                        rules: [
                            {
                                required: false,
                            },
                        ],
                    })(
                        <YaoModel
                            title = "活动组设置"
                            type = "radio"
                            columns = {actGroupColumns}
                            rowKey = "groupId"
                            url = {`${urlPrefix}act/group/queryList`}
                            disabled = {hideSubmit}
                            onChange = {() => {
                                this.effectChange(4);
                            }}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "活动商品设置">
                    {getFieldDecorator("wareParms", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                        ],
                    })(
                        <YaoModelTree
                            title = "活动商品设置"
                            columns = {wareParmsColumns}
                            url = {`${urlPrefix}activity/sale/getSaleWare`}
                            searchForm = {formTplData}
                            param = {{
                                startTime,
                                endTime,
                                type: 1,
                                venderId,
                                actTaskId: fields.actTaskId && fields.actTaskId.value ? fields.actTaskId.value.id : "",
                                actGroupCode: fields.actGroup && fields.actGroup.value && fields.actGroup.value[0] ? fields.actGroup.value[0].code : "",
                            }}
                            disabled = {hideSubmit}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "商品叠加规则">
                    {getFieldDecorator("stackType", {
                        initialValue: "1",
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                        ],
                    })(
                        <Radio.Group disabled = {hideSubmit}>
                            <Radio value = "1">单商品满足</Radio>
                            <Radio value = "2">全部商品叠加</Radio>
                        </Radio.Group>
                    )}
                </FormItem>
                {checkType === "gy" ? null : (
                    <FormItem {...formItemLayout} label = "奖励规则">
                        {getFieldDecorator("reward", {
                            initialValue: {
                                rewardCycle: 1,
                                rewardTime: 1,
                            },
                            rules: [
                                {
                                    required: true,
                                    message: "不能为空",
                                },
                            ],
                        })(<YaoRewardRules disabled = {hideSubmit} />)}
                    </FormItem>
                )}

                {checkType === "gy" ? null : (
                    <FormItem {...formItemLayout} label = "返利类型">
                        {getFieldDecorator("rewardType", {
                            initialValue: 1,
                            rules: [
                                {
                                    required: true,
                                },
                            ],
                        })(
                            <Select
                                style = {{ width: 120 }}
                                disabled = {hideSubmit}
                                onChange = {() => {
                                    setFieldsValue({
                                        saleRules: [
                                            {
                                                key: UUID(),
                                                rewardType: undefined,
                                                meet: undefined,
                                                reward: undefined,
                                            },
                                        ],
                                    });
                                }}
                            >
                                <Option value = {1}>采购数量</Option>
                                <Option value = {2}>订单金额</Option>
                            </Select>
                        )}
                    </FormItem>
                )}
                {checkType === "gy" ? null : (
                    <FormItem {...formItemLayout} label = "返利规则">
                        {getFieldDecorator("saleRules", {
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
                        })(<YaoRebateTable emptyRow = {rebateRow} limit = {3} rewardType = {rewardType} disabled = {hideSubmit} />)}
                    </FormItem>
                )}
                {checkType === "gy" ? null : (
                    <FormItem {...formItemLayout} label = "奖励上限">
                        {getFieldDecorator("budget", {
                            rules: [
                                {
                                    required: true,
                                    message: "不能为空",
                                },
                            ],
                        })(<YaoInputNumber min = {0} precision = {2} addonAfter = "元" disabled = {hideSubmit} />)}
                    </FormItem>
                )}
                <FormItem {...formItemLayout} label = "报名上限">
                    {getFieldDecorator("applyNum", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                        ],
                    })(<YaoInputNumber min = {1} precision = {0} disabled = {hideSubmit} />)}
                </FormItem>
                <FormItem {...formItemLayout} label = "活动效果图" extra = "注：第一张为主图，仅支持jpg,png和gif, 图片大小应为 690*392">
                    {getFieldDecorator("images", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                        ],
                    })(
                        <UploadClip
                            url = "/api/be/upload/img"
                            name = "imgFile"
                            data = {{ imageEnum: "BANNER" }}
                            multiple
                            limitSize = {5} // 单位为M
                            limitNum = {6}
                            showRemoveIcon
                            showPreviewIcon
                            disabled = {hideSubmit}
                            limitPixel = {{ width: 690, height: 392 }}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "活动说明" extra = "注：限定长度两千字符">
                    {getFieldDecorator("description", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                            {
                                max: 2000,
                                message: "长度超出",
                            },
                        ],
                    })(<YaoTextArea showCount maxLength = {2000} placeholder = "" autoSize = {{ minRows: 3, maxRows: 5 }} disabled = {hideSubmit} />)}
                </FormItem>
                {hideSubmit ? null : (
                    <FormItem
                        {...submitFormLayout}
                        style = {{
                            marginTop: 32,
                        }}
                    >
                        <Button
                            loading = {status === 1 && fetching}
                            disabled = {fetching}
                            onClick = {() => {
                                this.validate(1);
                            }}
                        >
                            保存草稿
                        </Button>
                        <Button
                            type = "primary"
                            loading = {status === 2 && fetching}
                            disabled = {fetching}
                            style = {{
                                marginLeft: 8,
                            }}
                            onClick = {() => {
                                this.validate(2);
                            }}
                        >
                            创建完成提交审核
                        </Button>
                    </FormItem>
                )}
            </Form>
        );
    }
}

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
})(PageForm);
