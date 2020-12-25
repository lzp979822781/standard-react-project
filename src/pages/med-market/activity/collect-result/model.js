// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
// import { delay } from "dva/saga";

import { post, getUrlParam, doExport } from "./service";

export default {
    namespace: "collectResult",

    state: {
        current: 1,
        pageSize: 10,
        total: 0,
        list: [],
        detail: {
            saleMeetNum: "",
            wareParms: [],
            saleRules: [],
        },
        param: {},
    },

    effects: {
        *getDetail({ payload }, { call, put }) {
            // yield call(delay, 1000);
            // const collectResult = yield select(state => state.collectResult);

            // 获取编辑数据
            const res = yield call(getUrlParam, {
                url: "GET_DETAIL",
                data: payload,
            });

            // 获取关联商品
            const res1 = yield call(getUrlParam, {
                url: "GET_SALEWARE",
                data: payload,
            });

            // 获取采购活动满足数
            const res2 = yield call(getUrlParam, {
                url: "GET_MEET",
                data: payload,
            });
            if (res.success && res1.success && res2.success) {
                // const { detail } = collectResult;
                const resData = res.data;
                const wareParms = res1.data;
                const saleMeetNum = res2.data;
                yield put({
                    type: "updateState",
                    payload: {
                        detail: { ...resData, wareParms, saleMeetNum },
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
            if (res.success) {
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
