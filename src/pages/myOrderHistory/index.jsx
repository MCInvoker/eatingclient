// 点餐记录列表页
import { View, ScrollView, Text, Image, Button } from "@tarojs/components"
import { useState, useEffect } from "react";
import { useRequest } from "ahooks";
import { getMyOrderHistoryList, updateOrderStatus } from "../../api/order";
import Taro, { useDidShow } from "@tarojs/taro";
import { formatDate } from "../../utils/utils";
import { URL_avatar, URL_filter } from "../../assets/imageOssUrl";
import CurrentDate from "../../components/CurrentDate";
import Toast from "../../components/Toast";
import DraggableButton from "../../components/DraggableButton";
import Drawer from "../../components/Drawer";
import MultiSelector from "../../components/MultiSelector";
import RadioSelector from "../../components/RadioSelector";
import "./index.scss";

const pageSize = 10;

const fruitOptions = [
    { label: '待确认', value: 'PENDING' },
    { label: '已确认', value: 'CONFIRMED' },
    { label: '制作中', value: 'PREPARING' },
    { label: '已完成', value: 'COMPLETED' },
    { label: '已取消', value: 'CANCELLED' }
]
const orderStatusMap = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    PREPARING: '制作中',
    READY: '已出餐',
    DELIVERING: '配送中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    REFUNDED: '已退款'
};
const initStatus = 'PENDING,CONFIRMED,PREPARING,COMPLETED';

const MyOrderHistory = () => {
    const [page, setPage] = useState(1);
    const [orderList, setOrderList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [showFilter, setShowFilter] = useState(false); // 列表通过状态筛选下拉框显示控制
    const [selected, setSelected] = useState([]); // 订单状态多选值，在点击确认后生效在列表搜索中
    // 订单状态：PENDING=待确认, CONFIRMED=已确认, PREPARING=制作中, COMPLETED=已完成, CANCELLED=已取消
    const [status, setStatus] = useState(initStatus); // 当前查询列表时使用的订单状态 comment: '订单状态：PENDING=待确认, CONFIRMED=已确认, PREPARING=制作中, READY=已出餐, DELIVERING=配送中, COMPLETED=已完成, CANCELLED=已取消, REFUNDED=已退款'
    const [selectedOrderId, setSelectedOrderId] = useState(0); // 修改订单状态时的订单id
    const [itemStatus, setItemStatus] = useState('PENDING'); // 修改订单状态时的订单状态
    const [showChangeStatus, setShowChangeStatus] = useState(false); // 修改订单状态时，订单状态单选框显示控制

    // 获取订单列表
    const { run: getMyOrderHistoryListFn, loading } = useRequest(getMyOrderHistoryList, {
        manual: true,
        onSuccess: (res) => {
            if (page === 1) {
                setOrderList(res.data.orders)
            } else {
                setOrderList([...orderList, ...res.data.orders])
            }
            setPage(page + 1)
            setTotalPages(res.data.totalPages)
        }
    })

    // 更新订单状态
    const { run: updateOrderStatusFn, loading: updateOrderStatusLoading } = useRequest(updateOrderStatus, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setShowChangeStatus(false);
                setOrderList(
                    orderList.map(item =>
                        item.order_id === selectedOrderId ? { ...item, status: itemStatus } : item
                    )
                )
            }
        }
    })

    useEffect(() => {
        const routerParams = Taro.getCurrentInstance().router.params;
        if (routerParams.showToast) {
            setShowToast(true);
        }
    }, [])

    useDidShow(() => {
        const storedStatus = Taro.getStorageSync('myOrderHistoryStatus')
        if (storedStatus && typeof storedStatus === 'string') {
            setStatus(storedStatus)
            setSelected(storedStatus.split(','))
        } else {
            setStatus(initStatus)
            setSelected(initStatus.split(','))
        }
        setPage(1)
        setOrderList([])
        setTotalPages(1)
        getMyOrderHistoryListFn({
            page: 1,
            pageSize,
            status: storedStatus || initStatus
        })
    })

    const handleGetData = (parameter) => {
        const {
            newPage,
            newStatus
        } = parameter || {};
        if (page > totalPages || loading) {
            return
        }
        getMyOrderHistoryListFn({
            page: newPage || page,
            pageSize,
            status: newStatus || status
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

    // 筛选列表数据入口
    const renderTextButton = () => {
        return (
            <Image className="filterIcon" src={URL_filter} />
        )
    }

    // 列表数据状态多选，未生效
    const handleChange = (values) => {
        setSelected(values)
    }

    // 列表数据状态多选，生效
    const handleGetList = () => {
        if (selected.length === 0) {
            Taro.showToast({
                title: '请最少选择一个状态',
                icon: 'error',
                duration: 2000
            });
            return
        }
        const newStatus = selected.join(',');
        setStatus(newStatus)
        Taro.setStorage({
            key: "myOrderHistoryStatus",
            data: newStatus
        })
        setPage(1)
        setShowFilter(false)
        handleGetData({
            newPage: 1,
            newStatus
        })
    }

    // 列表数据状态多选弹窗内容
    const renderStatus = () => {
        return (
            <View>
                <MultiSelector
                    options={fruitOptions}
                    value={selected}
                    onChange={handleChange}
                    layout="vertical"
                />
                <Button
                    className='getListButton'
                    onClick={() => handleGetList()}
                    disabled={loading}
                >确定</Button>
            </View>
        )
    }

    // 点击订单的状态，进入修改订单状态弹窗
    const handleChangeStatus = (orderId, status) => {
        setSelectedOrderId(orderId);
        setItemStatus(status);
        setShowChangeStatus(true);
    }

    // 修改订单状态时选择对应状态
    const handleStatus = (value) => {
        setItemStatus(value)
    }

    // 更新订单状态
    const handleUpdateOrderStatus = () => {
        updateOrderStatusFn(selectedOrderId, { status: itemStatus })
    }

    // 订单状态修改弹窗内容
    const renderChangeStatus = () => {
        return (
            <View>
                <RadioSelector
                    value={itemStatus}
                    onChange={handleStatus}
                    options={fruitOptions}
                    layout='vertical'
                ></RadioSelector>
                <Button
                    className='getListButton'
                    onClick={() => handleUpdateOrderStatus()}
                    disabled={updateOrderStatusLoading}
                >确定</Button>
            </View>
        )
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
                                <View className="order" key={order.order_id}>
                                    <View className="orderContent">
                                    <View className="orderTop">
                                        <Image className="avatar" src={order?.Chef?.avatar || URL_avatar} />
                                        <View className="nameTime">
                                            <Text className="name">{order?.Chef?.nickname}</Text>
                                            <Text className="createdAt">{formatDate(order.created_at, 'YYYY-MM-DD HH:mm TY')}</Text>
                                        </View>
                                    </View>
                                    <View className="dishes">
                                        {order.order_dish_details.map((dish, dishIndex) => {
                                            return (
                                                <View className="dishBox" key={dish.dish_id}>
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
                                    <View className="buttonBox">
                                        <Button
                                            className="button"
                                            onClick={() => handleChangeStatus(order.order_id, order.status)}
                                        >
                                            {orderStatusMap[order.status] || '-'}
                                        </Button>
                                        <Button
                                            className="button"
                                            onClick={() => handleToDetail(order.order_id)}
                                        >
                                            详情
                                        </Button>
                                    </View>
                                    {/* <View 
                                        className="toDetailButton"
                                        onClick={() => handleToDetail(order.order_id)}
                                    >
                                        <Image className="rightIcon" src={URL_right} />
                                    </View> */}
                                </View>
                            )
                        })
                    }
                </View>
            </ScrollView>
            <DraggableButton
                bodyRender={renderTextButton}
                businessKey="myOrderHistory"
                onClick={() => {
                    setShowFilter(!showFilter)
                }}
            />
            <Drawer
                isOpen={showFilter}
                title="筛选"
                bodyRender={renderStatus}
                onClose={() => {
                    setShowFilter(false)
                }}
            />
            <Drawer
                isOpen={showChangeStatus}
                title="修改状态"
                bodyRender={renderChangeStatus}
                onClose={() => {
                    setShowChangeStatus(false)
                }}
            />
        </View>
    )
}

export default MyOrderHistory;