/**
 * GroceryAffiliateService - "One-Click Pantry"
 * 
 * Enables one-click ingredient ordering from recipes and meal plans:
 * - Maps ingredients to grocery delivery APIs
 * - Supports Instacart, Amazon Fresh, Walmart
 * - High-margin affiliate revenue
 * - Removes friction from meal planning
 */

import * as Linking from 'expo-linking';

// ============================================================================
// TYPES
// ============================================================================

export type GroceryProvider = 'instacart' | 'amazon_fresh' | 'walmart' | 'kroger' | 'target';

export interface GroceryProviderConfig {
  id: GroceryProvider;
  name: string;
  logo: string;
  affiliateTag: string;
  baseUrl: string;
  searchUrl: string;
  cartUrl: string;
  isAvailable: boolean;
  color: string;
}

export interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  estimatedPrice?: number;
  searchTerms?: string[]; // Alternative search terms
  notes?: string;
}

export type GroceryCategory = 
  | 'produce'
  | 'meat'
  | 'dairy'
  | 'grains'
  | 'canned'
  | 'frozen'
  | 'spices'
  | 'condiments'
  | 'beverages'
  | 'snacks'
  | 'other';

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  source: 'recipe' | 'meal_plan' | 'manual' | 'ai_suggested';
  sourceId?: string; // Recipe ID or Meal Plan ID
  createdAt: string;
  estimatedTotal: number;
}

export interface OrderResult {
  provider: GroceryProvider;
  success: boolean;
  cartUrl?: string;
  error?: string;
  itemsAdded: number;
  itemsFailed: number;
}

// ============================================================================
// PROVIDER CONFIGURATIONS
// ============================================================================

export const GROCERY_PROVIDERS: Record<GroceryProvider, GroceryProviderConfig> = {
  instacart: {
    id: 'instacart',
    name: 'Instacart',
    logo: '🛒',
    affiliateTag: 'mymacro-20', // Placeholder
    baseUrl: 'https://www.instacart.com',
    searchUrl: 'https://www.instacart.com/store/search/',
    cartUrl: 'https://www.instacart.com/store/checkout',
    isAvailable: true,
    color: '#43B02A',
  },
  amazon_fresh: {
    id: 'amazon_fresh',
    name: 'Amazon Fresh',
    logo: '📦',
    affiliateTag: 'mymacro-20', // Placeholder
    baseUrl: 'https://www.amazon.com/alm/storefront',
    searchUrl: 'https://www.amazon.com/s?k=',
    cartUrl: 'https://www.amazon.com/gp/cart/view.html',
    isAvailable: true,
    color: '#FF9900',
  },
  walmart: {
    id: 'walmart',
    name: 'Walmart',
    logo: '🏪',
    affiliateTag: 'mymacro', // Placeholder
    baseUrl: 'https://www.walmart.com/grocery',
    searchUrl: 'https://www.walmart.com/search?q=',
    cartUrl: 'https://www.walmart.com/cart',
    isAvailable: true,
    color: '#0071CE',
  },
  kroger: {
    id: 'kroger',
    name: 'Kroger',
    logo: '🥬',
    affiliateTag: '',
    baseUrl: 'https://www.kroger.com',
    searchUrl: 'https://www.kroger.com/search?query=',
    cartUrl: 'https://www.kroger.com/cart',
    isAvailable: false, // Not yet integrated
    color: '#E31837',
  },
  target: {
    id: 'target',
    name: 'Target',
    logo: '🎯',
    affiliateTag: '',
    baseUrl: 'https://www.target.com/c/grocery',
    searchUrl: 'https://www.target.com/s?searchTerm=',
    cartUrl: 'https://www.target.com/cart',
    isAvailable: false, // Not yet integrated
    color: '#CC0000',
  },
};

// ============================================================================
// CATEGORY MAPPINGS
// ============================================================================

const CATEGORY_KEYWORDS: Record<GroceryCategory, string[]> = {
  produce: ['fruit', 'vegetable', 'apple', 'banana', 'lettuce', 'tomato', 'onion', 'garlic', 'spinach', 'broccoli', 'carrot'],
  meat: ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'steak', 'ground', 'bacon', 'sausage'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'cottage'],
  grains: ['rice', 'pasta', 'bread', 'oat', 'quinoa', 'cereal', 'flour', 'tortilla'],
  canned: ['beans', 'soup', 'tomato sauce', 'tuna', 'corn', 'chickpea'],
  frozen: ['frozen', 'ice cream'],
  spices: ['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'basil', 'thyme', 'cinnamon'],
  condiments: ['ketchup', 'mustard', 'mayo', 'soy sauce', 'hot sauce', 'olive oil', 'vinegar'],
  beverages: ['water', 'juice', 'coffee', 'tea', 'soda', 'milk'],
  snacks: ['chips', 'nuts', 'crackers', 'popcorn', 'protein bar'],
  other: [],
};

// ============================================================================
// GROCERY AFFILIATE SERVICE
// ============================================================================

class GroceryAffiliateServiceClass {
  
  // ============================================================================
  // PROVIDER MANAGEMENT
  // ============================================================================
  
  /**
   * Get all available grocery providers
   */
  getAvailableProviders(): GroceryProviderConfig[] {
    return Object.values(GROCERY_PROVIDERS).filter(p => p.isAvailable);
  }
  
  /**
   * Get provider by ID
   */
  getProvider(id: GroceryProvider): GroceryProviderConfig | null {
    return GROCERY_PROVIDERS[id] || null;
  }
  
  /**
   * Get user's preferred provider (from storage)
   */
  async getPreferredProvider(): Promise<GroceryProvider> {
    // Would read from user preferences
    // Default to Instacart
    return 'instacart';
  }
  
  /**
   * Set user's preferred provider
   */
  async setPreferredProvider(provider: GroceryProvider): Promise<void> {
    // Would save to user preferences
  }
  
  // ============================================================================
  // INGREDIENT PARSING
  // ============================================================================
  
  /**
   * Parse recipe ingredients into grocery items
   */
  parseRecipeIngredients(ingredients: string[]): GroceryItem[] {
    return ingredients.map(ingredient => {
      const parsed = this.parseIngredientString(ingredient);
      return {
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        category: this.categorizeIngredient(parsed.name),
        searchTerms: this.generateSearchTerms(parsed.name),
      };
    });
  }
  
  /**
   * Parse a single ingredient string
   */
  private parseIngredientString(ingredient: string): { name: string; quantity: number; unit: string } {
    // Common patterns:
    // "2 cups rice"
    // "1/2 lb chicken breast"
    // "3 large eggs"
    // "salt and pepper to taste"
    
    const quantityMatch = ingredient.match(/^([\d\/\.]+)\s*/);
    const unitMatch = ingredient.match(/^[\d\/\.]+\s*(cup|cups|tbsp|tsp|oz|lb|lbs|g|kg|ml|l|piece|pieces|large|medium|small|clove|cloves)\s*/i);
    
    let quantity = 1;
    let unit = 'item';
    let name = ingredient;
    
    if (quantityMatch) {
      const qStr = quantityMatch[1];
      if (qStr.includes('/')) {
        const [num, den] = qStr.split('/').map(Number);
        quantity = num / den;
      } else {
        quantity = parseFloat(qStr);
      }
      name = ingredient.substring(quantityMatch[0].length);
    }
    
    if (unitMatch) {
      unit = unitMatch[1].toLowerCase();
      name = ingredient.substring(unitMatch[0].length);
    }
    
    // Clean up name
    name = name.trim()
      .replace(/,.*$/, '') // Remove anything after comma
      .replace(/\(.*\)/, '') // Remove parenthetical
      .trim();
    
    return { name, quantity, unit };
  }
  
  /**
   * Categorize an ingredient
   */
  private categorizeIngredient(name: string): GroceryCategory {
    const lowerName = name.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => lowerName.includes(kw))) {
        return category as GroceryCategory;
      }
    }
    
    return 'other';
  }
  
  /**
   * Generate search terms for better matching
   */
  private generateSearchTerms(name: string): string[] {
    const terms = [name];
    
    // Add singular/plural variants
    if (name.endsWith('s')) {
      terms.push(name.slice(0, -1));
    } else {
      terms.push(name + 's');
    }
    
    // Add common brand-agnostic terms
    const genericTerms: Record<string, string[]> = {
      'chicken breast': ['boneless skinless chicken breast', 'chicken breast'],
      'ground beef': ['lean ground beef', '93% lean ground beef', 'ground beef'],
      'greek yogurt': ['plain greek yogurt', 'nonfat greek yogurt'],
      'olive oil': ['extra virgin olive oil', 'olive oil'],
    };
    
    const lowerName = name.toLowerCase();
    if (genericTerms[lowerName]) {
      terms.push(...genericTerms[lowerName]);
    }
    
    return terms;
  }
  
  // ============================================================================
  // GROCERY LIST CREATION
  // ============================================================================
  
  /**
   * Create a grocery list from a recipe
   */
  createListFromRecipe(recipeId: string, recipeName: string, ingredients: string[]): GroceryList {
    const items = this.parseRecipeIngredients(ingredients);
    const estimatedTotal = this.estimateTotal(items);
    
    return {
      id: `list_${Date.now()}`,
      name: `Ingredients for ${recipeName}`,
      items,
      source: 'recipe',
      sourceId: recipeId,
      createdAt: new Date().toISOString(),
      estimatedTotal,
    };
  }
  
  /**
   * Create a grocery list from a meal plan
   */
  createListFromMealPlan(planId: string, planName: string, allIngredients: string[]): GroceryList {
    const items = this.parseRecipeIngredients(allIngredients);
    
    // Consolidate duplicate ingredients
    const consolidated = this.consolidateItems(items);
    const estimatedTotal = this.estimateTotal(consolidated);
    
    return {
      id: `list_${Date.now()}`,
      name: `Groceries for ${planName}`,
      items: consolidated,
      source: 'meal_plan',
      sourceId: planId,
      createdAt: new Date().toISOString(),
      estimatedTotal,
    };
  }
  
  /**
   * Consolidate duplicate items
   */
  private consolidateItems(items: GroceryItem[]): GroceryItem[] {
    const consolidated = new Map<string, GroceryItem>();
    
    for (const item of items) {
      const key = item.name.toLowerCase();
      
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!;
        existing.quantity += item.quantity;
      } else {
        consolidated.set(key, { ...item });
      }
    }
    
    return Array.from(consolidated.values());
  }
  
  /**
   * Estimate total cost
   */
  private estimateTotal(items: GroceryItem[]): number {
    // Rough estimates per category
    const categoryPrices: Record<GroceryCategory, number> = {
      produce: 2.50,
      meat: 8.00,
      dairy: 4.00,
      grains: 3.00,
      canned: 2.00,
      frozen: 5.00,
      spices: 4.00,
      condiments: 4.00,
      beverages: 3.00,
      snacks: 4.00,
      other: 3.00,
    };
    
    return items.reduce((total, item) => {
      return total + (categoryPrices[item.category] * item.quantity);
    }, 0);
  }
  
  // ============================================================================
  // ORDER PLACEMENT
  // ============================================================================
  
  /**
   * Build cart URL with affiliate tracking
   */
  buildCartUrl(list: GroceryList, provider: GroceryProvider): string {
    const config = GROCERY_PROVIDERS[provider];
    if (!config) return '';
    
    // Build search query from items
    const searchQuery = list.items
      .map(item => encodeURIComponent(item.name))
      .join('+');
    
    // Add affiliate tag
    const affiliateParam = config.affiliateTag 
      ? `&tag=${config.affiliateTag}` 
      : '';
    
    switch (provider) {
      case 'instacart':
        return `${config.searchUrl}${searchQuery}?ref=mymacro${affiliateParam}`;
      
      case 'amazon_fresh':
        return `${config.searchUrl}${searchQuery}&i=amazonfresh${affiliateParam}`;
      
      case 'walmart':
        return `${config.searchUrl}${searchQuery}${affiliateParam}`;
      
      default:
        return `${config.searchUrl}${searchQuery}`;
    }
  }
  
  /**
   * Open grocery provider with pre-filled cart/search
   */
  async openProvider(list: GroceryList, provider: GroceryProvider): Promise<OrderResult> {
    const config = GROCERY_PROVIDERS[provider];
    
    if (!config || !config.isAvailable) {
      return {
        provider,
        success: false,
        error: 'Provider not available',
        itemsAdded: 0,
        itemsFailed: list.items.length,
      };
    }
    
    const cartUrl = this.buildCartUrl(list, provider);
    
    try {
      // Open in system browser for better cart experience
      const canOpen = await Linking.canOpenURL(cartUrl);
      
      if (canOpen) {
        await Linking.openURL(cartUrl);
      } else {
        // Fallback - still try to open
        await Linking.openURL(cartUrl);
      }
      
      // Track affiliate click
      await this.trackAffiliateClick(list, provider);
      
      return {
        provider,
        success: true,
        cartUrl,
        itemsAdded: list.items.length,
        itemsFailed: 0,
      };
    } catch (error) {
      console.error('[GroceryAffiliate] Error opening provider:', error);
      return {
        provider,
        success: false,
        error: 'Failed to open grocery app',
        itemsAdded: 0,
        itemsFailed: list.items.length,
      };
    }
  }
  
  /**
   * Quick order - one-click from recipe
   */
  async quickOrder(recipeId: string, recipeName: string, ingredients: string[]): Promise<OrderResult> {
    const preferredProvider = await this.getPreferredProvider();
    const list = this.createListFromRecipe(recipeId, recipeName, ingredients);
    return this.openProvider(list, preferredProvider);
  }
  
  // ============================================================================
  // ANALYTICS & TRACKING
  // ============================================================================
  
  /**
   * Track affiliate click for analytics
   */
  private async trackAffiliateClick(list: GroceryList, provider: GroceryProvider): Promise<void> {
    // In production, send to analytics service
    const event = {
      event: 'affiliate_click',
      provider,
      source: list.source,
      sourceId: list.sourceId,
      itemCount: list.items.length,
      estimatedValue: list.estimatedTotal,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[GroceryAffiliate] Tracking click:', event);
    
    // Could also store in Supabase for revenue tracking
  }
  
  /**
   * Get affiliate revenue stats (for admin/analytics)
   */
  async getAffiliateStats(): Promise<{
    totalClicks: number;
    totalEstimatedValue: number;
    byProvider: Record<GroceryProvider, { clicks: number; value: number }>;
  }> {
    // Would fetch from analytics service/Supabase
    return {
      totalClicks: 0,
      totalEstimatedValue: 0,
      byProvider: {
        instacart: { clicks: 0, value: 0 },
        amazon_fresh: { clicks: 0, value: 0 },
        walmart: { clicks: 0, value: 0 },
        kroger: { clicks: 0, value: 0 },
        target: { clicks: 0, value: 0 },
      },
    };
  }
}

// Export singleton
export const GroceryAffiliateService = new GroceryAffiliateServiceClass();
export default GroceryAffiliateService;
