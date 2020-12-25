import React from "react";
import { Row, Col, Icon } from "antd";
import styles from "./index.less";

function DescriptionItem({ label, children }) {
    return (
        <div
            style = {{
                fontSize: 14,
                lineHeight: "22px",
            }}
        >
            <p
                style = {{
                    marginRight: 8,
                    marginBottom: 0,
                    display: "inline-block",
                    color: "rgba(0,0,0,0.85)",
                }}
            >
                {label}：
            </p>
            <span style = {{ color: "rgba(0,0,0,0.65)" }}>{children}</span>
        </div>
    );
}

function TableHeader({ title, columns, data, doExport }) {
    return (
        <div className = {styles.tableHeader}>
            <Row>
                <Col span = {2}>{title || "活动"}</Col>
                <Col span = {20}>
                    <Row>
                        {/* <Descriptions column = {4}> */}
                        {columns.map(item => (
                            <Col key = {item.key} span = {6}>
                                <DescriptionItem label = {item.label}>{typeof data[item.key] === "number" ? data[item.key] : "--"}</DescriptionItem>
                            </Col>
                        ))}
                        {/* </Descriptions> */}
                    </Row>
                </Col>
                <Col span = {2}>
                    <a
                        onClick = {() => {
                            doExport();
                        }}
                    >
                        <Icon type = "download" />
                        下载数据
                    </a>
                </Col>
            </Row>
        </div>
    );
}

TableHeader.defaultProps = {
    title: "name",
    items: [{ lebel: "title", key: "content" }],
};

export default TableHeader;
