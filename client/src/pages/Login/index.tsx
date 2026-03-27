import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import { useUser } from '@/contexts/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [loginType, setLoginType] = useState<'password' | 'phone'>('password');
  const [isRegister, setIsRegister] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    code: '',
  });

  // 发送验证码状态
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendCode = () => {
    if (!formData.phone) {
      alert('请先输入手机号');
      return;
    }
    setCodeSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCodeSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePasswordLogin = () => {
    if (isRegister) {
      if (!formData.username || !formData.phone || !formData.password) {
        alert('请填写完整信息');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('两次密码不一致');
        return;
      }
      const userData = {
        id: `user_${Date.now()}`,
        username: formData.username,
        phone: formData.phone,
      };
      login(userData);
      navigate('/');
      return;
    }

    if (!formData.phone || !formData.password) {
      alert('请填写完整信息');
      return;
    }
    const userData = {
      id: `user_${Date.now()}`,
      username: '用户',
      phone: formData.phone,
    };
    login(userData);
    navigate('/');
  };

  const handlePhoneLogin = () => {
    if (isRegister) {
      if (!formData.username || !formData.phone || !formData.code) {
        alert('请填写完整信息');
        return;
      }
      const userData = {
        id: `user_${Date.now()}`,
        username: formData.username,
        phone: formData.phone,
      };
      login(userData);
      navigate('/');
      return;
    }

    if (!formData.phone || !formData.code) {
      alert('请填写完整信息');
      return;
    }
    const userData = {
      id: `user_${Date.now()}`,
      username: '用户',
      phone: formData.phone,
    };
    login(userData);
    navigate('/');
  };

  const handleWeChatLogin = () => {
    alert('微信授权功能开发中');
  };

  return (
    <>
      <TopBar showBack={false} showAccount={false} />

      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col">
        {/* Logo and Title */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="船夫健康Logo" className="h-16 w-auto" />
          </div>
          <h1 className="font-headline font-extrabold text-4xl text-primary tracking-tight mb-3">船夫健康</h1>
          <p className="text-on-surface-variant text-base">您的专属私人健康管家</p>
          <div className="mt-4 px-6 py-2 bg-primary/5 rounded-full inline-block">
            <p className="text-xs text-primary font-medium">首次使用请先注册，已有账号可直接登录</p>
          </div>
        </div>

        {/* Login/Register Toggle */}
        <div className="flex bg-surface-container-low rounded-2xl p-1.5 mb-10">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-4 rounded-xl font-bold text-sm sm:text-base transition-all ${
              !isRegister ? 'bg-white text-primary shadow-md' : 'text-on-surface-variant'
            }`}
          >登录</button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-4 rounded-xl font-bold text-sm sm:text-base transition-all ${
              isRegister ? 'bg-white text-primary shadow-md' : 'text-on-surface-variant'
            }`}
          >注册</button>
        </div>

        {/* Login Type Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setLoginType('password')}
            className={`flex-1 py-4 rounded-xl font-bold text-sm sm:text-base transition-all ${
              loginType === 'password' ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >账户密码</button>
          <button
            onClick={() => setLoginType('phone')}
            className={`flex-1 py-4 rounded-xl font-bold text-sm sm:text-base transition-all ${
              loginType === 'phone' ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >手机验证码</button>
        </div>

        {/* Form Container */}
        <div className="bg-surface-container-low rounded-[2.5rem] p-10 mb-10 shadow-lg">
          {loginType === 'password' ? (
            <div className="space-y-5">
              {isRegister && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary uppercase tracking-wider">用户名</label>
                  <div className="relative">
                    <input type="text" value={formData.username} onChange={(e) => handleChange('username', e.target.value)} className="w-full bg-white border-none rounded-xl p-5 pl-12 text-on-surface text-base placeholder:text-on-surface-variant/40" placeholder="请输入用户名" />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">手机号</label>
                <div className="relative">
                  <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full bg-white border-none rounded-xl p-5 pl-12 text-on-surface text-base placeholder:text-on-surface-variant/40" placeholder="请输入手机号" />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">phone_iphone</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">密码</label>
                <div className="relative">
                  <input type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className="w-full bg-white border-none rounded-xl p-5 pl-12 text-on-surface text-base placeholder:text-on-surface-variant/40" placeholder="请输入密码" />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                </div>
              </div>

              {isRegister && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary uppercase tracking-wider">确认密码</label>
                  <div className="relative">
                    <input type="password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className="w-full bg-white border-none rounded-xl p-5 pl-12 text-on-surface text-base placeholder:text-on-surface-variant/40" placeholder="请再次输入密码" />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                  </div>
                </div>
              )}

              {!isRegister && (
                <div className="text-right">
                  <button className="text-sm text-secondary hover:underline">忘记密码？</button>
                </div>
              )}

              <button onClick={handlePasswordLogin} className="w-full bg-primary text-white font-bold py-5 rounded-xl shadow-[0_8px_20px_rgba(0,30,64,0.15)] active:scale-[0.98] transition-all duration-300 text-lg">
                {isRegister ? '立即注册' : '立即登录'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {isRegister && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary uppercase tracking-wider">用户名</label>
                  <div className="relative">
                    <input type="text" value={formData.username} onChange={(e) => handleChange('username', e.target.value)} className="w-full bg-white border-none rounded-xl p-5 pl-12 text-on-surface text-base placeholder:text-on-surface-variant/40" placeholder="请输入用户名" />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">手机号</label>
                <div className="relative">
                  <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full bg-white border-none rounded-xl p-5 pl-12 text-on-surface text-base placeholder:text-on-surface-variant/40" placeholder="请输入手机号" />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">phone_iphone</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">验证码</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input type="text" value={formData.code} onChange={(e) => handleChange('code', e.target.value)} className="w-full bg-white border-none rounded-xl p-5 pl-12 text-on-surface text-base placeholder:text-on-surface-variant/40" placeholder="请输入验证码" maxLength={6} />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">verified_user</span>
                  </div>
                  <button onClick={handleSendCode} disabled={codeSent} className={`px-8 py-5 rounded-xl font-bold text-sm transition-all ${codeSent ? 'bg-surface-container text-on-surface-variant' : 'bg-secondary text-white'}`}>
                    {codeSent ? `${countdown}秒` : '获取验证码'}
                  </button>
                </div>
              </div>

              <button onClick={handlePhoneLogin} className="w-full bg-primary text-white font-bold py-5 rounded-xl shadow-[0_8px_20px_rgba(0,30,64,0.15)] active:scale-[0.98] transition-all duration-300 text-lg">
                {isRegister ? '立即注册' : '立即登录'}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-outline-variant/30"></div>
          <span className="text-xs text-on-surface-variant">其他方式</span>
          <div className="flex-1 h-px bg-outline-variant/30"></div>
        </div>

        {/* WeChat Login Button */}
        <button onClick={handleWeChatLogin} className="w-full bg-[#07c160] text-white font-bold py-5 rounded-xl shadow-[0_8px_20px_rgba(7,193,96,0.15)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 text-lg">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.5 14c-4.1 0-7.5-2.7-7.5-6 0-3.3 3.4-6 7.5-6s7.5 2.7 7.5 6c0 3.3-3.4 6-7.5 6zm0-10c-3.1 0-5.5 1.8-5.5 4s2.4 4 5.5 4 5.5-1.8 5.5-4-2.4-4-5.5-4zm7 14c-2.3 0-4.3-1-5.6-2.6 1.4-.6 3-1 4.6-1 .5 0 1 0 1.5.1 2.2 1.7 3.9 4.3 3.9 7.1v.4c-1.1.6-2.3 1-3.6 1zm0-4c-2.2 0-4 1.3-4.8 3.2.8.2 1.6.3 2.5.3 3.9 0 7.5-1.5 9.6-4.1-.8-1.1-1.9-2-3.2-2.6-.9-.5-1.9-.8-2.9-.8h-1.2z" />
          </svg>
          微信一键登录
        </button>

        {/* Privacy Policy */}
        <p className="text-center text-sm text-on-surface-variant mt-10">
          登录即表示您同意我们的
          <a href="#" className="text-secondary hover:underline mx-1">服务条款</a>
          和
          <a href="#" className="text-secondary hover:underline ml-1">隐私政策</a>
        </p>
      </main>
    </>
  );
};

export default Login;
