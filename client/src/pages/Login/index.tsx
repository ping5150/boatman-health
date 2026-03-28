import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import { useUser } from '@/contexts/UserContext';
import { checkUser, passwordLogin, register } from '@/api/auth.api';
import { setToken, setUser } from '@/lib/auth';

type Step = 'phone' | 'login' | 'register';

const Login = () => {
  const navigate = useNavigate();
  const { login: setUserContext } = useUser();

  // 当前步骤
  const [step, setStep] = useState<Step>('phone');
  // 是否为老用户
  const [isExistingUser, setIsExistingUser] = useState(false);
  // 已有用户名（老用户）
  const [existingUsername, setExistingUsername] = useState<string>('');

  // 表单状态
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  // 加载状态
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 检查手机号，判断新老用户
  const handleCheckPhone = async () => {
    if (!formData.phone || !/^\d{11}$/.test(formData.phone)) {
      alert('请输入正确的11位手机号');
      return;
    }

    setChecking(true);
    try {
      const res = await checkUser({ phone: formData.phone });
      if (res.data.exists) {
        // 老用户 -> 显示密码登录
        setIsExistingUser(true);
        setExistingUsername(res.data.username || '用户');
        setStep('login');
      } else {
        // 新用户 -> 显示注册表单
        setIsExistingUser(false);
        setStep('register');
      }
    } catch {
      alert('检查用户失败，请重试');
    } finally {
      setChecking(false);
    }
  };

  // 老用户密码登录
  const handlePasswordLogin = async () => {
    if (!formData.password) {
      alert('请输入密码');
      return;
    }
    if (formData.password.length < 6) {
      alert('密码长度不能少于6位');
      return;
    }

    setLoading(true);
    try {
      const res = await passwordLogin({
        phone: formData.phone,
        password: formData.password,
      });
      // 保存 token 和用户信息
      setToken(res.token);
      setUser(res.user);
      setUserContext(res.user);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 新用户注册
  const handleRegister = async () => {
    if (!formData.username) {
      alert('请输入用户名');
      return;
    }
    if (formData.username.length < 2) {
      alert('用户名长度不能少于2位');
      return;
    }
    if (!formData.password) {
      alert('请输入密码');
      return;
    }
    if (formData.password.length < 6) {
      alert('密码长度不能少于6位');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        phone: formData.phone,
        username: formData.username,
        password: formData.password,
      });
      // 注册成功后自动登录
      setToken(res.token);
      setUser(res.user);
      setUserContext(res.user);
      alert('注册成功！');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 返回上一步
  const handleBack = () => {
    if (step === 'login' || step === 'register') {
      setStep('phone');
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
        username: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-surface to-surface-container-low relative">
      <TopBar showBack={step !== 'phone'} showAccount={false} onBack={handleBack} transparent />

      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-8 -mt-16">
        {/* Logo and Title */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-3">
            <img src="/logo.png" alt="船夫健康Logo" className="h-16 w-auto drop-shadow-sm" />
          </div>
          <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight">船夫健康</h1>
          <p className="text-on-surface-variant text-sm mt-1">您的专属私人健康管家</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] w-full max-w-sm border border-white/50">
          {/* Step 1: 输入手机号 */}
          {step === 'phone' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-medium text-on-surface-variant ml-1">手机号</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">phone_iphone</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none"
                    placeholder="请输入11位手机号"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-on-surface-variant/50 ml-1">新用户首次登录需注册</p>
              </div>

              <button
                onClick={handleCheckPhone}
                disabled={checking || !formData.phone || formData.phone.length !== 11}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
              >
                {checking ? '验证中...' : '下一步'}
              </button>
            </div>
          )}

          {/* Step 2a: 老用户登录 */}
          {step === 'login' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-2xl text-primary">person</span>
                </div>
                <h2 className="text-lg font-bold text-on-surface">欢迎回来</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {formData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                  {existingUsername && <span className="text-secondary ml-2">· {existingUsername}</span>}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-on-surface-variant ml-1">密码</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">lock</span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none"
                    placeholder="请输入密码"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button className="text-xs text-secondary hover:text-secondary/80 transition-colors">忘记密码？</button>
              </div>

              <button
                onClick={handlePasswordLogin}
                disabled={loading || !formData.password}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
              >
                {loading ? '登录中...' : '立即登录'}
              </button>
            </div>
          )}

          {/* Step 2b: 新用户注册 */}
          {step === 'register' && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              <div className="text-center mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-2xl text-secondary">person_add</span>
                </div>
                <h2 className="text-lg font-bold text-on-surface">新用户注册</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {formData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface-variant ml-1">用户名</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">person</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none"
                    placeholder="2-20位字符"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface-variant ml-1">密码</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">lock</span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none"
                    placeholder="至少6位字符"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface-variant ml-1">确认密码</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">lock</span>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none"
                    placeholder="再次输入密码"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100 mt-2"
              >
                {loading ? '注册中...' : '注册并登录'}
              </button>
            </div>
          )}
        </div>

        {/* Privacy Policy - Fixed at bottom */}
        <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-on-surface-variant/50 px-6">
          登录即表示同意
          <a href="#" className="text-secondary/80 hover:text-secondary transition-colors">服务条款</a>
          <span className="mx-1">和</span>
          <a href="#" className="text-secondary/80 hover:text-secondary transition-colors">隐私政策</a>
        </p>
      </main>
    </div>
  );
};

export default Login;
