import Taro from "@tarojs/taro";
import { useState, useEffect, useRef, useMemo } from "react";
import { View, Button, Input, Text, Textarea, Switch, Image, MovableArea, MovableView } from "@tarojs/components";
import { useRequest } from "ahooks";
import { getDishCategories } from "../../api/dishCategory";
import { getDishTags } from "../../api/dishTag";
import { createDish, getDishes, updateDish } from "../../api/dish";
import { getStsInfo } from "../../api/sts";
import _ from "loadsh";
import crypto from 'crypto-js';
import { Base64 } from 'js-base64';
import AddCategory from "../../components/AddCategory";
import AddTag from "../../components/AddTag";
import { URL_uploadImage, URL_close, URL_circleAdd } from "../../assets/imageOssUrl";
import { rpxToPx, pxToRpx } from "../../utils/utils";
import './index.scss'

const DishEdit = () => {
    const [dishId, setDishId] = useState(''); // 菜肴id， 编辑菜肴时有用
    const [name, setName] = useState(''); // 菜肴名称
    const [description, setDescription] = useState(''); // 菜肴描述
    const [categories, setCategories] = useState([]); // 菜肴分类已选项
    const [dishCategoriesOptions, setDishCategoriesOptions] = useState([]); // 菜肴分类可选项
    const [tags, setTags] = useState([]); // 菜肴标签已选项
    const [dishTagsOptions, setDishTagsOptions] = useState([]); // 菜肴标签可选项
    const [isDisclosure, setIsDisclosure] = useState(true); // 菜肴是否展示公开
    const [selectImage, setSelectImage] = useState([]); // 待上传菜肴图片
    const [stsInfo, setStsInfo] = useState({}) // oss上传所需签名信息
    const [buttonLoading, setButtonLoading] = useState(false); // 保存按钮loading状态
    const addCategoryRef = useRef(null); // 添加分类弹窗
    const addTagRef = useRef(null); // 添加标签弹窗
    const [replaceImageIndex, setReplaceImageIndex] = useState(null); // 替换图片索引
    const [imageMove, setImageMove] = useState(false); // 图片是否移动

    // 获取路由传参，判断是新增还是编辑
    useEffect(() => {
        const { router } = Taro.getCurrentInstance();
        const { id } = router.params;
        setDishId(id)
        if (id) {
            getDishesFn({ id })
        }
    }, []);

    // 获取菜肴列表
    const { run: getDishesFn } = useRequest(getDishes, {
        manual: true,
        onSuccess: (res) => {
            if (res.data && res.data.length > 0) {
                const dishInfo = res.data[0];
                setName(dishInfo.name);
                dishInfo.description && setDescription(dishInfo.description);
                if (dishInfo.dish_images && dishInfo.dish_images.length > 0) {
                    setSelectImage(dishInfo.dish_images.map((item) => ({
                        url: item.url,
                        width: item.width,
                        height: item.height
                    })));
                }
                setIsDisclosure(dishInfo.is_disclosure === "1" ? true : false);
                setCategories(dishInfo.dish_categories.map((item) => item.category_id))
                setTags(dishInfo.dish_tags.map((item) => item.tag_id))
            }
        }
    });

    // 获取菜肴分类
    const { run: getDishCategoriesFn } = useRequest(getDishCategories, {
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
    const { run: getDishTagsFn } = useRequest(getDishTags, {
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

    // 获取阿里云sts临时凭证，用于图片上传
    useRequest(getStsInfo, {
        onSuccess: (res) => {
            setStsInfo(res.data)
        }
    })

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
        }
    })

    const handleIsDisclosure = (e) => {
        setIsDisclosure(e.detail.value)
    }

    // 添加分类
    const handleAddCategory = () => {
        addCategoryRef.current.setIsOpen(true)
    }

    // 刷新分类列表
    const handleCategorySuccess = () => {
        getDishCategoriesFn()
    }

    // 添加标签
    const handleAddTag = () => {
        addTagRef.current.setIsOpen(true)
    }

    // 刷新标签列表
    const handleTagSuccess = () => {
        getDishTagsFn()
    }

    // 分类和标签选择函数
    const handleSelectCategory = (value) => {
        setCategories(prev => [...prev, value]);
    };

    const handleUnselectCategory = (value) => {
        setCategories(prev => prev.filter(item => item !== value));
    };

    const handleSelectTag = (value) => {
        setTags(prev => [...prev, value]);
    };

    const handleUnselectTag = (value) => {
        setTags(prev => prev.filter(item => item !== value));
    };

    // 预计算不同数量图片时的高度
    const IMAGE_HEIGHTS = [
        rpxToPx(154),                    // 1张图片
        rpxToPx(154),                    // 2张图片
        rpxToPx(154),                    // 3张图片
        rpxToPx(338),                    // 4张图片
        rpxToPx(338),                    // 5张图片
        rpxToPx(338),                    // 6张图片
        rpxToPx(522),                    // 7张图片
        rpxToPx(522),                    // 8张图片
        rpxToPx(522)                     // 9张图片
    ];

    // 计算图片区域高度
    const formLiBImagesHeight = useMemo(() => {
        return IMAGE_HEIGHTS[selectImage.length] || IMAGE_HEIGHTS[0];
    }, [selectImage.length]);

    // 预计算9张图片的位置信息
    const IMAGE_POSITIONS = [
        { x: rpxToPx(0), y: rpxToPx(0) },                    // 第1张
        { x: rpxToPx(154 + 30), y: rpxToPx(0) },            // 第2张
        { x: rpxToPx(308 + 60), y: rpxToPx(0) },            // 第3张
        { x: rpxToPx(0), y: rpxToPx(154 + 30) },            // 第4张
        { x: rpxToPx(154 + 30), y: rpxToPx(154 + 30) },     // 第5张
        { x: rpxToPx(308 + 60), y: rpxToPx(154 + 30) },     // 第6张
        { x: rpxToPx(0), y: rpxToPx(308 + 60) },            // 第7张
        { x: rpxToPx(154 + 30), y: rpxToPx(308 + 60) },     // 第8张
        { x: rpxToPx(308 + 60), y: rpxToPx(308 + 60) }      // 第9张
    ];

    // 抽取OSS上传相关函数
    const getOSSPolicy = () => {
        let date = new Date();
        date.setHours(date.getHours() + 1);
        return {
            expiration: date.toISOString(),
            conditions: [
                ["content-length-range", 0, 1024 * 1024 * 1024],
            ],
        };
    };

    const getOSSSignature = (policy, accessKeySecret) => {
        return crypto.enc.Base64.stringify(
            crypto.HmacSHA1(policy, accessKeySecret)
        );
    };

    const getOSSFormData = (stsInfo) => {
        const policyText = getOSSPolicy();
        const policy = Base64.encode(JSON.stringify(policyText));
        const signature = getOSSSignature(policy, stsInfo.AccessKeySecret);
        
        return {
            OSSAccessKeyId: stsInfo.AccessKeyId,
            signature,
            policy,
            'x-oss-security-token': stsInfo.SecurityToken
        };
    };

    // 图片上传函数
    const uploadImageToOSS = async (tempFilePath, stsInfo) => {
        try {
            const url = "https://webhomeide.oss-cn-hangzhou.aliyuncs.com";
            const fileType = tempFilePath.split('.').pop();
            const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType}`;
            const ossImgUrl = `${url}/${key}`;

            const formData = getOSSFormData(stsInfo);
            formData.key = key;

            const uploadResult = await Taro.uploadFile({
                url,
                filePath: tempFilePath,
                name: "file",
                formData
            });

            if (uploadResult.statusCode === 204) {
                const imageInfo = await Taro.getImageInfo({
                    src: ossImgUrl
                });

                return {
                    url: ossImgUrl,
                    width: imageInfo.width,
                    height: imageInfo.height
                };
            }
            throw new Error('上传失败');
        } catch (error) {
            throw error;
        }
    };

    // 图片选择函数
    const handleChooseImages = async () => {
        try {
            const remainingCount = 9 - selectImage.length;
            if (remainingCount <= 0) {
                Taro.showToast({
                    title: '最多上传9张图片',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }

            const result = await Taro.chooseImage({
                count: remainingCount,
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                edit: true // 开启编辑功能
            });

            // 批量获取图片信息
            const imageInfos = await Promise.all(
                result.tempFilePaths.map(path => 
                    Taro.getImageInfo({ src: path })
                )
            );
            
            const newImageList = imageInfos.map(info => ({
                url: info.path,
                width: info.height,
                height: info.height
            }));

            setSelectImage(prev => [...prev, ...newImageList]);
        } catch (error) {
            Taro.showToast({
                title: '获取图片信息失败',
                icon: 'error',
                duration: 2000
            });
        }
    };

    // 图片删除函数
    const handleDeleteImg = (url) => {
        setSelectImage(prev => prev.filter(item => item.url !== url));
    };

    // 保存函数
    const handleSave = async () => {
        if (!name) {
            Taro.showToast({
                title: '请输入菜肴名称',
                icon: 'error',
                duration: 2000
            });
            return;
        }

        setButtonLoading(true);

        try {
            // 批量上传图片
            const uploadPromises = selectImage.map(async (image) => {
                if (image.url.includes('https')) {
                    return image;
                }
                return await uploadImageToOSS(image.url, stsInfo);
            });

            const images = await Promise.all(uploadPromises);

            const requestData = {
                name,
                description,
                is_disclosure: isDisclosure ? "1" : "0",
                categories,
                tags,
                images
            };

            if (dishId) {
                await updateDishFn(requestData, dishId);
            } else {
                await createDishFn(requestData);
            }

        } catch (error) {
            Taro.showToast({
                title: '保存失败',
                icon: 'error',
                duration: 2000
            });
        } finally {
            setButtonLoading(false);
        }
    };

    // 图片移动相关函数
    const handleImageChange = (e, index) => {
        const { x, y } = e.detail;
        // 图片移动时中心点位置
        const rpxX = pxToRpx(x) + 154 / 2;
        const rpxY = pxToRpx(y) + 154 / 2;
        
        let newReplaceImageIndex = 0;
        // 计算图片中心点位于哪个格子
        const column = Math.ceil(rpxX / (154 + 30));
        const row = Math.ceil(rpxY / (154 + 30));
        // 计算图片位于哪张图片上方
        newReplaceImageIndex = (row - 1) * 3 + column - 1;
        
        if (newReplaceImageIndex > selectImage.length - 1) {
            newReplaceImageIndex = selectImage.length - 1;
        }
        
        if (newReplaceImageIndex !== replaceImageIndex) {
            setReplaceImageIndex(newReplaceImageIndex);
        }
    };

    // 图片移动开始
    const handleImageTouchStart = () => {
        setImageMove(true)
    }

    // 图片移动结束
    const handleImageTouchEnd = (index) => {
        if (replaceImageIndex === null || replaceImageIndex === index) {
            setImageMove(false);
            return;
        }

        setSelectImage(prev => {
            const newImages = [...prev];
            const moveImage = newImages.splice(index, 1)[0];
            newImages.splice(replaceImageIndex, 0, moveImage);
            return newImages;
        });
        
        setImageMove(false);
    };

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
                <MovableArea
                    className="formLiBImages"
                    style={{ height: formLiBImagesHeight }}
                >
                    {selectImage.map((item, index) => {
                        return (
                            <MovableView
                                className={replaceImageIndex === index && imageMove ? "selectImageBox selectImageBoxActive" : "selectImageBox"}
                                key={item.url}
                                x={IMAGE_POSITIONS[index].x}
                                y={IMAGE_POSITIONS[index].y}
                                direction="all"
                                onChange={(e, index) => handleImageChange(e, index)}
                                onTouchStart={() => handleImageTouchStart()}
                                onTouchEnd={() => handleImageTouchEnd(index)}
                                outOfBounds={true}
                            >
                                <Image className="selectImage" mode="aspectFit" src={item.url}></Image>
                                <Button className="deleteImageButton" onClick={() => handleDeleteImg(item.url)} >
                                    <Image className="deleteImage" src={URL_close}></Image>
                                </Button>
                            </MovableView>
                        )
                    })}
                    {selectImage.length < 9 && <View
                        className="uploadImgBox"
                        onClick={handleChooseImages}
                        style={{
                            left: IMAGE_POSITIONS[selectImage.length].x,
                            top: IMAGE_POSITIONS[selectImage.length].y
                        }}
                    >
                        <Image className="uploadImgLogo" mode="aspectFit" src={URL_uploadImage}></Image>
                        <Text className="uploadImgText">点击上传</Text>
                    </View>}
                </MovableArea>
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
                    <Button className="formLiTAbsoluteImageButton" onClick={handleAddCategory}>
                        <Image className="formLiTAbsoluteImage" src={URL_circleAdd}></Image>
                    </Button>
                    <Text className="formLiT">分类</Text>
                    <View className="formLiB">
                        <View className="formCheckbox">
                            {dishCategoriesOptions.map((item) => {
                                if (categories.includes(item.value)) {
                                    return (
                                        <Button className="formCheckItemActive" onClick={() => handleUnselectCategory(item.value)}>{item.label}</Button>
                                    )
                                } else {
                                    return (
                                        <Button className="formCheckItem" onClick={() => handleSelectCategory(item.value)}>{item.label}</Button>
                                    )
                                }
                            })}
                        </View>
                    </View>
                </View>
            )}

            {dishTagsOptions.length !== 0 && (
                <View className="formLiTB">
                    <Button className="formLiTAbsoluteImageButton" onClick={handleAddTag}>
                        <Image className="formLiTAbsoluteImage" src={URL_circleAdd}></Image>
                    </Button>
                    <Text className="formLiT">标签</Text>
                    <View className="formLiB">
                        <View className="formCheckbox">
                            {dishTagsOptions.map((item) => {
                                if (tags.includes(item.value)) {
                                    return (
                                        <Button className="formCheckItemActive" onClick={() => handleUnselectTag(item.value)}>{item.label}</Button>
                                    )
                                } else {
                                    return (
                                        <Button className="formCheckItem" onClick={() => handleSelectTag(item.value)}>{item.label}</Button>
                                    )
                                }
                            })}
                        </View>
                    </View>
                </View>
            )}

            <View className={isDisclosure ? "formLiLRBetween" : "formLiLRBetween opacity"}>
                <Text className="formLiL">当季食物</Text>
                <Switch className='formSwitch' color="#2f7958" checked={isDisclosure} onChange={(e) => handleIsDisclosure(e)} />
            </View>
        </View>
        <View className="buttonBox">
            <Button
                className="addButton"
                onClick={handleSave}
                loading={buttonLoading}
                disabled={buttonLoading}
            >{dishId ? '更新' : '新增'}</Button>
        </View>
        <AddCategory ref={addCategoryRef} onSuccess={handleCategorySuccess} />
        <AddTag ref={addTagRef} onSuccess={handleTagSuccess} />
    </View>)
}

export default DishEdit;