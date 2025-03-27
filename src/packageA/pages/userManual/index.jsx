import { View, Text, Image } from '@tarojs/components'
import { URL_app_logo600 } from '../../../assets/imageOssUrl'
import './index.scss'

const CHEF_MANUAL = {
    title: '掌勺的人操作流程',
    steps: [
        {
            subtitle: '1. 完善个人信息',
            text: '在"我的"页面中点击头像，录入或修改您的个人信息。完善的个人信息有助于让家人朋友更容易找到您。'
        },
        {
            subtitle: '2. 添加菜肴',
            text: '进入"菜肴"页面，点击"新增菜肴"按钮，填写您会做的菜品名称、描述、图片等信息。'
        },
        {
            subtitle: '3. 管理菜单',
            text: '在"菜肴"页面中，您可以编辑或删除已添加的菜品，调整菜品展示状态，让家人朋友随时知道您的拿手好菜。'
        },
        {
            subtitle: '4. 订阅餐食计划通知',
            text: '在"我的"页面中点击"餐食计划"，进入后点击"新计划订阅"按钮。订阅后，当有人向您点餐时，您将自动收到通知。'
        },
        {
            subtitle: '5. 查看餐食计划',
            text: '在"餐食计划"页面中，您可以查看所有点餐记录。'
        }
    ]
}

const FOODIE_MANUAL = {
    title: '干饭人操作流程',
    steps: [
        {
            subtitle: '1. 设置个人信息',
            text: '同样在"我的"页面中点击头像，录入或修改个人信息。完善的个人信息有助于让家人朋友更容易找到您。'
        },
        {
            subtitle: '2. 关注家人朋友',
            text: '进入"关注"页面，使用下方的"添加家人朋友"功能跳转至搜索界面。根据用户编号或昵称找到您想关注的家人朋友，并点击"关注"。'
        },
        {
            subtitle: '3. 选择点餐',
            text: '返回"关注"页面，浏览已关注的家人朋友名单，选择想要点餐的对象，点击其名字旁边的"点餐"按钮进入点餐界面。'
        },
        {
            subtitle: '4. 完成点餐流程',
            text: '在菜单中浏览并选择心仪的菜品，完成后点击"选好了"确认完成。如果厨师已订阅通知，将自动收到您的点餐信息。'
        },
        {
            subtitle: '5. 查看美食回忆',
            text: '点餐完成后，您可以查看美食回忆详情，记录和分享您的美食故事。如果厨师未订阅通知，您可以通过微信或其他方式告知对方您的餐食计划。'
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