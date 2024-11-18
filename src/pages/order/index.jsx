import { View, Swiper, SwiperItem, Button, Input, Text, Image, Textarea } from "@tarojs/components"
import Taro from "@tarojs/taro"
import "./index.scss"
import { useEffect, useState } from "react"
import { getUserInfo } from "../../api/user"
import { getUserDish } from "../../api/dish"
import { useRequest } from "ahooks"
import touxiangImg from "../../assets/image/icon/touxiang.svg"
import meishiImg from "../../assets/image/icon/meishi.svg"
import addImg from "../../assets/image/icon/add.svg"
import addFFFImg from "../../assets/image/icon/addFFF.svg"
import minusImg from "../../assets/image/icon/minus.svg"
import minusFFFImg from "../../assets/image/icon/minusFFF.svg"
import directionLeftImg from "../../assets/image/icon/directionLeft.svg"
import directionRightImg from "../../assets/image/icon/directionRight.svg"
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
    const { run: createOrderFn } = useRequest(createOrder, {
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
                <Image mode="aspectFill" className='avatar' src={chefInfo.avatar ? chefInfo.avatar : touxiangImg}></Image>
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
                    onClick={() => setListType("already")}
                >已选</Button>
                <Button
                    className={listType === 'simpleMode' ? "modeSwitchItem modeSwitchItemActive" : "modeSwitchItem"}
                    onClick={() => setListType("simpleMode")}
                >极简</Button>
                <Button
                    className={listType === 'smallImageMode' ? "modeSwitchItem modeSwitchItemActive" : "modeSwitchItem"}
                    onClick={() => setListType("smallImageMode")}
                >小图</Button>
                <Button
                    className={listType === 'largeImageMode' ? "modeSwitchItem modeSwitchItemActive" : "modeSwitchItem"}
                    onClick={() => setListType("largeImageMode")}
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

    // 点餐时菜肴数量加减   white 加减号是白色   green（加减号是绿色） // 现在好向只用了绿色
    const renderNumberControl = (dish, type = 'green') => {
        return (
            <View className="numberControlBox">
                <Button
                    className="numberControlAddButton"
                    onClick={() => {
                        handleAddDish(dish)
                    }}
                >
                    <Image className="numberControlAddImage" src={type === 'green' ? addImg : addFFFImg} />
                </Button>
                <Text className="numberControlNumber">{getQuantity(dish)}</Text>
                <Button
                    className="numberControlAddButton"
                    onClick={() => {
                        handleMinusDish(dish)
                    }}
                >
                    <Image className="numberControlAddImage" src={type === 'green' ? minusImg : minusFFFImg} />
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
                            <View className="simpDishLi">
                                <Image mode="aspectFill" className='simpDishLiImg' src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : meishiImg} />
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
                                <Image mode="aspectFill" className='simpDishLiImg' src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : meishiImg} />
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
                            <View className="smallImageDishLi">
                                <View className="smallImageDishLiTop">
                                    <Image mode="aspectFill" className='smallImageDishLiImg' src={dish?.dish_images?.length > 0 ? dish.dish_images[0].url : meishiImg} />
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
                type='primary'
                onClick={() => handleCreateOrder()}
                style={createOrderButtonStyle}
            >选好了</Button>
        )
    }

    // 已选
    const renderAlready = () => {
        return (
            <>
                <View className="verticalScroll">
                    {renderSearchInput()}
                    {renderChefInfo()}
                    {renderModeSwitch()}
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

    // 极简模式
    const renderSimple = () => {
        return (
            <>
                <View className="verticalScroll">
                    {renderSearchInput()}
                    {renderChefInfo()}
                    {renderModeSwitch()}
                    {renderSimpleList()}
                </View>
                {renderCreateOrderButton()}
            </>
        )
    }

    // 小图模式
    const renderSmallImage = () => {
        return (
            <>
                <View className="verticalScroll">
                    {renderSearchInput()}
                    {renderChefInfo()}
                    {renderModeSwitch()}
                    {renderSmallImageList()}
                </View>
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

    // 大图模式
    const renderLargeImage = () => {
        return (
            <View className="largeImageBox">
                <Swiper
                    className='largeImageSwiper'
                    vertical
                    circular
                    indicatorDots={false}
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
                                                src={dish.dish_images[dish.showImageIndex].url || meishiImg}
                                            />
                                        )
                                    }
                                    {/* 菜肴没有图片的时候展示默认图片 */}
                                    {
                                        dish?.dish_images?.length === 0 && (
                                            <Image
                                                mode="widthFix"
                                                className='largeImageModeImgageWidthFix'
                                                src={meishiImg}
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
                                                    <Image className="leftImage" src={directionLeftImg}></Image>
                                                </Button>
                                                <Button
                                                    className="imageRightButton"
                                                    onClick={() => handleImageRight(dishIndex)}
                                                >
                                                    <Image className="rightImage" src={directionRightImg}></Image>
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
            {/* 已选 */}
            {listType === "already" && renderAlready()}
            {/* 极简 */}
            {listType === "simpleMode" && renderSimple()}
            {/* 小图 */}
            {listType === "smallImageMode" && renderSmallImage()}
            {/* 大图 */}
            {listType === "largeImageMode" && renderLargeImage()}
        </View>
    )
}

export default Order;
