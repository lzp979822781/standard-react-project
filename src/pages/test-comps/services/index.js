import request from "@/utils/request";
import { genUrlObj } from "@/utils/utils";

const URL = {
    UPLOAD_URL: "/web/sys/getSecretKey",
    GET_DATA: "/web/sys/list",
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

export const CONSTURL = genUrlObj(URL);
