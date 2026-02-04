import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storageService } from '../services/storage/storage';
import type { Recipe } from '../src/data/recipes';

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  quantity?: number;
  unit?: string;
  sourceRecipe?: string;
  createdAt: string;
  updatedAt: string;
}

interface GroceryState {
  // 杂货清单状态
  items: GroceryItem[];
  categories: string[];
  recentlyAdded: string[];
  
  // 加载状态
  isLoading: boolean;
  error: string | null;

  // Actions
  addItem: (name: string, category: string, sourceRecipe?: string) => void;
  addItemsFromRecipe: (recipe: Recipe) => void;
  toggleChecked: (id: string) => void;
  removeItem: (id: string) => void;
  clearChecked: () => void;
  updateItem: (id: string, updates: Partial<GroceryItem>) => void;
  generateShareText: () => string;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const categorizeIngredient = (ingredientName: string): string => {
  const name = ingredientName.toLowerCase();

  if (name.includes('水果') || name.includes('蔬菜') || name.includes('叶') || name.includes('果')) {
    return '水果蔬菜';
  } else if (name.includes('肉') || name.includes('鱼') || name.includes('虾') || name.includes('鸡')) {
    return '肉类海鲜';
  } else if (name.includes('奶') || name.includes('奶酪') || name.includes('酸奶')) {
    return '乳制品';
  } else if (name.includes('米') || name.includes('面') || name.includes('面包') || name.includes('麦')) {
    return '谷物面包';
  } else if (name.includes('油') || name.includes('盐') || name.includes('酱') || name.includes('醋')) {
    return '调味品';
  }
  return '其他';
};

/**
 * 杂货清单状态管理Store
 * 管理用户购物清单、智能添加和分享功能
 */
export const useGroceryStore = create<GroceryState>()(
  persist(
    (set, get) => ({
      // 初始状态
      items: [],
      categories: [
        '水果蔬菜', '肉类海鲜', '乳制品', '谷物面包', 
        '调味品', '饮料', '零食', '家居用品', '其他'
      ],
      recentlyAdded: [],
      isLoading: false,
      error: null,

      // 添加单个商品
      addItem: (name: string, category: string, sourceRecipe?: string) => {
        const newItem: GroceryItem = {
          id: Date.now().toString(),
          name,
          category,
          checked: false,
          sourceRecipe,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          items: [...state.items, newItem],
          recentlyAdded: [...state.recentlyAdded.slice(-4), name]
        }));
      },

      // 从食谱自动添加缺失食材
      addItemsFromRecipe: (recipe: Recipe) => {
        const { items } = get();
        
        // 模拟智能检测缺失食材（实际项目中需要pantry数据）
        const missingIngredients = recipe.ingredients
          .filter(ingredient => {
            const itemName = ingredient.name.toLowerCase();
            return !items.some(item => 
              item.name.toLowerCase().includes(itemName) || 
              itemName.includes(item.name.toLowerCase())
            );
          })
          .map(ingredient => ({
            name: ingredient.name,
            category: categorizeIngredient(ingredient.name),
            quantity: ingredient.amount,
            unit: ingredient.unit
          }));

        missingIngredients.forEach(ingredient => {
          get().addItem(ingredient.name, ingredient.category, recipe.title);
        });
      },

      // 切换商品选中状态
      toggleChecked: (id: string) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === id 
              ? { ...item, checked: !item.checked, updatedAt: new Date().toISOString() }
              : item
          )
        }));
      },

      // 移除商品
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },

      // 清除已选中的商品
      clearChecked: () => {
        set((state) => ({
          items: state.items.filter(item => !item.checked)
        }));
      },

      // 更新商品信息
      updateItem: (id: string, updates: Partial<GroceryItem>) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === id 
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          )
        }));
      },

      // 生成分享文本
      generateShareText: () => {
        const { items } = get();
        const uncheckedItems = items.filter(item => !item.checked);
        
        if (uncheckedItems.length === 0) {
          return '购物清单已完成！';
        }

        const itemsByCategory = uncheckedItems.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item.name);
          return acc;
        }, {} as Record<string, string[]>);

        let shareText = '📋 MyMacro AI 购物清单\\n\\n';
        
        Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
          shareText += `🏷️ ${category}:\\n`;
          categoryItems.forEach(item => {
            shareText += `• ${item}\\n`;
          });
          shareText += '\\n';
        });

        shareText += `总计: ${uncheckedItems.length} 件商品`;
        return shareText;
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 设置错误信息
      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'grocery-store',
      storage: createJSONStorage(() => storageService.getZustandStorage()),
      version: 1
    }
  )
);

// Store hooks for common operations
export const useGroceryItems = () => useGroceryStore(state => state.items);
export const useUncheckedItems = () => 
  useGroceryStore(state => state.items.filter(item => !item.checked));
export const useGroceryCategories = () => useGroceryStore(state => state.categories);
export const useGroceryLoading = () => useGroceryStore(state => state.isLoading);
export const useGroceryError = () => useGroceryStore(state => state.error);

// Action hooks
export const useGroceryActions = () => useGroceryStore(state => ({
  addItem: state.addItem,
  addItemsFromRecipe: state.addItemsFromRecipe,
  toggleChecked: state.toggleChecked,
  removeItem: state.removeItem,
  clearChecked: state.clearChecked,
  updateItem: state.updateItem,
  generateShareText: state.generateShareText,
  setLoading: state.setLoading,
  setError: state.setError
}));
