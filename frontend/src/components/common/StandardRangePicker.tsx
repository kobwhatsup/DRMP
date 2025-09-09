import React from 'react';
import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export interface StandardRangePickerProps extends Omit<RangePickerProps, 'value' | 'onChange'> {
  value?: [Dayjs | null, Dayjs | null] | null;
  onChange?: (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => void;
}

/**
 * 标准化的日期范围选择器组件
 * - 统一使用 dayjs 作为日期库
 * - 提供常用的预设日期范围
 * - 解决点击无响应问题
 */
const StandardRangePicker: React.FC<StandardRangePickerProps> = ({
  value,
  onChange,
  format = 'YYYY-MM-DD',
  placeholder = ['开始日期', '结束日期'],
  popupClassName = 'standard-range-picker-popup',
  getPopupContainer = (trigger) => trigger.parentElement || document.body,
  presets,
  ...restProps
}) => {
  // 默认预设选项
  const defaultPresets = [
    { label: '今天', value: [dayjs().startOf('day'), dayjs().endOf('day')] as [Dayjs, Dayjs] },
    { label: '最近7天', value: [dayjs().subtract(7, 'day'), dayjs()] as [Dayjs, Dayjs] },
    { label: '最近30天', value: [dayjs().subtract(30, 'day'), dayjs()] as [Dayjs, Dayjs] },
    { label: '最近3个月', value: [dayjs().subtract(3, 'month'), dayjs()] as [Dayjs, Dayjs] },
    { label: '最近6个月', value: [dayjs().subtract(6, 'month'), dayjs()] as [Dayjs, Dayjs] },
    { label: '最近1年', value: [dayjs().subtract(1, 'year'), dayjs()] as [Dayjs, Dayjs] },
    { label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')] as [Dayjs, Dayjs] },
    { label: '上月', value: [
      dayjs().subtract(1, 'month').startOf('month'), 
      dayjs().subtract(1, 'month').endOf('month')
    ] as [Dayjs, Dayjs] },
  ];

  return (
    <RangePicker
      value={value}
      onChange={onChange as any}
      format={format}
      placeholder={placeholder}
      popupClassName={popupClassName}
      getPopupContainer={getPopupContainer}
      presets={presets || defaultPresets}
      {...restProps}
    />
  );
};

export default StandardRangePicker;