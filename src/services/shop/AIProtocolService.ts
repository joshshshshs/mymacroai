/**
 * AI Protocol Generator Service
 * Analyzes last 30 days of user data and generates a personalized protocol
 */

import { DailyLog } from '@/src/types';

export interface ProtocolData {
  sleepAverage: number;
  sleepQuality: number;
  nutritionScore: number;
  activityLevel: number;
  consistency: number;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

export class AIProtocolService {
  /**
   * Analyze user's last 30 days of data
   */
  static analyzeLast30Days(dailyLogs: DailyLog[]): ProtocolData {
    const last30Days = dailyLogs.slice(-30);

    // Calculate sleep metrics
    const sleepData = last30Days
      .filter(log => log.sleepData)
      .map(log => log.sleepData!);

    const sleepAverage = sleepData.length > 0
      ? sleepData.reduce((sum, sleep) => sum + sleep.durationMinutes, 0) / sleepData.length / 60
      : 0;

    const sleepQuality = sleepData.length > 0
      ? sleepData.reduce((sum, sleep) => sum + (sleep.quality || 5), 0) / sleepData.length
      : 0;

    // Calculate nutrition score
    const nutritionLogs = last30Days.filter(log => log.nutritionData || log.calories);
    const nutritionScore = (nutritionLogs.length / 30) * 10;

    // Calculate activity level
    const activityLogs = last30Days.filter(log => log.activityData);
    const activityLevel = (activityLogs.length / 30) * 10;

    // Calculate consistency
    const consistency = (last30Days.length / 30) * 10;

    // Generate recommendations
    const recommendations: string[] = [];
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (sleepAverage < 7) {
      improvements.push('Increase sleep duration to 7-9 hours');
      recommendations.push('Set a consistent bedtime routine');
    } else {
      strengths.push('Excellent sleep duration');
    }

    if (sleepQuality < 6) {
      improvements.push('Improve sleep quality');
      recommendations.push('Reduce screen time before bed');
    } else {
      strengths.push('High quality sleep');
    }

    if (nutritionScore < 7) {
      improvements.push('Track nutrition more consistently');
      recommendations.push('Set daily reminders for meal logging');
    } else {
      strengths.push('Consistent nutrition tracking');
    }

    if (activityLevel < 7) {
      improvements.push('Increase physical activity');
      recommendations.push('Aim for 30 minutes of exercise daily');
    } else {
      strengths.push('Active lifestyle');
    }

    if (consistency < 8) {
      improvements.push('Improve daily tracking consistency');
      recommendations.push('Use streak freeze to protect progress');
    } else {
      strengths.push('Excellent consistency');
    }

    return {
      sleepAverage,
      sleepQuality,
      nutritionScore,
      activityLevel,
      consistency,
      recommendations,
      strengths,
      improvements,
    };
  }

  /**
   * Generate PDF protocol (returns markdown that can be shared/exported)
   */
  static generateProtocol(protocolData: ProtocolData, userName: string = 'User'): string {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
# MacroAI - Personalized Protocol
**Generated for:** ${userName}
**Date:** ${date}
**Period:** Last 30 Days

---

## 📊 Data Analysis

### Sleep Metrics
- **Average Duration:** ${protocolData.sleepAverage.toFixed(1)} hours
- **Quality Score:** ${protocolData.sleepQuality.toFixed(1)}/10

### Nutrition & Activity
- **Nutrition Consistency:** ${protocolData.nutritionScore.toFixed(1)}/10
- **Activity Level:** ${protocolData.activityLevel.toFixed(1)}/10
- **Overall Consistency:** ${protocolData.consistency.toFixed(1)}/10

---

## 💪 Your Strengths

${protocolData.strengths.map(s => `- ${s}`).join('\n')}

---

## 📈 Areas for Improvement

${protocolData.improvements.map(i => `- ${i}`).join('\n')}

---

## 🎯 30-Day Protocol

### Week 1-2: Foundation
${protocolData.recommendations.slice(0, 2).map((r, i) => `${i + 1}. ${r}`).join('\n')}

### Week 3-4: Optimization
${protocolData.recommendations.slice(2).map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

## 📅 Daily Checklist

- [ ] Track all meals and macros
- [ ] Log sleep quality
- [ ] Record physical activity
- [ ] Check-in with squad
- [ ] Maintain consistency score above 80%

---

*Generated with MacroAI - Your AI Health Coach*
*🤖 Powered by Claude Code*
`;
  }
}
