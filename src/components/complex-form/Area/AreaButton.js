/* eslint-disable eqeqeq */
import React, { Component } from "react";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";
import { Button, Modal, Tree } from "antd";

import { transformData, filterID, getInvertIds, toStrIds } from "@/utils/utils";

import styles from "./index.less";

const { TreeNode } = Tree;

const defaultProps = {
    title: "区域选择",
};

const propTypes = {
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
};

let idArr;
let originData;

class AreaButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: undefined, // 当前选中值
            visible: false, // 是否显示弹窗
            treeData: [], // 树结构数据
        };
    }

    static getDerivedStateFromProps(nextProps) {
        const { value } = nextProps;
        if ("value" in nextProps) {
            return {
                value: Array.isArray(value) ? value : [],
            };
        }
        return null;
    }

    componentDidMount() {
        const { url } = this.props;
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            // body: JSON.stringify(reqData),
        })
            .then(response => response.json())
            .then(body => {
                const { data } = body;
                if (Array.isArray(data)) {
                    originData = toStrIds(cloneDeep(data));
                    const treeData = transformData(toStrIds(cloneDeep(data)));
                    this.setState({
                        treeData,
                    });
                    idArr = filterID(cloneDeep(data));
                }
            })
            .catch(err => {
                console.log(`区域值获取异常:${err}`);
            });
    }

    handleOk = () => {};

    handleCancel = () => {
        this.setState({ visible: false });
    };

    onChange = value => {
        this.setVal(value);
    };

    onCheck = (value, e) => {
        console.log("onCheck", value, e);
        // const { props: { dataRef: { key, level, pid } } = {} } = e.node
        if (!value.length) {
            this.setVal(value);
            return;
        }
        let res = [];
        // 获取所有选中节点完整数据 三级节点没有dataRef属性
        const { checkedNodes } = e;
        const thirdLevel = this.getDifLevel(checkedNodes, 3);
        const wholeNodes = this.getDifLevel(checkedNodes);
        const firstLevel = this.getDaByLevel(wholeNodes, 1);
        const secLevel = this.getDaByLevel(wholeNodes, 2);
        // 过滤非firstLevel下所属的二级节点
        const uniqSec = this.excludePar(firstLevel, secLevel);
        // 过滤非secLevel下所属的三级节点
        const uniqThird = this.excludePar(secLevel, thirdLevel);
        console.log("wholeNodes", wholeNodes);
        res = [...firstLevel, ...uniqSec, ...uniqThird];
        console.log("res", res);
        const idsArr = res.map(item => item.value);
        this.setVal(idsArr);
    };

    /**
     * 初始数据过滤
     * @param {*} data
     */
    getDifLevel = (data, paramLevel) => {
        const isPreLevel = paramLevel != 3;
        return data
            .filter(item => {
                const {
                    props: { dataRef, level },
                } = item;
                return isPreLevel
                    ? dataRef || (level && level < 3)
                    : !dataRef && level == 3;
            })
            .map(item => {
                const {
                    props: { dataRef, level },
                    props,
                } = item;
                return isPreLevel
                    ? dataRef || (level && level < 3 && props)
                    : props;
            });
    };

    getDaByLevel = (data, level) => data.filter(item => item.level == level);

    excludePar = (parent, paramChild) =>
        paramChild.filter(item => {
            const isUniq = parent.every(parItem => item.pid !== parItem.value);
            return isUniq;
        });

    onSelect = (value, info) => {
        console.log("onSelect", value, info);
        // this.setVal(value);
    };

    /**
     * 全选
     */
    selectAll = () => {
        let tempArr = [];
        if (idArr) {
            tempArr = idArr;
        } else {
            tempArr = filterID(originData);
        }

        this.onChange(tempArr);
    };

    removeSelect = () => {
        this.setVal([]);
    };

    /**
     * 反选的思路 先过滤第一级,获取反选数据
     */
    selectInvert = () => {
        const { value } = this.state;
        if (value && value.length) {
            const resData = getInvertIds(originData, value);
            console.log("invertData", resData);
            this.setVal(resData);
        }
    };

    openModal = () => {
        this.setState({ visible: true });
    };

    setVal = value => {
        const that = this;
        const { onChange } = that.props;
        if (onChange) {
            onChange(value);
        } else {
            that.setState({
                value,
            });
        }
    };

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children && item.children.length) {
                return (
                    <TreeNode title = {item.title} key = {item.key} dataRef = {item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key = {item.key} {...item} />;
        });

    render() {
        const { value, visible, treeData } = this.state;
        const { title, disabled } = this.props;
        const text =
            (value && value.length && `已选择${value.length}个区域`) ||
            "区域选择";
        return (
            <div className = {styles["area-btn"]}>
                <Button
                    type = "primary"
                    onClick = {this.openModal}
                    disabled = {disabled}
                >
                    {text}
                </Button>
                <Modal
                    title = {title}
                    visible = {visible}
                    onOk = {this.handleOk}
                    onCancel = {this.handleCancel}
                    footer = {null}
                    className = {styles["area-btn-modal"]}
                >
                    <div className = {styles["btn-wrapper"]}>
                        <Button
                            type = "primary"
                            size = "small"
                            onClick = {this.selectAll}
                        >
                            全选
                        </Button>
                        <Button
                            type = "primary"
                            size = "small"
                            onClick = {this.selectInvert}
                        >
                            反选
                        </Button>
                        <Button
                            type = "primary"
                            size = "small"
                            onClick = {this.removeSelect}
                        >
                            清除
                        </Button>
                        <Button
                            type = "primary"
                            size = "small"
                            onClick = {this.handleOk}
                        >
                            确定
                        </Button>
                    </div>
                    <div className = {styles["tree-wrapper"]}>
                        <Tree
                            checkable
                            onExpand = {this.onExpand}
                            // expandedKeys = {this.state.expandedKeys}
                            // autoExpandParent = {this.state.autoExpandParent}
                            onCheck = {this.onCheck}
                            checkedKeys = {value}
                            onSelect = {this.onSelect}
                            // selectedKeys = {value}
                        >
                            {this.renderTreeNodes(treeData)}
                        </Tree>
                    </div>
                </Modal>
            </div>
        );
    }
}

AreaButton.defaultProps = defaultProps;
AreaButton.propTypes = propTypes;

export default AreaButton;
