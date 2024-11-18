import Taro from "@tarojs/taro";

// 时间格式化
export const formatDate = (dateString, format = 'YYYY-MM-DD HH:mm') => {
    const date = new Date(dateString);
    const pad = (str) => str.padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(String(date.getMonth() + 1));
    const day = pad(String(date.getDate()));
    const hours = pad(String(date.getHours()));
    const minutes = pad(String(date.getMinutes()));
    const seconds = pad(String(date.getSeconds()));
    const milliSeconds = pad(String(date.getMilliseconds()), '000');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
        .replace('SSS', milliSeconds);
    // 测试
    //   const dateString = "2024-09-12T14:55:11.000Z";
    //   const formattedDate = formatDate(dateString, 'YYYY-MM-DD HH:mm:ss.SSS');
    //   console.log(formattedDate); // 输出 "2024-09-12 14:55:11.000"
}

// 获取Storage值， 可设置默认值
export const getStorageSync = (key, defaultValue) => {
    try {
        return JSON.parse(Taro.getStorageSync(key))
    } catch (error) {
        return defaultValue
    }
}