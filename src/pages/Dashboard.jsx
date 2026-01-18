import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Alert, Space, Button } from 'antd'
import {
  CarOutlined,
  DollarOutlined,
  RiseOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { mockSeatData, competitorData } from '../data/mockData'

const Dashboard = () => {
  const [priceTrendData, setPriceTrendData] = useState([])
  const [marketShareData, setMarketShareData] = useState([])
  const [recentAlerts, setRecentAlerts] = useState([])

  useEffect(() => {
    generatePriceTrendData()
    generateMarketShareData()
    generateRecentAlerts()
  }, [])

  const generatePriceTrendData = () => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const data = months.map(month => ({
      month,
      avgPrice: Math.floor(8000 + Math.random() * 6000),
      minPrice: Math.floor(6000 + Math.random() * 3000),
      maxPrice: Math.floor(10000 + Math.random() * 5000)
    }))
    setPriceTrendData(data)
  }

  const generateMarketShareData = () => {
    const data = competitorData.map(item => ({
      name: item.brand,
      value: item.marketShare
    }))
    setMarketShareData(data)
  }

  const generateRecentAlerts = () => {
    const alerts = [
      { id: 1, type: 'price', message: '比亚迪汉座椅价格上涨5%', time: '2小时前', severity: 'warning' },
      { id: 2, type: 'new', message: '极氪001新增2024款配置', time: '5小时前', severity: 'info' },
      { id: 3, type: 'stock', message: '特斯拉Model 3座椅库存紧张', time: '1天前', severity: 'error' },
      { id: 4, type: 'price', message: '蔚来ET7座椅价格下调3%', time: '2天前', severity: 'success' }
    ]
    setRecentAlerts(alerts)
  }

  const priceTrendOption = {
    title: {
      text: '座椅价格趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均价格', '最低价格', '最高价格'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: priceTrendData.map(d => d.month)
    },
    yAxis: {
      type: 'value',
      name: '价格（元）'
    },
    series: [
      {
        name: '平均价格',
        type: 'line',
        data: priceTrendData.map(d => d.avgPrice),
        smooth: true,
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '最低价格',
        type: 'line',
        data: priceTrendData.map(d => d.minPrice),
        smooth: true,
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '最高价格',
        type: 'line',
        data: priceTrendData.map(d => d.maxPrice),
        smooth: true,
        itemStyle: { color: '#f5222d' }
      }
    ]
  }

  const marketShareOption = {
    title: {
      text: '市场份额分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: marketShareData.map(d => d.name)
    },
    series: [
      {
        name: '市场份额',
        type: 'pie',
        radius: '60%',
        data: marketShareData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  const recentColumns = [
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: '车系',
      dataIndex: 'series',
      key: 'series'
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price.toLocaleString()}`
    },
    {
      title: '价格趋势',
      key: 'trend',
      render: () => (
        <Tag icon={<ArrowUpOutlined />} color="red">
          +3.2%
        </Tag>
      )
    }
  ]

  const alertColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          price: '价格变动',
          new: '新品上架',
          stock: '库存预警'
        }
        return <Tag color={type === 'price' ? 'blue' : type === 'new' ? 'green' : 'red'}>{typeMap[type]}</Tag>
      }
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time'
    }
  ]

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="座椅总数"
              value={mockSeatData.length}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均价格"
              value={Math.floor(mockSeatData.reduce((sum, item) => sum + item.price, 0) / mockSeatData.length)}
              prefix="¥"
              suffix="元"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="价格涨幅"
              value={3.2}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="竞品数量"
              value={competitorData.length}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
            <Card title="价格趋势分析" extra={<Button type="link" href="/analysis">查看详情</Button>}>
              <ReactECharts option={priceTrendOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="市场份额分布" extra={<Button type="link" href="/analysis">查看详情</Button>}>
              <ReactECharts option={marketShareOption} style={{ height: 350 }} />
            </Card>
          </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="最新价格动态" extra={<Button type="link" href="/seat-library">查看全部</Button>}>
            <Table
              columns={recentColumns}
              dataSource={mockSeatData.slice(0, 5)}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="预警通知" extra={<Button type="link" href="/history">查看全部</Button>}>
            {recentAlerts.map(alert => (
              <Alert
                key={alert.id}
                message={alert.message}
                description={alert.time}
                type={alert.severity}
                showIcon
                style={{ marginBottom: 8 }}
              />
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
