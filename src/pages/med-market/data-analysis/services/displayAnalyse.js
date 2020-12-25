/* eslint-disable import/extensions */
import request from "@/utils/request";
import { urlPrefix, transToFile, err } from "@/utils/utils";

const URL = {
    GET_TASK: `${urlPrefix}act/task/get`,
    GET_ACTS: `${urlPrefix}activity/show/getActDetailById`, // 获取活动详情

    GET_BASE_INFO: `${urlPrefix}activity/show/analyze/data`, // 获取陈列基础数据
    ANALISE_AREA: `${urlPrefix}activity/show/analyze/area`, // 获取陈列分析区域数据
    ANALISE_EXPORT: `${urlPrefix}activity/show/analyze/download/area`, // 导出陈列分析列表
    DETAIL_LIST: `${urlPrefix}activity/show/analyze/detail`, // 陈列详情列表
    DETAIL_EXPORT: `${urlPrefix}activity/show/analyze/download/detail`, // 导出陈列详情
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
        data: { id },
    } = param;
    return request(`${URL[url]}`, {
        method: "GET",
        params: { actId: id },
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
