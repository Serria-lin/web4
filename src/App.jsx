import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Badge, Space } from 'antd'
import {
  CarOutlined,
  CalculatorOutlined,
  BarChartOutlined,
  DashboardOutlined,
  HeartOutlined,
  SwapOutlined,
  HistoryOutlined,
  UserOutlined,
  BellOutlined
} from '@ant-design/icons'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SeatLibrary from './pages/SeatLibrary'
import LogisticsCalculator from './pages/LogisticsCalculator'
import CompetitorAnalysis from './pages/CompetitorAnalysis'
import Favorites from './pages/Favorites'
import Compare from './pages/Compare'
import History from './pages/History'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: <Link to="/dashboard">工作台</Link>
  },
  {
    key: '/seat-library',
    icon: <CarOutlined />,
    label: <Link to="/seat-library">座椅配置库</Link>
  },
  {
    key: '/logistics',
    icon: <CalculatorOutlined />,
    label: <Link to="/logistics">物流计算器</Link>
  },
  {
    key: '/analysis',
    icon: <BarChartOutlined />,
    label: <Link to="/analysis">竞品分析</Link>
  },
  {
    key: '/favorites',
    icon: <HeartOutlined />,
    label: <Link to="/favorites">收藏夹</Link>
  },
  {
    key: '/compare',
    icon: <SwapOutlined />,
    label: <Link to="/compare">对比列表</Link>
  },
  {
    key: '/history',
    icon: <HistoryOutlined />,
    label: <Link to="/history">分析记录</Link>
  }
]

const userMenuItems = [
  {
    key: 'profile',
    label: '个人信息',
    icon: <UserOutlined />
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: <UserOutlined />
  },
  {
    type: 'divider'
  },
  {
    key: 'logout',
    label: '退出登录',
    icon: <UserOutlined />
  }
]

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [favorites, setFavorites] = useState([])
  const location = useLocation()

  const addToCompare = (item) => {
    if (compareList.length >= 5) {
      return false
    }
    if (!compareList.some(compareItem => compareItem.id === item.id)) {
      setCompareList([...compareList, item])
      return true
    }
    return false
  }

  const removeFromCompare = (id) => {
    setCompareList(compareList.filter(item => item.id !== id))
  }

  const clearCompare = () => {
    setCompareList([])
  }

  const addToFavorites = (item) => {
    if (!favorites.some(favItem => favItem.id === item.id)) {
      setFavorites([...favorites, item])
      return true
    }
    return false
  }

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(item => item.id !== id))
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#002140',
          color: '#fff',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'SI' : 'SeatIQ'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header>
          <div className="logo">
            <CarOutlined />
            SeatIQ - 新能源汽车座椅备件智能定价与分析平台
          </div>
          <Space>
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>
        <Content>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route 
              path="/seat-library" 
              element={
                <SeatLibrary 
                  compareList={compareList}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  favorites={favorites}
                  addToFavorites={addToFavorites}
                  removeFromFavorites={removeFromFavorites}
                />
              } 
            />
            <Route path="/logistics" element={<LogisticsCalculator />} />
            <Route path="/analysis" element={<CompetitorAnalysis />} />
            <Route 
              path="/favorites" 
              element={
                <Favorites 
                  favorites={favorites}
                  removeFromFavorites={removeFromFavorites}
                  addToCompare={addToCompare}
                />
              } 
            />
            <Route 
              path="/compare" 
              element={
                <Compare 
                  compareList={compareList}
                  removeFromCompare={removeFromCompare}
                  clearCompare={clearCompare}
                />
              } 
            />
            <Route path="/history" element={<History />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
