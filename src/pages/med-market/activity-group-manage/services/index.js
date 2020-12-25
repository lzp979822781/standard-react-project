import request from "@/utils/request";

const prefix = "/api/be/";
const URL = {
    UPLOAD_URL: "/web/sys/getSecretKey",
    GET_DATA: `${prefix}/act/group/queryList`,
    DEL_DATA: `${prefix}act/group/deleteActGroup`,
    EXPORT_LIST: `${prefix}act/group/export`,
    GET_COMPONY: `${prefix}vender/factory/list`,
    GET_DETAIL: `${prefix}act/task/get`,
    CREATE_TASK: `${prefix}act/task/create`,
    EDIT_TASK: `${prefix}act/task/update`,
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
