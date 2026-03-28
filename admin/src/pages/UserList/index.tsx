import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Input, Tag, Space, Typography, Button } from 'antd';
import { UserOutlined, SearchOutlined, FormOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { userApi, UserItem } from '../../api/user.api';

const { Title } = Typography;

// 模拟数据（注释保留）
// const mockData: UserItem[] = [
//   { id: 1, username: '张三', phone: '13800138001', role: 'user', createdAt: '2026-03-01T10:00:00', updatedAt: '2026-03-15T14:30:00' },
//   { id: 2, username: '李四', phone: '13800138002', role: 'user', createdAt: '2026-03-02T14:30:00', updatedAt: '2026-03-10T09:00:00' },
//   { id: 3, username: '管理员', phone: '13800138000', role: 'admin', createdAt: '2026-01-01T09:00:00', updatedAt: '2026-01-01T09:00:00' },
//   { id: 4, username: '王五', phone: '13800138003', role: 'user', createdAt: '2026-03-05T16:45:00', updatedAt: '2026-03-20T11:00:00' },
//   { id: 5, username: '赵六', phone: '13800138004', role: 'user', createdAt: '2026-03-10T11:20:00', updatedAt: '2026-03-18T16:00:00' },
// ];

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
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
      if (res.code === 0 && res.data) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      // 错误已在 request.ts 中处理
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnsType<UserItem> = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>{text || '-'}</span>
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
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
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: UserItem) => (
        <Button
          type="link"
          icon={<FormOutlined />}
          onClick={() => navigate(`/users/${record.id}`)}
        >
          查看/修改
        </Button>
      ),
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
