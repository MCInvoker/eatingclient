import Taro from '@tarojs/taro';
import { urlLogin } from '../api/api';

let fetchingToken = false;
let tokenPromiseResolve;
let tokenPromiseReject;
let tokenPromise = new Promise((resolve, reject) => {
    tokenPromiseResolve = resolve;
    tokenPromiseReject = reject;
});

// 获取 token 的函数
export const getToken = async () => {
    if (fetchingToken) {
        // 如果已经在获取 token，则等待当前获取 token 的 promise 完成
        return tokenPromise;
    }

    fetchingToken = true;
    Taro.showLoading({
        title: '登录中～',
        mask: true
    });

    try {
        const { code } = await Taro.login();
        const res = await Taro.request({
            url: urlLogin,
            method: 'POST',
            data: {code}
        });
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const newToken = res.data.token;
            Taro.setStorageSync('token', newToken); // 存储新获取的 token
            tokenPromiseResolve(newToken);
            return newToken;
        } else {
            throw new Error('Failed to get token');
        }
    } catch (error) {
        tokenPromiseReject(error);
        console.error('Error while getting token:', error);
        throw error;
    } finally {
        fetchingToken = false;
        Taro.hideLoading();
        // 重置 tokenPromise 以便下一次可以重新开始
        tokenPromise = new Promise((resolve, reject) => {
            tokenPromiseResolve = resolve;
            tokenPromiseReject = reject;
        });
    }
};

// 封装请求方法
const request = async (options) => {
    let token = Taro.getStorageSync('token');
    if (!token) {
        token = await getToken();
    }

    options.header = { ...options.header, authorization: `Bearer ${token}` };
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
export const get = (url, data = {}, header = {}) => {
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
export const post = (url, data = {}, header = {}) => {
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
export const put = (url, data = {}, header = {}) => {
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
export const del = (url, data = {}, header = {}) => {
    return request({
        url,
        method: 'DELETE',
        data,
        header,
    });
};