import Taro from '@tarojs/taro';
import { urlLogin } from '../api/api';
import { getUserDetails } from '../api/user';

// 标记是否正在获取token的状态
let fetchingToken = false;
// 用于存储Promise的resolve函数
let tokenPromiseResolve;
// 用于存储Promise的reject函数
let tokenPromiseReject;
// 创建一个Promise用于处理并发的token请求
let tokenPromise = new Promise((resolve, reject) => {
    tokenPromiseResolve = resolve;
    tokenPromiseReject = reject;
});

/**
 * 获取token的函数
 * 使用Promise处理并发请求,避免重复获取token
 * 成功后会将token存储到本地缓存中
 * @returns {Promise<string>} 返回token字符串
 */
export const getToken = async () => {
    // 如果已经在获取token,则返回正在进行中的Promise
    if (fetchingToken) {
        // 等待当前获取token的promise完成
        return tokenPromise;
    }

    // 标记开始获取token
    fetchingToken = true;
    // 显示loading提示
    Taro.showLoading({
        title: '登录中～',
        mask: true
    });

    try {
        // 获取微信登录code
        const { code } = await Taro.login();
        // 发送请求获取token
        const res = await Taro.request({
            url: urlLogin,
            method: 'POST',
            data: {code}
        });
        // 请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const newToken = res.data.token;
            // 将token存储到本地缓存
            Taro.setStorageSync('token', newToken);
            
            // 异步获取用户信息
            getUserDetails().then(userRes => {
                if (userRes.success) {
                    Taro.setStorageSync('currentUserInfo', userRes.data);
                }
            }).catch(error => {
                console.error('获取用户信息失败:', error);
            });
            
            // 使用resolve返回token
            tokenPromiseResolve(newToken);
            return newToken;
        } else {
            throw new Error('Failed to get token');
        }
    } catch (error) {
        // 请求失败时reject错误
        tokenPromiseReject(error);
        console.error('Error while getting token:', error);
        throw error;
    } finally {
        // 重置状态
        fetchingToken = false;
        // 隐藏loading
        Taro.hideLoading();
        // 重置Promise以便下次使用
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