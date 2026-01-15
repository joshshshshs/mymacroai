/**
 * WidgetParser - Detects JSON widget blocks in AI messages
 * Returns parsed text and widget component
 */

import React from 'react';
import { View } from 'react-native';
import { WidgetMacroPie, WidgetProgressBar, WidgetDataTable } from './widgets';

// ============================================================================
// Types
// ============================================================================

type WidgetType = 'MACRO_PIE' | 'PROGRESS_BAR' | 'DATA_TABLE';

interface WidgetBlock {
    widget: WidgetType;
    data?: any;
    label?: string;
    current?: number;
    target?: number;
    unit?: string;
    title?: string;
    headers?: string[];
    rows?: string[][];
}

interface ParsedMessage {
    text: string;
    widgetData: WidgetBlock | null;
}

// ============================================================================
// Parser Functions
// ============================================================================

/**
 * Regex to find JSON object at the end of a string
 * Matches: {...} at the end with optional whitespace
 */
const WIDGET_JSON_REGEX = /\{[^{}]*"widget"\s*:\s*"(MACRO_PIE|PROGRESS_BAR|DATA_TABLE)"[^{}]*\}\s*$/;

/**
 * More flexible regex for nested objects (like data in MACRO_PIE)
 */
const FULL_JSON_REGEX = /(\{[\s\S]*"widget"\s*:\s*"(MACRO_PIE|PROGRESS_BAR|DATA_TABLE)"[\s\S]*\})\s*$/;

/**
 * Parse message content to extract text and widget data
 */
export function parseWidgetFromMessage(content: string): ParsedMessage {
    try {
        // Try to find JSON block at the end
        const match = content.match(FULL_JSON_REGEX);

        if (!match) {
            return { text: content, widgetData: null };
        }

        const jsonString = match[1];
        const textBeforeJson = content.slice(0, content.lastIndexOf(jsonString)).trim();

        // Parse the JSON
        const parsed = JSON.parse(jsonString) as WidgetBlock;

        // Validate widget type
        if (!['MACRO_PIE', 'PROGRESS_BAR', 'DATA_TABLE'].includes(parsed.widget)) {
            return { text: content, widgetData: null };
        }

        return {
            text: textBeforeJson,
            widgetData: parsed,
        };
    } catch (error) {
        // If JSON parsing fails, return original content
        return { text: content, widgetData: null };
    }
}

// ============================================================================
// Widget Renderer Component
// ============================================================================

interface WidgetRendererProps {
    widgetData: WidgetBlock;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widgetData }) => {
    switch (widgetData.widget) {
        case 'MACRO_PIE':
            if (widgetData.data) {
                return <WidgetMacroPie data={widgetData.data} />;
            }
            return null;

        case 'PROGRESS_BAR':
            if (widgetData.label && widgetData.current !== undefined && widgetData.target !== undefined) {
                return (
                    <WidgetProgressBar
                        data={{
                            label: widgetData.label,
                            current: widgetData.current,
                            target: widgetData.target,
                            unit: widgetData.unit || '',
                        }}
                    />
                );
            }
            return null;

        case 'DATA_TABLE':
            if (widgetData.title && widgetData.headers && widgetData.rows) {
                return (
                    <WidgetDataTable
                        data={{
                            title: widgetData.title,
                            headers: widgetData.headers,
                            rows: widgetData.rows,
                        }}
                    />
                );
            }
            return null;

        default:
            return null;
    }
};

// ============================================================================
// Combined Message Component
// ============================================================================

interface ParsedMessageViewProps {
    content: string;
    renderText: (text: string) => React.ReactNode;
}

/**
 * Parses content and renders both text and widget if present
 */
export const ParsedMessageView: React.FC<ParsedMessageViewProps> = ({
    content,
    renderText,
}) => {
    const { text, widgetData } = parseWidgetFromMessage(content);

    return (
        <View>
            {text && renderText(text)}
            {widgetData && <WidgetRenderer widgetData={widgetData} />}
        </View>
    );
};
