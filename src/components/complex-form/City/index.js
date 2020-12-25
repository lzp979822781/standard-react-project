import React, { Component } from "react";
import PropTypes from "prop-types";
import { Cascader } from "antd";

const defaultProps = {
    fieldNames: { label: "areaName", value: "areaId", children: "child" },
};

const propTypes = {
    url: PropTypes.string.isRequired,
    fieldNames: PropTypes.object,
};

class City extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: undefined,
            data: props.data || [],
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
        this.getData();
    }

    onChange = value => {
        console.log(value);
        this.setVal(value);
    };

    getData = () => {
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
                    this.setState({ data });
                }
            })
            .catch(err => {
                console.log(`区域值获取异常:${err}`);
            });
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
        const { data, value } = this.state;
        // eslint-disable-next-line no-unused-vars
        const {
            fieldNames,
            value: propVal,
            onChange,
            "data-_field": field,
            "data-__meta": dataMeta,
            ...otherProps
        } = this.props;
        return (
            <Cascader
                value = {value}
                fieldNames = {fieldNames}
                options = {data}
                onChange = {this.onChange}
                changeOnSelect
                expandTrigger = "hover"
                placeholder = "Please select"
                {...otherProps}
            />
        );
    }
}

City.defaultProps = defaultProps;
City.propTypes = propTypes;

export default City;
