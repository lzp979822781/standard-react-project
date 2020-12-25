// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
// import omit from "lodash/omit";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
    doExport,
    // queryDetail,
} from "../services/dataAnalysisList";
import { err } from "@/utils/utils";

let hasError = true;

function errorCallback(res) {
    if (hasError) {
        err(res.msg);
        hasError = false;
        setTimeout(() => {
            hasError = true;
        }, 5000);
    }
}

export default {
    namespace: "dataAnalysisList",

    state: {
        param: {},
        data1: {
            current: 1,
            pageSize: 10,
            total: 0,
            list: [],
        },
        data2: {
            current: 1,
            pageSize: 10,
            total: 0,
            list: [],
        },
        data3: {
            current: 1,
            pageSize: 10,
            total: 0,
            list: [],
        },
        data4: {
            current: 1,
            pageSize: 10,
            total: 0,
            list: [],
        },
        totalHeader: {},
        header1: {},
        header2: {},
        header3: {},
        header4: {},
    },

    effects: {
        *getList1({ payload }, { call, put }) {
            // yield call(delay, 1000);

            const res = yield call(post, {
                url: "GET_LIST",
                data: { ...payload, virtualActType: 1 },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        data1: { current: res.data.currentPage, pageSize: res.data.pageSize, total: res.data.totalCount, list: res.data.result },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *getList2({ payload }, { call, put }) {
            // yield call(delay, 1000);

            const res = yield call(post, {
                url: "GET_LIST",
                data: { ...payload, virtualActType: 2 },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        data2: { current: res.data.currentPage, pageSize: res.data.pageSize, total: res.data.totalCount, list: res.data.result },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *getList3({ payload }, { call, put }) {
            // yield call(delay, 1000);

            const res = yield call(post, {
                url: "GET_LIST",
                data: { ...payload, virtualActType: 3 },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        data3: { current: res.data.currentPage, pageSize: res.data.pageSize, total: res.data.totalCount, list: res.data.result },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *getList4({ payload }, { call, put }) {
            // yield call(delay, 1000);

            const res = yield call(post, {
                url: "GET_LIST",
                data: { ...payload, virtualActType: 4 },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        data4: { current: res.data.currentPage, pageSize: res.data.pageSize, total: res.data.totalCount, list: res.data.result },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *getTotalHeader({ payload }, { call, put }) {
            const res = yield call(post, {
                url: "GET_HEADER",
                data: { ...payload },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        totalHeader: { ...res.data },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *getHeader1({ payload }, { call, put }) {
            const res = yield call(post, {
                url: "GET_HEADER",
                data: { ...payload, virtualActType: 1 },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        header1: { ...res.data },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *getHeader2({ payload }, { call, put }) {
            const res = yield call(post, {
                url: "GET_HEADER",
                data: { ...payload, virtualActType: 2 },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        header2: { ...res.data },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *getHeader3({ payload }, { call, put }) {
            const res = yield call(post, {
                url: "GET_HEADER",
                data: { ...payload, virtualActType: 3 },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        header3: { ...res.data },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *getHeader4({ payload }, { call, put }) {
            const res = yield call(post, {
                url: "GET_HEADER",
                data: { ...payload, virtualActType: 4 },
            });

            if (res.success) {
                yield put({
                    type: "updateState",
                    payload: {
                        param: payload,
                        header4: { ...res.data },
                    },
                });
            } else {
                errorCallback(res);
            }
        },
        *doExport({ payload }, { select, call }) {
            const { param } = yield select(state => state.dataAnalysisList);
            yield call(doExport, {
                url: "EXPORT",
                data: { ...param, ...payload },
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
