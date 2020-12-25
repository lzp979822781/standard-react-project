// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import omit from "lodash/omit";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
    doExport,
    queryDetail,
} from "../services/trainSale";

import { genMsg } from "@/utils/utils";

function callBack(method, data) {
    if (method) method(data);
}

export default {
    namespace: "trainSale",

    state: {
        actBaseInfo: {},
        detailBaseInfo: {},
        analyseBaseParm: {
            actId: "",
            pinType: -1,
        },
        detailBaseParm: {
            actId: "",
        },

        analyseAreaParam: {
            provinceOrCity: "province",
            currentPage: 1,
            pageSize: 10,
        },
        analyseAreaRes: {
            totalCount: 0,
            data: [],
        },

        detailListParam: {
            currentPage: 1,
            pageSize: 10,
        },
        detailListRes: {
            totalCount: 0,
            data: [],
        },
    },

    effects: {
        *resetActId({ payload }, { put, select }) {
            const { field } = payload;
            const { [field]: reqParam } = yield select(state => state.trainSale);
            const updateData = Object.assign({}, cloneDeep(reqParam), { actId: "" });
            yield put({
                type: "updateState",
                payload: {
                    [field]: updateData,
                },
            });
        },
        *queryBaseInfo({ payload }, { call, put, select }) {
            const { analyseBaseParm } = yield select(state => state.trainSale);
            const updateData = Object.assign({}, cloneDeep(analyseBaseParm), payload);
            let res;
            yield put({
                type: "updateState",
                payload: { analyseBaseParm: updateData },
            });
            try {
                res = yield call(post, {
                    url: "GET_BASE_INFO", // UPLOAD_URL对应URL的key值
                    data: updateData, // 无论是get请求还是post请求,所有请求数据均放在data字段中
                });
            } finally {
                const { success, data = {} } = res;
                if (success) {
                    yield put({
                        type: "updateState",
                        payload: { actBaseInfo: data },
                    });
                }
            }
        },

        *queryAnalyseArea({ payload, callback }, { call, put, select }) {
            const { analyseBaseParm, analyseAreaParam } = yield select(state => state.trainSale);
            const newArea = Object.assign({}, analyseAreaParam, payload);
            const updateData = Object.assign({}, cloneDeep(analyseBaseParm), newArea);
            let res;
            yield put({
                type: "updateState",
                payload: { analyseAreaParam: newArea },
            });
            try {
                res = yield call(post, {
                    url: "ANALISE_AREA", // UPLOAD_URL对应URL的key值
                    data: updateData, // 无论是get请求还是post请求,所有请求数据均放在data字段中
                });
            } finally {
                const { success, data: { result = [], totalCount = 0 } = {} } = res;
                if (success && Array.isArray(result)) {
                    yield put({
                        type: "updateState",
                        payload: { analyseAreaRes: { totalCount, data: result } },
                    });
                }
                const resObj = genMsg(res, "请求成功", "请求失败");
                callBack(callback, resObj);
            }
        },

        *queryTrainInfo({ payload }, { call, put, select }) {
            const { detailBaseParm } = yield select(state => state.trainSale);
            const updateData = Object.assign({}, cloneDeep(detailBaseParm), payload);
            let res;
            yield put({
                type: "updateState",
                payload: { detailBaseParm: updateData },
            });
            try {
                res = yield call(post, {
                    url: "GET_BASE_INFO", // UPLOAD_URL对应URL的key值
                    data: updateData, // 无论是get请求还是post请求,所有请求数据均放在data字段中
                });
            } finally {
                const { success, data = {} } = res;
                if (success) {
                    yield put({
                        type: "updateState",
                        payload: { detailBaseInfo: data },
                    });
                }
            }
        },

        *queryDetailList({ payload, callback }, { call, put, select }) {
            const { detailBaseParm, detailListParam } = yield select(state => state.trainSale);
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

        *queryActs({ payload, callback }, { call }) {
            const { type = 4, id } = payload;
            const url = type === 4 ? "GET_SAY" : "GET_LOOK";
            let res;
            try {
                res = yield call(queryDetail, {
                    url,
                    data: { id },
                });
            } finally {
                const resObj = genMsg(res, "查询活动列表成功", "查询活动列表失败");
                callBack(callback, resObj);
            }
        },

        *analyseExport({ payload = {} }, { select, call }) {
            const {
                analyseBaseParm,
                analyseAreaParam: { provinceOrCity },
            } = yield select(state => state.trainSale);
            yield call(doExport, {
                url: "ANALISE_EXPORT",
                data: { ...analyseBaseParm, provinceOrCity, ...payload },
            }) || {};
        },
        *detailExport({ payload = {} }, { select, call }) {
            const { detailBaseParm } = yield select(state => state.trainSale);
            yield call(doExport, {
                url: "DETAIL_EXPORT",
                data: { ...detailBaseParm, ...payload },
            }) || {};
        },

        *initSearch({ payload = {}, callback }, { call }) {
            const { type } = payload;
            const url = type === "company" ? "GET_COMPANY" : "GET_TASK_LIST";
            let res;
            try {
                res = yield call(post, {
                    url,
                    data: omit(payload, ["type"]),
                });
            } finally {
                const resObj = genMsg(res, "查询成功", "查询失败");
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
