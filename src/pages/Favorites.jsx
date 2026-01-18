import React, { useState } from 'react'
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Image,
  Descriptions,
  Modal,
  message,
  Empty,
  Tooltip
} from 'antd'
import {
  HeartOutlined,
  EyeOutlined,
  DeleteOutlined,
  SwapOutlined
} from '@ant-design/icons'
import { mockSeatData } from '../data/mockData'

const Favorites = () => {
  const [favorites, setFavorites] = useState([
    mockSeatData[0],
    mockSeatData[2],
    mockSeatData[4]
  ])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)

  const handleViewDetail = (record) => {
    setCurrentRecord(record)
    setDetailModalVisible(true)
  }

  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter(item => item.id !== id))
    message.success('已从收藏夹移除')
  }

  const handleAddToCompare = (record) => {
    message.success(`已将 ${record.brand} ${record.series} 添加到对比列表`)
  }

  return (
    <div>
      <Card
        title="我的收藏"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<SwapOutlined />}
              disabled={favorites.length === 0}
              onClick={() => message.success('跳转到对比页面')}
            >
              批量对比
            </Button>
          </Space>
        }
      >
        {favorites.length === 0 ? (
          <Empty
            description="暂无收藏内容"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
            dataSource={favorites}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 150, overflow: 'hidden' }}>
                      <Image
                        src={item.image}
                        alt={item.series}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  }
                  actions={[
                    <Tooltip title="查看详情">
                      <EyeOutlined
                        key="detail"
                        onClick={() => handleViewDetail(item)}
                      />
                    </Tooltip>,
                    <Tooltip title="加入对比">
                      <SwapOutlined
                        key="compare"
                        onClick={() => handleAddToCompare(item)}
                      />
                    </Tooltip>,
                    <Tooltip title="取消收藏">
                      <DeleteOutlined
                        key="delete"
                        onClick={() => handleRemoveFavorite(item.id)}
                      />
                    </Tooltip>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div>
                        {item.brand} {item.series}
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {item.year}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <Tag color="gold">{item.material}</Tag>
                          <Tag>{item.position}</Tag>
                        </div>
                        <div style={{ fontSize: 16, color: '#f5222d', fontWeight: 'bold' }}>
                          ¥{item.price.toLocaleString()}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
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
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Favorites
