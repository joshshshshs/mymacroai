import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storageService } from '../services/storage/storage';
import { 
  User, 
  UserPreferences, 
  DailyLog, 
  HealthMetrics, 
  Squad, 
  StoreItem, 
  UserEconomy, 
  UserSocial, 
  Reaction,
  ConsistencyMetrics,
  calculateConsistencyScore 
} from '../types/user';
import { logger } from '../utils/logger';

interface UserState {
  // 用户基本信息
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  
  // 用户偏好设置
  preferences: UserPreferences;
  
  // 健康数据
  dailyLogs: DailyLog[];
  healthMetrics: HealthMetrics;
  
  // 经济系统
  economy: UserEconomy;
  
  // 社交系统
  social: UserSocial;
  
  // 一致性指标
  consistencyMetrics: ConsistencyMetrics;
  
  // 智能调整功能状态
  freeAdjustmentsUsed: number; // 每周已使用的免费调整次数
  isProMember: boolean; // 用户是否为Pro会员
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // Basic Actions
  setUser: (user: User) => void;
  setAuthenticated: (authenticated: boolean) => void;
  completeOnboarding: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  addDailyLog: (log: DailyLog) => void;
  updateHealthMetrics: (metrics: Partial<HealthMetrics>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUserData: () => void;
  syncHealthData: () => Promise<void>;
  
  // Economy Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  purchaseItem: (item: StoreItem) => boolean;
  
  // Social Actions
  joinSquad: (squad: Squad) => void;
  leaveSquad: () => void;
  updateSquad: (squad: Partial<Squad>) => void;
  addReaction: (reaction: Omit<Reaction, 'id'>) => void;
  updateStreak: () => void;
  
  // Consistency Actions
  updateConsistencyMetrics: () => void;
  
  // 智能调整Actions
  incrementFreeAdjustments: () => void; // 增加免费调整次数
  resetFreeAdjustments: () => void; // 重置免费调整次数（每周重置）
  setProMember: (isPro: boolean) => void; // 设置Pro会员状态
}

/**
 * 用户状态管理Store
 * 管理用户认证、偏好设置、健康数据、经济系统和社交功能
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      isOnboardingCompleted: false,
      
      preferences: {
        theme: 'system',
        notifications: true,
        healthSync: true,
        aiRecommendations: true,
        language: 'en',
        measurementSystem: 'metric',
        dietaryPreferences: [],
        fitnessGoals: [],
        notificationSchedule: {
          morning: true,
          afternoon: true,
          evening: false
        }
      },
      
      dailyLogs: [],
      healthMetrics: {
        weight: null,
        height: null,
        bmi: null,
        bodyFat: null,
        muscleMass: null,
        hydration: null,
        sleepQuality: null,
        stressLevel: null,
        lastUpdated: null
      },
      
      economy: {
        macroCoins: 1000, // Starting coins
        totalSpent: 0,
        totalEarned: 1000,
        purchaseHistory: [],
        unlockedThemes: []
      },
      
      social: {
        squad: null,
        streak: 0,
        lastStreakUpdate: new Date().toISOString(),
        reactionsReceived: [],
        reactionsSent: []
      },
      
      consistencyMetrics: {
        streak: 0,
        logCompliance: 0,
        consistencyScore: 0,
        last7Days: []
      },

      freeAdjustmentsUsed: 0,
      isProMember: false,
      
      isLoading: false,
      error: null,

      // Basic Actions
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
      },

      completeOnboarding: () => {
        set({ isOnboardingCompleted: true });
      },

      updatePreferences: (newPreferences: Partial<UserPreferences>) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        }));
      },

      addDailyLog: (log: DailyLog) => {
        set((state) => ({
          dailyLogs: [...state.dailyLogs, { ...log, id: Date.now().toString() }]
        }));
        
        // Update consistency metrics after adding log
        const { updateConsistencyMetrics } = get();
        updateConsistencyMetrics();
      },

      updateHealthMetrics: (newMetrics: Partial<HealthMetrics>) => {
        set((state) => ({
          healthMetrics: { 
            ...state.healthMetrics, 
            ...newMetrics,
            lastUpdated: new Date().toISOString()
          }
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearUserData: () => {
        set({
          user: null,
          isAuthenticated: false,
          isOnboardingCompleted: false,
          dailyLogs: [],
          healthMetrics: {
            weight: null,
            height: null,
            bmi: null,
            bodyFat: null,
            muscleMass: null,
            hydration: null,
            sleepQuality: null,
            stressLevel: null,
            lastUpdated: null
          },
          economy: {
            macroCoins: 0,
            totalSpent: 0,
            totalEarned: 0,
            purchaseHistory: [],
            unlockedThemes: []
          },
          social: {
            squad: null,
            streak: 0,
            lastStreakUpdate: new Date().toISOString(),
            reactionsReceived: [],
            reactionsSent: []
          },
          consistencyMetrics: {
            streak: 0,
            logCompliance: 0,
            consistencyScore: 0,
            last7Days: []
          },
          freeAdjustmentsUsed: 0,
          isProMember: false,
          error: null
        });
      },

      syncHealthData: async () => {
        const { setLoading, setError, updateHealthMetrics } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          // 这里将集成健康数据同步服务
          // 暂时模拟同步过程
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 模拟更新健康指标
          updateHealthMetrics({
            lastUpdated: new Date().toISOString()
          });
          
        } catch (error) {
          setError(`Health data sync failed: ${error}`);
          logger.error('Health data sync error:', error);
        } finally {
          setLoading(false);
        }
      },
      
      // Economy Actions
      addCoins: (amount: number) => {
        set((state) => ({
          economy: {
            ...state.economy,
            macroCoins: state.economy.macroCoins + amount,
            totalEarned: state.economy.totalEarned + amount
          }
        }));
      },
      
      spendCoins: (amount: number) => {
        const state = get();
        if (state.economy.macroCoins < amount) {
          return false;
        }
        
        set((state) => ({
          economy: {
            ...state.economy,
            macroCoins: state.economy.macroCoins - amount,
            totalSpent: state.economy.totalSpent + amount
          }
        }));
        return true;
      },
      
      purchaseItem: (item: StoreItem) => {
        const { spendCoins } = get();
        
        if (!spendCoins(item.price)) {
          return false;
        }
        
        set((state) => ({
          economy: {
            ...state.economy,
            purchaseHistory: [...state.economy.purchaseHistory, item]
          }
        }));
        
        return true;
      },
      
      // Social Actions
      joinSquad: (squad: Squad) => {
        set((state) => ({
          social: {
            ...state.social,
            squad
          }
        }));
      },
      
      leaveSquad: () => {
        set((state) => ({
          social: {
            ...state.social,
            squad: null
          }
        }));
      },
      
      updateSquad: (squadUpdates: Partial<Squad>) => {
        set((state) => ({
          social: {
            ...state.social,
            squad: state.social.squad ? { ...state.social.squad, ...squadUpdates } : null
          }
        }));
      },
      
      addReaction: (reaction: Omit<Reaction, 'id'>) => {
        const newReaction: Reaction = {
          ...reaction,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        };
        
        set((state) => ({
          social: {
            ...state.social,
            reactionsSent: [...state.social.reactionsSent, newReaction]
          }
        }));
      },
      
      updateStreak: () => {
        const now = new Date();
        const lastUpdate = new Date(get().social.lastStreakUpdate);
        const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Continue streak
          set((state) => ({
            social: {
              ...state.social,
              streak: state.social.streak + 1,
              lastStreakUpdate: now.toISOString()
            }
          }));
        } else if (diffDays > 1) {
          // Reset streak
          set((state) => ({
            social: {
              ...state.social,
              streak: 0,
              lastStreakUpdate: now.toISOString()
            }
          }));
        }
        
        // Update consistency metrics
        const { updateConsistencyMetrics } = get();
        updateConsistencyMetrics();
      },
      
      // Consistency Actions
      updateConsistencyMetrics: () => {
        const state = get();
        const { streak } = state.social;
        
        // Calculate log compliance (percentage of days with logs in last 7 days)
        const last7Days = state.dailyLogs
          .filter(log => {
            const logDate = new Date(log.date);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          })
          .length;
        
        const logCompliance = Math.min((last7Days / 7) * 100, 100);
        const consistencyScore = calculateConsistencyScore(streak, logCompliance, last7Days);
        
        set({
          consistencyMetrics: {
            streak,
            logCompliance,
            consistencyScore,
            last7Days: Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - i);
              return {
                date: date.toISOString().split('T')[0],
                completed: state.dailyLogs.some(log => 
                  log.date.startsWith(date.toISOString().split('T')[0])
                ),
                score: consistencyScore
              };
            }).reverse()
          }
        });
      },
      
      // 智能调整Actions
      incrementFreeAdjustments: () => {
        set((state) => ({
          freeAdjustmentsUsed: state.freeAdjustmentsUsed + 1
        }));
      },
      
      resetFreeAdjustments: () => {
        set({ freeAdjustmentsUsed: 0 });
      },
      
      setProMember: (isPro: boolean) => {
        set({ isProMember: isPro });
      }
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => storageService.getZustandStorage()),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // 状态迁移逻辑
        if (version === 0) {
          // 从版本0迁移到版本1
          return {
            ...persistedState,
            preferences: {
              ...persistedState.preferences,
              notificationSchedule: {
                morning: true,
                afternoon: true,
                evening: false
              }
            }
          };
        }
        return persistedState;
      }
    }
  )
);

// Store hooks for common operations
export const useUser = () => useUserStore(state => state.user);
export const useIsAuthenticated = () => useUserStore(state => state.isAuthenticated);
export const usePreferences = () => useUserStore(state => state.preferences);
export const useDailyLogs = () => useUserStore(state => state.dailyLogs);
export const useHealthMetrics = () => useUserStore(state => state.healthMetrics);
export const useIsLoading = () => useUserStore(state => state.isLoading);
export const useError = () => useUserStore(state => state.error);

// Economy hooks
export const useEconomy = () => useUserStore(state => state.economy);
export const useMacroCoins = () => useUserStore(state => state.economy.macroCoins);
export const usePurchaseHistory = () => useUserStore(state => state.economy.purchaseHistory);

// Social hooks
export const useSocial = () => useUserStore(state => state.social);
export const useSquad = () => useUserStore(state => state.social.squad);
export const useStreak = () => useUserStore(state => state.social.streak);
export const useReactions = () => useUserStore(state => state.social.reactionsSent);

// Consistency hooks
export const useConsistencyMetrics = () => useUserStore(state => state.consistencyMetrics);

// 智能调整功能hooks
export const useFreeAdjustmentsUsed = () => useUserStore(state => state.freeAdjustmentsUsed);
export const useIsProMember = () => useUserStore(state => state.isProMember);

// Action hooks
export const useUserActions = () => useUserStore(state => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  completeOnboarding: state.completeOnboarding,
  updatePreferences: state.updatePreferences,
  addDailyLog: state.addDailyLog,
  updateHealthMetrics: state.updateHealthMetrics,
  clearUserData: state.clearUserData,
  syncHealthData: state.syncHealthData,
  addCoins: state.addCoins,
  spendCoins: state.spendCoins,
  purchaseItem: state.purchaseItem,
  joinSquad: state.joinSquad,
  leaveSquad: state.leaveSquad,
  updateSquad: state.updateSquad,
  addReaction: state.addReaction,
  updateStreak: state.updateStreak,
  updateConsistencyMetrics: state.updateConsistencyMetrics,
  incrementFreeAdjustments: state.incrementFreeAdjustments,
  resetFreeAdjustments: state.resetFreeAdjustments,
  setProMember: state.setProMember
}));
