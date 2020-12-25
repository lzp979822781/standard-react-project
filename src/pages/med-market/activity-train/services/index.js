import request from "@/utils/request";
import { urlPrefix } from "@/utils/utils";

const prefix = "/api/be/";

const URL = {
    SAY_CREATE: "/api/be/train/say/save", // 京采说创建
    LOOK_CREATE: "/api/be/train/look/save", // 用心看创建

    SAY_EDIT: "/api/be/train/say/update", // 京采说更新
    LOOK_EDIT: "/api/be/train/look/update", // 用心看更新

    SAY_DETAIL: `${urlPrefix}train/say/get/`, // 京采说查看详情
    LOOK_DETAIL: `${urlPrefix}train/look/get/`, // 用心看查看详情

    GET_TASK: `${urlPrefix}act/task/get`,
    GET_BUGET: `${urlPrefix}act/task/getRemainBudget`, // 获取剩余预算
    NAME_UNIQ: `${urlPrefix}activity/isOnlyName`,
    GET_GROUP: `${urlPrefix}act/group/queryList`, // 获取活动组

    GET_BUYERTYPE: `${prefix}common/getCompanyCategory`,
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
