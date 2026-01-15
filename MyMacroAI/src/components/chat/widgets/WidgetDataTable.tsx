/**
 * WidgetDataTable - Scrollable table for workouts/plans
 * Horizontal scroll with sticky first column
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { WidgetExportButton } from './WidgetExportButton';

interface DataTableData {
    title: string;
    headers: string[];
    rows: string[][];
}

interface Props {
    data: DataTableData;
}

export const WidgetDataTable: React.FC<Props> = ({ data }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { title, headers, rows } = data;

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FAFAF8',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
        headerBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        rowBorder: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        accent: '#FF6B35',
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <WidgetExportButton data={data} type="DATA_TABLE" />

            {/* Title */}
            <View style={styles.titleRow}>
                <View style={[styles.titleBadge, { backgroundColor: `${colors.accent}20` }]}>
                    <Text style={[styles.titleText, { color: colors.accent }]}>{title}</Text>
                </View>
            </View>

            {/* Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.table}>
                    {/* Header Row */}
                    <View style={[styles.row, styles.headerRow, { backgroundColor: colors.headerBg }]}>
                        {headers.map((header, index) => (
                            <View key={index} style={[styles.cell, index === 0 && styles.firstCell]}>
                                <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                                    {header}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Data Rows */}
                    {rows.map((row, rowIndex) => (
                        <View
                            key={rowIndex}
                            style={[styles.row, { borderBottomColor: colors.rowBorder }]}
                        >
                            {row.map((cell, cellIndex) => (
                                <View key={cellIndex} style={[styles.cell, cellIndex === 0 && styles.firstCell]}>
                                    <Text
                                        style={[
                                            styles.cellText,
                                            { color: cellIndex === 0 ? colors.text : colors.textSecondary },
                                            cellIndex === 0 && styles.firstCellText,
                                        ]}
                                    >
                                        {cell}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingRight: 40, // Space for export button
    },
    titleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    titleText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    table: {
        minWidth: '100%',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    headerRow: {
        borderRadius: 8,
        borderBottomWidth: 0,
        marginBottom: 4,
    },
    cell: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 80,
    },
    firstCell: {
        minWidth: 120,
    },
    headerText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cellText: {
        fontSize: 14,
    },
    firstCellText: {
        fontWeight: '600',
    },
});
