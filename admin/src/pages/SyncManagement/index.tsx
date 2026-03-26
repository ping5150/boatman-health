import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Tabs, message, Popconfirm } from 'antd';
import { SyncOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { syncApi } from '../../api/sync.api';

interface SyncFailedItem {
  id: number;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

const SyncManagementPage: React.FC = () => {
  const [form1Failed, setForm1Failed] = useState<SyncFailedItem[]>([]);
  const [form2Failed, setForm2Failed] = useState<SyncFailedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await syncApi.getFailedList();
      const data = res.data!;
      setForm1Failed(data.form1);
      setForm2Failed(data.form2);
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetry = async (table: 'form1' | 'form2', recordId: number) => {
    const key = `${table}-${recordId}`;
    try {
      setRetryingIds((prev) => new Set(prev).add(key));
      await syncApi.retry(table, recordId);
      message.success('同步重试成功');
      // 刷新列表
      await fetchData();
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
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
      key: 'form1',
      label: `咨询表单 (${form1Failed.length})`,
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
      key: 'form2',
      label: `健康评估表单 (${form2Failed.length})`,
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
