/* eslint-disable import/extensions */
import request from "@/utils/request";
import { urlPrefix, transToFile, err } from "@/utils/utils";

const URL = {
    GET_TREND: `${urlPrefix}activity/sale/analyze/saleAnalyzeTrend`, // echart趋势图
    TREND_EXPORT: `${urlPrefix}/activity/sale/analyze/saleAnalyzeTrendExport`, // echart趋势导出
    GET_TASK: `${urlPrefix}act/task/get`,
    GET_ACTS: `${urlPrefix}activity/sale/detail/`, // 获取活动详情
    GET_CONDITION: `${urlPrefix}activity/sale/analyze/condition`, // 获取条件
    GET_BASE_INFO: `${urlPrefix}activity/sale/analyze/saleAnalyzeNum`, // 获取采购基础数据
    ANALISE_AREA: `${urlPrefix}activity/sale/analyze/saleAnalyzeArea`, // 获取采购分析区域数据
    ANALISE_EXPORT: `${urlPrefix}activity/sale/analyze/saleAnalyzeAreaExport`, // 导出采购分析列表
    DETAIL_LIST: `${urlPrefix}activity/sale/analyze/saleAnalyzeDetail`, // 采购详情列表
    DETAIL_EXPORT: `${urlPrefix}activity/sale/analyze/saleAnalyzeDetailExport`, // 导出采购详情
    REWARD_LIST: `${urlPrefix}activity/sale/analyze/saleAnalyzeRewardDetail`, // 查询采购奖励
    REWARD_EXPORT: `${urlPrefix}activity/sale/analyze/saleAnalyzeRewardDetailExport`, // 导出采购奖励
    GET_COMPANY: `${urlPrefix}vender/factory/list`, // 工业列表
    GET_TASK_LIST: `${urlPrefix}act/task/queryList`, // 工业列表
};

/**
 *
 *
 * @params {object} param
 */
export function get(param) {
    /* const {data: {id} = {}} = param;
    let url =  URL[param.url];
    if(dynamicUrl) url = `${url}/${id}`; */
    const res = request(URL[param.url], {
        method: "GET",
        params: param.data,
    });
    return res;
}

export function post(param) {
    return request(URL[param.url], {
        method: "POST",
        data: param.data,
    });
}

export function queryDetail(param) {
    const {
        url,
        data: { id, ...otherData },
    } = param;
    return request(`${URL[url]}${id}`, {
        method: "GET",
        params: otherData,
    });
}

export function doExport(param) {
    const {
        data: { fileName },
    } = param;
    return request(URL[param.url], {
        method: "POST",
        data: param.data,
        getResponse: true,
    })
        .then(res => {
            const { response } = res;
            transToFile(response, fileName);
        })
        .catch(error => {
            err(`导出:${error}`);
        });
}
