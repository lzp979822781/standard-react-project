// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
} from "../services";

export default {
    namespace: "empty",

    state: {},

    effects: {
        // eslint-disable-next-line no-unused-vars
        *exmpMethod({ payload }, { call, put, select }) {
            yield call(post, {
                url: "UPLOAD_URL", // UPLOAD_URL对应URL的key值
                data: payload, // 无论是get请求还是post请求,所有请求数据均放在data字段中
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
