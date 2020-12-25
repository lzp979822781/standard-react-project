import React, { PureComponent } from "react";
import { Button, Form, Col, Row, Radio, Input } from "antd";
import { connect } from "dva";
import FooterToolbar from "@/components/FooterToolbar";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import styles from "./style.less";

@connect(() => ({}))
@Form.create()
class LayoutForm extends PureComponent {
    state = {
        width: "100%",
        layoutCode: 2, // 0是一列 1是二列，2是三列
        formData: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    };

    componentDidMount() {
        window.addEventListener("resize", this.resizeFooterToolbar, {
            passive: true,
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeFooterToolbar);
    }

    resizeFooterToolbar = () => {
        requestAnimationFrame(() => {
            const sider = document.querySelectorAll(".ant-layout-sider")[0];
            if (sider) {
                const width = `calc(100% - ${sider.style.width})`;
                const { width: stateWidth } = this.state;
                if (stateWidth !== width) {
                    this.setState({ width });
                }
            }
        });
    };

    handleCodeChange = e => {
        this.setState({ layoutCode: e.target.value });
    };

    renderLayout = (layoutCode = 2) => {
        const layoutArray = [24, 12, 8];
        const {
            form: { getFieldDecorator },
        } = this.props;
        const { formData } = this.state;
        const colArray = formData.map((item, index) => (
            <Col span = {layoutArray[layoutCode]}>
                <Form.Item label = {`Field ${index}`}>
                    {getFieldDecorator(`field-${index}`, {
                        rules: [
                            {
                                required: true,
                                message: "该项必填!",
                            },
                        ],
                    })(<Input placeholder = "请输入..." />)}
                </Form.Item>
            </Col>
        ));

        return (
            <div>
                <Row gutter = {24}>{colArray}</Row>
            </div>
        );
    };

    validate = () => {
        const {
            form: { validateFieldsAndScroll },
            dispatch,
        } = this.props;
        validateFieldsAndScroll((error, values) => {
            if (!error) {
                // submit the values
                dispatch({
                    type: "form/submitAdvancedForm",
                    payload: values,
                });
            }
        });
    };

    handleReset = () => {
        const { form } = this.props;
        form.resetFields();
    };

    render() {
        const { width, layoutCode } = this.state;

        return (
            <PageHeaderWrapper
                title = "表单布局切换"
                content = "应用于表单的一列二列或三列的切换。"
                wrapperClassName = {styles.advancedForm}
            >
                <Radio.Group value = "default" onChange = {this.handleCodeChange}>
                    <Radio.Button value = {0}>一列</Radio.Button>
                    <Radio.Button value = {1}>二列</Radio.Button>
                    <Radio.Button value = {2}>三列</Radio.Button>
                </Radio.Group>
                <br />
                {this.renderLayout(layoutCode)}
                <FooterToolbar style = {{ width }}>
                    <Button type = "primary" onClick = {this.validate}>
                        提交
                    </Button>
                    <Button
                        style = {{ marginLeft: 8 }}
                        onClick = {this.handleReset}
                    >
                        清除
                    </Button>
                </FooterToolbar>
            </PageHeaderWrapper>
        );
    }
}

export default LayoutForm;
