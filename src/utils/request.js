import Taro from '@tarojs/taro';

// 封装请求方法
const request = (options) => {
    return new Promise((resolve, reject) => {
        Taro.request({
            ...options,
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                } else {
                    reject(res);
                }
            },
            fail: (error) => {
                reject(error);
            }
        });
    });
};

/**
 * 封装 get 方法
 * @param {String} url
 * @param {Object} data
 * @param {Object} [header]
 * @returns {Promise}
 */
export const get = (url, data = {}, header = {
    authorization: `Bearer ${Taro.getStorageSync('token')}`
}) => {
    return request({
        url,
        method: 'GET',
        data,
        header,
    });
};

/**
 * 封装 post 请求
 * @param {String} url
 * @param {Object} data
 * @param {Object} [header]
 * @returns {Promise}
 */
export const post = (url, data = {}, header = {
    authorization: `Bearer ${Taro.getStorageSync('token')}`
}) => {
    return request({
        url,
        method: 'POST',
        data,
        header,
    });
};

/**
 * 封装 put 请求
 * @param {String} url
 * @param {Object} data
 * @param {Object} [header]
 * @returns {Promise}
 */
export const put = (url, data = {}, header = {
    authorization: `Bearer ${Taro.getStorageSync('token')}`
}) => {
    return request({
        url,
        method: 'PUT',
        data,
        header,
    });
};

/**
 * 封装 delete 请求
 * @param {String} url
 * @param {Object} data
 * @param {Object} [header]
 * @returns {Promise}
 */
export const del = (url, data = {}, header = {
    authorization: `Bearer ${Taro.getStorageSync('token')}`
}) => {
    return request({
        url,
        method: 'DELETE',
        data,
        header,
    });
};