export interface ApiHealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  timestamp: number;
}

export const checkApiHealth = async (apiUrl?: string): Promise<ApiHealthStatus> => {
  try {
    const baseUrl = apiUrl || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
    });

    if (response.ok) {
      return {
        status: 'healthy',
        timestamp: Date.now(),
      };
    } else {
      return {
        status: 'unhealthy',
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.warn('API health check failed:', error);
    return {
      status: 'unknown',
      timestamp: Date.now(),
    };
  }
};

export const formatHealthStatus = (status: ApiHealthStatus): string => {
  const statusMap = {
    healthy: '正常',
    unhealthy: '异常',
    unknown: '未知',
  };
  return statusMap[status.status] || '未知';
};