import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.scss'
import { URL_dishTag, URL_dishCategory, URL_orderHistory, URL_orderList, URL_avatar, URL_blindBox, URL_userManual, URL_about, URL_subscribed, URL_unsubscribed } from '../../assets/imageOssUrl'
import { useState, useMemo } from 'react'
import { getUserDetails } from "../../api/user";
import { useRequest } from 'ahooks';

const otherInletList = [
    {
        title: '随机食光',
        path: '/packageA/pages/randomFood/index',
        icon: URL_blindBox
    },
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
    },
    // {
    //     title: '美食日历',
    //     path: '/packageA/pages/foodCalendar/index',
    //     icon: URL_about
    // }
]

export default function Me () {
    const [userInfo, setUserInfo] = useState({
        avatar: '',
        nickname: "干饭人",
        title: '',
        titles: [],
        user_code: '',
        subscribe_order_notify: false
    })

    // 获取用户信息 不从缓存中取，主要是想拿最新的值。这个消息还是比较重要的
    const { run: getUserDetailsFn } = useRequest(getUserDetails, {
        manual: true,
        onSuccess: (res) => {
            const currentUserInfo = res.data;
            Taro.setStorageSync('currentUserInfo', currentUserInfo);
            if (currentUserInfo.title) {
                currentUserInfo.titles = currentUserInfo.title.split(',')
            } else {
                currentUserInfo.titles = []
            }
            setUserInfo(currentUserInfo);
        }
    })

    useDidShow(() => {
        Taro.setTabBarStyle({
            backgroundColor: '#ffffff',
        })
        getUserDetailsFn();
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

    const quickInletList = useMemo(() => [
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
            title: "餐食计划", // 订单列表
            path: '/pages/myOrder/index',
            icon: URL_orderList,
            tipIcon: userInfo.subscribe_order_notify ? URL_subscribed : URL_unsubscribed,
        },
        {
            title: '美食回忆', // 点餐记录
            path: '/pages/myOrderHistory/index',
            icon: URL_orderHistory
        },
    ], [userInfo.subscribe_order_notify])

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
                                <View className="iconWrapper">
                                    {quickInletLi.icon && <Image src={quickInletLi.icon} className='inletImg'></Image>}
                                    {quickInletLi.tipIcon && (
                                        <View className="tipWrapper">
                                            <Image src={quickInletLi.tipIcon} className='tipIcon'></Image>
                                        </View>
                                    )}
                                </View>
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
