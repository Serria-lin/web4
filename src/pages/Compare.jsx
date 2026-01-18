import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Alert,
  Empty,
  message,
  Tooltip
} from 'antd'
import {
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { mockSeatData } from '../data/mockData'

const Compare = ({ compareList, removeFromCompare, clearCompare }) => {
  const [exportModalVisible, setExportModalVisible] = useState(false)

  const handleRemoveFromCompare = (id) => {
    removeFromCompare(id)
    message.success('已从对比列表移除')
  }

  const handleClearAll = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有对比项吗？',
      onOk: () => {
        clearCompare()
        message.success('已清空对比列表')
      }
    })
  }

  const handleExport = () => {
    setExportModalVisible(true)
  }

  const handleExportPDF = () => {
    message.success('正在生成PDF报告...')
    setExportModalVisible(false)
  }

  const handleExportExcel = () => {
    message.success('正在导出Excel文件...')
    setExportModalVisible(false)
  }

  const getComparisonValue = (key, value, allValues) => {
    if (!allValues || allValues.length === 0) return { value, status: 'normal' }

    const isNumeric = typeof value === 'number'
    if (!isNumeric) return { value, status: 'normal' }

    const values = allValues.filter(v => typeof v === 'number')
    if (values.length === 0) return { value, status: 'normal' }

    const min = Math.min(...values)
    const max = Math.max(...values)

    if (value === min) return { value, status: 'better' }
    if (value === max) return { status: 'worse' }

    return { value, status: 'normal' }
  }

  const renderComparisonCell = (value, allValues, isPrice = false) => {
    const { value: displayValue, status } = getComparisonValue(null, value, allValues)

    let className = ''
    if (status === 'better') className = 'comparison-better'
    if (status === 'worse') className = 'comparison-worse'

    const formattedValue = isPrice ? `¥${value.toLocaleString()}` : value

    return (
      <span className={className}>
        {formattedValue}
        {status === 'better' && <CheckCircleOutlined style={{ marginLeft: 4 }} />}
        {status === 'worse' && <CloseCircleOutlined style={{ marginLeft: 4 }} />}
      </span>
    )
  }

  const columns = [
    {
      title: '对比项目',
      dataIndex: 'key',
      key: 'key',
      width: 150,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>
    },
    ...compareList.map((item, index) => ({
      title: (
        <div>
          <div style={{ fontWeight: 'bold' }}>{item.brand} {item.series}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{item.year} {item.model}</div>
        </div>
      ),
      dataIndex: `item_${index}`,
      key: `item_${index}`,
      width: 200,
      render: (_, record) => {
        if (record.key === '操作') {
          return (
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveFromCompare(item.id)}
            >
              移除
            </Button>
          )
        }
        return record[`item_${index}`]
      }
    }))
  ]

  const generateComparisonData = () => {
    if (compareList.length === 0) return []

    const data = [
      {
        key: '品牌',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: item.brand
        }), {})
      },
      {
        key: '车系',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: item.series
        }), {})
      },
      {
        key: '年款',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: item.year
        }), {})
      },
      {
        key: '配置型号',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: item.model
        }), {})
      },
      {
        key: '座椅位置',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: <Tag color="blue">{item.position}</Tag>
        }), {})
      },
      {
        key: '材质',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: <Tag color="gold">{item.material}</Tag>
        }), {})
      },
      {
        key: '价格（元）',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: renderComparisonCell(
            item.price,
            compareList.map(i => i.price),
            true
          )
        }), {})
      },
      {
        key: '重量（kg）',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: renderComparisonCell(
            item.weight,
            compareList.map(i => i.weight)
          )
        }), {})
      },
      {
        key: '功能配置',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: (
            <Space size={[4, 4]} wrap>
              {item.features.slice(0, 4).map(feature => (
                <Tag key={feature} size="small">{feature}</Tag>
              ))}
              {item.features.length > 4 && <Tag size="small">+{item.features.length - 4}</Tag>}
            </Space>
          )
        }), {})
      },
      {
        key: '包装尺寸',
        ...compareList.reduce((acc, item, index) => ({
          ...acc,
          [`item_${index}`]: `${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.height}cm`
        }), {})
      },
      {
        key: '操作',
        ...compareList.reduce((acc, _, index) => ({
          ...acc,
          [`item_${index}`]: null
        }), {})
      }
    ]

    return data
  }

  return (
    <div>
      <Card
        title="产品对比"
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={compareList.length === 0}
            >
              导出报告
            </Button>
            <Button
              icon={<PrinterOutlined />}
              disabled={compareList.length === 0}
              onClick={() => message.success('正在打印...')}
            >
              打印
            </Button>
            <Button
              danger
              onClick={handleClearAll}
              disabled={compareList.length === 0}
            >
              清空对比
            </Button>
          </Space>
        }
      >
        {compareList.length === 0 ? (
          <Empty
            description="对比列表为空，请从座椅配置库添加产品进行对比"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <Alert
              message="对比说明"
              description={
                <div>
                  <p>• 绿色标记表示该指标在所有对比项中表现最优</p>
                  <p>• 红色标记表示该指标在所有对比项中表现最差</p>
                  <p>• 最多可对比5个产品</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={columns}
              dataSource={generateComparisonData()}
              pagination={false}
              scroll={{ x: 1200 }}
              bordered
              size="middle"
            />
          </>
        )}
      </Card>

      <Modal
        title="导出对比报告"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button
            type="primary"
            block
            icon={<DownloadOutlined />}
            onClick={handleExportPDF}
          >
            导出为 PDF
          </Button>
          <Button
            type="primary"
            block
            icon={<DownloadOutlined />}
            onClick={handleExportExcel}
          >
            导出为 Excel
          </Button>
        </Space>
      </Modal>
    </div>
  )
}

export default Compare
