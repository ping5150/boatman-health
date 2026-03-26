import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { form1Api } from '../../api/form1.api';
import { form2Api } from '../../api/form2.api';

const { Text } = Typography;

const FormDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  // 判断是 form1 还是 form2
  const isForm1 = location.pathname.startsWith('/form1');
  const formType = isForm1 ? 'form1' : 'form2';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const numId = parseInt(id!, 10);
        if (isForm1) {
          const res = await form1Api.getDetail(numId);
          setDetail(res.data as unknown as Record<string, unknown>);
        } else {
          const res = await form2Api.getDetail(numId);
          setDetail(res.data as unknown as Record<string, unknown>);
        }
      } catch {
        // 错误已在拦截器中处理
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id, isForm1]);

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) {
    return <div>记录不存在</div>;
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/${formType}`)}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回列表
      </Button>

      <h2 style={{ marginBottom: 24 }}>
        {isForm1 ? '咨询表单' : '健康评估表单'} 详情 #{id}
      </h2>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="记录 ID">{detail.id as number}</Descriptions.Item>
          <Descriptions.Item label="用户 ID">{detail.userId as number}</Descriptions.Item>
          <Descriptions.Item label="版本号">{detail.versionNumber as number}</Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {dayjs(detail.submittedAt as string).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="飞书同步状态">
            {syncStatusTag(detail.feishuSyncStatus as string)}
          </Descriptions.Item>
          <Descriptions.Item label="飞书记录 ID">
            <Text copyable={!!detail.feishuRecordId}>
              {(detail.feishuRecordId as string) || '无'}
            </Text>
          </Descriptions.Item>

          {isForm1 && (
            <>
              <Descriptions.Item label="姓名">{detail.name as string}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{detail.phone as string}</Descriptions.Item>
              <Descriptions.Item label="咨询需求">
                <Tag color="blue">{detail.consultationType as string}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="首选联系时间">{detail.preferredTime as string}</Descriptions.Item>
              <Descriptions.Item label="简要说明" span={2}>{detail.brief as string}</Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      {!isForm1 && (detail.formData as Record<string, unknown>) && (
        <Card title="完整表单数据（JSON）">
          <pre
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              overflow: 'auto',
              maxHeight: 600,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {JSON.stringify(detail.formData, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default FormDetailPage;
