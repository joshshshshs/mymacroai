/**
 * RichContentRenderer - Renders rich content in AI Coach messages
 * 
 * Supports:
 * - Action buttons (navigate to app pages)
 * - Data tables
 * - Charts
 * - Plan cards
 * - Progress rings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

import {
  RichContent,
  ActionButtonData,
  DataTableData,
  ChartData,
  PlanCardData,
  ProgressRingData,
} from '@/src/types/ai-coach';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

// ============================================================================
// MAIN RENDERER
// ============================================================================

interface RichContentRendererProps {
  content: RichContent[];
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({ content }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {content.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          {item.type === 'action_button' && (
            <ActionButton data={item.data as ActionButtonData} isDark={isDark} />
          )}
          {item.type === 'data_table' && (
            <DataTable data={item.data as DataTableData} isDark={isDark} />
          )}
          {item.type === 'chart' && (
            <ChartDisplay data={item.data as ChartData} isDark={isDark} />
          )}
          {item.type === 'plan_card' && (
            <PlanCard data={item.data as PlanCardData} isDark={isDark} />
          )}
          {item.type === 'progress_ring' && (
            <ProgressRing data={item.data as ProgressRingData} isDark={isDark} />
          )}
        </View>
      ))}
    </View>
  );
};

// ============================================================================
// ACTION BUTTON
// ============================================================================

interface ActionButtonProps {
  data: ActionButtonData;
  isDark: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ data, isDark }) => {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: data.route as any,
      params: data.params,
    });
  };

  const isPrimary = data.style === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        isPrimary
          ? styles.actionButtonPrimary
          : { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {data.icon && (
        <Ionicons
          name={data.icon as any}
          size={18}
          color={isPrimary ? '#FFF' : (isDark ? '#FFF' : '#1A1A1A')}
        />
      )}
      <Text
        style={[
          styles.actionButtonText,
          { color: isPrimary ? '#FFF' : (isDark ? '#FFF' : '#1A1A1A') },
        ]}
      >
        {data.label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={isPrimary ? 'rgba(255,255,255,0.7)' : (isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93')}
      />
    </TouchableOpacity>
  );
};

// ============================================================================
// DATA TABLE
// ============================================================================

interface DataTableProps {
  data: DataTableData;
  isDark: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ data, isDark }) => {
  const bgColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const textColor = isDark ? '#FFF' : '#1A1A1A';
  const headerColor = isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.tableContainer, { backgroundColor: bgColor }]}>
      {data.title && (
        <Text style={[styles.tableTitle, { color: textColor }]}>{data.title}</Text>
      )}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeaderRow, { borderBottomColor: borderColor }]}>
            {data.headers.map((header, index) => (
              <View key={index} style={styles.tableCell}>
                <Text style={[styles.tableHeaderText, { color: headerColor }]}>
                  {header}
                </Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          {data.rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.tableRow,
                { borderBottomColor: borderColor },
                data.highlightRows?.includes(rowIndex) && styles.tableHighlightRow,
              ]}
            >
              {row.map((cell, cellIndex) => (
                <View key={cellIndex} style={styles.tableCell}>
                  <Text style={[styles.tableCellText, { color: textColor }]}>
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

// ============================================================================
// CHART
// ============================================================================

interface ChartDisplayProps {
  data: ChartData;
  isDark: boolean;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ data, isDark }) => {
  const textColor = isDark ? '#FFF' : '#1A1A1A';
  const bgColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

  if (data.type === 'progress') {
    const value = data.data.values[0] || 0;
    const max = data.data.values[1] || 100;
    const percentage = Math.min((value / max) * 100, 100);

    return (
      <View style={[styles.chartContainer, { backgroundColor: bgColor }]}>
        {data.title && (
          <Text style={[styles.chartTitle, { color: textColor }]}>{data.title}</Text>
        )}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: data.data.colors?.[0] || '#FF5C00' },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressValue, { color: textColor }]}>{value}</Text>
          <Text style={[styles.progressMax, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>
            / {max}
          </Text>
        </View>
      </View>
    );
  }

  // Bar chart
  if (data.type === 'bar') {
    const maxValue = Math.max(...data.data.values);

    return (
      <View style={[styles.chartContainer, { backgroundColor: bgColor }]}>
        {data.title && (
          <Text style={[styles.chartTitle, { color: textColor }]}>{data.title}</Text>
        )}
        <View style={styles.barChart}>
          {data.data.values.map((value, index) => (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(value / maxValue) * 100}%`,
                      backgroundColor: data.data.colors?.[index] || '#FF5C00',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93' }]}>
                {data.data.labels[index]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return null;
};

// ============================================================================
// PLAN CARD
// ============================================================================

interface PlanCardProps {
  data: PlanCardData;
  isDark: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ data, isDark }) => {
  const router = useRouter();
  const bgColor = isDark ? 'rgba(255,255,255,0.08)' : '#FFF';
  const textColor = isDark ? '#FFF' : '#1A1A1A';
  const subtextColor = isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93';

  const handleAction = () => {
    if (data.actionRoute) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(data.actionRoute as any);
    }
  };

  const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (data.type) {
      case 'workout': return 'barbell-outline';
      case 'meal': return 'restaurant-outline';
      case 'weekly': return 'calendar-outline';
      default: return 'document-outline';
    }
  };

  const getTypeColor = (): string => {
    switch (data.type) {
      case 'workout': return '#3B82F6';
      case 'meal': return '#22C55E';
      case 'weekly': return '#8B5CF6';
      default: return '#FF5C00';
    }
  };

  return (
    <View style={[styles.planCard, { backgroundColor: bgColor }]}>
      <View style={styles.planHeader}>
        <View style={[styles.planIconBg, { backgroundColor: `${getTypeColor()}20` }]}>
          <Ionicons name={getTypeIcon()} size={20} color={getTypeColor()} />
        </View>
        <View style={styles.planHeaderText}>
          <Text style={[styles.planTitle, { color: textColor }]}>{data.title}</Text>
          {data.subtitle && (
            <Text style={[styles.planSubtitle, { color: subtextColor }]}>{data.subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.planItems}>
        {data.items.map((item, index) => (
          <View key={index} style={styles.planItem}>
            <View style={styles.planItemLeft}>
              {item.completed !== undefined && (
                <Ionicons
                  name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={item.completed ? '#22C55E' : subtextColor}
                />
              )}
              <Text style={[styles.planItemName, { color: textColor }]}>{item.name}</Text>
            </View>
            {item.value !== undefined && (
              <Text style={[styles.planItemValue, { color: getTypeColor() }]}>
                {item.value}
              </Text>
            )}
          </View>
        ))}
      </View>

      {data.actionLabel && data.actionRoute && (
        <TouchableOpacity style={styles.planAction} onPress={handleAction} activeOpacity={0.8}>
          <Text style={[styles.planActionText, { color: getTypeColor() }]}>
            {data.actionLabel}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={getTypeColor()} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// PROGRESS RING
// ============================================================================

interface ProgressRingProps {
  data: ProgressRingData;
  isDark: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ data, isDark }) => {
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(data.value / data.max, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const color = data.color || '#FF5C00';

  const textColor = isDark ? '#FFF' : '#1A1A1A';
  const bgColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

  return (
    <View style={styles.progressRingContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.progressRingCenter, { width: size, height: size }]}>
        <Text style={[styles.progressRingValue, { color }]}>
          {data.value}
        </Text>
        {data.unit && (
          <Text style={[styles.progressRingUnit, { color: isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93' }]}>
            {data.unit}
          </Text>
        )}
      </View>
      <Text style={[styles.progressRingLabel, { color: textColor }]}>{data.label}</Text>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  itemContainer: {
    marginBottom: SPACING.sm,
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  actionButtonPrimary: {
    backgroundColor: '#FF5C00',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },

  // Data Table
  tableContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    borderBottomWidth: 2,
  },
  tableHighlightRow: {
    backgroundColor: 'rgba(255,92,0,0.1)',
  },
  tableCell: {
    minWidth: 80,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Chart
  chartContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.sm,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  progressMax: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: 24,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },

  // Plan Card
  planCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  planHeaderText: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  planSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  planItems: {
    gap: SPACING.sm,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  planItemName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  planItemValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  planAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: SPACING.xs,
  },
  planActionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Progress Ring
  progressRingContainer: {
    alignItems: 'center',
  },
  progressRingCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressRingUnit: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressRingLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
});

export default RichContentRenderer;
