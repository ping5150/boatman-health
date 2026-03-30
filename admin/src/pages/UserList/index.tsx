import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Input, Tag, Space, Typography, Button, Modal, Checkbox, message, Select } from 'antd';
import { UserOutlined, SearchOutlined, FormOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { userApi, UserItem, UserRole, roleNames, roleColors } from '../../api/user.api';
import { useAuth } from '../../hooks/useAuth';

const { Title } = Typography;

// 所有可选的角色
const allRoles: UserRole[] = ['user', 'salesman', 'admin'];

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
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  
  // 角色编辑弹窗状态
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleUpdating, setRoleUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getList({ 
        page, 
        limit: pageSize, 
        search: search || undefined,
        role: roleFilter,
      });
      if (res.code === 0 && res.data) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      // 错误已在 request.ts 中处理
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 解析角色字符串为数组
  const parseRoles = (roleString: string): string[] => {
    return roleString.split(',').map(r => r.trim()).filter(Boolean);
  };

  // 渲染角色标签
  const renderRoleTags = (roleString: string) => {
    const roles = parseRoles(roleString);
    return (
      <Space size={4} wrap>
        {roles.map((role) => (
          <Tag key={role} color={roleColors[role as UserRole] || 'default'}>
            {roleNames[role as UserRole] || role}
          </Tag>
        ))}
      </Space>
    );
  };

  // 打开角色编辑弹窗
  const handleEditRoles = (user: UserItem) => {
    setEditingUser(user);
    setSelectedRoles(parseRoles(user.role));
    setRoleModalVisible(true);
  };

  // 保存角色
  const handleSaveRoles = async () => {
    if (!editingUser) return;
    
    if (selectedRoles.length === 0) {
      message.warning('请至少选择一个角色');
      return;
    }

    setRoleUpdating(true);
    try {
      const res = await userApi.update(editingUser.id, {
        role: selectedRoles.join(','),
      });
      
      if (res.code === 0) {
        message.success('角色更新成功');
        setRoleModalVisible(false);
        fetchData();
      }
    } catch (error) {
      // 错误已在 request.ts 中处理
    } finally {
      setRoleUpdating(false);
    }
  };

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
      width: 180,
      render: (role: string) => renderRoleTags(role),
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
      width: isAdmin ? 180 : 100,
      render: (_: unknown, record: UserItem) => (
        <Space>
          <Button
            type="link"
            icon={<FormOutlined />}
            onClick={() => navigate(`/users/${record.id}`)}
          >
            查看
          </Button>
          {isAdmin && (
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => handleEditRoles(record)}
            >
              角色
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>用户管理</Title>
        <Space>
          <Select
            placeholder="角色筛选"
            allowClear
            style={{ width: 140 }}
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            options={[
              { value: 'user', label: <Tag color="blue">用户</Tag> },
              { value: 'salesman', label: <Tag color="green">业务员</Tag> },
              { value: 'admin', label: <Tag color="gold">管理员</Tag> },
            ]}
          />
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
        </Space>
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

      {/* 角色编辑弹窗 */}
      <Modal
        title={`编辑用户角色 - ${editingUser?.username || ''}`}
        open={roleModalVisible}
        onOk={handleSaveRoles}
        onCancel={() => setRoleModalVisible(false)}
        confirmLoading={roleUpdating}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#666', marginBottom: 8 }}>
            选择用户的角色（可多选）：
          </p>
          <Checkbox.Group
            value={selectedRoles}
            onChange={(values) => setSelectedRoles(values as string[])}
          >
            <Space vertical>
              {allRoles.map((role) => (
                <Checkbox key={role} value={role}>
                  <Tag color={roleColors[role]}>{roleNames[role]}</Tag>
                  {role === 'user' && <span style={{ color: '#999', marginLeft: 8 }}>基本用户角色</span>}
                  {role === 'salesman' && <span style={{ color: '#999', marginLeft: 8 }}>可登录管理后台</span>}
                  {role === 'admin' && <span style={{ color: '#999', marginLeft: 8 }}>管理员权限，可登录管理后台</span>}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>
        <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
            <strong>提示：</strong>纯"用户"角色无法登录管理后台。只有拥有"业务员"或"管理员"角色的用户才能登录管理后台。
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default UserListPage;
