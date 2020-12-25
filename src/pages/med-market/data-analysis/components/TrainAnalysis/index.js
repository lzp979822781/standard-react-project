import React, { Component } from "react";
import { connect } from "dva";
import { Row, Col, Tabs, Button, Descriptions, Card, Tooltip, Icon, Affix } from "antd";
import TrainAnalySearch from "./TrainAnalySearch";
import GeoMap from "@/components/chart";
import ComplexTable from "@/components/ComplexTable";
import { genPageObj, getStrDate, UUID, err, isGy, transCookie } from "@/utils/utils";
import { provinceCols, cityCols, fieldArr, getActType } from "./commonData";

import styles from "./index.less";

const { TabPane } = Tabs;

let dispatch;
@connect(({ trainSale, loading }) => ({
    ...trainSale,
    loading,
}))
class TrainAnalysis extends Component {
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

    componentWillUnmount() {}

    getUrlParam = () => {
        const {
            location: {
                query: { id, type },
            },
        } = this.props;
        this.setState({ id, type: type ? parseInt(type, 10) : 4 }, () => {
            if (id) {
                this.queryAct();
            }
        });
    };

    queryAct = () => {
        const { id, type } = this.state;
        this.callModel("queryActs", { id, type }, (res = {}) => {
            this.failCallback(res);
            const { data } = res;
            if (data) {
                const { actId, actTaskId, venderId: factoryVenderId } = data;
                const baseReq = { actId, actTaskId, factoryVenderId };
                this.callModel("queryBaseInfo", baseReq, this.comCallback);
                this.callModel("queryAnalyseArea", {}, this.comCallback);
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
        if (!isGy) {
            this.callModel("initSearch", facReq, ({ data: { result } = {} }) => {
                if (Array.isArray(result) && result.length) {
                    this.initCompany(result);
                }
            });
        }

        this.queryTask(data);
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
                actBaseInfo: {},
                analyseAreaRes: { totalCount: 0, data: [] },
            });
        }
    };

    comCallback = ({ msg, type }) => {
        if (type === "error") {
            err(msg);
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

    /**
     * 每次切换Tab页需要
     * @param {string} key province|city
     */
    onTabChange = key => {
        this.callModel("queryAnalyseArea", { provinceOrCity: key, currentPage: 1, pageSize: 10 });
    };

    getLoading = () => {
        const { loading: { effects: { "trainSale/queryAnalyseArea": loading } = {} } = {} } = this.props;
        return loading;
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

    renderBaseCard = otherData => (
        <div>
            <Row gutter = {[16, 16]}>
                {fieldArr.map(({ field, text, title = "" }) => (
                    <Col span = {4} key = {UUID()}>
                        <Card title = {this.renderText({ text, title })} bordered>
                            {otherData[field] ? otherData[field] : ""}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );

    renderBaseInfo = () => {
        const { actBaseInfo: { actName, actType, actStartTime, actEndTime, ...otherData } = {} } = this.props;
        return (
            <div className = {styles["base-info"]}>
                <Descriptions>
                    <Descriptions.Item className = {styles.actName} label = "活动名称">
                        {actName}
                    </Descriptions.Item>
                    <Descriptions.Item label = "活动时间">{`${getStrDate(actStartTime)}~${getStrDate(actEndTime)}`}</Descriptions.Item>
                    <Descriptions.Item label = "培训类型">{getActType(actType)}</Descriptions.Item>
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
        const {
            analyseAreaRes: { data, totalCount: total },
            analyseAreaParam: { currentPage: current, pageSize, provinceOrCity },
        } = this.props;
        const columns = provinceOrCity === "province" ? provinceCols : cityCols;

        return (
            <ComplexTable
                dataSource = {data}
                columns = {columns}
                pagination = {{
                    ...this.customPageObj,
                    ...{ current, pageSize },
                    total,
                }}
                scroll = {{ x: isGy ? 980 : 1100 }}
                bordered
                rowKey = "id"
                size = "small"
                loading = {this.getLoading()}
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
            return data.map(({ [field]: mapName, finishNum = 0, [idField]: id }) => ({ name: mapName, value: finishNum, id }));
        }
        return [];
    };

    renderList = () => {
        const mapData = this.getMapData();
        return (
            <div>
                <div className = {styles.title}>活动达成人次分布</div>
                <Row gutter = {24}>
                    <Col span = {10}>
                        <GeoMap data = {mapData} />
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
            type: `trainSale/${type}`,
            payload: data,
            callback,
        });
    };

    render() {
        const { location } = this.props;
        return (
            <div className = {styles["train-analysis"]}>
                {/* <div className = {styles.search} ref = {this.setSearchRef}>
                    <TrainAnalySearch dispatch = {dispatch} location = {location} searchFun = {this.getUrlParam} onRef = {this.setCurSearch} />
                </div> */}
                <Affix offsetTop = {0}>
                    <TrainAnalySearch dispatch = {dispatch} location = {location} searchFun = {this.getUrlParam} onRef = {this.setCurSearch} parContext = {this} />
                </Affix>
                <div className = {styles.content}>
                    {this.renderBaseInfo()}
                    {this.renderList()}
                </div>
            </div>
        );
    }
}

export default TrainAnalysis;
