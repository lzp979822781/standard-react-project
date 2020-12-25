import React, { Component } from "react";
import { Spin, Form } from "antd";
import moment from "moment";
import request from "@/utils/request";
import { UUID, urlPrefix, renderAlert } from "@/utils/utils";
import PageForm from "./PageForm";
import CheckRecordTable from "../display-create/CheckRecordTable";
import ActivityCheck from "../activity-check";
import Header from "@/components/Header";
import styles from "./index.less";

class CollectActivityCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: false,
            fields: {},
        };
    }

    componentDidMount() {
        const { location } = this.props;
        if (["edit", "view", "check"].includes(location.query.pageType)) {
            this.loadData(location.query.id);
            this.getWareParms(location.query.id);
        }
    }

    /**
     * 获取任务回显值全量数据
     */
    getTask = actTaskId => {
        const asyncFunc = async () => {
            const res = await request(`${urlPrefix}act/task/get`, {
                method: "GET",
                params: { id: actTaskId },
            });
            if (res && res.code === 1) {
                const fields = this.formatResTast(res.data);
                this.setState({ fields, fetching: false });
            }
        };

        asyncFunc();
    };

    formatResTast = res => {
        const { fields } = this.state;
        const fieldsObj = {};
        const newFields = {
            actTaskId: { ...res, key: res.id, label: res.taskName },
        };
        Object.keys(newFields).forEach(item => {
            fieldsObj[item] = Form.createFormField({
                value: newFields[item],
            });
        });

        return { ...fields, ...fieldsObj };
    };

    // 获取关联商品
    getWareParms = id => {
        const asyncFunc = async () => {
            const res = await request(`${urlPrefix}activity/sale/ware/${id}`, {
                method: "GET",
            });
            if (res && res.code === 1) {
                const fields = this.formatResWareParms(res.data);
                this.setState({ fields, fetching: false });
            }
        };

        asyncFunc();
    };

    formatResWareParms = res => {
        const { fields } = this.state;
        const fieldsObj = {};
        const newFields = {
            wareParms: res,
        };
        Object.keys(newFields).forEach(item => {
            fieldsObj[item] = Form.createFormField({
                value: newFields[item],
            });
        });

        return { ...fields, ...fieldsObj };
    };

    // 获取编辑数据
    loadData = id => {
        const { location } = this.props;
        this.setState({ fetching: true });
        const asyncFunc = async () => {
            const res = await request(`${urlPrefix}activity/sale/detail/${id}`, {
                method: "GET",
            });

            if (res && res.code === 1) {
                if (location.query.pageType === "edit") {
                    this.getTask(res.data.actTaskId);
                }
                const fields = this.formatRes(res.data);
                this.setState({ fields, fetching: false });
            }
        };

        asyncFunc();
    };

    formatRes = res => {
        const saleRules = res.saleRules.map(item => ({
            ...item,
            key: UUID(),
        }));

        const images = res.saleImages.map((item, index) => ({
            name: item.imageUrl || item.path,
            uid: `${-(index + 1)}`,
            status: "done",
            url: item.imageUrl,
        }));

        const { fields } = this.state;
        const fieldsObj = {};
        const newFields = {
            venderId: {
                key: `${res.venderId}`,
                venderId: res.venderId,
                label: res.factoryName,
            },
            actTaskId: {
                key: `${res.actTaskId}`,
                label: res.actTaskName,
            },
            name: res.name,
            applytime: [moment(res.applyStartTime), moment(res.applyEndTime)],
            acttime: [moment(res.actStartTime), moment(res.actEndTime)],
            actGroup: [
                {
                    groupId: res.actGroupId,
                    groupCode: res.actGroupCode,
                    groupName: res.actGroupName,
                },
            ],
            stackType: `${res.stackType}`,
            reward: {
                rewardCycle: res.rewardCycle,
                rewardTime: res.rewardTime,
            },
            rewardType: saleRules[0].rewardType,
            maxReward: res.maxReward,
            saleRules,
            budget: res.budget,
            applyNum: res.applyNum,
            description: res.description,
            images,
        };

        Object.keys(newFields).forEach(item => {
            fieldsObj[item] = Form.createFormField({
                value: newFields[item],
            });
        });

        return { ...fieldsObj, ...fields };
    };

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
            fields: { ...fields, ...changedFields },
        }));
    };

    genAlert = () => {
        const { location } = this.props;
        const pageTypes = ["add", "edit"];
        const msg = "药企、任务、时间、商品有关联关系,任意的重选会导致相关商品清空，请谨慎选择";
        return pageTypes.includes(location.query.pageType) ? renderAlert(msg) : null;
    };

    render() {
        const { fields, fetching } = this.state;
        const { location } = this.props;

        // 审核状态下显示
        const showCheck = ["check"].includes(location.query.pageType);

        // 审核查看状态下显示审核信息
        const showCheckList = ["view", "check"].includes(location.query.pageType);

        // 新增编辑提交按钮，查看和审核的时候不可用，也不可编辑
        const hideSubmit = showCheckList;

        return (
            <div>
                <Header title = "采购活动" back = {false} />
                <div style = {{ height: 56 }} />
                <div className = {styles.prompt}>{this.genAlert()}</div>
                <Spin spinning = {fetching} tip = "加载中...">
                    <PageForm fields = {{ ...fields }} onChange = {this.handleFormChange} location = {location} hideSubmit = {hideSubmit} />
                </Spin>
                {/* <pre className = "language-bash">{JSON.stringify(fields, null, 2)}</pre> */}
                {showCheck ? <ActivityCheck location = {location} /> : null}
                {showCheckList ? <CheckRecordTable actId = {location.query.id} /> : null}
            </div>
        );
    }
}

export default CollectActivityCreate;
