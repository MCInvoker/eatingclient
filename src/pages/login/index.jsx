import { View } from "@tarojs/components"
import { useEffect } from "react";
import { post } from '../../utils/request'
import Taro from "@tarojs/taro";
import './index.scss'

export default function Login () {
    useEffect(() => {
        // 登录函数
        async function wxLogin () {
            try {
                const res = await Taro.login({
                    success: function (res) {
                        if (res.code) {
                            // 成功获取到登录凭证 code 后，发送到服务器换取 openid 和 session_key
                            sendCodeToServer(res.code);
                        } else {
                            console.error('Failed to get login code');
                        }
                    },
                    fail: function (err) {
                        console.error('Taro.login failed with error:', err);
                    }
                });
            } catch (error) {
                console.error('Error during Taro.login:', error);
            }
        }

        // 发送 code 到后端
        function sendCodeToServer (code) {
            const fetchData = async () => {
                try {
                    const response = await post('http://localhost:7002/eating/user/login', { code });
                    Taro.setStorageSync('token', response.token)
                    // 回上一个页面
                    Taro.navigateBack()
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData()
        }
        wxLogin()
    }, [])

    return (
        <View className="login">加载中...</View>
    )
}