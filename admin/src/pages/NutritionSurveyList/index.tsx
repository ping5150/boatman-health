import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Card, Tag } from 'antd';
import { SearchOutlined, FormOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { nutritionSurveyApi, SurveyListItem } from '../../api/survey.api';

const statusMap: Record<string, { text: string; color: string }> = {
  success: { text: '已同步', color: 'green' },
  pending: { text: '待同步', color: 'blue' },
  failed: { text: '同步失败', color: 'red' },
};

const NutritionSurveyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SurveyListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await nutritionSurveyApi.getList({ page, limit, search: search || undefined });
      if (res.code === 0 && res.data) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      width: 170,
      render: (text: string) => <span style={{ fontFamily: 'monospace', color: '#13c2c2' }}>{text}</span>,
    },
    { title: '用户ID', dataIndex: 'userId', width: 140 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 170,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '同步状态',
      dataIndex: 'feishuSyncStatus',
      width: 110,
      render: (status: string) => {
        const info = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: SurveyListItem) => (
        <Button type="link" icon={<FormOutlined />} onClick={() => navigate(`/nutrition-survey/${record.id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>营养问卷</h2>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索订单编号、姓名或手机号"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>
    </div>
  );
};

export default NutritionSurveyListPage;