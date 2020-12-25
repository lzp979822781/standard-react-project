import cloneDeep from 'lodash/cloneDeep';
// import moment from 'moment';
import {
    doVersionSearch,
    get, post
} from '../services/home';

const selOptions = [
    {
        key: 'jack', value: 'Jack',
    },
    {
        key: 'lucy', value: 'Lucy',
    },
    {
        key: 'Yiminghe', value: 'Yiminghe',
    },
];

// const format = 'YYYY-MM-DD HH:mm:ss';
/* const publishData = [
    {
        key: '1',
        version: 'John Brown',
        created: moment().format(format),
        creator: 'New York No. 1 Lake Park',
        online: 2,
        id: '1111'
    },
    {
        key: '2',
        version: 'Jim Green',
        created: moment().format(format),
        creator: 'London No. 1 Lake Park',
        online: 1,
        id: '222222'
    },
    {
        key: '3',
        version: 'Joe Black',
        created: moment().format(format),
        creator: 'Sidney No. 1 Lake Park',
        online: 2,
        id: '33333'
    },
    {
        key: '4',
        version: 'Disabled User',
        created: moment().format(format),
        creator: 'Sidney No. 1 Lake Park',
        online: 2,
        id: '444444'

    },
]; */

/* const sysData = [
    {
        key: '1',
        sysName: 'John Brown',
        sysDes: 32,
        created: moment().format(format),
        creator: 'New York No. 1 Lake Park',
        id: '1111',
    },
    {
        key: '2',
        sysName: 'Jim Green',
        sysDes: 42,
        created: moment().format(format),
        creator: 'London No. 1 Lake Park',
        id: '222222'
    },
]; */

/* const groupData = [
    {
        key: '1',
        profileName: 'John Brown',
        profileTarget: 32,
        des: 'New York No. 1 Lake Park',
        id: '111111'
    },
    {
        key: '2',
        profileName: 'Jim Green',
        profileTarget: 42,
        des: 'London No. 1 Lake Park',
        id: '222222'
    },
    {
        key: '3',
        profileName: 'Joe Black',
        profileTarget: 32,
        des: 'Sidney No. 1 Lake Park',
        id: '33333333'
    },
    {
        key: '4',
        profileName: 'Disabled User',
        profileTarget: 99,
        des: 'Sidney No. 1 Lake Park',
        id: '44444444444'
    },
]; */

const serviceObj = {
    sys: 'DEL_SYS',
    sysEnv: 'DEL_SYS_ENV',

    sysCreate: 'SAVE_SYS',
    sysEnvCreate: 'SAVE_SYS_GROUP',
    sysPubCreate: 'SAVE_SYS_PUB'
}

/* const queryObj = {
    sys: 'query',
    sysEnv: 'queryGroupInfo'
} */

export default {
    namespace: 'home',

    state: {
        sys: {
            data: [],
            totalCount: 30
        },
        sysReq: {
            currentPage: 1,
            pageSize: 10
        },
        selOptions,
        groupReq: {
            sysId: 0,
            profile: 0,
            pageSize: 10,
            currentPage: 1
        },
        groupRes: {
            data: [],
            totalCount: 30,
        },
        publishReq: {
            groupId: 0,
            // online: 1,
            pageSize: 10,
            currentPage: 1
        },
        publishRes: {
            data: [],
            totalCount: 30,
        },
        secretKey: 'fdarwgrg'
    },

    effects: {
        *query({ payload }, { call, put, select }) {
            const { paging } = payload;
            const { sysReq } = yield select(state => state.home);
            const newPaging = Object.assign({}, sysReq, cloneDeep(paging || {}));
            if(paging) {
                yield put({
                    type: 'updateState',
                    payload: {
                        sysReq: newPaging
                    }
                })
            }
            // const res = yield call(getSysInfo, newPaging);
            const res = yield call(post, {
                url: 'GET_SYS',
                data: newPaging
            });
            if(res && res.success) {
                const { data: { data, totalCount } } = res;
                const temp = {
                    sys: {
                        data,
                        totalCount
                    }
                }
                yield put({
                    type: 'updateState',
                    payload: temp
                })
            }
        },

        *getSecretKey({ payload }, { call, put }) {
            const res = yield call(get, {
                url: 'GET_SECRETKEY',
                data: payload
            });
            if(res && res.success) {
                const { data } = res;
                yield put({
                    type: 'updateState',
                    payload: {
                        secretKey: data
                    }
                })
            }
        },

        *delSys({ payload, callback }, { call }) {
            const { funcType, id } = payload;
            let res;
            if(serviceObj[funcType]) {
                try {
                    res = yield call( get, {
                        url: serviceObj[funcType],
                        data: { id }
                    });
                } catch(e) {
                    console.log('删除失败', e);
                } finally {
                    callback( (res && res.success) ? '删除成功' : (res && res.message || '删除失败'));
                }
            } else {
                console.log("请配置删除方法所在页面");
            }
        },

        *sysSave({ payload, callback }, { call }) {
            const { funcType, saveValue } = payload;
            let res;
            if(serviceObj[funcType]) {
                try {
                    res = yield call( post, {
                        url: serviceObj[funcType],
                        data: saveValue
                    });
                } finally {
                    if(callback) {
                        console.log((res && res.success) ? '创建成功' : (res && res.message || '创建失败'));
                        callback( (res && res.success) ? '创建成功' : (res && res.message || '创建失败'))
                    }
                }
            } else {
                console.log("请配置funcType参数");
            }
        },


        /**
         * 查询群组信息
         * @param {object} payload 所有参数所在变量
         * @param {string} sysId 从上个页面传递的系统ID
         * @param {string} currentPage 当前页面索引
         * @param {string} pageSize 页面数据条数
         */
        *queryGroupInfo({ payload }, { call, put, select }) {
            const { groupReq } = yield select(state => state.home);
            const updateData = Object.assign({}, cloneDeep(groupReq), payload);
            yield put({
                type: 'updateState',
                payload: {
                    groupReq: updateData
                }
            })
            const res = yield call(post, {
                url: 'GET_GROUP',
                data: updateData
            });
            if(res && res.success) {
                const { data: { data, totalCount } } = res;
                const temp = {
                    groupRes: {
                        data,
                        totalCount
                    }
                }
                // 直接将groupRes放到payload无法更新属性,是因为浅比较原因
                yield put({
                    type: 'updateState',
                    payload: temp
                })
            }
        },

        *queryPublishDetail({ payload, callback }, { call }) {
            const res = yield call(get, {
                url: 'GET_PUBLISH_DETAIL',
                data: payload
            });
            if(res && res.success && callback) {
                callback(res.data);
            }
        },

        *doPublish({ payload, callback }, { call }) {
            const { record } = payload;
            const res = yield call(get, {
                url: 'RELEASE',
                data: { id: record.id }
            });
            if(res) {
                callback();
            }
        },

        // 发布系统中版本模糊搜索方法
        *doVersionSearch({ payload }, { call }) {
            yield call(doVersionSearch, payload);
        },

        *queryPublishInfo({ payload }, { call, put, select }) {
            const { publishReq } = yield select(state => state.home);
            const updateData = Object.assign({}, cloneDeep(publishReq), payload);
            yield put({
                type: 'updateState',
                payload: {
                    publishReq: updateData
                }
            })
            const res = yield call(post, {
                url: 'GET_PUBLISH_INFO',
                data: updateData
            });
            if(res && res.success) {
                const { data: { data, totalCount } } = res;
                const temp = {
                    publishRes: {
                        data,
                        totalCount
                    }
                };
                yield put({
                    type: 'updateState',
                    payload: temp
                })
            }

        }


    },

    reducers: {
        updateState(state, { payload }) {
            return {
                ...state,
                ...payload
            }
        }
    },
};
