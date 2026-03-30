import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { getBookingDetail, updateBooking, cancelBooking, BookingData, ConsultationType } from '@/api/form1.api';

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [editForm, setEditForm] = useState<{
    name: string;
    phone: string;
    consultationType: ConsultationType | '';
    preferredDate: string;
    preferredTime: string;
    brief: string;
  }>({
    name: '',
    phone: '',
    consultationType: '',
    preferredDate: '',
    preferredTime: '',
    brief: '',
  });

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const data = await getBookingDetail(parseInt(id, 10));
        setBooking(data);
        setEditForm({
          name: data.name,
          phone: data.phone,
          consultationType: data.consultationType,
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          brief: data.brief,
        });
      } catch (error) {
        console.error('获取预约详情失败:', error);
        alert('获取预约详情失败');
        navigate('/account');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const result = await updateBooking(parseInt(id, 10), {
        name: editForm.name,
        phone: editForm.phone,
        consultationType: editForm.consultationType || undefined,
        preferredDate: editForm.preferredDate,
        preferredTime: editForm.preferredTime,
        brief: editForm.brief,
      });

      alert('预约更新成功！');
      navigate('/booking-success', {
        state: {
          orderNo: result.data.orderNo,
          submittedAt: result.data.submittedAt,
          consultationType: result.data.consultationType,
          preferredDate: result.data.preferredDate,
          preferredTime: result.data.preferredTime,
        },
      });
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !booking) return;

    const confirmed = window.confirm('确定要取消该预约吗？此操作不可撤销。');
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      await cancelBooking(parseInt(id, 10));
      alert('预约已取消');
      navigate('/account');
    } catch (error) {
      console.error('取消预约失败:', error);
      alert('取消预约失败，请稍后重试');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatSubmittedAt = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPreferredTime = (date: string, time: string) => {
    if (!date) return '待定';
    const dateStr = new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return time ? `${dateStr} ${time}` : dateStr;
  };

  const consultationTypes: { value: ConsultationType; label: string }[] = [
    { value: '重疾咨询', label: '重疾咨询' },
    { value: '慢病管理', label: '慢病管理' },
    { value: '健康资产规划', label: '健康资产规划' },
  ];

  if (loading) {
    return (
      <>
        <TopBar showBack showAccount={false} />
        <main className="pt-8 pb-16 px-6 flex items-center justify-center min-h-screen">
          <p className="text-on-surface-variant">加载中...</p>
        </main>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <TopBar showBack showAccount={false} />
        <main className="pt-8 pb-16 px-6 flex items-center justify-center min-h-screen">
          <p className="text-on-surface-variant">预约不存在</p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar showBack showAccount={false} />

      <main className="pt-4 pb-32 px-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-headline text-2xl font-bold text-primary">
            {isEditing ? '编辑预约' : '预约详情'}
          </h1>
        </div>

        {isEditing ? (
          /* 编辑表单 */
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">姓名</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 text-on-surface font-body input-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">联系电话</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 text-on-surface font-body input-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">咨询需求</label>
              <div className="grid grid-cols-3 gap-3">
                {consultationTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, consultationType: type.value })}
                    className={`p-4 rounded-xl text-sm font-bold transition-all ${
                      editForm.consultationType === type.value
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container-lowest text-on-surface border border-outline-variant/20'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">预约日期</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={editForm.preferredDate}
                onChange={(e) => setEditForm({ ...editForm, preferredDate: e.target.value })}
                className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 text-on-surface font-body input-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">预约时间</label>
              <input
                type="time"
                value={editForm.preferredTime}
                onChange={(e) => setEditForm({ ...editForm, preferredTime: e.target.value })}
                className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 text-on-surface font-body input-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">简要病史</label>
              <textarea
                rows={4}
                value={editForm.brief}
                onChange={(e) => setEditForm({ ...editForm, brief: e.target.value })}
                className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 text-on-surface font-body input-shadow resize-none"
              />
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full text-base shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? '提交中...' : '保存修改'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="w-full bg-surface-container text-primary font-headline font-bold py-4 rounded-full text-base hover:bg-surface-container-high transition-all"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          /* 查看详情 */
          <div className="space-y-4">
            {/* 订单信息 */}
            <div className="bg-surface-container-low p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant text-sm">订单编号</span>
                <span className="font-medium text-primary">{booking.orderNo}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant text-sm">提交时间</span>
                <span className="font-medium text-primary">{formatSubmittedAt(booking.submittedAt)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant text-sm">咨询类型</span>
                <span className="font-medium text-primary">{booking.consultationType}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant text-sm">预约时间</span>
                <span className="font-medium text-primary">
                  {formatPreferredTime(booking.preferredDate, booking.preferredTime)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant text-sm">姓名</span>
                <span className="font-medium text-primary">{booking.name}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-on-surface-variant text-sm">联系电话</span>
                <span className="font-medium text-primary">{booking.phone}</span>
              </div>
            </div>

            {/* 简要病史 */}
            {booking.brief && (
              <div className="bg-surface-container-low p-6 rounded-2xl">
                <p className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest mb-2">简要病史</p>
                <p className="text-on-surface text-sm leading-relaxed">{booking.brief}</p>
              </div>
            )}

            {/* 版本信息 */}
            {/* <p className="text-center text-xs text-on-surface-variant">
              版本：v{booking.versionNumber}
            </p> */}

            {/* 底部操作按钮 */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full text-base shadow-lg transition-all active:scale-95"
              >
                编辑预约
              </button>
              <button
                onClick={() => navigate('/health-form')}
                className="w-full bg-surface-container text-primary font-headline font-bold py-4 rounded-full text-base hover:bg-surface-container-high transition-all"
              >
                继续完善档案
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full bg-error/10 text-error font-headline font-bold py-4 rounded-full text-base hover:bg-error/20 transition-all disabled:opacity-50"
              >
                {isCancelling ? '取消中...' : '取消预约'}
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
};

export default BookingDetail;
