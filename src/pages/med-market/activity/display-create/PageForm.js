import React, { Component } from "react";
// import { connect } from "dva";
import router from "umi/router";
import { Prompt } from "react-router-dom";
import { Button, DatePicker, Form, Input, Radio, Select, Icon, Upload, Modal } from "antd";
import moment from "moment";
import request from "@/utils/request";
import YaoModel from "./YaoModel";
import YaoUploadRules from "./YaoUploadRules";
import YaoReward from "./YaoReward";
import YaoInputNumber from "./YaoInputNumber";
import YaoTextArea from "@/components/YaoTextArea";

// import YaoSelect from "./YaoSelect";
// import YaoUploadImage from "./YaoUploadImage";
import UploadClip from "@/components/UploadClip";

import { wareParmsColumns, actGroupColumns, formTplData } from "./templateData";
import FuzzySearch from "@/components/FuzzySearch";
import { primeFactors, resCallback, urlPrefix, calc } from "@/utils/utils";
import { isBefore, taskPram, genSearchField } from "../../activity-pull-sales/components/PullSaleCreate/validate";

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

class PageForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 0,
            fetching: false,
        };
    }

    formatParam = values => {
        let images = [];
        if (values.images && values.images.length > 0) {
            images = values.images.map(item => {
                if (item.response) {
                    return item.response.data;
                }
                return item.url;
            });
        }

        let file;
        let fileName;
        if (values.file && values.file.length > 0 && values.file[0].response) {
            file = values.file[0].response.data;
            fileName = values.file[0].name;
        } else if (values.file && values.file.length > 0 && values.file[0].url) {
            file = values.file[0].url;
            fileName = values.file[0].name || values.file[0].url;
        }

        images = images.filter(item => item);

        return {
            venderId: Number(values.venderId.venderId),
            name: values.name,
            applyStartTime: `${moment(values.applytime[0]).format("YYYY-MM-DD")} 00:00:00`,
            applyEndTime: `${moment(values.applytime[1]).format("YYYY-MM-DD")} 23:59:59`,
            actStartTime: `${moment(values.acttime[0]).format("YYYY-MM-DD")} 00:00:00`,
            actEndTime: `${moment(values.acttime[1]).format("YYYY-MM-DD")} 23:59:59`,
            verifyCycle: values.verifyCycle,
            applyNum: values.applyNum,
            logoUrl: values.logo[0].response ? values.logo[0].response.data : values.logo[0].url,
            description: values.description,
            images,
            file,
            fileName,
            uploadDays: values.uploadRules.uploadDays,
            uploadTimes: values.uploadRules.uploadTimes,
            uploadNum: values.uploadRules.uploadNum,
            actTaskId: values.actTaskId.key,
            actGroupId: values.actGroup && values.actGroup[0] ? Number(values.actGroup[0].groupId) : "",
            actGroupCode: values.actGroup && values.actGroup[0] ? values.actGroup[0].groupCode : "",
            actShowType: Number(values.actShowType),
            clerkReward: values.reward.clerkReward,
            storeReward: values.reward.storeReward,
            headquartersReward: values.reward.headquartersReward,
            participantReward: values.reward.participantReward,
            uploadInterval: Number(values.uploadInterval),
            wareParms: values.wareParms,
            maxReward: values.maxReward,
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
                    params = { ...params, status, actId: location.query.id };
                } else {
                    params = { ...params, status };
                }
                this.setState({ status, fetching: true });

                // const asyncFunc = async () => {
                const res = await request("/api/be/activity/show/save", {
                    method: "POST",
                    data: params, // dataCreate
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

    getValue = () => {
        const {
            form: { getFieldsValue },
        } = this.props;
        return getFieldsValue();
    };

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

    joinActId = () => {
        const { location } = this.props;
        if (location.query.id) {
            return {
                actId: location.query.id,
            };
        }
        return {};
    };

    render() {
        const { status, fetching } = this.state;

        const {
            form: { getFieldDecorator, getFieldValue },
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

        // 附件
        const file = getFieldValue("file");
        const hasfile = getFieldValue("file") && getFieldValue("file")[0];

        // 保证顺序输入 任务，报名起止时间，活动起止时间
        const hasActTaskId = getFieldValue("actTaskId");
        const hasApplytime = getFieldValue("applytime");
        const hasActtime = getFieldValue("acttime");

        const startTime = hasActtime ? moment(getFieldValue("acttime")[0]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        const endTime = hasActtime ? moment(getFieldValue("acttime")[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");

        // 生成活动起止时间因子数组
        const acttime = hasActtime || [];
        const calcDays = primeFactors(acttime);

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
                    })(<Input placeholder = "请输入" disabled = {hideSubmit} />)}
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
                            disabledDate = {this.disApplyTime}
                            placeholder = {["开始日期", "结束日期"]}
                            disabled = {hideSubmit || !hasActTaskId}
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
                            disabledDate = {this.disActTime}
                            placeholder = {["开始日期", "结束日期"]}
                            disabled = {hideSubmit || !hasApplytime}
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
                        <YaoModel
                            title = "活动商品设置"
                            columns = {wareParmsColumns}
                            url = {`${urlPrefix}activity/sku/getWare`}
                            searchForm = {formTplData}
                            param = {{
                                ...this.joinActId(),
                                actStartTime: startTime,
                                actEndTime: endTime,
                                type: 1,
                                venderId,
                                actTaskId: fields.actTaskId && fields.actTaskId.value ? fields.actTaskId.value.id : "",
                                actGroupCode: fields.actGroup && fields.actGroup.value && fields.actGroup.value[0] ? fields.actGroup.value[0].code : "",
                            }}
                            disabled = {hideSubmit}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "活动类型">
                    {getFieldDecorator("actShowType", {
                        initialValue: "1",
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                        ],
                    })(
                        <Radio.Group disabled = {hideSubmit}>
                            <Radio value = "1">堆头</Radio>
                            <Radio value = "2">商品陈列</Radio>
                            <Radio value = "3">橱窗广告</Radio>
                        </Radio.Group>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "考核周期天数">
                    {getFieldDecorator("verifyCycle", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                        ],
                    })(
                        <Select placeholder = "请选择" disabled = {hideSubmit}>
                            {calcDays.map(item => (
                                <Option key = {item} value = {item}>
                                    {`${item}天`}
                                </Option>
                            ))}
                        </Select>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "上传规则">
                    {getFieldDecorator("uploadRules", {
                        initialValue: {},
                        rules: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (!value.uploadDays || !value.uploadTimes || !value.uploadNum) {
                                        callback("不能为空");
                                    }
                                    callback();
                                },
                            },
                        ],
                    })(<YaoUploadRules calcDays = {calcDays} maxDays = {getFieldValue("verifyCycle") || 1} disabled = {hideSubmit} />)}
                </FormItem>
                <FormItem {...formItemLayout} label = "每次上传间隔" extra = "注：大于等于1的数值，且0.5的倍数">
                    {getFieldDecorator("uploadInterval", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                            {
                                validator: (rule, value, callback) => {
                                    const uploadRules = getFieldValue("uploadRules");
                                    if (value * uploadRules.uploadTimes > uploadRules.uploadDays * 24) {
                                        callback("超出上传规则天数范围,请重新输入");
                                    }
                                    callback();
                                },
                            },
                        ],
                    })(<YaoInputNumber precision = {1} min = {1} addonAfter = "小时" step = {0.5} disabled = {hideSubmit} />)}
                </FormItem>
                {checkType === "gy" ? null : (
                    <FormItem {...formItemLayout} label = "周期奖励">
                        {getFieldDecorator("reward", {
                            initialValue: {},
                            rules: [
                                {
                                    required: true,
                                    validator: (rule, value, callback) => {
                                        if (!value.participantReward) {
                                            callback("参与者奖励必填");
                                        }
                                        // const bool = !(value.participantReward || value.clerkReward || value.storeReward || value.headquartersReward);
                                        // if (bool) {
                                        //     callback("最少填一个");
                                        // }
                                        callback();
                                    },
                                },
                            ],
                        })(<YaoReward disabled = {hideSubmit} />)}
                    </FormItem>
                )}
                {checkType === "gy" ? null : (
                    <FormItem {...formItemLayout} label = "奖励上限">
                        {getFieldDecorator("maxReward", {
                            rules: [
                                {
                                    required: true,
                                    validator: (rule, value, callback) => {
                                        const uploadRules = getFieldValue("reward");
                                        const participantReward = uploadRules.participantReward || 0;
                                        const clerkReward = uploadRules.clerkReward || 0;
                                        const storeReward = uploadRules.storeReward || 0;
                                        const headquartersReward = uploadRules.headquartersReward || 0;
                                        let total = calc.Add(participantReward, clerkReward);
                                        total = calc.Add(total, storeReward);
                                        total = calc.Add(total, headquartersReward);
                                        if (value === "") {
                                            callback("不能为空");
                                        }
                                        if (total > value) {
                                            callback(`应大于周期奖励总和：${total}`);
                                        }
                                        callback();
                                    },
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
                <FormItem {...formItemLayout} label = "logo图" extra = "注：仅支持jpg,png和gif, 图片大小应为 690*392">
                    {getFieldDecorator("logo", {
                        rules: [
                            {
                                required: true,
                                message: "不能为空",
                            },
                        ],
                    })(
                        // <YaoUploadImage
                        //     imagesLenght = {1}
                        //     name = "imgFile"
                        //     data = {{
                        //         imageEnum: "LOGO",
                        //     }}
                        //     disabled = {hideSubmit}
                        // />
                        <UploadClip
                            url = "/api/be/upload/img"
                            name = "imgFile"
                            data = {{ imageEnum: "LOGO" }}
                            multiple
                            limitSize = {5} // 单位为M
                            limitNum = {1}
                            showRemoveIcon
                            showPreviewIcon
                            disabled = {hideSubmit}
                            limitPixel = {{ width: 690, height: 392 }}
                            // limitPixel = {{ width: 345, height: 196 }}
                            // ratio = {2}
                        />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label = "活动效果图" extra = "注：仅支持jpg,png和gif, 图片大小应为 690*392">
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
                            limitNum = {5}
                            showRemoveIcon
                            showPreviewIcon
                            disabled = {hideSubmit}
                            limitPixel = {{ width: 690, height: 392 }}
                            // limitPixel = {{ width: 345, height: 196 }}
                            // ratio = {2}
                        />
                    )}
                </FormItem>
                {hideSubmit ? (
                    <FormItem {...formItemLayout} label = "附件">
                        <a href = {file && file[0] ? file[0].url : "./"} target = "_blank" rel = "noopener noreferrer">
                            {file && file[0] ? file[0].name : "附件"}
                        </a>
                    </FormItem>
                ) : (
                    <FormItem {...formItemLayout} label = "附件" extra = "注：仅支持10M以内的rar, zip格式文件">
                        {getFieldDecorator("file", {
                            valuePropName: "fileList",
                            getValueFromEvent: this.normFile,
                        })(
                            <Upload
                                name = "file"
                                accept = ".zip,.rar"
                                data = {{
                                    fileEnum: "SHOW_ATTACH",
                                }}
                                action = "/api/be/upload/file"
                            >
                                <Button disabled = {hasfile}>
                                    <Icon type = "upload" /> 上传
                                </Button>
                            </Upload>
                        )}
                    </FormItem>
                )}
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
