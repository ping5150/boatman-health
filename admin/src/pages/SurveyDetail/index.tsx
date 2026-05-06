import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Empty, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, FilePdfOutlined, FileImageOutlined, FileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { nutritionSurveyApi, sleepSurveyApi, SurveyDetail } from '../../api/survey.api';

const { Text } = Typography;

// 文件项接口
interface FileItem {
  name?: string;
  url: string;
  size?: number;
  type?: string;
}

const statusMap: Record<string, { text: string; color: string }> = {
  success: { text: '已同步', color: 'green' },
  pending: { text: '待同步', color: 'blue' },
  failed: { text: '同步失败', color: 'red' },
};

// ==================== 睡眠问卷字段中文名映射 ====================
const SLEEP_FIELD_LABELS: Record<string, string> = {
  // 基础睡眠模式
  bedtime: '上床睡觉时间',
  sleepLatency: '入睡所需时长',
  wakeTime: '起床时间',
  sleepDurationHours: '睡眠时长（小时）',
  sleepDurationMinutes: '睡眠时长（分钟）',
  // 入睡与夜间干扰
  cantFallAsleep30min: '不能在30分钟内入睡',
  wakeUpEarly: '早醒',
  getUpToilet: '起床上洗手间',
  breathingDiscomfort: '不舒服的呼吸',
  coughSnore: '大声咳嗽或打鼾',
  feelCold: '感到寒冷',
  feelHot: '感到太热',
  nightmares: '做噩梦',
  pain: '出现疼痛',
  otherSleepIssues: '其他影响睡眠的事情',
  // 整体评估
  sleepQualityRating: '睡眠质量评分',
  // 药物与日间影响
  sleepMedication: '使用催眠药物',
  stayAwakeDifficulty: '难以保持清醒',
  taskCompletionDifficulty: '完成事情困难',
  // 睡眠质量观察
  sleepPartner: '是否与人同睡',
  snoring: '打鼾声',
  breathingPause: '呼吸停顿',
  legTwitch: '腿部抽动',
  disorientation: '不能辨认方向',
  otherRestlessSleep: '其他睡不安宁',
};

// ==================== 营养问卷字段中文名映射 ====================
const NUTRITION_FIELD_LABELS: Record<string, string> = {
  // 01 健康信息
  consultationReason: '咨询主要原因',
  nutritionistSupportGoals: '希望营养师支持领域',
  height: '身高（cm）',
  weight: '体重（kg）',
  weightChange: '体重变化',
  weightChangeHistory: '体重变化史',
  weightGoal: '体重目标',
  bodyComposition: '体成分情况变化',
  chronicDiseases: '慢性疾病',
  medicationsSupplements: '药物或补充剂',
  // 02 饮食习惯（1/4）
  dailyMeals: '每天主餐数量',
  breakfastHabit: '固定早餐习惯',
  commonSnacks: '常吃零食',
  commonSnacksOther: '其他零食',
  foodSources: '食物来源',
  foodSourcesOther: '其他食物来源',
  foodAllergies: '食物过敏',
  macroRatio: '碳水/蛋白/脂肪比例',
  foodQuality: '食物质量',
  mealRegularity: '进餐规律',
  bingeFrequency: '暴食频率（每周）',
  emotionalEatingFrequency: '情绪性进食频率（每周）',
  lateNightSnackFrequency: '夜宵频率（每月）',
  eatingOutFrequency: '外食频率（每月）',
  hasHousekeeper: '是否有保姆',
  takeoutFrequency: '叫外卖频次（每月）',
  socialDiningFrequency: '应酬频次（每月）',
  // 03 饮食习惯（2/4）
  dislikedFoods: '不喜欢食物',
  dietPlanType: '特定饮食计划',
  typicalDietWorkday: '工作日饮食图片',
  typicalDietWeekend: '周末饮食图片',
  typicalDietDescription: '典型饮食描述',
  // 03 饮食习惯（3/4）- 饮品频率
  drinkWater: '饮水频率',
  drinkCoffee: '咖啡频率',
  drinkTea: '茶频率',
  drinkMilk: '牛奶频率',
  drinkPlantMilk: '植物奶频率',
  drinkMilkTea: '奶茶频率',
  drinkSugarFree: '无糖饮料频率',
  drinkSugary: '含糖饮料频率',
  drinkEnergy: '能量饮料频率',
  drinkOther: '其他饮品频率',
  // 03 饮食习惯（4/4）
  highSaltSweat: '出汗含盐量高',
  dietSatisfaction: '饮食满意度',
  // 04 运动习惯（1/2）
  exerciseLevel: '运动水平',
  exerciseTypes: '运动类型',
  exerciseDuration: '每次运动时长',
  exerciseFrequency: '每周运动频率',
  exerciseTime: '运动时间段',
  exerciseMotivation: '运动激励因素',
  // 04 运动习惯（2/2）
  exerciseChallenges: '运动挑战',
  exerciseGoals: '运动目标',
  hasExercisePartner: '是否与他人运动',
  exercisePartnerDetail: '和谁运动',
  // 05 生活方式（1/2）
  stressLevel: '压力水平',
  isSmoker: '是否吸烟',
  smokingDetail: '吸烟详情',
  isDrinker: '是否饮酒',
  drinkingDetail: '饮酒详情',
  weekdayWakeTime: '工作日起床时间',
  weekdaySleepTime: '工作日睡觉时间',
  morningState: '起床精神状态',
  screenTimeTv: '看电视时间',
  screenTimeReading: '阅读时间',
  screenTimeElectronics: '电子屏幕时间',
  // 05 生活方式（2/2）
  socialActivities: '社交活动',
  socialActivitiesOther: '其他社交活动',
  otherFeedback: '其他反馈',
  // 06 饮食频率（1/3）- 谷薯与水果
  freqRice: '米饭摄入频率',
  freqNoodlesBread: '面条面包摄入频率',
  freqWholeGrains: '全谷物摄入频率',
  freqFreshFruit: '新鲜水果摄入频率',
  freqFruitJuice: '果汁摄入频率',
  freqDriedFruit: '果干摄入频率',
  // 06 饮食频率（2/3）- 蔬菜与蛋白质
  freqLeafyVegetables: '绿叶蔬菜摄入频率',
  freqStarchyVegetables: '淀粉类蔬菜摄入频率',
  freqOtherVegetables: '其他蔬菜摄入频率',
  freqEggs: '鸡蛋摄入频率',
  freqPoultry: '家禽摄入频率',
  freqFishSeafood: '鱼类海鲜摄入频率',
  freqBeansSoy: '豆类大豆摄入频率',
  freqRedMeat: '红肉摄入频率',
  // 06 饮食频率（3/3）- 乳制品与零食
  freqMilkDairy: '牛奶乳制品摄入频率',
  freqYogurt: '酸奶摄入频率',
  freqCheese: '奶酪摄入频率',
  freqNonDairyAlternatives: '非乳制品替代摄入频率',
  freqNutsSeeds: '坚果种子摄入频率',
  freqCookiesCake: '饼干蛋糕摄入频率',
  freqChocolateCandy: '巧克力糖果摄入频率',
  freqSaltySnacks: '咸味小吃摄入频率',
  // 07 上传的饮食记录
  uploadedDietFiles: '上传的饮食记录文件',
  // 08 期望的服务类型
  serviceTypes: '服务类型',
  serviceTypesOther: '服务类型（其他）',
  personalizationPreferences: '个性化偏好',
  complianceScore: '执行力评分（1-10）',
  feedbackFrequency: '反馈频率',
};

const SurveyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SurveyDetail | null>(null);

  const isSleepSurvey = useMemo(() => location.pathname.startsWith('/sleep-survey'), [location.pathname]);

  const fieldLabels = isSleepSurvey ? SLEEP_FIELD_LABELS : NUTRITION_FIELD_LABELS;

  // 文件类型字段名列表
  const fileFieldKeys = ['uploadedDietFiles', 'typicalDietWorkday', 'typicalDietWeekend'];

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 获取文件图标
  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />;
      case 'image':
        return <FileImageOutlined style={{ fontSize: 20, color: '#1890ff' }} />;
      default:
        return <FileOutlined style={{ fontSize: 20, color: '#666' }} />;
    }
  };

  // 从 URL 推断文件类型
  const guessFileType = (url: string): string => {
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    return 'other';
  };

  // 预览文件（新标签页打开）
  const handleViewFile = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 解析文件列表（兼容 string[] URL 和 FileItem[] 对象两种格式）
  const parseFileList = (value: unknown): FileItem[] => {
    if (!Array.isArray(value)) return [];
    return value.map((item): FileItem => {
      if (typeof item === 'string') {
        return { url: item, type: guessFileType(item) };
      }
      return {
        name: item.name,
        url: item.url,
        size: item.size,
        type: item.type || guessFileType(item.url || ''),
      };
    }).filter(f => f.url);
  };

  // 渲染文件列表
  const renderFileList = (value: unknown) => {
    const files = parseFileList(value);
    if (files.length === 0) return '-';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {files.map((file, index) => {
          const fileName = file.name || file.url.split('/').pop()?.split('?')[0] || `文件${index + 1}`;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#fafafa',
                borderRadius: 6,
                border: '1px solid #f0f0f0',
              }}
            >
              <div style={{ marginRight: 10 }}>
                {getFileIcon(file.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fileName}
                </Text>
                {file.size && (
                  <Text type="secondary" style={{ fontSize: 12 }}>{formatFileSize(file.size)}</Text>
                )}
              </div>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleViewFile(file.url)}
              >
                下载
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  // 尝试解析可能是 JSON 字符串的值
  const tryParseJson = (value: unknown): unknown => {
    if (typeof value === 'string' && value.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* 不是有效 JSON，按原值处理 */ }
    }
    return value;
  };

  // 渲染字段值
  const renderFieldValue = (key: string, value: unknown) => {
    if (fileFieldKeys.includes(key)) {
      const parsed = tryParseJson(value);
      if (Array.isArray(parsed) || (typeof parsed === 'string' && parsed.startsWith('http'))) {
        return renderFileList(parsed);
      }
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return JSON.stringify(value);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const numericId = parseInt(id, 10);
        const res = isSleepSurvey
          ? await sleepSurveyApi.getDetail(numericId)
          : await nutritionSurveyApi.getDetail(numericId);

        if (res.code === 0 && res.data) {
          setDetail(res.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, isSleepSurvey]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) {
    return <Empty description="问卷详情不存在" />;
  }

  const formEntries = Object.entries(detail.formData || {});
  const statusInfo = statusMap[detail.feishuSyncStatus] || { text: detail.feishuSyncStatus, color: 'default' };

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(isSleepSurvey ? '/sleep-survey' : '/nutrition-survey')}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回列表
      </Button>

      <h2 style={{ marginBottom: 24 }}>{isSleepSurvey ? '睡眠问卷详情' : '营养问卷详情'} #{detail.id}</h2>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="订单编号">
            <Text copyable style={{ fontFamily: 'monospace' }}>{detail.orderNo}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="用户ID">{detail.userId}</Descriptions.Item>
          <Descriptions.Item label="姓名">{detail.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{detail.phone}</Descriptions.Item>
          <Descriptions.Item label="提交人">{detail.submittedBy || '-'}</Descriptions.Item>
          <Descriptions.Item label="版本号">{detail.versionNumber}</Descriptions.Item>
          <Descriptions.Item label="提交时间">{detail.submittedAt ? dayjs(detail.submittedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{detail.updatedAt ? dayjs(detail.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
          <Descriptions.Item label="飞书同步状态">
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="飞书记录ID">{detail.feishuRecordId || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="问卷内容">
        {formEntries.length === 0 ? (
          <Empty description="暂无问卷字段数据" />
        ) : (
          <Descriptions bordered size="small" column={1}>
            {formEntries.map(([key, value]) => (
              <Descriptions.Item key={key} label={fieldLabels[key] ?? key}>
                {renderFieldValue(key, value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default SurveyDetailPage;
