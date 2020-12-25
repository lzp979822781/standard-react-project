// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Select, Divider, Spin, Pagination } from "antd";
import { urlPrefix } from "@/utils/utils";
import "./YaoInputNumber.less";

const { Option } = Select;

function showTotal(total) {
    return `共 ${total} 条`;
}

class JDInputNumber extends PureComponent {
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
        const { param } = this.props;
        const { pageSize, currentPage } = this.state;
        this.setState({ list: [], fetching: true });
        fetch(`${urlPrefix}act/task/queryList`, {
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
                        text: item.taskName,
                        value: item.id,
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

    onChange = (value, opt) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange({ key: value, label: opt.props.children });
        }
    };

    render() {
        // 任务下拉项和任务请求状态
        const { list, fetching, totalCount } = this.state;

        const { addonBefore, addonAfter, value, ...other } = this.props;
        return (
            <Select
                {...other}
                value = {value && value.key ? `${value.key}` : ""}
                onFocus = {this.getTaskList}
                notFoundContent = {fetching ? <Spin size = "small" /> : null}
                onChange = {this.onChange}
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
                            <Pagination size = "small" total = {totalCount} showTotal = {showTotal} onChange = {this.onPageChange} />
                        </div>
                    </div>
                )}
            >
                {list.map(d => (
                    <Option key = {`${d.value}`}>{d.text}</Option>
                ))}
            </Select>
        );
    }
}

export default JDInputNumber;

JDInputNumber.propTypes = {
    addonBefore: PropTypes.string,
    addonAfter: PropTypes.string,
};

JDInputNumber.defaultProps = {
    addonBefore: "",
    addonAfter: "",
};
