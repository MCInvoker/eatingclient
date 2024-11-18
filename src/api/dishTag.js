import { post, get, put, del } from "../utils/request"
import { urlDishTag } from "./api"

export const createDishTag = async (data) => {
    const res = await post(urlDishTag, data)
    return res
}

export const updateDishTag = async (data, tag_id) => {
    const res = await put(`${urlDishTag}/${tag_id}`, data)
    return res
}

export const getDishTags = async () => {
    const res = await get(urlDishTag)
    return res
}

export const deleteDishTag = async (tag_id) => {
    const res = await del(`${urlDishTag}/${tag_id}`)
    return res
}