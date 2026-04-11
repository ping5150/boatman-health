import { Request, Response, NextFunction } from 'express';
import { surveyService } from '../services/survey.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export const nutritionSurveyController = {
  /**
   * 提交营养问卷
   */
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const formData = req.body;

      const result = await surveyService.submitNutritionSurvey(userId, formData);

      sendCreated(res, result, '问卷提交成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 保存草稿
   */
  async saveDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const formData = req.body;

      const result = await surveyService.saveNutritionDraft(userId, formData);

      sendCreated(res, result, '草稿保存成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 获取用户问卷列表
   */
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await surveyService.getNutritionSurveyList(userId);
      sendSuccess(res, result, '获取成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 获取用户最新问卷
   */
  async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await surveyService.getNutritionSurveyLatest(userId);
      sendSuccess(res, result, '获取成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 获取问卷详情
   */
  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id as string, 10);
      const result = await surveyService.getNutritionSurveyDetail(userId, id);
      sendSuccess(res, result, '获取成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 更新问卷
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id as string, 10);
      const formData = req.body;

      const result = await surveyService.updateNutritionSurvey(userId, id, formData);

      sendSuccess(res, result, '更新成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },
};
