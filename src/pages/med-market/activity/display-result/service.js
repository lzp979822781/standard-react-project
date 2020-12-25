import request from "@/utils/request";
import { urlPrefix, transToFile, err } from "@/utils/utils";

const URL = {
    GET_LIST: `${urlPrefix}activity/show/querySellerList`,
    GET_DETAIL: `${urlPrefix}activity/show/getActDetailById`,
    GET_MEET: `${urlPrefix}activity/show/getApplyNum`,
    CHECK: `${urlPrefix}activity/show/verify`,
    EXPORT: `${urlPrefix}activity/show/exportSellerList`,
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
