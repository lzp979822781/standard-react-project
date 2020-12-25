/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-globals */
import moment from "moment";
import React from "react";
import { message, Modal, notification, Alert } from "antd";
import nzh from "nzh/cn";
import { parse, stringify } from "qs";
import cloneDeep from "lodash/cloneDeep";
// import omit from "lodash/omit";
// import pick from "lodash/pick";

const MessageWrapper = (type, msg) => message[type](msg, 2);
export { MessageWrapper };

export function fixedZero(val) {
    return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;

    if (type === "today") {
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        return [moment(now), moment(now.getTime() + (oneDay - 1000))];
    }

    if (type === "week") {
        let day = now.getDay();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);

        if (day === 0) {
            day = 6;
        } else {
            day -= 1;
        }

        const beginTime = now.getTime() - day * oneDay;

        return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
    }

    if (type === "month") {
        const year = now.getFullYear();
        const month = now.getMonth();
        const nextDate = moment(now).add(1, "months");
        const nextYear = nextDate.year();
        const nextMonth = nextDate.month();

        return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
    }

    const year = now.getFullYear();
    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = "") {
    const arr = [];
    nodeList.forEach(node => {
        const item = node;
        item.path = `${parentPath}/${item.path || ""}`.replace(/\/+/g, "/");
        item.exact = true;
        if (item.children && !item.component) {
            arr.push(...getPlainNode(item.children, item.path));
        } else {
            if (item.children && item.component) {
                item.exact = false;
            }
            arr.push(item);
        }
    });
    return arr;
}

export function digitUppercase(n) {
    return nzh.toMoney(n);
}

function getRelation(str1, str2) {
    if (str1 === str2) {
        console.warn("Two path are equal!"); // eslint-disable-line
    }
    const arr1 = str1.split("/");
    const arr2 = str2.split("/");
    if (arr2.every((item, index) => item === arr1[index])) {
        return 1;
    }
    if (arr1.every((item, index) => item === arr2[index])) {
        return 2;
    }
    return 3;
}

function getRenderArr(routes) {
    let renderArr = [];
    renderArr.push(routes[0]);
    for (let i = 1; i < routes.length; i += 1) {
        // 去重
        renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
        // 是否包含
        const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
        if (isAdd) {
            renderArr.push(routes[i]);
        }
    }
    return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
    let routes = Object.keys(routerData).filter(routePath => routePath.indexOf(path) === 0 && routePath !== path);
    // Replace path to '' eg. path='user' /user/name => name
    routes = routes.map(item => item.replace(path, ""));
    // Get the route to be rendered to remove the deep rendering
    const renderArr = getRenderArr(routes);
    // Conversion and stitching parameters
    const renderRoutes = renderArr.map(item => {
        const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
        return {
            exact,
            ...routerData[`${path}${item}`],
            key: `${path}${item}`,
            path: `${path}${item}`,
        };
    });
    return renderRoutes;
}

export function getPageQuery() {
    return parse(window.location.href.split("?")[1]);
}

export function getQueryPath(path = "", query = {}) {
    const search = stringify(query);
    if (search.length) {
        return `${path}?${search}`;
    }
    return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
    return reg.test(path);
}

export function formatWan(val) {
    const v = val * 1;
    if (!v || Number.isNaN(v)) return "";

    let result = val;
    if (val > 10000) {
        result = Math.floor(val / 10000);
        result = (
            <span>
                {result}
                <span
                    style = {{
                        position: "relative",
                        top: -2,
                        fontSize: 14,
                        fontStyle: "normal",
                        marginLeft: 2,
                    }}
                >
                    万
                </span>
            </span>
        );
    }
    return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
    return window.location.hostname === "preview.pro.ant.design";
}

/**
 * 表单布局配置项
 */
export const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
        lg: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
        lg: { span: 16 },
    },
};

/**
 * 根据传入的blob对象生成URL
 * @param {*} blob
 * @returns url
 */
export function getUrlFromBlob(blob) {
    const url = window.URL || window.webkitURL;
    return url.createObjectURL(blob);
}

export const pageObj = {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: total => `共${total}条`,
    pageSize: 10,
    position: "bottom",
};

export function genPageObj(context, reqParam) {
    const {
        onPageChange,
        props: { [reqParam]: { total = 10, current = 1 } = {} },
    } = context;
    return {
        defaultCurrent: 1,
        defaultPageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: totalNum => `共${totalNum}条`,
        pageSize: 10,
        position: "bottom",
        onChange: onPageChange("current"),
        onShowSizeChange: onPageChange("pageSize"),
        total,
        current,
    };
}

const errUrl = "https://static.360buyimg.com/yao_static/lib/man/img/pcIndex/error.svg";
const emptyUrl = "https://static.360buyimg.com/yao_static/lib/man/img/yzd/resultnon.png";

export function genPmpt(global, url) {
    // eslint-disable-next-line no-underscore-dangle
    const { error } = global;
    const imgUrl = error[url] ? errUrl : emptyUrl;
    const text = error[url] ? error[url] : "暂无数据";
    return {
        imgUrl,
        text,
    };
}

export function genUrlObj(URL) {
    const newUrl = {};

    Object.keys(URL).forEach(key => {
        newUrl[key] = URL[key].replace(/\//g, "");
    });

    return newUrl;
}

// 单列单行布局
const singleColRow = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
        md: { span: 6 },
        lg: { span: 6 },
        xl: { span: 6 },
        xxl: { span: 6, offset: 3 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
        lg: { span: 12 },
        xl: { span: 12 },
        xxl: { span: 8 },
    },
};

// 单列多行布局
const singleColMultiRow = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
        xl: { span: 6, offset: 9 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12, offset: 6 },
        xl: { span: 6, offset: 9 },
    },
};

// 多列多行form布局
const multiColRow = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
        lg: { span: 8 },
        md: { span: 8 },
        xxl: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        md: { span: 12 },
        lg: { span: 12 },
        // xl: { span: 14, },
        xxl: { span: 14 },
    },
};

// 合作管理
const magColRow = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        lg: { span: 12 },
        md: { span: 12 },
        xxl: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
        lg: { span: 12 },
        // xl: { span: 14, },
        xxl: { span: 14 },
    },
};

// 多列多行组合项col布局
const containerLayout = {
    xs: { span: 24 },
    md: { span: 12 },
    lg: { span: 12 },
    xl: { span: 8 },
    xxl: { span: 8 },
};

export { singleColRow, singleColMultiRow, multiColRow, containerLayout, magColRow };

/**
 * 将数字转换成千分位展示
 *
 * @param {*} num 传入的数字。必选
 * @param {*} places 小数点的位数。可选，默认为两位小数
 * @param {*} symbol 数字最后的符号 。可选，默认为美元字符“￥”
 * @param {*} thousand 千分位分隔符。可选，默认为“，”
 * @param {*} decimal 小数位分隔符。可选，默认为“.”
 * @returns
 */
function formatMoney(num, place, sym, thousand = ",", decimal = ".") {
    let number = num || 0;
    const places = typeof Math.abs(place) === "number" ? place : 2;
    const symbol = sym !== undefined ? sym : "元";
    const negative = number < 0 ? "-" : "";
    const i = `${parseInt((number = Math.abs(+number || 0).toFixed(places)), 10)}`;
    const j = i.length > 3 ? i.length % 3 : 0;
    return (
        negative +
        (j ? i.substr(0, j) + thousand : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thousand}`) +
        (places
            ? decimal +
              Math.abs(number - i)
                  .toFixed(places)
                  .slice(2)
            : "") +
        symbol
    );
}

/**
 * 将数值四舍五入后格式化.
 *
 * @param num 数值(Number或者String)
 * @param cent 要保留的小数位(Number)
 * @param isThousand 是否需要千分位 0:不需要,1:需要(数值类型);
 * @return 格式的字符串,如'1,234,567.45'
 * @type String
 */
function formatNum(money = 0, cent = 2, isThousand = 1) {
    let num = money.toString().replace(/\$|\,/g, "");

    // 检查传入数值为数值类型
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(num)) num = "0";

    // 获取符号(正/负数)
    // eslint-disable-next-line eqeqeq
    const sign = num == (num = Math.abs(num));

    num = Math.floor(num * 10 ** cent + 0.50000000001); // 把指定的小数位先转换成整数.多余的小数位四舍五入
    let cents = num % 10 ** cent; // 求出小数位数值
    num = Math.floor(num / 10 ** cent).toString(); // 求出整数位数值
    cents = cents.toString(); // 把小数位转换成字符串,以便求小数位长度

    // 补足小数位到指定的位数
    while (cents.length < cent) cents = `0${cents}`;

    if (isThousand) {
        // 对整数部分进行千分位格式化.
        for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i += 1) num = `${num.substring(0, num.length - (4 * i + 3))},${num.substring(num.length - (4 * i + 3))}`;
    }

    if (cent > 0) return `${(sign ? "" : "-") + num}.${cents}`;
    return (sign ? "" : "-") + num;
}

/**
 * 按照某个字段将数组拆分为平级结构
 * @param {Array} arr 要拆分的数组
 * @param {Array|string} field1 要拆分的数组字段,重要程度按照降序排列
 * @param {*} field2
 * @returns
 */
function splitData(arr, field1, field2) {
    const resArr = [];
    const isArray = Array.isArray(arr);

    if (isArray) {
        const cloneArr = cloneDeep(arr.map((item, index) => ({ ...item, rowIndex: index + 1 })));
        cloneArr.map(item => {
            const isArr = Array.isArray(item[field1]) && item[field1].length;
            const isTimeArr = Array.isArray(item[field2]) && item[field1].length;

            if (!isArr) {
                resArr.push(
                    Object.assign({}, item, {
                        _id: item.id,
                        length: 1,
                    })
                );
            } else {
                item[field1].map((temp, childIndex, currentArr) => {
                    const lenObj = childIndex === 0 ? { length: currentArr.length } : { length: 0 };
                    const resItem = Object.assign(
                        {},
                        item,
                        {
                            _id: `${item.id}${childIndex}`,
                            paticipatedActs: temp,
                            actTime: isTimeArr ? item[field2][childIndex] : item[field2],
                        },
                        lenObj
                    );
                    resArr.push(resItem);
                    return temp;
                });
            }
            return item;
        });
        return resArr;
    }

    return arr;
}

function range(start, end) {
    const result = [];
    // eslint-disable-next-line no-plusplus
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}

const format = "YYYY-MM-DD HH:mm:ss";
const normalFormat = "YYYY-MM-DD HH:mm:ss";

/**
 *
 *
 * @param {boolean} isCurrentDay 开始时间初始化，传入true,则根据指定format初始化为当天当前时间点， false则将开始时间初始化为传入startTime的0点
 * @param {*} startTime 传入的起始时间
 * @param {*} endTime 传入的结束时间
 * @param {*} [tempFormat=format]
 * @returns
 */
function genTime(isCurrentDay, startTime, endTime, tempFormat = format) {
    return {
        startTime: isCurrentDay ? moment().format(tempFormat) : startTime.startOf("day").format(tempFormat),
        endTime: endTime.endOf("day").format(tempFormat),
    };
}

/**
 * 将moment对象转换为指定日期格式的日期字符串
 * @param {moment|Array[moment]} time time为转换的时间, 可以为
 * @param {*} format
 */

function getTime(time, tempFormat = format) {
    // 校验传入的参数是否是moment对象或者moment对象数组
    const isArray = Array.isArray(time);
    const isValid = isArray ? time.every(item => moment.isMoment(item)) : moment.isMoment(time);
    if (!isValid) {
        MessageWrapper("error", "invalid time");
        return false;
    }

    // 数组返回
    if (isArray) {
        // 判断时间是否相等
        const [startTime, endTime] = time;
        const isSameDay = startTime.isSame(endTime, "day");
        const isCurrentDay = startTime.isSame(moment(), "day");
        if (isSameDay) return genTime(isCurrentDay, startTime, endTime, tempFormat);
        return genTime(false, startTime, endTime, tempFormat);
    }

    // 非数组返回
    return time.format(tempFormat);
}

function initText(text) {
    return (
        (typeof text !== "undefined" && {
            initialValue: typeof text === "string" ? text.trim() : text,
        }) ||
        {}
    );
}

/**
 * 将传入进来的时间戳或者时间字符串转换为moment对象或者moment数组
 * @param {moment| Array[moment] } time 待处理的时间
 * @param {string} format 时间格式
 */
function initTime(time) {
    const isArray = Array.isArray(time);
    const isUndefined = isArray ? time.some(item => typeof item === "undefined") : typeof time === "undefined";
    let res;
    if (isArray) {
        res = time.map(item => moment(item));
    } else {
        res = moment(time);
    }
    return (!isUndefined && { initialValue: res }) || {};
}

// 模糊搜索类型处理
function initFuzzy(value) {
    const { key, label } = value;
    let res;
    if (key) {
        res = (label && value) || { key, label: "你好" };
    } else {
        res = { key: "", label: "" };
    }

    const returnVal = key ? { initialValue: res } : {};
    return returnVal;
}

// 初始化类型与处理方法映射对象
const valObj = {
    time: initTime,
    text: initText,
    fuzzy: initFuzzy,
};

/**
 * genInitVal获取初始值 其中fuzzy类型的传值为{ type: fuzzy, value: { key: '', lable: ''}}
 * @param {Object} { type, value }
 * @returns {Object} { initialValue: value }
 */
function genInitVal({ type, value }) {
    return (type && valObj[type](value)) || valObj.text(value);
}

// 判断当前数字是否是浮点型

function delSurpDot(value, index) {
    return value.replace(/\./g, (char, $index) => ($index > index ? "" : "."));
}

/**
 * 按照精度进行值转换
 * @param {*} value
 * @param {*} bits
 * @returns {Number}
 */
function transAsPrecision(value, bits) {
    const tempVal = parseFloat(value);
    if (!isNaN(tempVal)) {
        const preciseVal = parseFloat(tempVal.toFixed(bits));
        return preciseVal;
    }

    return tempVal;
}

function isBeyond(trimVal, bits) {
    const [prev, last] = trimVal.split(".");
    return last && last.length > bits ? [prev, last] : false;
}

function isLessBits(trimVal, bits) {
    const [, last] = trimVal.split(".");
    const lastIndexZero = last.lastIndexOf("0");
    return trimVal.endsWith("0") && lastIndexZero > -1 && lastIndexZero < bits - 1;
}

function joinBitsStr(trimVal, bits) {
    const status = isBeyond(trimVal, bits);
    if (status) {
        const [prev, last] = status;
        const bitsCutStr = last.slice(0, bits);
        return `${prev}.${bitsCutStr}`;
    }

    return trimVal;
}

function uniqDotTrans(trimVal, bits, dotFirstIndex) {
    const parseVal = parseFloat(trimVal);
    /* if( dotFirstIndex > -1 && dotFirstIndex === trimVal.length - 1) {
        // 有小数的情况下，小数最后一位是0也应该返回原值
        return trimVal;
    } */
    const idEndWithDot = dotFirstIndex > -1 && trimVal.endsWith(".");
    const isEndEithZero = dotFirstIndex > -1 && isLessBits(trimVal, bits);
    if (idEndWithDot || isEndEithZero) {
        return trimVal;
    }

    if (parseVal.toString() === trimVal || !isNaN(parseVal)) {
        // 判断小数点后的位数是否超出了精度，第一个判断条件排除.00这种情况
        return parseFloat(dotFirstIndex < 0 ? trimVal : joinBitsStr(trimVal, bits));
    }
    return trimVal; // 如果只有一个点，不做处理直接返回
}

const transMoney = bits => e => {
    e.persist();
    // eslint-disable-next-line prefer-destructuring
    const value = e.target.value;
    // trim illegal value
    const trimVal = value.replace(/[^0-9\.]/g, "");
    if (!trimVal) {
        return undefined;
    }
    const dotFirstIndex = trimVal.indexOf(".");
    // 如果只有一个点初始化为精度值
    if (dotFirstIndex === trimVal.lastIndexOf(".")) {
        // return 1 / (10 ** bits);
        return uniqDotTrans(trimVal, bits, dotFirstIndex);
    }
    let singleDotVal;
    if (dotFirstIndex > -1 && trimVal.lastIndexOf(".") !== dotFirstIndex) {
        // 包含多个点时进行替换
        singleDotVal = delSurpDot(trimVal, dotFirstIndex);
    }

    if (singleDotVal) return singleDotVal;

    const finalTextVal = singleDotVal || trimVal;
    const validVal = transAsPrecision(finalTextVal, bits);

    /*     const parseVal = parseFloat(trimVal);
    if(!isNaN(parseVal)) {
        return trimVal;
    } */
    /*     console.log("replace value", e.target.value.replace(/[e+-]/g, ''));
    const value = parseFloat(e.target.value.replace(/[e+-]/g, ''));
    const tempVal = value.toFixed(bits);
    console.log("tempVal parseFloat(tempVal)", tempVal, parseFloat(tempVal) );
    if(!isNaN(value)) {
        return typeof bits === 'number' ? parseFloat(value.toFixed(bits)) * (10 ** bits) / (10 ** bits) : value;
    } */

    // return singleDotVal || trimVal;
    return validVal;
};

export { formatMoney, formatNum, splitData, range, getTime, normalFormat, genInitVal, transMoney };

function UUID() {
    const s = [];
    const hexDigits = "0123456789abcdef";
    for (let i = 0; i < 36; i += 1) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    // eslint-disable-next-line no-bitwise
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);

    s[8] = "-";
    s[13] = "-";
    s[18] = "-";
    s[23] = "-";

    const uuid = s.join("");
    return uuid;
}

function isNull(param) {
    return typeof param === "undefined" || param === null || param === "";
}

function isObjNull(param) {
    if (isNull(param)) return true;
    const type = Object.prototype.toString.call(param);
    if (type === "[object Object]") return Object.keys(param).length === 0;
    if (type === "[object Array]") return type.length === 0;
    return false;
}

export { UUID, isNull, isObjNull };

/**
 * 奖励校验，分两种情况如果每行只有一个输入项 只进行行间校验，如果有两个输入，既要校验行间也要校验行内
 * @param {Object} colFieldObj { min: 'name', max: 'address'} 或者 { min: 'name'}
 * @memberof FormPage
 */
const ruleObj = {
    empty: "请输入相关内容",
    noRule: "请输入验证规则",
    rowRule: "当前行的值应该大于上一行的值",
};

/**
 * @param {*} val 当前字段值
 * @param {*} { min, max }
 */
const colValidate = (val, callback, { min, max }) => {
    let isPass = true;
    val.forEach(item => {
        if (!item[max] || !item[min]) {
            callback("请输入必填项");
            isPass = false;
        } else if (item[max] < item[min]) {
            isPass = false;
        }
    });

    return isPass;
};

const rowValidate = (val, callback, { min, max }) => {
    let isPass = true;
    val.forEach((item, index, arr) => {
        if (index > 0 && item[min] <= arr[index - 1][max]) isPass = false;
    });
    return isPass;
};

const handleValidator = colFieldObj => (rule, val, callback) => {
    if (isObjNull(val)) callback(ruleObj.empty);
    if (!colFieldObj) callback(ruleObj.noRule);
    const { min, max } = colFieldObj;
    if (!max) {
        // 表明只有行间校验
        const isValNull = val.some(item => isNull(item[min]));
        if (isValNull) {
            callback("请填写必输项");
        }
        const isRowValPass = rowValidate(val, { min, max: min });
        if (!isRowValPass) {
            callback(ruleObj.rowRule);
        }
    } else {
        // 行内校验
        const isValNull = val.some(item => isNull(item[min]) || isNull(item[max]));
        if (isValNull) {
            callback("请填写必输项");
        }
        const isColValPass = colValidate(val, callback, { min, max });
        const isRowValPass = rowValidate(val, callback, { min, max });
        if (!isColValPass) {
            callback(`同行内${max}的值应该大于${min}`);
        } else if (!isRowValPass) callback(ruleObj.rowRule);
    }

    callback();
};

const titleRule = /^.{5,15}$/;
const contentRule = /^.{10,30}$/;

const validate = field => ({
    trainContent: (rule, val, callback) => {
        if (isObjNull(val)) {
            callback("请填写必输项");
        }
        const isUndefined = val.some(item => {
            const { title, content } = item[field] || {};
            return isObjNull(item) || isNull(title) || isNull(content);
        });

        if (isUndefined) callback("请填写必输项");

        const isTitleNull = val.some(item => !titleRule(item[field]));
        if (isTitleNull) callback("请输入5到15个字符的标题文本");
        const isContentNull = val.some(item => !contentRule(item[field]));
        if (isContentNull) callback("请输入10到30个字符的内容文本");
        callback();
    },
});

export { handleValidator, validate };

/**
 * 城市组件数据转换
 * @param {Array} data
 * @returns {Array}
 */
function transformData(data) {
    const isArray = Array.isArray(data);
    let resArr = [];

    if (!isArray) return data;
    resArr = data.map(item => {
        const { areaId: value, areaName: title, child, ...otherProps } = item;
        let childObj = {};
        if (Array.isArray(child)) {
            const children = transformData(child);
            childObj = Object.assign({}, { children });
        }

        const resItem = Object.assign({}, otherProps, { value, key: value, title }, childObj);

        return resItem;
    });

    return resArr;
}

function filterID(data) {
    const isArray = Array.isArray(data);
    let resArr = [];

    if (!isArray) return data;
    data.map(item => {
        const { areaId: value, child } = item;
        resArr.push(value);
        // 如果全选只提交第一级数据的话，则不必进行children遍历
        if (Array.isArray(child)) {
            const children = filterID(child);
            resArr = resArr.concat(children);
        }
        return item;
    });
    return resArr;
}

function diffLayerFilter(data, paramLevel) {
    const isArray = Array.isArray(data);
    let resArr = [];

    if (!isArray) return data;
    data.map(item => {
        const { areaId: value, child, level } = item;
        // eslint-disable-next-line eqeqeq
        if (level == paramLevel) {
            resArr.push(value);
        }
        // 如果全选只提交第一级数据的话，则不必进行children遍历
        if (Array.isArray(child)) {
            const children = filterID(child);
            resArr = resArr.concat(children);
        }
        return item;
    });
    return resArr;
}

/* function flatArr(data) {
    return data
        .filter(item => item.child)
        .map(item =>
            item.child.length ? item.child : omit(cloneDeep(item), ["child"])
        )
        .reduce((total, current) => total.concat(current));
}

function filterData(data, filterArr) {
    return data.filter(item => !filterArr.includes(item.areaId));
} */

/* function getInvertIds(data, filterArr) {
    if (!Array.isArray(data) || !Array.isArray(filterArr)) return filterArr;
    // 过滤非选中的一级树数据
    const filterFirstArr = data.filter(
        item => !filterArr.includes(item.areaId)
    );
    const compatFirst =
        Array.isArray(filterFirstArr) && filterFirstArr.length
            ? filterFirstArr
            : data;
    // 平铺二级数据
    const secData = compatFirst
        .filter(item => item.child && item.child.length)
        .map(item => item.child)
        .reduce((total, current) => total.concat(current));
    const filterSecData = secData.filter(
        item => !filterArr.includes(item.areaId)
    );
    const compatSec =
        Array.isArray(filterSecData) && filterSecData.length
            ? filterSecData
            : secData;

    // 平铺三级数据
    const thirdData = flatArr(compatSec);
    const filterTrdData = filterData(thirdData, filterArr);
    const resData =
        Array.isArray(filterTrdData) && filterTrdData.length
            ? filterTrdData.map(item => item.areaId)
            : undefined;
    return resData;
} */

/**
 * 将不含有filterArr中的二三级节点的以及一级节点过滤出来
 * @param {Array} data 遍历的数组
 * @param {Array} filterArr 当前选中的数组
 * @param {Boolean} pureFirst 为true表示获取一级选中数组，为false获取其他数据
 */
function pickUniq(data, filterArr) {
    let isUniq = true;
    // eslint-disable-next-line no-plusplus
    for (let i = 0, len = data.length; i < len; i++) {
        const { areaId, child: itemChild } = data[i];
        if (filterArr.includes(areaId)) {
            isUniq = false;
            break;
        } else if (itemChild && itemChild.length) {
            isUniq = pickUniq(itemChild, filterArr);
        }
    }

    return isUniq;
}

function filterResFirst(data, filterArr, pureFirst) {
    return data.filter(item => {
        let isUniq = true;
        const { areaId, child } = item;
        if (filterArr.includes(areaId)) {
            isUniq = false;
        } else if (child && child.length) {
            isUniq = pickUniq(child, filterArr);
        }

        return pureFirst ? isUniq : !isUniq;
    });
}

function getFlat(data) {
    return data
        .filter(item => item.child && item.child.length)
        .map(item => item.child)
        .reduce((total, current) => total.concat(current));
}

function getInvertIds(data, filterArr) {
    if (!Array.isArray(data) || !Array.isArray(filterArr)) return filterArr;
    // 过滤非选中的一级树数据
    const filterFirstArr = data.filter(item => !filterArr.includes(item.areaId));
    const compatFirst = Array.isArray(filterFirstArr) && filterFirstArr.length ? filterFirstArr : data;

    // 选择一级节点下的子节点不在filterArr的部分
    const resFirst = filterResFirst(compatFirst, filterArr, true);
    const otherFirst = filterResFirst(compatFirst, filterArr, false);

    // 过滤非选中的二级节点，选中的二级节点和当前二级节点下三级节点有选中的二级节点 在otherSec中
    const flatSec = getFlat(otherFirst);
    const resSec = filterResFirst(flatSec, filterArr, true);
    const otherSec = filterResFirst(flatSec, filterArr, false).filter(item => !filterArr.includes(item.areaId));

    // 过滤非选中的三级节点
    const flatThird = getFlat(otherSec);
    const resThird = filterResFirst(flatThird, filterArr, true);

    /*     // 过滤
    console.log("resFirst", resFirst);
    console.log("resSec", resSec);
    // 平铺二级数据
    const secData = compatFirst
        .filter(item => item.child && item.child.length)
        .map(item => item.child)
        .reduce((total, current) => total.concat(current));
    const filterSecData = secData.filter(
        item => !filterArr.includes(item.areaId)
    );
    const compatSec =
        Array.isArray(filterSecData) && filterSecData.length
            ? filterSecData
            : secData;

    // 平铺三级数据
    const thirdData = flatArr(compatSec);
    const filterTrdData = filterData(thirdData, filterArr);
    const resData =
        Array.isArray(filterTrdData) && filterTrdData.length
            ? filterTrdData.map(item => item.areaId)
            : undefined;
    return resData; */

    const resData = [...resFirst, ...resSec, ...resThird].map(item => item.areaId);
    return resData;
}

function toStrIds(data) {
    const isArray = Array.isArray(data);
    let resArr = [];

    if (!isArray) return data;
    resArr = data.map(item => {
        const { areaId, pid, child, ...otherProps } = item;
        let childObj = {};
        if (Array.isArray(child)) {
            const children = toStrIds(child);
            childObj = Object.assign({}, { child: children });
        }

        const resItem = Object.assign({}, otherProps, { areaId: `${areaId}`, key: `${areaId}`, pid: `${pid}` }, childObj);

        return resItem;
    });

    return resArr;
}

export { transformData, filterID, diffLayerFilter, getInvertIds, toStrIds };

function genMsg(result, sucMsg, failMsg) {
    const { msg: resMsg, success = false, data } = result;
    const type = (success && "success") || "error";
    const msg = success ? sucMsg || "请求成功" : resMsg || failMsg || "请求失败";
    const dataObj = (data && { data }) || {};
    return { type, msg, ...dataObj };
}

/**
 * 计算因子
 * @param {Array} data[0]开始时间 data[1]结束时间
 */
function primeFactors(data) {
    const dayArray = [];
    if (data) {
        // 获取日期区间天数
        const days = moment(data[1]).diff(moment(data[0]), "days") + 1;

        // 获取天因子
        for (let i = 1; i <= days; i += 1) {
            if (i * 2 > days) {
                dayArray.push(days);
                break;
            }

            if (days % i === 0) {
                dayArray.push(i);
            }
        }
    }
    return dayArray;
}

export { genMsg, primeFactors };

/**
 * 将字符串 时间戳 时间范围为时间
 * @param {*} data
 */
/* const transStrToMoment = data => {
    if (typeof data === "undefined") return data;
}; */

const tranToMoment = value => (moment.isMoment(value) && value) || moment(value);

const isBefore = (compareTime, refTime, scale = "second") => tranToMoment(compareTime).isBefore(tranToMoment(refTime), scale);
const getStrDate = (date, timeFormat = "YYYY-MM-DD") => moment(date).format(timeFormat);

function formatTime(value) {
    const tempFormat = "YYYY-MM-DD";
    if (value) {
        return value.map(item => moment(item).format(tempFormat));
    }
    return value;
}

export { isBefore, tranToMoment, getStrDate, formatTime };

// 提示信息

const callComModal = type => ({ content, title = "", okText = "确定" }, callback) => {
    Modal[type]({
        title,
        content,
        okText,
        onOk: () => {
            if (callback) callback();
        },
    });
};
const success = (...param) => {
    callComModal("success")(...param);
};

const info = (...param) => {
    callComModal("info")(...param);
};

const err = (des, title = " ") => {
    notification.error({
        message: title,
        description: des,
        placement: "topLeft",
    });
};

const resCallback = (res, fn, msg) => {
    if (res.success) {
        Modal.success({
            title: "",
            content: msg || res.msg,
            okText: "确定",
            onOk: () => {
                if (typeof fn === "function") {
                    fn();
                }
            },
        });
    } else {
        err(res.msg);
    }
};

export { success, err, info, resCallback };

// 导出功能
function transToFile(response, fileName = "导出数据.xls") {
    response.blob().then(blob => {
        const selfURL = window[window.webkitURL ? "webkitURL" : "URL"];
        const url = selfURL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        /* const dispostion = response.headers.get("Content-Disposition");
        if (dispostion) {
            const arr = dispostion.split("=");
            if (arr.length > 1) {
                [, fileName] = arr;
            }
        } */

        a.download = decodeURIComponent(fileName);
        a.click();
        // success({ content: "导出成功" });
    });
}

export { transToFile };

function renderAlert(msg, { type = "info" } = {}) {
    return <Alert message = {msg} type = {type} showIcon banner />;
}

export { renderAlert };

export const isGy = !window.location.href.includes("gyn/m/med-market");
export const urlPrefix = isGy ? "/api/" : "/api/be/";

export const calc = {
    Add(arg1 = 0, arg2 = 0) {
        // eslint-disable-next-line no-unused-expressions
        // eslint-disable-next-line no-param-reassign
        // eslint-disable-next-line no-sequences
        (arg1 = arg1.toString()), (arg2 = arg2.toString());
        const arg1Arr = arg1.split(".");
        const arg2Arr = arg2.split(".");
        const d1 = arg1Arr.length == 2 ? arg1Arr[1] : "";
        const d2 = arg2Arr.length == 2 ? arg2Arr[1] : "";
        const maxLen = Math.max(d1.length, d2.length);
        // eslint-disable-next-line no-restricted-properties
        const m = Math.pow(10, maxLen);
        const result = Number(((arg1 * m + arg2 * m) / m).toFixed(maxLen));
        // eslint-disable-next-line prefer-rest-params
        const d = arguments[2];
        return typeof d === "number" ? Number(result.toFixed(d)) : result;
    },
};

const calcColWidths = (cols, initVal = 120) =>
    cols
        .map(item => item.width)
        .filter(width => width)
        .reduce((sum, width) => sum + width, initVal);

export { calcColWidths };

const transCookie = () => {
    const { cookie } = document;
    if (!document.cookie) return undefined;
    const res = {};
    cookie.split(";").map(item => {
        const temp = item.trim();
        const [key, value] = temp.split("=");
        res[key] = value;
        return { key, value: decodeURIComponent(value) };
    });
    return res;
};

export { transCookie };
