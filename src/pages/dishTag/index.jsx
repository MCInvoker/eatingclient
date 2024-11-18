import { Button, View, Text } from "@tarojs/components";
import './index.scss'
import { useState } from "react";
import Taro, { useDidShow } from "@tarojs/taro";
import { getDishTags, deleteDishTag } from "../../api/dishTag";
import { useRequest } from "ahooks";
import Dialog from "../../components/Dialog";

const DishTag = () => {
    const [tagList, setTagList] = useState([]);
    const [visible, setVisible] = useState(false);
    const [tagId, setTagId] = useState('');

    // 获取菜肴标签列表
    const { loading: getDishTagsLoading, run: getDishTagsFn } = useRequest(getDishTags, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setTagList(res.data)
            }
        },
        onError: (err) => {
            Taro.showToast({
                title: '获取标签列表失败',
                icon: 'error',
                duration: 2000
            })
        }
    });
    // 删除菜肴标签
    const { run: deleteDishTagFn } = useRequest(deleteDishTag, {
        manual: true,
        onSuccess: (res) => {
            if (res.success) {
                setVisible(false);
                Taro.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 2000
                })
                getDishTagsFn()
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
        getDishTagsFn()
    })
    const handleAdd = () => {
        Taro.navigateTo({
            url: '/pages/dishTagEdit/index',
        })
    }
    const handleEdit = (tag) => {
        Taro.navigateTo({
            url: `/pages/dishTagEdit/index?id=${tag.tag_id}&name=${encodeURIComponent(tag.name)}&description=${encodeURIComponent(tag.description)}`,
        })
    }

    const handleDelete = (id) => {
        // 弹窗
        setTagId(id)
        setVisible(true);
    }

    const handleConfirm = () => {
        deleteDishTagFn(tagId)
    };

    const handleCancel = () => {
        setVisible(false);
    };
    return (
        <View className="dishTag">
            <View className="tagList">
                {tagList.map((tagLi) => {
                    return (
                        <View className="tagLi" id={tagLi.tag_id}>
                            <Text className="tagName">{tagLi.name}</Text>
                            {tagLi.description && <Text className="tagDescription">{tagLi.description}</Text>}
                            <View className="buttons">
                                <Button className="editButton" onClick={() => handleEdit(tagLi)}>编辑</Button>
                                <Button className="deleteButton" onClick={() => handleDelete(tagLi.tag_id)}>删除</Button>
                            </View>
                        </View>
                    )
                })}
            </View>
            <View className="buttonBox">
                <Button className="addButton" onClick={handleAdd}>新增</Button>
            </View>
            {visible && <Dialog
                title="温馨提示"
                content="你确定要删除该菜肴标签吗？"
                visible={visible}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />}

        </View>
    )
}

export default DishTag;