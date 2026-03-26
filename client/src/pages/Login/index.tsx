import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import { sendCode, register, login } from '@/api/auth.api';
import { setToken, setUser } from '@/lib/auth';

type Step = 'phone' | 'code';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
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
  };

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    if (!name.trim()) {
      setError('请输入您的姓名');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 先注册（如果已注册会忽略）
      await register({ phone, name: name.trim() });
      // 发送验证码
      await sendCode({ phone });
      setStep('code');
      startCountdown();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '发送验证码失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!code || code.length < 4) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await login({ phone, code });
      setToken(res.token);
      setUser(res.user);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '登录失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendCode({ phone });
      startCountdown();
    } catch {
      setError('重新发送失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-12">
        <div className="mb-8">
          <Icon name="sailing" size={48} className="text-secondary-container mb-4" />
          <h1 className="font-headline text-4xl font-extrabold text-on-primary tracking-tight">船夫健康</h1>
          <p className="text-on-primary-container text-lg mt-2 opacity-80">您的私享医疗管家</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-surface rounded-t-[2rem] px-6 pt-10 pb-8">
        <h2 className="font-headline text-2xl font-bold text-primary mb-2">
          {step === 'phone' ? '欢迎登录' : '输入验证码'}
        </h2>
        <p className="text-on-surface-variant mb-8">
          {step === 'phone' ? '请输入手机号开始您的健康之旅' : `验证码已发送至 ${phone}`}
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container/30 text-error text-sm">{error}</div>
        )}

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入您的姓名"
                className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl text-on-surface placeholder:text-outline ghost-border focus:ghost-border-focus focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入 11 位手机号"
                className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl text-on-surface placeholder:text-outline ghost-border focus:ghost-border-focus focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full py-4 bg-secondary text-on-secondary rounded-xl font-bold text-lg shadow-cta hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? '发送中...' : '获取验证码'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">验证码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="请输入 6 位验证码"
                className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl text-on-surface placeholder:text-outline ghost-border focus:ghost-border-focus focus:outline-none transition-all text-center text-2xl tracking-[0.5em]"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 bg-secondary text-on-secondary rounded-xl font-bold text-lg shadow-cta hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className="text-secondary text-sm font-medium disabled:text-outline"
              >
                {countdown > 0 ? `${countdown}s 后重新发送` : '重新发送验证码'}
              </button>
            </div>
            <button
              onClick={() => { setStep('phone'); setCode(''); setError(''); }}
              className="w-full text-center text-on-surface-variant text-sm"
            >
              返回修改手机号
            </button>
          </div>
        )}

        <p className="text-center text-xs text-outline mt-8">开发环境验证码：123456</p>
      </div>
    </div>
  );
};

export default Login;
