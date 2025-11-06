import { post, get, put, del } from "../utils/request"
import { urlOrder, urlMyorder, urlMyorderhistory } from "./api"

export const createOrder = async (data) => {
    const res = await post(urlOrder, data)
    return res
}

export const getMyOrderList = async (data) => {
    const res = await get(urlMyorder, data)
    return res
}

export const getMyOrderHistoryList = async (data) => {
    const res = await get(urlMyorderhistory, data)
    return res
}

// 获取订单详情
export const getOrderDetail = async (data) => {
    const res = await get(`${urlOrder}/${data}`)
    return res
}

// 更新订单状态
export const updateOrderStatus = async (orderId, data) => {
    const res = await put(`${urlOrder}/${orderId}`, data)
    return res
}