import React, { Component } from "react";
import { DatePicker } from "antd";

class RangePicker extends Component {
    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if ("value" in nextProps) {
            return {
                ...(nextProps.value || {}),
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        const value = props.value || {};
        this.state = {
            startTime: value.startTime,
            endTime: value.endTime,
            endOpen: false,
        };
    }

    // 下面都是日期区间联动使用方法
    disabledStartDate = startTime => {
        const { endTime } = this.state;
        if (!startTime || !endTime) {
            return false;
        }
        return startTime.valueOf() > endTime.valueOf();
    };

    disabledEndDate = endTime => {
        const { startTime } = this.state;
        if (!endTime || !startTime) {
            return false;
        }
        return endTime.valueOf() <= startTime.valueOf();
    };

    // onTimeChange = (field, value) => {
    //     this.setState({
    //         [field]: value,
    //     });
    // };

    // onStartChange = value => {
    //     this.onTimeChange("startTime", value);
    // };

    // onEndChange = value => {
    //     this.onTimeChange("endTime", value);
    // };

    onStartChange = value => {
        if (!("value" in this.props)) {
            this.setState({ startTime: value });
        }
        this.onTimeChange({ startTime: value });
    };

    onEndChange = value => {
        if (!("value" in this.props)) {
            this.setState({ endTime: value });
        }
        this.onTimeChange({ endTime: value });
    };

    onTimeChange = changedValue => {
        // Should provide an event to pass value to Form.
        const { onChange } = this.props;
        const { startTime, endTime } = this.state;
        if (onChange) {
            onChange({
                startTime,
                endTime,
                ...changedValue,
            });
        }
    };

    handleStartOpenChange = open => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    };

    handleEndOpenChange = open => {
        this.setState({ endOpen: open });
    };

    render() {
        const { startTime, endTime, endOpen } = this.state;
        return (
            <div style = {{ display: "flex" }}>
                <div>
                    <DatePicker
                        disabledDate = {this.disabledStartDate}
                        format = "YYYY-MM-DD"
                        value = {startTime}
                        placeholder = "开始时间"
                        onChange = {this.onStartChange}
                        onOpenChange = {this.handleStartOpenChange}
                    />
                </div>
                <div>
                    <span
                        style = {{
                            display: "inline-block",
                            width: 24,
                            textAlign: "center",
                        }}
                    >
                        -
                    </span>
                </div>
                <div>
                    <DatePicker
                        disabledDate = {this.disabledEndDate}
                        format = "YYYY-MM-DD"
                        value = {endTime}
                        placeholder = "结束时间"
                        onChange = {this.onEndChange}
                        open = {endOpen}
                        onOpenChange = {this.handleEndOpenChange}
                    />
                </div>
            </div>
        );
    }
}

export default RangePicker;
