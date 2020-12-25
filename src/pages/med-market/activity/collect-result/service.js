import request from "@/utils/request";
import { urlPrefix, transToFile, err } from "@/utils/utils";

const URL = {
    GET_LIST: `${urlPrefix}activity/sale/result/data`,
    GET_DETAIL: `${urlPrefix}activity/sale/detail/`,
    GET_MEET: `${urlPrefix}activity/sale/saleMeetNum/`,
    GET_SALEWARE: `${urlPrefix}activity/sale/ware/`,
    EXPORT: `${urlPrefix}activity/sale/saleExport`,
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
        method: "GET",
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
