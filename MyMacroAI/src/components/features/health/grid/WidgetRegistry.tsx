/**
 * Widget Registry
 * Central registry of all health grid widgets with metadata
 */

import React from 'react';
import { RecoveryWidget } from './widgets/RecoveryWidget';
import { CaloriesWidget } from './widgets/CaloriesWidget';
import { SleepWidget } from './widgets/SleepWidget';
import { HeartRateWidget } from './widgets/HeartRateWidget';
import { StrainWidget } from './widgets/StrainWidget';

// Widget size types
export type WidgetSize = {
    width: 1 | 2; // Grid columns (1 = half, 2 = full)
    height: 1 | 2; // Grid rows
};

// Widget definition
export interface WidgetDefinition {
    Component: React.FC;
    label: string;
    defaultSize: WidgetSize;
}

// Widget ID type for type safety
export type WidgetId = 'recovery' | 'calories' | 'sleep' | 'strain' | 'heart_rate';

// The Registry Maps IDs to Components
export const WIDGET_REGISTRY: Record<WidgetId, WidgetDefinition> = {
    recovery: {
        Component: RecoveryWidget,
        label: 'Recovery',
        defaultSize: { width: 2, height: 2 },
    },
    calories: {
        Component: CaloriesWidget,
        label: 'Nutrition',
        defaultSize: { width: 2, height: 1 },
    },
    sleep: {
        Component: SleepWidget,
        label: 'Sleep',
        defaultSize: { width: 1, height: 1 },
    },
    strain: {
        Component: StrainWidget,
        label: 'Strain',
        defaultSize: { width: 1, height: 1 },
    },
    heart_rate: {
        Component: HeartRateWidget,
        label: 'Heart Rate',
        defaultSize: { width: 2, height: 1 },
    },
};

// Default layout order
export const DEFAULT_HEALTH_LAYOUT: WidgetId[] = [
    'recovery',
    'calories',
    'strain',
    'sleep',
    'heart_rate',
];

// Get widget dimensions in pixels for grid
export const getWidgetDimensions = (widgetId: WidgetId, columnWidth: number, rowHeight: number) => {
    const widget = WIDGET_REGISTRY[widgetId];
    if (!widget) return { width: columnWidth, height: rowHeight };

    return {
        width: widget.defaultSize.width === 2 ? columnWidth * 2 : columnWidth,
        height: widget.defaultSize.height === 2 ? rowHeight * 2 : rowHeight,
    };
};
