
import Taro, { useLaunch } from '@tarojs/taro'
import { getToken } from './utils/request'
import './app.scss'

function App ({ children }) {
    useLaunch(async () => {
        try {
            Taro.setStorageSync('token', ""); // 防止后端重启服务后l老token导致的错误
            await getToken();
        } catch (error) {
            console.error('Failed to get token during launch:', error);
        }
    })

    // children 是将要会渲染的页面
    return children
}



export default App
