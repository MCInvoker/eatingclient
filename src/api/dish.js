import { post, get, put, del } from "../utils/request"
import { urlDish, urlDisclosureDish, urlUserDish } from "./api"

export const createDish = async (data) => {
    const res = await post(urlDish, data)
    return res
}

export const getDishes = async (data = {}) => {
    const res = await get(urlDish, data)
    return res
}

export const deleteDish = async (dish_id) => {
    const res = await del(`${urlDish}/${dish_id}`)
    return res
}
// 展示/隐藏菜肴 is_disclosure
export const disclosureDish = async (data, dish_id) => {
    const res = await put(`${urlDisclosureDish}/${dish_id}`, data)
    return res
}

export const updateDish = async (data, dish_id) => {
    const res = await put(`${urlDish}/${dish_id}`, data)
    return res
}

export const getUserDish = async (data = {}) => {
    const res = await get(urlUserDish, data)
    return res
}