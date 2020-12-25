/* eslint-disable import/extensions */
import React, { Component } from "react";
import { connect } from "dva";
import { Row, Col, Tabs, Button, Descriptions, Card, Tooltip, Icon, Affix } from "antd";
import PullSearch from "./PullSearch";
import GeoMap from "@/components/chart";
import ComplexTable from "@/components/ComplexTable";
import { genPageObj, getStrDate, UUID, err, isGy, transCookie } from "@/utils/utils";
import { provinceCols, cityCols, fieldArr, fieldArrGy } from "./commonData";

import styles from "./index.less";

const { TabPane } = Tabs;

let dispatch;
@connect(({ displayAnalyse, loading }) => ({
    ...displayAnalyse,
    loading: loading.effects["displayAnalyse/queryAnalyseArea"],
}))
class DisplayAnalysis extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        ({ dispatch } = props);
        this.ExportButton = this.renderBtn();
        this.customPageObj = genPageObj(this, "abc");
    }

    componentDidMount() {
        this.getUrlParam();
    }

    getUrlParam = () => {
        const {
            location: {
                query: { id = 415 },
            },
        } = this.props;
        this.setState({ id }, () => {
            if (id) {
                this.setState({ loading: true });
                this.queryAct();
            }
        });
    };

    queryAct = () => {
        const { id } = this.state;
        this.callModel("queryActs", { id }, (res = {}) => {
            this.failCallback(res);
            const { data } = res;
            this.setState({ loading: false });
            if (data) {
                const { actId, actTaskId, venderId } = data;
                const baseReq = { actId, actTaskId, factoryVenderId: venderId };
                this.callModel("queryBaseInfo", baseReq);
                this.callModel("queryAnalyseArea");
                this.querySearch(data);
            }
        });
    };

    querySearch = data => {
        this.initAct(data);
        const { venderId } = data;
        const facReq = {
            currentPage: 1,
            pageSize: 10,
            venderId,
            type: "company",
        };
        this.callModel("initSearch", facReq, ({ data: { result } = {} }) => {
            if (Array.isArray(result) && result.length) {
                this.initCompany(result);
                this.queryTask(data);
            }
        });
    };

    queryTask = data => {
        const { actTaskId, venderId } = data;
        if (venderId) {
            const taskReq = { id: actTaskId, venderId, currentPage: 1, pageSize: 10, status: 2, type: "task" };
            this.callModel("initSearch", taskReq, ({ data: { result } = {} }) => {
                this.initTask(result);
            });
        }
    };

    initCompany = result => {
        if (Array.isArray(result) && result.length) {
            const { venderId: key, companyName: label } = result[0];
            this.initSearch({ venderId: Object.assign({}, { key, label }, result[0]) });
        }
    };

    initAct = data => {
        if (data) {
            const { actId: key, name: label } = data;
            this.initSearch({ activity: Object.assign({}, { key, label }, data) });
            this.actInfo = data;
        }
    };

    initTask = result => {
        if (!result) return;
        if (Array.isArray(result) && result.length) {
            const { id, taskName } = result[0];
            this.initSearch({ actTaskId: Object.assign({}, { key: id, label: taskName }, result[0]) });
        }
    };

    initSearch = value => {
        const { setValues } = this.curSearch || {};
        if (setValues) {
            setValues(value);
        }
    };

    failCallback = ({ msg, type }) => {
        if (type === "error") {
            err(msg);
            this.callModel("updateState", {
                analysisBaseInfo: {},
                analyseAreaRes: { totalCount: 0, data: [] },
            });
        }
    };

    onExport = () => {
        const { actId, actTaskName, factoryName, name } = this.actInfo;
        const { pin } = transCookie() || {};
        const companyName = isGy ? pin : factoryName;
        const fileName = `${companyName}_${actTaskName}_${name}[按地区]_${getStrDate(undefined, "YYYYMMDDHHmmss")}.xls`;
        this.callModel("analyseExport", actId ? { fileName } : {});
    };

    /**
     * 分页相关函数
     */
    onPageChange = type => (current, pageSize) => {
        const param = {
            currentPage: type === "current" ? current : 1,
            pageSize,
        };
        this.callModel("queryAnalyseArea", param);
    };

    onTabChange = key => {
        this.callModel("queryAnalyseArea", { provinceOrCity: key, currentPage: 1, pageSize: 10 });
    };

    renderText = ({ text, title }) => (
        <div className = {styles.card}>
            {text}
            <Tooltip placement = "top" title = {title}>
                <div className = {styles.icon}>
                    <Icon type = "question-circle" />
                </div>
            </Tooltip>
        </div>
    );

    renderBaseCard = otherData => {
        const newFieldArr = isGy ? fieldArrGy : fieldArr;
        return (
            <div>
                <Row gutter = {16}>
                    {newFieldArr.map(({ field, text, title }) => (
                        <Col span = {6} key = {UUID()} style = {{ marginBottom: 10 }}>
                            <Card title = {this.renderText({ text, title })} bordered>
                                {otherData[field] || typeof otherData[field] !== "undefined" ? otherData[field] : "--"}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    };

    renderBaseInfo = () => {
        const { analysisBaseInfo: { actName, actType, actStartTime, actEndTime, ...otherData } = {} } = this.props;
        return (
            <div className = {styles["base-info"]}>
                <Descriptions>
                    <Descriptions.Item className = {styles.actName} label = "活动名称">
                        {actName}
                    </Descriptions.Item>
                    <Descriptions.Item label = "活动时间">{`${getStrDate(actStartTime)}~${getStrDate(actEndTime)}`}</Descriptions.Item>
                </Descriptions>
                {this.renderBaseCard(otherData)}
            </div>
        );
    };

    renderBtn = () => {
        const {
            analyseAreaRes: { data },
        } = this.props;
        const disabled = !Array.isArray(data) || (Array.isArray(data) && !data.length);
        return (
            <Button onClick = {this.onExport} disabled = {disabled} type = "primary" icon = "download">
                下载数据
            </Button>
        );
    };

    renderTable = () => {
        const { loading } = this.state;
        const {
            analyseAreaRes: { data, totalCount: total },
            analyseAreaParam: { currentPage: current, pageSize, provinceOrCity },
        } = this.props;
        let columns = provinceOrCity === "province" ? provinceCols : cityCols;
        if (isGy) {
            columns = columns.filter(item => !item.hideGy);
        }
        return (
            <ComplexTable
                dataSource = {data}
                columns = {columns}
                pagination = {{
                    ...this.customPageObj,
                    ...{ current, pageSize },
                    total,
                }}
                scroll = {{ x: 800 }}
                loading = {loading}
                size = "small"
                bordered
                rowKey = "id"
            />
        );
    };

    getMapData = () => {
        const {
            analyseAreaRes: { data },
            analyseAreaParam: { provinceOrCity },
        } = this.props;
        const field = provinceOrCity === "province" ? "province" : "city";
        const idField = provinceOrCity === "province" ? "provinceId" : "cityId";
        if (Array.isArray(data) && data.length) {
            return data.map(({ [field]: mapName, displayDays = 0, [idField]: id }) => ({ name: mapName, value: displayDays, id }));
        }
        return [];
    };

    renderList = () => {
        const mapData = this.getMapData();
        return (
            <div>
                <div className = {styles.title}>门店陈列天数分布</div>
                <Row gutter = {24}>
                    <Col span = {10}>
                        <div>
                            <GeoMap data = {mapData} />
                        </div>
                    </Col>
                    <Col span = {14}>
                        <Tabs tabBarExtraContent = {this.renderBtn()} type = "card" onChange = {this.onTabChange}>
                            <TabPane tab = "省份" key = "province">
                                {this.renderTable()}
                            </TabPane>
                            <TabPane tab = "城市" key = "city">
                                {this.renderTable()}
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>
            </div>
        );
    };

    setCurSearch = ele => {
        this.curSearch = ele;
    };

    callModel = (type, data = {}, callback) => {
        dispatch({
            type: `displayAnalyse/${type}`,
            payload: data,
            callback,
        });
    };

    getMarginTop = () => {
        const height = this.searchHeight || 0;
        return { marginTop: `${height}px` };
    };

    render() {
        const { location } = this.props;

        const searchStyle = this.getMarginTop();
        return (
            <div className = {styles["display-analyse"]}>
                <Affix offsetTop = {0}>
                    <PullSearch dispatch = {dispatch} location = {location} searchFun = {this.getUrlParam} onRef = {this.setCurSearch} parContext = {this} />
                </Affix>
                <div className = {styles.content} style = {searchStyle}>
                    {this.renderBaseInfo()}
                    {this.renderList()}
                </div>
            </div>
        );
    }
}

export default DisplayAnalysis;
