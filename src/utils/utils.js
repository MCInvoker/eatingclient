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
    const milliSeconds = String(date.getMilliseconds()).padStart(3, '0');
    let todayYesterday = '';
    
    if (format.includes('TY')) { // 如果格式中有TY标记
        const now = new Date(); // 获取当前时间
        const diffTime = Math.abs(now - date); // 得到的是毫秒数
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 转换为天数
        if (diffDays === 0) { // 如果是今天
            todayYesterday = '(今天)';
        } else if (diffDays === 1) { // 如果是昨天
            todayYesterday = '(昨天)';
        }
    }

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
        .replace('SSS', milliSeconds)
        .replace('TY', todayYesterday);
    // 测试
    //   const dateString = "2024-09-12T14:55:11.000Z";
    //   const formattedDate = formatDate(dateString, 'YYYY-MM-DD HH:mm:ss.SSS');
    //   console.log(formattedDate); // 输出 "2024-09-12 14:55:11.000"
}