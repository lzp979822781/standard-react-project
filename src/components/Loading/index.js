import React from "react";
import { Spin } from "antd";

function Loading(props) {
    const { spinning, children, ...otherProps } = props;
    const style = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    };

    const innerLoading = (
        <div style = {style}>
            <img
                src = "https://static.360buyimg.com/yao_static/lib/man/img/loading-jd.gif"
                alt = "加载中"
            />
        </div>
    );

    return (
        <Spin {...otherProps} indicator = {innerLoading} spinning = {spinning}>
            {children}
        </Spin>
    );
}

export default Loading;
