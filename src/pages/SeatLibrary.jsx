import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Select,
  InputNumber,
  Button,
  Table,
  Tag,
  Space,
  Image,
  Modal,
  Descriptions,
  Tooltip,
  Checkbox,
  Divider,
  message
} from 'antd'
import {
  SearchOutlined,
  EyeOutlined,
  HeartOutlined,
  SwapOutlined,
  FilterOutlined,
  SaveOutlined
} from '@ant-design/icons'
import { mockSeatData } from '../data/mockData'

const { Option } = Select

const materialOptions = [
  { label: 'Nappa真皮', value: 'Nappa真皮' },
  { label: '普通真皮', value: '普通真皮' },
  { label: '仿皮', value: '仿皮' },
  { label: 'PU（聚氨酯）', value: 'PU' },
  { label: 'PVC（聚氯乙烯）', value: 'PVC' },
  { label: '普通织物', value: '普通织物' },
  { label: '高级织物', value: '高级织物' },
  { label: 'Alcantara', value: 'Alcantara' },
  { label: '麂皮', value: '麂皮' },
  { label: '真皮+织物拼接', value: '真皮+织物拼接' },
  { label: '真皮+Alcantara拼接', value: '真皮+Alcantara拼接' },
  { label: '打孔皮革', value: '打孔皮革' }
]

const featureOptions = [
  { label: '电动调节', value: '电动调节' },
  { label: '记忆', value: '记忆' },
  { label: '加热', value: '加热' },
  { label: '通风', value: '通风' },
  { label: '按摩', value: '按摩' },
  { label: '腿托', value: '腿托' },
  { label: '腰托', value: '腰托' },
  { label: '可调节头枕', value: '可调节头枕' },
  { label: '方便进出', value: '方便进出' },
  { label: '座椅音响', value: '座椅音响' },
  { label: '侧气囊', value: '侧气囊' },
  { label: '远端气囊', value: '远端气囊' },
  { label: '安全带预紧器', value: '安全带预紧器' }
]

const positionOptions = [
  { label: '主驾驶席', value: '主驾驶席' },
  { label: '副驾驶席', value: '副驾驶席' },
  { label: '第二排左侧', value: '第二排左侧' },
  { label: '第二排右侧', value: '第二排右侧' },
  { label: '第二排中部', value: '第二排中部' },
  { label: '第三排左侧', value: '第三排左侧' },
  { label: '第三排右侧', value: '第三排右侧' },
  { label: '第三排中部', value: '第三排中部' }
]

const SeatLibrary = ({ compareList, addToCompare, removeFromCompare, favorites, addToFavorites, removeFromFavorites }) => {
  const [form] = Form.useForm()
  const [filteredData, setFilteredData] = useState(mockSeatData)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [savedFilters, setSavedFilters] = useState([])

  const [selectedBrand, setSelectedBrand] = useState(null)
  const [selectedSeries, setSelectedSeries] = useState(null)
  
  const brands = [...new Set(mockSeatData.map(item => item.brand))]
  const filteredSeries = selectedBrand 
    ? [...new Set(mockSeatData.filter(item => item.brand === selectedBrand).map(item => item.series))] 
    : [...new Set(mockSeatData.map(item => item.series))]
  const years = [...new Set(mockSeatData.map(item => item.year))]

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand)
    setSelectedSeries(null)
    form.setFieldsValue({ series: undefined })
  }

  const handleSeriesChange = (series) => {
    setSelectedSeries(series)
  }

  const handleSearch = () => {
    const values = form.getFieldsValue()
    let result = [...mockSeatData]

    if (values.brand) {
      result = result.filter(item => item.brand === values.brand)
    }
    if (values.series) {
      result = result.filter(item => item.series === values.series)
    }
    if (values.year) {
      result = result.filter(item => item.year === values.year)
    }
    if (values.position) {
      result = result.filter(item => item.position === values.position)
    }
    if (values.material && values.material.length > 0) {
      result = result.filter(item => values.material.includes(item.material))
    }
    if (values.features && values.features.length > 0) {
      result = result.filter(item =>
        values.features.every(feature => item.features.includes(feature))
      )
    }
    if (values.minPrice !== undefined) {
      result = result.filter(item => item.price >= values.minPrice)
    }
    if (values.maxPrice !== undefined) {
      result = result.filter(item => item.price <= values.maxPrice)
    }

    setFilteredData(result)
    message.success(`找到 ${result.length} 条匹配结果`)
  }

  const handleReset = () => {
    form.resetFields()
    setFilteredData(mockSeatData)
    setSelectedRowKeys([])
  }

  const handleViewDetail = (record) => {
    setCurrentRecord(record)
    setDetailModalVisible(true)
  }

  const handleAddToCompare = (record) => {
    const isInCompare = compareList.some(item => item.id === record.id)
    if (isInCompare) {
      removeFromCompare(record.id)
      message.info('已从对比列表移除')
    } else {
      const success = addToCompare(record)
      if (success) {
        message.success('已添加到对比列表')
      } else {
        message.warning('最多只能对比5个产品')
      }
    }
  }

  const handleSaveFilter = () => {
    const values = form.getFieldsValue()
    const filterName = prompt('请输入筛选方案名称：')
    if (filterName) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        conditions: values
      }
      setSavedFilters([...savedFilters, newFilter])
      message.success('筛选方案已保存')
    }
  }

  const handleLoadFilter = (filter) => {
    form.setFieldsValue(filter.conditions)
    handleSearch()
    message.success(`已加载筛选方案：${filter.name}`)
  }

  const handleToggleFavorite = (record) => {
    const isInFavorites = favorites.some(item => item.id === record.id)
    if (isInFavorites) {
      removeFromFavorites(record.id)
      message.success('已取消收藏')
    } else {
      const success = addToFavorites(record)
      if (success) {
        message.success('已添加到收藏夹')
      }
    }
  }

  const columns = [
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
      fixed: 'left'
    },
    {
      title: '车系',
      dataIndex: 'series',
      key: 'series',
      width: 100
    },
    {
      title: '年款',
      dataIndex: 'year',
      key: 'year',
      width: 80
    },
    {
      title: '配置型号',
      dataIndex: 'model',
      key: 'model',
      width: 150
    },
    {
      title: '座椅位置',
      dataIndex: 'position',
      key: 'position',
      width: 100
    },
    {
      title: '材质',
      dataIndex: 'material',
      key: 'material',
      width: 120,
      render: (material) => {
        const colorMap = {
          'Nappa真皮': 'gold',
          '普通真皮': 'orange',
          '仿皮': 'blue',
          'Alcantara': 'purple',
          '普通织物': 'green'
        }
        return <Tag color={colorMap[material] || 'default'}>{material}</Tag>
      }
    },
    {
      title: '功能配置',
      dataIndex: 'features',
      key: 'features',
      width: 300,
      render: (features) => (
        <Space size={[4, 4]} wrap>
          {features.slice(0, 3).map(feature => (
            <Tag key={feature} size="small">{feature}</Tag>
          ))}
          {features.length > 3 && <Tag size="small">+{features.length - 3}</Tag>}
        </Space>
      )
    },
    {
      title: '价格（元）',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: (a, b) => a.price - b.price,
      render: (price) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{price.toLocaleString()}</span>
    },
    {
      title: '重量（kg）',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      sorter: (a, b) => a.weight - b.weight
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="加入对比">
            <Button
              type="link"
              icon={<SwapOutlined />}
              onClick={() => handleAddToCompare(record)}
            />
          </Tooltip>
          <Tooltip title={favorites.some(item => item.id === record.id) ? "取消收藏" : "收藏"}>
              <Button
                type="link"
                icon={<HeartOutlined />}
                onClick={() => handleToggleFavorite(record)}
                style={{ color: favorites.some(item => item.id === record.id) ? '#f5222d' : '' }}
              />
            </Tooltip>
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys)
  }

  return (
    <div>
      <Card
        title="座椅配置库"
        extra={
          <Space>
            <Button icon={<SaveOutlined />} onClick={handleSaveFilter}>
              保存筛选
            </Button>
            <Button icon={<FilterOutlined />} onClick={handleReset}>
              重置筛选
            </Button>
          </Space>
        }
      >
        {savedFilters.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 8 }}>已保存的筛选方案：</span>
            <Space wrap>
              {savedFilters.map(filter => (
                <Tag
                  key={filter.id}
                  closable
                  onClose={() => setSavedFilters(savedFilters.filter(f => f.id !== filter.id))}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleLoadFilter(filter)}
                >
                  {filter.name}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="品牌" name="brand">
                <Select 
                  placeholder="请选择品牌" 
                  allowClear
                  onChange={handleBrandChange}
                >
                  {brands.map(brand => (
                    <Option key={brand} value={brand}>{brand}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="车系" name="series">
                <Select 
                  placeholder="请选择车系" 
                  allowClear
                  onChange={handleSeriesChange}
                >
                  {filteredSeries.map(s => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="年款" name="year">
                <Select placeholder="请选择年款" allowClear>
                  {years.map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="座椅位置" name="position">
                <Select placeholder="请选择座椅位置" allowClear>
                  {positionOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="材质类型" name="material">
                <Select mode="multiple" placeholder="请选择材质类型" allowClear>
                  {materialOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="功能配置" name="features">
                <Select mode="multiple" placeholder="请选择功能配置" allowClear>
                  {featureOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="最低价格" name="minPrice">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="最低价格"
                  min={0}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="最高价格" name="maxPrice">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="最高价格"
                  min={0}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label=" ">
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                    查询
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <Space>
            <span>已选择 {selectedRowKeys.length} 项</span>
            <Button
              type="primary"
              size="small"
              disabled={selectedRowKeys.length === 0}
              onClick={() => message.success('跳转到对比页面')}
            >
              开始对比
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          rowSelection={rowSelection}
          scroll={{ x: 1500 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      <Modal
        title="座椅详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentRecord && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Image
                  src={currentRecord.image}
                  alt={currentRecord.series}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Col>
              <Col span={12}>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="品牌">{currentRecord.brand}</Descriptions.Item>
                  <Descriptions.Item label="车系">{currentRecord.series}</Descriptions.Item>
                  <Descriptions.Item label="年款">{currentRecord.year}</Descriptions.Item>
                  <Descriptions.Item label="配置型号">{currentRecord.model}</Descriptions.Item>
                  <Descriptions.Item label="座椅位置">{currentRecord.position}</Descriptions.Item>
                  <Descriptions.Item label="材质">
                    <Tag color="gold">{currentRecord.material}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="价格">
                    <span style={{ color: '#f5222d', fontWeight: 'bold', fontSize: 18 }}>
                      ¥{currentRecord.price.toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="重量">{currentRecord.weight} kg</Descriptions.Item>
                  <Descriptions.Item label="包装尺寸">
                    {currentRecord.dimensions.length} × {currentRecord.dimensions.width} × {currentRecord.dimensions.height} cm
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
            <Divider />
            <div>
              <h4>功能配置</h4>
              <Space size={[8, 8]} wrap style={{ marginTop: 8 }}>
                {currentRecord.features.map(feature => (
                  <Tag key={feature} color="blue">{feature}</Tag>
                ))}
              </Space>
            </div>
            <Divider />
            <div>
              <h4>产品描述</h4>
              <p style={{ marginTop: 8 }}>{currentRecord.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SeatLibrary
