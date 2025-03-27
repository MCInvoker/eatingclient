// 点餐记录列表页
import { View, ScrollView, Text, Image } from "@tarojs/components"
import { useState, useEffect } from "react";
import { useRequest } from "ahooks";
import { getMyOrderHistoryList } from "../../api/order";
import Taro, { useDidShow } from "@tarojs/taro";
import { formatDate } from "../../utils/utils";
import { URL_avatar, URL_right } from "../../assets/imageOssUrl";
import CurrentDate from "../../components/CurrentDate";
import Toast from "../../components/Toast";
import "./index.scss";

const pageSize = 10;

const MyOrderHistory = () => {
    const [page, setPage] = useState(1);
    const [orderList, setOrderList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const { run: getMyOrderHistoryListFn } = useRequest(getMyOrderHistoryList, {
        manual: true,
        onSuccess: (res) => {
            setPage(page + 1)
            setOrderList([...orderList, ...res.data.orders])
            setTotalPages(res.data.totalPages)
        }
    })

    useEffect(() => {
        const routerParams = Taro.getCurrentInstance().router.params;
        if (routerParams.showToast) {
            setShowToast(true);
        }
    }, [])

    useDidShow(() => {
        setPage(1)
        setOrderList([])
        setTotalPages(1)
        getMyOrderHistoryListFn({
            page: 1,
            pageSize
        })
    })

    const handleGetData = () => {
        if (page > totalPages) {
            return
        }
        getMyOrderHistoryListFn({
            page,
            pageSize
        })
    }

    // 跳转到订单详情
    const handleToDetail = (orderId) => {
        Taro.navigateTo({
            url: `/pages/orderDetail/index?id=${orderId}`
        })
    }

    const toastMessages = [
        "厨师还没有订阅餐食计划通知",
        "你可以查看美食回忆详情，分享美食故事",
        "你可以通过微信或其他方式通知对方你的餐食计划",
        "期待与厨师分享更多美食故事"
    ];

    return (
        <View className="myOrderPage">
            <ScrollView
                className='myOrderScrollView'
                scrollY
                scrollWithAnimation
                onScrollToLower={() => handleGetData()}
            >
                <CurrentDate />
                <Toast 
                    visible={showToast}
                    title="温馨提示"
                    messages={toastMessages}
                    onClose={() => setShowToast(false)}
                />
                <View className="orders">
                    {
                        orderList.map((order) => {
                            return (
                                <View className="order">
                                    <View className="orderContent">
                                    <View className="orderTop">
                                        <Image className="avatar" src={order?.Chef?.avatar || URL_avatar} />
                                        <View className="nameTime">
                                            <Text className="name">{order?.Chef?.nickname}</Text>
                                            <Text className="createdAt">{formatDate(order.updated_at, 'YYYY-MM-DD HH:mm TY')}</Text>
                                        </View>
                                    </View>
                                    <View className="dishes">
                                        {order.order_dish_details.map((dish, dishIndex) => {
                                            return (
                                                <View className="dishBox">
                                                    <Text className="dishName">{dish.dish.name}</Text>
                                                    {dish.quantity > 1 && <Text className="dishQuantity">*{dish.quantity}</Text>}
                                                </View>
                                            )
                                        })}
                                    </View>
                                    {order.note && (
                                        <Text className="note">
                                            {order.note}
                                            </Text>
                                        )}
                                    </View>
                                    <View 
                                        className="toDetailButton"
                                        onClick={() => handleToDetail(order.order_id)}
                                    >
                                        <Image className="rightIcon" src={URL_right} />
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>
            </ScrollView>
        </View>
    )
}

export default MyOrderHistory;