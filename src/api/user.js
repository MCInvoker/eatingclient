import Taro from '@tarojs/taro'
import { post, get, put } from '../utils/request';
import { urlLogin, urlUserDetails, urlUserInfo, urlUsercodeCheck, urlSearchUser } from '../api/api';

export const getToken = async () => {
    let token = ''
    try {
        // 登录函数
        async function wxLogin () {
            const res = await Taro.login();
            return res.code
        }

        // 发送 code 到后端
        function sendCodeToServer (code) {
            const fetchData = async () => {
                const response = await post(urlLogin, { code });
                Taro.setStorageSync('token', response.token)
                return response.token
            };
            return fetchData()
        }
        const wxLoginRes = await wxLogin();
        token = await sendCodeToServer(wxLoginRes)
    } catch (error) {
        return ''
    }
    return token
}

// 获取当前用户的详细信息
export const getUserDetails = async () => {
    const res = await get(urlUserDetails)
    return res
}

export const updateUserInfo = async (data) => {
    const res = await put(urlUserInfo, data)
    return res
}

export const getUserInfo = async (data) => {
    const res = await get(urlUserInfo, data)
    return res
}

export const checkUserCode = async (data) => {
    const res = await post(urlUsercodeCheck, data)
    return res
}

// 查找用户
export const searchUser = async (data) => {
    const res = await get(urlSearchUser, data)
    return res
}