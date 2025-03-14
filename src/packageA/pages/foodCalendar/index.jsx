import { View, Text, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getUserDish } from '../../../api/dish'
import { URL_avatar } from '../../../assets/imageOssUrl'
import Drawer from '../../../components/Drawer'
import './index.scss'

const MEAL_TYPES = {
    BREAKFAST: 'breakfast',
    LUNCH: 'lunch',
    DINNER: 'dinner',
}

const MEAL_NAMES = {
    [MEAL_TYPES.BREAKFAST]: '早餐',
    [MEAL_TYPES.LUNCH]: '午餐',
    [MEAL_TYPES.DINNER]: '晚餐',
}

const FoodCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedMealType, setSelectedMealType] = useState(null)
    const [dishes, setDishes] = useState([])
    const [calendarData, setCalendarData] = useState({})
    const [showDishDrawer, setShowDishDrawer] = useState(false)

    // 获取日期范围
    const getDateRange = () => {
        const today = new Date()
        const dates = []
        
        // 前天
        const beforeYesterday = new Date(today)
        beforeYesterday.setDate(today.getDate() - 2)
        dates.push({
            date: beforeYesterday,
            type: 'history'
        })

        // 昨天
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        dates.push({
            date: yesterday,
            type: 'history'
        })

        // 今天
        dates.push({
            date: today,
            type: 'today'
        })

        // 未来7天
        for (let i = 1; i <= 7; i++) {
            const futureDate = new Date(today)
            futureDate.setDate(today.getDate() + i)
            dates.push({
                date: futureDate,
                type: 'future'
            })
        }

        return dates
    }

    // 格式化日期
    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    // 格式化显示日期
    const formatDisplayDate = (date) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        const beforeYesterday = new Date(today)
        beforeYesterday.setDate(today.getDate() - 2)

        if (date.toDateString() === today.toDateString()) {
            return '今天'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return '昨天'
        } else if (date.toDateString() === beforeYesterday.toDateString()) {
            return '前天'
        } else {
            return `${date.getMonth() + 1}月${date.getDate()}日`
        }
    }

    // 加载菜品数据
    const loadDishes = async () => {
        const userInfo = Taro.getStorageSync('currentUserInfo')
        if (!userInfo?.user_id) return

        try {
            const res = await getUserDish({
                userId: userInfo.user_id
            })
            if (res?.data) {
                setDishes(res.data)
            }
        } catch (error) {
            console.error('获取菜品失败：', error)
        }
    }

    // 加载日历数据
    const loadCalendarData = () => {
        const savedData = Taro.getStorageSync('foodCalendar') || {}
        setCalendarData(savedData)
    }

    // 选择日期和餐次
    const handleDateSelect = (date, mealType) => {
        setSelectedDate(date)
        setSelectedMealType(mealType)
        setShowDishDrawer(true)
    }

    // 选择菜品
    const handleDishSelect = (dish) => {
        if (!selectedDate || !selectedMealType) return

        const dateStr = formatDate(selectedDate)
        const newCalendarData = {
            ...calendarData,
            [dateStr]: {
                ...calendarData[dateStr],
                [selectedMealType]: dish
            }
        }

        setCalendarData(newCalendarData)
        Taro.setStorageSync('foodCalendar', newCalendarData)
        setShowDishDrawer(false)
    }

    // 获取日期餐次数据
    const getDateMealData = (dateStr) => {
        return calendarData[dateStr] || {}
    }

    // 渲染餐次预览
    const renderMealPreview = (dateStr, mealType) => {
        const mealData = getDateMealData(dateStr)
        const dish = mealData[mealType]
        
        if (!dish) return null

        return (
            <View className='mealPreview'>
                <Image className='dishImage' src={dish.image || URL_avatar} mode='aspectFill' />
                <Text className='dishName'>{dish.name}</Text>
            </View>
        )
    }

    useEffect(() => {
        loadDishes()
        loadCalendarData()
    }, [])

    const dateRange = getDateRange()

    return (
        <View className='foodCalendar'>
            <View className='dateList'>
                {dateRange.map((item, index) => {
                    const dateStr = formatDate(item.date)
                    const mealData = getDateMealData(dateStr)
                    
                    return (
                        <View
                            key={index}
                            className={`dateCard ${item.type}`}
                        >
                            <View className='dateHeader'>
                                <Text className='dateText'>{formatDisplayDate(item.date)}</Text>
                                <View className='mealButtons'>
                                    {Object.entries(MEAL_TYPES).map(([key, value]) => (
                                        <Text
                                            key={value}
                                            className='mealButton'
                                            onClick={() => handleDateSelect(item.date, value)}
                                        >
                                            {MEAL_NAMES[value]}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                            <View className='mealsContainer'>
                                {renderMealPreview(dateStr, MEAL_TYPES.BREAKFAST)}
                                {renderMealPreview(dateStr, MEAL_TYPES.LUNCH)}
                                {renderMealPreview(dateStr, MEAL_TYPES.DINNER)}
                            </View>
                        </View>
                    )
                })}
            </View>

            <Drawer
                isOpen={showDishDrawer}
                onClose={() => setShowDishDrawer(false)}
                title={`选择${MEAL_NAMES[selectedMealType]}`}
                bodyRender={() => (
                    <View className='dishList'>
                        {dishes.map(dish => (
                            <View
                                key={dish.dish_id}
                                className='dishItem'
                                onClick={() => handleDishSelect(dish)}
                            >
                                <Image className='dishImage' src={dish.image || URL_avatar} mode='aspectFill' />
                                <View className='dishInfo'>
                                    <Text className='dishName'>{dish.name}</Text>
                                    {dish.description && (
                                        <Text className='dishDescription'>{dish.description}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                drawerStyle={{
                    backgroundColor: "#F7F7F7"
                }}
            />
        </View>
    )
}

export default FoodCalendar 