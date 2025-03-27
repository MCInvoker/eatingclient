/**
 * API接口基础配置
 * 开发环境：http://localhost:7002/eating/
 * 生产环境：https://webhomeide.top/eating/
 */

// 根据环境变量判断使用哪个baseUrl
const baseUrl = 'https://webhomeide.top/eating/';
// const baseUrl = process.env.NODE_ENV === 'development' 
    // ? 'http://localhost:7002/eating/'
    // : 'https://webhomeide.top/eating/';

const urlLogin = baseUrl + "user/login"; // 登录
const urlSearchUser = baseUrl + "user/search"; // 搜索用户
const urlUserInfo = baseUrl + "user/info"; // 获取用户信息
const urlUserDetails = baseUrl + "user/details"; // 获取自己的用户信息，更详细
const urlUsercodeCheck = baseUrl + "user/usercodecheck"; // 查询usercode是否重复
const urlDishTag = baseUrl + "dishtag"; // 菜肴标签
const urlDishCategory = baseUrl + "dishcategory"; // 菜肴分类
const urlDish = baseUrl + "dish"; // 菜肴
const urlUserDish = baseUrl + "user/dish"; // 点餐时，通过用户id获取该用户下的菜肴
const urlDisclosureDish = baseUrl + "dish/disclosureDish"; // 隐藏展示菜肴
const urlFollow = baseUrl + "follow"; // 关注
const urlUnfollow = baseUrl + "unfollow"; // 取关
const urlOrder = baseUrl + "order"; // 点餐
const urlMyorder = baseUrl + "myorder"; // 我收到的订单
const urlMyorderhistory = baseUrl + "myorderhistory"; // 我的点餐记录
const urlStsInfo = baseUrl + "stsInfo"; // 获取阿里云sts临时凭证，用于图片上传
const urlSubscribeOrderNotify = baseUrl + "user/subscribeOrderNotify"; // 订阅订单通知
// const url = ""; // 
export {
    baseUrl,
    urlLogin,
    urlSearchUser,
    urlUserInfo,
    urlUserDetails,
    urlUsercodeCheck,
    urlDishTag,
    urlDishCategory,
    urlDish,
    urlUserDish,
    urlDisclosureDish,
    urlFollow,
    urlUnfollow,
    urlOrder,
    urlMyorder,
    urlMyorderhistory,
    urlStsInfo,
    urlSubscribeOrderNotify
}


// /**
//  * @param {Egg.Application} app - egg application
//  */
// module.exports = app => {
//     const { router, controller } = app;
//     router.get('/', controller.home.index);
//     router.post("/eating/user/login", controller.user.login); // 登录注册
//     router.get("/eating/user/search", controller.user.searchUsers); // 搜索用户
//     router.get("/eating/user/info", controller.user.userInfo); // 获取用户信息
//     router.get("/eating/user/details", controller.user.details); // 获取自己的用户信息，更详细
//     router.post("/eating/user/usercodecheck", controller.user.userCodeCheck); // 获取自己的用户信息
//     router.post("/eating/dishtag", controller.dishTag.createDishTag); // 新增菜肴标签
//     router.put("/eating/dishtag/:tag_id", controller.dishTag.updateDishTag); // 更新菜肴标签
//     router.get("/eating/dishtag", controller.dishTag.getDishTags);// 获取菜肴标签
//     router.delete("/eating/dishtag/:tag_id", controller.dishTag.deleteDishTag); // 删除菜肴标签
//     router.post("/eating/dishcategory", controller.dishCategory.createDishCategory); // 新增菜肴
//     router.put("/eating/dishcategory/:category_id", controller.dishCategory.updateDishCategory); // 更新菜肴分类信息
//     router.get("/eating/dishcategory", controller.dishCategory.getDishCategories); // 获取菜肴分类
//     router.delete("/eating/dishcategory/:category_id", controller.dishCategory.deleteDishCategory); // 删除菜肴分类
//     router.post("/eating/dish", controller.dish.createDish); // 新增菜肴
//     router.put("/eating/dish/:dish_id", controller.dish.updateDish); // 更新菜肴信息
//     router.get("/eating/dish", controller.dish.getDishes); // 获取自己的菜肴列表
//     router.get("/eating/user/dish", controller.dish.getDishesByUserId); // 点餐时，通过用户id获取该用户下的菜肴
//     router.delete("/eating/dish/:dish_id", controller.dish.deleteDish); // 删除菜肴
//     router.put("/eating/dish/disclosureDish/:dish_id", controller.dish.disclosureDish); // 隐藏菜肴
//     router.post("/eating/follow", controller.follow.follow); // 关注
//     router.post("/eating/unfollow", controller.follow.unfollow); // 取关
//     router.get("/eating/follow", controller.follow.getFollowingList); // 获取关注列表
//     router.post("/eating/order", controller.order.createOrder); // 点餐， 新增订单
//     router.get("/eating/myorder", controller.order.getMyOrders); // 我收到的订单
//     router.get("/eating/myorderhistory", controller.order.getMyOrderHistory); // 我的点餐记录
// };
