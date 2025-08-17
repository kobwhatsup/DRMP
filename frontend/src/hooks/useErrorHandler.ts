import { useCallback } from 'react';
import { message } from 'antd';

interface ErrorInfo {
  message: string;
  code?: string | number;
  details?: any;
}

interface UseErrorHandlerOptions {
  showMessage?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    showMessage = true,
    logToConsole = true,
    reportToService = false
  } = options;

  const handleError = useCallback((error: any, context?: string) => {
    let errorInfo: ErrorInfo;

    // 解析错误信息
    if (typeof error === 'string') {
      errorInfo = { message: error };
    } else if (error?.response?.data) {
      // HTTP错误响应
      const { data } = error.response;
      errorInfo = {
        message: data.message || data.error || '请求失败',
        code: data.code || error.response.status,
        details: data
      };
    } else if (error?.message) {
      // 标准Error对象
      errorInfo = {
        message: error.message,
        details: error
      };
    } else {
      // 未知错误
      errorInfo = {
        message: '发生未知错误',
        details: error
      };
    }

    // 记录到控制台
    if (logToConsole) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, errorInfo);
    }

    // 显示用户消息
    if (showMessage) {
      message.error(errorInfo.message);
    }

    // 上报错误服务（可选）
    if (reportToService) {
      // TODO: 实现错误上报逻辑
      reportError(errorInfo, context);
    }

    return errorInfo;
  }, [showMessage, logToConsole, reportToService]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: string,
    fallbackValue?: any
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return fallbackValue;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};

// 错误上报函数（占位符）
const reportError = (errorInfo: ErrorInfo, context?: string) => {
  // 这里可以集成Sentry、Bugsnag等错误监控服务
  console.log('Reporting error to service:', { errorInfo, context });
};

export default useErrorHandler;