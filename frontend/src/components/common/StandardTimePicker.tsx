import React from 'react';
import { TimePicker } from 'antd';
import type { TimePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

export interface StandardTimePickerProps extends Omit<TimePickerProps, 'value' | 'onChange'> {
  value?: Dayjs | null;
  onChange?: (time: Dayjs | null, timeString: string | string[]) => void;
}

/**
 * 标准化的时间选择器组件
 * - 统一使用 dayjs 作为时间库
 * - 解决点击无响应问题
 * - 提供一致的配置
 */
const StandardTimePicker: React.FC<StandardTimePickerProps> = ({
  value,
  onChange,
  format = 'HH:mm:ss',
  placeholder = '请选择时间',
  popupClassName = 'standard-time-picker-popup',
  getPopupContainer = (trigger) => trigger.parentElement || document.body,
  ...restProps
}) => {
  return (
    <TimePicker
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

export default StandardTimePicker;