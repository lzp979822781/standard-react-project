import React, { Component } from "react";

import { Form } from "antd";
import { CardTable } from "@/components/complex-table";

import { UUID } from "@/utils/utils";
import { trainCol, trainEmptyRow, goodsList } from "../TrainCreate/validate";

import styles from "./index.less";

const defaultProps = {
    data: goodsList || [],
};

class TrainContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.value || [],
        };
    }

    static getDerivedStateFromProps(props) {
        if ("value" in props) {
            return {
                data: props.value || [],
            };
        }
        return null;
    }

    onParChange = (...otherParam) => {
        console.log("onParChange", otherParam);
        const {
            form: { validateFields },
        } = this.props;
        validateFields((err, values) => {
            console.log("content", values);
            this.setVal(values);
        });
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    };

    /* renderList = () => {
        const { data } = this.state;
        const { form: { getFieldDecorator }, renderChild, value } = this.props;
        if(Array.isArray(data)) {
            const newData = data.map( item => ({ ...item, ...{ key: UUID() } }));
            return newData.map(item => {
                const { id, medicinesName } = item;
                const child = renderChild && renderChild({ onParChange: this.onParChange }) || (<CardTable
                    columns = {trainCol}
                    emptyRow = {trainEmptyRow}
                    onParChange = {this.onParChange}
                />)
                return (
                    <div key = {UUID()} className = {styles.content}>
                        <div className = {styles.header}>{medicinesName}</div>
                        {
                            <Form.Item>
                                {
                                    getFieldDecorator(`${id}`, {
                                        initialValue: value[id] || [
                                            {
                                                key: UUID(),
                                                train: undefined,
                                            },
                                        ],
                                        rules: [
                                            {
                                                required: true,
                                            },
                                        ],
                                    })(child)
                                }
                            </Form.Item>
                        }
                    </div>
                )
            })
        }

        return "";
    } */

    renderList = () => {
        const { data } = this.state;
        const {
            form: { getFieldDecorator },
            renderChild,
            data: propData,
            limit,
        } = this.props;
        const keys = Object.keys(data);
        if (Array.isArray(keys)) {
            return keys.map(item => {
                // eslint-disable-next-line eqeqeq
                const goodsItem = propData.filter(
                    // eslint-disable-next-line eqeqeq
                    childItem => childItem.id == item
                )[0];
                const { medicinesName } = goodsItem;
                const child = (renderChild &&
                    renderChild({ onParChange: this.onParChange })) || (
                    <CardTable
                        columns = {trainCol}
                        emptyRow = {trainEmptyRow}
                        onParChange = {this.onParChange}
                        limit = {limit}
                    />
                );
                return (
                    <div key = {UUID()} className = {styles.content}>
                        <div className = {styles.header}>{medicinesName}</div>
                        {
                            <Form.Item>
                                {getFieldDecorator(`${item}`, {
                                    initialValue: data[item] || [
                                        {
                                            key: UUID(),
                                            train: undefined,
                                        },
                                    ],
                                    rules: [
                                        {
                                            required: true,
                                        },
                                    ],
                                })(child)}
                            </Form.Item>
                        }
                    </div>
                );
            });
        }

        return "";
    };

    render() {
        return (
            <div className = {styles["train-content"]}>{this.renderList()}</div>
        );
    }
}

TrainContent.defaultProps = defaultProps;

export default Form.create()(TrainContent);
