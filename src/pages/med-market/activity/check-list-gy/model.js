// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import { delay } from "dva/saga";

import { post } from "./service";

export default {
    namespace: "activityCheckListGy",

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
            yield call(delay, 1000);

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
