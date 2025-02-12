import Taro from '@tarojs/taro';
import React, { useState, useEffect } from 'react';
import { View, Button, Text, Image } from '@tarojs/components';
import './index.scss'; // 你可以根据自己的需求自定义样式
import drawerCloseImg from "../../assets/image/icon/drawerClose.svg"

const Drawer = (props) => {
    const {isOpen, onClose, zIndex = 100, title, bodyRender} = props;

    // const openDrawer =() => {
    //     setIsOpen(true);
    // }

    // const closeDrawer =() => {
    //     setIsOpen(false);
    // }

  return (
    <View className={`"drawer-container" ${isOpen ? 'drawer-container-open' : ''}`}>
        <View
            className={`"drawer-mask" ${isOpen ? 'drawer-mask-open' : ''}`}
            onClick={() => {
                onClose && onClose()
            }}
        ></View>

      {/* 抽屉部分 */}
      <View
        className={`drawer ${isOpen ? 'drawer-open' : ''}`}
      >
        <View className="drawer-content">
          <View className="drawer-header">
            <Text className="drawer-header-title">{title}</Text>
            <Button className='drawer-close-button' onClick={() => {
                onClose && onClose()
            }}>
                <Image className='drawer-close-icon' src={drawerCloseImg}></Image>
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
