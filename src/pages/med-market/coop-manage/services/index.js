import request from "@/utils/request";
import { transToFile, err } from "@/utils/utils";

const URL = {
    UPLOAD_URL: "/web/sys/getSecretKey",
    GET_DATA: "/api/be/act/task/queryActTaskList",
    GET_COMPONY: "/api/be/vender/factory/list",
    GET_DETAIL: "/api/be/act/task/get",
    CREATE_TASK: "/api/be/act/task/create",
    EDIT_TASK: "/api/be/act/task/update",
    EXPORT: "/api/be/act/task/exportTask",
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

export function post(param, config) {
    return request(URL[param.url], {
        method: "POST",
        data: param.data,
        ...(config || {}),
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
