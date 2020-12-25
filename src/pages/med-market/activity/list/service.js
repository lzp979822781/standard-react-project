import request from "@/utils/request";

const URL = {
    GET_LIST: "/api/be/activity/queryActList",
    RECALL_ACT: "/api/be/activity/recall/",
};
/**
 *
 *
 * @params {object} param
 */
export function get(param) {
    const res = request(URL[param.url], {
        method: "GET",
        params: param.data,
    });
    return res;
}

export function getUrlParam(param) {
    const res = request(URL[param.url] + param.data.actId, {
        method: "GET",
    });
    return res;
}

export function post(param) {
    return request(URL[param.url], {
        method: "POST",
        data: param.data,
    });
}
