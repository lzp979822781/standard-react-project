// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
} from "../services";

export default {
    namespace: "test",

    state: {
        pageReq: {
            current: 1,
            pageSize: 10,
            total: 10,
            data: [],
        },
    },

    /*     subscriptions: {
        setup({ dispatch, history }, done) {
            return history.listen(async ({ pathname, search, query }) => {
                // 监听路由变化
                dispatch({
                    type: 'initSearchArea',
                    payload: { query }
                })
            })
        }
    }, */

    effects: {
        // eslint-disable-next-line no-unused-vars
        *uploadFile({ payload }, { call, put, select }) {
            yield call(post, {
                url: "UPLOAD_URL",
                data: payload,
            });
        },

        *changeTotal({ payload }, { call, put }) {
            const res = yield call(get, {
                url: "GET_DATA",
                data: payload,
            });
            console.log("model res", res);
            yield put({
                type: "updateState",
                payload: {
                    pageReq: {
                        current: 1,
                        pageSize: 10,
                        ...payload,
                    },
                },
            });
        },

        *initSearchArea({ payload }, { call }) {
            yield call();
            console.log("payload", payload);
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
