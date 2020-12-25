// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
// import { delay } from "dva/saga";

import { get, post, doExport } from "./service";

export default {
    namespace: "dispalyResult",

    state: {
        current: 1,
        pageSize: 10,
        total: 0,
        list: [],
        detail: {},
        param: {},
    },

    effects: {
        *getDetail({ payload }, { call, put }) {
            // yield call(delay, 1000);
            // const collectResult = yield select(state => state.collectResult);
            // 获取详情
            const res = yield call(get, {
                url: "GET_DETAIL",
                data: payload,
            });

            // 获取陈列活动报名人数，通过数
            const res2 = yield call(get, {
                url: "GET_MEET",
                data: payload,
            });
            if (res.success) {
                // const { detail } = collectResult;
                const resData = res.data;
                const saleMeetNum = res2.data;
                yield put({
                    type: "updateState",
                    payload: {
                        detail: { ...resData, ...saleMeetNum },
                    },
                });
            }
        },
        *getList({ payload }, { call, put }) {
            // yield call(delay, 1000);

            const res = yield call(post, {
                url: "GET_LIST",
                data: payload,
            });
            if (res.success && res.data) {
                yield put({
                    type: "updateState",
                    payload: {
                        list: res.data.result,
                        current: res.data.currentPage,
                        total: res.data.totalCount,
                        pageSize: res.data.pageSize,
                        param: payload,
                    },
                });
            }
        },
        *submitOpinion({ payload, callback }, { call }) {
            const res = yield call(post, {
                url: "CHECK",
                data: payload,
            });

            if (callback && typeof callback === "function") {
                // yield call(delay, 1000);
                callback(res);
            }
        },
        *doExport({ payload }, { call }) {
            // const { param } = yield select(state => state.collectResult);
            yield call(doExport, {
                url: "EXPORT",
                data: { ...payload },
            });
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
