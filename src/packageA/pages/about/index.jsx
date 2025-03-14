import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { URL_app_logo600 } from '../../../assets/imageOssUrl'
import './index.scss'

export default function About() {
    const handleCopy = (text) => {
        Taro.setClipboardData({
            data: text,
            success: () => {
                Taro.showToast({
                    title: '复制成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    }

    const renderEmail = (email) => (
        <Text className='copyText' onClick={() => handleCopy(email)}>{email}</Text>
    )

    return (
        <View className='container'>
            <View className='logo'>
                <Image className='logoImg' src={URL_app_logo600} mode='aspectFit'></Image>
            </View>
            <View className='content'>
                <Text className='title'>关于我们</Text>
                <Text className='version'>版本 1.0.0</Text>
                
                <View className='section'>
                    <Text className='sectionTitle'>产品简介</Text>
                    <Text className='sectionContent'>"不说随便"是一款专为家庭和小型社交圈设计的私人点餐小程序，旨在简化日常点餐流程，并帮助用户更方便地组织家庭聚餐或朋友聚会。通过该应用，您可以：</Text>
                    <View className='featureList'>
                        <Text className='featureItem'>• 轻松管理菜肴：添加并维护您会做的菜品列表，详细描述每道菜的特点，让他人更好地了解您的菜单。</Text>
                        <Text className='featureItem'>• 便捷下单：作为用餐者，可以通过浏览已关注的厨师（家人或朋友）提供的菜单，选择心仪的菜品并直接下单。</Text>
                        <Text className='featureItem'>• 分享点餐页面：无论是厨师还是用餐者，都可以方便地将点餐页面分享给微信好友，邀请他们一起参与点餐过程。</Text>
                    </View>
                    <Text className='sectionContent'>无论是在家中准备晚餐还是计划周末的家庭聚会，"不说随便"提供了一种简单有效的方式来组织点餐活动，让每一次用餐体验都更加愉快和有序。</Text>
                </View>

                <View className='section'>
                    <Text className='sectionTitle'>名称由来</Text>
                    <Text className='sectionContent'>在日常生活中，当我们被问到"今天想吃什么"的时候，常常不假思索地回答"随便"。但实际上，对方往往希望得到一个明确的选择而非模棱两可的答案。正是基于这样的洞察，"不说随便"应运而生。最初考虑过使用"大口吃饭"作为应用的名字，灵感源自一句话——幸福就是大口大口地吃饭。然而，由于这个名字已被其他应用占用，最终我们选择了更能体现核心理念的"不说随便"。</Text>
                </View>

                <View className='section'>
                    <Text className='sectionTitle'>应用灵感来源</Text>
                    <Text className='sectionContent'>这款应用的构思源于一位朋友的需求。他希望能够有一个类似于外卖平台的小程序，但专注于家庭和个人之间的点餐服务。通过这样的方式，不仅可以让家人之间更容易安排用餐计划，还能为那些喜欢在家里做饭的人提供一个展示厨艺的空间。因此，"不说随便"不仅仅是一个简单的点餐工具，它还承载着连接家庭成员情感交流的美好愿望。</Text>
                </View>

                <View className='section'>
                    <Text className='sectionTitle'>愿景与使命</Text>
                    <Text className='sectionContent'>尽管当前版本主要聚焦于家庭内部的点餐功能，但我们有着更为宏大的目标：帮助每一个面对"不知道吃啥"困境的人找到满意的答案。未来，我们将不断扩展和完善产品线，加入更多实用的功能和服务，如根据个人偏好改变页面展示样式、根据点餐记录去除重复菜肴、美食盲盒帮你点餐等，力求成为人们生活中不可或缺的一部分。</Text>
                </View>

                <View className='section'>
                    <Text className='sectionTitle'>特色亮点</Text>
                    <View className='featureList'>
                        <Text className='featureItem'>• 点餐页面：不同于外卖点餐平台，我们提供了极简、大图模式的点餐页面。</Text>
                        <Text className='featureItem'>• 简洁界面：与市场上大多数应用不同，我们的界面设计尽量保持简洁明了。</Text>
                    </View>
                </View>

                <View className='section'>
                    <Text className='sectionTitle'>团队介绍</Text>
                    <Text className='sectionContent'>我是爱秀的演员，一名热爱生活、热爱美食的工程师。目前团队就我一个人，非常欢迎有志之士的加入！联系方式：{renderEmail('759302142@qq.com')}。项目源码地址：https://github.com/MCInvoker/eatingclient。</Text>
                </View>

                <View className='section'>
                    <Text className='sectionTitle'>用户反馈与支持</Text>
                    <Text className='sectionContent'>我们重视每一位用户的宝贵意见。如果您有任何问题、建议或者遇到任何困难，请随时联系我们：{renderEmail('759302142@qq.com')}。我们会竭诚为您提供帮助和支持，共同打造更好的用户体验。</Text>
                </View>
            </View>
        </View>
    )
} 