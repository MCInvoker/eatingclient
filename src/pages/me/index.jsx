import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.scss'
import { URL_dishTag, URL_dishCategory, URL_orderHistory, URL_orderList, URL_avatar, URL_blindBox, URL_userManual, URL_about } from '../../assets/imageOssUrl'
import { useState } from 'react'

const quickInletList = [
    {
        title: '菜肴标签',
        path: '/pages/dishTag/index',
        icon: URL_dishTag
    },
    {
        title: '菜肴分类',
        path: '/pages/dishCategory/index',
        icon: URL_dishCategory
    },
    {
        title: '订单列表',
        path: '/pages/myOrder/index',
        icon: URL_orderList
    },
    {
        title: '点餐记录',
        path: '/pages/myOrderHistory/index',
        icon: URL_orderHistory
    },
]

const otherInletList = [
    // {
    //     title: '美食盲盒',
    //     path: '',
    //     icon: URL_blindBox
    // },
    {
        title: '使用手册',
        path: '/packageA/pages/userManual/index',
        icon: URL_userManual
        // icon: URL_userManualAi
    },
    {
        title: '关于',
        path: '/packageA/pages/about/index',
        icon: URL_about
    }
]

export default function Me () {
    const [userInfo, setUserInfo] = useState({
        avatar: '',
        nickname: "干饭人",
        title: '',
        titles: [],
        user_code: '',
    })


    useDidShow(() => {
        Taro.setTabBarStyle({
            backgroundColor: '#ffffff',
        })
        // 从本地缓存获取用户信息
        const cachedUserInfo = Taro.getStorageSync('currentUserInfo');
        if (cachedUserInfo) {
            if (cachedUserInfo.title) {
                cachedUserInfo.titles = cachedUserInfo.title.split(',')
            } else {
                cachedUserInfo.titles = []
            }
            setUserInfo(cachedUserInfo);
        }
    })

    const handleInlet = (path) => {
        Taro.navigateTo({
            url: path,
        })
    }

    const handleUserInfo = () => {
        Taro.navigateTo({
            url: '/pages/userInfo/index',
        })
    }

    return (
        <View className='me'>
            <View className='userInfo' onClick={() => handleUserInfo()}>
                <Image className='avatar' src={userInfo.avatar ? userInfo.avatar : URL_avatar}></Image>
                <View className='userInfoRight'>
                    <Text className='nickname'>{userInfo.nickname}</Text>
                    {
                        userInfo.titles.length > 0 && <View className='titles'>
                            {userInfo.titles.map((title) => {
                                return (
                                    <Text className='title'>{title}</Text>
                                )
                            })}
                        </View>
                    }
                </View>
            </View>
            <View className='inletsBox'>
                <View className='inletsTitle'>
                    <Text>快捷功能</Text>
                </View>
                <View className='inlets'>
                    {quickInletList.map((quickInletLi) => {
                        return (
                            <View className='inlet' onClick={() => handleInlet(quickInletLi.path)}>
                                {quickInletLi.icon && <Image src={quickInletLi.icon} className='inletImg'></Image>}
                                <Text className='inletTitle'>{quickInletLi.title}</Text>
                            </View>
                        )
                    })}
                </View>
            </View>
            <View className='inletsBox'>
                <View className='inletsTitle'>
                    <Text>其他</Text>
                </View>
                <View className='inlets'>
                    {otherInletList.map((quickInletLi) => {
                        return (
                            <View className='inlet' onClick={() => handleInlet(quickInletLi.path)}>
                                {quickInletLi.icon && <Image src={quickInletLi.icon} className='inletImg'></Image>}
                                <Text className='inletTitle'>{quickInletLi.title}</Text>
                            </View>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}
