import { View, Button, Input, Text, Textarea, Switch, Image } from "@tarojs/components";
import './index.scss'
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { getDishCategories } from "../../api/dishCategory";
import { getDishTags } from "../../api/dishTag";
import { useRequest } from "ahooks";
import { getStsInfo } from "../../api/sts";
import _ from "loadsh";
import crypto from 'crypto-js';
import { Base64 } from 'js-base64';
import uplodImage from "../../assets/image/userInfo/uploadImage.png"
import closeImage from "../../assets/image/icon/close.svg"
import { createDish, getDishs, updateDish } from "../../api/dish";

const DishEdit = () => {
    const [dishId, setDishId] = useState(''); // 菜肴id， 编辑菜肴时有用
    const [name, setName] = useState(''); // 菜肴名称
    const [description, setDescription] = useState(''); // 菜肴描述
    const [categories, setCategories] = useState([]); // 菜肴分类已选项
    const [dishCategoriesOptions, setDishCategoriesOptions] = useState([]); // 菜肴分类可选项
    const [tags, setTags] = useState([]); // 菜肴标签已选项
    const [dishTagsOptions, setDishTagsOptions] = useState([]); // 菜肴标签可选项
    const [isDisclosure, setIsDisclosure] = useState(true); // 菜肴是否展示公开
    // const [images, setImages] = useState([]); // 菜肴图片
    const [seleteImage, setSeleteImage] = useState([]); // 待上传菜肴图片
    const [stsInfo, setStsInfo] = useState({}) // oss上传所需签名信息

    // 获取路由传参，判断是新增还是编辑
    useEffect(() => {
        const { router } = Taro.getCurrentInstance();
        const { id } = router.params;
        setDishId(id)
        if (id) {
            getDishsFn({ id })
        }
    }, []);

    // 获取菜肴列表
    const { run: getDishsFn } = useRequest(getDishs, {
        manual: true,
        onSuccess: (res) => {
            if (res.data && res.data.length > 0) {
                const dishInfo = res.data[0];
                setName(dishInfo.name);
                dishInfo.description && setDescription(dishInfo.description);
                if (dishInfo.dish_images && dishInfo.dish_images.length > 0) {
                    setSeleteImage(dishInfo.dish_images.map((item) => {
                        return {
                            url: item.url,
                            width: item.width,
                            height: item.height
                        }
                    }))
                }
                setIsDisclosure(dishInfo.is_disclosure);
                setCategories(dishInfo.dish_categories.map((item) => item.category_id))
                setTags(dishInfo.dish_tags.map((item) => item.tag_id))
            }
        }
    });

    // 获取菜肴分类
    useRequest(getDishCategories, {
        onSuccess: (res) => {
            const resCategories = res.data.map((item) => {
                return {
                    label: item.name,
                    value: item.category_id
                }
            })
            setDishCategoriesOptions(resCategories)
        }
    });

    // 获取菜肴标签
    useRequest(getDishTags, {
        onSuccess: (res) => {
            const resTags = res.data.map((item) => {
                return {
                    label: item.name,
                    value: item.tag_id
                }
            })
            setDishTagsOptions(resTags)
        }
    });

    // 新增菜肴
    const { run: createDishFn } = useRequest(createDish, {
        manual: true,
        onSuccess: (res) => {
            Taro.showToast({
                title: '新增成功',
                icon: 'success',
                duration: 2000
            })
            setTimeout(() => {
                Taro.navigateBack()
            }, 1000)
        },
        onFinally: () => {
            setTimeout(function () {
                Taro.hideLoading()
            }, 100)
        }
    })

    // 编辑菜肴
    const { run: updateDishFn } = useRequest(updateDish, {
        manual: true,
        onSuccess: (res) => {
            Taro.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
            })
            setTimeout(() => {
                Taro.navigateBack()
            }, 1000)
        },
        onFinally: () => {
            setTimeout(function () {
                Taro.hideLoading()
            }, 100)
        }
    })

    // 获取阿里云sts临时凭证，用于图片上传
    const { run: getStsInfoFn } = useRequest(getStsInfo, {
        manual: true,
        onSuccess: (res) => {
            setStsInfo(res.data)
        }
    })

    useEffect(() => {
        getStsInfoFn()
    }, [])

    const handleSave = async () => {
        if (!name) {
            Taro.showToast({
                title: '请输入菜肴名称',
                icon: 'error',
                duration: 2000
            })
            return
        }
        // 编辑
        if (dishId) {
            let images = [];
            const promises = seleteImage.map(async (image, index) => {
                const tempFilePath = image.url
                // 已经是网络地址，代表已经上传了
                if (tempFilePath.includes('https')) {
                    images[index] = image;
                    return
                }
                const url = "https://webhomeide.oss-cn-hangzhou.aliyuncs.com"
                const fileType = tempFilePath.split('.').pop();
                // 云服务器目标路径
                const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType}`;
                // 上传完图片后，图片的访问地址
                const ossImgUrl = `${url}/${key}`;
                let date = new Date();
                date.setHours(date.getHours() + 1);
                const policyText = {
                    expiration: date.toISOString(), // 设置policy过期时间。
                    conditions: [
                        // 限制上传大小。
                        ["content-length-range", 0, 1024 * 1024 * 1024],
                    ],
                };
                async function getFormDataParams () {
                    const policy = Base64.encode(JSON.stringify(policyText)) // policy必须为base64的string。
                    // 计算签名。
                    function computeSignature (accessKeySecret, canonicalString) {
                        return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
                    }
                    const signature = computeSignature(stsInfo.AccessKeySecret, policy)
                    const formData = {
                        OSSAccessKeyId: stsInfo.AccessKeyId,
                        signature,
                        policy,
                        'x-oss-security-token': stsInfo.SecurityToken
                    }
                    return formData
                }
                const formData = await getFormDataParams();
                await Taro.uploadFile({
                    url, // 替换为你的云环境
                    filePath: tempFilePath,
                    name: "file",
                    formData: {
                        ...formData,
                        key,
                    },
                    success (res) {
                        if (res.statusCode === 204) {
                            images[index] = {
                                url: ossImgUrl,
                                width: image.width,
                                height: image.height
                            }
                        }
                    },
                });
            })
            await Promise.all(promises);

            const requestData = {
                name,
                description,
                is_disclosure: isDisclosure,
                categories,
                tags,
                images
            }
            updateDishFn(requestData, dishId)
        } else { // 新增
            Taro.showLoading({
                title: '创建菜肴中～',
            })

            let images = [];
            const promises = seleteImage.map(async (image, index) => {
                const tempFilePath = image.url;
                const url = "https://webhomeide.oss-cn-hangzhou.aliyuncs.com"
                const fileType = tempFilePath.split('.').pop();
                // 云服务器目标路径
                const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType}`;
                // 上传完图片后，图片的访问地址
                const ossImgUrl = `${url}/${key}`;
                let date = new Date();
                date.setHours(date.getHours() + 1);
                const policyText = {
                    expiration: date.toISOString(), // 设置policy过期时间。
                    conditions: [
                        // 限制上传大小。
                        ["content-length-range", 0, 1024 * 1024 * 1024],
                    ],
                };
                async function getFormDataParams () {
                    const policy = Base64.encode(JSON.stringify(policyText)) // policy必须为base64的string。
                    // 计算签名。
                    function computeSignature (accessKeySecret, canonicalString) {
                        return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
                    }
                    const signature = computeSignature(stsInfo.AccessKeySecret, policy)
                    const formData = {
                        OSSAccessKeyId: stsInfo.AccessKeyId,
                        signature,
                        policy,
                        'x-oss-security-token': stsInfo.SecurityToken
                    }
                    return formData
                }
                const formData = await getFormDataParams();
                await Taro.uploadFile({
                    url, // 替换为你的云环境
                    filePath: tempFilePath,
                    name: "file",
                    formData: {
                        ...formData,
                        key,
                    },
                    success (res) {
                        if (res.statusCode === 204) {
                            images[index] = {
                                url: ossImgUrl,
                                width: image.width,
                                height: image.height
                            }
                        }
                    },
                });
            })
            await Promise.all(promises);

            const requestData = {
                name,
                description,
                is_disclosure: isDisclosure,
                categories,
                tags,
                images
            }
            createDishFn(requestData)
        }
    }

    // 选择分类
    const handleSeleteCategory = (value) => {
        let newCategories = _.cloneDeep(categories)
        newCategories.push(value)
        setCategories(newCategories)
    }

    // 取消选择分类
    const handleUnseleteCategory = (value) => {
        let newCategories = _.cloneDeep(categories).filter((item) => item !== value)
        setCategories(newCategories)
    }

    // 选择标签
    const handleSeleteTag = (value) => {
        let newTags = _.cloneDeep(tags)
        newTags.push(value)
        setTags(newTags)
    }

    // 取消选择标签
    const handleUnseleteTag = (value) => {
        let newTags = _.cloneDeep(tags).filter((item) => item !== value)
        setTags(newTags)
    }

    const handleIsDisclosure = (e) => {
        setIsDisclosure(e.detail.value)
    }

    const handlecChooseImages = async () => {
        try {
            const result = await Taro.chooseImage({
                count: 9, // 最多可以选择的图片数量
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            });
            const newImageList = result.tempFilePaths.map((item) => {
                return {
                    url: item,
                    width: 1,
                    height: 1,
                }
            })

            setSeleteImage([...seleteImage, ...newImageList])
        } catch (error) {
        }
    }

    // 删除图片， 保存后才生效
    const handleDeleteImg = (value) => {
        let newSeleteImage = _.cloneDeep(seleteImage).filter((item) => item.url !== value)
        setSeleteImage(newSeleteImage)
    }

    // 图片加载后设置图片框高
    const seleteImageWidthHeightChange = (e, index) => {
        setSeleteImage(prevState => {
            // 克隆当前状态，以避免修改原始状态
            const updatedState = _.cloneDeep(prevState);
            updatedState[index].width = e.detail.width;
            updatedState[index].height = e.detail.height;
            return updatedState;
        });
    }

    return (<View className="page">
        <View className="form">
            <View className="formLiLR">
                <Text className="formLiL required">菜名</Text>
                <Input
                    className="formLiR"
                    value={name}
                    onInput={(e) => {
                        setName(e.detail.value)
                    }}
                    placeholder="请输入菜肴名称"
                    placeholderClass="placeholderClass"
                    maxlength={12}
                />
            </View>
            <View className="formLiTB">
                <Text className="formLiT">图片</Text>
                <View className="formLiBImages">
                    {seleteImage.map((item) => {
                        return (
                            <View className="seleteImageBox" key={item.url}>
                                <Image className="seleteImage" mode="aspectFit" src={item.url}></Image>
                                <Button className="deleteImageButton" onClick={() => handleDeleteImg(item.url)} >
                                    <Image className="deleteImage" src={closeImage}></Image>
                                </Button>
                            </View>
                        )
                    })}
                    <View className="uploadImgBox" onClick={handlecChooseImages}>
                        <Image className="uploadImgLogo" mode="aspectFit" src={uplodImage}></Image>
                        <Text className="uploadImgText">点击上传</Text>
                    </View>
                </View>
            </View>

            <View className={isDisclosure ? "formLiLRBetween" : "formLiLRBetween opacity"}>
                <Text className="formLiL">对外展示</Text>
                <Switch className='formSwitch' color="#2f7958" checked={isDisclosure} onChange={(e) => handleIsDisclosure(e)} />
            </View>
            <View className="formLiTB">
                <Text className="formLiT">描述</Text>
                <Textarea
                    className="formLiTextarea"
                    value={description}
                    onInput={(e) => {
                        setDescription(e.detail.value)
                    }}
                    placeholder="请输入菜肴描述"
                    placeholderClass="placeholderClass"
                    maxlength={100}
                    autoHeight={true}
                    showCount
                />
            </View>
            {dishCategoriesOptions.length !== 0 && (
                <View className="formLiTB">
                    <Text className="formLiT">分类</Text>
                    <View className="formLiB">
                        <View className="formCheckbox">
                            {dishCategoriesOptions.map((item) => {
                                if (categories.includes(item.value)) {
                                    return (
                                        <Button className="formCheckItemActive" onClick={() => handleUnseleteCategory(item.value)}>{item.label}</Button>
                                    )
                                } else {
                                    return (
                                        <Button className="formCheckItem" onClick={() => handleSeleteCategory(item.value)}>{item.label}</Button>
                                    )
                                }
                            })}
                        </View>
                    </View>
                </View>
            )}

            {dishTagsOptions.length !== 0 && (
                <View className="formLiTB">
                    <Text className="formLiT">标签</Text>
                    <View className="formLiB">
                        <View className="formCheckbox">
                            {dishTagsOptions.map((item) => {
                                if (tags.includes(item.value)) {
                                    return (
                                        <Button className="formCheckItemActive" onClick={() => handleUnseleteTag(item.value)}>{item.label}</Button>
                                    )
                                } else {
                                    return (
                                        <Button className="formCheckItem" onClick={() => handleSeleteTag(item.value)}>{item.label}</Button>
                                    )
                                }
                            })}
                        </View>
                    </View>
                </View>
            )}
            {/* 加载图片，用于获取图片原始框高 */}
            {
                seleteImage.map((item, index) => {
                    if (!item.url.includes("https")) {
                        return (
                            <Image
                                onLoad={(e) => {
                                    seleteImageWidthHeightChange(e, index)
                                }}
                                src={item.url}
                                style={{ opacity: 0 }}
                            />
                        )
                    } else {
                        return null
                    }
                })
            }

        </View>
        <View className="buttonBox">
            <Button
                className="addButton"
                onClick={handleSave}
            // loading={createDishTagLoading || updateDishTagLoading}
            >{dishId ? '更新' : '新增'}</Button>
        </View>
    </View>)
}

export default DishEdit;