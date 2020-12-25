// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import omit from "lodash/omit";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
    doExport,
    // queryDetail
} from "../services/reward";

import { genMsg } from "@/utils/utils";

function callBack(method, data) {
    if (method) method(data);
}

export default {
    namespace: "reward",

    state: {
        actBaseInfo: {},
        detailBaseInfo: {},
        checkBaseInfo: {},

        detailBaseParm: {
            actId: "",
        },

        checkBaseParam: {
            actId: "",
        },

        detailListParam: {
            currentPage: 1,
            pageSize: 10,
        },
        detailListRes: {
            totalCount: 0,
            data: [],
        },

        checkListParam: {
            currentPage: 1,
            pageSize: 10,
        },
        checkListRes: {
            totalCount: 0,
            data: [],
        },
    },

    effects: {
        *queryActs({ payload, callback }, { call, put }) {
            let res;
            try {
                res = yield call(post, {
                    url: "GET_ACTS",
                    data: payload,
                });
            } finally {
                const { success, data: { result } = {} } = res;
                if (success && Array.isArray(result) && result.length) {
                    yield put({
                        type: "updateState",
                        payload: { checkBaseInfo: result[0] },
                    });
                }
                const resObj = genMsg(res, "查询活动列表成功", "查询活动列表失败");
                callBack(callback, resObj);
            }
        },

        *queryDetailList({ payload, callback }, { call, put, select }) {
            const { detailBaseParm, detailListParam } = yield select(state => state.reward);
            const newArea = Object.assign({}, detailListParam, payload);
            const updateData = Object.assign({}, cloneDeep(detailBaseParm), newArea);
            let res;
            yield put({
                type: "updateState",
                payload: { detailListParam: newArea },
            });
            try {
                res = yield call(post, {
                    url: "DETAIL_LIST", // UPLOAD_URL对应URL的key值
                    data: updateData, // 无论是get请求还是post请求,所有请求数据均放在data字段中
                });
            } finally {
                const { success, data: { result = [], totalCount = 0 } = {} } = res;
                if (success && Array.isArray(result)) {
                    yield put({
                        type: "updateState",
                        payload: { detailListRes: { totalCount, data: result } },
                    });
                }
                const resObj = genMsg(res, "请求成功", "请求失败");
                callBack(callback, resObj);
            }
        },

        *detailExport({ payload = {} }, { select, call }) {
            const { detailBaseParm } = yield select(state => state.reward);
            yield call(doExport, {
                url: "DETAIL_EXPORT",
                data: { ...detailBaseParm, ...payload },
            }) || {};
        },

        *queryCheckList({ payload, callback }, { call, put, select }) {
            const { checkBaseParam, checkListParam } = yield select(state => state.reward);
            const newArea = Object.assign({}, checkListParam, payload);
            const updateData = Object.assign({}, cloneDeep(checkBaseParam), newArea);
            let res;
            yield put({
                type: "updateState",
                payload: { checkListParam: newArea },
            });
            try {
                res = yield call(post, {
                    url: "CHECKLIST", // UPLOAD_URL对应URL的key值
                    data: updateData, // 无论是get请求还是post请求,所有请求数据均放在data字段中
                });
            } finally {
                const { success, data: { result = [], totalCount = 0 } = {} } = res;
                if (success && Array.isArray(result)) {
                    yield put({
                        type: "updateState",
                        payload: { checkListRes: { totalCount, data: result } },
                    });
                }
                const resObj = genMsg(res, "请求成功", "请求失败");
                callBack(callback, resObj);
            }
        },

        *checkExport({ payload = {} }, { select, call }) {
            const { checkBaseParam } = yield select(state => state.reward);
            yield call(doExport, {
                url: "CHECKEXPORT",
                data: { ...checkBaseParam, ...payload },
            }) || {};
        },

        *initSearch({ payload = {}, callback }, { call }) {
            const { type } = payload;
            const url = type === "company" ? "GET_COMPANY" : "GET_TASK";
            let res;
            try {
                res = yield call(post, {
                    url,
                    data: omit(payload, ["type"]),
                });
            } finally {
                const resObj = genMsg(res, "查询工业列表成功", "查询工业列表失败");
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
