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

class FuzzySearch extends Component {
    lock = null;

    constructor(props) {
        super(props);
        this.lastFetchId = 0;
        this.fetchUser = debounce(this.fetchUser, 300);
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
            inputVal: "",
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
            if (Object.prototype.toString.call(value) === "[object Object]") {
                const { value: key, text: label } = value;
                return {
                    value: { key, label, ...value },
                };
            }
            return null;
        }

        return null;
    }
    /*     componentWillReceiveProps(nextProps) {
        const { value } = this.state;
        const { value: propVal } = nextProps;
        const { value: curPropVal } = this.props;
        // const isValNotEmpty = typeof value !== 'undefined' || value !== '' || (Array.isArray(value) && value.length);
        if (value && !propVal) {
            this.handleChange({ key: "", label: "" });
        }

        if (curPropVal && propVal && propVal.key !== curPropVal.key) {
            const { value: key, text: label } = propVal
            // this.handleChange(propVal);
            this.handleChange({ key, label, ...propVal });
        }
    } */

    genSearchObj = inputVal => {
        const { searchFields: { searchField } = {} } = this.props;
        return searchField ? { [searchField]: inputVal } : {};
    };

    /**
     * @param {String} key为联动搜索依赖的上级字段 value为相应值
     */
    jointParam = inputVal => {
        const { searchFields, searchFields: { otherParam = {} } = {} } = this.props;
        const { inputVal: tempVal, currentPage, pageSize } = this.state;
        // const { currentPage, pageSize } = this.state;
        let pageObj = { currentPage, pageSize, ...this.genSearchObj(inputVal) };
        if (tempVal !== inputVal) {
            this.setState({ inputVal, currentPage: 1 });
            pageObj = { currentPage: 1, pageSize: 10, ...this.genSearchObj(inputVal) };
        }
        /* this.setState({ inputVal });
        pageObj = { currentPage: 1, pageSize: 10, ...this.genSearchObj(inputVal) }; */
        let res = {};
        if (typeof searchFields !== "undefined") {
            const { id: { key, value } = {}, id } = searchFields;
            // res = (id && { [key]: value }) || { [searchField]: inputVal };
            res = (id && { [key]: value }) || this.genSearchObj(inputVal);
        }
        return { ...res, ...pageObj, ...otherParam };
    };

    /**
     *
     *
     * @param {*} value
     */
    fetchUser = value => {
        // console.log("fetching user", value);
        const { resParam: { text, value: resKey } = {} } = this.props;
        const reqData = this.jointParam(value);
        this.lastFetchId += 1;
        const fetchId = this.lastFetchId;
        this.setState({ data: [], isDisabledPage: false });
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
                console.log(`FuzzySearch请求异常:${err}`);
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
        const { onChange, resParam: { value: resKey } = {} } = this.props;
        const { key } = value;
        const { cacheData } = this.state;
        // eslint-disable-next-line eqeqeq
        const filterArr = cacheData.filter(item => item[resKey] == key);
        const filterVal = filterArr.length ? filterArr[0] : value;
        /* this.setState({
            value,
        }); */
        if (onChange) onChange({ ...value, ...filterVal });
    };

    onPageChange = type => (current, pageSize) => {
        console.log("type current pageSize", type, current, pageSize);
        const { inputVal } = this.state;
        this.setState(
            {
                currentPage: current,
                pageSize,
                data: [],
                fetching: true,
            },
            () => {
                this.fetchUser(inputVal);
            }
        );
    };

    // eslint-disable-next-line no-unused-vars
    lockClose = e => {
        clearTimeout(this.lock);
        this.lock = setTimeout(() => {
            this.lock = null;
        }, 100);
    };

    handleCanle = e => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    onDropdownVisibleChange = open => {
        if (this.lock) {
            this.select.focus();
            return;
        }

        const pageObj = {
            currentPage: 1,
            pageSize: 10,
        };
        this.setState({ open, data: [], fetching: true, ...pageObj }, () => {
            this.fetchUser();
        });
        /* const { inputVal } = this.state;
        this.fetchUser(inputVal); */
    };

    setRef = select => {
        this.select = select;
    };

    render() {
        const { fetching, data, isDisabledPage, open, total, currentPage } = this.state;
        const { value: stateVal } = this.state;
        const { value, notFoundContent, ...otherProps } = this.props;

        return (
            <Select
                // mode = "multiple"
                {...otherProps}
                ref = {this.setRef}
                showSearch
                labelInValue
                value = {stateVal}
                // placeholder = "Select users"
                notFoundContent = {fetching ? <Spin size = "small" /> : notFoundContent}
                filterOption = {false}
                showArrow = {false}
                onSearch = {this.fetchUser}
                // onChange = {this.handleChange}
                style = {{ width: "100%" }}
                onSelect = {this.onSelect}
                className = {styles["fuzzy-search"]}
                open = {open}
                onDropdownVisibleChange = {this.onDropdownVisibleChange}
                dropdownRender = {menu => (
                    <div onClick = {this.handleCanle} onMouseDown = {this.handleCanle} onMouseUp = {this.handleCanle}>
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
                                current = {currentPage}
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

FuzzySearch.defaultProps = defaultProps;
FuzzySearch.propTypes = propTypes;

export default FuzzySearch;
