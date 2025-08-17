import { useState, useCallback, useRef } from 'react';

interface UseLoadingOptions {
  initialLoading?: boolean;
  minLoadingTime?: number; // 最小加载时间（毫秒）
}

interface LoadingState {
  [key: string]: boolean;
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const { initialLoading = false, minLoadingTime = 0 } = options;
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [namedLoading, setNamedLoading] = useState<LoadingState>({});
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 设置全局加载状态
  const setGlobalLoading = useCallback((isLoading: boolean) => {
    if (minLoadingTime > 0 && !isLoading) {
      // 如果设置了最小加载时间，延迟结束加载状态
      setTimeout(() => setLoading(isLoading), minLoadingTime);
    } else {
      setLoading(isLoading);
    }
  }, [minLoadingTime]);

  // 设置命名加载状态
  const setNamedLoadingState = useCallback((name: string, isLoading: boolean) => {
    if (minLoadingTime > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        setNamedLoading(prev => ({ ...prev, [name]: isLoading }));
        timeoutRefs.current.delete(name);
      }, minLoadingTime);
      timeoutRefs.current.set(name, timeoutId);
    } else {
      // 清除可能存在的延迟定时器
      const existingTimeout = timeoutRefs.current.get(name);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        timeoutRefs.current.delete(name);
      }
      setNamedLoading(prev => ({ ...prev, [name]: isLoading }));
    }
  }, [minLoadingTime]);

  // 包装异步函数，自动管理加载状态
  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    loadingName?: string
  ): Promise<T> => {
    const setLoadingFn = loadingName ? 
      (state: boolean) => setNamedLoadingState(loadingName, state) :
      setGlobalLoading;

    setLoadingFn(true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoadingFn(false);
    }
  }, [setGlobalLoading, setNamedLoadingState]);

  // 获取命名加载状态
  const isLoading = useCallback((name?: string): boolean => {
    if (name) {
      return namedLoading[name] || false;
    }
    return loading;
  }, [loading, namedLoading]);

  // 获取任意命名加载状态
  const isAnyLoading = useCallback((...names: string[]): boolean => {
    if (names.length === 0) {
      return loading || Object.values(namedLoading).some(Boolean);
    }
    return names.some(name => namedLoading[name]);
  }, [loading, namedLoading]);

  // 清理所有定时器
  const cleanup = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
  }, []);

  return {
    loading,
    namedLoading,
    setLoading: setGlobalLoading,
    setNamedLoading: setNamedLoadingState,
    withLoading,
    isLoading,
    isAnyLoading,
    cleanup
  };
};

export default useLoading;