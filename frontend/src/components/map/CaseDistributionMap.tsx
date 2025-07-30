import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Switch, Slider, Row, Col, Statistic, Spin, Button, Tooltip } from 'antd';
import {
  FullscreenOutlined, ReloadOutlined, DownloadOutlined,
  EyeOutlined, SettingOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import chinaGeoJson from './data/china.json'; // 中国地图GeoJSON数据
import './CaseDistributionMap.scss';

const { Option } = Select;

// 案件地理分布数据接口
interface CaseGeoData {
  provinceData: Array<{
    name: string;
    value: number;
    amount: string;
    caseCount: number;
    avgAmount: number;
    density: number;
  }>;
  cityData: Array<{
    name: string;
    coordinates: [number, number];
    value: number;
    cases: number;
    amount: string;
  }>;
  heatmapData: Array<{
    coordinates: [number, number];
    value: number;
    cases: number;
    amount: string;
  }>;
  statistics: {
    totalCases: number;
    totalAmount: string;
    avgCaseAmount: number;
    topProvinces: Array<{
      name: string;
      cases: number;
      percentage: number;
    }>;
  };
}

interface CaseDistributionMapProps {
  height?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const CaseDistributionMap: React.FC<CaseDistributionMapProps> = ({
  height = 600,
  autoRefresh = false,
  refreshInterval = 300000
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [geoData, setGeoData] = useState<CaseGeoData | null>(null);
  const [viewMode, setViewMode] = useState<'province' | 'city' | 'heatmap'>('province');
  const [dataType, setDataType] = useState<'count' | 'amount' | 'density'>('count');
  const [showLabels, setShowLabels] = useState(true);
  const [heatmapRadius, setHeatmapRadius] = useState(30);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      // 注册中国地图
      echarts.registerMap('china', chinaGeoJson as any);
      
      // 监听图表事件
      chartInstance.current.on('click', handleChartClick);
      chartInstance.current.on('mouseover', handleChartMouseOver);
      
      // 初始化图表
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
  }, [viewMode, dataType, showLabels, heatmapRadius, geoData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(loadData, refreshInterval);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用，实际使用时替换为真实API
      const mockData: CaseGeoData = {
        provinceData: [
          { name: '北京', value: 15420, amount: '¥2.8亿', caseCount: 15420, avgAmount: 18156, density: 9.2 },
          { name: '上海', value: 12890, amount: '¥2.4亿', caseCount: 12890, avgAmount: 18605, density: 8.5 },
          { name: '广东', value: 28900, amount: '¥4.2亿', caseCount: 28900, avgAmount: 14535, density: 7.8 },
          { name: '江苏', value: 21600, amount: '¥3.1亿', caseCount: 21600, avgAmount: 14352, density: 6.9 },
          { name: '浙江', value: 18700, amount: '¥2.9亿', caseCount: 18700, avgAmount: 15508, density: 6.4 },
          { name: '山东', value: 24300, amount: '¥3.5亿', caseCount: 24300, avgAmount: 14403, density: 5.8 },
          { name: '河南', value: 19800, amount: '¥2.6亿', caseCount: 19800, avgAmount: 13131, density: 4.9 },
          { name: '四川', value: 16500, amount: '¥2.2亿', caseCount: 16500, avgAmount: 13333, density: 4.2 },
          { name: '湖北', value: 14200, amount: '¥1.9亿', caseCount: 14200, avgAmount: 13380, density: 3.8 },
          { name: '湖南', value: 13800, amount: '¥1.8亿', caseCount: 13800, avgAmount: 13043, density: 3.6 },
        ],
        cityData: [
          { name: '北京', coordinates: [116.46, 39.92], value: 15420, cases: 15420, amount: '¥2.8亿' },
          { name: '上海', coordinates: [121.48, 31.22], value: 12890, cases: 12890, amount: '¥2.4亿' },
          { name: '深圳', coordinates: [114.07, 22.62], value: 11200, cases: 11200, amount: '¥1.6亿' },
          { name: '广州', coordinates: [113.23, 23.16], value: 9800, cases: 9800, amount: '¥1.4亿' },
          { name: '杭州', coordinates: [120.19, 30.26], value: 8900, cases: 8900, amount: '¥1.3亿' },
        ],
        heatmapData: [
          { coordinates: [116.46, 39.92], value: 15420, cases: 15420, amount: '¥2.8亿' },
          { coordinates: [121.48, 31.22], value: 12890, cases: 12890, amount: '¥2.4亿' },
          { coordinates: [114.07, 22.62], value: 11200, cases: 11200, amount: '¥1.6亿' },
          { coordinates: [113.23, 23.16], value: 9800, cases: 9800, amount: '¥1.4亿' },
          { coordinates: [120.19, 30.26], value: 8900, cases: 8900, amount: '¥1.3亿' },
        ],
        statistics: {
          totalCases: 186190,
          totalAmount: '¥28.4亿',
          avgCaseAmount: 15256,
          topProvinces: [
            { name: '广东', cases: 28900, percentage: 15.5 },
            { name: '山东', cases: 24300, percentage: 13.0 },
            { name: '江苏', cases: 21600, percentage: 11.6 },
            { name: '河南', cases: 19800, percentage: 10.6 },
            { name: '浙江', cases: 18700, percentage: 10.0 },
          ]
        }
      };
      
      setGeoData(mockData);
    } catch (error) {
      console.error('加载地图数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const initChart = () => {
    if (!chartInstance.current || !geoData) return;

    const option = {
      title: {
        text: '全国案件分布图',
        subtext: '数据更新时间：' + new Date().toLocaleString(),
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 18,
          fontWeight: 'bold'
        },
        subtextStyle: {
          color: '#666',
          fontSize: 12
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: '#333',
        textStyle: {
          color: '#fff'
        },
        formatter: (params: any) => {
          if (params.componentType === 'geo') {
            const data = params.data || {};
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
                <div>案件数量: ${data.caseCount?.toLocaleString() || 0}</div>
                <div>案件金额: ${data.amount || '暂无数据'}</div>
                <div>平均金额: ¥${data.avgAmount?.toLocaleString() || 0}</div>
                <div>案件密度: ${data.density || 0}/万人</div>
              </div>
            `;
          }
          return params.name;
        }
      },
      visualMap: {
        min: 0,
        max: 30000,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#e0f3ff', '#abd9ea', '#74add1', '#4575b4', '#313695']
        },
        textStyle: {
          color: '#333'
        }
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        label: {
          show: showLabels,
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
            areaColor: '#389bb7',
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold'
          }
        }
      },
      series: []
    };

    chartInstance.current.setOption(option);
  };

  const updateChart = () => {
    if (!chartInstance.current || !geoData) return;

    let seriesData: any[] = [];
    let visualMapMax = 30000;

    switch (viewMode) {
      case 'province':
        seriesData = [{
          name: '案件分布',
          type: 'map',
          geoIndex: 0,
          data: geoData.provinceData.map(item => {
            let value = item.caseCount;
            if (dataType === 'amount') {
              value = parseFloat(item.amount.replace(/[¥亿万,]/g, '')) * 10000;
            } else if (dataType === 'density') {
              value = item.density;
              visualMapMax = 10;
            }
            return {
              name: item.name,
              value: value,
              ...item
            };
          })
        }];
        break;

      case 'city':
        seriesData = [{
          name: '城市案件',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: geoData.cityData.map(item => ({
            name: item.name,
            value: [...item.coordinates, item.value],
            cases: item.cases,
            amount: item.amount
          })),
          symbolSize: (val: number[]) => Math.max(Math.sqrt(val[2]) / 10, 8),
          itemStyle: {
            color: '#c23531',
            shadowBlur: 10,
            shadowColor: 'rgba(194, 53, 49, 0.5)'
          },
          emphasis: {
            itemStyle: {
              color: '#f5222d'
            }
          }
        }];
        break;

      case 'heatmap':
        seriesData = [{
          name: '案件热力图',
          type: 'heatmap',
          coordinateSystem: 'geo',
          data: geoData.heatmapData.map(item => ({
            value: [...item.coordinates, item.value]
          })),
          pointSize: heatmapRadius,
          blurSize: heatmapRadius * 1.5,
          minOpacity: 0.4,
          maxOpacity: 0.8
        }];
        break;
    }

    chartInstance.current.setOption({
      visualMap: {
        max: visualMapMax
      },
      series: seriesData
    });
  };

  const handleChartClick = (params: any) => {
    if (params.componentType === 'geo') {
      setSelectedRegion(params.name);
      // 这里可以触发区域详情查看
      console.log('点击区域:', params.name, params.data);
    }
  };

  const handleChartMouseOver = (params: any) => {
    // 处理鼠标悬停事件
  };

  const handleFullscreen = () => {
    if (chartRef.current) {
      if (chartRef.current.requestFullscreen) {
        chartRef.current.requestFullscreen();
      }
    }
  };

  const handleExport = () => {
    if (chartInstance.current) {
      const url = chartInstance.current.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      const link = document.createElement('a');
      link.download = `案件分布图_${new Date().getTime()}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="case-distribution-map">
      <Card
        title={
          <div className="map-header">
            <span>全国案件分布图</span>
            <div className="map-controls">
              <Tooltip title="刷新数据">
                <Button 
                  icon={<ReloadOutlined />} 
                  size="small" 
                  onClick={loadData}
                  loading={loading}
                />
              </Tooltip>
              <Tooltip title="全屏显示">
                <Button 
                  icon={<FullscreenOutlined />} 
                  size="small" 
                  onClick={handleFullscreen}
                />
              </Tooltip>
              <Tooltip title="导出图片">
                <Button 
                  icon={<DownloadOutlined />} 
                  size="small" 
                  onClick={handleExport}
                />
              </Tooltip>
            </div>
          </div>
        }
        extra={
          <div className="map-settings">
            <Select
              value={viewMode}
              onChange={setViewMode}
              size="small"
              style={{ width: 120, marginRight: 8 }}
            >
              <Option value="province">省份分布</Option>
              <Option value="city">城市标记</Option>
              <Option value="heatmap">热力图</Option>
            </Select>
            <Select
              value={dataType}
              onChange={setDataType}
              size="small"
              style={{ width: 100, marginRight: 8 }}
            >
              <Option value="count">案件数量</Option>
              <Option value="amount">案件金额</Option>
              <Option value="density">案件密度</Option>
            </Select>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Spin spinning={loading}>
          <div className="map-container">
            <div 
              ref={chartRef} 
              style={{ width: '100%', height: height }}
            />
            
            {/* 地图控制面板 */}
            <div className="map-control-panel">
              <div className="control-item">
                <span>显示标签</span>
                <Switch 
                  checked={showLabels} 
                  onChange={setShowLabels}
                  size="small"
                />
              </div>
              {viewMode === 'heatmap' && (
                <div className="control-item">
                  <span>热力半径</span>
                  <Slider
                    min={10}
                    max={50}
                    value={heatmapRadius}
                    onChange={setHeatmapRadius}
                    style={{ width: 80 }}
                  />
                </div>
              )}
            </div>

            {/* 统计信息面板 */}
            {geoData && (
              <div className="statistics-panel">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="案件总数"
                      value={geoData.statistics.totalCases}
                      precision={0}
                      valueStyle={{ color: '#1890ff', fontSize: 16 }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="案件总金额"
                      value={geoData.statistics.totalAmount}
                      valueStyle={{ color: '#52c41a', fontSize: 16 }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="平均案件金额"
                      value={geoData.statistics.avgCaseAmount}
                      precision={0}
                      prefix="¥"
                      valueStyle={{ color: '#faad14', fontSize: 16 }}
                    />
                  </Col>
                  <Col span={6}>
                    <div className="top-regions">
                      <div className="title">案件数量TOP5</div>
                      {geoData.statistics.topProvinces.map((province, index) => (
                        <div key={province.name} className="region-item">
                          <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                          <span className="name">{province.name}</span>
                          <span className="value">{province.cases.toLocaleString()}</span>
                          <span className="percentage">({province.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default CaseDistributionMap;