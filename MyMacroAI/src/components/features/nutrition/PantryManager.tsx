import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import BentoCard from '../../../../components/ui/BentoCard';
import { useHaptics } from '../../../../hooks/useHaptics';
import { usePantryStore, usePantryItems, useSearchResults, usePantryCategories, useItemsByCategory } from '../../../store/pantryStore';

/**
 * 储藏室管理器组件
 * 提供标签云UI，支持搜索和点击操作
 */
export const PantryManager: React.FC = () => {
  const { triggerHaptic } = useHaptics();
  const { addItem, removeItem, toggleItem } = usePantryStore();
  const items = usePantryItems();
  const categories = usePantryCategories();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 搜索过滤
  const searchResults = useSearchResults(searchQuery);
  const categorizedItems = useItemsByCategory(selectedCategory || '');

  // 显示的项目列表
  const displayItems = useMemo(() => {
    if (searchQuery && searchResults.length > 0) {
      return searchResults;
    }
    if (selectedCategory && categorizedItems.length > 0) {
      return categorizedItems;
    }
    return items;
  }, [items, searchResults, categorizedItems, searchQuery, selectedCategory]);

  const handleAddItem = (itemName: string) => {
    triggerHaptic('light');
    addItem(itemName);
    setSearchQuery(''); // 清空搜索框
  };

  const handleRemoveItem = (itemName: string) => {
    triggerHaptic('light');
    removeItem(itemName);
  };

  const handleToggleItem = (itemName: string) => {
    triggerHaptic('light');
    toggleItem(itemName);
  };

  const handleCategorySelect = (category: string) => {
    triggerHaptic('light');
    setSelectedCategory(selectedCategory === category ? null : category);
    setSearchQuery(''); // 清空搜索框
  };

  // 常见食材快速添加
  const quickAddItems = [
    '鸡蛋', '牛奶', '面包', '米饭', '鸡胸肉', '牛肉', 
    '胡萝卜', '洋葱', '大蒜', '橄榄油', '盐', '胡椒'
  ];

  return (
    <BentoCard style={styles.card} tint="light" intensity={80}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🍽️</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>我的储藏室</Text>
          <Text style={styles.headerSubtitle}>管理您的食材库存</Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* 搜索栏 */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索食材..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* 分类筛选 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesSection}
        >
          {categories.map((category: string) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipSelected
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 快速添加 */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>快速添加</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickAddScroll}
          >
            {quickAddItems.map((item: string) => (
              <TouchableOpacity
                key={item}
                style={styles.quickAddChip}
                onPress={() => handleAddItem(item)}
              >
                <Text style={styles.quickAddText}>+ {item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 食材标签云 */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory} (${displayItems.length})` : `全部食材 (${displayItems.length})`}
          </Text>
          
          <View style={styles.itemsGrid}>
            {displayItems.map((item: string, index: number) => (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={styles.itemChip}
                onPress={() => handleToggleItem(item)}
                onLongPress={() => handleRemoveItem(item)}
              >
                <Text style={styles.itemText}>{item}</Text>
                <View style={styles.removeButton}>
                  <Text style={styles.removeText}>×</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {displayItems.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? '没有找到相关食材' : '储藏室为空'}
              </Text>
              <Text style={styles.emptySubtext}>
                点击上方快速添加或使用搜索功能
              </Text>
            </View>
          )}
        </View>

        {/* 状态统计 */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{items.length}</Text>
            <Text style={styles.statLabel}>总食材</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>分类</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round((displayItems.length / Math.max(items.length, 1)) * 100)}%
            </Text>
            <Text style={styles.statLabel}>显示比例</Text>
          </View>
        </View>
      </View>
    </BentoCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  container: {
    paddingTop: 8,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesSection: {
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#10B981',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  quickAddSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickAddScroll: {
    marginBottom: 8,
  },
  quickAddChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  quickAddText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  itemText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'none', // 默认隐藏，长按时显示
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

// Hook版本导出
export const usePantryManager = () => {
  return {
    // 可以添加一些自定义逻辑
  };
};

export default PantryManager;
