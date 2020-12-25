import request from "@/utils/request";
import { transToFile, err, urlPrefix } from "@/utils/utils";

const prefix = "/api/be/";

const URL = {
    TRAIN_CREATE: "/activity/training/save",
    TRAIN_EDIT: "/activity/training/update",
    TRAIN_DETAIL: `${urlPrefix}/activity/training/get/`,

    GET_TASK: `${urlPrefix}act/task/get`,
    GET_BUGET: `${urlPrefix}act/task/getRemainBudget`, // 获取剩余预算
    CREATE_TASK: `${prefix}activity/movePin/save`,
    EDIT_TASK: `${prefix}activity/movePin/update`,
    QUERY_DETAIL: `${urlPrefix}activity/movePin/get/`,
    QUERY_LIST: `${urlPrefix}activity/queryActList`,
    QUERY_GOOD: `${urlPrefix}activity/movePin/ware/`,

    GET_GROUP: `${urlPrefix}act/group/queryList`, // 获取活动组
    GET_EFFECT_DETAIL: `${urlPrefix}activity/movePin/getMovePinEffectDataVerifyById/`,
    GET_EFFECT_BASEINFO: `${urlPrefix}activity/movePin/getDataVerifyBaseInfos/`,
    APPROVAL: `${urlPrefix}activity/movePin/movePinVerify`,
    EXPORT: `${urlPrefix}activity/movePin/movePinDataExport`,
    FULL_DATA: `${urlPrefix}activity/movePin/getMovePinEffectData`,
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
    return request(URL[param.url], {
        method: "POST",
        data: param.data,
        getResponse: true,
    })
        .then(res => {
            const { response } = res;
            transToFile(response);
        })
        .catch(error => {
            err(`导出:${error}`);
        });
}
