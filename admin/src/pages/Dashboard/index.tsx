import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import {
  FileTextOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { syncApi } from '../../api/sync.api';

interface DashboardStats {
  form1Total: number;
  form1Today: number;
  form2Total: number;
  form2Today: number;
  syncFailedTotal: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await syncApi.getDashboard();
      setStats(res.data!);
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="咨询表单 - 总提交数"
              value={stats?.form1Total ?? 0}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="咨询表单 - 今日提交"
              value={stats?.form1Today ?? 0}
              prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="健康评估表单 - 总提交数"
              value={stats?.form2Total ?? 0}
              prefix={<MedicineBoxOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="健康评估表单 - 今日提交"
              value={stats?.form2Today ?? 0}
              prefix={<CalendarOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="飞书同步失败数"
              value={stats?.syncFailedTotal ?? 0}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: stats?.syncFailedTotal ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
