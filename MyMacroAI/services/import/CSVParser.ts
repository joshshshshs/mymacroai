import type { DailyLog } from '../../types/user';
import type { NutritionData, WorkoutData, SleepData } from '../../types/health';
import { ErrorCode, ValidationError } from '../../utils/errors';

/**
 * MyFitnessPal CSV数据格式接口
 */
export interface MFPDataRow {
  Date: string;
  Calories: string;
  Carbs: string;
  Fat: string;
  Protein: string;
  Sodium: string;
  Sugar: string;
}

/**
 * CSV解析配置
 */
export interface CSVParserConfig {
  delimiter?: string;
  hasHeaders?: boolean;
  dateFormat?: string;
  skipEmptyLines?: boolean;
}

/**
 * CSV解析结果
 */
export interface CSVParserResult {
  success: boolean;
  data: DailyLog[];
  errors: string[];
  stats: {
    totalRows: number;
    validRows: number;
    errorCount: number;
    importDate: string;
  };
}

/**
 * CSV解析服务 - Legacy Bridge核心组件
 * 支持MyFitnessPal和其他健康应用数据导入
 */
export class CSVParserService {
  private config: Required<CSVParserConfig>;

  constructor(config: CSVParserConfig = {}) {
    this.config = {
      delimiter: ',',
      hasHeaders: true,
      dateFormat: 'MM/DD/YYYY',
      skipEmptyLines: true,
      ...config
    };
  }

  /**
   * 解析CSV数据并转换为应用格式
   */
  async parseCSVData(csvContent: string): Promise<CSVParserResult> {
    const result: CSVParserResult = {
      success: false,
      data: [],
      errors: [],
      stats: {
        totalRows: 0,
        validRows: 0,
        errorCount: 0,
        importDate: new Date().toISOString()
      }
    };

    try {
      const lines = csvContent.split('\n');
      result.stats.totalRows = lines.length;

      // 跳过标题行（如果存在）
      let startIndex = this.config.hasHeaders ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 跳过空行
        if (this.config.skipEmptyLines && !line) continue;
        
        try {
          const dailyLog = this.parseLine(line, i);
          if (dailyLog) {
            result.data.push(dailyLog);
            result.stats.validRows++;
          }
        } catch (error) {
          result.errors.push(`行 ${i + 1}: ${error}`);
          result.stats.errorCount++;
        }
      }

      result.success = result.stats.validRows > 0;
      return result;
    } catch (error) {
      result.errors.push(`解析失败: ${error}`);
      return result;
    }
  }

  /**
   * 解析单行CSV数据
   */
  private parseLine(line: string, lineNumber: number): DailyLog | null {
    const values = this.splitCSVLine(line);
    
    if (values.length < 5) {
      throw new ValidationError({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: '数据列不足',
        field: 'columns',
      });
    }

    // MyFitnessPal格式解析
    const mfpData: Partial<MFPDataRow> = {
      Date: values[0],
      Calories: values[1],
      Carbs: values[2],
      Fat: values[3],
      Protein: values[4],
      Sodium: values[5],
      Sugar: values[6]
    };

    return this.convertToDailyLog(mfpData, lineNumber);
  }

  /**
   * 智能分割CSV行，处理引号和逗号
   */
  private splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === this.config.delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * 转换MFP数据为DailyLog格式
   */
  private convertToDailyLog(mfpData: Partial<MFPDataRow>, lineNumber: number): DailyLog {
    if (!mfpData.Date || !mfpData.Calories) {
      throw new ValidationError({
        code: ErrorCode.VALIDATION_REQUIRED,
        message: '缺少必要字段',
        field: 'date/calories',
      });
    }

    const date = this.parseDate(mfpData.Date);
    if (!date) {
      throw new ValidationError({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: '日期格式无效',
        field: 'date',
      });
    }

    const nutritionData: NutritionData = {
      id: `mfp_${date}_${lineNumber}`,
      mealType: 'unknown',
      calories: this.parseNumber(mfpData.Calories),
      carbs: this.parseNumber(mfpData.Carbs),
      fat: this.parseNumber(mfpData.Fat),
      protein: this.parseNumber(mfpData.Protein),
      sodium: this.parseNumber(mfpData.Sodium),
      sugar: this.parseNumber(mfpData.Sugar),
      timestamp: new Date(date).toISOString(),
      notes: 'Imported from MyFitnessPal'
    };

    const activityData: WorkoutData | null = null;
    const sleepData: SleepData | null = null;

    return {
      id: `mfp_${date}_${lineNumber}`,
      date: date,
      type: 'nutrition',
      mood: 3,
      energyLevel: 5,
      nutritionData,
      activityData,
      sleepData,
      notes: `从MyFitnessPal导入 - ${mfpData.Date}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 解析日期字符串
   */
  private parseDate(dateStr: string): string | null {
    try {
      // 支持多种日期格式
      const formats = [
        'MM/DD/YYYY',
        'DD/MM/YYYY', 
        'YYYY-MM-DD',
        'MM-DD-YYYY'
      ];
      
      for (const format of formats) {
        const date = this.tryParseDate(dateStr, format);
        if (date) return date.toISOString().split('T')[0];
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 尝试解析日期
   */
  private tryParseDate(dateStr: string, format: string): Date | null {
    try {
      if (format === 'MM/DD/YYYY' || format === 'MM-DD-YYYY') {
        const [month, day, year] = dateStr.split(/[\/-]/);
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (format === 'DD/MM/YYYY') {
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (format === 'YYYY-MM-DD') {
        return new Date(dateStr);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 解析数字字符串
   */
  private parseNumber(numStr: string | undefined): number {
    if (!numStr) return 0;
    
    // 移除非数字字符并解析
    const cleanStr = numStr.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleanStr);
    
    return isNaN(num) ? 0 : Math.max(0, num);
  }

  /**
   * 验证CSV文件格式
   */
  validateCSVFormat(csvContent: string): boolean {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) return false;
    
    const firstLine = lines[0].toLowerCase();
    const requiredHeaders = ['date', 'calories'];
    
    return requiredHeaders.every(header => firstLine.includes(header));
  }

  /**
   * 生成导入统计报告
   */
  generateImportReport(result: CSVParserResult): string {
    const { stats, errors } = result;
    const successRate = ((stats.validRows / stats.totalRows) * 100).toFixed(1);
    
    return `
## MyFitnessPal数据导入报告

**导入时间**: ${new Date(stats.importDate).toLocaleString()}
**总数据行**: ${stats.totalRows}
**成功导入**: ${stats.validRows}
**错误数量**: ${stats.errorCount}
**成功率**: ${successRate}%

${errors.length > 0 ? `**错误详情**:\n${errors.join('\n')}` : '**状态**: 导入成功，无错误'}
    `.trim();
  }
}

// 导出单例实例
export const csvParserService = new CSVParserService();
