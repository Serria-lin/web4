import React, { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip
} from 'antd'
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const History = () => {
  const [historyData, setHistoryData] = useState([
    {
      id: 1,
      type: '查询',
      title: '比亚迪汉座椅配置查询',
      description: '筛选条件：品牌=比亚迪，车系=汉，材质=Nappa真皮',
      resultCount: 4,
      createTime: '2024-01-12 10:30:25',
      status: 'completed'
    },
    {
      id: 2,
      type: '对比',
      title: '三款座椅产品对比',
      description: '对比项：特斯拉Model 3、比亚迪汉、蔚来ET7',
      resultCount: 3,
      createTime: '2024-01-11 15:45:12',
      status: 'completed'
    },
    {
      id: 3,
      type: '计算',
      title: '物流成本计算',
      description: '部件：座椅总成，目的地：北京市',
      resultCount: 3,
      createTime: '2024-01-11 14:20:08',
      status: 'completed'
    },
    {
      id: 4,
      type: '分析',
      title: '竞品性价比分析',
      description: '分析模式：综合评分模型，权重方案：均衡分析型',
      resultCount: 5,
      createTime: '2024-01-10 09:15:33',
      status: 'completed'
    },
    {
      id: 5,
      type: '查询',
      title: '2024款新能源座椅配置查询',
      description: '筛选条件：年款=2024，价格区间=8000-15000',
      resultCount: 8,
      createTime: '2024-01-09 16:30:45',
      status: 'completed'
    },
    {
      id: 6,
      type: '计算',
      title: '座椅骨架物流成本计算',
      description: '部件：座椅骨架，目的地：上海市',
      resultCount: 3,
      createTime: '2024-01-08 11:20:18',
      status: 'completed'
    },
    {
      id: 7,
      type: '对比',
      title: '五款座椅产品对比',
      description: '对比项：特斯拉Model 3、比亚迪汉、蔚来ET7、理想L9、小鹏G9',
      resultCount: 5,
      createTime: '2024-01-07 13:45:22',
      status: 'completed'
    },
    {
      id: 8,
      type: '分析',
      title: '竞品成本效用比分析',
      description: '分析模式：成本效用比模型，α=1.0, β=0.8, γ=0.5',
      resultCount: 5,
      createTime: '2024-01-06 10:10:55',
      status: 'completed'
    }
  ])

  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)

  const handleViewDetail = (record) => {
    setCurrentRecord(record)
    setViewModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条分析记录吗？',
      onOk: () => {
        setHistoryData(historyData.filter(item => item.id !== id))
        message.success('已删除分析记录')
      }
    })
  }

  const handleReplay = (record) => {
    message.success(`正在重现：${record.title}`)
  }

  const handleExport = (record) => {
    // 创建CSV内容
    const csvContent = `Type,Title,Description,Result Count,Create Time,Status\n${record.type},${record.title},${record.description},${record.resultCount},${record.createTime},${record.status === 'completed' ? '已完成' : '进行中'}`
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${record.title}_${record.createTime.replace(/:/g, '-')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    message.success(`已导出：${record.title}`)
  }

  const typeColors = {
    查询: 'blue',
    对比: 'purple',
    计算: 'orange',
    分析: 'green'
  }

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag color={typeColors[type]}>{type}</Tag>
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 250
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 350,
      ellipsis: true
    },
    {
      title: '结果数量',
      dataIndex: 'resultCount',
      key: 'resultCount',
      width: 100,
      render: (count) => <Tag>{count} 条</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: (a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix()
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : 'processing'}>
          {status === 'completed' ? '已完成' : '进行中'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="重现操作">
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleReplay(record)}
            />
          </Tooltip>
          <Tooltip title="导出结果">
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleExport(record)}
            />
          </Tooltip>
          <Tooltip title="删除记录">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card
        title="分析记录"
        extra={
          <Space>
            <Button icon={<SearchOutlined />}>搜索</Button>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }} size="middle">
          <Input
            placeholder="搜索记录标题或描述"
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="选择类型"
            style={{ width: 150 }}
            allowClear
          >
            <Option value="查询">查询</Option>
            <Option value="对比">对比</Option>
            <Option value="计算">计算</Option>
            <Option value="分析">分析</Option>
          </Select>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            style={{ width: 280 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={historyData}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title="分析记录详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
          <Button key="replay" icon={<ReloadOutlined />} onClick={() => handleReplay(currentRecord)}>
            重现操作
          </Button>,
          <Button key="export" type="primary" icon={<DownloadOutlined />} onClick={() => handleExport(currentRecord)}>
            导出结果
          </Button>
        ]}
        width={700}
      >
        {currentRecord && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color={typeColors[currentRecord.type]} style={{ fontSize: 14, padding: '4px 12px' }}>
                {currentRecord.type}
              </Tag>
              <h3 style={{ display: 'inline-block', marginLeft: 8 }}>{currentRecord.title}</h3>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ color: '#666' }}>{currentRecord.description}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Space size="large">
                <div>
                  <span style={{ color: '#999' }}>结果数量：</span>
                  <span style={{ fontWeight: 'bold' }}>{currentRecord.resultCount} 条</span>
                </div>
                <div>
                  <span style={{ color: '#999' }}>创建时间：</span>
                  <span>{currentRecord.createTime}</span>
                </div>
                <div>
                  <span style={{ color: '#999' }}>状态：</span>
                  <Tag color="success">已完成</Tag>
                </div>
              </Space>
            </div>

            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              <h4>操作建议</h4>
              <ul style={{ paddingLeft: 20, marginTop: 8, color: '#666' }}>
                <li>点击"重现操作"可以快速恢复当时的筛选条件和分析参数</li>
                <li>点击"导出结果"可以将分析结果导出为PDF或Excel格式</li>
                <li>定期清理不需要的历史记录可以提升系统性能</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default History
