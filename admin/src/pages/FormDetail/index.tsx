import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, Typography, Divider, Input, Select, Checkbox, Radio, InputNumber, Slider, Form, Row, Col, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DownloadOutlined, EyeOutlined, FilePdfOutlined, FileImageOutlined, FileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface HealthFormData {
  name: string;
  phone: string;
  emergencyContact: string;
  diseases: { name: string; date: string }[];
  medications: { name: string; dosage: string }[];
  surgery: { has: string; detail: string };
  allergy: { has: string; detail: string };
  vascular: { qualified: string; reason: string };
  familyHistory: string[];
  familyHistoryOther: string;
  familyHistoryNote: string;
  dietModes: string[];
  drinks: string[];
  drinksOther: string;
  mealFeeling: string[];
  mealFeelingOther: string;
  dietRestriction: string;
  exerciseTypes: string[];
  exerciseFrequency: string;
  exerciseDuration: string;
  sleepDuration: string;
  sleepQuality: string;
  wakeUpFeeling: string[];
  stressLevel: number;
  anxietyFrequency: string;
  brainFog: string[];
  brainFogOther: string;
  healthConcerns: string;
  uploadedFiles?: { name: string; size: number; url: string; type: string }[];
}

interface ArchiveDetail {
  id: number;
  orderNo: string;
  userId: number;
  name: string;
  phone: string;
  submittedBy: string;
  versionNumber: number;
  submittedAt: string;
  updatedAt: string;
  feishuSyncStatus: string;
  feishuRecordId: string;
  formData: HealthFormData;
}

interface BookingDetail {
  id: number;
  orderNo: string;
  userId: number;
  name: string;
  phone: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  brief: string;
  versionNumber: number;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  feishuSyncStatus: string;
  feishuRecordId: string;
}

// 模拟预约详情数据
const mockBookingDetail: BookingDetail = {
  id: 1,
  orderNo: 'BH20260328001',
  userId: 100,
  name: '张三',
  phone: '13800138001',
  consultationType: '重疾咨询',
  preferredDate: '2026-03-30',
  preferredTime: '14:00',
  brief: '想咨询一下关于肺癌早期筛查的相关问题，家族有病史。',
  versionNumber: 1,
  submittedAt: '2026-03-28T10:00:00',
  updatedAt: '2026-03-28T10:00:00',
  submittedBy: '张三',
  feishuSyncStatus: 'success',
  feishuRecordId: 'recXXXXXX',
};

// 模拟档案详情数据（完整健康表单）
const mockArchiveDetail: ArchiveDetail = {
  id: 1,
  orderNo: 'HA20260328001',
  userId: 100,
  name: '张三',
  phone: '13800138001',
  submittedBy: '张三',
  versionNumber: 1,
  submittedAt: '2026-03-28T10:00:00',
  updatedAt: '2026-03-28T10:00:00',
  feishuSyncStatus: 'success',
  feishuRecordId: 'recYYYYYY',
  formData: {
    name: '张三',
    phone: '13800138001',
    emergencyContact: '李四 13900139000',
    diseases: [
      { name: '高血压', date: '2023年5月' },
      { name: '糖尿病前期', date: '2024年1月' },
    ],
    medications: [
      { name: '络活喜', dosage: '5mg/日' },
      { name: '二甲双胍', dosage: '500mg/日' },
    ],
    surgery: { has: 'no', detail: '' },
    allergy: { has: 'yes', detail: '青霉素过敏' },
    vascular: { qualified: 'yes', reason: '' },
    familyHistory: ['心血管疾病', '糖尿病'],
    familyHistoryOther: '',
    familyHistoryNote: '父亲有冠心病史，母亲有糖尿病史',
    dietModes: ['混合膳食', '轻断食'],
    drinks: ['水', '咖啡', '茶'],
    drinksOther: '',
    mealFeeling: ['昏昏欲睡', '很快饥饿'],
    mealFeelingOther: '',
    dietRestriction: '少吃油腻食物',
    exerciseTypes: ['散步', '游泳'],
    exerciseFrequency: '3',
    exerciseDuration: '45',
    sleepDuration: '6-7 小时',
    sleepQuality: '需要一段时间（15-30分钟），或易醒但能再次入睡',
    wakeUpFeeling: ['需要一点时间"开机"，但白天状态尚可'],
    stressLevel: 6,
    anxietyFrequency: 'few',
    brainFog: ['记忆力下降', '注意力不集中'],
    brainFogOther: '',
    healthConcerns: '希望了解心血管疾病的预防措施',
    uploadedFiles: [
      { name: '体检报告2024.pdf', size: 2048000, url: '/mock-files/体检报告2024.pdf', type: 'pdf' },
      { name: '心电图检查报告.jpg', size: 512000, url: '/mock-files/心电图检查报告.jpg', type: 'image' },
    ],
  },
};

const FormDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [archiveDetail, setArchiveDetail] = useState<ArchiveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // 判断是预约还是档案
  const isBooking = location.pathname.startsWith('/booking');
  const formType = isBooking ? 'booking' : 'archive';

  useEffect(() => {
    // 模拟获取详情
    setTimeout(() => {
      if (isBooking) {
        setBookingDetail(mockBookingDetail);
        // 初始化预约表单数据
        form.setFieldsValue({
          name: mockBookingDetail.name,
          phone: mockBookingDetail.phone,
          consultationType: mockBookingDetail.consultationType,
          preferredDate: mockBookingDetail.preferredDate,
          preferredTime: mockBookingDetail.preferredTime,
          brief: mockBookingDetail.brief,
        });
      } else {
        setArchiveDetail(mockArchiveDetail);
        // 初始化表单数据
        form.setFieldsValue(mockArchiveDetail.formData);
      }
      setLoading(false);
    }, 500);
  }, [id, isBooking, form]);

  const syncStatusTag = (status: string) => {
    const colorMap: Record<string, string> = {
      success: 'green',
      pending: 'blue',
      failed: 'red',
    };
    const textMap: Record<string, string> = {
      success: '已同步',
      pending: '同步中',
      failed: '同步失败',
    };
    return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log('保存表单:', values);
      message.success('保存成功');
      setIsEditing(false);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 获取文件图标
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
      case 'image':
        return <FileImageOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      default:
        return <FileOutlined style={{ fontSize: 24, color: '#666' }} />;
    }
  };

  // 查看文件
  const handleViewFile = (file: { name: string; url: string; type: string }) => {
    if (file.type === 'image') {
      // 图片类型直接新窗口打开
      window.open(file.url, '_blank');
    } else {
      // PDF等文件新窗口打开
      window.open(file.url, '_blank');
    }
  };

  // 下载文件
  const handleDownloadFile = (file: { name: string; url: string }) => {
    // 模拟下载
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(`正在下载: ${file.name}`);
  };

  // 预约详情页面
  const renderBookingDetail = () => {
    if (!bookingDetail) return null;
    
    return (
      <>
        {/* 基础信息卡片 */}
        <Card style={{ marginBottom: 16 }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="记录 ID">{bookingDetail.id}</Descriptions.Item>
            <Descriptions.Item label="用户 ID">{bookingDetail.userId}</Descriptions.Item>
            <Descriptions.Item label="版本号">{bookingDetail.versionNumber}</Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {dayjs(bookingDetail.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {dayjs(bookingDetail.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="飞书同步状态">
              {syncStatusTag(bookingDetail.feishuSyncStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="飞书记录 ID">
              <Text copyable={!!bookingDetail.feishuRecordId}>
                {bookingDetail.feishuRecordId || '无'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="订单编号">
              <Text copyable style={{ fontFamily: 'monospace', color: '#1890ff' }}>
                {bookingDetail.orderNo}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="提交人">{bookingDetail.submittedBy}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 编辑按钮 */}
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          {isEditing ? (
            <Space>
              <Button onClick={() => { setIsEditing(false); form.resetFields(); }}>取消</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存修改</Button>
            </Space>
          ) : (
            <Button type="primary" onClick={() => setIsEditing(true)}>编辑表单</Button>
          )}
        </div>

        <Form form={form} layout="vertical" disabled={!isEditing}>
          <Card title={<><Tag color="blue">预约信息</Tag></>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="姓名" name="name">
                  <Input placeholder="请输入姓名" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="联系电话" name="phone">
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="咨询类型" name="consultationType">
                  <Select placeholder="请选择咨询类型">
                    <Select.Option value="重疾咨询">重疾咨询</Select.Option>
                    <Select.Option value="慢病管理">慢病管理</Select.Option>
                    <Select.Option value="健康资产规划">健康资产规划</Select.Option>
                    <Select.Option value="其他">其他</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="首选联系日期" name="preferredDate">
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="首选联系时间" name="preferredTime">
                  <Input type="time" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="简要说明" name="brief">
              <TextArea rows={3} placeholder="请输入简要说明" />
            </Form.Item>
          </Card>
        </Form>
      </>
    );
  };

  // 档案详情页面（深度健康表单）
  const renderArchiveDetail = () => {
    if (!archiveDetail) return null;

    return (
      <>
        {/* 基础信息卡片 */}
        <Card style={{ marginBottom: 16 }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="记录 ID">{archiveDetail.id}</Descriptions.Item>
            <Descriptions.Item label="用户 ID">{archiveDetail.userId}</Descriptions.Item>
            <Descriptions.Item label="版本号">{archiveDetail.versionNumber}</Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {dayjs(archiveDetail.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {dayjs(archiveDetail.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="飞书同步状态">
              {syncStatusTag(archiveDetail.feishuSyncStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="飞书记录 ID">
              <Text copyable>{archiveDetail.feishuRecordId || '无'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="订单编号">
              <Text copyable style={{ fontFamily: 'monospace', color: '#722ed1' }}>
                {archiveDetail.orderNo}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="提交人">{archiveDetail.submittedBy}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 编辑按钮 */}
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          {isEditing ? (
            <Space>
              <Button onClick={() => { setIsEditing(false); form.resetFields(); }}>取消</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存修改</Button>
            </Space>
          ) : (
            <Button type="primary" onClick={() => setIsEditing(true)}>编辑表单</Button>
          )}
        </div>

        <Form form={form} layout="vertical" disabled={!isEditing}>
          {/* Section 1: 基本信息 */}
          <Card title={<><Tag color="blue">01</Tag> 基本信息</>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="姓名" name="name">
                  <Input placeholder="请输入姓名" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="联系电话" name="phone">
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="紧急联系人/电话" name="emergencyContact">
                  <Input placeholder="紧急联系方式" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 2: 深度生理健康背景 */}
          <Card title={<><Tag color="blue">02</Tag> 深度生理健康背景</>} style={{ marginBottom: 16 }}>
            {/* 当前疾病 */}
            <Form.Item label="当前疾病">
              <Form.List name="diseases">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={16} key={key} style={{ marginBottom: 8 }}>
                        <Col span={10}>
                          <Form.Item {...restField} name={[name, 'name']} noStyle>
                            <Input placeholder="诊断名称" />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...restField} name={[name, 'date']} noStyle>
                            <Input placeholder="确诊时间" />
                          </Form.Item>
                        </Col>
                        {isEditing && (
                          <Col span={4}>
                            <Button danger onClick={() => remove(name)}>删除</Button>
                          </Col>
                        )}
                      </Row>
                    ))}
                    {isEditing && <Button type="dashed" onClick={() => add()}>+ 添加诊断</Button>}
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Divider />

            {/* 目前用药记录 */}
            <Form.Item label="目前用药记录">
              <Form.List name="medications">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={16} key={key} style={{ marginBottom: 8 }}>
                        <Col span={10}>
                          <Form.Item {...restField} name={[name, 'name']} noStyle>
                            <Input placeholder="药物名称" />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...restField} name={[name, 'dosage']} noStyle>
                            <Input placeholder="剂量/频率" />
                          </Form.Item>
                        </Col>
                        {isEditing && (
                          <Col span={4}>
                            <Button danger onClick={() => remove(name)}>删除</Button>
                          </Col>
                        )}
                      </Row>
                    ))}
                    {isEditing && <Button type="dashed" onClick={() => add()}>+ 添加药物</Button>}
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Divider />

            {/* 手术史和过敏史 */}
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="手术史">
                  <Space>
                    <Form.Item name={['surgery', 'has']} noStyle>
                      <Radio.Group>
                        <Radio value="no">无</Radio>
                        <Radio value="yes">有</Radio>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => 
                        getFieldValue(['surgery', 'has']) === 'yes' && (
                          <Form.Item name={['surgery', 'detail']} noStyle>
                            <Input placeholder="请说明手术名称及时间" style={{ width: 200 }} />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                  </Space>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="过敏史">
                  <Space>
                    <Form.Item name={['allergy', 'has']} noStyle>
                      <Radio.Group>
                        <Radio value="no">无</Radio>
                        <Radio value="yes">有</Radio>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => 
                        getFieldValue(['allergy', 'has']) === 'yes' && (
                          <Form.Item name={['allergy', 'detail']} noStyle>
                            <Input placeholder="请说明过敏源" style={{ width: 200 }} />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                  </Space>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            {/* 血管评估 */}
            <Form.Item label="血管评估">
              <Space>
                <Form.Item name={['vascular', 'qualified']} noStyle>
                  <Radio.Group>
                    <Radio value="yes">合格（适合留置针操作）</Radio>
                    <Radio value="no">不合格</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => 
                    getFieldValue(['vascular', 'qualified']) === 'no' && (
                      <Form.Item name={['vascular', 'reason']} noStyle>
                        <Input placeholder="原因" style={{ width: 200 }} />
                      </Form.Item>
                    )
                  }
                </Form.Item>
              </Space>
            </Form.Item>

            <Divider />

            {/* 家族史 */}
            <Form.Item label="家族史（直系亲属是否有以下情况）">
              <Form.Item name="familyHistory" noStyle>
                <Checkbox.Group>
                  <Row>
                    {['心血管疾病', '糖尿病', '阿尔兹海默症', '肿瘤', '其他'].map(item => (
                      <Col span={4} key={item}>
                        <Checkbox value={item}>{item}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => 
                  getFieldValue('familyHistory')?.includes('其他') && (
                    <Form.Item name="familyHistoryOther" style={{ marginTop: 8 }}>
                      <Input placeholder="请补充其他家族病史" />
                    </Form.Item>
                  )
                }
              </Form.Item>
            </Form.Item>
            <Form.Item label="体检疑问/诉求" name="familyHistoryNote">
              <TextArea rows={2} placeholder="请注明具体类型或其他补充" />
            </Form.Item>
          </Card>

          {/* Section 3: 精细化生活方式评估 */}
          <Card title={<><Tag color="blue">03</Tag> 精细化生活方式评估</>} style={{ marginBottom: 16 }}>
            {/* 饮食模式 */}
            <Title level={5}>饮食模式</Title>
            <Form.Item name="dietModes">
              <Checkbox.Group>
                <Row>
                  {['混合膳食', '地中海饮食', '生酮饮食', '轻断食', '素食', '不规律'].map(item => (
                    <Col span={4} key={item}>
                      <Checkbox value={item}>{item}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item label="常饮饮品" name="drinks">
              <Checkbox.Group>
                <Row>
                  {['水', '咖啡', '茶', '酒精', '含/无糖饮料', '其他'].map(item => (
                    <Col span={4} key={item}>
                      <Checkbox value={item}>{item}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => 
                getFieldValue('drinks')?.includes('其他') && (
                  <Form.Item name="drinksOther">
                    <Input placeholder="请补充其他常饮饮品" />
                  </Form.Item>
                )
              }
            </Form.Item>

            <Form.Item label="餐后感受" name="mealFeeling">
              <Checkbox.Group>
                <Row>
                  {['精力充沛', '昏昏欲睡', '腹胀', '很快饥饿', '其他'].map(item => (
                    <Col span={4} key={item}>
                      <Checkbox value={item}>{item}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => 
                getFieldValue('mealFeeling')?.includes('其他') && (
                  <Form.Item name="mealFeelingOther">
                    <Input placeholder="请补充其他餐后感受" />
                  </Form.Item>
                )
              }
            </Form.Item>

            <Form.Item label="饮食忌口" name="dietRestriction">
              <Input placeholder="如有特殊饮食忌口请注明" />
            </Form.Item>

            <Divider />

            {/* 运动习惯 */}
            <Title level={5}>运动习惯</Title>
            <Form.Item name="exerciseTypes">
              <Checkbox.Group>
                <Row>
                  {['球类', '跳绳', '跑步', '散步', '游泳', '登山', '健身房'].map(item => (
                    <Col span={3} key={item}>
                      <Checkbox value={item}>{item}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="运动频率" name="exerciseFrequency">
                  <InputNumber addonAfter="周/次" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="平均时长" name="exerciseDuration">
                  <InputNumber addonAfter="分/次" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            {/* 睡眠情况 */}
            <Title level={5}>睡眠情况</Title>
            <Form.Item label="工作日平均睡眠时长" name="sleepDuration">
              <Radio.Group>
                <Radio value="< 6 小时">&lt; 6 小时</Radio>
                <Radio value="6-7 小时">6-7 小时</Radio>
                <Radio value="7-8 小时">7-8 小时</Radio>
                <Radio value="> 8 小时">&gt; 8 小时</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="入睡与质量" name="sleepQuality">
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="很快入睡（<15分钟），且夜间很少醒来">很快入睡（&lt;15分钟），且夜间很少醒来</Radio>
                  <Radio value="需要一段时间（15-30分钟），或易醒但能再次入睡">需要一段时间（15-30分钟），或易醒但能再次入睡</Radio>
                  <Radio value="入睡困难、夜间多醒且难以再入睡，伴有焦虑">入睡困难、夜间多醒且难以再入睡，伴有焦虑</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="早晨醒来后的感受" name="wakeUpFeeling">
              <Checkbox.Group>
                <Space direction="vertical">
                  <Checkbox value="神清气爽，精力充沛，白天几乎不困">神清气爽，精力充沛，白天几乎不困</Checkbox>
                  <Checkbox value={'需要一点时间"开机"，但白天状态尚可'}>需要一点时间"开机"，但白天状态尚可</Checkbox>
                  <Checkbox value="感觉疲惫，仿佛没睡够，白天需要靠咖啡/茶提神">感觉疲惫，仿佛没睡够，白天需要靠咖啡/茶提神</Checkbox>
                  <Checkbox value="无论睡多久都感觉疲惫，白天精神不济，影响注意力">无论睡多久都感觉疲惫，白天精神不济，影响注意力</Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Divider />

            {/* 压力、情绪与脑雾 */}
            <Title level={5}>压力、情绪与脑雾</Title>
            <Form.Item label="压力水平评价 (1-10, 1最小)" name="stressLevel">
              <Slider min={1} max={10} marks={{ 1: '低（1）', 5: '5', 10: '高（10）' }} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="近两周焦虑/担忧频率" name="anxietyFrequency">
                  <Select placeholder="请选择">
                    <Select.Option value="none">没有</Select.Option>
                    <Select.Option value="few">几天</Select.Option>
                    <Select.Option value="half">一半以上</Select.Option>
                    <Select.Option value="daily">每天</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="脑雾/记忆力表现" name="brainFog">
                  <Checkbox.Group>
                    <Row>
                      {['记忆力下降', '注意力不集中', '思维迟缓', '其他'].map(item => (
                        <Col span={12} key={item}>
                          <Checkbox value={item}>{item}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => 
                    getFieldValue('brainFog')?.includes('其他') && (
                      <Form.Item name="brainFogOther">
                        <Input placeholder="请补充其他脑雾/记忆力表现" />
                      </Form.Item>
                    )
                  }
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 4: 上传附件 */}
          <Card title={<><Tag color="blue">04</Tag> 上传附件</>}>
            {archiveDetail.formData.uploadedFiles && archiveDetail.formData.uploadedFiles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {archiveDetail.formData.uploadedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      background: '#fafafa', 
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <div style={{ marginRight: 12 }}>
                      {getFileIcon(file.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatFileSize(file.size)}
                      </Text>
                    </div>
                    <Space>
                      <Button 
                        type="link" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewFile(file)}
                      >
                        查看
                      </Button>
                      <Button 
                        type="link" 
                        icon={<DownloadOutlined />} 
                        onClick={() => handleDownloadFile(file)}
                      >
                        下载
                      </Button>
                    </Space>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">无上传附件</Text>
            )}
          </Card>
        </Form>
      </>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/${formType}`)}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回列表
      </Button>

      <h2 style={{ marginBottom: 24 }}>
        {isBooking ? '预约详情' : '档案详情'} #{id}
      </h2>

      {isBooking ? renderBookingDetail() : renderArchiveDetail()}
    </div>
  );
};

export default FormDetailPage;
