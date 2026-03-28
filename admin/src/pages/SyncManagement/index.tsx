import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Tabs, message, Popconfirm } from 'antd';
import { SyncOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface SyncFailedItem {
  id: number;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

// 模拟数据
const mockForm1Failed: SyncFailedItem[] = [
  { id: 4, name: '赵六', phone: '13800138004', submittedAt: '2026-03-25T16:45:00', feishuSyncStatus: 'failed' },
];

const mockForm2Failed: SyncFailedItem[] = [
  { id: 6, name: '孙八', phone: '13800138006', submittedAt: '2026-03-24T11:20:00', feishuSyncStatus: 'failed' },
  { id: 7, name: '周九', phone: '13800138007', submittedAt: '2026-03-23T09:30:00', feishuSyncStatus: 'failed' },
];

const SyncManagementPage: React.FC = () => {
  const [form1Failed, setForm1Failed] = useState<SyncFailedItem[]>([]);
  const [form2Failed, setForm2Failed] = useState<SyncFailedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setForm1Failed(mockForm1Failed);
      setForm2Failed(mockForm2Failed);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetry = (table: 'form1' | 'form2', recordId: number) => {
    const key = `${table}-${recordId}`;
    setRetryingIds((prev) => new Set(prev).add(key));

    setTimeout(() => {
      message.success('同步重试成功');
      // 从列表中移除
      if (table === 'form1') {
        setForm1Failed(prev => prev.filter(item => item.id !== recordId));
      } else {
        setForm2Failed(prev => prev.filter(item => item.id !== recordId));
      }
      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 1000);
  };

  const getColumns = (table: 'form1' | 'form2') => [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '同步状态',
      dataIndex: 'feishuSyncStatus',
      render: () => <Tag color="red">同步失败</Tag>,
    },
    {
      title: '操作',
      width: 120,
      render: (_: unknown, record: SyncFailedItem) => {
        const key = `${table}-${record.id}`;
        return (
          <Popconfirm
            title="确认重试同步？"
            onConfirm={() => handleRetry(table, record.id)}
          >
            <Button
              type="primary"
              size="small"
              icon={<SyncOutlined />}
              loading={retryingIds.has(key)}
            >
              重试同步
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: 'booking',
      label: `预约管理 (${form1Failed.length})`,
      children: (
        <Table
          columns={getColumns('form1')}
          dataSource={form1Failed}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: '暂无同步失败的记录' }}
        />
      ),
    },
    {
      key: 'archive',
      label: `档案管理 (${form2Failed.length})`,
      children: (
        <Table
          columns={getColumns('form2')}
          dataSource={form2Failed}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: '暂无同步失败的记录' }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>飞书同步管理</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
          刷新
        </Button>
      </div>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default SyncManagementPage;
