import { post, get, put, del } from "../utils/request"
import { urlFollow, urlUnfollow } from "./api"

export const getFollow = async (data) => {
    const res = await get(urlFollow, data)
    return res
}

export const follow = async (data) => {
    const res = await post(urlFollow, data)
    return res
}

export const unfollow = async (data) => {
    const res = await post(urlUnfollow, data)
    return res
}
