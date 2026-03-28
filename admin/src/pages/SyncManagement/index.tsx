import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Tabs, message, Popconfirm } from 'antd';
import { SyncOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { syncApi } from '../../api/sync.api';

interface SyncFailedItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

// 模拟数据（注释保留）
// const mockForm1Failed: SyncFailedItem[] = [
//   { id: 4, name: '赵六', phone: '13800138004', submittedAt: '2026-03-25T16:45:00', feishuSyncStatus: 'failed' },
// ];
// const mockForm2Failed: SyncFailedItem[] = [
//   { id: 6, name: '孙八', phone: '13800138006', submittedAt: '2026-03-24T11:20:00', feishuSyncStatus: 'failed' },
//   { id: 7, name: '周九', phone: '13800138007', submittedAt: '2026-03-23T09:30:00', feishuSyncStatus: 'failed' },
// ];

const SyncManagementPage: React.FC = () => {
  const [form1Failed, setForm1Failed] = useState<SyncFailedItem[]>([]);
  const [form2Failed, setForm2Failed] = useState<SyncFailedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await syncApi.getFailedList();
      if (res.code === 0 && res.data) {
        setForm1Failed(res.data.booking || []);
        setForm2Failed(res.data.archive || []);
      }
    } catch (error) {
      // 错误已在 request.ts 中处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetry = async (table: 'booking' | 'archive', recordId: number) => {
    const key = `${table}-${recordId}`;
    setRetryingIds((prev) => new Set(prev).add(key));

    try {
      const res = await syncApi.retry(table, recordId);
      if (res.code === 0) {
        message.success('同步重试成功');
        // 从列表中移除
        if (table === 'booking') {
          setForm1Failed(prev => prev.filter(item => item.id !== recordId));
        } else {
          setForm2Failed(prev => prev.filter(item => item.id !== recordId));
        }
      }
    } catch (error) {
      // 错误已在 request.ts 中处理
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const getColumns = (table: 'booking' | 'archive') => [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      width: 150,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', color: table === 'booking' ? '#1890ff' : '#722ed1' }}>
          {text}
        </span>
      ),
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
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
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
          columns={getColumns('booking')}
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
          columns={getColumns('archive')}
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
