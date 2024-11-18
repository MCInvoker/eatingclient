import { useState } from "react";
import { View, Button, Text } from "@tarojs/components";
import './index.scss';

const Dialog = ({ title, content, onConfirm, onCancel, visible, confirmText = '确定', cancelText = '取消' }) => {
    const [isVisible, setIsVisible] = useState(visible);

    const handleConfirm = () => {
        onConfirm();
        setIsVisible(false);
    };

    const handleCancel = () => {
        onCancel();
        setIsVisible(false);
    };

    return (
        <>
            {isVisible && (
                <View className="dialog-container">
                    <View className="dialog-mask" onClick={() => setIsVisible(false)}></View>
                    <View className="dialog-content">
                        <View className="dialog-header">
                            <Text>{title}</Text>
                        </View>
                        <View className="dialog-body">
                            <Text>{content}</Text>
                        </View>
                        <View className="dialog-footer">
                            <Button className="dialog-cancel" onClick={handleCancel}>
                                {cancelText}
                            </Button>
                            <Button className="dialog-confirm" onClick={handleConfirm}>
                                {confirmText}
                            </Button>
                        </View>
                    </View>
                </View>
            )}
        </>
    );
};

export default Dialog;