import request from "@/utils/request";
import { urlPrefix } from "@/utils/utils";

const URL = {
    GET_DETAIL: `${urlPrefix}activity/show/getApplyDetail`,
    CHECK: `${urlPrefix}activity/show/verify`,
};

/**
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
