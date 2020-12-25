import request from "@/utils/request";

const URL = {
    GET_LIST: "/api/be/act/task/queryActTaskList",
    GET_DETAIL: "/api/be/act/task/get",
    SUBMIT_PASS: "/api/be/act/task/verify/pass",
    SUBMIT_REJECT: "/api/be/act/task/verify/reject",
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
