import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { HealthData, NutritionData, UserPreferences } from '@/src/types';
import type { AIAnalysis, AIRecommendation, AIContext } from '@/src/types';
import {
  imageObfuscator,
  type PhysiqueAnalysisResult,
  type PhysiqueGoal,
} from '../../src/services/privacy/ImageObfuscator';
import { logger } from '../../utils/logger';
import {
  AIServiceError,
  ValidationError,
  ErrorCode,
  withRetry,
} from '../../utils/errors';

// Omni-Logger Intent Types
export type IntentType = 
  | 'LOG_FOOD' 
  | 'LOG_WORKOUT' 
  | 'LOG_WEIGHT' 
  | 'LOG_CYCLE' 
  | 'ADD_PANTRY'
  | 'GENERAL_HELP'
  | 'UNKNOWN';

export interface Intent {
  type: IntentType;
  confidence: number;
  parameters: Record<string, any>;
  rawText: string;
  timestamp: string;
}

export interface IntentExecutionResult {
  intent: Intent;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface OmniLoggerContext {
  userText: string;
  timestamp: string;
  userContext?: AIContext;
  previousIntents?: Intent[];
}

// Input validation constants
const MAX_INPUT_LENGTH = 500;
const MAX_CONTEXT_LENGTH = 2000;
const FORBIDDEN_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:/i,
  /\{\{/,  // Template injection
  /\$\{/,  // Template literal injection
  /prompt:/i,
  /system:/i,
  /ignore previous/i,
  /disregard/i,
];

/**
 * Input validation error (extends from centralized error handling)
 */
export class InputValidationError extends ValidationError {
  constructor(message: string) {
    super({
      code: ErrorCode.VALIDATION_FORBIDDEN_INPUT,
      message,
    });
  }
}

/**
 * Gemini AI服务
 * 提供智能健康分析和个性化推荐
 */
class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private apiKey: string;
  private isInitialized = false;

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      '';
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Sanitize and validate user input
   * Prevents prompt injection and ensures input safety
   */
  private sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
    // Check for null/undefined
    if (!input || typeof input !== 'string') {
      throw new InputValidationError('Invalid input: must be a non-empty string');
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Check minimum length
    if (sanitized.length === 0) {
      throw new InputValidationError('Input cannot be empty');
    }

    // Truncate if too long
    if (sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength);
      logger.warn(`Input truncated from ${input.length} to ${maxLength} characters`);
    }

    // Check for forbidden patterns (potential prompt injection)
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(sanitized)) {
        logger.warn('Potentially malicious input detected:', sanitized.slice(0, 50));
        throw new InputValidationError('Invalid input detected');
      }
    }

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    return sanitized;
  }

  /**
   * Validate and sanitize context object
   */
  private sanitizeContext(context?: OmniLoggerContext): OmniLoggerContext | undefined {
    if (!context) return undefined;

    return {
      ...context,
      userText: this.sanitizeInput(context.userText, MAX_CONTEXT_LENGTH),
      timestamp: context.timestamp || new Date().toISOString(),
    };
  }

  /**
   * 初始化AI服务
   */
  async initialize(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new ValidationError({
          code: ErrorCode.VALIDATION_REQUIRED,
          message: 'Gemini API key is required',
          field: 'apiKey',
        });
      }

      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      // 测试连接
      await this.testConnection();
      this.isInitialized = true;
      logger.log('Gemini AI service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Gemini AI initialization failed:', error);
      return false;
    }
  }

  /**
   * 测试API连接
   */
  private async testConnection(): Promise<void> {
    try {
      const result = await withRetry(
        async () => {
          const response = await this.model.generateContent('Hello');
          return response.response;
        },
        { maxAttempts: 2, delayMs: 1000 }
      );
    } catch (error) {
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: `Gemini API connection test failed: ${error}`,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Simple Client-Side Safety Check (The Real protection happens in Supabase Edge Functions)
   */
  private async checkUsageLimit(userId?: string): Promise<void> {
    if (!userId) {
      return;
    }

    const supabaseUrl =
      process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey =
      process.env.EXPO_PUBLIC_SUPABASE_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || typeof fetch !== 'function') {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const url = `${supabaseUrl}/rest/v1/usage_logs?select=token_count&user_id=eq.${encodeURIComponent(userId)}&date=gte.${today}`;

    let response: any;
    try {
      response = await fetch(url, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
    } catch (error) {
      logger.warn('Usage limit check failed:', error);
      return;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      logger.warn('Usage limit check failed:', response.status, errorBody);
      return;
    }

    let data: Array<{ token_count?: number }> = [];
    try {
      const json = await response.json();
      if (Array.isArray(json)) {
        data = json;
      }
    } catch (error) {
      logger.warn('Usage limit check failed:', error);
      return;
    }

    const totalTokens = data.reduce(
      (sum, log) => sum + Number(log?.token_count || 0),
      0
    );

    // If user hits 100,000 tokens in ONE DAY (insane usage), pause them.
    if (totalTokens > 100000) {
      throw new AIServiceError({
        code: ErrorCode.AI_RATE_LIMITED,
        message: 'Daily AI Safety Limit Reached. Please try again tomorrow.',
        userMessage: 'Daily AI Safety Limit Reached. Please try again tomorrow.',
        recoverable: true,
      });
    }
  }

  /**
   * 分析健康数据并提供建议
   */
  async analyzeHealthData(context: AIContext): Promise<AIAnalysis> {
    if (!this.isInitialized) {
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: 'Gemini service not initialized',
        recoverable: true,
      });
    }

    await this.checkUsageLimit(context.user.id);

    try {
      const prompt = this.buildHealthAnalysisPrompt(context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAnalysisResponse(text, context);
    } catch (error) {
      logger.error('Health analysis failed:', error);
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: `AI analysis failed: ${error}`,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * 构建健康分析提示词
   */
  private buildHealthAnalysisPrompt(context: AIContext): string {
    const { user, healthData, nutritionData, preferences } = context;

    return `你是一个专业的健康顾问AI。请基于以下用户数据提供健康分析和个性化建议：

用户信息：
- 年龄: ${user.age || '未设置'}
- 性别: ${user.gender || '未设置'}
- 身高: ${user.height || '未设置'} cm
- 体重: ${user.weight || '未设置'} kg
- 健身目标: ${user.fitnessGoals?.join(', ') || '未设置'}

健康数据：
${healthData.map(data => `- ${data.type}: ${data.value} ${data.unit} (${new Date(data.timestamp).toLocaleDateString()})`).join('\n')}

营养数据：
${nutritionData.map(data => `- ${data.mealType}: ${data.calories} 卡路里, ${data.protein}g 蛋白质, ${data.carbs}g 碳水, ${data.fat}g 脂肪`).join('\n')}

用户偏好：
- 饮食偏好: ${preferences.dietaryPreferences?.join(', ') || '无'}
- 通知设置: ${preferences.notifications ? '开启' : '关闭'}

请提供：
1. 健康状况总体评估
2. 具体改进建议
3. 个性化目标设定
4. 下一步行动建议

请用JSON格式返回，包含以下字段：
- overallAssessment (总体评估)
- specificRecommendations (具体建议数组)
- personalizedGoals (个性化目标)
- nextSteps (下一步行动)

保持建议专业、实用且可操作。`;
  }

  /**
   * 解析AI响应
   */
  private parseAnalysisResponse(response: string, context: AIContext): AIAnalysis {
    try {
      // 尝试解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // 如果JSON解析失败，返回默认结构
      return {
        overallAssessment: 'AI分析完成，请查看具体建议',
        specificRecommendations: [
          '保持规律的作息时间',
          '均衡饮食，适量运动',
          '定期监测健康指标'
        ],
        personalizedGoals: this.generateDefaultGoals(context),
        nextSteps: ['继续跟踪健康数据', '下周重新评估进展'],
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      return this.generateFallbackAnalysis(context);
    }
  }

  /**
   * 生成默认目标
   */
  private generateDefaultGoals(context: AIContext): string[] {
    const goals = [];
    
    if (context.healthData.some(data => data.type === 'steps' && data.value < 8000)) {
      goals.push('每日步数目标：8000步');
    }
    
    if (context.healthData.some(data => data.type === 'sleep' && data.value < 7)) {
      goals.push('睡眠目标：每晚7-8小时');
    }
    
    goals.push('每周至少150分钟中等强度运动');
    goals.push('每日饮水2升以上');
    
    return goals;
  }

  /**
   * 生成备用分析结果
   */
  private generateFallbackAnalysis(context: AIContext): AIAnalysis {
    return {
      overallAssessment: '系统正在优化分析能力，暂时提供基础建议',
      specificRecommendations: [
        '保持数据记录的一致性',
        '关注体重和体脂率变化趋势',
        '结合营养数据调整饮食结构'
      ],
      personalizedGoals: this.generateDefaultGoals(context),
      nextSteps: ['完善个人健康信息', '联系专业健康顾问获取详细建议'],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 生成个性化营养建议
   */
  async generateNutritionRecommendation(
    nutritionData: NutritionData[], 
    preferences: UserPreferences,
    userId?: string
  ): Promise<AIRecommendation> {
    if (!this.isInitialized) {
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: 'Gemini service not initialized',
        recoverable: true,
      });
    }

    await this.checkUsageLimit(userId);

    try {
      const prompt = `基于以下营养数据和用户偏好，提供个性化的饮食建议：

近期营养摄入：
${nutritionData.map(data => `- ${data.mealType}: ${data.calories}卡, 蛋白质${data.protein}g, 碳水${data.carbs}g, 脂肪${data.fat}g`).join('\n')}

用户饮食偏好：${preferences.dietaryPreferences?.join(', ') || '无特殊偏好'}

请提供：
1. 营养平衡分析
2. 具体饮食改进建议
3. 推荐食谱想法
4. 购物清单建议

用友好的语气提供实用建议。`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        type: 'nutrition',
        title: '个性化营养建议',
        content: response.text(),
        priority: 'medium',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Nutrition recommendation failed:', error);
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: `Nutrition analysis failed: ${error}`,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * 生成运动计划
   */
  async generateWorkoutPlan(
    fitnessLevel: string,
    availableTime: number,
    equipment: string[],
    goals: string[],
    userId?: string
  ): Promise<AIRecommendation> {
    if (!this.isInitialized) {
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: 'Gemini service not initialized',
        recoverable: true,
      });
    }

    await this.checkUsageLimit(userId);

    try {
      const prompt = `为用户生成个性化运动计划：

健身水平：${fitnessLevel}
可用时间：每周${availableTime}分钟
可用设备：${equipment.join(', ') || '无器械'}
健身目标：${goals.join(', ')}

请提供：
1. 周运动计划安排
2. 具体训练内容
3. 进度调整建议
4. 安全注意事项

确保计划实用、安全且符合用户条件。`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        type: 'workout',
        title: '个性化运动计划',
        content: response.text(),
        priority: 'high',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Workout plan generation failed:', error);
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: `Workout plan generation failed: ${error}`,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Physique Analysis (Gemini Vision)
   */
  async analyzePhysique(
    imageUri: string,
    goal: PhysiqueGoal,
    userId?: string
  ): Promise<PhysiqueAnalysisResult> {
    if (!this.isInitialized) {
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: 'Gemini service not initialized',
        recoverable: true,
      });
    }

    await this.checkUsageLimit(userId);

    try {
      const { base64, localUri, mimeType } =
        await imageObfuscator.prepareForAnalysis(imageUri);

      const prompt = `Act as an IFBB Pro Bodybuilding Judge. Analyze this physique photo.
Output strict JSON only:
{
  'est_body_fat': number,
  'muscle_maturity': number (0-100),
  'symmetry_score': number (0-100),
  'strengths': string[], // e.g. 'Wide clavicles', 'Low abdominal fat'
  'weaknesses': string[], // e.g. 'Upper chest thickness', 'Calves'
  'actionable_feedback': string // Direct, spartan advice.
}
Be objective. Do not be polite. Be accurate.
Goal: ${goal}`;

      const visionModel = this.genAI.getGenerativeModel({
        model: 'gemini-pro-vision',
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      });

      const result = await visionModel.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType,
          },
        },
      ]);
      const response = await result.response;
      const text = response.text();
      const analysis = this.parsePhysiqueResponse(text);

      await imageObfuscator.saveAnalysisResult({
        userId,
        goal,
        result: analysis,
        imageLocalUri: localUri,
        createdAt: new Date().toISOString(),
      });

      return analysis;
    } catch (error) {
      logger.error('Physique analysis failed:', error);
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: `Physique analysis failed: ${error}`,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  private parsePhysiqueResponse(response: string): PhysiqueAnalysisResult {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AIServiceError({
        code: ErrorCode.AI_INVALID_RESPONSE,
        message: 'Invalid physique analysis response',
        recoverable: true,
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const toNumber = (value: unknown, field: string): number => {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        throw new AIServiceError({
          code: ErrorCode.AI_INVALID_RESPONSE,
          message: `Invalid ${field} value`,
          recoverable: true,
        });
      }
      return num;
    };

    return {
      est_body_fat: toNumber(parsed.est_body_fat, 'est_body_fat'),
      muscle_maturity: toNumber(parsed.muscle_maturity, 'muscle_maturity'),
      symmetry_score: toNumber(parsed.symmetry_score, 'symmetry_score'),
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.map((item: unknown) => String(item))
        : [],
      weaknesses: Array.isArray(parsed.weaknesses)
        ? parsed.weaknesses.map((item: unknown) => String(item))
        : [],
      actionable_feedback:
        typeof parsed.actionable_feedback === 'string'
          ? parsed.actionable_feedback
          : '',
    };
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      model: 'gemini-pro',
      hasApiKey: !!this.apiKey
    };
  }

  /**
   * 设置API密钥
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.isInitialized = false; // 需要重新初始化
  }

  /**
   * Omni-Logger: 处理自然语言输入并识别意图
   * Includes input sanitization to prevent prompt injection
   */
  async processNaturalLanguage(input: string, context?: OmniLoggerContext): Promise<Intent[]> {
    if (!this.isInitialized) {
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: 'Gemini service not initialized',
        recoverable: true,
      });
    }

    // Sanitize input before processing
    let sanitizedInput: string;
    let sanitizedContext: OmniLoggerContext | undefined;

    try {
      sanitizedInput = this.sanitizeInput(input);
      sanitizedContext = this.sanitizeContext(context);
    } catch (error) {
      if (error instanceof InputValidationError) {
        logger.warn('Input validation failed:', error.message);
        return [{
          type: 'UNKNOWN',
          confidence: 0,
          parameters: { error: 'Invalid input' },
          rawText: input.slice(0, 100), // Only store truncated raw text
          timestamp: new Date().toISOString()
        }];
      }
      throw error;
    }

    await this.checkUsageLimit(sanitizedContext?.userContext?.user.id);

    try {
      const prompt = this.buildIntentRecognitionPrompt(sanitizedInput, sanitizedContext);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseIntentResponse(text, sanitizedInput);
    } catch (error) {
      logger.error('Natural language processing failed:', error);
      return this.generateFallbackIntents(sanitizedInput);
    }
  }

  /**
   * 构建意图识别提示词
   */
  private buildIntentRecognitionPrompt(input: string, context?: OmniLoggerContext): string {
    const userContext = context?.userContext;
    
    return `你是一个智能健康助手。请分析用户的自然语言输入并识别其中的意图。

用户输入: "${input}"

可用意图分类:
1. LOG_FOOD - 记录食物摄入 (如: "我吃了苹果", "早餐: 煎蛋和面包")
2. LOG_WORKOUT - 记录运动 (如: "跑了5公里", "今天做了力量训练")
3. LOG_WEIGHT - 记录体重 (如: "体重75公斤", "早上称重76.5")
4. LOG_CYCLE - 记录生理周期 (如: "月经第一天", "排卵期开始")
5. ADD_PANTRY - 添加食材到库存 (如: "买了牛奶", "冰箱有鸡蛋")

用户背景信息:
${userContext ? `
- 年龄: ${userContext.user.age || '未知'}
- 性别: ${userContext.user.gender || '未知'}
- 健身目标: ${userContext.user.fitnessGoals?.join(', ') || '无'}
` : '无可用背景信息'}

请逐条分析输入中可能包含的意图，并为每个意图提取相关参数。
返回严格的JSON格式，格式如下:
{
  "intents": [
    {
      "type": "LOG_FOOD",
      "confidence": 0.95,
      "parameters": {
        "foodItems": ["苹果"],
        "mealType": "snack",
        "quantity": "1个"
      }
    }
  ]
}

注意:
- 可以返回多个意图
- confidence值范围0-1
- parameters根据意图类型灵活定义
- 如果无法识别明确意图，返回空数组或单个UNKNOWN意图`;
  }

  /**
   * 解析意图识别响应
   */
  private parseIntentResponse(response: string, originalInput: string): Intent[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const intents: Intent[] = parsed.intents || [];
        
        // 为每个意图添加原始文本和时间戳
        return intents.map(intent => ({
          ...intent,
          rawText: originalInput,
          timestamp: new Date().toISOString()
        }));
      }

      // 如果JSON解析失败，使用规则匹配
      return this.ruleBasedIntentRecognition(originalInput);
    } catch (error) {
      logger.error('Failed to parse intent response:', error);
      return this.ruleBasedIntentRecognition(originalInput);
    }
  }

  /**
   * 基于规则的意图识别 (离线备用方案)
   */
  private ruleBasedIntentRecognition(input: string): Intent[] {
    const intents: Intent[] = [];
    const lowerInput = input.toLowerCase();

    // 食物相关关键词
    const foodKeywords = ['吃', '喝', '早餐', '午餐', '晚餐', '零食', '食物', '饭', '餐'];
    const workoutKeywords = ['跑', '走', '运动', '锻炼', '健身', '训练', '举重', '瑜伽'];
    const weightKeywords = ['体重', '公斤', '斤', '称重', '秤'];
    const cycleKeywords = ['月经', '周期', '排卵', '生理期', '例假'];
    const pantryKeywords = ['买', '购买', '库存', '冰箱', '食材', '食物'];

    // 检查各种意图
    if (foodKeywords.some(keyword => lowerInput.includes(keyword))) {
      intents.push({
        type: 'LOG_FOOD',
        confidence: 0.7,
        parameters: { detectedFoods: this.extractFoodItems(input) },
        rawText: input,
        timestamp: new Date().toISOString()
      });
    }

    if (workoutKeywords.some(keyword => lowerInput.includes(keyword))) {
      intents.push({
        type: 'LOG_WORKOUT',
        confidence: 0.7,
        parameters: { activityType: this.extractActivityType(input) },
        rawText: input,
        timestamp: new Date().toISOString()
      });
    }

    if (weightKeywords.some(keyword => lowerInput.includes(keyword))) {
      intents.push({
        type: 'LOG_WEIGHT',
        confidence: 0.8,
        parameters: { weightValue: this.extractWeight(input) },
        rawText: input,
        timestamp: new Date().toISOString()
      });
    }

    if (cycleKeywords.some(keyword => lowerInput.includes(keyword))) {
      intents.push({
        type: 'LOG_CYCLE',
        confidence: 0.9,
        parameters: { cyclePhase: this.extractCyclePhase(input) },
        rawText: input,
        timestamp: new Date().toISOString()
      });
    }

    if (pantryKeywords.some(keyword => lowerInput.includes(keyword))) {
      intents.push({
        type: 'ADD_PANTRY',
        confidence: 0.6,
        parameters: { items: this.extractPantryItems(input) },
        rawText: input,
        timestamp: new Date().toISOString()
      });
    }

    // 如果没有任何匹配，返回未知意图
    if (intents.length === 0) {
      intents.push({
        type: 'UNKNOWN',
        confidence: 0.3,
        parameters: {},
        rawText: input,
        timestamp: new Date().toISOString()
      });
    }

    return intents;
  }

  /**
   * 提取食物项目
   */
  private extractFoodItems(input: string): string[] {
    const foodPatterns = [
      /(\d+个)?\s*([\u4e00-\u9fa5]+)/g,
      /([\u4e00-\u9fa5]{2,}饭)/g,
      /([\u4e00-\u9fa5]{2,}菜)/g
    ];
    
    const items: string[] = [];
    foodPatterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) items.push(...matches);
    });
    
    return items.length > 0 ? items : ['未知食物'];
  }

  /**
   * 提取运动类型
   */
  private extractActivityType(input: string): string {
    const activities = {
      '跑': '跑步',
      '走': '走路',
      '游泳': '游泳',
      '瑜伽': '瑜伽',
      '力量': '力量训练',
      '健身': '健身'
    };
    
    for (const [key, value] of Object.entries(activities)) {
      if (input.includes(key)) return value;
    }
    
    return '其他运动';
  }

  /**
   * 提取体重数值
   */
  private extractWeight(input: string): number | null {
    const weightMatch = input.match(/(\d+(?:\.\d+)?)\s*(公斤|kg|千克|斤)/);
    if (weightMatch) {
      let weight = parseFloat(weightMatch[1]);
      if (weightMatch[2] === '斤') weight = weight / 2; // 转换为公斤
      return weight;
    }
    return null;
  }

  /**
   * 提取生理周期阶段
   */
  private extractCyclePhase(input: string): string {
    if (input.includes('月经') || input.includes('例假')) return '月经期';
    if (input.includes('排卵')) return '排卵期';
    if (input.includes('黄体')) return '黄体期';
    return '未知';
  }

  /**
   * 提取食材项目
   */
  private extractPantryItems(input: string): string[] {
    return this.extractFoodItems(input); // 复用食物提取逻辑
  }

  /**
   * 生成备用意图
   */
  private generateFallbackIntents(input: string): Intent[] {
    return [{
      type: 'UNKNOWN',
      confidence: 0.1,
      parameters: { fallback: true },
      rawText: input,
      timestamp: new Date().toISOString()
    }];
  }

  /**
   * Context Engine: 每日健康指导生成
   * 基于睡眠质量和活动强度提供个性化健康建议
   */
  async generateDailyGuidance(
    metrics: { sleep: number; strain: number },
    userId?: string
  ): Promise<{
    status: 'Green' | 'Yellow' | 'Red';
    message: string;
    recommendations: string[];
    adjustments?: { calories?: number; reason?: string };
  }> {
    if (!this.isInitialized) {
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: 'Gemini service not initialized',
        recoverable: true,
      });
    }

    await this.checkUsageLimit(userId);

    try {
      const { sleep, strain } = metrics;
      
      // 构建健康分析提示词
      const prompt = `你是一个专业的健康顾问AI。请基于以下健康指标提供健康指导：

睡眠质量: ${sleep}/100
活动强度: ${strain}/100

分析规则:
1. 如果睡眠 < 50 且 活动强度 > 70: 红色警报 - 优先恢复
2. 如果睡眠 < 60 或 活动强度 > 80: 黄色警告 - 需要关注
3. 其他情况: 绿色正常 - 保持良好习惯

请以JSON格式返回:
{
  "status": "Green" | "Yellow" | "Red",
  "message": "详细的健康建议说明",
  "recommendations": ["建议1", "建议2", ...],
  "adjustments": {
    "calories": "可选的卡路里调整值",
    "reason": "调整原因"
  }
}

重点分析恢复需求和营养调整建议。`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 解析JSON响应
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const guidance = JSON.parse(jsonMatch[0]);
        
        // 验证和补充默认值
        return {
          status: guidance.status || 'Green',
          message: guidance.message || '保持当前健康习惯',
          recommendations: guidance.recommendations || ['保持规律作息', '均衡营养摄入'],
          adjustments: guidance.adjustments
        };
      }

      // JSON解析失败时的备用逻辑
      return this.generateFallbackGuidance(metrics);
    } catch (error) {
      logger.error('Daily guidance generation failed:', error);
      return this.generateFallbackGuidance(metrics);
    }
  }

  /**
   * 生成备用健康指导
   */
  private generateFallbackGuidance(metrics: { sleep: number; strain: number }): {
    status: 'Green' | 'Yellow' | 'Red';
    message: string;
    recommendations: string[];
    adjustments?: { calories?: number; reason?: string };
  } {
    const { sleep, strain } = metrics;

    // 基于规则的简单逻辑
    if (sleep < 50 && strain > 70) {
      const calorieAdjustment = Math.round(strain * 2); // 简单计算调整值
      return {
        status: 'Red',
        message: `睡眠债较高(${sleep}/100)且活动强度大(${strain}/100)。建议减少${calorieAdjustment}千卡赤字，优先恢复。`,
        recommendations: [
          '今晚保证7-8小时高质量睡眠',
          '明天减少高强度训练',
          '增加富含镁和蛋白质的食物',
          '进行放松活动如冥想或轻度拉伸'
        ],
        adjustments: {
          calories: -calorieAdjustment,
          reason: '高活动强度配合低睡眠质量，需要优先恢复'
        }
      };
    } else if (sleep < 60 || strain > 80) {
      return {
        status: 'Yellow',
        message: `需要注意：睡眠质量${sleep}/100，活动强度${strain}/100。保持观察。`,
        recommendations: [
          '关注睡眠质量改善',
          '适当调整训练强度',
          '确保充分水分摄入',
          '监测身体恢复状态'
        ]
      };
    } else {
      return {
        status: 'Green',
        message: `健康状况良好：睡眠${sleep}/100，活动${strain}/100。继续保持！`,
        recommendations: [
          '维持当前作息规律',
          '坚持适度运动',
          '均衡营养摄入',
          '定期健康评估'
        ]
      };
    }
  }

  /**
   * 增强的Omni-Logger意图处理
   * 使用更精确的系统提示词处理自然语言输入
   * Includes input sanitization to prevent prompt injection
   */
  async processNaturalLanguageEnhanced(input: string, context?: OmniLoggerContext): Promise<Intent[]> {
    if (!this.isInitialized) {
      throw new AIServiceError({
        code: ErrorCode.AI_SERVICE_ERROR,
        message: 'Gemini service not initialized',
        recoverable: true,
      });
    }

    // Sanitize input before processing
    let sanitizedInput: string;
    let sanitizedContext: OmniLoggerContext | undefined;

    try {
      sanitizedInput = this.sanitizeInput(input);
      sanitizedContext = this.sanitizeContext(context);
    } catch (error) {
      if (error instanceof InputValidationError) {
        logger.warn('Enhanced NLP input validation failed:', error.message);
        return this.ruleBasedIntentRecognition(input.slice(0, MAX_INPUT_LENGTH));
      }
      throw error;
    }

    await this.checkUsageLimit(sanitizedContext?.userContext?.user.id);

    try {
      const enhancedPrompt = this.buildEnhancedIntentPrompt(sanitizedInput, sanitizedContext);
      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      return this.parseIntentResponse(text, sanitizedInput);
    } catch (error) {
      logger.error('Enhanced natural language processing failed:', error);
      return this.ruleBasedIntentRecognition(sanitizedInput);
    }
  }

  /**
   * 构建增强的意图识别提示词
   */
  private buildEnhancedIntentPrompt(input: string, context?: OmniLoggerContext): string {
    const userContext = context?.userContext;
    
    return `你是我MyMacroAI的智能意图路由器。请严格分析用户输入并分类到以下意图类型：

可用意图分类:
- LOG_FOOD: 记录食物摄入 (参数: {items: string[], meal: string, quantity?: string})
- LOG_WORKOUT: 记录运动 (参数: {type: string, duration: number, intensity: string, distance?: number})
- LOG_WEIGHT: 记录体重 (参数: {amount: number, unit: string, time?: string})
- LOG_CYCLE: 记录生理周期 (参数: {phase: string, day?: number, symptoms?: string[]})
- ADD_PANTRY: 添加食材到库存 (参数: {item: string, quantity?: string, category?: string})
- GENERAL_HELP: 一般帮助请求
- UNKNOWN: 无法识别

用户输入: "${input}"

用户背景:
${userContext ? `
- 性别: ${userContext.user.gender || '未知'}
- 健身目标: ${userContext.user.fitnessGoals?.join(', ') || '无'}
- 饮食偏好: ${userContext.preferences?.dietaryPreferences?.join(', ') || '无'}
` : '无背景信息'}

处理规则:
1. 尽可能识别多个意图
2. 提取精确的参数值
3. 置信度基于匹配程度(0-1)
4. 参数格式必须严格一致

返回严格的JSON格式:
{
  "intents": [
    {
      "type": "LOG_FOOD",
      "confidence": 0.95,
      "parameters": {
        "items": ["苹果"],
        "meal": "snack",
        "quantity": "1个"
      }
    }
  ]
}

示例:
输入: "早餐吃了2个鸡蛋和1片面包，然后跑了5公里"
输出: {
  "intents": [
    {"type": "LOG_FOOD", "confidence": 0.9, "parameters": {"items": ["鸡蛋", "面包"], "meal": "breakfast", "quantity": "2个鸡蛋和1片面包"}},
    {"type": "LOG_WORKOUT", "confidence": 0.95, "parameters": {"type": "跑步", "duration": 30, "intensity": "中等", "distance": 5}}
  ]
}`;
  }
}

// 单例模式导出
export const geminiService = new GeminiService();
export default geminiService;
