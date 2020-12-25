import request from "@/utils/request";

const URL = {
    CHECK_OP: "/api/be/activity/verify/op/verifyAct",
    CHECK_GY: "/api/be/activity/verify/gy/verifyAct",
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

export function getFormUrl(param) {
    const res = request(`${URL[param.url]}/${param.data.actId}`, {
        method: "GET",
    });
    return res;
}
