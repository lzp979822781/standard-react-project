/* eslint-disable import/extensions */
import request from "@/utils/request";
import { urlPrefix, transToFile, err } from "@/utils/utils";

const URL = {
    GET_LIST: `${urlPrefix}analyze/task/queryActStatList`,
    GET_HEADER: `${urlPrefix}analyze/task/queryTaskOverview`,
    EXPORT: `${urlPrefix}analyze/task/exportActStat`,
};

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
    const {
        data: { fileName },
    } = param;
    return request(URL[param.url], {
        method: "POST",
        data: param.data,
        getResponse: true,
    })
        .then(res => {
            // const { response } = res;
            // transToFile(response, fileName);
            const { response } = res;
            transToFile(response, fileName);
            // if (success) {
            //     transToFile(response, fileName);
            // } else {
            //     err(msg);
            // }
        })
        .catch(error => {
            err(`导出:${error}`);
        });
}
