import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/Toast';
import Icon from '@/components/Icon';
import { updateProfile } from '@/api/auth.api';

const Settings = () => {
  const navigate = useNavigate();
  const { user, login } = useUser();
  const { showToast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<'username' | 'phone' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (field: 'username' | 'phone') => {
    setEditField(field);
    setEditValue(field === 'username' ? (user?.username || '') : (user?.phone || ''));
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!user || !editField) return;
    setSaving(true);
    try {
      await updateProfile({ [editField]: editValue });
      const updatedUser = {
        ...user,
        [editField]: editValue,
      };
      login(updatedUser);
      setShowEditModal(false);
      setEditField(null);
    } catch (error: unknown) {
      console.error('保存失败:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || '保存失败，请重试';
      showToast(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-8">
      {/* Profile Section */}
      <section className="px-6 pt-4 mb-6">
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="头像" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Icon name="person" size={32} className="text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-lg text-on-surface">{user?.username || '未设置'}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{user?.phone || '未绑定手机'}</p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-3">
            <button
              onClick={() => handleEdit('username')}
              className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-xl active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <Icon name="badge" size={20} className="text-secondary" />
                <div className="text-left">
                  <p className="text-xs text-on-surface-variant">用户名</p>
                  <p className="text-sm font-medium text-on-surface">{user?.username || '未设置'}</p>
                </div>
              </div>
              <Icon name="edit" size={18} className="text-on-surface-variant" />
            </button>

            <button
              onClick={() => handleEdit('phone')}
              className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-xl active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <Icon name="phone" size={20} className="text-secondary" />
                <div className="text-left">
                  <p className="text-xs text-on-surface-variant">手机号</p>
                  <p className="text-sm font-medium text-on-surface">{user?.phone || '未绑定'}</p>
                </div>
              </div>
              <Icon name="edit" size={18} className="text-on-surface-variant" />
            </button>
          </div>
        </div>
      </section>

      {/* Settings Items */}
      {/* <section className="px-6 mb-8">
        <h3 className="font-headline font-bold text-base text-on-surface mb-4 px-1">通用设置</h3>
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm">
          {settingItems.map((item, index) => (
            <button
              key={item.icon}
              onClick={item.action}
              className={`w-full flex items-center justify-between p-4 active:bg-surface-container-low transition-colors ${
                index < settingItems.length - 1 ? 'border-b border-surface-container-high' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center">
                  <Icon name={item.icon} size={20} className="text-secondary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-on-surface">{item.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                </div>
              </div>
              <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
            </button>
          ))}
        </div>
      </section> */}

      {/* Danger Zone */}
      <section className="px-6">
        <button
          onClick={() => navigate('/account/logout')}
          className="w-full py-4 bg-error/5 text-error font-medium rounded-xl border border-error/10 active:scale-[0.98] transition-all"
        >
          退出登录
        </button>
      </section>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-6 pb-[calc(8rem+env(safe-area-inset-bottom))] animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                编辑{editField === 'username' ? '用户名' : '手机号'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-2">
                <Icon name="close" size={20} className="text-on-surface-variant" />
              </button>
            </div>
            <input
              type={editField === 'phone' ? 'tel' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editField === 'username' ? '请输入用户名' : '请输入手机号'}
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 bg-surface-container-low text-on-surface font-medium rounded-xl active:scale-[0.98] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-primary text-on-primary font-medium rounded-xl shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
