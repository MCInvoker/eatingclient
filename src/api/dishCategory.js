// dishCategory.js
import { post, get, put, del } from "../utils/request"
import { urlDishCategory } from "./api"

export const createDishCategory = async (data) => {
    const res = await post(urlDishCategory, data)
    return res
}

export const updateDishCategory = async (data, category_id) => {
    const res = await put(`${urlDishCategory}/${category_id}`, data)
    return res
}

export const getDishCategories = async () => {
    const res = await get(urlDishCategory)
    return res
}

export const deleteDishCategory = async (category_id) => {
    const res = await del(`${urlDishCategory}/${category_id}`)
    return res
}