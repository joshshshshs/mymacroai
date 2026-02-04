import type {
  PhysiqueAnalysisResult,
  PhysiqueGoal,
} from '../privacy/ImageObfuscator';

export interface TrainingDay {
  id?: string;
  name: string;
  type?: string;
  exercises: string[];
}

export interface TrainingProgram {
  days: TrainingDay[];
}

export interface ProgramAdjustment {
  updatedProgram: TrainingProgram;
  adjustments: string[];
  carbTargetDelta?: number;
  updatedCarbTarget?: number;
}

class ProgramAdjuster {
  adjustProgram(
    program: TrainingProgram,
    analysis: PhysiqueAnalysisResult,
    goal: PhysiqueGoal,
    currentCarbTarget?: number
  ): ProgramAdjustment {
    const updatedProgram: TrainingProgram = {
      ...program,
      days: program.days.map(day => ({
        ...day,
        exercises: [...day.exercises],
      })),
    };

    const adjustments: string[] = [];
    let carbTargetDelta: number | undefined;
    let updatedCarbTarget = currentCarbTarget;

    const hasUpperChestWeakness = analysis.weaknesses.some(weakness =>
      weakness.toLowerCase().includes('upper chest')
    );

    if (hasUpperChestWeakness) {
      const pushDay = updatedProgram.days.find(day =>
        `${day.type || day.name}`.toLowerCase().includes('push')
      );

      if (pushDay) {
        const hasIncline = pushDay.exercises.some(exercise =>
          exercise.toLowerCase().includes('incline dumbbell press')
        );

        if (!hasIncline) {
          pushDay.exercises.push('Incline Dumbbell Press');
          adjustments.push('Added Incline Dumbbell Press to the next Push day.');
        }
      } else {
        adjustments.push(
          'Upper Chest weakness detected. Add Incline Dumbbell Press to your next Push day.'
        );
      }
    }

    if (goal === 'cut' && analysis.est_body_fat > 20) {
      carbTargetDelta = -20;
      adjustments.push('Suggest reducing daily carb target by 20g.');

      if (typeof currentCarbTarget === 'number') {
        updatedCarbTarget = Math.max(0, currentCarbTarget + carbTargetDelta);
      }
    }

    return {
      updatedProgram,
      adjustments,
      carbTargetDelta,
      updatedCarbTarget,
    };
  }
}

export const programAdjuster = new ProgramAdjuster();
export default programAdjuster;
