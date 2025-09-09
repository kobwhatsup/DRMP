import React from 'react';
import { DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

export interface StandardDatePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  value?: Dayjs | null;
  onChange?: (date: Dayjs | null, dateString: string | string[]) => void;
}

/**
 * 标准化的日期选择器组件
 * - 统一使用 dayjs 作为日期库
 * - 解决点击无响应问题
 * - 提供一致的配置
 */
const StandardDatePicker: React.FC<StandardDatePickerProps> = ({
  value,
  onChange,
  format = 'YYYY-MM-DD',
  placeholder = '请选择日期',
  popupClassName = 'standard-date-picker-popup',
  getPopupContainer = (trigger) => trigger.parentElement || document.body,
  ...restProps
}) => {
  return (
    <DatePicker
      value={value}
      onChange={onChange as any}
      format={format}
      placeholder={placeholder}
      popupClassName={popupClassName}
      getPopupContainer={getPopupContainer}
      {...restProps}
    />
  );
};

export default StandardDatePicker;