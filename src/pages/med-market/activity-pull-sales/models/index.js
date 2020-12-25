// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import omit from "lodash/omit";
// import moment from "moment";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
    queryDetail,
    doExport,
} from "../services";

import { genMsg } from "@/utils/utils";

/* const list = [
    {
        key: "1",
        actId: "1",
        pin: "买家信息1",
        area: "北京",
        buyerType: "单体门店",
        created: moment().format(),
        status: 3, // 驳回
        failReason: "审批驳回",
        imgPath: "http://img0.imgtn.bdimg.com/it/u=2681380112,2638501844&fm=26&gp=0.jpg",
        n: 5,
        isCease: 0,
    },
    {
        key: "2",
        actId: "2",
        pin: "买家信息2",
        area: "上海",
        buyerType: "连锁总部",
        created: moment().format(),
        status: 5, // 驳回
        failReason: "申诉驳回",
        imgPath: "http://img4.imgtn.bdimg.com/it/u=2350302849,3323337377&fm=26&gp=0.jpg",
        n: 10,
        isCease: 0,
    },
    {
        key: "3",
        actId: "3",
        pin: "买家信息3",
        area: "成都",
        buyerType: "连锁门店",
        created: moment().format(),
        status: 1,
        failReason: "待审",
        imgPath: "http://img4.imgtn.bdimg.com/it/u=2350302849,3323337377&fm=26&gp=0.jpg",
        n: 10,
        isCease: 0,
    },
    {
        key: "4",
        actId: "4",
        pin: "买家信息4",
        area: "武汉",
        buyerType: "连锁分公司",
        created: moment().format(),
        status: 1,
        failReason: "待审",
        imgPath: "http://img4.imgtn.bdimg.com/it/u=2350302849,3323337377&fm=26&gp=0.jpg",
        n: 10,
        isCease: 0,
    },
    {
        key: "5",
        actId: "5",
        pin: "买家信息5",
        area: "广州",
        buyerType: "员工",
        created: moment().format(),
        status: 1,
        failReason: "待审",
        imgPath: "http://img4.imgtn.bdimg.com/it/u=2350302849,3323337377&fm=26&gp=0.jpg",
        n: 10,
        isCease: 1,
    },
]; */

function callBack(method, data) {
    if (method) method(data);
}

export default {
    namespace: "pullSale",

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

        effectParam: {
            currentPage: 1,
            pageSize: 10,
            status: 1,
        },
        effectRes: [],
        effectPageRes: {
            total: 0,
        },

        effectBaseInfo: {},
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

        *getTask({ payload }, { put, call }) {
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
        },

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

        *save({ payload, callback }, { call }) {
            let res;
            const { pageType } = payload;
            const url = (pageType === "add" && "CREATE_TASK") || "EDIT_TASK";
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

        *query({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(queryDetail, {
                    url: "QUERY_DETAIL",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "保存成功", "保存失败");
                callBack(callback, resObj);
            }
        },
        /*         *getList({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(post, {
                    url: 'QUERY_LIST',
                    data: payload,
                });
            } finally {
                console.log("res", res);
            }
        }, */

        *getGood({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(queryDetail, {
                    url: "QUERY_GOOD",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "查询成功", "查询成功");
                callBack(callback, resObj);
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

        *getEffectBaseInfo({ payload, callback }, { put, call, select }) {
            const { effectParam } = yield select(state => state.pullSale);
            let res;
            try {
                res = yield call(queryDetail, {
                    url: "GET_EFFECT_BASEINFO",
                    data: payload,
                });
            } finally {
                const { success, data } = res;
                if (success && data) {
                    yield put({
                        type: "updateState",
                        payload: {
                            effectBaseInfo: data,
                            effectParam: Object.assign({}, effectParam, payload),
                        },
                    });
                }
                const resObj = genMsg(res, "查询成功", "查询成功");
                callBack(callback, resObj);
            }
        },

        *getEffectDetail({ payload, callback }, { put, call, select }) {
            const { effectParam, effectPageRes: pageParam } = yield select(state => state.pullSale);
            const updateData = Object.assign({}, cloneDeep(effectParam), payload);
            yield put({
                type: "updateState",
                payload: {
                    effectParam: updateData,
                },
            });
            let res;
            try {
                const { status } = updateData;
                const req = Object.assign({}, omit(updateData, ["status"]), status === 1 ? { statusArr: [1, 4] } : { status });
                res = yield call(post, {
                    url: "GET_EFFECT_DETAIL",
                    data: req,
                });
            } finally {
                const { data: { result: data, totalCount: total } = {}, success } = res || {};
                if (success) {
                    const resData = data ? { effectRes: data, effectPageRes: Object.assign({}, pageParam, { total }) } : {};
                    yield put({
                        type: "updateState",
                        payload: {
                            // effectParam: updateData,
                            ...resData,
                        },
                    });
                }

                const resObj = genMsg(res, "查询列表成功", "查询列表失败");

                callBack(callback, resObj);
            }
        },

        *doApproval({ payload, callback }, { put, call }) {
            let res;
            try {
                res = yield call(post, {
                    url: "APPROVAL",
                    data: payload,
                });
            } finally {
                const { success } = res || {};
                if (success) {
                    // 查询列表
                    yield put({ type: "getEffectDetail", payload: {} });
                }
                const resObj = genMsg(res, "审批成功", "审批失败");
                callBack(callback, resObj);
            }
        },

        *doExport({ payload }, { call }) {
            try {
                yield call(doExport, {
                    url: "EXPORT",
                    data: payload,
                });
            } finally {
                /* const resObj = genMsg(res, "导出成功", "导出失败");
                callBack(callback, resObj); */
            }
        },
        *getEeffectFull({ payload, callback }, { call }) {
            let res;
            try {
                res = yield call(post, {
                    url: "FULL_DATA",
                    data: payload,
                });
            } finally {
                const resObj = genMsg(res, "获取全部数据成功", "获取全部数据失败");
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
