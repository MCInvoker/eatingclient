import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

/**
 * 单选组件（支持水平/垂直布局）
 * @param {Object} props 
 * @param {Array} props.options - 选项列表，格式: [{label: '选项1', value: '1'}, ...]
 * @param {string} props.value - 当前选中值
 * @param {Function} props.onChange - 选中变化回调 (selectedValue) => {}
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.layout - 布局方向，'horizontal'水平/'vertical'垂直，默认 'horizontal'
 * @param {string} props.itemStyle - radio-selector__item样式
 */
const RadioSelector = (props) => {
  const {
    options = [],
    value = '',
    onChange,
    disabled = false,
    layout = 'horizontal',
    itemStyle = {}
  } = props

  // 内部选中状态
  const [selectedValue, setSelectedValue] = useState(value)

  // 同步外部value变化
  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  // 检查是否选中
  const isSelected = (optionValue) => {
    return selectedValue === optionValue
  }

  // 切换选中状态
  const handleSelect = (option) => {
    if (disabled) return
    const { value: optionValue } = option
    setSelectedValue(optionValue)
    onChange && onChange(optionValue)
  }

  return (
    <View 
      className={`radio-selector ${layout === 'vertical' ? 'vertical' : 'horizontal'}`}
    >
      {options.map((option, index) => {
        const { label, value: optionValue } = option
        const selected = isSelected(optionValue)

        return (
          <View
            key={index}
            className={`radio-selector__item ${disabled ? 'disabled' : ''}`}
            onClick={() => handleSelect(option)}
            style={itemStyle}
          >
            {/* 标签文字 */}
            <View
              className={`radio-selector__label 
                ${disabled ? 'radio-selector__label__disabled' : '' } 
                ${selected ? 'radio-selector__label__selected' : ''} `}
            >
              {label}
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default RadioSelector