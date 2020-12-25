// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
// import { delay } from "dva/saga";

import { get, post } from "./service";

export default {
    namespace: "dispalyResultDetail",

    state: {
        detail: {},
    },

    effects: {
        *getDetail({ payload }, { call, put }) {
            // yield call(delay, 1000);
            // const collectResult = yield select(state => state.collectResult);
            // 获取编辑数据
            const res = yield call(get, {
                url: "GET_DETAIL",
                data: payload,
            });

            if (res.success) {
                const resData = res.data;
                yield put({
                    type: "updateState",
                    payload: {
                        detail: { ...resData },
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
