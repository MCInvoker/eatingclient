import { View, Swiper, SwiperItem, Button, Input, Text, Image, Textarea, ScrollView } from "@tarojs/components"
import Taro, { useShareAppMessage } from "@tarojs/taro"
import "./index.scss"
import { useEffect, useState } from "react"
import { getUserInfo } from "../../api/user"
import { getUserDish } from "../../api/dish"
import { useRequest } from "ahooks"
import { URL_avatar, URL_food, URL_add, URL_addFFF, URL_minus, URL_minusFFF, URL_directionLeft, URL_directionRight, URL_share, URL_filter } from "../../assets/imageOssUrl"
import DraggableButton from "../../components/DraggableButton";
import Drawer from "../../components/Drawer"
import MultiSelector from "../../components/MultiSelector";
import _ from "lodash";
import { createOrder } from "../../api/order"

/**
 * 提取菜肴数组中的所有分类和标签（包含id和name，去重）
 * @param {Array} dishList - 菜肴数据数组
 * @returns {Object} 包含分类列表和标签列表的对象
 *   - categoryList:  [{ id: 分类id, name: 分类名称 }, ...]
 *   - tagList:       [{ id: 标签id, name: 标签名称 }, ...]
 */
function extractCategoriesAndTags (dishList) {
    // 用对象存储已存在的分类和标签（key为id，避免重复）
    const categoryMap = {};
    const tagMap = {};

    // 遍历每道菜肴
    dishList.forEach(dish => {
        // 提取分类（id为category_id，name为name）
        if (dish.dish_categories && dish.dish_categories.length > 0) {
            dish.dish_categories.forEach(category => {
                const { category_id: id, name } = category;
                // 只添加未存在的分类（通过id判断）
                if (!categoryMap[id]) {
                    categoryMap[id] = { id, name, value: id, label: name };
                }
            });
        }

        // 提取标签（id为tag_id，name为name）
        if (dish.dish_tags && dish.dish_tags.length > 0) {
            dish.dish_tags.forEach(tag => {
                const { tag_id: id, name } = tag;
                // 只添加未存在的标签（通过id判断）
                if (!tagMap[id]) {
                    tagMap[id] = { id, name, value: id, label: name };
                }
            });
        }
    });

    // 转换为数组返回（按id排序，保持一致性）
    return {
        categoryList: Object.values(categoryMap).sort((a, b) => a.id - b.id),
        tagList: Object.values(tagMap).sort((a, b) => a.id - b.id)
    };
}

/**
* 根据分类ID和标签ID过滤菜肴（满足任一条件即保留）
* @param {Array} dishList - 原始菜肴数据数组（即接口返回的 data 数组）
* @param {Array} filterCategory - 筛选的分类ID数组（如 [4, 6]）
* @param {Array} filterTag - 筛选的标签ID数组（如 [7, 9]）
* @returns {Array} 过滤后的菜肴数组
*/
function filterDishesByCategoryAndTag (dishList, filterCategory = [], filterTag = []) {
    // 若两个筛选条件都为空，直接返回所有菜肴
    if (filterCategory.length === 0 && filterTag.length === 0) {
        return [...dishList];
    }

    return dishList.filter(dish => {
        // 1. 检查菜肴是否匹配任一筛选分类
        const matchCategory = filterCategory.length > 0
            ? dish.dish_categories.some(category =>
                filterCategory.includes(category.category_id)
            )
            : false;

        // 2. 检查菜肴是否匹配任一筛选标签
        const matchTag = filterTag.length > 0
            ? dish.dish_tags.some(tag =>
                filterTag.includes(tag.tag_id)
            )
            : false;

        // 3. 满足“分类匹配 或 标签匹配”任一条件即保留
        return matchCategory || matchTag;
    });
}

const Order = () => {
    const [userId, setUserId] = useState(''); // 厨师id
    const [defaultDishId, setDefaultDishId] = useState(''); // 默认菜肴id
    const [isFirstRequest, setIsFirstRequest] = useState(true); // 是否第一次请求菜肴列表
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
    const [showFilter, setShowFilter] = useState(false); // 筛选菜肴抽屉显示控制
    const [categoryList, setCategoryList] = useState([]); // 所有菜肴分类
    const [tagList, setTagList] = useState([]); // 所有菜肴标签
    const [filterCategory, setFilterCategory] = useState([]); // 筛选的菜肴分类
    const [filterTag, setFilterTag] = useState([]); // 筛选的菜肴标签

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
        onSuccess: (res) => {
            if (isFirstRequest) {
                const newDishes = _.cloneDeep(res.data)
                const result = extractCategoriesAndTags(newDishes)
                setCategoryList(result.categoryList)
                setTagList(result.tagList)
                setAllDishes(newDishes.map((item) => {
                    return {
                        ...item,
                        showImageIndex: 0
                    }
                }))
                if (defaultDishId) {
                    const defaultDish = newDishes.find((item) => item.dish_id === Number(defaultDishId));
                    if (defaultDish) {
                        handleAddDish(defaultDish)
                    }
                }
            }

            setDishes(res.data.map((item) => {
                return {
                    ...item,
                    showImageIndex: 0
                }
            }))
            setIsFirstRequest(false)
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
        const { id, dish_id } = router.params;
        setUserId(id);
        setDefaultDishId(dish_id);
        if (dish_id) {
            // setShowAlready(!showAlready)
            setShowAlready(true)
        }
    }, [])

    //下单
    const { run: createOrderFn, loading: createOrderLoading } = useRequest(createOrder, {
        manual: true,
        onSuccess: (res) => {
            setOrderInfo([]);
            if (!res.data.sendStatus) {
                Taro.navigateTo({
                    url: "/pages/myOrderHistory/index?showToast=true",
                })
            } else {
                Taro.navigateTo({
                    url: "/pages/myOrderHistory/index",
                })
            }
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
            success: function (res) {
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
                quantity: 1,
                name: dish.name,
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
            <View
                className="fullWidthButtonBox"
                style={createOrderButtonStyle}
            >
                <Button
                    className='fullWidthButton'
                    onClick={() => handleCreateOrder()}
                    loading={createOrderLoading}
                >选好了</Button>
            </View>
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
                    style={{ height: scrollViewHeight }}
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
                    style={{ height: scrollViewHeight }}
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
                    left: "0rpx",
                    bottom: "0rpx",
                    zIndex: 5,
                })}
            </View>
        )
    }

    // 筛选列表数据入口
    const renderTextButton = () => {
        return (
            <Image className="filterIcon" src={URL_filter} />
        )
    }

    // 筛选全选
    const handleFilterDishInit = () => {
        setFilterCategory(categoryList.map((item) => item.id))
        setFilterTag(tagList.map((item) => item.id))
    }

    // 筛选确认
    const handleFilterDish = () => {
        setDishes(filterDishesByCategoryAndTag(allDishes, filterCategory, filterTag))
        setShowFilter(false)
    }

    const renderFilterDish = () => {
        return (
            <View className="filterDishBox">
                <View className="filterDishInitButtons">
                    <Button className="filterDishInitButton" onClick={handleFilterDishInit}>全选</Button>
                    <Button
                        className="filterDishInitButton"
                        onClick={() => {
                            setFilterCategory([])
                            setFilterTag([])
                        }}
                    >全不选</Button>
                </View>
                <View className="filterDishTitle">按分类筛选</View>
                <MultiSelector
                    options={categoryList}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e)}
                />
                <View className="filterDishTitle">按标签筛选</View>
                <MultiSelector
                    options={tagList}
                    value={filterTag}
                    onChange={(e) => setFilterTag(e)}
                />
                <Button className="filterButton" onClick={handleFilterDish}>筛选</Button>
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
            <DraggableButton
                bodyRender={renderTextButton}
                businessKey="order"
                onClick={() => {
                    setShowFilter(!showFilter)
                }}
            />
            <Drawer
                isOpen={showFilter}
                title="筛选菜肴"
                bodyRender={renderFilterDish}
                onClose={() => {
                    setShowFilter(false)
                }}
            />
        </View>
    )
}

export default Order;
