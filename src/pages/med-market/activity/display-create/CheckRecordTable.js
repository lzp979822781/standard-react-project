import React, { Component } from "react";
import { Descriptions, Row, Col, Spin } from "antd";
import moment from "moment";
import { urlPrefix } from "@/utils/utils";
// import PropTypes from "prop-types";
import request from "@/utils/request";

class CheckRecordTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: false,
            data: [],
        };
    }

    componentDidMount() {
        this.getVerifyInfo();
    }

    getVerifyInfo = () => {
        const { actId } = this.props;
        const asyncFunc = async () => {
            const res = await request(`${urlPrefix}activity/verifyInfo/${actId}`, {
                method: "GET",
            });

            if (res && res.code === 1) {
                this.setState({ data: res.data, fetching: false });
            }
            this.setState({ fetching: false });
        };

        asyncFunc();
    };

    render() {
        const { data, fetching } = this.state;
        let list1 = data.filter(item => item.auditTerminal === 1);
        let list2 = data.filter(item => item.auditTerminal === 2);

        list1 = list1[0] || {};
        list2 = list2[0] || {};
        return (
            <Spin spinning = {fetching} tip = "加载中...">
                <div style = {{ padding: 24 }}>
                    <Row gutter = {16}>
                        <Col span = {12}>
                            <Descriptions title = "运营审核信息" column = {1}>
                                <Descriptions.Item label = "提交人">{`${list1.actCreator || "--"} ${list1.actCreated ? moment(list1.actCreated).format("YYYY-MM-DD HH:mm") : ""}`}</Descriptions.Item>
                                <Descriptions.Item label = "审核人">{`${list1.creator || "--"} ${list1.created ? moment(list1.created).format("YYYY-MM-DD HH:mm") : ""}`}</Descriptions.Item>
                                <Descriptions.Item label = "审核状态">{list1.statusText || "--"}</Descriptions.Item>
                                <Descriptions.Item label = "审核意见">{list1.opinion || "--"}</Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span = {12}>
                            <Descriptions title = "药企审核信息" column = {1}>
                                <Descriptions.Item label = "审核人">{`${list2.creator || "--"} ${list2.created ? moment(list2.created).format("YYYY-MM-DD HH:mm") : ""}`}</Descriptions.Item>
                                <Descriptions.Item label = "审核状态">{list2.statusText || "--"}</Descriptions.Item>
                                <Descriptions.Item label = "审核意见">{list2.opinion || "--"}</Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </div>
            </Spin>
        );
    }
}

export default CheckRecordTable;

CheckRecordTable.propTypes = {};

CheckRecordTable.defaultProps = {};
