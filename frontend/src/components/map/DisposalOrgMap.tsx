import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, Select, Switch, Slider, Row, Col, Statistic, Spin, Button, 
  Tooltip, Badge, Popover, Tag, Space, Alert 
} from 'antd';
import {
  FullscreenOutlined, ReloadOutlined, DownloadOutlined,
  SettingOutlined, InfoCircleOutlined, FilterOutlined,
  TeamOutlined, BankOutlined, WarningOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import chinaGeoJson from './data/china.json';
import './DisposalOrgMap.scss';

const { Option } = Select;

// 处置机构地理分布数据接口
interface DisposalOrgGeoData {
  orgDistribution: Array<{
    orgId: number;
    orgName: string;
    type: 'MEDIATION_CENTER' | 'LAW_FIRM' | 'COLLECTION_AGENCY' | 'OTHER';
    coordinates: [number, number];
    address: string;
    teamSize: number;
    monthlyCapacity: number;
    currentLoad: number;
    utilization: number;
    avgRecoveryRate: number;
    performanceRating: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'OVERLOADED';
    membershipStatus: 'ACTIVE' | 'EXPIRED' | 'UNPAID';
    serviceRadius: number;
  }>;
  regionStats: Array<{
    regionCode: string;
    regionName: string;
    totalOrgs: number;
    activeOrgs: number;
    totalCapacity: number;
    usedCapacity: number;
    avgUtilization: number;
    coverageRate: number;
    serviceGaps: Array<{
      area: string;
      coordinates: [number, number];
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  }>;
  statistics: {
    totalOrgs: number;
    activeOrgs: number;
    totalCapacity: number;
    avgUtilization: number;
    overloadedOrgs: number;
    serviceGapCount: number;
  };
}

interface DisposalOrgMapProps {
  height?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const DisposalOrgMap: React.FC<DisposalOrgMapProps> = ({
  height = 700,
  autoRefresh = false,
  refreshInterval = 300000
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [geoData, setGeoData] = useState<DisposalOrgGeoData | null>(null);
  const [viewMode, setViewMode] = useState<'distribution' | 'capacity' | 'coverage'>('distribution');
  const [showServiceRadius, setShowServiceRadius] = useState(false);
  const [showServiceGaps, setShowServiceGaps] = useState(true);
  const [filters, setFilters] = useState({
    orgTypes: [] as string[],
    performanceLevel: [] as string[],
    membershipStatus: [] as string[],
    utilizationRange: [0, 100] as [number, number]
  });
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  // 机构类型配置
  const orgTypeConfig = {
    MEDIATION_CENTER: { name: '调解中心', color: '#1890ff', icon: 'circle' },
    LAW_FIRM: { name: '律师事务所', color: '#52c41a', icon: 'rect' },
    COLLECTION_AGENCY: { name: '催收机构', color: '#faad14', icon: 'triangle' },
    OTHER: { name: '其他', color: '#8c8c8c', icon: 'diamond' }
  };

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      echarts.registerMap('china', chinaGeoJson as any);
      
      chartInstance.current.on('click', handleChartClick);
      chartInstance.current.on('mouseover', handleChartMouseOver);
      
      initChart();
      loadData();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstance.current && geoData) {
      updateChart();
    }
  }, [viewMode, showServiceRadius, showServiceGaps, filters, geoData]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: DisposalOrgGeoData = {
        orgDistribution: [
          {
            orgId: 1, orgName: '北京朝阳调解中心', type: 'MEDIATION_CENTER',
            coordinates: [116.46, 39.92], address: '北京市朝阳区...',
            teamSize: 25, monthlyCapacity: 500, currentLoad: 420, utilization: 84,
            avgRecoveryRate: 68.5, performanceRating: 'A', status: 'ACTIVE',
            membershipStatus: 'ACTIVE', serviceRadius: 50
          },
          {
            orgId: 2, orgName: '上海浦东法律服务所', type: 'LAW_FIRM',
            coordinates: [121.48, 31.22], address: '上海市浦东新区...',
            teamSize: 32, monthlyCapacity: 600, currentLoad: 580, utilization: 96,
            avgRecoveryRate: 72.3, performanceRating: 'A+', status: 'OVERLOADED',
            membershipStatus: 'ACTIVE', serviceRadius: 45
          },
          {
            orgId: 3, orgName: '深圳南山调解中心', type: 'MEDIATION_CENTER',
            coordinates: [114.07, 22.62], address: '深圳市南山区...',
            teamSize: 28, monthlyCapacity: 550, currentLoad: 380, utilization: 69,
            avgRecoveryRate: 65.8, performanceRating: 'B+', status: 'ACTIVE',
            membershipStatus: 'ACTIVE', serviceRadius: 40
          },
          {
            orgId: 4, orgName: '广州天河律师事务所', type: 'LAW_FIRM',
            coordinates: [113.23, 23.16], address: '广州市天河区...',
            teamSize: 22, monthlyCapacity: 450, currentLoad: 320, utilization: 71,
            avgRecoveryRate: 70.2, performanceRating: 'A-', status: 'ACTIVE',
            membershipStatus: 'ACTIVE', serviceRadius: 35
          },
          {
            orgId: 5, orgName: '杭州西湖调解中心', type: 'MEDIATION_CENTER',
            coordinates: [120.19, 30.26], address: '杭州市西湖区...',
            teamSize: 18, monthlyCapacity: 350, currentLoad: 280, utilization: 80,
            avgRecoveryRate: 63.4, performanceRating: 'B', status: 'ACTIVE',
            membershipStatus: 'EXPIRED', serviceRadius: 30
          }
        ],
        regionStats: [
          {
            regionCode: 'BJ', regionName: '北京', totalOrgs: 15, activeOrgs: 14,
            totalCapacity: 3200, usedCapacity: 2680, avgUtilization: 83.75,
            coverageRate: 95.2, serviceGaps: [
              { area: '房山区', coordinates: [115.98, 39.73], priority: 'MEDIUM' }
            ]
          },
          {
            regionCode: 'SH', regionName: '上海', totalOrgs: 18, activeOrgs: 17,
            totalCapacity: 3800, usedCapacity: 3420, avgUtilization: 90.0,
            coverageRate: 98.5, serviceGaps: []
          },
          {
            regionCode: 'GD', regionName: '广东', totalOrgs: 45, activeOrgs: 42,
            totalCapacity: 8900, usedCapacity: 7120, avgUtilization: 80.0,
            coverageRate: 87.3, serviceGaps: [
              { area: '韶关市', coordinates: [113.62, 24.84], priority: 'HIGH' },
              { area: '梅州市', coordinates: [116.12, 24.55], priority: 'MEDIUM' }
            ]
          }
        ],
        statistics: {
          totalOrgs: 256,
          activeOrgs: 231,
          totalCapacity: 52800,
          avgUtilization: 78.5,
          overloadedOrgs: 12,
          serviceGapCount: 18
        }
      };
      
      setGeoData(mockData);
    } catch (error) {
      console.error('加载处置机构地图数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const initChart = () => {
    if (!chartInstance.current) return;

    const option = {
      title: {
        text: '全国处置机构分布图',
        subtext: '数据更新时间：' + new Date().toLocaleString(),
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          if (params.componentType === 'series' && params.seriesType === 'scatter') {
            const data = params.data;
            const typeConfig = orgTypeConfig[data.type as keyof typeof orgTypeConfig];
            
            return `
              <div style="padding: 8px; min-width: 200px;">
                <div style="font-weight: bold; margin-bottom: 8px; color: #fff;">
                  ${data.orgName}
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="color: ${typeConfig.color};">●</span> ${typeConfig.name}
                </div>
                <div>团队规模: ${data.teamSize}人</div>
                <div>月处理能力: ${data.monthlyCapacity}件</div>
                <div>当前负载: ${data.currentLoad}件 (${data.utilization}%)</div>
                <div>平均回款率: ${data.avgRecoveryRate}%</div>
                <div>业绩评级: ${data.performanceRating}</div>
                <div style="margin-top: 4px;">
                  ${data.status === 'OVERLOADED' ? '<span style="color: #ff4d4f;">⚠ 超负荷</span>' : 
                    data.status === 'SUSPENDED' ? '<span style="color: #faad14;">⏸ 暂停服务</span>' : 
                    '<span style="color: #52c41a;">✓ 正常服务</span>'}
                </div>
              </div>
            `;
          }
          return params.name;
        }
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        label: {
          show: false,
          color: '#333',
          fontSize: 10
        },
        itemStyle: {
          areaColor: '#f3f3f3',
          borderColor: '#999',
          borderWidth: 0.5
        },
        emphasis: {
          itemStyle: {
            areaColor: '#389bb7'
          }
        }
      },
      series: []
    };

    chartInstance.current.setOption(option);
  };

  const updateChart = () => {
    if (!chartInstance.current || !geoData) return;

    const filteredOrgs = geoData.orgDistribution.filter(org => {
      // 应用筛选条件
      if (filters.orgTypes.length > 0 && !filters.orgTypes.includes(org.type)) return false;
      if (filters.performanceLevel.length > 0 && !filters.performanceLevel.includes(org.performanceRating)) return false;
      if (filters.membershipStatus.length > 0 && !filters.membershipStatus.includes(org.membershipStatus)) return false;
      if (org.utilization < filters.utilizationRange[0] || org.utilization > filters.utilizationRange[1]) return false;
      return true;
    });

    let series: any[] = [];

    // 机构分布标记
    const orgSeries = {
      name: '处置机构',
      type: 'scatter',
      coordinateSystem: 'geo',
      data: filteredOrgs.map(org => {
        const typeConfig = orgTypeConfig[org.type];
        let symbolSize = 10;
        let itemColor = typeConfig.color;

        if (viewMode === 'capacity') {
          symbolSize = Math.max(org.monthlyCapacity / 50, 8);
        } else if (viewMode === 'coverage') {
          symbolSize = Math.max(org.serviceRadius / 5, 8);
        }

        // 根据状态调整颜色
        if (org.status === 'OVERLOADED') {
          itemColor = '#ff4d4f';
        } else if (org.status === 'SUSPENDED') {
          itemColor = '#8c8c8c';
        } else if (org.membershipStatus !== 'ACTIVE') {
          itemColor = '#faad14';
        }

        return {
          name: org.orgName,
          value: [...org.coordinates, org.monthlyCapacity],
          symbolSize: Math.min(symbolSize, 30),
          itemStyle: {
            color: itemColor,
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 5,
            shadowColor: 'rgba(0,0,0,0.3)'
          },
          ...org
        };
      }),
      emphasis: {
        scale: true,
        itemStyle: {
          borderWidth: 3,
          shadowBlur: 10
        }
      }
    };
    series.push(orgSeries);

    // 服务覆盖半径
    if (showServiceRadius && viewMode === 'coverage') {
      const radiusSeries = {
        name: '服务覆盖',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: filteredOrgs.map(org => ({
          name: `${org.orgName}-覆盖`,
          value: [...org.coordinates, org.serviceRadius],
          symbolSize: org.serviceRadius * 2,
          itemStyle: {
            color: 'rgba(24, 144, 255, 0.1)',
            borderColor: '#1890ff',
            borderWidth: 2
          }
        })),
        silent: true,
        z: 1
      };
      series.push(radiusSeries);
    }

    // 服务空白点
    if (showServiceGaps) {
      const gapData: Array<{ name: string; value: [number, number, number]; priority: string }> = [];
      geoData.regionStats.forEach(region => {
        region.serviceGaps.forEach(gap => {
          gapData.push({
            name: gap.area,
            value: [...gap.coordinates, 1],
            priority: gap.priority
          });
        });
      });

      const gapSeries = {
        name: '服务空白',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: gapData.map(item => ({
          name: item.name,
          value: item.value,
          symbolSize: item.priority === 'HIGH' ? 20 : item.priority === 'MEDIUM' ? 15 : 10,
          itemStyle: {
            color: item.priority === 'HIGH' ? '#ff4d4f' : 
                   item.priority === 'MEDIUM' ? '#faad14' : '#52c41a',
            opacity: 0.8
          },
          symbol: 'pin',
          z: 10
        })),
        tooltip: {
          formatter: (params: any) => `
            <div>
              <strong>${params.name}</strong><br/>
              服务空白区域<br/>
              优先级: ${params.data.priority === 'HIGH' ? '高' : 
                      params.data.priority === 'MEDIUM' ? '中' : '低'}
            </div>
          `
        }
      };
      series.push(gapSeries);
    }

    chartInstance.current.setOption({
      series: series
    });
  };

  const handleChartClick = (params: any) => {
    if (params.componentType === 'series' && params.data.orgId) {
      setSelectedOrg(params.data);
    }
  };

  const handleChartMouseOver = (params: any) => {
    // 处理鼠标悬停
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      orgTypes: [],
      performanceLevel: [],
      membershipStatus: [],
      utilizationRange: [0, 100]
    });
  };

  const getAlertInfo = () => {
    if (!geoData) return null;
    
    const alerts = [];
    if (geoData.statistics.overloadedOrgs > 0) {
      alerts.push(`${geoData.statistics.overloadedOrgs}家机构超负荷运行`);
    }
    if (geoData.statistics.serviceGapCount > 0) {
      alerts.push(`发现${geoData.statistics.serviceGapCount}个服务空白区域`);
    }
    
    return alerts.length > 0 ? alerts.join('，') : null;
  };

  const filterContent = (
    <div style={{ width: 300, padding: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <label>机构类型：</label>
        <Select
          mode="multiple"
          style={{ width: '100%', marginTop: 4 }}
          placeholder="选择机构类型"
          value={filters.orgTypes}
          onChange={(value) => handleFilterChange('orgTypes', value)}
        >
          {Object.entries(orgTypeConfig).map(([key, config]) => (
            <Option key={key} value={key}>{config.name}</Option>
          ))}
        </Select>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label>业绩评级：</label>
        <Select
          mode="multiple"
          style={{ width: '100%', marginTop: 4 }}
          placeholder="选择业绩评级"
          value={filters.performanceLevel}
          onChange={(value) => handleFilterChange('performanceLevel', value)}
        >
          <Option value="A+">A+</Option>
          <Option value="A">A</Option>
          <Option value="A-">A-</Option>
          <Option value="B+">B+</Option>
          <Option value="B">B</Option>
          <Option value="C">C</Option>
        </Select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>产能利用率：</label>
        <Slider
          range
          style={{ marginTop: 8 }}
          value={filters.utilizationRange}
          onChange={(value) => handleFilterChange('utilizationRange', value)}
          marks={{
            0: '0%',
            50: '50%',
            100: '100%'
          }}
        />
      </div>

      <Button onClick={clearFilters}>清除筛选</Button>
    </div>
  );

  return (
    <div className="disposal-org-map">
      <Card
        title={
          <div className="map-header">
            <span>全国处置机构分布图</span>
            <div className="map-controls">
              <Popover content={filterContent} title="筛选条件" trigger="click">
                <Button icon={<FilterOutlined />}>
                  筛选 {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== filters.utilizationRange || (f[0] !== 0 || f[1] !== 100)) && 
                    <Badge dot />}
                </Button>
              </Popover>
              <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading} />
              <Button icon={<DownloadOutlined />} onClick={() => {}} />
            </div>
          </div>
        }
        extra={
          <div className="map-settings">
            <Select
              value={viewMode}
              onChange={setViewMode}
             
              style={{ width: 120, marginRight: 8 }}
            >
              <Option value="distribution">机构分布</Option>
              <Option value="capacity">处置能力</Option>
              <Option value="coverage">服务覆盖</Option>
            </Select>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Spin spinning={loading}>
          {getAlertInfo() && (
            <Alert
              message={getAlertInfo()}
              type="warning"
              showIcon
              style={{ margin: '16px 16px 0 16px' }}
            />
          )}

          <div className="map-container">
            <div ref={chartRef} style={{ width: '100%', height: height }} />
            
            {/* 地图控制面板 */}
            <div className="map-control-panel">
              <div className="control-section">
                <h4>显示选项</h4>
                <div className="control-item">
                  <span>服务覆盖半径</span>
                  <Switch 
                    checked={showServiceRadius} 
                    onChange={setShowServiceRadius}
                   
                  />
                </div>
                <div className="control-item">
                  <span>服务空白区域</span>
                  <Switch 
                    checked={showServiceGaps} 
                    onChange={setShowServiceGaps}
                   
                  />
                </div>
              </div>

              <div className="control-section">
                <h4>图例说明</h4>
                <div className="legend">
                  {Object.entries(orgTypeConfig).map(([key, config]) => (
                    <div key={key} className="legend-item">
                      <span 
                        className="legend-dot" 
                        style={{ backgroundColor: config.color }}
                      />
                      <span>{config.name}</span>
                    </div>
                  ))}
                </div>
                <div className="status-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#ff4d4f' }} />
                    <span>超负荷</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#faad14' }} />
                    <span>会员过期</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 统计信息面板 */}
            {geoData && (
              <div className="statistics-panel">
                <Row gutter={16}>
                  <Col span={4}>
                    <Statistic
                      title="机构总数"
                      value={geoData.statistics.totalOrgs}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="活跃机构"
                      value={geoData.statistics.activeOrgs}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="总处置能力"
                      value={geoData.statistics.totalCapacity}
                      suffix="件/月"
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="平均利用率"
                      value={geoData.statistics.avgUtilization}
                      suffix="%"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="超负荷机构"
                      value={geoData.statistics.overloadedOrgs}
                      valueStyle={{ color: '#ff4d4f' }}
                      prefix={<WarningOutlined />}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="服务空白点"
                      value={geoData.statistics.serviceGapCount}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                </Row>
              </div>
            )}

            {/* 选中机构详情 */}
            {selectedOrg && (
              <div className="org-detail-panel">
                <Card 
                  
                  title={selectedOrg.orgName}
                  extra={<Button onClick={() => setSelectedOrg(null)}>×</Button>}
                >
                  <Space direction="vertical">
                    <Tag color={orgTypeConfig[selectedOrg.type as keyof typeof orgTypeConfig]?.color || '#8c8c8c'}>
                      {orgTypeConfig[selectedOrg.type as keyof typeof orgTypeConfig]?.name || selectedOrg.type}
                    </Tag>
                    <div>团队规模：{selectedOrg.teamSize}人</div>
                    <div>月处理能力：{selectedOrg.monthlyCapacity}件</div>
                    <div>产能利用率：{selectedOrg.utilization}%</div>
                    <div>平均回款率：{selectedOrg.avgRecoveryRate}%</div>
                    <div>业绩评级：{selectedOrg.performanceRating}</div>
                    <div>
                      状态：
                      <Tag color={
                        selectedOrg.status === 'ACTIVE' ? 'green' : 
                        selectedOrg.status === 'OVERLOADED' ? 'red' : 'orange'
                      }>
                        {selectedOrg.status === 'ACTIVE' ? '正常' : 
                         selectedOrg.status === 'OVERLOADED' ? '超负荷' : '暂停'}
                      </Tag>
                    </div>
                  </Space>
                </Card>
              </div>
            )}
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default DisposalOrgMap;