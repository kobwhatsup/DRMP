import { useState, useCallback, useRef, useEffect } from 'react';
import { message } from 'antd';
import { useErrorHandler } from './useErrorHandler';
import { useLoading } from './useLoading';

interface UseApiRequestOptions<T> {
  immediate?: boolean; // 是否立即执行
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showSuccessMessage?: boolean | string;
  showErrorMessage?: boolean;
  retryTimes?: number; // 重试次数
  retryDelay?: number; // 重试延迟（毫秒）
}

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: any;
  isSuccess: boolean;
  isError: boolean;
}

export const useApiRequest = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
) => {
  const {
    immediate = false,
    onSuccess,
    onError,
    showSuccessMessage = false,
    showErrorMessage = true,
    retryTimes = 0,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false
  });

  const { handleError } = useErrorHandler({ showMessage: showErrorMessage });
  const { withLoading } = useLoading();
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // 执行API请求
  const execute = useCallback(async (...args: any[]) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    retryCountRef.current = 0;

    const performRequest = async (): Promise<T> => {
      try {
        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
          isSuccess: false,
          isError: false
        }));

        const result = await apiFunction(...args);

        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          isSuccess: true,
          isError: false
        }));

        if (onSuccess) {
          onSuccess(result);
        }

        if (showSuccessMessage) {
          const successMsg = typeof showSuccessMessage === 'string' 
            ? showSuccessMessage 
            : '操作成功';
          message.success(successMsg);
        }

        return result;
      } catch (error: any) {
        // 检查是否是取消的请求
        if (error.name === 'AbortError') {
          return Promise.reject(error);
        }

        // 重试逻辑
        if (retryCountRef.current < retryTimes) {
          retryCountRef.current++;
          console.log(`API request failed, retrying (${retryCountRef.current}/${retryTimes})...`);
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return performRequest();
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error,
          isSuccess: false,
          isError: true
        }));

        const errorInfo = handleError(error, 'API Request');
        
        if (onError) {
          onError(error);
        }

        throw error;
      }
    };

    return performRequest();
  }, [apiFunction, onSuccess, onError, showSuccessMessage, showErrorMessage, handleError, retryTimes, retryDelay]);

  // 重置状态
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false
    });
    retryCountRef.current = 0;
  }, []);

  // 取消请求
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        loading: false
      }));
    }
  }, []);

  // 立即执行（如果设置了immediate）
  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
    cancel,
    retry: () => execute()
  };
};

// 用于并行请求的hook
export const useParallelApiRequests = <T extends Record<string, any>>(
  requests: { [K in keyof T]: () => Promise<T[K]> },
  options: Omit<UseApiRequestOptions<T>, 'immediate'> & { immediate?: boolean } = {}
) => {
  const { immediate = false, onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof T, any>>>({});
  const { handleError } = useErrorHandler();

  const execute = useCallback(async () => {
    setLoading(true);
    setErrors({});

    try {
      const requestEntries = Object.entries(requests) as [keyof T, () => Promise<T[keyof T]>][];
      const promises = requestEntries.map(async ([key, request]) => {
        try {
          const result = await request();
          return { key, result, error: null };
        } catch (error) {
          return { key, result: null, error };
        }
      });

      const results = await Promise.all(promises);
      
      const successData: Partial<T> = {};
      const errorData: Partial<Record<keyof T, any>> = {};

      results.forEach(({ key, result, error }) => {
        if (error) {
          errorData[key] = error;
          handleError(error, `Request ${String(key)}`);
        } else {
          successData[key] = result as T[keyof T];
        }
      });

      setData(successData);
      setErrors(errorData);

      const hasErrors = Object.keys(errorData).length > 0;
      
      if (!hasErrors && onSuccess) {
        onSuccess(successData as T);
      }

      if (hasErrors && onError) {
        onError(errorData);
      }

      return { data: successData, errors: errorData };
    } catch (error) {
      handleError(error, 'Parallel API Requests');
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [requests, onSuccess, onError, handleError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    loading,
    data,
    errors,
    execute,
    hasErrors: Object.keys(errors).length > 0,
    isAllSuccess: Object.keys(errors).length === 0 && Object.keys(data).length === Object.keys(requests).length
  };
};

export default useApiRequest;