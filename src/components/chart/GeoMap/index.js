import React, { Component } from "react";
// import ReactEcharts from "echarts-for-react";
import echarts from "echarts";
import "echarts/map/js/china";
// import geoJson from "echarts/map/json/china.json";
// import geoJson from './fullGeo.json';
import { geoCoordMap, provienceData, idMap } from "./geo";

// const newGeoJson = genNewGeoson(geoJson);

const defaultProps = {
    data: provienceData,
    rowKey: "id",
    title: "地域分布",
};
let context;
class GeoMap extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        context = this;
    }

    static getDerivedStateFromProps(nextProps) {
        const { data } = nextProps;
        context.refreshOpt(data);
        return {};
    }

    componentDidMount() {
        this.initMap();
        window.addEventListener("resize", this.handleResize, false);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize, false);
    }

    handleResize = () => {
        this.myChart.resize();
        // this.initMap();
    };

    initMap = () => {
        // echarts.registerMap("china", newGeoJson);
        // echarts.registerMap("china", geoJson);
        const chinaMap = document.getElementById("chinaMap");
        if (chinaMap) {
            this.myChart = echarts.init(chinaMap);
            this.myChart.setOption(this.genOpt(), true);
        }
    };

    convertData = arr => {
        const res = arr.map(item => {
            const { name, area, type } = item;
            const geoCoord = geoCoordMap[name];
            return geoCoord ? { name, area, type, value: geoCoord.concat(area) } : undefined;
        });
        /* const res = [];
        for (let i = 0; i < data.length; i++) {
            const geoCoord = geoCoordMap[data[i].name];
            if (geoCoord) {
                res.push({
                    name: data[i].name,
                    value: geoCoord.concat(data[i].area),
                    area: data[i].area,
                    type: data[i].type,
                });
            }
        }
        console.log(res);
        return res; */
        return res.filter(item => item);
    };

    convertMap = () => {
        const { data, rowKey } = this.props;
        if (Array.isArray(data) && data.length) {
            return data.map(item => {
                const { [rowKey]: id, name, ...other } = item;
                return idMap[id] ? Object.assign({}, other, { name: idMap[id] }) : { name, ...other };
            });
        }

        return [];
    };

    transValue = value => {
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(value)) return "--";
        return typeof value === "number" ? value : "--";
    };

    genOpt = () => {
        const that = this;
        const { data, min = 0, max = 20000, title } = this.props;
        const mapArr = this.convertMap();
        const convertData = this.convertData(mapArr);
        const option = {
            /* title: {
                text: title,
                left: "center",
            }, */
            tooltip: {
                trigger: "item", // 触发类型,'item'数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
                // 'axis'坐标轴触发，主要在柱状图，折线图等会使用类目轴的图表中使用。
                triggerOn: "mousemove", // 提示框触发的条件,'mousemove'鼠标移动时触发。'click'鼠标点击时触发。'mousemove|click'同时鼠标移动和点击时触发。'none'不在
            },
            legend: {
                orient: "vertical",
                left: "center",
                data: ["地域分布"],
                textStyle: {
                    fontSize: 20,
                },
            },
            visualMap: {
                min,
                max,
                left: "left",
                top: "bottom",
                text: ["高", "低"], // 文本，默认为数值文本
                calculable: true,
            },
            dataRange: {
                orient: "vertical",
                min: 0,
                max: 5000,
                text: ["高", "低"], // 文本，默认为数值文本
                splitNumber: 0,
                color: ["#6F40CC", "#AF94E1", "#D8CCF2"],
            },
            grid: {
                left: "10%",
                right: "10%",
                // top: "10%",
                bottom: "10%",
                containLabel: true,
            },
            geo: {
                map: "china",
                roam: false,
                zoom: 1.2,
                label: {
                    normal: {
                        show: false, // 显示省份标签
                        textStyle: { color: "#c71585" }, // 省份标签字体颜色
                    },
                    emphasis: {
                        // 对应的鼠标悬浮效果
                        show: false,
                        textStyle: { color: "#800080" },
                    },
                },
                itemStyle: {
                    normal: {
                        borderWidth: 0.5, // 区域边框宽度
                        borderColor: "#000", // 区域边框颜色
                        areaColor: "#ffefd5", // 区域颜色
                    },
                    emphasis: {
                        areaColor: "#F3B329",
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowBlur: 20,
                        borderWidth: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                },
            },
            series: [
                {
                    type: "scatter", // 'line'（折线图） | 'bar'（柱状图） | 'scatter'（散点图） | 'k'（K线图）
                    // 'pie'（饼图） | 'radar'（雷达图） | 'chord'（和弦图） | 'force'（力导向布局图） | 'map'（地图）
                    coordinateSystem: "geo",
                    data: convertData,
                    symbolSize: 3,
                    symbolRotate: 40,
                    label: {
                        normal: {
                            formatter: "{b}",
                            position: "top",
                            show: true,
                        },
                        emphasis: {
                            show: false,
                        },
                    },
                    tooltip: {
                        show: true, // 不显示提示标签
                        formatter({ name }) {
                            const item = data.filter(({ name: itemName }) => itemName === name);
                            const value = Array.isArray(item) && item.length ? that.transValue(item[0].value) : "--";
                            return `${name}: ${value}`;
                        }, // 提示标签格式
                        backgroundColor: "#fff", // 提示标签背景颜色
                        borderColor: "#ccc",
                        borderWidth: 5,
                        textStyle: { color: "#000" }, // 提示标签字体颜色
                    },
                    itemStyle: {
                        normal: {
                            color: "black",
                        },
                    },
                },
                {
                    name: title,
                    type: "map",
                    mapType: "china",
                    roam: false,
                    zoom: 1.2,
                    label: {
                        normal: {
                            show: false, // 显示省份标签
                        },
                        emphasis: {
                            show: false,
                        },
                    },
                    itemStyle: {
                        normal: {
                            borderWidth: 0.5, // 区域边框宽度
                            borderColor: "#fff", // 区域边框颜色
                            label: { show: false },
                            color: "#6F40CC", // 地图背景颜色
                            areaStyle: { color: "#9fd7dd" },
                            // areaColor: '#323c48'
                        },
                        emphasis: {
                            show: false,
                        },
                    },
                    // geoIndex: 0,
                    // 引入上边的tooltip属性切记这块必须要，不然上边的tooltip不生效
                    // tooltip主要功能是放在地图的每一个区域上可以弹出框
                    tooltip: {
                        show: true,
                        formatter({ name, value }) {
                            return `${name}: ${that.transValue(value)}`;
                        }, // 提示标签格式
                    },
                    data,
                },
            ],
        };
        return Object.assign({}, option);
    };

    refreshOpt = data => {
        const { myChart } = this;
        if (myChart) {
            // 刷新数据
            const currentOpt = myChart.getOption();
            currentOpt.series[1].data = data;
            // myChart.setOption(currentOpt);
            myChart.setOption(this.genOpt(), true);
        }
    };

    render() {
        return (
            <div>
                <div id = "chinaMap" style = {{ width: "100%", minHeight: "400px" }} />
            </div>
        );
    }
}

GeoMap.defaultProps = defaultProps;

export default GeoMap;
