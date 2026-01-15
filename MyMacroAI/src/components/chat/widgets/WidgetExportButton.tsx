/**
 * WidgetExportButton - Universal share/export button for widgets
 * Converts data to shareable text and triggers Share API
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Share, Alert, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';

interface ExportButtonProps {
    data: any;
    type: 'MACRO_PIE' | 'PROGRESS_BAR' | 'DATA_TABLE';
}

export const WidgetExportButton: React.FC<ExportButtonProps> = ({ data, type }) => {
    const { light } = useHaptics();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const formatExportText = (): string => {
        switch (type) {
            case 'MACRO_PIE': {
                const { p, c, f } = data;
                const total = p * 4 + c * 4 + f * 9;
                return `📊 Macro Breakdown\n\nProtein: ${p}g (${Math.round((p * 4 / total) * 100)}%)\nCarbs: ${c}g (${Math.round((c * 4 / total) * 100)}%)\nFat: ${f}g (${Math.round((f * 9 / total) * 100)}%)\n\nTotal: ${total} kcal\n\n— Exported from MyMacro AI`;
            }

            case 'PROGRESS_BAR': {
                const { label, current, target, unit } = data;
                const percent = Math.round((current / target) * 100);
                return `📈 ${label}\n\nProgress: ${current}${unit} / ${target}${unit} (${percent}%)\n\n— Exported from MyMacro AI`;
            }

            case 'DATA_TABLE': {
                const { title, headers, rows } = data;
                const csvHeader = headers.join(',');
                const csvRows = rows.map((row: string[]) => row.join(',')).join('\n');
                return `📋 ${title}\n\n${csvHeader}\n${csvRows}\n\n— Exported from MyMacro AI`;
            }

            default:
                return 'Data from MyMacro AI';
        }
    };

    const handleExport = async () => {
        light();
        try {
            const message = formatExportText();
            await Share.share({
                message,
                title: 'MyMacro AI Export',
            });
        } catch (error) {
            Alert.alert('Export Failed', 'Could not share data');
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={handleExport}
            activeOpacity={0.7}
        >
            <Ionicons name="share-outline" size={16} color={isDark ? '#FFFFFF' : '#666666'} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
