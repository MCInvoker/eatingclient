
import Taro, { useLaunch } from '@tarojs/taro'

import './app.scss'

function App ({ children }) {
    useLaunch(() => {
        // Taro.navigateTo({ url: '/pages/login/index' })
    })

    // children 是将要会渲染的页面
    return children
}



export default App
