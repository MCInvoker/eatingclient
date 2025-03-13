export default defineAppConfig({
    pages: [
        'pages/dish/index',
        'pages/dishEdit/index',
        'pages/follow/index',
        'pages/me/index',
        'pages/userInfo/index',
        'pages/login/index',
        'pages/dishTag/index',
        'pages/dishTagEdit/index',
        'pages/dishCategory/index',
        'pages/dishCategoryEdit/index',
        'pages/searchUser/index',
        'pages/order/index',
        'pages/myOrder/index',
        'pages/myOrderHistory/index',
        'pages/orderDetail/index'
    ],
    subPackages: [
        {
            root: 'packageA',
            name: 'other',
            pages: [
                'pages/userManual/index',
                'pages/about/index',
                'pages/randomFood/index'
            ],
            independent: false
        }
    ],
    preloadRule: {
        'pages/me/index': {
            network: 'all',
            packages: ['packageA']
        }
    },
    tabBar: {
        list: [
            {
                iconPath: 'assets/image/tabBar/dish.png',
                selectedIconPath: 'assets/image/tabBar/dish_on.png',
                pagePath: 'pages/dish/index',
                text: '菜肴',
            },
            {
                iconPath: 'assets/image/tabBar/follow.png',
                selectedIconPath: 'assets/image/tabBar/follow_on.png',
                pagePath: 'pages/follow/index',
                text: '关注',
            },
            {
                iconPath: 'assets/image/tabBar/me.png',
                selectedIconPath: 'assets/image/tabBar/me_on.png',
                pagePath: 'pages/me/index',
                text: '我的',
            },
        ],
        color: '#999',
        selectedColor: '#2F7958',
        backgroundColor: '#f8f8f8',
        borderStyle: 'white',
    },

    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
    }
})
