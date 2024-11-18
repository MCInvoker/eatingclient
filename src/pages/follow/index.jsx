import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'
import { getFollow } from '../../api/follow';
import { useRequest } from 'ahooks';
import touxiangImg from "../../assets/image/icon/touxiang.svg"

export default function Follow () {
    const [nickname, setNickname] = useState('');
    const [follows, setFollows] = useState([]);

    // 获取菜肴列表
    const { run: getFollowFn } = useRequest(getFollow, {
        debounceWait: 300,
        debounceLeading: true, // 虽然开了防抖，但立马执行
        manual: true,
        onSuccess: (res) => {
            const me = res.data.currentUser;
            const newFollows = res.data.followingList.map((item) => {
                return {
                    ...item.following
                }
            })
            setFollows([me, ...newFollows])
        }
    });

    useDidShow(() => {
        getFollowFn()
        Taro.setTabBarStyle({
            backgroundColor: '#f8f8f8',
        })
    })

    const handleOrder = (user_id) => {
        Taro.navigateTo({
            url: `/pages/order/index?id=${user_id}`,
        })
    }

    const handleGoSearchUser = () => {
        Taro.navigateTo({
            url: `/pages/searchUser/index`,
        })
    }

    return (
        <View className='followPage'>
            <Input
                className='userSearch'
                placeholder='请输入用户昵称搜索'
                value={nickname}
                placeholderClass="userSearchPlaceholder"
                onInput={(e) => {
                    setNickname(e.detail.value)
                    getFollowFn({ nickname: e.detail.value })
                }}
            />
            <View className="userList">
                {
                    follows.map(follow => {
                        return (
                            <View
                                className="userLi"
                            >
                                <Image
                                    className='avatar'
                                    style={{ width: "76rpx", height: '76rpx' }}
                                    src={follow.avatar || touxiangImg}
                                />
                                <Text className='nickname'>{follow.nickname}</Text>
                                <Button
                                    className='orderButton'
                                    type='primary'
                                    onClick={(e) => {
                                        handleOrder(follow.user_id)
                                    }}
                                >点餐</Button>
                            </View>
                        )
                    })
                }
            </View>
            <Button className='searchuserButton' type='primary' onClick={() => handleGoSearchUser()}>查找用户</Button>
        </View>
    )
}
