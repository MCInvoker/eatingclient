import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react';
import './index.scss'
import { URL_avatar } from '../../assets/imageOssUrl';
import { getFollow, unfollow } from '../../api/follow';
import Dialog from '../../components/Dialog';
import { useRequest } from 'ahooks';

export default function MyFollows () {
    const [follows, setFollows] = useState([]);
    const [unfollowDialog, setUnfollowDialog] = useState(false);
    const [unfollowUserId, setUnfollowUserId] = useState('');
    const { run: getFollowFn } = useRequest(getFollow, {
        manual: true,
        onBefore: () => {
            Taro.showLoading({
                title: '获取关注中...',
            })
        },
        onSuccess: (res) => {
            setFollows(res.data.followingList)
        },
        onFinally: () => {
            Taro.hideLoading()
        }
    })

    useDidShow(() => {
        getFollowFn()
    })

    // 取关用户
    const { run: unfollowFn } = useRequest(unfollow, {
        manual: true,
        onBefore: () => {
            Taro.showLoading({
                title: '取关中...',
            })
        },
        onSuccess: (res) => {
            Taro.showToast({
                title: '取关成功',
                icon: 'success',
                duration: 2000
            })
            setUnfollowDialog(false)
            getFollowFn()
        },
        onFinally: () => {
            setTimeout(function (){
                Taro.hideLoading()
            },500)
        }
    })

    const handleUnfollow = (user_id) => {
        setUnfollowUserId(user_id)
        setUnfollowDialog(true)
    }

    return (
        <View className='myFollowsPage'>
            <View className='myFollowsList'>
                {
                    follows.map(follow => {
                        return (
                            <View
                                className="userLi"
                            >
                                <Image
                                    className='avatar'
                                    style={{ width: "76rpx", height: '76rpx' }}
                                    src={follow.following.avatar || URL_avatar}
                                />
                                <Text className='nickname'>{follow.following.nickname}</Text>
                                <Button
                                    className='unfollowButton'
                                    type='primary'
                                    onClick={(e) => {
                                        handleUnfollow(follow.following.user_id)
                                    }}
                                >取关</Button>
                            </View>
                        )
                    })
                }
                {follows.length === 0 && (
                    <View className='noFollows'>
                        <Text className='noFollowsText'>暂无关注</Text>
                    </View>
                )}
            </View>
            {unfollowDialog && (
                <Dialog
                    title="温馨提示"
                    content="你确定要取关该用户吗？"
                    visible={unfollowDialog}
                    onConfirm={() => unfollowFn({ following_id: unfollowUserId })}
                    onCancel={() => setUnfollowDialog(false)}
                />
            )}
        </View>
    )
}