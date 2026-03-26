import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../hooks/useAuth';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone || !/^\d{11}$/.test(phone)) {
        message.warning('请输入正确的手机号');
        return;
      }

      await authApi.sendCode(phone);
      message.success('验证码已发送（开发模式：123456）');
      setCodeSent(true);

      // 倒计时 60 秒
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // 错误已在拦截器中处理
    }
  };

  // 登录
  const handleLogin = async (values: { phone: string; code: string }) => {
    try {
      setLoading(true);
      const res = await authApi.login(values.phone, values.code);
      const data = res.data!;

      if (data.role !== 'admin') {
        message.error('该账号无管理员权限');
        return;
      }

      login(data.token, {
        userId: data.userId,
        phone: data.phone,
        role: data.role,
      });

      message.success('登录成功');
      navigate('/', { replace: true });
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 8 }}>管理后台</Title>
          <Typography.Text type="secondary">用户表单系统数据管理</Typography.Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^\d{11}$/, message: '手机号格式错误' },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="请输入手机号"
            />
          </Form.Item>

          <Form.Item
            name="code"
            rules={[
              { required: true, message: '请输入验证码' },
              { len: 6, message: '验证码为6位' },
            ]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder="请输入验证码"
              suffix={
                <Button
                  type="link"
                  size="small"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  style={{ padding: 0 }}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : (codeSent ? '重新发送' : '获取验证码')}
                </Button>
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: 44, borderRadius: 8 }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
