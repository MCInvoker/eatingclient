import { View, Text } from "@tarojs/components"
import "./index.scss"

const Toast = ({ visible, title, messages, onClose }) => {
    if (!visible) return null;

    return (
        <View className="toast">
            <View className="toastContent">
                <View className="toastHeader">
                    <Text className="toastTitle">{title}</Text>
                    <View className="closeButton" onClick={onClose}>
                        <Text className="closeIcon">×</Text>
                    </View>
                </View>
                <View className="toastBody">
                    {messages.map((message, index) => (
                        <View key={index} className="toastItem">
                            <Text className="toastDot">•</Text>
                            <Text className="toastText">{message}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}

export default Toast; 