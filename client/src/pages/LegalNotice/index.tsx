import { Link } from 'react-router-dom';

const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center h-14 px-4">
          <Link to="/" className="flex items-center gap-1 text-primary font-bold">
            <span className="material-symbols-outlined">arrow_back_ios</span>
            <span>返回</span>
          </Link>
          <h1 className="flex-1 text-center font-headline font-bold text-primary pr-14">法律声明</h1>
        </div>
      </header>

      <main className="px-5 pt-16 pb-20 max-w-3xl mx-auto">
        <h2 className="font-headline text-xl font-bold text-primary mb-6">
          船夫健康（BOATMAN HEALTH）法律声明
        </h2>

        <section className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
          <div>
            <h3 className="font-bold text-primary text-base mb-2">1. 特别提示</h3>
            <p>本网站及相关服务由船夫健康（以下简称"本公司"）运营。在您访问、使用本网站及相关服务前，应仔细阅读并完全理解本声明全部条款。您一旦访问、使用本网站及相关服务，即视为已充分阅读、理解并自愿接受本声明全部内容，同意受本声明约束。本公司有权依据法律法规及业务需要，不时修订本声明，修订后的版本将在网站公示，公示后即生效；您继续使用视为接受修订后的内容。</p>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">2. 主体资质与业务声明</h3>
            <p className="mb-2"><span className="font-medium text-on-surface">2.1 主体资质：</span>船夫健康是一家专注于客户及家族的个性化医疗健康解决方案的专业咨询机构。我们提供的咨询建议是基于医学文献、临床数据及全球医疗资源的咨询服务，不涉及任何临床诊断或医疗建议。</p>
            <p><span className="font-medium text-on-surface">2.2 非医疗机构声明：</span>船夫健康不具备医疗机构执业资质，不开展任何医疗执业活动，不提供任何形式的临床诊断、处方及治疗等属于医疗机构的诊疗行为。 本网站及本公司顾问所提供的所有信息、建议及方案仅供参考，不能替代执业医师面对面的专业医学诊断及治疗。任何最终的医疗决策应由客户在具备资质的医疗机构及执业医师指导下做出。</p>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">3. 第三方医疗资源责任边界</h3>
            <p className="mb-2"><span className="font-medium text-on-surface">3.1 资源性质：</span>本网站所提及、展示或推荐的国内外医疗机构、专家、医生、救援机构等，均为独立的第三方主体，依法独立享有权利、承担责任。</p>
            <p><span className="font-medium text-on-surface">3.2 责任边界：</span>船夫健康仅负责协助客户进行资源筛选与就医路径优化等咨询与对接服务，不对第三方的资质、诊疗质量、医疗安全、服务效果等提供担保。客户在第三方机构接受的检查、诊疗、手术、转运等行为所产生的医疗质量、安全及法律责任，由相应第三方机构依法承担。 船夫健康不因推荐或协助对接等行为而对第三方的医疗过错、违约或侵权承担连带责任、补充责任或共同赔偿责任。</p>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">4. 医学不确定性与风险提示</h3>
            <p className="mb-2"><span className="font-medium text-on-surface">4.1 不确定性：</span>医学具有高度复杂性与个体差异性。船夫健康所倡导的"Medicine 3.0"及长寿管理方案，仅为基于公开医学文献、临床数据及行业经验的决策参考，不构成诊疗结论，不承诺任何疗效、治愈率、寿命延长等确定性结果。</p>
            <p><span className="font-medium text-on-surface">4.2 风险承担：</span>客户应充分理解并自愿承担医疗转运、手术等医疗行为存在的固有风险（包括但不限于因不可抗力导致的转运延迟、并发症、不良反应等）。本公司在提供咨询过程中已尽合理审慎的尽职调查与告知义务，对非因本公司故意或重大过失导致的风险与损失，依法不承担责任。</p>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">5. 知识产权声明</h3>
            <p className="mb-2"><span className="font-medium text-on-surface">5.1 版权所有：</span>本网站所有内容（包括文字、图片、音频、视频、品牌手册、"船夫"品牌标识、Medicine 3.0专案架构等）的知识产权均归本公司或相关权利人所有。</p>
            <p><span className="font-medium text-on-surface">5.2 授权使用：</span>未经本公司书面授权，任何机构或个人不得以任何方式（包括但不限于爬虫抓取、镜像、转载、修改）使用本网站内容用于商业目的或用于其他非法目的，否则本公司将依法追究其全部法律责任。</p>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">6. 隐私保护与数据安全</h3>
            <p>本公司严格遵守《中华人民共和国民法典》《中华人民共和国个人信息保护法》等法律法规，对客户提供的健康档案及私人信息采取安全保护措施。未经客户明确授权或法律法规强制性规定，本公司不会向任何第三方（非业务必要环节）披露、出售或非法提供客户隐私。客户应妥善保管账号、密码等信息，因客户自身原因导致信息泄露的，由客户自行承担相应责任。</p>
          </div>

          <div>
            <h3 className="font-bold text-primary text-base mb-2">7. 管辖与法律适用</h3>
            <p>本声明的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如双方就本声明内容或其执行发生任何争议，应友好协商；协商不成时，应向本公司所在地有管辖权的人民法院提起诉讼。</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LegalNotice;
