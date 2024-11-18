import { View, Button, Input, Text, Textarea } from "@tarojs/components";
import './index.scss'
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { createDishTag, updateDishTag } from "../../api/dishTag";
import { useRequest } from "ahooks";

const DishTagEdit = () => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [tagId, setTagId] = useState(''); // 编辑时有tagId
    useEffect(() => {
        const { router } = Taro.getCurrentInstance();
        const { id, name, description } = router.params;
        setTagId(id)
        if (id) {
            setName(decodeURIComponent(name))
            setDescription(decodeURIComponent(description))
        }
    }, []);
    // 创建菜肴标签
    const { loading: createDishTagLoading, run: createDishTagFn } = useRequest(createDishTag, {
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
                title: '创建标签失败',
                icon: 'error',
                duration: 2000
            })
        }
    });

    // 修改菜肴标签
    const { loading: updateDishTagLoading, run: updateDishTagFn } = useRequest(updateDishTag, {
        manual: true,
        onSuccess: (res) => {
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
                title: '修改标签失败',
                icon: 'error',
                duration: 2000
            })
        }
    });

    const handleSave = () => {
        if (!name) {
            Taro.showToast({
                title: '请输入标签名称',
                icon: 'error',
                duration: 2000
            })
        }
        if (tagId) {
            updateDishTagFn({
                name,
                description
            },
                tagId
            )
        } else {
            createDishTagFn({
                name,
                description
            })
        }
    }

    return (
        <View className="page">
            <View className="form">
                <View className="formLiLR">
                    <Text className="formLiL required">标签名称</Text>
                    <Input
                        className="formLiR"
                        value={name}
                        onInput={(e) => {
                            setName(e.detail.value)
                        }}
                        placeholder="请输入标签名称"
                        placeholderClass="placeholderClass"
                        maxlength={12}
                    />
                </View>
                <View className="formLiTB">
                    <Text className="formLiT">标签描述</Text>
                    <Textarea
                        className="formLiB"
                        value={description}
                        onInput={(e) => {
                            setDescription(e.detail.value)
                        }}
                        placeholder="请输入标签描述"
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
                    loading={createDishTagLoading || updateDishTagLoading}
                >{tagId ? '更新' : '新增'}</Button>
            </View>
        </View>
    )
}
export default DishTagEdit;