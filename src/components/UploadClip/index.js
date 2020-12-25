/* eslint-disable no-param-reassign */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-nested-ternary */
import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Upload, Icon, Modal, Progress, Tooltip, message } from "antd";
import cloneDeep from "lodash/cloneDeep";
import Crop from "../Crop";

import { getUrlFromBlob } from "@/utils/utils";

// eslint-disable-next-line no-unused-vars
import styles from "./index.less";

const defaultProps = {
    limitSize: 10,
    limitNum: 10,
    onPreview: () => {},
    onRemove: () => {},
    onEdit: () => {},
    showRemoveIcon: true,
    showPreviewIcon: true,
    showEditIcon: true,
};

const propTypes = {
    url: PropTypes.string.isRequired,
    limitSize: PropTypes.number,
    limitNum: PropTypes.number,
    onPreview: PropTypes.func,
    onRemove: PropTypes.func,
    showRemoveIcon: PropTypes.bool,
    showPreviewIcon: PropTypes.bool,
    showEditIcon: PropTypes.bool,
    onEdit: PropTypes.func,
};

const reg = /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/;

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = error => reject(error);
    });
}

function FileImage() {
    return (
        <>
            <Icon type = "file-image" className = {styles["item-file-image"]} />
        </>
    );
}

// const errCloseArray = ["uploading", "error"];
let num = 0;

class UploadClip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,
            previewImage: "",
            fileList: props.value || [],
            // cacheList: [],
            uploadState: "done", // 将uploadState分为以下几种状态：done 上传完成、uploading 上传中、 error 上传错误
            progressVal: 0, // 上传进度值
            uploadingFile: {
                name: "",
                status: "uploading",
            }, // 正在上传中的文件
            // isShutDown: true,
            editFile: {}, // 待编辑文件
            visible: false,
        };
    }

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        const { value } = nextProps;
        if ("value" in nextProps) {
            return {
                // fileList: Object.prototype.toString.call(value) === "[object Array]" && value || [],
                fileList: value || [],
            };
        }
        return null;
    }

    async componentDidUpdate() {
        // this.showBase64();
    }

    showBase64 = async () => {
        const { fileList } = this.state;
        fileList.forEach(file => {
            const { thumbUrl, originFileObj } = file;
            if (!thumbUrl && originFileObj) {
                this.getLocalUrl(file).then(data => {
                    file.thumbUrl = data;
                    this.forceUpdate();
                });
            }
        });
    };

    handleClose = () => {
        this.setState({ visible: false });
    };

    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = file => async () => {
        /* const { disabled } = this.props;
        if (disabled) {
            return;
        } */
        if (!file.url && !file.preview) {
            // eslint-disable-next-line no-param-reassign
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });

        // 执行传入的预览回调
        const { onPreview } = this.props;
        if (onPreview) {
            onPreview();
        }
    };

    /**
     *  点击编辑图标的回调函数
     */
    handleEdit = file => () => {
        const { disabled } = this.props;
        if (disabled) {
            return;
        }
        this.setState({
            editFile: file,
            visible: true,
        });
        // this.executeCallback("onEdit", file);
    };

    /**
     * 编辑完成以后的回调函数
     */
    handleEdited = blob => {
        const that = this;
        const { editFile } = that.state;
        // TODO 修改完成后上传修改后的blob对象，然后将fileList的相关URL修改为返回的新的URL
        this.executeCallback("onEdit", { file: editFile, blob });
        // 测试逻辑完后生成URL，然后展示编辑后的图片
        this.replaceFileList(blob);
    };

    replaceFileList = blob => {
        const that = this;
        const imageURL = getUrlFromBlob(blob);
        const { editFile, fileList } = that.state;
        if (imageURL) {
            const replacedList = this.doReplace(editFile, fileList, imageURL);
            this.setState({
                fileList: replacedList,
                visible: false,
            });
        }
    };

    doReplace = (editFile, fileList, imageURL) => {
        const temp = cloneDeep(fileList);
        return temp.map(item => {
            const aliasItem = cloneDeep(item);
            if (aliasItem.uid === editFile.uid) {
                aliasItem.url = imageURL;
            }
            return aliasItem;
        });
    };

    /**
     * 文件上传状态发生改变是执行的回调
     * @param {Object} file 当前上传文件
     * @param {Array} fileList upload Upload组件内记录的文件状态，不是我们当前state中的fileList
     * @param {Object} event 事件对象,上传中的文件有这个对象
     */
    handleChange = info => {
        const { file, fileList } = info;
        const { status } = file;
        if (!status) return;
        // 根据返回的file及event状况进行兼容
        this.setVal(cloneDeep(fileList));
        // this.setState({ fileList })
        // 检测文件上传过程中窗口是否关闭
        // 检查是否上传成功,如果上传成功
        if (status === "done") {
            this.setState({
                isShutDown: true,
                uoloadState: "done",
            });
            // this.setVal(cloneDeep(fileList));
            // this.callPar();
        }
    };

    doRemove = file => {
        const that = this;
        if (that.container && that.container.handleRemove) {
            that.container.handleRemove(file);
        } else {
            const { fileList } = this.state;
            this.setVal(fileList.filter(({ uid }) => uid !== file.uid));
        }

        const { uploadState } = that.state;
        if (uploadState === "uploading") {
            this.setState({
                uploadingFile: {
                    name: "",
                    status: "uploading",
                },
            });
        }
    };

    /**
     *
     * 上传文件之前的钩子函数
     * @params {object} 当前上传文件
     */
    // eslint-disable-next-line consistent-return
    beforeUpload = (file, fileList) => {
        const that = this;
        const isPixelPass = this.checkPixel(file);
        // if(!isPixelPass) return false;
        // eslint-disable-next-line no-plusplus
        if (fileList.length > 1) num++;
        const isNumPass = that.checkNum(file, fileList);
        const isChecked = that.checkSize(file, fileList);
        return isNumPass && isChecked && isPixelPass;
    };

    /**
     * 验证单文件上传大小是否符合限制，如果是返回true, 不符合返回false,并给出提示信息
     * 验证上传文件个数是否满足要求，不满足中止上传，并给出提示信息，满足返回true，不满足返回false
     * @memberof UploadClip
     */
    check = (file, fileList) => {
        const that = this;
        const isFullfillSize = that.checkSize(file, fileList);
        const isFullfillNum = that.checkNum(file, fileList);

        if (isFullfillSize && isFullfillNum) {
            return true;
        }

        return false;
    };

    isPixelPass = (data, compareVal) => (data ? data >= compareVal - 10 && data <= compareVal + 10 : true);

    validRatio = (ratio, { imgWidth, imgHeight }) => {
        const max = (imgWidth + 10) / (imgHeight - 10);
        const min = (imgWidth - 10) / (imgHeight + 10);
        if (!ratio) return true;
        return ratio >= min && ratio <= max;
    };

    /**
     * 验证图片是否符合给定的像素或者比例
     */
    checkPixel = file =>
        new Promise((resolve, reject) => {
            if (!reg.test(file.name)) resolve();
            const { ratio, limitPixel: { width, height } = {} } = this.props;
            const FileURL = window.URL || window.webkitURL;
            const img = new Image();
            img.onload = () => {
                let valid = true;
                const { width: imgWidth, height: imgHeight } = img;
                // 需要支持单独限值，如单独限宽单独限高
                // const isRatioPass = this.isPixelPass(ratio, imgWidth / imgHeight);
                const isRatioPass = this.validRatio(ratio, { imgWidth, imgHeight });
                const isWidthPass = this.isPixelPass(width, imgWidth);
                const isHeightPass = this.isPixelPass(height, imgHeight);
                valid = isRatioPass && isWidthPass && isHeightPass;
                // eslint-disable-next-line no-unused-expressions
                valid ? resolve() : reject();
            };
            img.src = FileURL.createObjectURL(file);
        }).then(
            () => file,
            () => {
                const { ratio, limitPixel: { width, height } = {} } = this.props;
                let msg = `${file.name}不满足尺寸要求 ${width}*${height}`;
                if (ratio) {
                    msg = `${file.name}不满足宽高比例${ratio}`;
                }
                message.error(msg, 2);
                return Promise.reject();
            }
        );

    /**
     * 检查文件大小是否满足标准
     * @params {Object} file 当前上传文件
     * @params {Array} fileList为当前文件数组，如果是单文件上传为氮元素数组
     */
    checkSize = file => {
        const { limitSize } = this.props;
        if (limitSize) {
            const isFullfill = file.size <= limitSize * 1024 * 1024;
            if (!isFullfill) {
                message.error(`${file.name}大小超出限制`, 2);
                return false;
            }
        }

        return true;
    };

    /**
     * 检查上传文件的个数费否超出限制
     */
    checkNum = (file, fileList) => {
        // 判断当前已有文件个数
        const { limitNum } = this.props;
        const { fileList: currentList } = this.state;
        const length = fileList.length + currentList.length;
        if (limitNum && length > limitNum) {
            if (num < 2) {
                message.error("上传文件个数超出限制", 2);
            } else if (num === length) {
                num = 0;
            }
            return false;
        }

        return true;
    };

    /**
     * 删除文件回调 是否请求文件服务器
     */
    handleRemove = file => () => {
        const { disabled } = this.props;
        if (disabled) {
            return;
        }
        const that = this;
        that.doRemove(file);
        // that.executeCallback('onRemove', file);
    };

    executeCallback = (method, param) => {
        // eslint-disable-next-line react/destructuring-assignment
        const callMethod = this.props[method];
        if (callMethod) {
            callMethod(param);
        }
    };

    onStopUpload = file => () => {
        this.doRemove(file);
    };

    genLoading = () => {
        const { progressVal, uploadingFile, uploadState } = this.state;
        const item = classnames({
            "ant-upload-list-item": true,
            // [`ant-upload-list-item-${uploadState}`]: true,
            [styles["list-item"]]: true,
            [styles["upload-item"]]: true,
            [styles["upload-error"]]: uploadState === "error",
        });
        const uplodingStyle = classnames({
            [styles["uploading-text"]]: true,
            [styles["uploading-text-error"]]: uploadState === "error",
        });
        return (
            <div className = {`${item}`}>
                <div className = {`ant-upload-list-item-info ${styles["item-info"]} ${styles["upload-item-info"]} `}>
                    <span>
                        <div className = {`${uplodingStyle}`}>
                            {uploadState !== "error" ? "文件上传中" : "上传错误"}
                            <Tooltip placement = "topLeft" title = {uploadingFile.name}>
                                <p className = {styles["ellipse-show"]}>{uploadingFile.name}</p>
                            </Tooltip>
                        </div>
                    </span>
                </div>
                <Icon type = "close" className = {styles["item-close"]} onClick = {this.onStopUpload} />
                <Progress percent = {progressVal} size = "small" className = {`${styles["upload-progress"]}`} />
            </div>
        );
    };

    getLocalUrl = async file => {
        // 取不到originFileObj对象
        const { url, response: { data, success } = {}, originFileObj } = file;
        if (Object.keys(originFileObj).length) {
            const resUrl = await getBase64(originFileObj);
            return resUrl;
        }

        return success ? data : url;
    };

    genList = () => {
        const that = this;
        const { fileList } = that.state;
        const { showRemoveIcon, showPreviewIcon, showEditIcon } = that.props;

        return cloneDeep(fileList).map(file => {
            const { status, percent = 0 } = file;
            const isProShow = status && status !== "done";
            const isPreEditShow = status && status === "done";
            const isUploadErrShow = status && status !== "done";
            const isFileNameShow = isPreEditShow && !reg.test(file.name);
            const isPicture = reg.test(file.name);
            // const isFileNameShow = true;

            const listItem = classnames({
                "ant-upload-list-item": true,
                // [`ant-upload-list-item-${uploadState}`]: true,
                [styles["list-item"]]: true,
                [styles["upload-item"]]: isUploadErrShow,
                [styles["upload-error"]]: status === "error",
            });

            const uplodingStyle = classnames({
                [styles["uploading-text"]]: true,
                [styles["uploading-text-error"]]: status === "error",
            });

            const loadState = status ? (status !== "done" ? "-uploading-" : "-") : "-";
            const shadow = status ? (status !== "done" ? "" : "shadow") : "shadow";
            const { response: { data, success } = {}, thumbUrl } = file;
            const resUrl = success ? data : thumbUrl;

            return (
                <div className = {listItem} key = {file.uid}>
                    <div className = {`ant-upload-list-item-info ${styles["item-info"]} ${styles[shadow]}`}>
                        {isPreEditShow ? (
                            <span className = {styles["fill-height"]}>
                                <a className = {`ant-upload-list-item-thumbnail ${styles["image-link"]}`} href = {file.url} target = "_blank" rel = "noopener noreferrer">
                                    {reg.test(file.name) ? (
                                        <img src = {reg.test(file.name) ? thumbUrl || file.url || resUrl : <Icon type = "picture" />} alt = "unknown.png" className = "ant-upload-list-item-image" />
                                    ) : (
                                        <FileImage />
                                    )}
                                </a>
                                <a
                                    target = "_blank"
                                    rel = "noopener noreferrer"
                                    className = {styles["item-name"]}
                                    title = "image.png"
                                    href = "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                                >
                                    image.png
                                </a>
                            </span>
                        ) : (
                            ""
                        )}
                        {// !isUploadErrShow
                            isUploadErrShow ? (
                                <span>
                                    <div className = {`${uplodingStyle}`}>
                                        {status !== "error" ? "文件上传中" : "上传错误"}
                                        <Tooltip placement = "topLeft" title = {file.name}>
                                            <p className = {styles["ellipse-show"]}>{file.name}</p>
                                        </Tooltip>
                                    </div>
                                </span>
                            ) : (
                                ""
                            )}
                        {isFileNameShow ? (
                            <div className = {`${styles["item-file-name"]}`}>
                                {file.name ? file.name : ""}
                                {/* {"dfagdagdfeafdsafdddddddfdagdfeagdeagdfg"} */}
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                    {/* style  styles[`item${loadState}actions`] */}
                    <span className = {styles[`item${loadState}actions`]}>
                        {showEditIcon && isPreEditShow && isPicture ? <Icon type = "edit" className = {styles.icon} onClick = {that.handleEdit(file)} /> : ""}
                        <a
                            // href = "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                            target = "_blank"
                            rel = "noopener noreferrer"
                            title = "预览文件"
                            onClick = {this.handlePreview(file)}
                        >
                            {showPreviewIcon && isPreEditShow && isPicture ? <Icon type = "eye" className = {styles.icon} /> : ""}
                        </a>
                        {showRemoveIcon ? <Icon type = "delete" className = {styles.icon} onClick = {this.handleRemove(file)} /> : ""}
                    </span>

                    {isProShow ? <Icon type = "close" className = {styles["item-close"]} onClick = {this.onStopUpload(file)} /> : ""}
                    {isProShow ? <Progress percent = {(percent && parseInt(percent, 10)) || 0} size = "small" className = {`${styles["upload-progress"]}`} /> : ""}
                    {/* {isFileNameShow ? (
                        <div className = {`${styles["upload-progress"]}`}>
                            {file.name && file.name || ''}
                        </div>
                    ) : ''} */}
                </div>
            );
        });
    };

    createRef = ele => {
        this.container = ele;
    };

    setVal = value => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        } else {
            this.setState({
                fileList: value,
            });
        }
    };

    getCropRatio = () => {
        const { limitPixel: { width, height } = {}, ratio } = this.props;
        const res = Object.assign({}, width ? { width } : {}, height ? { height } : {}, ratio ? { aspect: ratio } : {});
        if (Object.keys(res).length === 0) return { aspect: 16 / 9 };
        return res;
    };

    // 回调父方法
    callPar = () => {
        const { onParChange } = this.props;
        if (onParChange) onParChange();
    };

    render() {
        const {
            previewVisible,
            previewImage,
            fileList,
            // isShutDown,
            editFile: { thumbUrl, url: editFileUrl, response: { data: responseUrl } = {} } = {},
            visible,
            // cacheList
        } = this.state;
        const { url, className, limitNum, ...otherProps } = this.props;
        const uploadClass = classnames({
            className,
            clearfix: true,
            [styles["upload-clip"]]: true,
        });

        const uploadButton = (
            <div>
                <Icon type = "plus" />
                <div className = "ant-upload-text">上传</div>
            </div>
        );

        const editUrl = thumbUrl || editFileUrl || responseUrl;

        return (
            <div className = {uploadClass}>
                <span>
                    <div className = {`${styles["upload-list"]}`}>{this.genList()}</div>
                </span>

                <Upload
                    {...otherProps}
                    action = {url}
                    listType = "picture-card"
                    fileList = {cloneDeep(fileList)}
                    // onPreview = {this.handlePreview}
                    onChange = {this.handleChange}
                    beforeUpload = {this.beforeUpload}
                    ref = {this.createRef}
                    accept = ".jpg,.png,.gif"
                >
                    {fileList.length >= limitNum ? null : uploadButton}
                </Upload>
                <Modal visible = {previewVisible} footer = {null} onCancel = {this.handleCancel}>
                    <img alt = "example" src = {previewImage} style = {{ width: "100%" }} />
                </Modal>
                {editUrl ? <Crop src = {editUrl} onOk = {this.handleEdited} onCancel = {this.handleClose} visible = {visible} crop = {this.getCropRatio()} /> : ""}
            </div>
        );
    }
}

UploadClip.defaultProps = defaultProps;
UploadClip.propTypes = propTypes;

export default UploadClip;
