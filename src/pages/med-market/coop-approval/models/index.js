// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import { delay } from "dva/saga";

import { get, post } from "../services";

export default {
    namespace: "coopApproval",

    state: {
        current: 1,
        pageSize: 10,
        total: 0,
        list: [],
        detail: {},
        param: {},
    },

    effects: {
        *getList({ payload }, { call, put }) {
            // yield call(delay, 1000);

            const res = yield call(post, {
                url: "GET_LIST",
                data: payload,
            });
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
        },
        *getDetail({ payload }, { call, put }) {
            const res = yield call(get, {
                url: "GET_DETAIL",
                data: payload,
            });
            yield put({
                type: "updateState",
                payload: {
                    detail: res && res.data ? res.data : {},
                },
            });
        },
        *submitOpinion({ payload, callback }, { call }) {
            // let detail = yield select(state => {
            //     return state.coopApproval.detail;
            // });
            // let detail1 = cloneDeep(detail);
            // detail1.status=2

            // yield call(delay, 1000);

            const res = yield call(post, {
                url: payload.type,
                data: {
                    opinion: payload.opinion,
                    taskId: payload.taskId,
                },
            });

            if (callback && typeof callback === "function") {
                yield call(delay, 1000);
                callback(res);
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
