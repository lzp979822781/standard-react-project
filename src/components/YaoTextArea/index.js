// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Input } from "antd";

const { TextArea } = Input;

class YaoTextArea extends PureComponent {
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {
                data: nextProps.value || {},
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        const value = props.value || "";
        this.state = {
            data: value,
        };
    }

    render() {
        const { maxLength, showCount, max, ...other } = this.props;
        const { data } = this.state;
        const hasMaxLength = Number(maxLength) > 0;
        return (
            <div>
                <TextArea {...other} />
                {showCount ? (
                    <div style = {{ textAlign: "right", height: "20px", color: "#666", marginTop: -10, position: "relative", zIndex: 10 }}>
                        {`${data.length || 0}${hasMaxLength ? ` / ${maxLength}` : ""}`}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default YaoTextArea;

YaoTextArea.propTypes = {
    showCount: PropTypes.bool,
};

YaoTextArea.defaultProps = {
    showCount: false,
};
