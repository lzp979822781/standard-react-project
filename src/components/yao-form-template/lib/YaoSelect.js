// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Select, Divider, Spin, Pagination } from "antd";

const { Option } = Select;

function showTotal(total) {
    return `共 ${total} 条`;
}

const notFoundContent = <div>无数据</div>;

class YaoSelect extends PureComponent {
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
        this.getTaskList();
    }

    getTaskList = () => {
        const { param, url } = this.props;
        const { pageSize, currentPage } = this.state;
        this.setState({ list: [], fetching: true });
        fetch(url, {
            method: "POST",
            body: JSON.stringify({ ...param, pageSize, currentPage }),
            credentials: "include",
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return {};
            })
            .then(body => {
                let list = [];
                let total = 0;
                if (body && body.data && body.data.result) {
                    total = body.data.totalCount;
                    list = body.data.result.map(item => ({
                        label: item.taskName || item.name,
                        key: item.id,
                        ...item,
                    }));
                }
                this.setState({ list, totalCount: total, fetching: false });
            });
    };

    onPageChange = page => {
        this.setState(
            {
                currentPage: page,
            },
            () => {
                this.getTaskList();
            }
        );
    };

    onSelect = value => {
        const { onChange } = this.props;
        const { list } = this.state;
        let filterData = list.filter(item => Number(item.key) === Number(value.key));
        filterData = filterData[0] ? filterData[0] : {};

        if (onChange) onChange({ ...filterData, ...value });
    };

    render() {
        const { list, fetching, totalCount, pageSize } = this.state;

        const { addonBefore, addonAfter, value, ...other } = this.props;
        const newValue = {
            key: `${value.key}`,
            label: value.label || "",
            ...value,
        };
        return (
            <Select
                labelInValue
                value = {newValue}
                onFocus = {this.getTaskList}
                notFoundContent = {fetching ? <Spin size = "small" /> : notFoundContent}
                // onChange = {this.onChange}
                onSelect = {this.onSelect}
                dropdownRender = {menu => (
                    <div>
                        {menu}
                        <Divider style = {{ margin: 0 }} />
                        <div
                            style = {{
                                margin: "4px 0",
                                padding: "4px",
                                textAlign: "right",
                            }}
                            onMouseDown = {e => e.preventDefault()}
                        >
                            <Pagination size = "small" total = {totalCount} pageSize = {pageSize} showTotal = {showTotal} onChange = {this.onPageChange} />
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

YaoSelect.propTypes = {
    url: PropTypes.string,
    param: PropTypes.object,
};

YaoSelect.defaultProps = {
    url: "/api/be/act/task/queryList",
    param: {},
};

export default YaoSelect;
