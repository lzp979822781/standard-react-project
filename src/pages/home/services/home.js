import request from '@/utils/request';

const URL = {
    'Test': '/web/sys/getSecretKey',
    'GET_SYS': '/web/sys/list', // 获取系统列表
    'GET_SECRETKEY': '/web/sys/getSecretKey', // 获取秘钥
    'DEL_SYS': '/web/sys/delete', // 系统首页删除URL
    'SAVE_SYS': '/web/sys/create', // 创建系统URL

    'GET_GROUP': '/web/group/list', // 获取集群列表
    'DEL_SYS_ENV': '/web/group/delete', // 集群删除URL
    'SAVE_SYS_GROUP': '/web/group/create', // 创建集群

    "GET_PUBLISH_INFO": '/web/release/list', // 查询发布列表
    'GET_PUBLISH_DETAIL': '/web/release/detail', // 查询发布详情
    'SAVE_SYS_PUB': '/web/release/create', // 创建发布
    "RELEASE": '/web/release/online', // 发布操作
    "VER_SEARCH": 'sys/verSearch',
}

/**
 * 查询发布页面数据
 */
export function getPublishDetail(param) {
    return request( URL.GET_PUBLISH_DETAIL, {
        method: 'GET',
        params: param
    })
}


/**
 * 发布执行函数
 * @returns
 */
export function doRelease(param) {
    return request( URL.RELEASE, {
        method: 'GET',
        params: param
    })
}

/**
 * 系统版本模糊搜索
 * @returns
 */
export function doVersionSearch(param) {
    return request( URL.VER_SEARCH, {
        method: 'POST',
        data: param
    })
}

/**
 *
 *
 * @params {object} param
 */
export function get(param) {
    return request( URL[param.url], {
        method: 'GET',
        params: param.data
    })
}

export function post(param) {
    return request( URL[param.url], {
        method: 'POST',
        data: param.data
    })
}

