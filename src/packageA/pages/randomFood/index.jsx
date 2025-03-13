import { View, Text, Button, Image } from '@tarojs/components'
import { useState, useEffect, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { getUserDish } from '../../../api/dish'
import { getFollow } from '../../../api/follow'
import Drawer from '../../../components/Drawer'
import { URL_avatar } from '../../../assets/imageOssUrl';
import './index.scss'

// 预定义一些柔和的背景色
const bgColors = [
    '#E8F5E9', // 淡绿
    '#F3E5F5', // 淡紫
    '#E3F2FD', // 淡蓝
    '#FFF3E0', // 淡橙
    '#F1F8E9', // 青绿
    '#E0F7FA', // 青蓝
    '#FBE9E7', // 淡红
    '#F9FBE7', // 淡黄
    '#EFEBE9', // 淡棕
    '#E8EAF6'  // 靛蓝
]

const RandomFood = () => {
    const [dishes, setDishes] = useState([])
    const [isRandomizing, setIsRandomizing] = useState(false)
    const [highlightIndex, setHighlightIndex] = useState(-1)
    const [selectedDish, setSelectedDish] = useState(null)
    const [showUserDrawer, setShowUserDrawer] = useState(false)
    const [userList, setUserList] = useState([])
    const [currentUser, setCurrentUser] = useState(null)

    // 为每个菜品分配一个固定的随机背景色和样式
    const dishStyles = useMemo(() => {
        return dishes.map(() => ({
            backgroundColor: bgColors[Math.floor(Math.random() * bgColors.length)],
            fontSize: Math.random() * 20 + 24,
            rotate: Math.random() * 30 - 15,
            top: Math.random() * 20 - 10,
            left: Math.random() * 20 - 10,
            delay: Math.random() * 2, // 添加随机延迟
        }))
    }, [dishes])

    // 获取用户列表
    const loadUserList = async () => {
        const userInfo = Taro.getStorageSync('currentUserInfo')
        if (!userInfo?.user_id) return

        try {
            const res = await getFollow({
                userId: userInfo.user_id
            })
            if (res?.data) {
                const me = res.data.currentUser;
                const newFollows = res.data.followingList.map((item) => {
                    return {
                        ...item.following
                    }
                })
                setUserList([me, ...newFollows])
                setCurrentUser(me)
                loadDishes(userInfo.user_id)
            }
        } catch (error) {
            console.error('获取用户列表失败：', error)
        }
    }

    useEffect(() => {
        loadUserList()
    }, [])

    // 加载菜品数据
    const loadDishes = async (userId) => {
        try {
            const res = await getUserDish({
                userId: userId
            })
            if (res?.data) {
                setDishes(res.data)
                // 重置状态
                setHighlightIndex(-1)
                setSelectedDish(null)
                setIsRandomizing(false)
            }
        } catch (error) {
            console.error('获取菜品失败：', error)
            setDishes(mockDishes)
        }
    }

    // 切换用户
    const handleUserSelect = (user) => {
        setCurrentUser(user)
        setShowUserDrawer(false)
        loadDishes(user.user_id)
    }

    // 随机选择效果
    const handleRandomize = () => {
        if (isRandomizing || dishes.length === 0) return
        setIsRandomizing(true)
        setSelectedDish(null)

        let count = 0
        const maxCount = 20 // 随机切换次数
        const interval = 100 // 初始切换间隔（毫秒）

        const randomize = () => {
            const randomIndex = Math.floor(Math.random() * dishes.length)
            setHighlightIndex(randomIndex)
            count++

            if (count < maxCount) {
                // 逐渐增加间隔时间，使动画变慢
                const nextInterval = interval + (count * 20)
                setTimeout(randomize, nextInterval)
            } else {
                // 最终选中
                setSelectedDish(dishes[randomIndex])
                setIsRandomizing(false)
            }
        }

        randomize()
    }

    // 重新开始
    const handleReset = () => {
        setHighlightIndex(-1)
        setSelectedDish(null)
        setIsRandomizing(false)
    }

    // 去点餐
    const handleOrder = () => {
        if (!selectedDish) return
        // TODO: 跳转到对应的点餐页面
        Taro.navigateTo({
            url: `/pages/order/index?id=${selectedDish.user_id}&dish_id=${selectedDish.dish_id}`,

        })
    }

    return (
        <View className='randomFood'>
            <View className='userHeader' onClick={() => setShowUserDrawer(true)}>
                <Text className='userTitle'>{currentUser?.nickname || '我的'}的菜谱</Text>
                <Text className='switchIcon'>切换</Text>
            </View>

            <View className='content'>
                {dishes.length > 0 ? (
                    <View className='wordCloud'>
                        {dishes.map((dish, index) => {
                            const style = dishStyles[index]
                            const isHighlight = highlightIndex === index
                            const isSelected = selectedDish?.dish_id === dish.dish_id

                            return (
                                <View
                                    key={dish.dish_id}
                                    className='wordWrapper'
                                    style={{
                                        transform: `translate(${style.left}rpx, ${style.top}rpx)`,
                                    }}
                                >
                                    <Text
                                        className={`word ${isHighlight ? 'highlight' : ''} ${isSelected ? 'selected' : ''}`}
                                        style={{
                                            fontSize: `${style.fontSize}rpx`,
                                            transform: `rotate(${style.rotate}deg)`,
                                            backgroundColor: isHighlight || isSelected ? undefined : style.backgroundColor,
                                            opacity: highlightIndex === -1 || isHighlight ? 1 : 0.8,
                                            '--rotate': `${style.rotate}deg`,
                                            '--delay': `${style.delay}s`
                                        }}
                                    >
                                        {dish.name}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                ) : (
                    <View className='empty'>
                        <Text>还没有添加任何菜品哦</Text>
                    </View>
                )}

                <View className='buttons'>
                    {!selectedDish ? (
                        <Button
                            className='randomButton'
                            onClick={handleRandomize}
                            disabled={isRandomizing || dishes.length === 0}
                        >
                            {isRandomizing ? '正在选择...' : '开始随机'}
                        </Button>
                    ) : (
                        <View className='resultButtons'>
                            <Button className='resetButton' onClick={handleReset}>
                                再来一次
                            </Button>
                            <Button className='orderButton' onClick={handleOrder}>
                                去点餐
                            </Button>
                        </View>
                    )}
                </View>

                {selectedDish && (
                    <View className='result'>
                        <Text className='resultTitle'>今天推荐您吃：</Text>
                        <Text className='dishName'>{selectedDish.name}</Text>
                        {selectedDish.description && (
                            <Text className='dishDescription'>{selectedDish.description}</Text>
                        )}
                    </View>
                )}
            </View>

            <Drawer
                isOpen={showUserDrawer}
                onClose={() => setShowUserDrawer(false)}
                title='选择菜谱'
                bodyRender={() => {
                    return (
                        <View className='userList'>
                            {userList.map(user => {
                                return (
                                    <View
                                        key={user.user_id}
                                        className={`userItem ${currentUser?.user_id === user.user_id ? 'active' : ''}`}
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <Image className='avatar' src={user.avatar || URL_avatar} mode='aspectFill' />
                                        <Text className='nickname'>{user.nickname}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    )
                }}
                drawerStyle={{
                    backgroundColor: "#F7F7F7"
                }}
            />
        </View>
    )
}

export default RandomFood 