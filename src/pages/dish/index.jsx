import { View, Input, Button, Image, Text, Switch } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import React, { useEffect, useState } from 'react'
import './index.scss'
import { getToken } from '../../api/user'
import { getDishs, deleteDish, disclosureDish } from '../../api/dish'
import { useRequest } from "ahooks";
import { URL_meishi } from '../../assets/imageOssUrl'
import Dialog from '../../components/Dialog';
import { getStorageSync } from '../../utils/utils'

export default function Dish () {
    const [isFirst, setIsFirst] = useState(true); // 是否第一次进入页面
    const [token, setToken] = useState(''); // 除登录接口外，其他接口需要token
    const [name, setName] = useState(''); // 菜肴名称搜索
    const [dishes, setDishes] = useState(getStorageSync('dishes', [])); // 菜肴列表 // todo， 缓存中取
    const [dishId, setDishId] = useState(''); // 显示删除弹窗时，选中的菜肴id
    const [deleteDialog, setDeleteDialog] = useState(false); // 删除菜肴弹窗显示隐藏控制

    // 获取菜肴列表
    const { run: getDishsFn } = useRequest(getDishs, {
        debounceWait: 300,
        debounceLeading: true, // 虽然开了防抖，但立马执行
        manual: true,
        onSuccess: (res, params) => {
            setDishes(res.data)
            if (params[0].name == "") {
                Taro.setStorageSync('dishes', JSON.stringify(res.data))
            }
        }
    });

    // 删除菜肴菜肴
    const { run: deleteDishFn } = useRequest(deleteDish, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setDeleteDialog(false);
                Taro.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 2000
                })
            }
            getDishsFn({ name })
        },
        onError: (err) => {
            Taro.showToast({
                title: '删除失败',
                icon: 'error',
                duration: 2000
            })
        }
    });

    // 展示/隐藏菜肴
    const { run: disclosureDishFn } = useRequest(disclosureDish, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                Taro.showToast({
                    title: '设置成功',
                    icon: 'success',
                    duration: 2000
                })
            }
            getDishsFn({ name })
        },
        onError: (err) => {
            Taro.showToast({
                title: '设置失败',
                icon: 'error',
                duration: 2000
            })
        }
    });

    // 先获取token，有token后再获取数据
    useEffect(() => {
        const getTokenAsync = async () => {
            const getTokenRes = await getToken();
            setToken(getTokenRes)
        }
        getTokenAsync();
    }, [])

    // 获取菜肴列表
    useEffect(() => {
        if (token) {
            getDishsFn({ name })
        }
    }, [token, name])

    // 重新回到页面刷新，   todo 后期优化，按需刷新
    useDidShow(() => {
        if (isFirst) {
            setIsFirst(false)
        } else {
            getDishsFn({ name })
        }
        Taro.setTabBarStyle({
            backgroundColor: '#f8f8f8',
        })
    })

    // 前往新增菜肴页面
    const handleAddDish = () => {
        Taro.navigateTo({
            url: '/pages/dishEdit/index',
        })
    }

    // 前往编辑菜肴页面
    const handleEditDish = (dish_id) => {
        Taro.navigateTo({
            url: `/pages/dishEdit/index?id=${dish_id}`,
        })
    }

    // 删除菜肴
    const handleConfirm = () => {
        deleteDishFn(dishId)
    };

    // 取消-删除菜肴
    const handleCancel = () => {
        setDeleteDialog(false);
    };

    // 设置菜肴显示隐藏
    const handleDishIsDisclosureChange = (e, dish_id) => {
        disclosureDishFn({ is_disclosure: e.detail.value ? "1" : "0" }, dish_id)
    }

    return (
        <View className='container'>
            <Input
                className='dishSearch'
                placeholder='请输入菜名搜索'
                value={name}
                placeholderClass="dishSearchPlaceholder"
                onInput={(e) => {
                    setName(e.detail.value)
                }}
            />
            <View className='dishList'>
                {dishes.map((dish) => {
                    return (
                        <View
                            className={dish.is_disclosure === "1" ? "dishItem" : "dishItem opacity"}
                            onClick={() => handleEditDish(dish.dish_id)}
                        >
                            <Image className='dishImg' style={{ width: "76rpx", height: '76rpx' }} src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : URL_meishi} mode="aspectFill" />
                            <Text className='dishName'>{dish.name}</Text>
                            <Switch
                                className='dishSwitch'
                                color="#2f7958"
                                checked={dish.is_disclosure === "1"}
                                onChange={(e) => {
                                    handleDishIsDisclosureChange(e, dish.dish_id)
                                    e.stopPropagation(); // 阻止事件冒泡
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); // 阻止事件冒泡
                                }}
                            />
                            <Button
                                className='dishDelete'
                                type='primary'
                                onClick={(e) => {
                                    setDishId(dish.dish_id)
                                    setDeleteDialog(true)
                                    e.stopPropagation(); // 阻止事件冒泡
                                }}
                            >删除</Button>
                        </View>)
                })}
            </View>
            <Button className='addDishBut' type='primary' onClick={() => handleAddDish()}>新增菜肴</Button>
            {deleteDialog && <Dialog
                title="温馨提示"
                content="你确定要删除该菜肴吗？"
                visible={deleteDialog}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />}
        </View>
    )
}
