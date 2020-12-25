import request from "@/utils/request";
import { urlPrefix, transToFile, err } from "@/utils/utils";

const URL = {
    GET_ACTS: `${urlPrefix}activity/queryActList`, // 获取活动列表

    GET_BASE_INFO: `${urlPrefix}train/analyze/findActTrainAnalyzeData`, // 获取培训分析基础数据
    ANALISE_AREA: `${urlPrefix}train/analyze/findActTrainAnalyzeAreaData`, // 获取培训分析区域数据
    ANALISE_EXPORT: `${urlPrefix}train/analyze/exportActTrainAnalyzeAreaData`, // 导出培训分析列表
    DETAIL_LIST: `${urlPrefix}analyze/rewardNotSend/rewardNoSend`, // 未奖励统计列表
    DETAIL_EXPORT: `${urlPrefix}analyze/rewardNotSend/rewardNoSendExport`, // 未奖励统计导出
    CHECKLIST: `${urlPrefix}analyze/rewardNotSend/rewardNoSendDetail`, // 未奖励清单列表
    CHECKEXPORT: `${urlPrefix}analyze/rewardNotSend/rewardNoSendDetailExport`, // 未奖励清单列表导出
    GET_COMPANY: `${urlPrefix}vender/factory/list`, // 工业列表
    GET_TASK: `${urlPrefix}act/task/queryList`, // 工业列表
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
