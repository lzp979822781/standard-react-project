// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

import { InputNumber } from "antd";

import "./YaoInputNumber.less";

class JDInputNumber extends PureComponent {
    render() {
        const { addonBefore, addonAfter, max, ...other } = this.props;

        const itemClass = classnames({
            "ant-input-group-wrapper": true,
            "addon-all": addonBefore && addonAfter,
            "no-addonBefore": !addonBefore && addonAfter,
            "no-addonAfter": addonBefore && !addonAfter,
        });

        return (
            <span className = {itemClass}>
                <span className = "ant-input-wrapper ant-input-group">
                    {addonBefore ? <span className = "ant-input-group-addon">{addonBefore}</span> : null}
                    <InputNumber stule = {{ borderRadius: 0 }} max = {max || Number.MAX_SAFE_INTEGER} {...other} />
                    {addonAfter ? <span className = "ant-input-group-addon">{addonAfter}</span> : null}
                </span>
            </span>
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
