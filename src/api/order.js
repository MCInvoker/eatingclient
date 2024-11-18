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
