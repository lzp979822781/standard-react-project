import React, { Component } from "react";
import { Form } from "antd";
import UploadClip from "@/components/UploadClip";

import styles from "./index.less";

const defaultProps = {
    url: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    fileId: "id",
};

class PictureList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: props.value || [],
        };
    }

    static getDerivedStateFromProps(props) {
        if ("value" in props) {
            return {
                fileList: props.value || [],
            };
        }
        return null;
    }

    onParChange = () => {
        const {
            form: { validateFields },
        } = this.props;
        validateFields((err, values) => {
            const filterArr = this.filterData(values);
            this.setVal(filterArr);
        });
    };

    filterData = data => {
        const { fileList } = this.state;
        const { fileId: tempId } = this.props;
        return fileList.map(item => {
            const { [tempId]: rowId } = item;
            const fileItem = { trainingFileList: data[rowId] };
            return Object.assign({}, item, fileItem);
        });
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        } else {
            this.setState({ fileList: value });
        }
    };

    renderList = () => {
        const {
            form: { getFieldDecorator },
            renderChild,
            url,
        } = this.props;
        const { fileList } = this.state;
        const child = (renderChild && renderChild()) || (
            <UploadClip
                url = {url}
                multiple
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
                onParChange = {this.onParChange}
            />
        );
        return fileList.map(item => {
            const { id, medicinesName, trainingFileList } = item;
            return (
                // key不能使用UUID生成,否则会擦除上传状态
                <Form.Item key = {id}>
                    <div className = {styles.header}>{medicinesName}</div>
                    {getFieldDecorator(`${id}`, {
                        initialValue: trainingFileList,
                        rules: [{ required: true }],
                    })(child)}
                </Form.Item>
            );
        });
    };

    render() {
        // const { form: { getFieldDecorator } } = this.props;
        return <div className = {styles["file-list"]}>{this.renderList()}</div>;
    }
}

PictureList.defaultProps = defaultProps;
export default Form.create()(PictureList);
