import request from "@/utils/request";
// import { urlPrefix } from "@/utils/utils";

const URL = {
    GET_LIST: `/api/activity/verify/gy/verify/list`,
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
