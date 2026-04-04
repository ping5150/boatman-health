import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, Tag, Divider, Form, Input, Select, DatePicker, Space, message, Row, Col } from 'antd';
import { roleNames, roleColors, UserRole } from '../../api/user.api';
import { ArrowLeftOutlined, UserOutlined, PhoneOutlined, ContactsOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { userApi, UserDetail } from '../../api/user.api';

// 模拟数据（注释保留）
// const mockUserProfiles: Record<number, UserProfile> = {
//   1: {
//     id: 1,
//     username: '张三',
//     phone: '13800138001',
//     role: 'user',
//     createdAt: '2026-03-01T10:00:00',
//     updatedAt: '2026-03-15T14:30:00',
//     gender: '男',
//     birthDate: '1985-06-15',
//     emergencyName: '李美玲',
//     emergencyRelation: '配偶',
//     emergencyPhone: '13900139001',
//   },
//   ...
// };

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const res = await userApi.getDetail(id);
        if (res.code === 0 && res.data) {
          const userData = res.data;
          setProfile(userData);
          form.setFieldsValue({
            username: userData.username,
            phone: userData.phone,
            gender: userData.gender,
            birthDate: userData.birthDate ? dayjs(userData.birthDate) : null,
            emergencyName: userData.emergencyName,
            emergencyRelation: userData.emergencyRelation,
            emergencyPhone: userData.emergencyPhone,
          });
        }
      } catch (error) {
        // 错误已在 request.ts 中处理
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const updateData = {
        username: values.username,
        gender: values.gender,
        birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : undefined,
        emergencyName: values.emergencyName,
        emergencyRelation: values.emergencyRelation,
        emergencyPhone: values.emergencyPhone,
      };

      const res = await userApi.update(id!, updateData);
      
      if (res.code === 0) {
        message.success('保存成功');
        setIsEditing(false);
        // 更新本地数据
        if (res.data) {
          setProfile(res.data);
        }
      }
    } catch (error) {
      // 错误已在 request.ts 中处理
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return <div>用户不存在</div>;
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/users')}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回用户列表
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>用户详情</h2>
        {isEditing ? (
          <Space>
            <Button onClick={() => { setIsEditing(false); form.resetFields(); }}>取消</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>保存</Button>
          </Space>
        ) : (
          <Button type="primary" onClick={() => setIsEditing(true)}>编辑</Button>
        )}
      </div>

      {/* 用户基本信息 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span>账户信息</span>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="用户ID">{profile.id}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Space size={4} wrap>
              {profile.role.split(',').map(r => r.trim()).filter(Boolean).map(r => (
                <Tag key={r} color={roleColors[r as UserRole] || 'default'}>
                  {roleNames[r as UserRole] || r}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {profile.createdAt ? dayjs(profile.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {profile.updatedAt ? dayjs(profile.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Form form={form} layout="vertical" disabled={!isEditing}>
        {/* 身份详情 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserOutlined style={{ color: '#722ed1' }} />
              <span>身份详情</span>
            </div>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="姓名" name="username">
                <Input prefix={<UserOutlined style={{ color: '#999' }} />} placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="联系电话" name="phone">
                <Input prefix={<PhoneOutlined style={{ color: '#999' }} />} placeholder="请输入联系电话" disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="性别" name="gender">
                <Select placeholder="请选择性别" allowClear>
                  <Select.Option value="男">男</Select.Option>
                  <Select.Option value="女">女</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="出生日期" name="birthDate">
                <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 紧急联系人 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ContactsOutlined style={{ color: '#ff4d4f' }} />
              <span>紧急联系人</span>
            </div>
          }
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="姓名" name="emergencyName">
                <Input placeholder="请输入紧急联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="关系" name="emergencyRelation">
                <Select placeholder="请选择关系" allowClear>
                  <Select.Option value="配偶">配偶</Select.Option>
                  <Select.Option value="父母">父母</Select.Option>
                  <Select.Option value="子女">子女</Select.Option>
                  <Select.Option value="兄弟姐妹">兄弟姐妹</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="联系电话" name="emergencyPhone">
                <Input prefix={<PhoneOutlined style={{ color: '#999' }} />} placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>

      <Divider />
      
      <p style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
        用户信息已加密并安全存储
      </p>
    </div>
  );
};

export default UserDetailPage;
