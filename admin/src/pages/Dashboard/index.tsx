import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Progress, Table, Button, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { syncApi } from '../../api/sync.api';
import { form1Api } from '../../api/form1.api';

interface StatCard {
  total: number;
  today: number;
  growthRate: number;
}

interface StatusDistribution {
  submitted: number;
  processing: number;
  completed: number;
  cancelled: number;
}

interface LatestBooking {
  id: number;
  name: string;
  phone: string;
  consultationType: string;
  feishuSyncStatus: string;
  submittedAt: string;
}

interface DashboardData {
  users: StatCard;
  bookings: StatCard;
  healthRecords: StatCard;
  statusDistribution: StatusDistribution;
  latestBookings: LatestBooking[];
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取仪表盘统计数据
        const dashboardRes = await syncApi.getDashboard();
        
        if (dashboardRes.code === 0 && dashboardRes.data) {
          const dashboard = dashboardRes.data;
          
          // 获取最新预约列表（取前5条）
          const bookingRes = await form1Api.getList({ page: 1, limit: 5 });
          
          setData({
            users: {
              total: dashboard.userTotal,
              today: dashboard.userToday,
              growthRate: dashboard.userGrowthRate,
            },
            bookings: {
              total: dashboard.bookingTotal,
              today: dashboard.bookingToday,
              growthRate: dashboard.bookingGrowthRate,
            },
            healthRecords: {
              total: dashboard.archiveTotal,
              today: dashboard.archiveToday,
              growthRate: dashboard.archiveGrowthRate,
            },
            statusDistribution: dashboard.bookingStatusDistribution,
            latestBookings: bookingRes.data?.list || [],
          });
        }
      } catch (error) {
        // 错误已在 request.ts 中处理
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 渲染统计卡片
  const renderStatCard = (
    title: string,
    icon: React.ReactNode,
    iconColor: string,
    stat: StatCard
  ) => (
    <Card hoverable style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${iconColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>{stat.total}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ color: '#999' }}>
              今日 <span style={{ color: '#333', fontWeight: 500 }}>{stat.today}</span>
            </span>
            <span style={{ color: stat.growthRate >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {stat.growthRate >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(stat.growthRate)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  // 预约状态配置
  const statusConfig: Record<string, { color: string; text: string }> = {
    submitted: { color: 'blue', text: '已提交' },
    processing: { color: 'orange', text: '处理中' },
    completed: { color: 'green', text: '已完成' },
    cancelled: { color: 'red', text: '已取消' },
  };

  // 同步状态配置
  const syncStatusConfig: Record<string, { color: string; text: string }> = {
    success: { color: 'green', text: '已同步' },
    pending: { color: 'blue', text: '同步中' },
    failed: { color: 'red', text: '同步失败' },
  };

  // 最新预约表格列配置
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 80,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 120,
    },
    {
      title: '咨询类型',
      dataIndex: 'consultationType',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'feishuSyncStatus',
      render: (status: string) => (
        <Tag color={syncStatusConfig[status]?.color || 'default'}>
          {syncStatusConfig[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 140,
      render: (text: string) => text ? new Date(text).toLocaleString('zh-CN') : '-',
    },
  ];

  const totalStatus = data
    ? data.statusDistribution.submitted +
      data.statusDistribution.processing +
      data.statusDistribution.completed +
      data.statusDistribution.cancelled
    : 0;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          {renderStatCard(
            '总用户数',
            <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
            '#1890ff',
            data.users
          )}
        </Col>
        <Col xs={24} sm={12} lg={8}>
          {renderStatCard(
            '总预约数',
            <CalendarOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
            '#722ed1',
            data.bookings
          )}
        </Col>
        <Col xs={24} sm={12} lg={8}>
          {renderStatCard(
            '健康档案数',
            <FileTextOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
            '#13c2c2',
            data.healthRecords
          )}
        </Col>
      </Row>

      {/* 预约状态分布 & 最新预约 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <Card title="预约状态分布" hoverable style={{ height: '100%' }}>
            <div style={{ marginBottom: 24 }}>
              {Object.entries(data.statusDistribution).map(([key, value]) => {
                const config = statusConfig[key];
                const percent = totalStatus > 0 ? Math.round((value / totalStatus) * 100) : 0;
                return (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>
                        <Tag color={config.color}>{config.text}</Tag>
                      </span>
                      <span style={{ color: '#666' }}>
                        {value} <span style={{ fontSize: 12, color: '#999' }}>({percent}%)</span>
                      </span>
                    </div>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor={config.color}
                      trailColor="#f0f0f0"
                      size="small"
                    />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                paddingTop: 16,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              {Object.entries(data.statusDistribution).map(([key, value]) => {
                const config = statusConfig[key];
                return (
                  <div key={key} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: config.color }}>{value}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{config.text}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title="最新预约"
            hoverable
            extra={
              <Button type="link" onClick={() => navigate('/booking')} icon={<ArrowRightOutlined />}>
                更多
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={data.latestBookings}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
