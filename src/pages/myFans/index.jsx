import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react';
import './index.scss'
import { URL_avatar } from '../../assets/imageOssUrl';
import { getFollower, follow, unfollow } from '../../api/follow';
import Dialog from '../../components/Dialog';
import { useRequest } from 'ahooks';

export default function MyFans () {
    const [fans, setFans] = useState([]);
    const [followDialog, setFollowDialog] = useState(false);
    const [followUserId, setFollowUserId] = useState('');
    const [is_mutual, setIsMutual] = useState(false);
    const { run: getFansFn } = useRequest(getFollower, {
        manual: true,
        onBefore: () => {
            Taro.showLoading({
                title: '获取粉丝中...',
            })
        },
        onSuccess: (res) => {
            console.log(res)
            setFans(res.data.followerList)
        },
        onFinally: () => {
            Taro.hideLoading()
        }
    })

    useDidShow(() => {
        getFansFn()
    })

    // 回关用户
    const { run: followFn } = useRequest(follow, {
        manual: true,
        onBefore: () => {
            Taro.showLoading({
                title: '回关中...',
            })
        },
        onSuccess: (res) => {
            Taro.showToast({
                title: '回关成功',
                icon: 'success',
                duration: 2000
            })
            setFollowDialog(false)
            getFansFn()
        },
        onFinally: () => {
            setTimeout(function (){
                Taro.hideLoading()
            },500)
        }
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
            setFollowDialog(false)
            getFansFn()
        },
        onFinally: () => {
            setTimeout(function (){
                Taro.hideLoading()
            },500)
        }
    })

    return (
        <View className='myFansPage'>
            <View className='myFansList'>
                {
                    fans.map(fan => {
                        return (
                            <View
                                className="userLi"
                            >
                                <Image
                                    className='avatar'
                                    style={{ width: "76rpx", height: '76rpx' }}
                                    src={fan.avatar || URL_avatar}
                                />
                                <Text className='nickname'>{fan.nickname}</Text>
                                <Button
                                    className='unfollowButton'
                                    type='primary'
                                    onClick={(e) => {
                                        setIsMutual(fan.is_mutual)
                                        setFollowUserId(fan.user_id)
                                        setFollowDialog(true)
                                    }}
                                >{fan.is_mutual ? '已互关' : '回关'}</Button>
                            </View>
                        )
                    })
                }
                {followDialog && (
                    <Dialog
                        title="温馨提示"
                        content={is_mutual ? '你确定要取消关注该粉丝吗？' : '你确定要回关该粉丝吗？'}
                        visible={followDialog}
                        onConfirm={() => {
                            if (is_mutual) {
                                unfollowFn({ following_id: followUserId })
                            } else {
                                followFn({ following_id: followUserId })
                            }
                        }}
                        onCancel={() => setFollowDialog(false)}
                    />
                )}
                {fans.length === 0 && (
                    <View className='noFans'>
                        <Text className='noFansText'>暂无粉丝</Text>
                    </View>
                )}
            </View>
        </View>
    )
}