import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Col, Row, Icon } from 'antd';

import styles from './index.less';

// 定义变量
const defaultProps = {
    back: false,
    backFn: () => {
        window.history.go(-1);
    },
}

const propTypes = {
    back: PropTypes.bool,
    backFn: PropTypes.func,
    title: PropTypes.string.isRequired
}

const headerStyle = classnames({
    [styles.header]: true,
    [styles['header-develop']]: true
})

class Header extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const { backFn, title, back, children } = this.props;
        return (
            <div className = {headerStyle}>
                <Row align = 'middle' span = {24}>
                    <Col span = {24}>
                        {
                            back ? (
                                <span onClick = {backFn} className = {styles['back-icon']}>
                                    <Icon type = "left" />
                                    返回
                                </span>
                            ) : ''
                        }
                        <span className = "main-title">{title}</span>
                        {children}
                    </Col>
                </Row>
            </div>
        )
    }
}

Header.defaultProps = defaultProps;
Header.propTypes = propTypes;

export default Header;