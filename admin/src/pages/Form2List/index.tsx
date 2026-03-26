import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Tag, Button, Card } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { form2Api } from '../../api/form2.api';

interface Form2ListItem {
  id: number;
  name: string;
  customerId: string;
  phone: string;
  submittedAt: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

const Form2ListPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Form2ListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await form2Api.getList({ page, limit, search: search || undefined });
      const result = res.data!;
      setData(result.list);
      setTotal(result.total);
    } catch {
      // 错误已在拦截器中处理
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
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '客户号',
      dataIndex: 'customerId',
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
      title: '版本号',
      dataIndex: 'versionNumber',
      width: 80,
    },
    {
      title: '同步状态',
      dataIndex: 'feishuSyncStatus',
      render: syncStatusTag,
    },
    {
      title: '操作',
      width: 100,
      render: (_: unknown, record: Form2ListItem) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/form2/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>健康评估表单列表</h2>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索姓名或客户号"
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

export default Form2ListPage;
