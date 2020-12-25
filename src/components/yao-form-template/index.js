// standardForm.js
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Switch } from "antd";
import Template from "./form";

class YaoFormTemplate extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            fields: {},
            showData: true,
        };
    }

    onChange = changedFields => {
        const { onChange } = this.props;
        // const { fields } = this.state;
        this.setState(({ fields }) => {
            if (onChange) {
                onChange({ ...fields, ...changedFields });
            }
            return {
                fields: { ...fields, ...changedFields },
            };
        });
    };

    toggle = showData => {
        this.setState({
            showData,
        });
    };

    render() {
        const { fields, showData } = this.state;
        const { showExample } = this.props;

        return (
            <div>
                <Template fields = {fields} onChange = {this.onChange} {...this.props} />
                {showExample ? <Switch checkedChildren = "开" unCheckedChildren = "关" defaultChecked onChange = {this.toggle} /> : null}
                {showExample && showData ? <pre className = "language-bash">{JSON.stringify(fields, null, 2)}</pre> : null}
            </div>
        );
    }
}

// colums [1,2,3,4]
YaoFormTemplate.propTypes = {
    items: PropTypes.array.isRequired,
    globalParam: PropTypes.object,
    showExample: PropTypes.bool,
};

YaoFormTemplate.defaultProps = {
    globalParam: {},
    showExample: false,
};

export default YaoFormTemplate;
