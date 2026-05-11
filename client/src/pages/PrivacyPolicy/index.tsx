import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center h-14 px-4">
          <Link to="/" className="flex items-center gap-1 text-primary font-bold">
            <span className="material-symbols-outlined">arrow_back_ios</span>
            <span>返回</span>
          </Link>
          <h1 className="flex-1 text-center font-headline font-bold text-primary pr-14">隐私声明</h1>
        </div>
      </header>

      <main className="px-5 pt-16 pb-20 max-w-3xl mx-auto">
        <h2 className="font-headline text-xl font-bold text-primary mb-6">
          船夫健康（BOATMAN HEALTH）隐私政策
        </h2>

        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          本隐私政策适用于船夫健康（以下简称"我们"）通过官方网站、服务系统、线下服务等渠道提供的Medicine 3.0 长寿管理、全球医疗对接、健康档案管理、医疗资源协调等相关服务（以下统称"本服务"）。
        </p>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          我们高度重视个人信息与健康医疗数据保护，严格保护用户隐私与数据安全。请您在使用本服务前，仔细阅读并充分理解本政策全部内容；您使用本服务即视为您已同意本政策内容。如您不同意本政策任何条款，请立即停止使用本服务。
        </p>

        <section className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
          <div>
            <h3 className="font-bold text-primary text-base mb-2">1. 我们收集的信息</h3>
            <p className="mb-1">为了提供精准的"Medicine 3.0"长寿管理及全球医疗对接服务，经您授权，我们可能收集以下信息：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium text-on-surface">基础身份信息：</span>姓名、性别、出生日期、联系方式、证件号码（用于境内外医疗机构挂号及国际转运安排等）。</li>
              <li><span className="font-medium text-on-surface">健康生理数据：</span>既往病史、家族病史、基因检测报告、DNA甲基化测试结果、临床化验单及影像学资料。</li>
              <li><span className="font-medium text-on-surface">生活方式数据：</span>饮食习惯、运动频率、睡眠数据及生物年龄评估相关信息。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">2. 信息的使用目的</h3>
            <p className="mb-1">我们收集的信息仅用于：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium text-on-surface">身份核验与服务开通：</span>完成用户注册、身份验证、服务资格审核；</li>
              <li><span className="font-medium text-on-surface">定制化方案：</span>为您构建个人及家族健康档案，制定长寿医学干预计划。</li>
              <li><span className="font-medium text-on-surface">全球医疗资源协调：</span>经您授权，代表您与国内外医疗机构、保险公司或家族办公室沟通，确保医疗资源的精准匹配。</li>
              <li><span className="font-medium text-on-surface">服务通知：</span>发送体检报告解读、复诊提醒及紧急医疗资源状态的更新。</li>
              <li><span className="font-medium text-on-surface">安全保障与合规：</span>数据安全防护、风险监测、应急处置、投诉处理、合规审计、配合监管与司法调查。</li>
              <li><span className="font-medium text-on-surface">服务优化：</span>在匿名化、脱敏处理后开展服务质量分析、流程优化，不使用可识别个人身份的原始数据。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">3. 信息的共享与披露（核心保护条款）</h3>
            <p className="mb-2">船夫健康承诺：我们绝不向任何第三方出售或非法提供您的个人信息。</p>
            <p className="mb-1">仅在以下必要场景下，我们会进行受限披露：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium text-on-surface">医疗机构对接：</span>经您明确授权，我们将相关病历资料提供给您指定的接诊医院或会诊专家。</li>
              <li><span className="font-medium text-on-surface">法律强制要求：</span>根据法律法规、法律程序或政府强制性要求所必须提供的情况下。</li>
              <li><span className="font-medium text-on-surface">委托处理：</span>委托具备合规资质与安全能力的第三方（如 IT 服务商、云服务商）处理时，签订严格数据处理协议，明确双方责任，要求受托方仅在授权范围内处理，不得转委托。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">4. 跨境数据传输</h3>
            <p className="mb-1">由于我们的服务涵盖全球资源对接，您的信息可能被传输至您选择的医疗目的地国家/地区（如中国香港、美国、欧洲等）。确需跨境传输的，我们将严格遵守本政策及国家监管要求。我们将确保：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>传输前已获得您的专项授权。</li>
              <li>接收方具备同等的隐私保护能力，并签署严格的保密协议。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">5. 安全防护措施</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium text-on-surface">技术安全：</span>采用符合行业标准的加密技术存储健康档案。</li>
              <li><span className="font-medium text-on-surface">权限管控：</span>仅负责您专案的"首席健康官"或核心团队成员有权在授权范围内查阅相关数据。</li>
              <li><span className="font-medium text-on-surface">审计追踪：</span>所有核心敏感数据的访问均留有完整日志，确保可追溯性。</li>
              <li><span className="font-medium text-on-surface">应急处置：</span>发生数据安全事件时，立即启动应急预案，采取补救措施，依法告知用户并向监管部门报告。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">6. 您的权利</h3>
            <p className="mb-1">您对自己的个人信息拥有充分的控制权，包括：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium text-on-surface">查阅与更正：</span>您可以随时要求查阅您的个人信息，更正、补充不准确、不完整的个人信息。</li>
              <li><span className="font-medium text-on-surface">撤回授权：</span>您可以随时要求删除相关数据，但在某些情况下，这可能导致我们无法继续为您提供部分复杂的医疗管理服务。</li>
              <li><span className="font-medium text-on-surface">投诉举报：</span>对我们的信息处理行为提出投诉、举报、异议。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">7. 信息保留</h3>
            <p className="mb-1">除非法律有所要求，否则我们保留您信息数据的时间不会超过保留所需的期限。我们将按照以下方式保留您的信息：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>服务存续期间及服务终止后，按医疗健康档案管理、纠纷处理、合规审计等法定要求保存，不短于法律法规规定的最低期限。</li>
              <li>服务终止且达到法定保存期限后，对个人信息进行删除或匿名化处理，无法恢复、还原。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">8. 变更</h3>
            <p>我们可根据法律法规、监管要求、服务调整更新本政策，更新后通过官方网站、服务系统等渠道公示，公示后生效。您继续使用本服务视为同意更新后的政策。</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
