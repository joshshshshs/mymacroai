/**
 * Streak Freeze Service
 * Manages streak protection and freeze days
 */

export interface StreakFreeze {
  id: string;
  daysRemaining: number;
  activatedAt: string;
  expiresAt: string;
}

export class StreakFreezeService {
  /**
   * Activate a streak freeze
   */
  static activateFreeze(days: number): StreakFreeze {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return {
      id: `freeze_${Date.now()}`,
      daysRemaining: days,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Check if user has active freeze
   */
  static hasActiveFreeze(freezes: StreakFreeze[]): boolean {
    const now = new Date();
    return freezes.some(freeze => {
      const expiresAt = new Date(freeze.expiresAt);
      return expiresAt > now && freeze.daysRemaining > 0;
    });
  }

  /**
   * Get remaining freeze days
   */
  static getRemainingDays(freezes: StreakFreeze[]): number {
    const now = new Date();
    return freezes.reduce((total, freeze) => {
      const expiresAt = new Date(freeze.expiresAt);
      if (expiresAt > now && freeze.daysRemaining > 0) {
        return total + freeze.daysRemaining;
      }
      return total;
    }, 0);
  }

  /**
   * Use one freeze day (called when user misses a day)
   */
  static useFreezeDay(freezes: StreakFreeze[]): StreakFreeze[] {
    const now = new Date();
    let used = false;

    return freezes.map(freeze => {
      if (!used && freeze.daysRemaining > 0) {
        const expiresAt = new Date(freeze.expiresAt);
        if (expiresAt > now) {
          used = true;
          return {
            ...freeze,
            daysRemaining: freeze.daysRemaining - 1,
          };
        }
      }
      return freeze;
    }).filter(freeze => freeze.daysRemaining > 0);
  }
}
