import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import form1Routes from './routes/form1.routes';
import form2Routes from './routes/form2.routes';
// import sleepSurveyRoutes from './routes/sleep-survey.routes'; // TODO: 稍后启用
// import nutritionSurveyRoutes from './routes/nutrition-survey.routes'; // TODO: 稍后启用
import adminRoutes from './routes/admin.routes';
// import uploadRoutes from './routes/upload.routes'; // TODO: 稍后启用

const app = express();

// 基础中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, _res, next) => {
  logger.info('HTTP', `${req.method} ${req.path}`);
  next();
});

// 路由挂载
app.use('/api/auth', authRoutes);
app.use('/api/form1', form1Routes);
app.use('/api/form2', form2Routes);
// app.use('/api/sleep-survey', sleepSurveyRoutes); // TODO: 稍后启用
// app.use('/api/nutrition-survey', nutritionSurveyRoutes); // TODO: 稍后启用
// app.use('/api/upload', uploadRoutes); // TODO: 稍后启用
app.use('/admin', adminRoutes);

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 全局错误处理
app.use(errorHandler);

// 启动服务
app.listen(env.PORT, () => {
  logger.info('APP', `服务已启动: http://localhost:${env.PORT}`);
  logger.info('APP', `运行环境: ${env.NODE_ENV}`);
});

export default app;
