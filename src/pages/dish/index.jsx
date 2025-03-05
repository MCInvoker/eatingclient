import { View, Input, Button, Image, Text, Switch } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import React, { useEffect, useState } from 'react'
import './index.scss'
import { getDishes, deleteDish, disclosureDish } from '../../api/dish'
import { useRequest } from "ahooks";
import { URL_food } from '../../assets/imageOssUrl'
import Dialog from '../../components/Dialog';
import { getStorageSync } from '../../utils/utils'

export default function Dish () {
    const [isFirst, setIsFirst] = useState(true); // 是否第一次进入页面
    const [name, setName] = useState(''); // 菜肴名称搜索
    const [dishes, setDishes] = useState(getStorageSync('dishes', [])); // 菜肴列表
    const [dishId, setDishId] = useState(''); // 显示删除弹窗时，选中的菜肴id
    const [deleteDialog, setDeleteDialog] = useState(false); // 删除菜肴弹窗显示隐藏控制

    // 获取菜肴列表
    const { run: getDishesFn } = useRequest(getDishes, {
        debounceWait: 300,
        debounceLeading: true,
        manual: true,
        onSuccess: (res, params) => {
            setDishes(res.data)
            if (params[0].name == "") {
                Taro.setStorageSync('dishes', JSON.stringify(res.data))
            }
        }
    });

    // 删除菜肴
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
            getDishesFn({ name })
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
            getDishesFn({ name })
        },
        onError: (err) => {
            Taro.showToast({
                title: '设置失败',
                icon: 'error',
                duration: 2000
            })
        }
    });

    useEffect(() => {
        getDishesFn({ name })
    }, [name])

    // 重新回到页面刷新
    useDidShow(() => {
        if (isFirst) {
            setIsFirst(false)
        } else {
            getDishesFn({ name })
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
            {dishes.length > 0 ? (
                <View className='dishList'>
                    {dishes.map((dish) => {
                        return (
                            <View
                                className={dish.is_disclosure === "1" ? "dishItem" : "dishItem opacity"}
                                onClick={() => handleEditDish(dish.dish_id)}
                            >
                                <Image className='dishImg' style={{ width: "76rpx", height: '76rpx' }} src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : URL_food} mode="aspectFill" />
                                <Text className='dishName'>{dish.name}</Text>
                                <Switch
                                    className='dishSwitch'
                                    color="#2f7958"
                                    checked={dish.is_disclosure === "1"}
                                    onChange={(e) => {
                                        handleDishIsDisclosureChange(e, dish.dish_id)
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                                <Button
                                    className='dishDelete'
                                    type='primary'
                                    onClick={(e) => {
                                        setDishId(dish.dish_id)
                                        setDeleteDialog(true)
                                        e.stopPropagation();
                                    }}
                                >删除</Button>
                            </View>)
                    })}
                </View>
            ) : (
                <View className='emptyState'>
                    <Image className='emptyStateImg' src={URL_food} mode='aspectFit'></Image>
                    <Text className='emptyStateText'>还没有创建任何菜肴</Text>
                    <Text className='emptyStateDesc'>点击下方按钮开始创建您的第一道菜</Text>
                </View>
            )}
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
