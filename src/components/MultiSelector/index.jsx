import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import './index.scss'

/**
 * 多选组件（支持水平/垂直布局）
 * @param {Object} props 
 * @param {Array} props.options - 选项列表，格式: [{label: '选项1', value: '1'}, ...]
 * @param {Array} props.value - 当前选中值数组
 * @param {Function} props.onChange - 选中变化回调 (selectedValues) => {}
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.layout - 布局方向，'horizontal'水平/'vertical'垂直，默认 'horizontal'
 * @param {string} props.itemStyle - multi-selector__item样式
 */
const MultiSelector = (props) => {
  const {
    options = [],
    value = [],
    onChange,
    disabled = false,
    layout = 'horizontal', // 新增布局参数
    itemStyle = {}
  } = props

  const [selectedValues, setSelectedValues] = useState(value)

  // 同步外部value变化
  useEffect(() => {
    setSelectedValues(value)
  }, [value])

  // 检查是否选中
  const isSelected = (optionValue) => {
    return selectedValues.includes(optionValue)
  }

  // 切换选项状态
  const toggleOption = (option) => {
    if (disabled) return

    const { value: optionValue } = option
    const newSelected = isSelected(optionValue)
      ? selectedValues.filter(val => val !== optionValue)
      : [...selectedValues, optionValue]

    setSelectedValues(newSelected)
    onChange && onChange(newSelected)
  }

  return (
    <View 
      className={`multi-selector ${layout === 'vertical' ? 'vertical' : 'horizontal'}`}
    >
      {options.map((option, index) => {
        const { label, value: optionValue } = option
        const selected = isSelected(optionValue)

        return (
          <View
            key={index}
            className={`multi-selector__item ${disabled ? 'disabled' : ''}`}
            onClick={() => toggleOption(option)}
            style={itemStyle}
          >
            {/* 标签文字 */}
            <View
            className={`multi-selector__label 
                ${disabled ? 'multi-selector__label__disabled' : '' } 
                ${selected ? 'multi-selector__label__selected' : ''} `}
            >
            {label}
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default MultiSelector