import React from "react";
import { notification, Button } from "antd";

notification.config({
    placement: "topLeft",
    top: 50,
    duration: 3,
});

const openNotification = (msg, des, callback) => {
    const key = `open${Date.now()}`;
    const onClick = () => {
        notification.close(key);
        if (callback) callback();
    };

    const btn = (
        <Button type = "primary" size = "small" onClick = {onClick}>
            确认
        </Button>
    );

    const close = () => {};

    notification.open({
        message: msg || "通知",
        description: des || "",
        btn,
        key,
        onClose: close,
    });
};

export default openNotification;
