import { Button, View, Text } from "@tarojs/components";
import './index.scss'
import { useState } from "react";
import Taro, { useDidShow } from "@tarojs/taro";
import { getDishCategories, deleteDishCategory } from "../../api/dishCategory";
import { useRequest } from "ahooks";
import Dialog from "../../components/Dialog";

const DishCategory = () => {
    const [categoryList, setCategoryList] = useState([]);
    const [visible, setVisible] = useState(false);
    const [categoryId, setCategoryId] = useState('');

    // 获取菜肴分类列表
    const { loading: getDishCategoriesLoading, run: getDishCategoriesFn } = useRequest(getDishCategories, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setCategoryList(res.data)
            }
        },
        onError: (err) => {
            Taro.showToast({
                title: '获取分类列表失败',
                icon: 'error',
                duration: 2000
            })
        }
    });
    // 删除菜肴分类
    const { run: deleteDishCategoryFn } = useRequest(deleteDishCategory, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setVisible(false);
                Taro.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 2000
                })
                getDishCategoriesFn()
            }
        },
        onError: (err) => {
            Taro.showToast({
                title: '删除失败',
                icon: 'error',
                duration: 2000
            })
        }
    });
    useDidShow(() => {
        getDishCategoriesFn()
    })
    const handleAdd = () => {
        Taro.navigateTo({
            url: '/pages/dishCategoryEdit/index',
        })
    }
    const handleEdit = (category) => {
        Taro.navigateTo({
            url: `/pages/dishCategoryEdit/index?id=${category.category_id}&name=${encodeURIComponent(category.name)}&description=${encodeURIComponent(category.description)}`,
        })
    }

    const handleDelete = (id) => {
        // 弹窗
        setCategoryId(id)
        setVisible(true);
    }

    const handleConfirm = () => {
        deleteDishCategoryFn(categoryId)
    };

    const handleCancel = () => {
        setVisible(false);
    };
    return (
        <View className="dishTag">
            <View className="tagList">
                {categoryList.length > 0 ? (
                    categoryList.map((categoryLi) => {
                        return (
                            <View className="tagLi" id={categoryLi.category_id}>
                                <Text className="tagName">{categoryLi.name}</Text>
                                {categoryLi.description && <Text className="tagDescription">{categoryLi.description}</Text>}
                                <View className="buttons">
                                    <Button className="editButton" onClick={() => handleEdit(categoryLi)}>编辑</Button>
                                    <Button className="deleteButton" onClick={() => handleDelete(categoryLi.category_id)}>删除</Button>
                                </View>
                            </View>
                        )
                    })
                ) : (
                    <View className="emptyState">
                        <Text className='emptyStateText'>还没有创建任何分类</Text>
                        <Text className='emptyStateDesc'>点击下方按钮开始创建您的第一个分类</Text>
                    </View>
                )}
            </View>
            <View className="buttonBox">
                <Button className="addButton" onClick={handleAdd}>新增</Button>
            </View>
            {visible && <Dialog
                title="温馨提示"
                content="你确定要删除该菜肴分类吗？"
                visible={visible}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />}
        </View>
    )
}

export default DishCategory;