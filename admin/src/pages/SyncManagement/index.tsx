import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Tag, message, Popconfirm, Modal, List, Typography } from 'antd';
import { SyncOutlined, ReloadOutlined, UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { syncApi } from '../../api/sync.api';

interface SyncStats {
  user: { total: number; success: number; failed: number; pending: number };
  booking: { total: number; success: number; failed: number; pending: number };
  archive: { total: number; success: number; failed: number; pending: number };
}

interface SyncFailedUserItem {
  id: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

interface SyncFailedItem {
  id: number;
  orderNo?: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

interface SyncFailedList {
  user: SyncFailedUserItem[];
  booking: SyncFailedItem[];
  archive: SyncFailedItem[];
}

interface SyncResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

const SyncManagementPage: React.FC = () => {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [failedList, setFailedList] = useState<SyncFailedList>({ user: [], booking: [], archive: [] });
  const [loading, setLoading] = useState(false);
  const [syncingType, setSyncingType] = useState<string | null>(null);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [resultModal, setResultModal] = useState<{ visible: boolean; title: string; result: SyncResult | null }>({
    visible: false,
    title: '',
    result: null,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, failedRes] = await Promise.all([
        syncApi.getStats(),
        syncApi.getFailedList(),
      ]);
      if (statsRes.code === 0 && statsRes.data) {
        setStats(statsRes.data);
      }
      if (failedRes.code === 0 && failedRes.data) {
        setFailedList(failedRes.data);
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

  const handleSyncAll = async (type: 'user' | 'booking' | 'archive') => {
    setSyncingType(type);
    try {
      let res;
      let title = '';
      if (type === 'user') {
        res = await syncApi.syncAllUsers();
        title = '用户同步结果';
      } else if (type === 'booking') {
        res = await syncApi.syncAllBookings();
        title = '预约同步结果';
      } else {
        res = await syncApi.syncAllArchives();
        title = '档案同步结果';
      }

      if (res.code === 0 && res.data) {
        setResultModal({ visible: true, title, result: res.data });
        fetchData();
      }
    } catch (error) {
      // 错误已在 request.ts 中处理
    } finally {
      setSyncingType(null);
    }
  };

  const handleRetry = async (table: 'user' | 'booking' | 'archive', recordId: string | number) => {
    const key = `${table}-${recordId}`;
    setRetryingIds((prev) => new Set(prev).add(key));

    try {
      const res = await syncApi.retry(table, recordId);
      if (res.code === 0) {
        message.success('同步重试成功');
        // 从列表中移除
        if (table === 'user') {
          setFailedList(prev => ({ ...prev, user: prev.user.filter(item => item.id !== recordId) }));
        } else if (table === 'booking') {
          setFailedList(prev => ({ ...prev, booking: prev.booking.filter(item => item.id !== recordId) }));
        } else {
          setFailedList(prev => ({ ...prev, archive: prev.archive.filter(item => item.id !== recordId) }));
        }
        fetchData();
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

  const getColumns = (table: 'user' | 'booking' | 'archive') => {
    const columns: object[] = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 70,
      },
    ];

    if (table !== 'user') {
      columns.push({
        title: '订单编号',
        dataIndex: 'orderNo',
        width: 150,
        render: (text: string) => (
          <span style={{ fontFamily: 'monospace', color: table === 'booking' ? '#1890ff' : '#722ed1' }}>
            {text}
          </span>
        ),
      });
    }

    return [
      ...columns,
      {
        title: table === 'user' ? '用户名' : '姓名',
        dataIndex: 'name',
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
      },
      {
        title: table === 'user' ? '注册时间' : '提交时间',
        dataIndex: 'submittedAt',
        render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      // {
      //   title: '同步状态',
      //   dataIndex: 'feishuSyncStatus',
      //   render: () => <Tag color="red">同步失败</Tag>,
      // },
      {
        title: '操作',
        width: 120,
        render: (_: unknown, record: SyncFailedUserItem | SyncFailedItem) => {
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
                重试
              </Button>
            </Popconfirm>
          );
        },
      },
    ];
  };

  const renderSyncCard = (
    title: string,
    icon: React.ReactNode,
    type: 'user' | 'booking' | 'archive',
    color: string,
    statsData: { total: number; success: number; failed: number; pending: number } | undefined,
    failedItems: (SyncFailedUserItem | SyncFailedItem)[]
  ) => (
    <Card
      title={
        <span>
          {icon} {title}
        </span>
      }
      extra={
        <Popconfirm
          title="确认一键同步所有待同步数据？"
          onConfirm={() => handleSyncAll(type)}
        >
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={syncingType === type}
            disabled={!statsData || statsData.pending + statsData.failed === 0}
          >
            一键同步
          </Button>
        </Popconfirm>
      }
      style={{ marginBottom: 24 }}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic title="总计" value={statsData?.total || 0} valueStyle={{ color }} />
        </Col>
        <Col span={6}>
          <Statistic title="已同步" value={statsData?.success || 0} valueStyle={{ color: '#52c41a' }} />
        </Col>
        <Col span={6}>
          <Statistic title="待同步" value={statsData?.pending || 0} valueStyle={{ color: '#faad14' }} />
        </Col>
        <Col span={6}>
          <Statistic title="失败" value={statsData?.failed || 0} valueStyle={{ color: '#ff4d4f' }} />
        </Col>
      </Row>
      {failedItems.length > 0 && (
        <div>
          <Typography.Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
            失败记录：
          </Typography.Text>
          <Table
            columns={getColumns(type)}
            dataSource={failedItems}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 600 }}
          />
        </div>
      )}
    </Card>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>飞书同步管理</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
          刷新
        </Button>
      </div>

      {renderSyncCard(
        '用户同步',
        <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />,
        'user',
        '#1890ff',
        stats?.user,
        failedList.user
      )}

      {renderSyncCard(
        '预约同步',
        <CalendarOutlined style={{ color: '#52c41a', marginRight: 8 }} />,
        'booking',
        '#52c41a',
        stats?.booking,
        failedList.booking
      )}

      {renderSyncCard(
        '档案同步',
        <FileTextOutlined style={{ color: '#722ed1', marginRight: 8 }} />,
        'archive',
        '#722ed1',
        stats?.archive,
        failedList.archive
      )}

      <Modal
        title={resultModal.title}
        open={resultModal.visible}
        onCancel={() => setResultModal({ visible: false, title: '', result: null })}
        footer={[
          <Button key="ok" type="primary" onClick={() => setResultModal({ visible: false, title: '', result: null })}>
            确定
          </Button>,
        ]}
      >
        {resultModal.result && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic title="总计" value={resultModal.result.total} />
              </Col>
              <Col span={6}>
                <Statistic title="成功" value={resultModal.result.success} valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={6}>
                <Statistic title="失败" value={resultModal.result.failed} valueStyle={{ color: '#ff4d4f' }} />
              </Col>
            </Row>
            {resultModal.result.errors.length > 0 && (
              <>
                <Typography.Text type="danger">失败详情：</Typography.Text>
                <List
                  size="small"
                  dataSource={resultModal.result.errors}
                  renderItem={(item) => (
                    <List.Item style={{ color: '#ff4d4f', fontSize: 12 }}>{item}</List.Item>
                  )}
                  style={{ maxHeight: 200, overflow: 'auto' }}
                />
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default SyncManagementPage;
