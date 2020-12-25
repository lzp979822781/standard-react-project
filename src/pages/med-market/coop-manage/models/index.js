// eslint-disable-next-line no-unused-vars
import cloneDeep from "lodash/cloneDeep";
import { splitData, genMsg } from "@/utils/utils";
import {
    // eslint-disable-next-line no-unused-vars
    get,
    post,
    doExport,
} from "../services";

function wrapperCall(method, data) {
    if (method) method(data);
}

/* const originalData = [
    {
        "actDateList": [
            "2019年10月28日-2019年10月30日"
        ],
        "actNameList": [
            "陈列：陈列活动测试101"
        ],
        "annex": "",
        "companyName": "",
        "contractCode": "",
        "created": 1571899403000,
        "creator": "test0719",
        "endTime": 1571985989000,
        "id": 166,
        "income": 34,
        "incomeText": "34",
        "modified": 1571899406000,
        "modifier": "test0718",
        "preSpend": 1340000,
        "remark": "wwww",
        "returnTime": 1571899502000,
        "startTime": 1571726782000,
        "status": 1,
        "taskName": "测试任务",
        "venderId": 600803,
        "verifyList": [],
        "verifyPreSpend": 34,
        "verifyStatus": 1,
        "yn": 1
    },
    {
        "actDateList": [
            "2019年10月26日-2019年10月28日",
            "2019年10月28日-2019年10月31日",
            "2019年10月28日-2019年10月31日",
            "2019年10月28日-2019年10月31日",
            "2019年11月02日-2019年11月21日",
            "2019年11月06日-2019年11月20日",
            "2019年11月06日-2019年11月08日"
        ],
        "actNameList": [
            "培训：编辑京采说测试02",
            "采购：采购101",
            "采购：采购102",
            "采购：采购103",
            "培训：编辑用心看活动测试01",
            "培训：用心看活动测试02",
            "陈列：陈列108"
        ],
        "annex": "",
        "companyName": "测试公司06125",
        "contractCode": "",
        "created": 1571902972000,
        "creator": "test_06125",
        "endTime": 1577635200000,
        "id": 169,
        "income": 200,
        "incomeText": "200",
        "modified": 1571902972000,
        "modifier": "test_06125",
        "preSpend": 1000000,
        "remark": "str",
        "returnTime": 1568024851000,
        "startTime": 1571846400000,
        "status": 1,
        "taskName": "活动任务test004",
        "venderId": 48384,
        "verifyList": [],
        "verifyStatus": 1,
        "yn": 1
    },
    {
        "actDateList": [
            "2019年10月30日-2019年11月01日",
            "2019年11月01日-2019年11月03日",
            "2019年11月01日-2019年11月03日"
        ],
        "actNameList": [
            "培训：京采说活动测试03",
            "采购：采购104",
            "陈列：陈列活动106"
        ],
        "annex": "",
        "companyName": "测试公司06125",
        "contractCode": "",
        "created": 1571905187000,
        "creator": "test_06125",
        "endTime": 1577635200000,
        "id": 170,
        "income": 200,
        "incomeText": "200",
        "modified": 1571905187000,
        "modifier": "test_06125",
        "preSpend": 1000000,
        "remark": "str",
        "returnTime": 1568024851000,
        "startTime": 1571846400000,
        "status": 1,
        "taskName": "new活动任务test004",
        "venderId": 48384,
        "verifyList": [],
        "verifyStatus": 1,
        "yn": 1
    }
]; */

// const filterData = splitData(originalData, "actNameList", "actDateList");

// console.log("new data", filterData);

export default {
    namespace: "market",

    state: {
        pageReq: {
            currentPage: 1,
            pageSize: 10,
        },

        pageRes: {
            total: 10,
            data: [],
        },

        editRow: undefined,
    },

    effects: {
        *queryData({ payload, callback }, { put, call, select }) {
            const { pageReq } = yield select(state => state.market);
            const updateData = Object.assign({}, cloneDeep(pageReq), payload);
            yield put({
                type: "updateState",
                payload: {
                    pageReq: updateData,
                },
            });
            const finalData = Object.assign({}, cloneDeep(updateData), {
                currentPage: updateData.currentPage,
            });
            // 兼容查询 审批字段值为全部时，需删除status字段
            const { status } = finalData;
            if (typeof status !== "undefined" && status === "") {
                delete finalData.status;
            }

            let res;
            try {
                res = yield call(post, {
                    url: "GET_DATA",
                    data: finalData,
                });
            } finally {
                if (res.success) {
                    // const { data: { result } = {}, totalCount: total = 10, currentPage: current = 1 } = res;
                    const { result: data = [], totalCount: total = 10 } = res.data;
                    // data = splitData(data, "paticipatedActs", "actTime");
                    yield put({
                        type: "updateState",
                        payload: {
                            pageRes: {
                                total,
                                data: splitData(data, "actNameList", "actDateList"),
                            },
                        },
                    });
                }

                const resObj = genMsg(res, "请求成功", "请求失败");
                wrapperCall(callback, resObj);
            }
        },

        *queryDetail({ payload, callBack }, { call, put }) {
            const detailParam = {
                url: "GET_DETAIL",
                data: payload,
            };
            let res;
            try {
                res = yield call(get, detailParam) || {};
            } finally {
                const { data, success = false } = res;
                if (success) {
                    yield put({
                        type: "updateState",
                        payload: {
                            editRow: data || {},
                        },
                    });
                }

                if (callBack) callBack(data || {}, success && data);
            }
        },

        *commonSave({ payload, callBack, pageType }, { call }) {
            let res;
            const reqParam = {
                url: pageType === "add" ? "CREATE_TASK" : "EDIT_TASK",
                data: payload,
            };
            try {
                res = yield call(post, reqParam);
            } finally {
                const { success = false, msg = "创建失败" } = res;
                const info = { msg: success ? "创建成功" : msg, msgType: success ? "success" : "error" };
                if (callBack) callBack(info);
            }
        },
        *doExport({ payload }, { select, call }) {
            const { pageReq } = yield select(state => state.market);
            yield call(doExport, {
                url: "EXPORT",
                data: { ...pageReq, ...payload },
            }) || {};
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
