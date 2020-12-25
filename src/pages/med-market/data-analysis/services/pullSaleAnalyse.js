import request from "@/utils/request";
import { urlPrefix, transToFile, err } from "@/utils/utils";

const URL = {
    GET_TASK: `${urlPrefix}act/task/get`,
    GET_ACTS: `${urlPrefix}activity/movePin/get/`, // 获取活动详情

    GET_BASE_INFO: `${urlPrefix}activity/move/analyze/data`, // 获取动销基础数据
    ANALISE_AREA: `${urlPrefix}activity/move/analyze/area`, // 获取动销分析区域数据
    ANALISE_EXPORT: `${urlPrefix}activity/move/analyze/download/area`, // 导出动销分析列表
    DETAIL_LIST: `${urlPrefix}activity/move/analyze/detail`, // 动销详情列表
    DETAIL_EXPORT: `${urlPrefix}activity/move/analyze/download/detail`, // 导出动销详情
    REWARD_LIST: `${urlPrefix}activity/move/analyze/reward/detail`, // 查询动销奖励
    REWARD_EXPORT: `${urlPrefix}activity/move/analyze/download/reward/detail`, // 导出动销奖励
    GET_ACT_GOODS: `${urlPrefix}activity/movePin/ware/`, // 获取活动商品

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
            // if (success) {
            //     transToFile(response, fileName);
            // } else {
            //     err(msg);
            // }
        })
        .catch(error => {
            err(`导出:${error}`);
        });
}
