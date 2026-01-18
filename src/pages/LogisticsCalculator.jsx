import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Select,
  InputNumber,
  Button,
  Table,
  Divider,
  Alert,
  Space,
  Statistic,
  Tag,
  Descriptions,
  message
} from 'antd'
import {
  CalculatorOutlined,
  DollarOutlined,
  TruckOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { mockPartsData, logisticsProviders } from '../data/mockData'

const { Option } = Select

const LogisticsCalculator = () => {
  const [form] = Form.useForm()
  const [selectedPart, setSelectedPart] = useState(null)
  const [calculationResults, setCalculationResults] = useState([])
  const [volumetricWeight, setVolumetricWeight] = useState(0)
  const [chargeableWeight, setChargeableWeight] = useState(0)
  const [weightBasedOn, setWeightBasedOn] = useState('')

  const handlePartChange = (partId) => {
    const part = mockPartsData.find(p => p.id === partId)
    if (part) {
      setSelectedPart(part)
      form.setFieldsValue({
        length: part.dimensions.length,
        width: part.dimensions.width,
        height: part.dimensions.height,
        actualWeight: part.weight
      })
    }
  }

  const handleCalculate = () => {
    const values = form.getFieldsValue()
    if (!values.length || !values.width || !values.height || !values.actualWeight) {
      message.warning('请填写完整的尺寸和重量信息')
      return
    }

    const dimFactor = 6000
    const volWeight = (values.length * values.width * values.height) / dimFactor
    const actualWeight = values.actualWeight
    const chargeWt = Math.max(volWeight, actualWeight)

    setVolumetricWeight(volWeight.toFixed(2))
    setChargeableWeight(chargeWt.toFixed(2))
    setWeightBasedOn(volWeight > actualWeight ? '抛重' : '实重')

    const results = logisticsProviders.map(provider => {
      const freight = Math.max(
        provider.baseRate + provider.weightRate * chargeWt,
        provider.minCharge
      )

      const logisticsCostRatio = selectedPart
        ? ((freight / selectedPart.price) * 100).toFixed(2)
        : 0

      return {
        ...provider,
        volumetricWeight: volWeight.toFixed(2),
        chargeableWeight: chargeWt.toFixed(2),
        freight: freight.toFixed(2),
        logisticsCostRatio
      }
    })

    setCalculationResults(results)
    message.success('计算完成')
  }

  const handleReset = () => {
    form.resetFields()
    setSelectedPart(null)
    setCalculationResults([])
    setVolumetricWeight(0)
    setChargeableWeight(0)
    setWeightBasedOn('')
  }

  const columns = [
    {
      title: '物流商',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '抛重 (kg)',
      dataIndex: 'volumetricWeight',
      key: 'volumetricWeight',
      width: 100,
      render: (weight) => <span style={{ color: '#1890ff' }}>{weight}</span>
    },
    {
      title: '计费重量 (kg)',
      dataIndex: 'chargeableWeight',
      key: 'chargeableWeight',
      width: 120,
      render: (weight) => <span style={{ fontWeight: 'bold' }}>{weight}</span>
    },
    {
      title: '预估运费 (元)',
      dataIndex: 'freight',
      key: 'freight',
      width: 120,
      sorter: (a, b) => parseFloat(a.freight) - parseFloat(b.freight),
      render: (freight) => (
        <span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{freight}</span>
      )
    },
    {
      title: '参考时效',
      dataIndex: 'deliveryTime',
      key: 'deliveryTime',
      width: 100
    },
    {
      title: '物流成本占比',
      dataIndex: 'logisticsCostRatio',
      key: 'logisticsCostRatio',
      width: 120,
      sorter: (a, b) => parseFloat(a.logisticsCostRatio) - parseFloat(b.logisticsCostRatio),
      render: (ratio) => {
        const color = parseFloat(ratio) > 10 ? 'red' : parseFloat(ratio) > 5 ? 'orange' : 'green'
        return <Tag color={color}>{ratio}%</Tag>
      }
    }
  ]

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card
            title="物流成本计算器"
            extra={
              <Space>
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCalculate}>
                  开始计算
                </Button>
              </Space>
            }
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="选择拆分件" name="partId">
                    <Select
                      placeholder="请选择拆分件"
                      onChange={handlePartChange}
                      showSearch
                      optionFilterProp="children"
                    >
                      {mockPartsData.map(part => (
                        <Option key={part.id} value={part.id}>
                          {part.name} - ¥{part.price}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">包装尺寸（cm）</Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="长度" name="length">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="长度"
                      min={0}
                      precision={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="宽度" name="width">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="宽度"
                      min={0}
                      precision={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="高度" name="height">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="高度"
                      min={0}
                      precision={0}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">重量信息</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="实重 (kg)" name="actualWeight">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="实际重量"
                      min={0}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="抛比系数">
                    <InputNumber
                      style={{ width: '100%' }}
                      defaultValue={6000}
                      disabled
                      addonAfter="cm³/kg"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {calculationResults.length > 0 && (
              <>
                <Divider orientation="left">计算结果</Divider>
                <Alert
                  message="计费重量说明"
                  description={
                    <div>
                      <p>抛重：{volumetricWeight} kg</p>
                      <p>实重：{form.getFieldValue('actualWeight')} kg</p>
                      <p>
                        <strong>计费重量：{chargeableWeight} kg（基于{weightBasedOn}）</strong>
                      </p>
                    </div>
                  }
                  type="info"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom: 16 }}
                />

                <Table
                  columns={columns}
                  dataSource={calculationResults}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                />
              </>
            )}
          </Card>
        </Col>

        <Col span={8}>
          {selectedPart && (
            <Card title="选中部件信息" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="部件名称">{selectedPart.name}</Descriptions.Item>
                <Descriptions.Item label="部件类别">{selectedPart.category}</Descriptions.Item>
                <Descriptions.Item label="部件价格">
                  <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                    ¥{selectedPart.price.toLocaleString()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="实重">{selectedPart.weight} kg</Descriptions.Item>
                <Descriptions.Item label="包装尺寸">
                  {selectedPart.dimensions.length} × {selectedPart.dimensions.width} × {selectedPart.dimensions.height} cm
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              <p style={{ color: '#666', fontSize: 13 }}>{selectedPart.description}</p>
            </Card>
          )}

          <Card title="计算说明">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <h4>抛重计算公式</h4>
                <p style={{ color: '#666', fontSize: 13 }}>
                  抛重 (kg) = 长(cm) × 宽(cm) × 高(cm) ÷ 抛比系数
                </p>
              </div>
              <div>
                <h4>计费重量</h4>
                <p style={{ color: '#666', fontSize: 13 }}>
                  计费重量 = MAX(实重, 抛重)
                </p>
              </div>
              <div>
                <h4>运费计算</h4>
                <p style={{ color: '#666', fontSize: 13 }}>
                  运费 = 基础费率 + 重量费率 × 计费重量
                </p>
                <p style={{ color: '#666', fontSize: 13 }}>
                  （不低于最低起运费）
                </p>
              </div>
              <Divider />
              <div>
                <h4>物流成本占比</h4>
                <p style={{ color: '#666', fontSize: 13 }}>
                  物流成本占比 = (预估运费 ÷ 部件价格) × 100%
                </p>
              </div>
            </Space>
          </Card>

          {calculationResults.length > 0 && (
            <Card title="最优方案推荐" style={{ marginTop: 16 }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Statistic
                  title="最低运费"
                  value={Math.min(...calculationResults.map(r => parseFloat(r.freight)))}
                  prefix="¥"
                  suffix="元"
                  valueStyle={{ color: '#3f8600' }}
                />
                <Statistic
                  title="最快时效"
                  value={calculationResults.find(r => r.deliveryTime.includes('1-3'))?.name || '-'}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
                <Statistic
                  title="最低物流成本占比"
                  value={Math.min(...calculationResults.map(r => parseFloat(r.logisticsCostRatio)))}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default LogisticsCalculator
