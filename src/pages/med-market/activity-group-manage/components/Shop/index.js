import React, { Component } from "react";
import { Form, Row, Input, Col } from "antd";

import SearchArea from "@/components/SearchArea";
import { City } from "@/components/complex-form";

import styles from "./index.less";

const modalColRow = {
    labelCol: {
        xs: { span: 8 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
    },
};

const labelCol = {
    xs: { span: 24 },
    sm: { span: 12 },
};

class Shop extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {}

    onSearch = () => {
        const {
            form: { validateFields },
            onSearch,
        } = this.props;
        validateFields((err, values) => {
            const {
                city: [provinceId, cityId, countyId] = [],
                ...otherValue
            } = values;
            const queryVal = Object.assign({}, otherValue, {
                provinceId,
                cityId,
                countyId,
            });
            if (onSearch) onSearch(queryVal);
        });
    };

    onReset = () => {
        // eslint-disable-next-line react/destructuring-assignment
        this.props.form.resetFields();
    };

    render() {
        const that = this;
        const {
            form: { getFieldDecorator },
        } = that.props;

        return (
            <div className = {styles.shop}>
                <SearchArea
                    onSearch = {that.onSearch}
                    onReset = {that.onReset}
                    formLayout = {modalColRow}
                >
                    <Row>
                        <Col {...labelCol}>
                            <Form.Item label = "区域">
                                {getFieldDecorator("city")(
                                    <City url = "/area/loadArea" />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...labelCol}>
                            <Form.Item label = "门店">
                                {getFieldDecorator("shopyName")(
                                    <Input placeholder = "请输入门店" />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </SearchArea>
            </div>
        );
    }
}

export default Form.create()(Shop);
