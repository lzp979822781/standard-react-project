// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import omit from "lodash/omit";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
    queryDetail,
} from "../services";

import { genMsg } from "@/utils/utils";

function callBack(method, data) {
    if (method) method(data);
}

const saveObj = {
    add: {
        4: "SAY_CREATE",
        5: "LOOK_CREATE",
    },
    edit: {
        4: "SAY_EDIT",
        5: "LOOK_EDIT",
    },
};

export default {
    namespace: "train",

    state: {
        pageReq: {
            currentPage: 0,
            pageSize: 10,
        },

        pageRes: {
            totalCount: 20,
            data: [],
        },

        taskData: undefined,
    },

    effects: {
        *queryData({ payload, callback }, { call, put, select }) {
            const { pageReq } = yield select(state => state.actGroupMag);
            const updateData = Object.assign({}, cloneDeep(pageReq), payload);
            let res;
            yield put({
                type: "updateState",
                payload: { pageReq: updateData },
            });
            try {
                res = yield call(post, {
                    url: "GET_DATA", // UPLOAD_URL对应URL的key值
                    data: updateData, // 无论是get请求还是post请求,所有请求数据均放在data字段中
                });

                if (res.success) {
                    const { data: { result: data = [], totalCount = 10 } = {} } = res;
                    const newPageRes = { pageRes: { data, totalCount } };
                    yield put({
                        type: "updateState",
                        payload: newPageRes,
                    });
                }
            } finally {
                const resObj = genMsg(res, "请求成功", "请求失败");
                callBack(callback, resObj);
            }
        },

        *delData({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(get, {
                    url: "DEL_DATA",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "删除成功", "删除失败");
                callBack(callback, resObj);
            }
        },

        /* *getTask({ payload }, { put, call }) {
            let res;
            try {
                res = yield call(post, {
                    url: "GET_TASK",
                    data: payload,
                });
            } finally {
                const { data, success } = res || {};
                if (success) {
                    yield put({
                        type: "updateState",
                        payload: {
                            taskData: data,
                        },
                    });
                }
            }
        }, */

        *getBuget({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(get, {
                    url: "GET_BUGET",
                    data: omit(payload, ["type"]),
                });
            } finally {
                const { data, success } = res || {};
                if (success && callback) {
                    callback(data);
                } else {
                    console.error("获取预算失败");
                }
            }
        },
        *isNameUniq({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(get, {
                    url: "NAME_UNIQ",
                    data: payload,
                });
            } finally {
                const { data, success } = res || {};
                if (success && callback) {
                    callback(data);
                } else {
                    console.error("查询名称唯一性失败");
                }
            }
        },
        *queryTask({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(get, {
                    url: "GET_TASK",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "查询成功", "查询成功");
                callBack(callback, resObj);
            }
        },

        *save({ payload, callback }, { call }) {
            let res;
            const { pageType, type } = payload;
            const url = saveObj[pageType][type];
            try {
                res = yield call(post, {
                    url,
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "保存成功", "保存失败");
                callBack(callback, resObj);
            }
        },

        *queryDetail({ payload, callback }, { call }) {
            const { type, ...otherParam } = payload;
            const url = type === 4 ? "SAY_DETAIL" : "LOOK_DETAIL";
            let res;
            try {
                res = yield call(queryDetail, {
                    url,
                    data: otherParam,
                });
            } finally {
                const resObj = genMsg(res, "查询成功", "查询失败");
                callBack(callback, resObj);
            }
        },

        *queryGroup({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(post, {
                    url: "GET_GROUP",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "查询活动组成功", "查询活动组失败");
                callBack(callback, resObj);
            }
        },

        *queryBuyerType({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(get, {
                    url: "GET_BUYERTYPE",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "查询活动组成功", "查询活动组失败");
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
