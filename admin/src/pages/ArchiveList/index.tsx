import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Tag, Button, Card } from 'antd';
import { SearchOutlined, FormOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { form2Api } from '../../api/form2.api';

interface ArchiveListItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

// 模拟数据（注释保留）
// const mockData: ArchiveListItem[] = [
//   { id: 1, orderNo: 'HA20260328001', name: '张三', phone: '13800138001', submittedAt: '2026-03-28T10:00:00', updatedAt: '2026-03-28T10:00:00', submittedBy: '张三', versionNumber: 1, feishuSyncStatus: 'success' },
//   { id: 2, orderNo: 'HA20260327002', name: '李四', phone: '13800138002', submittedAt: '2026-03-27T14:30:00', updatedAt: '2026-03-28T11:00:00', submittedBy: '李四', versionNumber: 1, feishuSyncStatus: 'success' },
//   { id: 3, orderNo: 'HA20260326003', name: '王五', phone: '13800138003', submittedAt: '2026-03-26T09:15:00', updatedAt: '2026-03-27T16:00:00', submittedBy: '王五', versionNumber: 2, feishuSyncStatus: 'pending' },
//   { id: 4, orderNo: 'HA20260325004', name: '赵六', phone: '13800138004', submittedAt: '2026-03-25T16:45:00', updatedAt: '2026-03-25T16:45:00', submittedBy: '赵六', versionNumber: 1, feishuSyncStatus: 'failed' },
//   { id: 5, orderNo: 'HA20260324005', name: '钱七', phone: '13800138005', submittedAt: '2026-03-24T11:20:00', updatedAt: '2026-03-25T10:00:00', submittedBy: '钱七', versionNumber: 1, feishuSyncStatus: 'success' },
// ];

const ArchiveListPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ArchiveListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await form2Api.getList({ page, limit, search: search || undefined });
      if (res.code === 0 && res.data) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      // 错误已在 request.ts 中处理
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 搜索防抖
  let searchTimer: ReturnType<typeof setTimeout>;
  const handleSearch = (value: string) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  const syncStatusTag = (status: string) => {
    const colorMap: Record<string, string> = {
      success: 'green',
      pending: 'blue',
      failed: 'red',
    };
    const textMap: Record<string, string> = {
      success: '已同步',
      pending: '同步中',
      failed: '同步失败',
    };
    return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      width: 150,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', color: '#722ed1' }}>{text}</span>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 170,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '提交人',
      dataIndex: 'submittedBy',
      width: 100,
    },
    {
      title: '版本号',
      dataIndex: 'versionNumber',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '同步状态',
      dataIndex: 'feishuSyncStatus',
      width: 100,
      render: syncStatusTag,
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: ArchiveListItem) => (
        <Button
          type="link"
          icon={<FormOutlined />}
          onClick={() => navigate(`/archive/${record.id}`)}
        >
          查看/修改
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>档案管理</h2>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索订单编号、姓名或手机号"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>
    </div>
  );
};

export default ArchiveListPage;
