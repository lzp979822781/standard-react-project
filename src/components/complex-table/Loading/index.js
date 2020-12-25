import React, { Component } from "react";
import { Spin } from "antd";
import loadImg from "@/assets/loading-jd.gif";

class Loading extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { indicator, ...otherProps } = this.props;

        return (
            <Spin
                {...otherProps}
                indicator = {
                    <img
                        src = {loadImg}
                        alt = "加载中"
                        style = {{ width: 100, height: 100 }}
                    />
                }
            />
        );
    }
}

export default Loading;
