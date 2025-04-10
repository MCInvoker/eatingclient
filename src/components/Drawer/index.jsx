import React from 'react';
import { View, Button, Text, Image } from '@tarojs/components';
import './index.scss'; // 你可以根据自己的需求自定义样式
import { URL_drawerClose } from '../../assets/imageOssUrl';

const Drawer = (props) => {
    const { isOpen, onClose, zIndex = 100, title, bodyRender, drawerStyle = {} } = props;

    return (
        <View className={`"drawer-container" ${isOpen ? 'drawer-container-open' : ''}`}>
            <View
                className={`"drawer-mask" ${isOpen ? 'drawer-mask-open' : ''}`}
                onClick={() => {
                    onClose && onClose()
                }}
            ></View>
            <View
                className={`drawer ${isOpen ? 'drawer-open' : ''}`}
                style={drawerStyle}
            >
                <View className="drawer-content">
                    <View className="drawer-header">
                        <Text className="drawer-header-title">{title}</Text>
                        <Button className='drawer-close-button' onClick={() => {
                            onClose && onClose()
                        }}>
                            <Image className='drawer-close-icon' src={URL_drawerClose}></Image>
                        </Button>

                    </View>
                    <View className="drawer-body">
                        {bodyRender()}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default Drawer;
