import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// Shared MMKV instance for pantry storage
let _pantryStorage: MMKV | null = null;
let _storageError = false;

const getPantryStorage = (): MMKV | null => {
    if (_storageError) return null;
    if (_pantryStorage) return _pantryStorage;

    try {
        _pantryStorage = new MMKV({
            id: 'pantry-storage-v1',
        });
        return _pantryStorage;
    } catch (error) {
        console.warn('[PantryStore] MMKV initialization failed, using memory fallback:', error);
        _storageError = true;
        return null;
    }
};

// Memory fallback when MMKV is unavailable
const memoryStorage = new Map<string, string>();

const mmkvPantryStorage: StateStorage = {
    setItem: (name, value) => {
        const storage = getPantryStorage();
        if (storage) {
            storage.set(name, value);
        } else {
            memoryStorage.set(name, value);
        }
    },
    getItem: (name) => {
        const storage = getPantryStorage();
        if (storage) {
            return storage.getString(name) ?? null;
        }
        return memoryStorage.get(name) ?? null;
    },
    removeItem: (name) => {
        const storage = getPantryStorage();
        if (storage) {
            storage.delete(name);
        } else {
            memoryStorage.delete(name);
        }
    },
};

interface PantryState {
  // 储藏室物品列表
  items: string[];
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 基本操作
  addItem: (name: string) => void;
  removeItem: (name: string) => void;
  toggleItem: (name: string) => void;
  clearItems: () => void;
  setItems: (items: string[]) => void;
  
  // 选择器函数
  hasIngredient: (ingredientName: string) => boolean;
  hasIngredients: (recipeIngredients: string[]) => boolean;
  getMatchingPercentage: (recipeIngredients: string[]) => number;
  
  // 工具函数
  searchItems: (query: string) => string[];
  getCategories: () => string[];
  getItemsByCategory: (category: string) => string[];
  normalizeIngredient: (ingredient: string) => string;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * 储藏室状态管理Store
 * 管理用户拥有的食材列表，支持持久化存储和智能匹配
 */
export const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      // 初始状态 - 新用户从空储藏室开始
      items: [],
      
      isLoading: false,
      error: null,

      // 基本操作
      addItem: (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        
        set((state) => {
          // 避免重复添加
          if (state.items.some(item => 
            item.toLowerCase() === trimmedName.toLowerCase()
          )) {
            return state;
          }
          
          return {
            items: [...state.items, trimmedName],
            error: null
          };
        });
      },

      removeItem: (name: string) => {
        set((state) => ({
          items: state.items.filter(item => 
            item.toLowerCase() !== name.toLowerCase()
          ),
          error: null
        }));
      },

      toggleItem: (name: string) => {
        const state = get();
        const exists = state.items.some(item => 
          item.toLowerCase() === name.toLowerCase()
        );
        
        if (exists) {
          get().removeItem(name);
        } else {
          get().addItem(name);
        }
      },

      clearItems: () => {
        set({ items: [], error: null });
      },

      setItems: (items: string[]) => {
        set({ 
          items: items.filter(item => item.trim().length > 0),
          error: null 
        });
      },

      // 选择器函数
      hasIngredient: (ingredientName: string) => {
        const { items, normalizeIngredient } = get();
        const normalizedIngredient = normalizeIngredient(ingredientName);
        return items.some(item => {
          const normalizedItem = normalizeIngredient(item);
          return (
            normalizedItem.includes(normalizedIngredient) ||
            normalizedIngredient.includes(normalizedItem)
          );
        });
      },

      hasIngredients: (recipeIngredients: string[]) => {
        const matchingPercentage = get().getMatchingPercentage(recipeIngredients);
        return matchingPercentage >= 50; // 拥有50%以上食材
      },

      getMatchingPercentage: (recipeIngredients: string[]) => {
        const state = get();
        if (recipeIngredients.length === 0) return 0;
        
        const matchedCount = recipeIngredients.filter(ingredient =>
          state.hasIngredient(ingredient)
        ).length;
        
        return Math.round((matchedCount / recipeIngredients.length) * 100);
      },

      // 工具函数
      searchItems: (query: string) => {
        const { items, normalizeIngredient } = get();
        const normalizedQuery = normalizeIngredient(query);
        return items.filter(item =>
          normalizeIngredient(item).includes(normalizedQuery)
        );
      },

      getCategories: () => {
        // 简单的食材分类（可根据需要扩展）
        const categories = [
          '蛋白质', '蔬菜', '水果', '谷物', '调味品', 
          '乳制品', '油脂', '坚果', '饮料', '其他'
        ];
        return categories;
      },

      getItemsByCategory: (category: string) => {
        // 简单的分类映射（可根据需要扩展为更智能的分类）
        const categoryMap: Record<string, string[]> = {
          '蛋白质': ['鸡胸肉', '鸡蛋', '牛肉', '鱼肉', '豆腐'],
          '蔬菜': ['胡萝卜', '洋葱', '大蒜', '菠菜', '花椰菜'],
          '水果': ['香蕉', '苹果', '橙子', '草莓'],
          '谷物': ['米饭', '面包', '燕麦', '面条'],
          '调味品': ['盐', '胡椒', '酱油', '醋', '糖'],
          '乳制品': ['牛奶', '奶酪', '酸奶'],
          '油脂': ['橄榄油', '黄油', '植物油'],
          '坚果': ['杏仁', '核桃', '花生'],
          '饮料': ['水', '茶', '咖啡'],
          '其他': ['蜂蜜', '香料', '罐头']
        };
        
        const { items, normalizeIngredient } = get();
        const categoryItems = categoryMap[category] ?? [];
        return items.filter(item => 
          categoryItems.some(categoryItem => 
            normalizeIngredient(item).includes(
              normalizeIngredient(categoryItem)
            )
          )
        );
      },

      // 状态管理
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // 内部工具函数
      normalizeIngredient: (ingredient: string): string => {
        return ingredient
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // 移除重音符号
          .replace(/[^\w\s]/g, '') // 移除标点符号
          .trim();
      }
    }),
    {
      name: 'pantry-store',
      storage: createJSONStorage(() => mmkvPantryStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // 状态迁移逻辑
        if (version === 0) {
          // 从版本0迁移到版本1
          return {
            ...persistedState,
            items: persistedState.items || []
          };
        }
        return persistedState;
      }
    }
  )
);

// Store hooks for common operations
export const usePantryItems = () => usePantryStore(state => state.items);
export const usePantryLoading = () => usePantryStore(state => state.isLoading);
export const usePantryError = () => usePantryStore(state => state.error);

// Selector hooks
export const useHasIngredient = (ingredientName: string) => 
  usePantryStore(state => state.hasIngredient(ingredientName));

export const useHasIngredients = (recipeIngredients: string[]) => 
  usePantryStore(state => state.hasIngredients(recipeIngredients));

export const useMatchingPercentage = (recipeIngredients: string[]) => 
  usePantryStore(state => state.getMatchingPercentage(recipeIngredients));

export const useSearchResults = (query: string) => 
  usePantryStore(state => state.searchItems(query));

export const usePantryCategories = () => 
  usePantryStore(state => state.getCategories());

export const useItemsByCategory = (category: string) => 
  usePantryStore(state => state.getItemsByCategory(category));

// Action hooks
export const usePantryActions = () => usePantryStore(state => ({
  addItem: state.addItem,
  removeItem: state.removeItem,
  toggleItem: state.toggleItem,
  clearItems: state.clearItems,
  setItems: state.setItems,
  setLoading: state.setLoading,
  setError: state.setError
}));

// 工具函数：批量导入食材
export const importPantryItems = (items: string[]): void => {
  const { setItems } = usePantryStore.getState();
  setItems(items);
};

// 工具函数：导出食材列表
export const exportPantryItems = (): string[] => {
  return usePantryStore.getState().items;
};

// 工具函数：重置为空储藏室
export const resetToDefaultPantry = (): void => {
  usePantryStore.getState().setItems([]);
};
