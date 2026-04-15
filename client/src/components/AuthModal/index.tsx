import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/components/Toast';
import { checkUser, passwordLogin, register } from '@/api/auth.api';
import { setToken, setUser } from '@/lib/auth';

// 导入图标
import phoneIcon from '@/assets/icons/phone.svg';
import personIcon from '@/assets/icons/person.svg';
import lockIcon from '@/assets/icons/lock.svg';
import arrowBackIcon from '@/assets/icons/arrow-back.svg';
import personAddIcon from '@/assets/icons/person-add.svg';

type Step = 'phone' | 'login' | 'register';

const AuthModal = () => {
  const { isOpen, closeModal, onSuccess } = useAuthModal();
  const { login: setUserContext } = useUser();
  const { showToast } = useToast();

  // 当前步骤
  const [step, setStep] = useState<Step>('phone');
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

  // 监听全局 auth:required 事件
  useEffect(() => {
    const handleAuthRequired = () => {
      // 弹窗由 AuthModalContext 控制
    };
    window.addEventListener('auth:required', handleAuthRequired);
    return () => {
      window.removeEventListener('auth:required', handleAuthRequired);
    };
  }, []);

  // 重置状态
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('phone');
        setExistingUsername('');
        setFormData({
          phone: '',
          username: '',
          password: '',
          confirmPassword: '',
        });
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 检查手机号，判断新老用户
  const handleCheckPhone = async () => {
    if (!formData.phone || !/^\d{11}$/.test(formData.phone)) {
      showToast('请输入正确的11位手机号');
      return;
    }

    setChecking(true);
    try {
      const res = await checkUser({ phone: formData.phone });
      if (res.data.exists) {
        setExistingUsername(res.data.username || '用户');
        setStep('login');
      } else {
        setStep('register');
      }
    } catch {
      showToast('检查用户失败，请重试');
    } finally {
      setChecking(false);
    }
  };

  // 老用户密码登录
  const handlePasswordLogin = async () => {
    if (!formData.password) {
      showToast('请输入密码');
      return;
    }
    if (formData.password.length < 6) {
      showToast('密码长度不能少于6位');
      return;
    }

    setLoading(true);
    try {
      const res = await passwordLogin({
        phone: formData.phone,
        password: formData.password,
      });
      setToken(res.token);
      setUser(res.user);
      setUserContext(res.user);
      
      closeModal();
      
      // 执行成功回调
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 新用户注册
  const handleRegister = async () => {
    if (!formData.username) {
      showToast('请输入用户名');
      return;
    }
    if (formData.username.length < 2) {
      showToast('用户名长度不能少于2位');
      return;
    }
    if (!formData.password) {
      showToast('请输入密码');
      return;
    }
    if (formData.password.length < 6) {
      showToast('密码长度不能少于6位');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        phone: formData.phone,
        username: formData.username,
        password: formData.password,
      });
      setToken(res.token);
      setUser(res.user);
      setUserContext(res.user);
      
      closeModal();
      
      // 执行成功回调
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || '注册失败，请重试');
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
    <div className={`fixed inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        // onClick={closeModal}
      />

      {/* Bottom Panel */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          {/* <div className="w-10 h-1 bg-on-surface-variant/30 rounded-full" /> */}
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-2 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center mb-2">
              <img
                src={new URL('@/images/img-04.png', import.meta.url).href}
                alt="船夫健康Logo"
                className="h-14 w-auto"
              />
            </div>
            <p className="text-on-surface-variant text-xs">您的专属私人健康管家</p>
          </div>

        {/* Form Container */}
        <div className="space-y-4">
          {/* Step 1: 输入手机号 */}
          {step === 'phone' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <label className="text-xs font-medium text-on-surface-variant ml-1">手机号</label>
                <div className="relative">
                  <img src={phoneIcon} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none"
                    placeholder="请输入11位手机号"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-on-surface-variant/50 ml-1">新用户首次登录需注册</p>
              </div>

              <button
                onClick={handleCheckPhone}
                disabled={checking || !formData.phone || formData.phone.length !== 11}
                className="w-full bg-primary text-white font-semibold py-3 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
              >
                {checking ? '验证中...' : '下一步'}
              </button>
            </div>
          )}

          {/* Step 2a: 老用户登录 */}
          {step === 'login' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <img src={personIcon} alt="" className="w-6 h-6 text-primary" style={{ filter: 'invert(15%) sepia(90%) saturate(500%) hue-rotate(190deg)' }} />
                </div>
                <h2 className="text-base font-bold text-on-surface">欢迎回来</h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {formData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                  {existingUsername && <span className="text-secondary ml-1">· {existingUsername}</span>}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-on-surface-variant ml-1">密码</label>
                <div className="relative">
                  <img src={lockIcon} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none"
                    placeholder="请输入密码"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                >
                  <img src={arrowBackIcon} alt="" className="w-6 h-6" />
                  返回
                </button>
                <button className="text-xs text-secondary hover:text-secondary/80 transition-colors">忘记密码？</button>
              </div>

              <button
                onClick={handlePasswordLogin}
                disabled={loading || !formData.password}
                className="w-full bg-primary text-white font-semibold py-3 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
              >
                {loading ? '登录中...' : '立即登录'}
              </button>
            </div>
          )}

          {/* Step 2b: 新用户注册 */}
          {step === 'register' && (
            <div className="space-y-2.5 animate-in fade-in duration-200">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <img src={personAddIcon} alt="" className="w-6 h-6" style={{ filter: 'invert(35%) sepia(90%) saturate(500%) hue-rotate(190deg)' }} />
                </div>
                <h2 className="text-base font-bold text-on-surface">新用户注册</h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {formData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface-variant ml-1">用户名</label>
                <div className="relative">
                  <img src={personIcon} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none text-sm"
                    placeholder="2-20位字符"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface-variant ml-1">密码</label>
                <div className="relative">
                  <img src={lockIcon} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none text-sm"
                    placeholder="至少6位字符"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-on-surface-variant ml-1">确认密码</label>
                <div className="relative">
                  <img src={lockIcon} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-white transition-all outline-none text-sm"
                    placeholder="再次输入密码"
                  />
                </div>
              </div>

              <div className="flex justify-start pt-1">
                <button
                  onClick={handleBack}
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                >
                  <img src={arrowBackIcon} alt="" className="w-6 h-6" />
                  返回
                </button>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-primary text-white font-semibold py-3 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
              >
                {loading ? '注册中...' : '注册并登录'}
              </button>
            </div>
          )}
        </div>

        {/* Privacy Policy */}
        {/* <p className="text-center text-[10px] text-on-surface-variant/50 mt-4">
          登录即表示同意
          <a href="#" className="text-secondary/80 hover:text-secondary transition-colors">服务条款</a>
          <span className="mx-1">和</span>
          <a href="#" className="text-secondary/80 hover:text-secondary transition-colors">隐私政策</a>
        </p> */}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
