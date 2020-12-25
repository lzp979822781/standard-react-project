// standardForm.js
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Select, Divider, Spin, Pagination } from "antd";

const { Option } = Select;

function showTotal(total) {
    return `共 ${total} 条`;
}

const notFoundContent = <div>无数据</div>;

class YaoSearchSelect extends Component {
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {
                ...(nextProps.value || {}),
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            pageSize: 10,
            totalCount: 0,
            list: [],
            fetching: false,
        };
    }

    componentDidMount() {
        this.getList();
    }

    getList = (val = "") => {
        const { params, url, searchKey, returnMap } = this.props;
        const { pageSize, currentPage } = this.state;
        this.setState({ list: [], fetching: true });
        fetch(url, {
            method: "POST",
            body: JSON.stringify({ pageSize, currentPage, [searchKey]: val, ...params }),
            credentials: "include",
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return {};
            })
            .then(body => {
                if (body && body.data && body.data.result) {
                    // eslint-disable-next-line no-shadow
                    const { totalCount, currentPage, result } = body.data;
                    const list = result.map(item => ({
                        label: item[returnMap.label],
                        key: item[returnMap.key],
                        ...item,
                    }));
                    this.setState({ list, totalCount, currentPage, fetching: false });
                }
            });
    };

    onSearch = (val = "") => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.setState({ currentPage: 1 }, () => {
                this.getList(val);
            });
        }, 500);
    };

    onPageChange = page => {
        this.setState(
            {
                currentPage: page,
            },
            () => {
                this.getList();
            }
        );
    };

    // onChange = (value, opt) => {
    //     const { onChange } = this.props;
    //     const { list } = this.state;
    //     let filterData = list.filter(item => Number(item.value) === Number(value));
    //     filterData = filterData[0] ? filterData[0] : {};
    //     if (onChange) {
    //         onChange({ key: value, label: opt.props.children, ...filterData });
    //     }
    // };

    onSelect = value => {
        const { returnMap, onChange } = this.props;
        const { list } = this.state;
        let filterData = list.filter(item => Number(item[returnMap.key]) === Number(value.key));
        filterData = filterData[0] ? filterData[0] : {};

        if (onChange) onChange({ ...filterData, ...value });
    };

    onDropdownVisibleChange = open => {
        if (open) {
            this.setState(
                {
                    currentPage: 1,
                },
                () => {
                    this.getList();
                }
            );
        }
    };

    render() {
        // 任务下拉项和任务请求状态
        const { list, fetching, totalCount, pageSize, currentPage } = this.state;

        const { addonBefore, addonAfter, value, ...other } = this.props;
        const newValue = {
            key: value ? `${value.key}` : "",
            label: value && value.label ? value.label : "",
            ...value,
        };

        return (
            <Select
                showSearch
                // defaultValue = {"ok"}
                labelInValue
                value = {newValue}
                notFoundContent = {fetching ? <Spin size = "small" /> : notFoundContent}
                // optionFilterProp="children"
                filterOption = {false}
                // onChange={this.onChange}
                onSearch = {this.onSearch}
                // onFocus={this.onFocus}
                onSelect = {this.onSelect}
                onDropdownVisibleChange = {this.onDropdownVisibleChange}
                dropdownRender = {menu => (
                    <div>
                        <div>{menu}</div>
                        <Divider style = {{ margin: 0 }} />
                        <div
                            style = {{
                                margin: "4px 0",
                                padding: "4px",
                                textAlign: "right",
                            }}
                            onMouseDown = {e => e.preventDefault()}
                        >
                            <Pagination size = "small" total = {totalCount} current = {currentPage} pageSize = {pageSize} showTotal = {showTotal} onChange = {this.onPageChange} />
                        </div>
                    </div>
                )}
                {...other}
            >
                {list.map(d => (
                    <Option key = {`${d.key}`}>{d.label}</Option>
                ))}
            </Select>
        );
    }
}

YaoSearchSelect.propTypes = {
    url: PropTypes.string,
    searchKey: PropTypes.string,
    returnMap: PropTypes.object,
    param: PropTypes.object,
};

YaoSearchSelect.defaultProps = {
    url: "/api/be/vender/factory/list",
    searchKey: "key",
    returnMap: {
        key: "id",
        label: "name",
    },
    param: {},
};

export default YaoSearchSelect;
