import { urlStsInfo } from "./api";
import { get } from "../utils/request";

export const getStsInfo = async () => {
    const res = await get(urlStsInfo)
    return res
}