import Taro from '@tarojs/taro'
import { useState, useRef, useEffect } from "react";
import { View } from '@tarojs/components'
import './index.scss' // 需创建对应的样式文件

/**
 * 可拖动按钮组件
 * @param {Object} props 
 * @param {string} props.key - 业务唯一标识（用于本地缓存区分）
 * @param {Function} props.bodyRender - 自定义按钮内容渲染函数
 * @param {Object} props.style - 自定义按钮样式
 * @param {Function} props.onClick - 按钮点击事件
 * @param {Number} props.initLeft - 初始左偏移量(px)
 * @param {Number} props.initTop - 初始上偏移量(px)
 * @param {Number} props.maxLeft - 最大左偏移限制(px)
 * @param {Number} props.maxTop - 最大上偏移限制(px)
 */
const DraggableButton = (props) => {
  const {
    businessKey, // 重命名避免与React的key冲突
    bodyRender,
    style = {},
    onClick,
    initLeft = 20,
    initTop = 20,
    maxLeft,
    maxTop
  } = props

  // 验证key参数
  if (!businessKey) {
    console.warn('DraggableButton组件必须传入key参数用于区分业务场景')
  }

  // 位置状态
  const [position, setPosition] = useState({
    left: initLeft,
    top: initTop
  })
  
  // 拖动状态
  const [isDragging, setIsDragging] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })
  const elementRef = useRef(null)
  const windowSize = useRef({ width: 0, height: 0 })
  const storageKey = `draggable_button_pos_${businessKey}` // 缓存键名

  // 获取窗口尺寸并初始化位置（优先从缓存读取）
  useEffect(() => {
    const init = async () => {
      // 1. 获取屏幕尺寸
      const windowInfo = Taro.getWindowInfo()
      windowSize.current = {
        width: windowInfo.windowWidth,
        height: windowInfo.windowHeight
      }

      // 2. 从缓存读取位置
      if (businessKey) {
        try {
          const storedPos = await Taro.getStorage({ key: storageKey })
          if (storedPos.data) {
            // 验证缓存位置是否在有效范围内
            const boundedPos = calculateBounds(
              storedPos.data.left,
              storedPos.data.top
            )
            setPosition(boundedPos)
            return // 缓存有效则不再使用默认值
          }
        } catch (err) {
          // 缓存不存在或读取失败时使用默认值
          console.log(`未找到${businessKey}的缓存位置，使用默认值`)
        }
      }

      // 3. 使用默认值并确保在边界内
      const boundedDefaultPos = calculateBounds(initLeft, initTop)
      setPosition(boundedDefaultPos)
    }

    init()
  }, [businessKey, initLeft, initTop])

  // 拖动结束时保存位置到缓存
  useEffect(() => {
    if (!isDragging && businessKey) {
      Taro.setStorage({
        key: storageKey,
        data: position
      }).catch(err => {
        console.error(`保存${businessKey}位置到缓存失败:`, err)
      })
    }
  }, [isDragging, position, businessKey, storageKey])

  // 计算边界限制
  const calculateBounds = (newLeft, newTop) => {
    let boundedLeft = newLeft
    let boundedTop = newTop

    // 左边界
    if (boundedLeft < 0) boundedLeft = 0
    // 右边界
    const maxLeftVal = maxLeft ?? (windowSize.current.width - 40) // 60为默认按钮宽度
    if (boundedLeft > maxLeftVal) boundedLeft = maxLeftVal

    // 上边界
    if (boundedTop < 0) boundedTop = 0
    // 下边界
    const maxTopVal = maxTop ?? (windowSize.current.height - 40) // 60为默认按钮高度
    if (boundedTop > maxTopVal) boundedTop = maxTopVal

    return { left: boundedLeft, top: boundedTop }
  }

  // 开始拖动
  const handleTouchStart = (e) => {
    setIsDragging(true)
    startPos.current = {
      x: e.touches[0].clientX - position.left,
      y: e.touches[0].clientY - position.top
    }
  }

  // 拖动中
  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.stopPropagation()
    
    const newLeft = e.touches[0].clientX - startPos.current.x
    const newTop = e.touches[0].clientY - startPos.current.y
    
    const boundedPos = calculateBounds(newLeft, newTop)
    setPosition(boundedPos)
  }

  // 结束拖动
  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // 点击事件处理
  const handleClick = (e) => {
    if (!isDragging && onClick) {
      onClick(e)
    }
  }

  return (
    <View
      ref={elementRef}
      className={`draggable-btn ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        ...style
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {bodyRender ? bodyRender() : (
        <View className="default-content">按钮</View>
      )}
    </View>
  )
}

export default DraggableButton