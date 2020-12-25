import React, { Component } from "react";
import { Select, Spin, Divider, Pagination } from "antd";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
// import omit from "lodash/omit";

import styles from "./index.less";

const { Option } = Select;

const defaultProps = {};

const propTypes = {
    url: PropTypes.string.isRequired,
    reqParam: PropTypes.object.isRequired,
    resParam: PropTypes.object.isRequired,
};

// 模拟数据
/* const mockData = {
    "msg": "success",
    "code": 0,
    "data": {
        "pageCount": 1,
        "lastPage": true,
        "currentPage": 1,
        "result": [
            {
                "shopName": "上药B2B测试店铺修改一下",
                "companyName": "测试公司06125",
                "id": 3861087,
                "areaNames": "北京;上海;天津;河北",
                "jdSend": -1,
                "type": 2,
                "mobile": "18611850494",
                "createTime": "2016-06-29 10:26:35.0",
                "modified": 0,
                "auditMark": 2,
                "venderId": 48384,
                "created": 0,
                "orderSynMark": 2,
                "yn": 1,
                "offlinePayment": 1,
                "shopId": 39642,
                "areaStatus": 1
            }
        ],
        "limit": 10,
        "pageSize": 10,
        "totalCount": 0,
        "offset": 0
    },
    "success": true
} */

class PaginationSelect extends Component {
    lock = null;

    constructor(props) {
        super(props);
        this.lastFetchId = 0;
        this.fetchUser = debounce(this.fetchUser, 800);
        this.state = {
            data: [],
            cacheData: [],
            value: [],
            fetching: false,
            isDisabledPage: true, // 是否禁用分页
            open: false,
            total: 0,
            currentPage: 1,
            pageSize: 10,
        };
        /* resParam =
            Object.prototype.toString.call(props.resParam) ===
                "[object Object]" &&
            Object.keys(props.resParam).length &&
            props.resParam; */
    }

    componentDidMount() {
        this.fetchUser("");
    }

    static getDerivedStateFromProps(props) {
        if ("value" in props) {
            const { value } = props;
            return {
                value,
            };
        }

        return null;
    }

    /**
     * @param {String} key为联动搜索依赖的上级字段 value为相应值
     */
    jointParam = () => {
        const { reqParam } = this.props;
        const { currentPage, pageSize } = this.state;
        return { currentPage, pageSize, ...reqParam };
    };

    /**
     *
     */
    fetchUser = () => {
        // console.log("fetching user", value);
        const { resParam: { text, value: resKey } = {} } = this.props;
        const reqData = this.jointParam();
        this.lastFetchId += 1;
        const fetchId = this.lastFetchId;
        this.setState({ data: [], fetching: true, isDisabledPage: false });
        const { url } = this.props;
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reqData),
            credentials: "include",
        })
            .then(response => response.json())
            .then(body => {
                if (fetchId !== this.lastFetchId) {
                    // for fetch callback order
                    return;
                }
                const { data: { result = [], totalCount = 0 } = {} } = body;

                const data = result.map(item => {
                    const { [text]: showText, [resKey]: showValue } = item;
                    return { text: showText, value: showValue, ...item };
                });
                this.setState({
                    data,
                    fetching: false,
                    total: totalCount,
                    cacheData: data,
                });
            })
            .catch(err => {
                console.log(`PaginationSelect请求异常:${err}`);
                this.setState({ fetching: false });
            });
    };

    handleChange = value => {
        const { onChange } = this.props;
        this.setState({
            value,
            data: [],
            fetching: false,
        });
        onChange(value);
    };

    onSelect = value => {
        // console.log("搜索值", value, param);
        console.log("onSelect", value);
    };

    onChange = value => {
        console.log("change value", value);
        this.setVal(value);
    };

    onPageChange = type => (current, pageSize) => {
        let res;
        if (type === "pageSize") {
            res = { currentPage: 1, pageSize };
        } else {
            res = { currentPage: current, pageSize };
        }
        this.setState(res, () => {
            this.fetchUser();
        });
    };

    // eslint-disable-next-line no-unused-vars
    lockClose = e => {
        clearTimeout(this.lock);
        this.lock = setTimeout(() => {
            this.lock = null;
        }, 100);
    };

    onDropdownVisibleChange = open => {
        if (this.lock) {
            this.select.focus();
            return;
        }
        this.setState({ open });
        this.fetchUser();
    };

    setRef = select => {
        this.select = select;
    };

    setVal = value => {
        const { onChange, resParam: { value: resKey } = {} } = this.props;
        const { cacheData } = this.state;
        // eslint-disable-next-line eqeqeq
        const filterArr = cacheData.filter(item => item[resKey] == value);
        const filterVal = filterArr.length ? filterArr[0] : {};
        if (onChange) onChange({ ...filterVal });
    };

    render() {
        const { fetching, data, isDisabledPage, open, total } = this.state;
        const { value, notFoundContent, resParam: { value: key } = {}, ...otherProps } = this.props;
        const {
            value: { [key]: stateVal },
        } = this.state;
        return (
            <Select
                // mode = "multiple"
                {...otherProps}
                ref = {this.setRef}
                value = {stateVal ? `${stateVal}` : stateVal}
                // placeholder = "Select users"
                notFoundContent = {fetching ? <Spin size = "small" /> : notFoundContent}
                filterOption = {false}
                showArrow = {false}
                style = {{ width: "100%" }}
                onSelect = {this.onSelect}
                onChange = {this.onChange}
                className = {styles["fuzzy-search"]}
                open = {open}
                onDropdownVisibleChange = {this.onDropdownVisibleChange}
                dropdownRender = {menu => (
                    <div>
                        {menu}
                        <Divider style = {{ margin: "0" }} />
                        <div className = {styles.pagContainer} onMouseDown = {this.lockClose} onMouseUp = {this.lockClose} onBlur = {this.onBlur}>
                            <Pagination
                                showSizeChanger = {false}
                                onShowSizeChange = {this.onPageChange("pageSize")}
                                onChange = {this.onPageChange("pageIndex")}
                                defaultCurrent = {1}
                                total = {total}
                                size = "small"
                                className = {styles.paging}
                                disabled = {isDisabledPage || fetching}
                                showTotal = {totalCount => `共 ${totalCount} 条`}
                                // itemRender = {itemRender}
                            />
                        </div>
                    </div>
                )}
            >
                {data.map(d => (
                    <Option key = {d.value}>{d.text}</Option>
                ))}
            </Select>
        );
    }
}

PaginationSelect.defaultProps = defaultProps;
PaginationSelect.propTypes = propTypes;

export default PaginationSelect;
