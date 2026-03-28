import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Input, Tag, Space, Typography } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { userApi } from '../../api/user.api';

const { Title } = Typography;

interface UserItem {
  id: number;
  username: string;
  phone: string;
  role: string;
  createdAt: string;
  formCount: number;
}

const UserListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getList({ page, limit: pageSize, search: search || undefined });
      setData(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnsType<UserItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'}>
          {role === 'admin' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '表单提交数',
      dataIndex: 'formCount',
      key: 'formCount',
      width: 120,
      render: (count: number) => (
        <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>用户管理</Title>
        <Input
          placeholder="搜索用户名或手机号"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: 240 }}
          allowClear
        />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default UserListPage;
