import { View, Button, Input, Text, Image } from "@tarojs/components";
import { useEffect, useState } from 'react'
import Taro from "@tarojs/taro";
import { useRequest } from "ahooks";
import { getUserDetails, updateUserInfo, checkUserCode } from "../../api/user";
import { getStsInfo } from "../../api/sts";
import uploadImage from "../../assets/image/userInfo/uploadImage.png"
import "./index.scss"
import crypto from 'crypto-js';
import { Base64 } from 'js-base64';
import _ from "loadsh"

// 计算签名。
function computeSignature (accessKeySecret, canonicalString) {
    return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
}

const userCodeMessage = "用户编号已被其他用户使用，请设置其他用户编号"

const userInfo = () => {
    const [nickname, setNickname] = useState(''); // 昵称
    const [avatar, setAvatar] = useState(''); // 头像
    const [titles, setTitles] = useState([""]); // 头衔
    const [userCode, setUserCode] = useState(''); // 用户编号
    // const [uploading, setUploading] = useState(false);
    const [stsInfo, setStsInfo] = useState({}) // oss上传所需签名信息
    const [isCheckUserCode, setIsCheckUserCode] = useState(true);

    // 获取用户信息
    const { run: getUserDetailsFn } = useRequest(getUserDetails, {
        manual: true,
        onSuccess: (res) => {
            let responseUserInfo = res.data
            if (responseUserInfo.title) {
                const transformTitle = responseUserInfo.title.split(',')
                responseUserInfo.titles = transformTitle
                setTitles(transformTitle)
            } else {
                responseUserInfo.titles = [""]
            }
            setNickname(responseUserInfo.nickname)
            setAvatar(responseUserInfo.avatar)
            setUserCode(responseUserInfo.user_code)
        }
    })

    // 更新用户信息
    const { run: updateUserInfoFn } = useRequest(updateUserInfo, {
        manual: true,
        onSuccess: (res) => {
            Taro.showToast({
                title: '更新成功',
                icon: 'success',
                duration: 2000
            })
            setTimeout(() => {
                Taro.navigateBack()
            }, 1000)
        }
    })

    // 校验usercode是否重负
    const { run: checkUserCodeFn } = useRequest(checkUserCode, {
        manual: true,
        debounceWait: 500, // 防抖
        onSuccess: (res) => {
            if (res.data === false) {
                setIsCheckUserCode(true)
            } else {
                setIsCheckUserCode(false)
            }
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
        getUserDetailsFn()
        getStsInfoFn()
    }, [])

    const handleSave = () => {
        if (!isCheckUserCode) {
            Taro.showToast({
                title: userCodeMessage,
                icon: 'error',
                duration: 2000
            })
        } else {
            updateUserInfoFn({
                nickname,
                avatar,
                title: titles.join(','),
                user_code: userCode
            })
        }
    }

    const handlecChooseImages = async (e) => {
        try {
            // 阿里云oss服务器地址
            const url = "https://webhomeide.oss-cn-hangzhou.aliyuncs.com"
            // 待上传图片的路径
            const filePath = e.detail.avatarUrl;
            // 通过文件路径获取文件类型 如.png还是.jpg
            const fileType = filePath.split('.').pop();
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
                filePath: filePath,
                name: "file",
                formData: {
                    ...formData,
                    key,
                },
                success (res) {
                    if (res.statusCode === 204) {
                        setAvatar(ossImgUrl)
                    }
                },
                fail (err) {
                    Taro.showToast({
                        title: '头像上传失败～',
                        icon: 'error',
                        duration: 2000
                    })
                }
            });
        } catch (error) {
        }
    };

    const handelTitleChange = (value, index) => {
        const newArr = _.cloneDeep(titles)
        newArr[index] = value
        setTitles(newArr)
    }

    const handelTitleDelete = (indexToRemove) => {
        const newArr = titles.filter((item, index) => index !== indexToRemove)
        setTitles(newArr)
    }

    const handelTitleAdd = () => {
        const newArr = _.cloneDeep(titles)
        newArr.push('')
        setTitles(newArr)
    }

    return (
        <View className="page">
            <View className="form">
                <View className="formLiLR">
                    <Text className="formLiL required">昵称</Text>
                    <Input
                        className="formLiR"
                        value={nickname}
                        onInput={(e) => {
                            setNickname(e.detail.value)
                        }}
                        onBlur={(e) => {
                            setNickname(e.detail.value)
                        }}
                        placeholder="请输入昵称"
                        placeholderClass="placeholderClass"
                        maxlength={12}
                        type="nickname"
                    />
                </View>
                <View className="formLiTB">
                    <Text className="formLiT">头像</Text>
                    <View className="formLiB formLiBAvatar">
                        <Button openType="chooseAvatar" className="uploadImgBox" onChooseAvatar={handlecChooseImages}>
                            {!avatar && (
                                <>
                                    <Image className="uploadImgLogo" mode="aspectFit" src={uploadImage}></Image>
                                    <Text className="uploadImgText">点击上传</Text>
                                </>
                            )}
                            {avatar && (
                                <Image className="avatar" mode="aspectFit" src={avatar}></Image>
                            )}
                        </Button>
                    </View>
                </View>
                <View className="formLiTB">
                    <Text className="formLiT">头衔</Text>
                    <View className="formLiB">
                        {titles.map((title, index) => {
                            return (<View className="titleBox" key={index}>
                                <Input
                                    className="titleInput"
                                    value={title}
                                    onInput={(e) => {
                                        handelTitleChange(e.detail.value, index)
                                    }}
                                    placeholder="请输入头衔,更新后生效"
                                    placeholderClass="placeholderClass"
                                    maxlength={12}
                                />
                                {index === (titles.length - 1) ? (
                                    <Button className="titleAddButton" onClick={() => handelTitleAdd()}>+</Button>
                                ) : (
                                    <Button className="titleDeleteButton" onClick={() => handelTitleDelete(index)}>删除</Button>
                                )}
                            </View>)
                        })}
                    </View>
                </View>
                <View className="formLiLR">
                    <Text className="formLiL">用户编号</Text>
                    <Input
                        className="formLiR"
                        value={userCode}
                        onInput={(e) => {
                            setUserCode(e.detail.value)
                            checkUserCodeFn({ user_code: e.detail.value })
                        }}
                        type="number"
                        placeholder="输入便于查找的用户编号"
                        placeholderClass="placeholderClass"
                        maxlength={12}
                    />
                </View>
                {!isCheckUserCode && (
                    <Text className="errorMessage">{userCodeMessage}</Text>
                )}
            </View>
            <View className="buttonBox">
                <Button
                    className="addButton"
                    onClick={handleSave}
                // loading={createDishTagLoading || updateDishTagLoading}
                >更新</Button>
            </View>
        </View>
    )
}

export default userInfo;
