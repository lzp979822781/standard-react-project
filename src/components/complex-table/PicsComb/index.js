import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Icon, Modal, Button } from "antd";

import styles from "./index.less";

const defaultProps = {
    num: 3,
    data: [],
    imgStyle: { width: 100, height: 100 },
};

const propTypes = {
    num: PropTypes.number,
    data: PropTypes.array,
    imgKey: PropTypes.string.isRequired,
    imgStyle: PropTypes.object,
};

class PicsComb extends Component {
    deg = 0;

    constructor(props) {
        super(props);
        this.state = {
            start: 0,
            visible: false,
            currentIndex: undefined,
        };
    }

    leftClick = () => {
        const { start } = this.state;
        this.setState({
            start: start - 1,
        });
    };

    rightClick = () => {
        const { start } = this.state;
        this.setState({
            start: start + 1,
        });
    };

    handleImgClick = curImgData => () => {
        const { data, imgKey } = this.props;
        this.setState(
            {
                currentIndex: data.findIndex(item => item[imgKey] === curImgData[imgKey]),
            },
            () => {
                this.setState({ visible: true });
            }
        );
    };

    getShowData = () => {
        const { data = [], num } = this.props;
        const { start } = this.state;
        if (data.length <= num) {
            return data;
        }
        const end = start + num;
        if (end < data.length) {
            return data.slice(start, end);
        }
        return data.slice(start);
    };

    renderContainer = () => {
        const { data = [], data: { length } = [], num, imgStyle: { width = 100, height = 100, ...otherImgStyle } = {}, imgKey } = this.props;
        const { start } = this.state;
        const iconClass = classnames({
            [styles.icon]: true,
        });
        const leftIcon = classnames(iconClass, {
            [styles.hide]: length <= num || start === 0,
        });
        const rightIcon = classnames(iconClass, styles.ml, {
            [styles.hide]: length <= num || start + num >= length,
        });
        const imgClass = classnames(styles.ml, styles.image);
        const showData = this.getShowData();
        if (data.length) {
            return (
                <div className = {styles.container}>
                    <Icon type = "left" className = {leftIcon} onClick = {this.leftClick} />
                    <div className = {styles["img-container"]}>
                        {showData.map(item => {
                            const { url, [imgKey]: id } = item;
                            return <img className = {imgClass} onClick = {this.handleImgClick(item)} style = {otherImgStyle} key = {id} width = {width} height = {height} src = {url} alt = "no data" />;
                        })}
                    </div>
                    <Icon type = "right" className = {rightIcon} onClick = {this.rightClick} />
                </div>
            );
        }

        return "";
    };

    setImageRef = ele => {
        this.imageRef = ele;
    };

    setImgContainerRef = ele => {
        this.imageC = ele;
        // console.log("this.imageC", ele, ele.offsetHeight, ele.offsetHeight);
    };

    zoom = scale => () => {
        // const tempRef = scale > 1 ? 'imageC' : 'imageRef';
        console.log("scale", scale, scale > 1);
        /* const ele = document.getElementsByClassName('ant-modal-content')[0];
        ele.style.width = `${ele.offsetWidth * scale}px`;
        ele.style.height = `${ele.offsetHeigth * scale}px`; */
        this.imageRef.width *= scale;
        this.imageRef.height *= scale;
        this.imageRef.style.transition = `all 0.2s linear`;
    };

    /**
     * 旋转回调函数
     * @params {string} type type为left、right 分别代表向左向右旋转
     */
    rotate = type => () => {
        let deg;
        if (type === "left") {
            deg = this.deg - 15;
        } else {
            deg = this.deg + 15;
        }
        this.deg = deg;
        this.imageRef.style.transform = `rotate(${deg}deg)`;
    };

    modalClick = type => () => {
        const { currentIndex } = this.state;
        const index = type === "left" ? currentIndex - 1 : currentIndex + 1;
        this.setState({
            currentIndex: index,
        });
    };

    renderPreview = () => {
        const { currentIndex } = this.state;
        if (typeof currentIndex === "undefined") return "";
        const { data = [], data: { length } = [] } = this.props;
        const { url } = data[currentIndex];
        const iconClass = classnames({
            [styles.icon]: true,
        });
        const leftIcon = classnames(iconClass, {
            [styles.hide]: currentIndex === 0,
        });
        const rightIcon = classnames(iconClass, styles.ml, {
            [styles.hide]: currentIndex === length - 1,
        });

        return (
            <div className = {styles["modal-content"]} ref = {this.setImgContainerRef}>
                <div className = {styles["modal-container"]}>
                    <Icon type = "left" className = {leftIcon} onClick = {this.modalClick("left")} />
                    <div className = {styles["modal-image"]}>
                        <img ref = {this.setImageRef} width = "100%" alt = "preview" src = {url} className = {styles.img} />
                    </div>
                    <Icon type = "right" className = {rightIcon} onClick = {this.modalClick("right")} />
                </div>
                <div className = {styles.footer}>
                    <Button.Group size = "default">
                        <Button type = "primary" onClick = {this.zoom(1.05)}>
                            <Icon type = "zoom-in" />
                            放大
                        </Button>
                        <Button type = "primary" onClick = {this.zoom(0.9)}>
                            缩小
                            <Icon type = "zoom-out" />
                        </Button>
                    </Button.Group>
                    <Button.Group size = "default" className = {styles.ml}>
                        <Button type = "primary" onClick = {this.rotate("left")}>
                            <Icon type = "undo" />
                            左旋
                        </Button>
                        <Button type = "primary" onClick = {this.rotate("right")}>
                            右旋
                            <Icon type = "redo" />
                        </Button>
                    </Button.Group>
                </div>
            </div>
        );
    };

    handleCancel = () => {
        this.reg = 0;
        this.setState({
            visible: false,
        });
    };

    render() {
        const { visible } = this.state;
        return (
            <div className = {styles["pics-comb"]}>
                {this.renderContainer()}
                {visible ? (
                    <Modal visible = {visible} footer = {null} onCancel = {this.handleCancel}>
                        {this.renderPreview()}
                    </Modal>
                ) : (
                    ""
                )}
            </div>
        );
    }
}

PicsComb.defaultProps = defaultProps;
PicsComb.propTypes = propTypes;

export default PicsComb;
