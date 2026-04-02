import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Tag, Button, Card, message } from 'antd';
import { SearchOutlined, FormOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { form1Api } from '../../api/form1.api';

interface BookingListItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  consultationType: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

// 模拟数据（注释保留）
// const mockData: BookingListItem[] = [
//   { id: 1, orderNo: 'BH20260328001', name: '张三', phone: '13800138001', consultationType: '重疾咨询', submittedAt: '2026-03-28T10:00:00', updatedAt: '2026-03-28T10:00:00', submittedBy: '张三', versionNumber: 1, feishuSyncStatus: 'success' },
//   { id: 2, orderNo: 'BH20260327002', name: '李四', phone: '13800138002', consultationType: '慢病管理', submittedAt: '2026-03-27T14:30:00', updatedAt: '2026-03-28T09:00:00', submittedBy: '李四', versionNumber: 1, feishuSyncStatus: 'success' },
//   { id: 3, orderNo: 'BH20260326003', name: '王五', phone: '13800138003', consultationType: '健康资产规划', submittedAt: '2026-03-26T09:15:00', updatedAt: '2026-03-27T15:00:00', submittedBy: '王五', versionNumber: 2, feishuSyncStatus: 'pending' },
//   { id: 4, orderNo: 'BH20260325004', name: '赵六', phone: '13800138004', consultationType: '重疾咨询', submittedAt: '2026-03-25T16:45:00', updatedAt: '2026-03-25T16:45:00', submittedBy: '赵六', versionNumber: 1, feishuSyncStatus: 'failed' },
//   { id: 5, orderNo: 'BH20260324005', name: '钱七', phone: '13800138005', consultationType: '慢病管理', submittedAt: '2026-03-24T11:20:00', updatedAt: '2026-03-26T14:00:00', submittedBy: '钱七', versionNumber: 1, feishuSyncStatus: 'success' },
// ];

const BookingListPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BookingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await form1Api.getList({ page, limit, search: search || undefined });
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

  // 导出Excel
  const handleExport = () => {
    if (data.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }

    const exportData = data.map((item, index) => ({
      '序号': index + 1,
      '订单编号': item.orderNo,
      '姓名': item.name,
      '手机号': item.phone,
      '咨询类型': item.consultationType,
      '提交时间': item.submittedAt ? dayjs(item.submittedAt).format('YYYY-MM-DD HH:mm:ss') : '-',
      '提交人': item.submittedBy,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '预约列表');
    
    const fileName = `预约列表_${dayjs().format('YYYY-MM-DD_HHmmss')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    message.success('导出成功');
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      width: 150,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', color: '#1890ff' }}>{text}</span>
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
      title: '咨询类型',
      dataIndex: 'consultationType',
      width: 120,
      render: (text: string) => (
        <Tag color={text === '重疾咨询' ? 'red' : text === '慢病管理' ? 'blue' : 'purple'}>
          {text}
        </Tag>
      ),
    },
    {
      title: '提交人',
      dataIndex: 'submittedBy',
      width: 100,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 170,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '提交人',
      dataIndex: 'submittedBy',
      width: 100,
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: BookingListItem) => (
        <Button
          type="link"
          icon={<FormOutlined />}
          onClick={() => navigate(`/booking/${record.id}`)}
        >
          查看/修改
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>预约管理</h2>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          导出
        </Button>
      </div>
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
          scroll={{ x: 1200 }}
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

export default BookingListPage;
