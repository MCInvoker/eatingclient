import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'
import { getFollow } from '../../api/follow';
import { useRequest } from 'ahooks';
import { URL_avatar } from '../../assets/imageOssUrl';

export default function Follow () {
    const [nickname, setNickname] = useState('');
    const [follows, setFollows] = useState([]);
    const [showSearchInput, setShowSearchInput] = useState(false);

    // 获取菜肴列表
    const { run: getFollowFn } = useRequest(getFollow, {
        debounceWait: 300,
        debounceLeading: true, // 虽然开了防抖，但立马执行
        manual: true,
        onSuccess: (res, params) => {
            const me = res.data.currentUser;
            const newFollows = res.data.followingList.map((item) => {
                return {
                    ...item.following
                }
            })
            setFollows([me, ...newFollows])
            // 如果所有关注的人都不超过10人，页面顶部就不用展示搜索框了
            if (params.length === 0) {
                if (newFollows.length > 10) {
                    setShowSearchInput(true)
                } else {
                    setShowSearchInput(false)
                }
            }
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
            {showSearchInput && (<Input
                className='userSearch'
                placeholder='输入昵称搜索已关注用户'
                value={nickname}
                placeholderClass="userSearchPlaceholder"
                onInput={(e) => {
                    setNickname(e.detail.value)
                    getFollowFn({ nickname: e.detail.value })
                }}
            />)}
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
                                    src={follow.avatar || URL_avatar}
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
            <Button className='searchUserButton' type='primary' onClick={() => handleGoSearchUser()}>查找新用户</Button>
        </View>
    )
}
