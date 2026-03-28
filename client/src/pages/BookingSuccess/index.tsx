import { Link, useLocation } from 'react-router-dom';
import TopBar from '@/components/TopBar';

interface BookingState {
  orderNo: string;
  submittedAt: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
}

const BookingSuccess = () => {
  const location = useLocation();
  const bookingData = location.state as BookingState | null;

  // 格式化提交时间
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

  // 格式化预约时间
  const formatPreferredTime = (date: string, time: string) => {
    if (!date) return '待定';
    const dateStr = new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return time ? `${dateStr} ${time}` : dateStr;
  };

  return (
    <>
      <TopBar showBack showAccount={false} />

      <main className="flex items-center justify-center min-h-screen pt-8 pb-16 px-6">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Success Icon */}
          <div className="mx-auto w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600" style={{ fontSize: '64px', fontVariationSettings: 'FILL 1' }}>check_circle</span>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="font-headline text-4xl font-extrabold text-primary">已成功提交预约</h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">感谢您的信任！我们的健康顾问将在24小时内与您联系，为您安排专属的健康咨询时间。</p>
          </div>

          {/* Order Details */}
          <div className="bg-surface-container-low p-8 rounded-3xl space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">提交时间</span>
              <span className="font-medium text-primary">
                {bookingData?.submittedAt ? formatSubmittedAt(bookingData.submittedAt) : new Date().toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">咨询类型</span>
              <span className="font-medium text-primary">
                {bookingData?.consultationType || '医疗咨询登记'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">预约时间</span>
              <span className="font-medium text-primary">
                {bookingData ? formatPreferredTime(bookingData.preferredDate, bookingData.preferredTime) : '待定'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-on-surface-variant">订单编号</span>
              <span className="font-medium text-primary">
                {bookingData?.orderNo || `BH${new Date().toISOString().slice(0, 10).replace(/-/g, '')}001`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link to="/health-form" className="block w-full px-8 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold text-lg shadow-lg shadow-primary/30 hover:opacity-90 transition-all active:scale-[0.98]">继续完善档案</Link>
            <Link to="/" className="block w-full px-8 py-4 bg-surface-container text-primary rounded-2xl font-headline font-bold text-lg hover:bg-surface-container-high transition-all active:scale-[0.98]">返回首页</Link>
            <Link to="/account" className="block w-full px-8 py-4 bg-surface-container text-primary rounded-2xl font-headline font-bold text-lg hover:bg-surface-container-high transition-all active:scale-[0.98]">查看我的预约</Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default BookingSuccess;
