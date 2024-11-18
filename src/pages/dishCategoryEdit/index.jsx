import { View, Button, Input, Text, Textarea } from "@tarojs/components";
import './index.scss'
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { createDishCategory, updateDishCategory } from "../../api/dishCategory";
import { useRequest } from "ahooks";

const DishCategoryEdit = () => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState(''); // 编辑时有categoryId
    useEffect(() => {
        const { router } = Taro.getCurrentInstance();
        const { id, name, description } = router.params;
        setCategoryId(id)
        if (id) {
            setName(decodeURIComponent(name))
            setDescription(decodeURIComponent(description))
        }
    }, []);
    // 创建菜肴分类
    const { loading: createDishCategoryLoading, run: createDishCategoryFn } = useRequest(createDishCategory, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                Taro.showToast({
                    title: '创建成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(() => {
                    Taro.navigateBack()
                }, 1000)
            }
        },
        onError: (err) => {
            Taro.showToast({
                title: '创建分类失败',
                icon: 'error',
                duration: 2000
            })
        }
    });

    // 修改菜肴分类
    const { loading: updateDishCategoryLoading, run: updateDishCategoryFn } = useRequest(updateDishCategory, {
        manual: true,
        onSuccess: (res) => {
            console.log(res)
            if (res.success) {
                Taro.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(() => {
                    Taro.navigateBack()
                }, 1000)
            }
        },
        onError: (err) => {
            Taro.showToast({
                title: '修改分类失败',
                icon: 'error',
                duration: 2000
            })
        }
    });

    const handleSave = () => {
        if (!name) {
            Taro.showToast({
                title: '请输入分类名称',
                icon: 'error',
                duration: 2000
            })
        }
        if (categoryId) {
            updateDishCategoryFn({
                name,
                description
            },
                categoryId
            )
        } else {
            createDishCategoryFn({
                name,
                description
            })
        }
    }

    return (
        <View className="page">
            <View className="form">
                <View className="formLiLR">
                    <Text className="formLiL required">分类名称</Text>
                    <Input
                        className="formLiR"
                        value={name}
                        onInput={(e) => {
                            setName(e.detail.value)
                        }}
                        placeholder="请输入分类名称"
                        placeholderClass="placeholderClass"
                        maxlength={12}
                    />
                </View>
                <View className="formLiTB">
                    <Text className="formLiT">分类描述</Text>
                    <Textarea
                        className="formLiB"
                        value={description}
                        onInput={(e) => {
                            setDescription(e.detail.value)
                        }}
                        placeholder="请输入分类描述"
                        placeholderClass="placeholderClass"
                        maxlength={100}
                        autoHeight={true}
                        showCount
                    />
                </View>
            </View>
            <View className="buttonBox">
                <Button
                    className="addButton"
                    onClick={handleSave}
                    loading={createDishCategoryLoading || updateDishCategoryLoading}
                >{categoryId ? '更新' : '新增'}</Button>
            </View>
        </View>
    )
}
export default DishCategoryEdit;