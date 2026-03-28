import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, Tag, Divider, Form, Input, Select, DatePicker, Space, message, Row, Col } from 'antd';
import { ArrowLeftOutlined, UserOutlined, PhoneOutlined, ContactsOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface UserProfile {
  id: number;
  username: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  // 基本信息
  gender: string;
  birthDate: string;
  // 紧急联系人
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

// 模拟数据
const mockUserProfiles: Record<number, UserProfile> = {
  1: {
    id: 1,
    username: '张三',
    phone: '13800138001',
    role: 'user',
    createdAt: '2026-03-01T10:00:00',
    updatedAt: '2026-03-15T14:30:00',
    gender: '男',
    birthDate: '1985-06-15',
    emergencyName: '李美玲',
    emergencyRelation: '配偶',
    emergencyPhone: '13900139001',
  },
  2: {
    id: 2,
    username: '李四',
    phone: '13800138002',
    role: 'user',
    createdAt: '2026-03-02T14:30:00',
    updatedAt: '2026-03-10T09:00:00',
    gender: '女',
    birthDate: '1990-03-22',
    emergencyName: '李父',
    emergencyRelation: '父母',
    emergencyPhone: '13900139002',
  },
  3: {
    id: 3,
    username: '管理员',
    phone: '13800138000',
    role: 'admin',
    createdAt: '2026-01-01T09:00:00',
    updatedAt: '2026-01-01T09:00:00',
    gender: '男',
    birthDate: '1980-01-01',
    emergencyName: '未设置',
    emergencyRelation: '其他',
    emergencyPhone: '未设置',
  },
  4: {
    id: 4,
    username: '王五',
    phone: '13800138003',
    role: 'user',
    createdAt: '2026-03-05T16:45:00',
    updatedAt: '2026-03-20T11:00:00',
    gender: '男',
    birthDate: '1978-11-08',
    emergencyName: '王母',
    emergencyRelation: '父母',
    emergencyPhone: '13900139003',
  },
  5: {
    id: 5,
    username: '赵六',
    phone: '13800138004',
    role: 'user',
    createdAt: '2026-03-10T11:20:00',
    updatedAt: '2026-03-18T16:00:00',
    gender: '女',
    birthDate: '1992-07-30',
    emergencyName: '赵配偶',
    emergencyRelation: '配偶',
    emergencyPhone: '13900139004',
  },
};

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 模拟获取用户详情
    setTimeout(() => {
      const userId = parseInt(id!, 10);
      const userData = mockUserProfiles[userId] || null;
      setProfile(userData);
      if (userData) {
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
      setLoading(false);
    }, 500);
  }, [id, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log('保存用户信息:', values);
      message.success('保存成功');
      setIsEditing(false);
    });
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
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存</Button>
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
            <Tag color={profile.role === 'admin' ? 'gold' : 'blue'}>
              {profile.role === 'admin' ? '管理员' : '用户'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {dayjs(profile.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {dayjs(profile.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
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
                <Input prefix={<PhoneOutlined style={{ color: '#999' }} />} placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="性别" name="gender">
                <Select placeholder="请选择性别">
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
              <Tag color="red" style={{ marginLeft: 8 }}>必填</Tag>
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
                <Select placeholder="请选择关系">
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
