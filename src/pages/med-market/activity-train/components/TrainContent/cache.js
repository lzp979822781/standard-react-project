import React, { Component } from "react";

import { Form } from "antd";
import { CardTable } from "@/components/complex-table";

import { UUID } from "@/utils/utils";
import { trainCol, trainEmptyRow, goodsList } from "../TrainCreate/validate";

import styles from "./index.less";

const defaultProps = {
    data: goodsList || [],
    contentId: "id",
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

    filterData = values => {
        const { data } = this.state;
        const { contentId: tempId } = this.props;
        return data.map(item => {
            const { [tempId]: rowId } = item;
            const fileItem = { contentList: values[rowId] };
            return Object.assign({}, item, fileItem);
        });
    };

    onParChange = (...otherParam) => {
        console.log("onParChange", otherParam);
        const {
            form: { validateFields },
        } = this.props;
        validateFields((err, values) => {
            const filterArr = this.filterData(values);
            this.setVal(filterArr);
        });
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    };

    renderList = () => {
        const { data } = this.state;
        const {
            form: { getFieldDecorator },
            renderChild,
            disabled,
        } = this.props;
        if (Array.isArray(data)) {
            const newData = data.map(item => ({ ...item, ...{ key: UUID() } }));
            return newData.map(item => {
                const { id, medicinesName, contentList } = item;
                const child = (renderChild && renderChild({ onParChange: this.onParChange })) || (
                    <CardTable columns = {trainCol} emptyRow = {trainEmptyRow} onParChange = {this.onParChange} limit = {10} disabled = {disabled} />
                );
                return (
                    <div key = {id} className = {styles.content}>
                        <div className = {styles.header}>{medicinesName}</div>
                        <Form.Item>
                            {getFieldDecorator(`${id}`, {
                                initialValue: contentList,
                                rules: [{ required: true, message: "培训内容是必输内容" }],
                            })(child)}
                        </Form.Item>
                    </div>
                );
            });
        }

        return "";
    };

    render() {
        return <div className = {styles["train-content"]}>{this.renderList()}</div>;
    }
}

TrainContent.defaultProps = defaultProps;

export default Form.create()(TrainContent);
