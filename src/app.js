
import Taro, { useLaunch } from '@tarojs/taro'
import { getToken } from './utils/request'
import './app.scss'

function App ({ children }) {
    useLaunch(async () => {
        try {
            await getToken();
        } catch (error) {
            console.error('Failed to get token during launch:', error);
        }
    })

    // children 是将要会渲染的页面
    return children
}



export default App
