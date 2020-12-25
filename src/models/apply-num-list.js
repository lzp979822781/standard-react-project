// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
// import { delay } from "dva/saga";

import { get, post, doExport } from "../services/apply-num-list";

export default {
    namespace: "applyNumList",

    state: {
        current: 1,
        pageSize: 10,
        total: 0,
        list: [],
        params: {},
        companyCategory: [
            {
                name: "零售-单体药店",
                categoryId: 1,
            },
        ],
    },

    effects: {
        *initData({ payload }, { put }) {
            yield put({
                type: "updateState",
                payload: {
                    current: 1,
                    pageSize: 10,
                    total: 0,
                    list: [],
                    params: {},
                    ...payload,
                },
            });
        },
        *getCompanyCategory({ payload }, { call, put }) {
            const res = yield call(get, {
                url: "GetCompanyCategory",
                data: { ...payload },
            });
            if (res.success && res.data) {
                yield put({
                    type: "updateState",
                    payload: {
                        companyCategory: res.data,
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
                        params: payload,
                    },
                });
            }
        },

        *doExport({ payload }, { call, select }) {
            const { params } = yield select(state => state.applyNumList);
            yield call(doExport, {
                url: "EXPORT",
                data: { ...payload, ...params },
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
