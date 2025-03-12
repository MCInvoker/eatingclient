import { View, Text, Image } from '@tarojs/components'
import { URL_app_logo600 } from '../../../assets/imageOssUrl'
import './index.scss'

const CHEF_MANUAL = {
    title: '厨师操作流程',
    steps: [
        {
            subtitle: '1. 完善个人信息',
            text: '在"我的"页面中点击头像，录入或修改您的个人信息。完善的个人信息有助于让其他用户更容易识别您。'
        },
        {
            subtitle: '2. 添加菜肴',
            text: '进入"菜肴"页面，点击"新增菜肴"按钮，填写菜品名称、描述、图片等信息。您可以为每个菜品设置是否对外展示。'
        },
        {
            subtitle: '3. 管理菜单',
            text: '在"菜肴"页面中，您可以编辑或删除已添加的菜品，调整菜品展示状态，确保菜单始终保持最新。'
        },
        {
            subtitle: '4. 查看订单详情',
            text: '当您的朋友们完成点餐后，您可以前往"我的"页面，点击"订单列表"，在这里查看所有点餐记录。'
        }
    ]
}

const FOODIE_MANUAL = {
    title: '干饭人操作流程',
    steps: [
        {
            subtitle: '1. 设置个人信息',
            text: '同样在"我的"页面中点击头像，录入或修改个人信息。完善的个人信息有助于让其他用户更容易识别您。'
        },
        {
            subtitle: '2. 搜索与关注厨师',
            text: '进入"关注"页面，使用下方的"查找新用户"功能跳转至搜索界面。根据用户编号或昵称准确找到您感兴趣的厨师，并点击"关注"。'
        },
        {
            subtitle: '3. 选择厨师点餐',
            text: '返回"关注"页面，浏览已关注的厨师名单，挑选一位想要点餐的对象，点击其名字旁边的"点餐"按钮进入点餐界面。'
        },
        {
            subtitle: '4. 完成点餐流程',
            text: '在菜单中浏览并选择心仪的菜品，完成后点击"选好了"确认下单。'
        },
        {
            subtitle: '5. 通知厨师',
            text: '当前版本需要手动通过微信或其他通讯工具告知厨师您的点餐选择。未来的版本计划支持订阅消息推送功能，届时可以直接通过微信通知厨师您的点餐详情。'
        }
    ]
}

const ManualSection = ({ title, steps }) => (
    <View className='section'>
        <Text className='title'>{title}</Text>
        <View className='content'>
            {steps.map((step, index) => (
                <View key={index}>
                    <Text className='subtitle'>{step.subtitle}</Text>
                    <Text className='text'>{step.text}</Text>
                </View>
            ))}
        </View>
    </View>
)

const UserManual = () => {
    return (
        <View className='userManual'>
            <ManualSection {...CHEF_MANUAL} />
            <ManualSection {...FOODIE_MANUAL} />
        </View>
    )
}

export default UserManual