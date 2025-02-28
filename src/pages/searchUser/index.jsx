import { View, Text, Input, Button, Image } from '@tarojs/components'
import "./index.scss"
import { useEffect, useState } from 'react';
import { searchUser } from '../../api/user';
import { follow, unfollow } from '../../api/follow';
import { URL_touxiang } from '../../assets/imageOssUrl';
import { useRequest } from 'ahooks';

const SearchUser = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);

    // 搜索用户
    const { run: searchUserFn } = useRequest(searchUser, {
        debounceWait: 300,
        manual: true,
        onSuccess: (res) => {
            setUsers(res.data)
        }
    })

    // 关注用户
    const { run: followFn } = useRequest(follow, {
        manual: true,
        onSuccess: (res) => {
            searchUserFn({ searchTerm })
        }
    })

    // 取关用户
    const { run: unfollowFn } = useRequest(unfollow, {
        manual: true,
        onSuccess: (res) => {
            searchUserFn({ searchTerm })

        }
    })

    useEffect(() => {
        if (searchTerm) {
            searchUserFn({ searchTerm })
        }
    }, [searchTerm])

    const handleFollow = (user) => {
        // 已经关注了，  取关
        if (user.is_followed) {
            unfollowFn({ following_id: user.user_id })
        } else {
            // 关注
            followFn({ following_id: user.user_id })
        }

    }
    return (
        <View className="searchUserPage">
            <Input
                className='userSearch'
                placeholder='请输入用户昵称、编号搜索'
                value={searchTerm}
                placeholderClass="userSearchPlaceholder"
                onInput={(e) => {
                    setSearchTerm(e.detail.value)
                }}
            />
            <View className="userList">
                {
                    users.map(user => {
                        return (
                            <View
                                className="userLi"
                            >
                                <Image
                                    className='avatar'
                                    style={{ width: "76rpx", height: '76rpx' }}
                                    src={user.avatar || URL_touxiang}
                                />
                                <Text className='nickname'>{user.nickname}</Text>
                                <Button
                                    className='followButton'
                                    type='primary'
                                    onClick={(e) => {
                                        handleFollow(user)
                                    }}
                                >{user.is_followed ? "取关" : "关注"}</Button>
                            </View>
                        )
                    })
                }
            </View>
        </View>
    )
}

export default SearchUser;