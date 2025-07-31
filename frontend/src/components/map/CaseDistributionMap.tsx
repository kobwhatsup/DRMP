import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Switch, Slider, Row, Col, Statistic, Spin, Button, Tooltip } from 'antd';
import {
  FullscreenOutlined, ReloadOutlined, DownloadOutlined,
  EyeOutlined, SettingOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import './CaseDistributionMap.scss';
// 中国地图GeoJSON数据 - 使用阿里云DataV数据源
const chinaGeoJson = require('./data/china.json');

const { Option } = Select;

// 案件地理分布数据接口
interface CaseGeoData {
  provinceData: Array<{
    name: string;
    value: number;
    orgCount: number;
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
    totalOrgs: number;
    totalCases: number;
    totalAmount: string;
    avgCaseAmount: number;
    topProvinces: Array<{
      name: string;
      orgs: number;
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
  const [dataType, setDataType] = useState<'count' | 'amount' | 'density'>('count');
  const [showLabels, setShowLabels] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // 初始化ECharts实例
      chartInstance.current = echarts.init(chartRef.current);
      
      // 注册中国地图数据
      echarts.registerMap('china', chinaGeoJson);
      
      // 绑定图表事件
      chartInstance.current.on('click', handleChartClick);
      chartInstance.current.on('mouseover', handleChartMouseOver);
      chartInstance.current.on('mouseout', handleChartMouseOut);
      
      // 初始化图表配置
      initChart();
      
      // 加载业务数据
      loadData();
      
      // 窗口大小变化时重新渲染
      const handleResize = () => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (chartInstance.current && geoData) {
      updateChart();
    }
  }, [dataType, showLabels, geoData]);

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
          { name: '北京', value: 45, orgCount: 45, amount: '¥2.8亿', caseCount: 15420, avgAmount: 18156, density: 9.2 },
          { name: '上海', value: 38, orgCount: 38, amount: '¥2.4亿', caseCount: 12890, avgAmount: 18605, density: 8.5 },
          { name: '广东', value: 67, orgCount: 67, amount: '¥4.2亿', caseCount: 28900, avgAmount: 14535, density: 7.8 },
          { name: '江苏', value: 52, orgCount: 52, amount: '¥3.1亿', caseCount: 21600, avgAmount: 14352, density: 6.9 },
          { name: '浙江', value: 41, orgCount: 41, amount: '¥2.9亿', caseCount: 18700, avgAmount: 15508, density: 6.4 },
          { name: '山东', value: 56, orgCount: 56, amount: '¥3.5亿', caseCount: 24300, avgAmount: 14403, density: 5.8 },
          { name: '河南', value: 34, orgCount: 34, amount: '¥2.6亿', caseCount: 19800, avgAmount: 13131, density: 4.9 },
          { name: '四川', value: 29, orgCount: 29, amount: '¥2.2亿', caseCount: 16500, avgAmount: 13333, density: 4.2 },
          { name: '湖北', value: 26, orgCount: 26, amount: '¥1.9亿', caseCount: 14200, avgAmount: 13380, density: 3.8 },
          { name: '湖南', value: 23, orgCount: 23, amount: '¥1.8亿', caseCount: 13800, avgAmount: 13043, density: 3.6 },
          { name: '福建', value: 18, orgCount: 18, amount: '¥1.2亿', caseCount: 8900, avgAmount: 13483, density: 2.8 },
          { name: '安徽', value: 15, orgCount: 15, amount: '¥0.9亿', caseCount: 6700, avgAmount: 13433, density: 2.1 },
          { name: '重庆', value: 12, orgCount: 12, amount: '¥0.8亿', caseCount: 5600, avgAmount: 14286, density: 1.8 },
          { name: '辽宁', value: 14, orgCount: 14, amount: '¥0.7亿', caseCount: 5200, avgAmount: 13462, density: 1.6 },
          { name: '陕西', value: 11, orgCount: 11, amount: '¥0.6亿', caseCount: 4300, avgAmount: 13953, density: 1.4 },
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
          totalOrgs: 411,
          totalCases: 186190,
          totalAmount: '¥28.4亿',
          avgCaseAmount: 15256,
          topProvinces: [
            { name: '广东', orgs: 67, cases: 28900, percentage: 16.3 },
            { name: '山东', orgs: 56, cases: 24300, percentage: 13.6 },
            { name: '江苏', orgs: 52, cases: 21600, percentage: 12.7 },
            { name: '北京', orgs: 45, cases: 15420, percentage: 11.0 },
            { name: '浙江', orgs: 41, cases: 18700, percentage: 10.0 },
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
    if (!chartInstance.current) return;

    // 按照文档标准配置地图选项
    const option = {
      title: {
        text: '全国案源机构地理分布',
        subtext: '数据更新时间：' + new Date().toLocaleString(),
        left: 'center',
        top: '3%',
        textStyle: {
          color: '#333',
          fontSize: 20,
          fontWeight: 'bold'
        },
        subtextStyle: {
          color: '#666',
          fontSize: 12
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(50,50,50,0.95)',
        borderColor: '#409EFF',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: '#fff',
          fontSize: 14
        },
        padding: [12, 16],
        formatter: (params: any) => {
          if (params && params.componentType === 'series') {
            const data = params.data || {};
            const name = params.name || '未知区域';
            const value = data.value || 0;
            const caseCount = data.caseCount || 0;
            const amount = data.amount || '¥0';
            
            return `
              <div style="min-width: 200px;">
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #409EFF;">
                  <i class="icon" style="display: inline-block; width: 8px; height: 8px; background: #409EFF; border-radius: 50%; margin-right: 8px;"></i>
                  ${name}
                </div>
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span>案源机构数量：</span>
                  <span style="color: #67C23A; font-weight: bold;">${value}个</span>
                </div>
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span>案件数量：</span>
                  <span style="color: #E6A23C; font-weight: bold;">${caseCount.toLocaleString()}件</span>
                </div>
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span>案件金额：</span>
                  <span style="color: #F56C6C; font-weight: bold;">${amount}</span>
                </div>
              </div>
            `;
          }
          return params?.name || '未知';
        }
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max: 50,
        left: '20px',
        bottom: '20px',
        text: ['机构数量高', '机构数量低'],
        calculable: true,
        realtime: true,
        inRange: {
          color: [
            '#E8F4FD',  // 最淡蓝色
            '#B3D9F2',  // 浅蓝色
            '#7FC4E8',  // 中蓝色
            '#4EAEE0',  // 深蓝色
            '#2196F3',  // 标准蓝色
            '#1976D2'   // 最深蓝色
          ]
        },
        textStyle: {
          color: '#333',
          fontSize: 12
        },
        borderColor: '#ccc',
        borderWidth: 1
      },
      toolbox: {
        show: true,
        orient: 'horizontal',
        right: '20px',
        top: '20px',
        itemSize: 18,
        itemGap: 15,
        feature: {
          restore: {
            show: true,
            title: '重置缩放'
          },
          saveAsImage: {
            show: true,
            title: '保存为图片',
            name: '案源机构地理分布_' + new Date().getTime()
          }
        },
        iconStyle: {
          borderColor: '#666'
        },
        emphasis: {
          iconStyle: {
            borderColor: '#409EFF'
          }
        }
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [104.195, 35.86],
        aspectScale: 0.75,
        layoutCenter: ['50%', '50%'],
        layoutSize: '80%',
        label: {
          show: showLabels,
          color: '#333',
          fontSize: 11,
          fontWeight: 'normal'
        },
        itemStyle: {
          areaColor: '#f8f9fa',
          borderColor: '#d0d7de',
          borderWidth: 1,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        },
        emphasis: {
          itemStyle: {
            areaColor: '#e3f2fd',
            borderColor: '#2196f3',
            borderWidth: 2,
            shadowColor: 'rgba(33, 150, 243, 0.5)',
            shadowBlur: 15
          },
          label: {
            show: true,
            color: '#1976d2',
            fontSize: 13,
            fontWeight: 'bold'
          }
        }
      },
      series: [
        {
          name: '案源机构分布',
          type: 'map',
          geoIndex: 0,
          data: [],
          roam: false,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              color: '#fff'
            }
          }
        }
      ]
    };

    chartInstance.current.setOption(option);
  };

  const updateChart = () => {
    if (!chartInstance.current || !geoData) return;

    // 根据选择的数据类型更新地图
    const mapData = (geoData?.provinceData || []).map(item => {
      let value = 0;
      let visualMapMax = 50; // 默认最大机构数量
      
      if (dataType === 'count') {
        // 按机构数量显示
        value = item.orgCount || item.caseCount || 0;
        visualMapMax = Math.max(50, Math.max(...(geoData?.provinceData || []).map(d => d.orgCount || d.caseCount || 0)));
      } else if (dataType === 'amount') {
        // 按案件金额显示
        const amountStr = item.amount || '¥0';
        value = parseFloat(amountStr.replace(/[¥亿万,]/g, '')) || 0;
        if (amountStr.includes('亿')) value *= 10000;
        if (amountStr.includes('万')) value *= 10000;
        visualMapMax = Math.max(100000, Math.max(...(geoData?.provinceData || []).map(d => {
          const amt = d.amount || '¥0';
          let val = parseFloat(amt.replace(/[¥亿万,]/g, '')) || 0;
          if (amt.includes('亿')) val *= 10000;
          if (amt.includes('万')) val *= 10000;
          return val;
        })));
      } else if (dataType === 'density') {
        // 按案件密度显示
        value = item.density || 0;
        visualMapMax = 20;
      }
      
      return {
        name: item.name || '未知',
        value: value,
        orgCount: item.orgCount || 0,
        caseCount: item.caseCount || 0,
        amount: item.amount || '¥0',
        avgAmount: item.avgAmount || 0,
        density: item.density || 0
      };
    });

    // 更新图表配置
    chartInstance.current.setOption({
      visualMap: {
        max: Math.ceil(Math.max(...mapData.map(d => d.value)) * 1.1) || 50
      },
      series: [{
        name: '案源机构分布',
        type: 'map',
        geoIndex: 0,
        data: mapData,
        roam: false,
        label: {
          show: showLabels,
          color: '#333',
          fontSize: 11
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            areaColor: '#409EFF'
          }
        }
      }]
    });
  };

  const handleChartClick = (params: any) => {
    if (params && params.componentType === 'geo') {
      setSelectedRegion(params.name || null);
      // 这里可以触发区域详情查看
      console.log('点击区域:', params.name, params.data);
    }
  };

  const handleChartMouseOver = (params: any) => {
    // 鼠标悬停时高亮显示区域信息
    if (params && params.componentType === 'series') {
      console.log('悬停区域:', params.name, params.data);
    }
  };

  const handleChartMouseOut = (params: any) => {
    // 鼠标离开时清除高亮
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
                  
                  onClick={loadData}
                  loading={loading}
                />
              </Tooltip>
              <Tooltip title="全屏显示">
                <Button 
                  icon={<FullscreenOutlined />} 
                  
                  onClick={handleFullscreen}
                />
              </Tooltip>
              <Tooltip title="导出图片">
                <Button 
                  icon={<DownloadOutlined />} 
                  
                  onClick={handleExport}
                />
              </Tooltip>
            </div>
          </div>
        }
        extra={
          <div className="map-settings">
            <Select
              value={dataType}
              onChange={setDataType}
              style={{ width: 120, marginRight: 8 }}
            >
              <Option value="count">机构数量</Option>
              <Option value="amount">案件金额</Option>
              <Option value="density">案件密度</Option>
            </Select>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div className="map-and-stats-container">
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
                  />
                </div>
              </div>
            </div>
          </Spin>

          {/* 统计信息面板 - 移到地图下方 */}
          {geoData && geoData.statistics && (
            <div className="statistics-panel-bottom">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="案源机构总数"
                    value={geoData.statistics.totalOrgs || 0}
                    precision={0}
                    valueStyle={{ color: '#1890ff', fontSize: 16 }}
                    suffix="家"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="案件总数"
                    value={geoData.statistics.totalCases || 0}
                    precision={0}
                    valueStyle={{ color: '#52c41a', fontSize: 16 }}
                    suffix="件"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="案件总金额"
                    value={geoData.statistics.totalAmount || '¥0'}
                    valueStyle={{ color: '#faad14', fontSize: 16 }}
                  />
                </Col>
                <Col span={6}>
                  <div className="top-regions">
                    <div className="title">机构数量TOP5</div>
                    {(geoData.statistics.topProvinces || []).map((province, index) => (
                      <div key={province.name || index} className="region-item">
                        <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                        <span className="name">{province.name || '未知'}</span>
                        <span className="value">{(province.orgs || 0)}家</span>
                        <span className="percentage">({province.percentage || 0}%)</span>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CaseDistributionMap;