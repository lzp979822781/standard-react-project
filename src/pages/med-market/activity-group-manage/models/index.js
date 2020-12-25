// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
} from "../services";

import { genMsg } from "@/utils/utils";

function callBack(method, data) {
    if (method) method(data);
}

export default {
    namespace: "actGroupMag",

    state: {
        pageReq: {
            currentPage: 0,
            pageSize: 10,
        },

        pageRes: {
            totalCount: 20,
            data: [],
        },
    },

    effects: {
        *queryData({ payload, callback }, { call, put, select }) {
            const { pageReq } = yield select(state => state.actGroupMag);
            const updateData = Object.assign({}, cloneDeep(pageReq), payload);
            let res;
            yield put({
                type: "updateState",
                payload: { pageReq: updateData },
            });
            try {
                res = yield call(post, {
                    url: "GET_DATA", // UPLOAD_URL对应URL的key值
                    data: updateData, // 无论是get请求还是post请求,所有请求数据均放在data字段中
                });

                if (res.success) {
                    const {
                        data: { result: data = [], totalCount = 10 } = {},
                    } = res;
                    const newPageRes = { pageRes: { data, totalCount } };
                    yield put({
                        type: "updateState",
                        payload: newPageRes,
                    });
                }
            } finally {
                const resObj = genMsg(res, "请求成功", "请求失败");
                callBack(callback, resObj);
            }
        },

        *delData({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(get, {
                    url: "DEL_DATA",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "删除成功", "删除失败");
                callBack(callback, resObj);
            }
        },

        *exportList({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(post, {
                    url: "EXPORT_LIST",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "导出成功", "导出失败");
                callBack(callback, resObj);
            }
        },
    },

    reducers: {
        updateState(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
    },
};
