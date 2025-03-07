import { View, Text, Image } from "@tarojs/components"
import Taro, { useShareAppMessage } from "@tarojs/taro"
import "./index.scss"
import { useEffect, useState } from "react"
import { getOrderDetail } from "../../api/order"
import { useRequest } from "ahooks"
import { URL_avatar, URL_chefHat, URL_tableware, URL_food } from "../../assets/imageOssUrl"
import { formatDate } from "../../utils/utils"

const OrderDetail = () => {
    const [orderId, setOrderId] = useState('');
    const [orderDetail, setOrderDetail] = useState({
        orderId: '',
        chef: {
            userId: '',
            nickname: '',
            avatar: '',
            title: ''
        },
        customer: {
            userId: '',
            nickname: '',
            avatar: '',
            title: ''
        },
        orderTime: '',
        dishes: [],
        note: '',
        status: ''
    });

    // 分享菜单给好友
    useShareAppMessage(() => ({
        title: `看看点了什么美味吧！`, // 动态生成分享标题
        path: `/pages/orderDetail/index?id=${orderId}`, // 动态生成分享路径
        // imageUrl: chefInfo.avatar ? chefInfo.avatar : URL_avatar, // 分享图片 URL
    }));

    // 获取订单详情
    const { run: getOrderDetailFn } = useRequest(getOrderDetail, {
        manual: true,
        onSuccess: (res) => {
            setOrderDetail(res.data)
        }
    });

    // 获取订单ID
    useEffect(() => {
        const { router } = Taro.getCurrentInstance();
        const { id } = router.params;
        setOrderId(id);
    }, [])

    // 获取订单详情
    useEffect(() => {
        if (orderId) {
            getOrderDetailFn(orderId)
        }
    }, [orderId])

    // 预览图片
    const handlePreviewImage = (urls, current) => {
        Taro.previewImage({
            urls: urls,
            current: current
        })
    }

    const renderChefInfo = (userInfo) => {
        return (
            <View className='chefInfo userInfo'>
                <Image className='chefHat' src={URL_chefHat} />
                <Image mode="aspectFill" className='avatar' src={userInfo.avatar || URL_avatar} />
                <View className='userInfoRight'>
                    <Text className='nickname'>{userInfo.nickname}</Text>
                    {userInfo.title && (
                        <View className='titles'>
                            <Text className='title'>{userInfo.title}</Text>
                        </View>
                    )}
                </View>
            </View>
        )
    }

    const renderCustomerInfo = (userInfo) => {
        return (
            <View className='customerInfo userInfo'>
                <Image className='tableware' src={URL_tableware} />
                <Image mode="aspectFill" className='avatar' src={userInfo.avatar || URL_avatar} />
                <View className='userInfoRight'>
                    <Text className='nickname'>{userInfo.nickname}</Text>
                    {userInfo.title && (
                        <View className='titles'>
                            <Text className='title'>{userInfo.title}</Text>
                        </View>
                    )}
                </View>
            </View>
        )
    }

    // 渲染订单状态
    const renderStatus = () => {
        return (
            <View className='statusBox'>
                {/* <Text className='status'>{orderDetail.status === '1' ? '待接单' : '已接单'}</Text> */}
                <Text className='orderTime'>{orderDetail.orderTime ? formatDate(orderDetail.orderTime, 'YYYY-MM-DD HH:mm TY') : '-'}</Text>
            </View>
        )
    }

    // 渲染菜品列表
    const renderDishes = () => {
        console.log(orderDetail.dishes)
        return (
            <View className='dishes'>
                {orderDetail.dishes.map((item) => {
                const dish = item.dish;
                    return (
                        <View className="smallImageDishLi" key={dish.dish_id}>
                            <View className="smallImageDishLiTop">
                                <Image
                                    mode="aspectFill"
                                    className='smallImageDishLiImg'
                                    src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : URL_food}
                                    onClick={() => handleImage(dish)}
                                />
                                <View className="smallImageDishLiNameDescription">
                                    <Text className="smallImageDishLiName">{dish.name}{item.quantity > 1 && `*(${item.quantity})`}</Text>
                                    <Text className="smallImageDishLiDescription">{dish.description}</Text>
                                </View>
                            </View>
                        </View>
                    )
                })}
            </View>
        )
    }

    // 渲染订单备注
    const renderNote = () => {
        return orderDetail.note && (
            <View className='noteBox'>
                <Text className='noteTitle'>订单备注</Text>
                <Text className='noteContent'>{orderDetail.note}</Text>
            </View>
        )
    }

    return (
        <View className='orderDetailPage'>
            {renderChefInfo(orderDetail.chef)}
            {renderCustomerInfo(orderDetail.customer)}
            {renderStatus()}
            {renderDishes()}
            {renderNote()}
        </View>
    )
}

export default OrderDetail 