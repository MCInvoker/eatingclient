import { Text } from "@tarojs/components"
import { formatDate } from "../../utils/utils"
import './index.scss'

const CurrentDate = () => {
    return (
        <Text className="currentDate">{formatDate(new Date().getTime(), '当前日期：MM月DD日')}</Text>
    )
}

export default CurrentDate;