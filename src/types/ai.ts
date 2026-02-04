// AI-related type definitions
import type { User, UserPreferences, HealthData, NutritionData } from './core';

export interface AIContext {
    user: User;
    healthData: HealthData[];
    nutritionData: NutritionData[];
    preferences: UserPreferences;
    timestamp: string;
}

export interface AIAnalysis {
    overallAssessment: string;
    specificRecommendations: string[];
    personalizedGoals: string[];
    nextSteps: string[];
    generatedAt: string;
}

export interface AIRecommendation {
    type: 'nutrition' | 'workout' | 'lifestyle' | 'health';
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    generatedAt: string;
    expiresAt?: string;
}

export interface AIConversation {
    id: string;
    messages: AIMessage[];
    context: AIContext;
    createdAt: string;
    updatedAt: string;
}

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: {
        analysisType?: string;
        confidence?: number;
        sources?: string[];
    };
}

export interface AICommand {
    type: 'analyze' | 'recommend' | 'generate' | 'explain';
    target: string;
    parameters: Record<string, any>;
    expectedResponse: string;
    expectResponse?: string; // Add alias/fix as needed
}

export interface AIPromptTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    variables: string[];
    category: 'health' | 'nutrition' | 'fitness' | 'general';
}
