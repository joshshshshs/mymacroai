import { Linking, Platform, Alert } from 'react-native';
import type { GroceryItem } from '../../store/groceryStore';
import { logger } from '../../utils/logger';
import { ErrorCode, ValidationError } from '../../utils/errors';

export type GroceryService = 'instacart' | 'amazon' | 'walmart' | 'target';

interface DeepLinkOptions {
  fallbackToBrowser?: boolean;
  showAlertOnFail?: boolean;
}

/**
 * 杂货应用深度链接服务
 * 支持Instacart、Amazon等外部应用集成
 */
export class GroceryDeepLinker {
  private static readonly SERVICE_URLS = {
    instacart: {
      app: 'instacart://',
      web: 'https://www.instacart.com/store/s?k='
    },
    amazon: {
      app: 'amazon://',
      web: 'https://www.amazon.com/s?k='
    },
    walmart: {
      app: 'walmart://',
      web: 'https://www.walmart.com/search/?query='
    },
    target: {
      app: 'target://',
      web: 'https://www.target.com/s?searchTerm='
    }
  };

  /**
   * 构建Instacart搜索链接
   */
  static buildInstacartLink(items: string[]): string {
    const encodedItems = encodeURIComponent(items.join(' '));
    return `${this.SERVICE_URLS.instacart.web}${encodedItems}`;
  }

  /**
   * 构建Amazon搜索链接
   */
  static buildAmazonLink(items: string[]): string {
    const encodedItems = encodeURIComponent(items.join(' '));
    return `${this.SERVICE_URLS.amazon.web}${encodedItems}`;
  }

  /**
   * 构建Walmart搜索链接
   */
  static buildWalmartLink(items: string[]): string {
    const encodedItems = encodeURIComponent(items.join(' '));
    return `${this.SERVICE_URLS.walmart.web}${encodedItems}`;
  }

  /**
   * 构建Target搜索链接
   */
  static buildTargetLink(items: string[]): string {
    const encodedItems = encodeURIComponent(items.join(' '));
    return `${this.SERVICE_URLS.target.web}${encodedItems}`;
  }

  /**
   * 智能选择最佳杂货服务
   */
  static suggestBestService(items: GroceryItem[]): GroceryService {
    const itemCount = items.length;
    const categories = new Set(items.map(item => item.category));

    // 根据商品种类和数量推荐服务
    if (categories.has('水果蔬菜') || categories.has('肉类海鲜')) {
      return 'instacart'; // 生鲜食材优先Instacart
    } else if (itemCount > 10) {
      return 'amazon'; // 大量商品选择Amazon
    } else if (categories.has('家居用品')) {
      return 'walmart'; // 家居用品选择Walmart
    } else {
      return 'target'; // 其他情况选择Target
    }
  }

  /**
   * 打开杂货应用
   */
  static async openGroceryApp(
    service: GroceryService,
    items: string[] = [],
    options: DeepLinkOptions = {}
  ): Promise<boolean> {
    const { fallbackToBrowser = true, showAlertOnFail = true } = options;

    try {
      let url: string;

      if (items.length > 0) {
        // 构建带搜索项的链接
        switch (service) {
          case 'instacart':
            url = this.buildInstacartLink(items);
            break;
          case 'amazon':
            url = this.buildAmazonLink(items);
            break;
          case 'walmart':
            url = this.buildWalmartLink(items);
            break;
          case 'target':
            url = this.buildTargetLink(items);
            break;
          default:
            throw new ValidationError({
              code: ErrorCode.VALIDATION_INVALID_FORMAT,
              message: `Unsupported service: ${service}`,
              field: 'service',
            });
        }
      } else {
        // 直接打开应用首页
        url = this.SERVICE_URLS[service].app;
      }

      // 尝试打开应用
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else if (fallbackToBrowser && items.length > 0) {
        // 应用未安装，回退到浏览器
        const webUrl = this.getWebUrl(service, items);
        await Linking.openURL(webUrl);
        return true;
      } else {
        if (showAlertOnFail) {
          Alert.alert(
            '应用未安装',
            `请先安装${this.getServiceDisplayName(service)}应用，或使用浏览器版本。`,
            [{ text: '确定' }]
          );
        }
        return false;
      }
    } catch (error) {
      logger.error(`Failed to open ${service}:`, error);
      
      if (showAlertOnFail) {
        Alert.alert(
          '打开失败',
          `无法打开${this.getServiceDisplayName(service)}，请检查网络连接或应用安装。`,
          [{ text: '确定' }]
        );
      }
      return false;
    }
  }

  /**
   * 批量打开多个服务进行比较
   */
  static async openMultipleServices(
    items: GroceryItem[],
    services: GroceryService[] = ['instacart', 'amazon', 'walmart']
  ): Promise<{ service: GroceryService; success: boolean }[]> {
    const itemNames = items.map(item => item.name);
    const results = [];

    for (const service of services) {
      const success = await this.openGroceryApp(service, itemNames, {
        fallbackToBrowser: true,
        showAlertOnFail: false
      });
      results.push({ service, success });

      // 添加短暂延迟避免过快连续打开
      if (success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * 检查设备是否安装了指定服务
   */
  static async checkServiceAvailability(service: GroceryService): Promise<boolean> {
    try {
      const appUrl = this.SERVICE_URLS[service].app;
      return await Linking.canOpenURL(appUrl);
    } catch (error) {
      logger.error(`Failed to check ${service} availability:`, error);
      return false;
    }
  }

  /**
   * 获取所有可用服务
   */
  static async getAvailableServices(): Promise<GroceryService[]> {
    const services: GroceryService[] = ['instacart', 'amazon', 'walmart', 'target'];
    const available: GroceryService[] = [];

    for (const service of services) {
      const isAvailable = await this.checkServiceAvailability(service);
      if (isAvailable) {
        available.push(service);
      }
    }

    return available;
  }

  /**
   * 获取服务显示名称
   */
  private static getServiceDisplayName(service: GroceryService): string {
    const names = {
      instacart: 'Instacart',
      amazon: 'Amazon',
      walmart: 'Walmart',
      target: 'Target'
    };
    return names[service];
  }

  /**
   * 获取网页版URL
   */
  private static getWebUrl(service: GroceryService, items: string[]): string {
    const encodedItems = encodeURIComponent(items.join(' '));
    
    switch (service) {
      case 'instacart':
        return `${this.SERVICE_URLS.instacart.web}${encodedItems}`;
      case 'amazon':
        return `${this.SERVICE_URLS.amazon.web}${encodedItems}`;
      case 'walmart':
        return `${this.SERVICE_URLS.walmart.web}${encodedItems}`;
      case 'target':
        return `${this.SERVICE_URLS.target.web}${encodedItems}`;
      default:
        throw new ValidationError({
          code: ErrorCode.VALIDATION_INVALID_FORMAT,
          message: `Unsupported service: ${service}`,
          field: 'service',
        });
    }
  }

  /**
   * 分享购物清单到多个平台
   */
  static async shareToMultiplePlatforms(items: GroceryItem[]): Promise<void> {
    const availableServices = await this.getAvailableServices();
    
    if (availableServices.length === 0) {
      Alert.alert(
        '无可用应用',
        '请先安装Instacart、Amazon、Walmart或Target等购物应用。',
        [{ text: '确定' }]
      );
      return;
    }

    const itemNames = items.map(item => item.name);
    
    // 建议最佳服务
    const bestService = this.suggestBestService(items);
    
    Alert.alert(
      '选择购物平台',
      `推荐使用${this.getServiceDisplayName(bestService)}，或选择其他平台：`,
      [
        ...availableServices.map(service => ({
          text: this.getServiceDisplayName(service),
          onPress: () => this.openGroceryApp(service, itemNames)
        })),
        { text: '取消', style: 'cancel' }
      ]
    );
  }
}

export default GroceryDeepLinker;
