// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import omit from "lodash/omit";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
    doExport,
    queryDetail,
} from "../services/pullSaleAnalyse";

import { genMsg } from "@/utils/utils";

function callBack(method, data) {
    if (method) method(data);
}

const detailExportUrl = {
    detail: "DETAIL_EXPORT",
    reward: "REWARD_EXPORT",
};

export default {
    namespace: "pullSaleAnalyse",

    state: {
        analysisBaseInfo: {},
        detailBaseInfo: {},
        analyseBaseParm: {
            actId: "",
            factoryVenderId: "",
            actTaskId: "",
            pinType: -1,
            factorySkuId: -1,
        },
        detailBaseParm: {
            actId: "",
            factoryVenderId: "",
            actTaskId: "",
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

        rewardParam: {
            currentPage: 1,
            pageSize: 10,
        },
        rewardRes: {
            totalCount: 0,
            data: [],
        },
    },

    effects: {
        *resetActId({ payload }, { put, select }) {
            const { field } = payload;
            const { [field]: reqParam } = yield select(state => state.pullSaleAnalyse);
            const updateData = Object.assign({}, cloneDeep(reqParam), { actId: "" });
            yield put({
                type: "updateState",
                payload: {
                    [field]: updateData,
                },
            });
        },
        *queryBaseInfo({ payload }, { call, put, select }) {
            const { analyseBaseParm } = yield select(state => state.pullSaleAnalyse);
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
                        payload: { analysisBaseInfo: data },
                    });
                }
            }
        },

        *queryAnalyseArea({ payload, callback }, { call, put, select }) {
            const { analyseBaseParm, analyseAreaParam } = yield select(state => state.pullSaleAnalyse);
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

        *queryDetailInfo({ payload }, { call, put, select }) {
            const { detailBaseParm } = yield select(state => state.pullSaleAnalyse);
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
            const { detailBaseParm, detailListParam } = yield select(state => state.pullSaleAnalyse);
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
        *queryReward({ payload, callback }, { call, put, select }) {
            const { detailBaseParm, rewardParam } = yield select(state => state.pullSaleAnalyse);
            const newArea = Object.assign({}, rewardParam, payload);
            const updateData = Object.assign({}, cloneDeep(detailBaseParm), newArea);
            let res;
            yield put({
                type: "updateState",
                payload: { rewardParam: newArea },
            });
            try {
                res = yield call(post, {
                    url: "REWARD_LIST", // UPLOAD_URL对应URL的key值
                    data: updateData, // 无论是get请求还是post请求,所有请求数据均放在data字段中
                });
            } finally {
                const { success, data: { result = [], totalCount = 0 } = {} } = res;
                if (success && Array.isArray(result)) {
                    yield put({
                        type: "updateState",
                        payload: { rewardRes: { totalCount, data: result } },
                    });
                }
                const resObj = genMsg(res, "请求成功", "请求失败");
                callBack(callback, resObj);
            }
        },

        *queryActs({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(queryDetail, {
                    url: "GET_ACTS",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "查询活动列表成功", "查询活动列表失败");
                callBack(callback, resObj);
            }
        },

        *queryActGood({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(queryDetail, {
                    url: "GET_ACT_GOODS",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "查询活动商品成功", "查询活动商品失败");
                callBack(callback, resObj);
            }
        },

        *analyseExport({ payload = {} }, { select, call }) {
            const {
                analyseBaseParm,
                analyseAreaParam: { provinceOrCity },
            } = yield select(state => state.pullSaleAnalyse);
            yield call(doExport, {
                url: "ANALISE_EXPORT",
                data: { ...analyseBaseParm, provinceOrCity, ...payload },
            }) || {};
        },
        *detailExport({ payload = {} }, { select, call }) {
            const { type } = payload;
            const { detailBaseParm } = yield select(state => state.pullSaleAnalyse);
            yield call(doExport, {
                url: detailExportUrl[type],
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
