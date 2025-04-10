// 订单列表页
import { View, ScrollView, Text, Image, Button } from "@tarojs/components"
import { useState, useEffect } from "react";
import { useRequest } from "ahooks";
import { getMyOrderList } from "../../api/order";
import Taro, { useDidShow } from "@tarojs/taro";
import { formatDate } from "../../utils/utils";
import "./index.scss";
import { URL_avatar, URL_right } from "../../assets/imageOssUrl";
import CurrentDate from "../../components/CurrentDate";
import { subscribeOrderNotify as subscribeOrderNotifyApi } from "../../api/user";
import { getUserDetails } from "../../api/user";

const tmplId = 'gN6sJdpKG8r_BjayrQSneqT2cKOAhFgIVvdnX_m0a5s'
const pageSize = 10;
const MyOrder = () => {
    const [page, setPage] = useState(1);
    const [orderList, setOrderList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [subscribeOrderNotify, setSubscribeOrderNotify] = useState(false);
    const { run: getMyOrderListFn } = useRequest(getMyOrderList, {
        manual: true,
        onSuccess: (res) => {
            setPage(page + 1)
            setOrderList([...orderList, ...res.data.orders])
            setTotalPages(res.data.totalPages)
        }
    })

    // 获取用户信息 不从缓存中取，主要是想拿最新的值。这个消息还是比较重要的
    const { run: getUserDetailsFn } = useRequest(getUserDetails, {
        manual: true,
        onSuccess: (res) => {
            const currentUserInfo = res.data;
            Taro.setStorageSync('currentUserInfo', currentUserInfo);
            setSubscribeOrderNotify(currentUserInfo.subscribe_order_notify || false)
        }
    })

    useEffect(() => {
        getUserDetailsFn();
    }, [])

    // 订阅订单通知
    const { run: subscribeOrderNotifyFn } = useRequest(subscribeOrderNotifyApi, {
        manual: true,
        onSuccess: () => {
            getUserDetailsFn();
        }
    })

    useDidShow(() => {
        setPage(1)
        setOrderList([])
        setTotalPages(1)
        getMyOrderListFn({
            page: 1,
            pageSize
        })
    })

    const handleGetData = () => {
        if (page > totalPages) {
            return
        }
        getMyOrderListFn({
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
                <View className="orders">
                    {
                        orderList.map((order) => {
                            return (
                                <View className="order">
                                    <View className="orderContent">
                                        <View className="orderTop">
                                            <Image className="avatar" src={order?.Customer?.avatar || URL_avatar} />
                                            <View className="nameTime">
                                                <Text className="name">{order?.Customer?.nickname}</Text>
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
                <CurrentDate currentDateStyle={{ bottom: "140rpx" }} />
                <View className="subscribeOrderNotifyButtonContainer">
                    <Button
                        className='subscribeOrderNotifyButton'
                        type='primary'
                        onClick={() => {
                            Taro.requestSubscribeMessage({
                                tmplIds: [tmplId],
                                success: function (res) {
                                    if (res[tmplId] === 'accept') {
                                        subscribeOrderNotifyFn({ subscribe_order_notify: true })
                                    }
                                }
                            })
                        }}
                    >{subscribeOrderNotify ? '你已订阅计划' : '新计划订阅'}</Button>
                </View>
            </ScrollView>
        </View>
    )
}

export default MyOrder;