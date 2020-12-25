/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/default-props-match-prop-types */
import React, { Component } from "react";
import ReactCrop from "react-image-crop";
import PropTypes from "prop-types";
import { Modal, Button, Icon } from "antd";

import "react-image-crop/dist/ReactCrop.css";
import styles from "./index.less";

const ButtonGroup = Button.Group;
const buttonStyle = {
    marginLeft: "16px",
};
const defaultProps = {
    title: "裁剪图片",
};

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    src: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
};

function getrURLBaseUrl(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.responseType = "blob";
        xhr.onload = function() {
            if (this.status === 200) {
                const blob = this.response;
                const fileReader = new FileReader();
                fileReader.onloadend = function(e) {
                    const { result } = e.target;
                    resolve(result);
                };
                fileReader.readAsDataURL(blob);
            }
        };
        xhr.onerror = function() {
            reject();
        };
        xhr.send();
    });
}

// let base64Img;

class Crop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // eslint-disable-next-line react/no-unused-state
            crop: props.crop,
            croppedImageUrl: "",
            blob: {},
        };
    }

    onImageLoaded = async image => {
        // base64Img = await getrURLBaseUrl(image.url);
        this.imageRef = image;
        // this.imageRef.setAttribute("crossOrigin", 'Anonymous');
        // this.setState({ crop: { width: 50, height: 50, x: 0, y: 0 } });
        this.setCrop({ x: 0, y: 0 });
        return false;
    };

    setCrop = ({ x = 0, y = 0 } = {}) => {
        if (!this.imageRef) return;
        this.setState({ crop: this.getCrop({ x, y }) });
    };

    getCrop = ({ x = 0, y = 0 } = {}) => {
        const image = this.imageRef;
        const { naturalWidth, naturalHeight, width, height } = image;
        const {
            limitPixel: { width: limitWidth, height: limitHeight },
            ratio,
        } = this.props;
        const newCrop = {
            aspect: ratio || limitWidth / limitHeight,
            width: (limitWidth * width) / naturalWidth,
            height: (limitHeight * height) / naturalHeight,
            x,
            y,
            unit: "px",
        };
        return newCrop;
    };

    // eslint-disable-next-line no-unused-vars
    onCropComplete = (crop, percentCrop) => {
        const { x, y } = crop;
        const newCrop = Object.assign({}, this.getCrop(), { x, y });
        this.makeClientCrop(newCrop);
    };

    onChange = newCrop => {
        // eslint-disable-next-line react/no-unused-state
        const { x, y } = newCrop;
        // this.setState({ crop: newCrop });
        this.setCrop({ x, y });
    };

    onDragStart = () => {
        // console.log("start", params);
    };

    onDragEnd = () => {
        // console.log("onDragEnd");
    };

    /**
     * 裁剪完成以后点击确定毁掉函数
     */
    onEdited = () => {
        const { blob } = this.state;
        this.props.onOk(blob);
    };

    getCroppedImg(image, crop, fileName) {
        const that = this;
        const { file: { type = "image/png" } = {} } = this.props;
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        // canvas.width = crop.width;
        // canvas.height = crop.height;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        const ctx = canvas.getContext("2d");

        // ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width * scaleX, crop.height * scaleY);

        return new Promise(resolve => {
            canvas.toBlob(blob => {
                blob.name = fileName; // eslint-disable-line no-param-reassign
                window.URL.revokeObjectURL(this.fileUrl); // URL.revokeObjectURL()方法会释放一个通过URL.createObjectURL()创建的对象URL
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve({ croppedImageUrl: this.fileUrl, blob });
            }, type);
        });
    }

    zoom = scale => () => {
        this.imageRef.width *= scale;
        this.imageRef.height *= scale;
    };

    /**
     * 关闭回调函数
     * @memberof Crop
     */
    handleCancel = () => {
        // 处理自身逻辑
        // eslint-disable-next-line react/destructuring-assignment
        this.props.onCancel();
    };

    makeClientCrop(crop) {
        const { file: { type = "image/png", name = "newFile.png" } = {} } = this.props;
        if (this.imageRef && crop.width && crop.height) {
            this.getCroppedImg(this.imageRef, crop, name).then(({ croppedImageUrl, blob }) => this.setState({ croppedImageUrl, blob }));
        }
    }

    renderSelectionAddon = () => (
        <button
            type = "button"
            style = {{
                position: "absolute",
                bottom: -25,
                right: 0,
            }}
            onClick = {() => window.alert("You clicked the addon!")}
        >
            custom addon
        </button>
    );

    render() {
        const that = this;
        const { crop, croppedImageUrl } = that.state;
        const { src, title, visible, forceRender, setRef } = that.props;
        return (
            <Modal className = {styles["crop-modal"]} title = {title} visible = {visible} onCancel = {this.handleCancel} footer = {null} width = "90%">
                <div className = {styles.content}>
                    <div className = {styles.originImage} ref = {setRef}>
                        <ReactCrop
                            src = {src}
                            crop = {crop}
                            onImageLoaded = {that.onImageLoaded}
                            onComplete = {that.onCropComplete}
                            onChange = {that.onChange}
                            onDragStart = {that.onDragStart}
                            onDragEdit = {that.onDragEdit}
                            // renderSelectionAddon = {this.renderSelectionAddon}
                            crossorigin = "*"
                            className = "crop"
                            locked
                            // onComplete = {}
                        />
                    </div>
                    <div className = {styles.clipImage}>{croppedImageUrl && <img alt = "Crop" src = {croppedImageUrl} />}</div>
                </div>
                <div className = {styles.footer}>
                    <div className = {styles["footer-container"]}>
                        <ButtonGroup>
                            <Button type = "primary" onClick = {this.zoom(1.05)}>
                                <Icon type = "zoom-in" />
                            </Button>
                            <Button type = "primary" onClick = {this.zoom(0.95)}>
                                <Icon type = "zoom-out" />
                            </Button>
                        </ButtonGroup>
                        <Button type = "primary" style = {buttonStyle} onClick = {this.onEdited}>
                            确定
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }
}

Crop.defaultProps = defaultProps;
Crop.propTypes = propTypes;

export default Crop;
