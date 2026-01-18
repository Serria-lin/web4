import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Table,
  Select,
  Slider,
  Button,
  Space,
  Tag,
  Radio,
  Divider,
  Alert,
  message,
  Tooltip
} from 'antd'
import {
  BarChartOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { competitorData } from '../data/mockData'

const { Option } = Select

const CompetitorAnalysis = () => {
  const [analysisMode, setAnalysisMode] = useState('comprehensive')
  const [weightPreset, setWeightPreset] = useState('balanced')
  const [weights, setWeights] = useState({
    price: 0.5,
    feature: 0.2,
    material: 0.1,
    weight: 0.2
  })
  const [coefficients, setCoefficients] = useState({
    alpha: 1,
    beta: 0.8,
    gamma: 0.5
  })
  const [analysisResults, setAnalysisResults] = useState([])
  const [selectedCompetitors, setSelectedCompetitors] = useState([])

  const weightPresets = {
    balanced: { price: 0.5, feature: 0.2, material: 0.1, weight: 0.2 },
    featurePriority: { price: 0.3, feature: 0.4, material: 0.2, weight: 0.1 },
    costSensitive: { price: 0.6, feature: 0.15, material: 0.1, weight: 0.15 },
    qualityPriority: { price: 0.2, feature: 0.3, material: 0.35, weight: 0.15 }
  }

  const presetLabels = {
    balanced: '均衡分析型',
    featurePriority: '功能优先型',
    costSensitive: '成本敏感型',
    qualityPriority: '品质优先型'
  }

  useEffect(() => {
    performAnalysis()
  }, [analysisMode, weights, coefficients, selectedCompetitors])

  const handleWeightPresetChange = (preset) => {
    setWeightPreset(preset)
    setWeights(weightPresets[preset])
    message.success(`已应用${presetLabels[preset]}方案`)
  }

  const performAnalysis = () => {
    let results = []

    if (analysisMode === 'comprehensive') {
      results = competitorData.map(item => {
        const maxPrice = Math.max(...competitorData.map(d => d.price))
        const minPrice = Math.min(...competitorData.map(d => d.price))
        const maxWeight = Math.max(...competitorData.map(d => d.weight))
        const minWeight = Math.min(...competitorData.map(d => d.weight))

        const priceScore = 1 - (item.price - minPrice) / (maxPrice - minPrice)
        const weightScore = 1 - (item.weight - minWeight) / (maxWeight - minWeight)
        const featureScore = item.featureScore / 100
        const materialScore = item.materialScore / 10

        const totalScore =
          priceScore * weights.price +
          featureScore * weights.feature +
          materialScore * weights.material +
          weightScore * weights.weight

        return {
          ...item,
          priceScore: (priceScore * 100).toFixed(1),
          featureScore: item.featureScore,
          materialScore: (materialScore * 100).toFixed(1),
          weightScore: (weightScore * 100).toFixed(1),
          totalScore: (totalScore * 100).toFixed(2),
          rank: 0
        }
      })
    } else {
      results = competitorData.map(item => {
        const featureScore = item.featureScore
        const materialScore = item.materialScore * 10
        const price = item.price
        const estimatedLogisticsCost = item.weight * 2.5

        const costUtilityRatio =
          (coefficients.alpha * featureScore + coefficients.beta * materialScore) /
          (price + coefficients.gamma * estimatedLogisticsCost)

        return {
          ...item,
          costUtilityRatio: (costUtilityRatio * 1000).toFixed(2),
          rank: 0
        }
      })
    }

    results.sort((a, b) => {
      const scoreA = parseFloat(analysisMode === 'comprehensive' ? a.totalScore : a.costUtilityRatio)
      const scoreB = parseFloat(analysisMode === 'comprehensive' ? b.totalScore : b.costUtilityRatio)
      return scoreB - scoreA
    })

    results = results.map((item, index) => ({
      ...item,
      rank: index + 1
    }))

    setAnalysisResults(results)
  }

  const getRadarOption = () => {
    const dimensions = analysisMode === 'comprehensive'
      ? ['价格得分', '功能得分', '材质得分', '重量得分']
      : ['功能得分', '材质得分', '价格', '重量']

    const series = analysisMode === 'comprehensive'
      ? analysisResults.slice(0, 5).map(item => ({
          name: item.brand,
          value: [
            parseFloat(item.priceScore),
            item.featureScore,
            parseFloat(item.materialScore),
            parseFloat(item.weightScore)
          ]
        }))
      : analysisResults.slice(0, 5).map(item => ({
          name: item.brand,
          value: [
            item.featureScore,
            item.materialScore * 10,
            100 - (item.price / Math.max(...competitorData.map(d => d.price)) * 100),
            100 - (item.weight / Math.max(...competitorData.map(d => d.weight)) * 100)
          ]
        }))

    return {
      title: {
        text: '竞品综合能力雷达图',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: series.map(s => s.name),
        bottom: 0
      },
      radar: {
        indicator: dimensions.map(d => ({ name: d, max: 100 }))
      },
      series: [
        {
          name: '竞品对比',
          type: 'radar',
          data: series
        }
      ]
    }
  }

  const getScatterOption = () => {
    return {
      title: {
        text: '价格-功能分布图',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `${params.data[2]}<br/>价格: ¥${params.data[0]}<br/>功能得分: ${params.data[1]}`
        }
      },
      xAxis: {
        name: '价格（元）',
        type: 'value',
        scale: true
      },
      yAxis: {
        name: '功能得分',
        type: 'value',
        scale: true
      },
      series: [
        {
          name: '竞品',
          type: 'scatter',
          symbolSize: 20,
          data: competitorData.map(item => [
            item.price,
            item.featureScore,
            item.brand
          ])
        }
      ]
    }
  }

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => {
        if (rank === 1) return <Tag color="gold" icon={<TrophyOutlined />}>第1名</Tag>
        if (rank === 2) return <Tag color="silver">第2名</Tag>
        if (rank === 3) return <Tag color="#cd7f32">第3名</Tag>
        return <span>第{rank}名</span>
      }
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100
    },
    {
      title: '车系',
      dataIndex: 'series',
      key: 'series',
      width: 100
    },
    {
      title: '价格（元）',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{price.toLocaleString()}</span>
    },
    {
      title: '功能得分',
      dataIndex: 'featureScore',
      key: 'featureScore',
      width: 100,
      render: (score) => <Tag color="blue">{score}</Tag>
    },
    {
      title: '材质得分',
      dataIndex: 'materialScore',
      key: 'materialScore',
      width: 100,
      render: (score) => <Tag color="purple">{score}</Tag>
    },
    ...(analysisMode === 'comprehensive' ? [
      {
        title: '价格得分',
        dataIndex: 'priceScore',
        key: 'priceScore',
        width: 100
      },
      {
        title: '重量得分',
        dataIndex: 'weightScore',
        key: 'weightScore',
        width: 100
      },
      {
        title: '综合得分',
        dataIndex: 'totalScore',
        key: 'totalScore',
        width: 100,
        sorter: (a, b) => parseFloat(a.totalScore) - parseFloat(b.totalScore),
        render: (score) => (
          <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: 16 }}>
            {score}
          </span>
        )
      }
    ] : [
      {
        title: '性价比系数',
        dataIndex: 'costUtilityRatio',
        key: 'costUtilityRatio',
        width: 120,
        sorter: (a, b) => parseFloat(a.costUtilityRatio) - parseFloat(b.costUtilityRatio),
        render: (ratio) => (
          <span style={{ color: '#52c41a', fontWeight: 'bold', fontSize: 16 }}>
            {ratio}
          </span>
        )
      }
    ])
  ]

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="竞品智能对标与性价比分析">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <h4>分析模式</h4>
                <Radio.Group
                  value={analysisMode}
                  onChange={(e) => setAnalysisMode(e.target.value)}
                  style={{ marginTop: 8 }}
                >
                  <Radio.Button value="comprehensive">综合评分模型</Radio.Button>
                  <Radio.Button value="costUtility">成本效用比模型</Radio.Button>
                </Radio.Group>
              </div>

              {analysisMode === 'comprehensive' ? (
                <div>
                  <h4>权重配置 - {presetLabels[weightPreset]}</h4>
                  <Space wrap style={{ marginTop: 8 }}>
                    <Button
                      type={weightPreset === 'balanced' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => handleWeightPresetChange('balanced')}
                    >
                      均衡分析型
                    </Button>
                    <Button
                      type={weightPreset === 'featurePriority' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => handleWeightPresetChange('featurePriority')}
                    >
                      功能优先型
                    </Button>
                    <Button
                      type={weightPreset === 'costSensitive' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => handleWeightPresetChange('costSensitive')}
                    >
                      成本敏感型
                    </Button>
                    <Button
                      type={weightPreset === 'qualityPriority' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => handleWeightPresetChange('qualityPriority')}
                    >
                      品质优先型
                    </Button>
                  </Space>

                  <Divider />

                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Space>
                          <span>价格权重:</span>
                          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            {weights.price}
                          </span>
                        </Space>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={weights.price}
                          onChange={(value) => setWeights({ ...weights, price: value })}
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Space>
                          <span>功能权重:</span>
                          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            {weights.feature}
                          </span>
                        </Space>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={weights.feature}
                          onChange={(value) => setWeights({ ...weights, feature: value })}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <Space>
                          <span>材质权重:</span>
                          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            {weights.material}
                          </span>
                        </Space>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={weights.material}
                          onChange={(value) => setWeights({ ...weights, material: value })}
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Space>
                          <span>重量权重:</span>
                          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            {weights.weight}
                          </span>
                        </Space>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={weights.weight}
                          onChange={(value) => setWeights({ ...weights, weight: value })}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Alert
                    message="权重说明"
                    description="价格和重量为成本型指标，得分与数值负相关；功能和材质为效益型指标，得分与数值正相关。"
                    type="info"
                    showIcon
                  />
                </div>
              ) : (
                <div>
                  <h4>系数配置</h4>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ marginBottom: 16 }}>
                        <Space>
                          <span>α (功能系数):</span>
                          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            {coefficients.alpha}
                          </span>
                        </Space>
                        <Slider
                          min={0.1}
                          max={2}
                          step={0.1}
                          value={coefficients.alpha}
                          onChange={(value) => setCoefficients({ ...coefficients, alpha: value })}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ marginBottom: 16 }}>
                        <Space>
                          <span>β (材质系数):</span>
                          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            {coefficients.beta}
                          </span>
                        </Space>
                        <Slider
                          min={0.1}
                          max={2}
                          step={0.1}
                          value={coefficients.beta}
                          onChange={(value) => setCoefficients({ ...coefficients, beta: value })}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ marginBottom: 16 }}>
                        <Space>
                          <span>γ (物流成本系数):</span>
                          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            {coefficients.gamma}
                          </span>
                        </Space>
                        <Slider
                          min={0.1}
                          max={1}
                          step={0.1}
                          value={coefficients.gamma}
                          onChange={(value) => setCoefficients({ ...coefficients, gamma: value })}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Alert
                    message="计算公式"
                    description="性价比系数 = (α × 功能得分 + β × 材质得分) ÷ (价格 + γ × 预估物流成本)"
                    type="info"
                    showIcon
                  />
                </div>
              )}

              <Divider />

              <Table
                columns={columns}
                dataSource={analysisResults}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="可视化分析" style={{ marginBottom: 16 }}>
            <ReactECharts option={getRadarOption()} style={{ height: 350 }} />
          </Card>

          <Card title="价格-功能分布">
            <ReactECharts option={getScatterOption()} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CompetitorAnalysis
