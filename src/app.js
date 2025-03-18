import Taro, { useLaunch } from '@tarojs/taro'
import { getToken } from './utils/request'
import './app.scss'

function App ({ children }) {
    useLaunch(async () => {
        try {
            // // 检查小程序版本
            // const systemInfo = Taro.getSystemInfoSync()
            // const currentVersion = systemInfo.version
            // const storedVersion = Taro.getStorageSync('app_version')
            
            // if (storedVersion !== currentVersion) {
            //     // 版本不同,清除缓存
            //     Taro.clearStorageSync()
            //     // 存储新版本号
            //     Taro.setStorageSync('app_version', currentVersion)
            // }

            Taro.setStorageSync('token', ""); // 防止后端重启服务后 老token导致的错误
            await getToken();
        } catch (error) {
            console.error('Failed to get token during launch:', error);
        }
    })

    // children 是将要会渲染的页面
    return children
}



export default App
