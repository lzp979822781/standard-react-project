// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Upload, Icon, Modal, message } from "antd";

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

class JDUploadImage extends PureComponent {
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {
                defaultFileList: nextProps.value || [],
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        const value = props.value || [];
        this.state = {
            previewVisible: false,
            previewImage: "",
            fileList: [],
            defaultFileList: value,
        };
    }

    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        let preview;
        if (!file.url && !file.preview) {
            preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || preview,
            previewVisible: true,
        });
    };

    beforeUpload = file => {
        const { format, size } = this.props;
        if (!format) {
            return true;
        }
        const isPNG = file.type === "image/png";
        const isJPG = file.type === "image/jpeg";
        const isJPEG = file.type === "image/jpeg";
        const isGIF = file.type === "image/gif";
        if (!(isJPG || isJPEG || isGIF || isPNG)) {
            message.error("图片格式不正确，请修改后重新上传！", 0.8);
            return isPNG;
        }
        const isLt2M = file.size / 1024 / 1024 < size;
        if (!isLt2M) {
            message.error(`${file.name}图片大小超出限制，请修改后重新上传`, 0.8);
            return isLt2M;
        }
        const isSize = this.isSize(file);
        return isPNG && isLt2M && isSize;
    };

    // 检测尺寸
    isSize = file => {
        const { width, height } = this.props;
        return new Promise((resolve, reject) => {
            const sizeURL = window.URL || window.webkitURL;
            const img = new Image();
            img.onload = function() {
                const valid = img.width === width && img.height === height;
                if (valid) {
                    resolve();
                } else {
                    reject();
                }
            };
            img.src = sizeURL.createObjectURL(file);
        }).then(
            () => file,
            () => {
                message.error(`${file.name}图片尺寸不符合要求，请修改后重新上传！`);
                return Promise.reject();
            }
        );
    };

    handleChange = ({ fileList }) => {
        // const newFileList = fileList.filter((item) => {
        //     return item.response
        // });
        this.setState({ fileList }, () => {
            this.triggerChange();
        });
    };

    triggerChange = () => {
        const { onChange } = this.props;
        const { fileList } = this.state;
        if (onChange) {
            onChange(fileList);
        }
    };

    render() {
        const { previewVisible, previewImage, defaultFileList } = this.state;
        const { name, data, imagesLenght, disabled } = this.props;
        const uploadButton = (
            <div>
                <Icon type = "plus" />
                <div className = "ant-upload-text">上传</div>
            </div>
        );
        return (
            <div className = "clearfix">
                <Upload
                    action = "/api/be/upload/img"
                    listType = "picture-card"
                    name = {name || "file"}
                    data = {data || {}}
                    // defaultFileList={mockList}
                    fileList = {defaultFileList}
                    onPreview = {this.handlePreview}
                    beforeUpload = {this.beforeUpload}
                    onChange = {this.handleChange}
                    disabled = {disabled}
                    accept = ".jpg,.png,.gif"
                    showUploadList = {{
                        showDownloadIcon: false,
                    }}
                >
                    {defaultFileList.length >= imagesLenght ? null : uploadButton}
                </Upload>
                <Modal visible = {previewVisible} footer = {null} onCancel = {this.handleCancel}>
                    <img alt = "example" style = {{ width: "100%" }} src = {previewImage} />
                </Modal>
            </div>
        );
    }
}

export default JDUploadImage;

JDUploadImage.propTypes = {
    imagesLenght: PropTypes.number,
    format: PropTypes.bool,
};

JDUploadImage.defaultProps = {
    imagesLenght: 6,
    format: false,
};
