import { useState, forwardRef, useImperativeHandle } from 'react'
import { View, Text, Input, Textarea, Button } from '@tarojs/components'
import Taro from "@tarojs/taro";
import { createDishCategory } from '../../api/dishCategory'
import { useRequest } from 'ahooks'
import './index.scss'
import Drawer from '../Drawer'

const AddCategory = forwardRef((props, ref) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        setIsOpen: (value) => {
            setIsOpen(value)
            if (!value) {
                // 关闭时重置表单
                setName('')
                setDescription('')
            }
        }
    }))

    const { loading: createDishCategoryLoading, run: createDishCategoryFn } = useRequest(createDishCategory, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                Taro.showToast({
                    title: '创建成功',
                    icon: 'success',
                    duration: 2000
                })
                // 重置表单
                setName('')
                setDescription('')
                // 关闭抽屉
                setIsOpen(false)
                // 刷新分类列表
                props.onSuccess && props.onSuccess()
            }
        },
        onError: (err) => {
            Taro.showToast({
                title: '创建失败',
                icon: 'error',
                duration: 2000
            })
        }
    })

    const handleSave = () => {
        if (!name) {
            Taro.showToast({
                title: '请输入分类名称',
                icon: 'error',
                duration: 2000
            })
            return
        }
        createDishCategoryFn({
            name,
            description
        })
    }

    const renderBody = () => {
        return (
            <View className="addCategory">
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
                        loading={createDishCategoryLoading}
                    >新增分类</Button>
                </View>
            </View>
        )
    }
    
    return (
        <Drawer
            title="添加分类"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            bodyRender={renderBody}
            drawerStyle={{
                backgroundColor: "#F7F7F7"
            }}
        />
    )
})

export default AddCategory