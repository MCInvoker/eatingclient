// 点餐记录列表页
import { View, ScrollView, Text, Image } from "@tarojs/components"
import { useState } from "react";
import { useRequest } from "ahooks";
import { getMyOrderHistoryList } from "../../api/order";
import Taro, { useDidShow } from "@tarojs/taro";
import { formatDate } from "../../utils/utils";
import { URL_avatar, URL_right } from "../../assets/imageOssUrl";
import CurrentDate from "../../components/CurrentDate";
import "./index.scss";

const MyOrderHistory = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [orderList, setOrderList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const { run: getMyOrderHistoryListFn } = useRequest(getMyOrderHistoryList, {
        manual: true,
        onSuccess: (res) => {
            setPage(page + 1)
            setOrderList([...orderList, ...res.data.orders])
            setTotalPages(res.data.totalPages)
        }
    })

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

    return (
        <View className="myOrderPage">
            <ScrollView
                className='myOrderScrollView'
                scrollY
                scrollWithAnimation
                onScrollToLower={() => handleGetData()}
            >
                <CurrentDate />
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