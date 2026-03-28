import Icon from '@/components/Icon';
import img03 from '@/images/img-03.png';

const Contact = () => {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 min-h-[70vh]">
      {/* Identity */}
      <div className="w-full mb-12 text-center">
        <div className="inline-flex items-center justify-center w-36 h-26 rounded-full  mb-6 ">
          {/* <Icon name="support_agent" filled size={36} className="text-secondary-container" /> */}
          <img src="/logo.png" alt="船夫健康Logo" className="w-36 h-26 " />
        </div>
        <h2 className="font-headline font-extrabold text-2xl text-primary tracking-tight mb-4">船夫 健康</h2>
        <p className="font-body text-on-surface-variant leading-relaxed px-4">您的专属私人健康管家已就绪，扫码即可开启一对一咨询服务。</p>
      </div>

      {/* QR Code Placeholder */}
      <div className="relative w-full max-w-[280px] aspect-square bg-surface-container-lowest rounded-[2rem] p-6 shadow-elevated group overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-2xl" />
        <div className="relative w-full h-full bg-white rounded-xl flex flex-col items-center justify-center gap-4">
          {/* <Icon name="qr_code_2" size={120} className="text-primary/20" /> */}
          <img alt="Atmospheric high-end river landscape with a serene boat at dawn" className="w-full h-full object-cover" src={img03} />
          {/* <p className="text-xs text-on-surface-variant text-center">请使用微信扫描二维码<br />联系您的专属管家</p> */}
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-12 w-full space-y-4">
        <div className="bg-surface-container-low p-5 rounded-xl flex items-start space-x-4">
          <Icon name="verified_user" size={22} className="text-secondary mt-1 shrink-0" />
          <div>
            <h3 className="font-headline font-bold text-primary text-sm">隐私保护</h3>
            <p className="font-body text-xs text-on-surface-variant mt-1">所有咨询均采用银行级加密，确保您的个人健康隐私安全无虞。</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-5 rounded-xl flex items-start space-x-4">
          <Icon name="schedule" size={22} className="text-secondary mt-1 shrink-0" />
          <div>
            <h3 className="font-headline font-bold text-primary text-sm">全天候响应</h3>
            <p className="font-body text-xs text-on-surface-variant mt-1">管家在线时间为 08:00 - 22:00，为您提供即时专业的医疗建议。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
