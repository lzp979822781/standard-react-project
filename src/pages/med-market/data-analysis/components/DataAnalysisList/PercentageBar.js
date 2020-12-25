import React from "react";
import { Row, Col, Progress } from "antd";

function PercentageBar({ percent }) {
    const colorStart = "#f23030";
    // let colorEnd = "#ffffff";
    // let precentStart = percent - 10 > 0 ? percent - 10 : 0;
    // let precentEnd = percent;

    // if (percent === 100) {
    //     colorEnd = "#f23030";
    // }
    // if (percent > 90) {
    //     precentStart = percent;
    //     precentEnd = 100;
    // }
    return (
        <Row gutter = {16}>
            {/* <Col className = "gutter-row">
                <div
                    style = {{
                        display: "inline-block",
                        width: 150,
                        height: 20,
                        border: "1px solid #e8e8e8",
                        lineHeight: "20px",
                        textAlign: "center",
                        // backgroundColor: "#ddd",
                        backgroundImage: `linear-gradient(to right, ${colorStart} ${precentStart}%, ${colorEnd} ${precentEnd}%)`,
                    }}
                >
                    {percent}%
                </div>
            </Col> */}
            <Col className = "gutter-row">
                <div style = {{ width: 170 }}>
                    <Progress
                        // showInfo={false}
                        size = "small"
                        strokeColor = {{
                            "0%": colorStart,
                            "100%": colorStart,
                        }}
                        percent = {percent}
                        format = {percentNum => <span style = {{ color: colorStart }}>{`${percentNum} %`}</span>}
                    />
                </div>
            </Col>
        </Row>
    );
}

PercentageBar.defaultProps = {
    percent: 0,
};

export default PercentageBar;
