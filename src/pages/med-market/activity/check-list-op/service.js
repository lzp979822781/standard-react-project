import request from "@/utils/request";

const URL = {
    GET_LIST: "/api/be/activity/verify/op/verify/list",
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

export function post(param) {
    return request(URL[param.url], {
        method: "POST",
        data: param.data,
    });
}
