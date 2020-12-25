import React, { Component } from "react";
import PropTypes from "prop-types";
import { TreeSelect, Button } from "antd";
import cloneDeep from "lodash/cloneDeep";

import { transformData, filterID, getInvertIds } from "@/utils/utils";

import styles from "./index.less";

const { SHOW_PARENT } = TreeSelect;

const propTypes = {
    url: PropTypes.string.isRequired,
};

let idArr;
let originData;

class Area extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value || undefined,
            treeData: [],
        };
    }

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
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
                    originData = cloneDeep(data);
                    const treeData = transformData(cloneDeep(data));
                    this.setState({
                        treeData,
                    });
                    idArr = filterID(cloneDeep(data));
                }
                // const { text, value: resKey } = queryParam;
                // const data = result.map(item => ({
                //     text: item[text],
                //     value: item[resKey],
                // }));
                // this.setState({ data, fetching: false });
                // this.tranformData(data);
            })
            .catch(err => {
                console.log(`区域值获取异常:${err}`);
            });
    }

    /* onLoadData = treeNode => new Promise( resolve => {
        // const reqData = {
        //     companyName: value,
        // };
        this.lastFetchId += 1;
        const fetchId = this.lastFetchId;
        const { url } = this.props;
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // body: JSON.stringify(reqData),
        }).then(response => response.json())
            .then(body => {
                if (fetchId !== this.lastFetchId) {
                    // for fetch callback order
                    return;
                }
                const { data: { result = [] } = {}, data } = body;
                console.log("search data", data);
                // const { text, value: resKey } = queryParam;
                // const data = result.map(item => ({
                //     text: item[text],
                //     value: item[resKey],
                // }));
                // this.setState({ data, fetching: false });
                resolve();
            })
            .catch(err => {
                console.log(`FuzzySearch请求异常:${err}`);
                // this.setState({ fetching: false });
                const that = this;
                const { id } = treeNode.props;
                const { treeData } = that.state;
                setTimeout(() => {
                    this.setState({
                        treeData: treeData.concat([
                            this.genTreeNode(id, false),
                            this.genTreeNode(id, true),
                        ]),
                    });
                }, 300);
                resolve();
            });
    }) */

    onChange = value => {
        this.setVal(value);
    };

    selectAll = () => {
        let tempArr = [];
        if (idArr) {
            tempArr = idArr;
        } else {
            tempArr = filterID(originData);
        }

        this.onChange(tempArr);
    };

    /**
     * 反选的思路 先过滤第一级,获取反选数据
     */
    selectInvert = () => {
        const { value } = this.state;
        if (value && value.length) {
            const resData = getInvertIds(originData, value);
            this.setVal(resData);
        }

        // 过滤选中值value中的第三层级数据
        /*         const thirdLevelArr = diffLayerFilter(originData, 3);
        const thirdVal = value.filter(item => thirdLevelArr.includes(item));
        let resArr;
        if(resArr) {
            this.setVal(resArr);
        } */
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

    render() {
        const { treeData, value: stateVal } = this.state;
        const { value, onChange, ...otherProps } = this.props;
        const tProps = {
            treeData,
            value: stateVal,
            onChange: this.onChange,
            // loadData: this.onLoadData,
            treeCheckable: true,
            showCheckedStrategy: SHOW_PARENT,
            searchPlaceholder: "Please select",
            style: {
                width: 300,
            },
            allowClear: true,
            className: styles["tree-select"],
            ...otherProps,
        };
        return (
            <div className = {styles.area}>
                <div className = {styles["tree-wrapper"]}>
                    <TreeSelect {...tProps} />
                </div>
                <Button type = "primary" size = "small" onClick = {this.selectAll}>
                    全选
                </Button>
                <Button type = "primary" size = "small" onClick = {this.selectInvert}>
                    反选
                </Button>
            </div>
        );
    }
}

Area.propTypes = propTypes;

export default Area;
