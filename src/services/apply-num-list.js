import request from "@/utils/request";
import { urlPrefix, transToFile, err } from "@/utils/utils";

const URL = {
    GetCompanyCategory: `${urlPrefix}common/getCompanyCategory`,
    GET_LIST: `${urlPrefix}apply/queryApplyCustomer`,
    EXPORT: `${urlPrefix}apply/exportList`,
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
