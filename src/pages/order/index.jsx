import { View, Swiper, SwiperItem, Button, Input, Text, Image, Textarea, ScrollView } from "@tarojs/components"
import Taro, { useShareAppMessage } from "@tarojs/taro"
import "./index.scss"
import { useEffect, useState } from "react"
import { getUserInfo } from "../../api/user"
import { getUserDish } from "../../api/dish"
import { useRequest } from "ahooks"
import { URL_avatar,URL_food,URL_add,URL_addFFF,URL_minus,URL_minusFFF,URL_directionLeft,URL_directionRight,URL_share } from "../../assets/imageOssUrl"
import Drawer from "../../components/Drawer"
import _ from "loadsh";
import { createOrder } from "../../api/order"

const Order = () => {
    const [userId, setUserId] = useState(''); // 厨师id
    const [name, setName] = useState(''); // 菜肴名称搜索
    const [note, setNote] = useState(''); // 订单备注
    const [chefInfo, setChefInfo] = useState({ // 厨师信息
        avatar: '',
        nickname: '',
        titles: [],
        user_id: ''
    });
    const [dishes, setDishes] = useState([]); // 菜肴列表
    const [allDishes, setAllDishes] = useState([]); // 全菜肴列表， 就是查询条件没那么苛刻时的菜肴列表，用来反显已选菜肴
    // largeImageMode（大图）   smallImageMode（小图）   simpleMode（极简）  already （已选）
    const [listType, setListType] = useState("simpleMode");
    const [orderInfo, setOrderInfo] = useState([]); // 已经选择的菜肴列表，带数量
    const [showAlready, setShowAlready] = useState(false); // 已选抽屉显示控制
    const [scrollViewHeight, setScrollViewHeight] = useState(700); // ScrollView高度
    const [simpleScrollTop, setSimpleScrollTop] = useState(0); // 极简模式滚动条高度
    const [simpleScrollTopTemporary, setSimpleScrollTopTemporary] = useState(0); // 极简模式滚动条高度临时值，一值给滚动条赋值滚动会抖动
    const [smallScrollTop, setSmallScrollTop] = useState(0); // 小图模式滚动条高度
    const [smallScrollTopTemporary, setSmallScrollTopTemporary] = useState(0); // 小图模式滚动条高度临时值，一值给滚动条赋值滚动会抖动
    const [largeCurrent, setLargeCurrent] = useState(0); // 大图模式swiper展示索引
    const [largeCurrentTemporary, setLargeCurrentTemporary] = useState(0); // 大图模式swiper展示索引临时记录

    // 分享菜单给好友
    useShareAppMessage(() => ({
        title: `亲爱的家人朋友们，这里有份专属菜单等你探索！`, // 动态生成分享标题
        path: `/pages/order/index?id=${userId}`, // 动态生成分享路径
        imageUrl: chefInfo.avatar ? chefInfo.avatar : URL_avatar, // 分享图片 URL
    }));

    // 获取菜肴列表
    const { run: getUserDishFn } = useRequest(getUserDish, {
        manual: true,
        debounceWait: 500,
        debounceLeading: true,
        onSuccess: (res, params) => {
            if (params[0].name == '') {
                setAllDishes(res.data.map((item) => {
                    return {
                        ...item,
                        showImageIndex: 0
                    }
                }))
            }
            setDishes(res.data.map((item) => {
                return {
                    ...item,
                    showImageIndex: 0
                }
            }))
        }
    });

    // 获取厨师信息
    const { run: getUserInfoFn } = useRequest(getUserInfo, {
        manual: true,
        onSuccess: (res) => {
            let responseUserInfo = res.data
            if (responseUserInfo.title) {
                responseUserInfo.titles = responseUserInfo.title.split(',')
            } else {
                responseUserInfo.titles = []
            }
            setChefInfo(responseUserInfo)
        }
    });
    // 获取厨师id
    useEffect(() => {
        const { router } = Taro.getCurrentInstance();
        const { id } = router.params;
        setUserId(id);
    })

    //下单
    const { run: createOrderFn, loading: createOrderLoading } = useRequest(createOrder, {
        manual: true,
        onSuccess: (res) => {
            setOrderInfo([]);
            Taro.navigateTo({
                url: "/pages/myOrderHistory/index",
            })
        }
    })

    // 获取厨师信息， 获取厨师菜单
    useEffect(() => {
        if (userId) {
            getUserDishFn({ userId: userId, name })
        }
    }, [userId, name])
    // 获取厨师信息， 获取厨师菜单
    useEffect(() => {
        if (userId) {
            getUserInfoFn({ userId: userId })
        }
    }, [userId])

    // 计算ScrollView的高度
    useEffect(() => {
        // 获取系统信息
        Taro.getSystemInfo({
          success: function(res) {
            const searchBoxHeight = 98 + 60 + 58; // 固定高度
            setScrollViewHeight(res.windowHeight - searchBoxHeight);
          }
        });
    }, []);

    // 点击选好了下单
    const handleCreateOrder = () => {
        if (orderInfo.length === 0) {
            Taro.showToast({
                title: '你还没有选择菜肴',
                icon: 'error',
                duration: 2000
            })
        } else {
            createOrderFn({
                dishes: orderInfo,
                chef_id: userId,
                note
            })
        }
    }

    // 菜肴名称搜索输入框
    const renderSearchInput = () => {
        return (
            <View className='dishSearchBox'>
                <Input
                    className='dishSearch'
                    placeholder='请输入菜名搜索'
                    value={name}
                    placeholderClass="dishSearchPlaceholder"
                    onInput={(e) => {
                        setName(e.detail.value)
                    }}
                />
            </View>
        )
    }

    // 厨师信息
    const renderChefInfo = () => {
        return (
            <View className='userInfo'>
                <Button className="shareButton" open-type="share">
                    <Image className="shareImage" src={URL_share}></Image>
                </Button>
                <Image mode="aspectFill" className='avatar' src={chefInfo.avatar ? chefInfo.avatar : URL_avatar}></Image>
                <View className='userInfoRight'>
                    <Text className='nickname'>{chefInfo.nickname}</Text>
                    {
                        chefInfo.titles.length > 0 && <View className='titles'>
                            {chefInfo.titles.map((title) => {
                                return (
                                    <Text className='title'>{title}</Text>
                                )
                            })}
                        </View>
                    }
                </View>
            </View>
        )
    }

    // 菜肴列表样式切换， 已选、极简、小图、大图
    const renderModeSwitch = (modeSwitchStyle = {}) => {
        return (
            <View className="modeSwitch" style={modeSwitchStyle}>
                <Button
                    className={listType === 'already' ? "modeSwitchItem modeSwitchItemActive" : "modeSwitchItem"}
                    onClick={() => {
                        // setListType("already")
                        setShowAlready(!showAlready)
                    }}
                >已选</Button>
                <Button
                    className={listType === 'simpleMode' ? "modeSwitchItem modeSwitchItemActive" : "modeSwitchItem"}
                    onClick={() => {
                        setSimpleScrollTop(simpleScrollTopTemporary)
                        setListType("simpleMode")
                    }}
                >极简</Button>
                <Button
                    className={listType === 'smallImageMode' ? "modeSwitchItem modeSwitchItemActive" : "modeSwitchItem"}
                    onClick={() => {
                        setSmallScrollTop(smallScrollTopTemporary)
                        setListType("smallImageMode")
                    }}
                >小图</Button>
                <Button
                    className={listType === 'largeImageMode' ? "modeSwitchItem modeSwitchItemActive" : "modeSwitchItem"}
                    onClick={() => {
                        setLargeCurrent(largeCurrentTemporary)
                        setListType("largeImageMode")
                    }}
                >大图</Button>
            </View>
        )
    }

    // 选择菜肴
    const handleAddDish = (dish) => {
        const newOrderInfo = _.cloneDeep(orderInfo)
        const dishIndex = orderInfo.findIndex((item) => item.dish_id === dish.dish_id);
        if (dishIndex === -1) {
            newOrderInfo.push({
                dish_id: dish.dish_id,
                quantity: 1
            })
        } else {
            newOrderInfo[dishIndex].quantity = newOrderInfo[dishIndex].quantity + 1;
        }
        setOrderInfo(newOrderInfo)
    }

    // 选择的菜肴数量减1
    const handleMinusDish = (dish) => {
        const newOrderInfo = _.cloneDeep(orderInfo)
        const dishIndex = orderInfo.findIndex((item) => item.dish_id === dish.dish_id);
        if (dishIndex === -1) {
            return
        } else {
            if (newOrderInfo[dishIndex].quantity === 1) {
                newOrderInfo.splice(dishIndex, 1);
            } else {
                newOrderInfo[dishIndex].quantity = newOrderInfo[dishIndex].quantity - 1;
            }
        }
        setOrderInfo(newOrderInfo)
    }

    // 选择的菜肴的数据渲染
    const getQuantity = (dish) => {
        const dishIndex = orderInfo.findIndex((item) => item.dish_id === dish.dish_id);
        if (dishIndex === -1) {
            return 0
        } else {
            return orderInfo[dishIndex].quantity
        }
    }

    // 点击图片，跳转至大图模式看详情
    const handleImage = (dish) => {
        const largeNewTemporary = dishes.findIndex((item) => dish.dish_id === item.dish_id);
        setLargeCurrent(largeNewTemporary)
        setListType("largeImageMode")
    }

    // 点餐时菜肴数量加减   white 加减号是白色   green（加减号是绿色） // 现在好像只用了绿色
    const renderNumberControl = (dish, type = 'green') => {
        return (
            <View className="numberControlBox">
                <Button
                    className="numberControlAddButton"
                    onClick={() => {
                        handleMinusDish(dish)
                    }}
                >
                    <Image className="numberControlAddImage" src={type === 'green' ? URL_minus : URL_minusFFF} />
                </Button>
                <Text className="numberControlNumber">{getQuantity(dish)}</Text>
                <Button
                    className="numberControlAddButton"
                    onClick={() => {
                        handleAddDish(dish)
                    }}
                >
                    <Image className="numberControlAddImage" src={type === 'green' ? URL_add : URL_addFFF} />
                </Button>
            </View>
        )
    }

    // 极简菜肴列表
    const renderSimpleList = () => {
        return (
            <View className="simpDishList">
                {
                    dishes.map((dish) => {
                        return (
                            <View className="simpDishLi" key={dish.dish_id}>
                                <Image
                                    mode="aspectFill"
                                    className='simpDishLiImg'
                                    src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : URL_food}
                                    onClick={() => handleImage(dish)}
                                />
                                <Text className="simpDishLiName">{dish.name}</Text>
                                {renderNumberControl(dish, 'green')}
                            </View>
                        )
                    })
                }
            </View>
        )
    }

    // 已选菜肴列表
    const renderAlreadyList = () => {
        return (
            <View className="simpDishList">
                {
                    orderInfo.map((orderInfoLi) => {
                        const dish = allDishes[allDishes.findIndex(item => item.dish_id === orderInfoLi.dish_id)];
                        return (
                            <View className="simpDishLi">
                                <Image mode="aspectFill" className='simpDishLiImg' src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : URL_food} />
                                <Text className="simpDishLiName">{dish.name}</Text>
                                {renderNumberControl(dish, 'green')}
                            </View>
                        )
                    })
                }
            </View>
        )
    }

    // 小图菜肴列表
    const renderSmallImageList = () => {
        return (
            <View className="smallImageDishList">
                {
                    dishes.map((dish) => {
                        return (
                            <View className="smallImageDishLi" key={dish.dish_id}>
                                <View className="smallImageDishLiTop">
                                    <Image
                                        mode="aspectFill"
                                        className='smallImageDishLiImg'
                                        src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : URL_food}
                                        onClick={() => handleImage(dish)}
                                    />
                                    <View className="smallImageDishLiNameDescription">
                                        <Text className="smallImageDishLiName">{dish.name}</Text>
                                        <Text className="smallImageDishLiDescription">{dish.description}</Text>
                                    </View>
                                </View>
                                <View className="smallImageDishLiBottom">
                                    <View className="smallImageDishLiCategoryTag">
                                        {dish.dish_categories.map((category) => {
                                            return (
                                                <Text className="smallImageDishLiCategory">{category.name}</Text>
                                            )
                                        })}
                                        {dish.dish_tags.map((tag) => {
                                            return (
                                                <Text className="smallImageDishLiTag">{tag.name}</Text>
                                            )
                                        })}
                                    </View>
                                    {renderNumberControl(dish, 'green')}
                                </View>
                            </View>
                        )
                    })
                }
            </View>
        )
    }

    // 选好了按钮
    const renderCreateOrderButton = (createOrderButtonStyle = {}) => {
        return (
            <Button
                className='createOrderButton'
                onClick={() => handleCreateOrder()}
                style={createOrderButtonStyle}
                loading={createOrderLoading}
            >选好了</Button>
        )
    }

    // 已选
    const renderAlready = () => {
        return (
            <>
                <View>
                    {renderAlreadyList()}
                    <Textarea
                        className="orderNote"
                        value={note}
                        onInput={(e) => {
                            setNote(e.detail.value)
                        }}
                        placeholder="请输入备注留言"
                        placeholderClass="orderNotePlaceholderClass"
                        maxlength={100}
                        autoHeight={true}
                        showCount
                    />
                </View>
                {renderCreateOrderButton()}
            </>
        )
    }


    const handleSimpleScroll = (e) => {
        setSimpleScrollTopTemporary(e?.detail?.scrollTop || 0)
    }

    // 极简模式
    const renderSimple = () => {
        return (
            <>
                {renderSearchInput()}
                {renderModeSwitch()}
                    <ScrollView
                        className="verticalScrollView"
                        scrollY
                        style={{height: scrollViewHeight}}
                        onScroll={handleSimpleScroll}
                        scrollTop={simpleScrollTop}
                    >
                        {renderChefInfo()}
                        {renderSimpleList()}
                    </ScrollView>
                {renderCreateOrderButton()}
            </>
        )
    }

    const handleSmallScroll = (e) => {
        setSmallScrollTopTemporary(e?.detail?.scrollTop || 0)
    }

    // 小图模式
    const renderSmallImage = () => {
        return (
            <>
                {renderSearchInput()}
                {renderModeSwitch()}
                <ScrollView
                    className="verticalScrollView"
                    scrollY
                    style={{height: scrollViewHeight}}
                    onScroll={handleSmallScroll}
                    scrollTop={smallScrollTop}
                >
                    {renderChefInfo()}
                    {renderSmallImageList()}
                </ScrollView>
                {renderCreateOrderButton()}
            </>
        )
    }

    // 切换上一张图片
    const handleImageLeft = (dishIndex) => {
        const newDishes = _.cloneDeep(dishes);
        const dishItem = newDishes[dishIndex];
        const dishItemImages = newDishes[dishIndex].dish_images;
        const newIndex = (dishItem.showImageIndex === 0) ? (dishItemImages.length - 1) : (dishItem.showImageIndex - 1);
        newDishes[dishIndex].showImageIndex = newIndex;
        setDishes(newDishes)
    }

    // 切换下一张图片
    const handleImageRight = (dishIndex) => {
        const newDishes = _.cloneDeep(dishes);
        const dishItem = newDishes[dishIndex];
        const dishItemImages = newDishes[dishIndex].dish_images;
        const newIndex = (dishItem.showImageIndex === (dishItemImages.length - 1)) ? 0 : dishItem.showImageIndex + 1;
        newDishes[dishIndex].showImageIndex = newIndex;
        setDishes(newDishes)
    }

    const handleLargeCurrentChange = (e) => {
        setLargeCurrentTemporary(e?.detail?.current)
    }

    // 大图模式
    const renderLargeImage = () => {
        return (
            <View className="largeImageBox">
                <Swiper
                    className='largeImageSwiper'
                    vertical
                    circular
                    current={largeCurrent}
                    indicatorDots={false}
                    onChange={handleLargeCurrentChange}
                >
                    {dishes.map((dish, dishIndex) => {
                        // LS Landscape screen横屏     VS Vertical screen竖屏
                        let imageStyle = 'LS';
                        if (dish.dish_images.length > 0) {
                            imageStyle = (dish.dish_images[dish.showImageIndex]?.width >= dish.dish_images[dish.showImageIndex]?.height) ? 'LS' : 'VS';
                        }
                        return (
                            <SwiperItem>
                                <View className='largeImageSwiperLi'>
                                    {
                                        dish?.dish_images?.length > 0 && (
                                            <Image
                                                mode={(imageStyle === 'LS') ? 'widthFix' : 'aspectFill'}
                                                className={(imageStyle === 'LS') ? "largeImageModeImgageWidthFix" : "largeImageModeImgage"}
                                                src={dish.dish_images[dish.showImageIndex].url || URL_food}
                                            />
                                        )
                                    }
                                    {/* 菜肴没有图片的时候展示默认图片 */}
                                    {
                                        dish?.dish_images?.length === 0 && (
                                            <Image
                                                mode="widthFix"
                                                className='largeImageModeImgageWidthFix'
                                                src={URL_food}
                                            />
                                        )
                                    }
                                    {/* 渐变色背景 */}
                                    {/* <View className='largeImageModeBackground'></View> */}
                                    <View
                                        className={(imageStyle === 'LS') ? "largeImageDishInfo largeImageDishInfoHorizontal" : "largeImageDishInfo"}
                                    >
                                        <Text className="largeImageDishName">{dish.name}</Text>
                                        <Text className="largeImageDescription">{dish.description}</Text>
                                        <View className="largeImageDishBottom">
                                            <View className="largeImageDishCategoryTag">
                                                {dish.dish_categories.map((category) => {
                                                    return (
                                                        <Text className="largeImageDishCategory">{category.name}</Text>
                                                    )
                                                })}
                                                {dish.dish_tags.map((tag) => {
                                                    return (
                                                        <Text className="largeImageDishTag">{tag.name}</Text>
                                                    )
                                                })}
                                            </View>
                                            {renderNumberControl(dish, 'green')}
                                        </View>
                                    </View>
                                    {
                                        dish?.dish_images?.length > 1 && (
                                            <>
                                                <Button
                                                    className="imageLeftButton"
                                                    onClick={() => handleImageLeft(dishIndex)}
                                                >
                                                    <Image className="leftImage" src={URL_directionLeft}></Image>
                                                </Button>
                                                <Button
                                                    className="imageRightButton"
                                                    onClick={() => handleImageRight(dishIndex)}
                                                >
                                                    <Image className="rightImage" src={URL_directionRight}></Image>
                                                </Button>
                                            </>
                                        )
                                    }
                                </View>
                            </SwiperItem>
                        )
                    })}
                </Swiper>

                {renderModeSwitch({
                    position: 'absolute',
                    top: "40rpx",
                    zIndex: 3,
                    backgroundColor: "transparent"
                })}

                {renderCreateOrderButton({
                    position: 'absolute',
                    left: "40rpx",
                    bottom: "0rpx",
                    zIndex: 5,
                })}
            </View>
        )
    }
    return (
        <View className="orderPage">
            {/* 极简 */}
            {listType === "simpleMode" && renderSimple()}
            {/* 小图 */}
            {listType === "smallImageMode" && renderSmallImage()}
            {/* 大图 */}
            {listType === "largeImageMode" && renderLargeImage()}
            {/* 已选 */}
            {/* {listType === "already" && renderAlready()} */}
            <Drawer
                isOpen={showAlready}
                title="已选"
                bodyRender={renderAlready}
                onClose={() => {
                    setShowAlready(false)
                }}
            />
        </View>
    )
}

export default Order;
