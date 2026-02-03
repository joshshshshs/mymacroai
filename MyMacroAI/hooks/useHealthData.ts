/**
 * useHealthData - Hook for health and recovery metrics
 * Currently mocked, will integrate with Apple Health / Oura API
 */

import { useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface SleepData {
  total: string;
  totalMinutes: number;
  rem: string;
  remMinutes: number;
  deep: string;
  deepMinutes: number;
  light: string;
  lightMinutes: number;
}

export interface RespirationData {
  rpm: number;
  tempDeviation: number;
}

export interface CycleData {
  phase: 'FOLLICULAR' | 'OVULATION' | 'LUTEAL' | 'MENSTRUAL';
  day: number;
  bmrChange: number;
}

export type StressLevel = 'low' | 'moderate' | 'high';

export interface HealthData {
  recoveryScore: number;
  recoveryStatus: 'prime' | 'adapt' | 'recover';
  hrv: number;
  hrvTrend: 'up' | 'down' | 'stable';
  rhr: number;
  rhrTrend: 'up' | 'down' | 'stable';
  sleep: SleepData;
  respiration: RespirationData;
  stress: StressLevel;
  stressHistory: number[];
  spo2: number;
  strain: number;
  capacity: number;
  cycle?: CycleData;
  lastUpdated: Date;
}

// ============================================================================
// Mock Data
// ============================================================================

function generateMockHealthData(): HealthData {
  const recoveryScore = 82;
  let recoveryStatus: HealthData['recoveryStatus'] = 'prime';
  if (recoveryScore < 40) recoveryStatus = 'recover';
  else if (recoveryScore < 80) recoveryStatus = 'adapt';

  const stressHistory = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 30) + 10
  );

  return {
    recoveryScore,
    recoveryStatus,
    hrv: 112,
    hrvTrend: 'up',
    rhr: 48,
    rhrTrend: 'down',
    sleep: {
      total: '7h 42m',
      totalMinutes: 462,
      rem: '2h 10m',
      remMinutes: 130,
      deep: '1h 32m',
      deepMinutes: 92,
      light: '4h',
      lightMinutes: 240,
    },
    respiration: { rpm: 14.2, tempDeviation: 0.2 },
    stress: 'low',
    stressHistory,
    spo2: 98,
    strain: 8.5,
    capacity: 14.5,
    cycle: { phase: 'LUTEAL', day: 22, bmrChange: 150 },
    lastUpdated: new Date(),
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useHealthData() {
  const [data, setData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In development, automatically load mock data
    if (__DEV__) {
      setData(generateMockHealthData());
      setIsLoading(false);
    } else {
      // Production: Wait for real device connection
      setIsLoading(false);
      setData(null);
    }
  }, []);

  // refresh() can be used to manually load mock data in development
  const refresh = () => {
    if (__DEV__) {
      setData(generateMockHealthData());
    }
  };

  return { data, isLoading, refresh };
}

// ============================================================================
// Utils
// ============================================================================

export function getRecoveryColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

export function getRecoveryLabel(score: number): string {
  if (score >= 80) return 'Prime to Perform';
  if (score >= 40) return 'Adapt & Manage';
  return 'Focus on Recovery';
}