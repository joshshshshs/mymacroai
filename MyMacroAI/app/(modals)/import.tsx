import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn,
  SlideInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring 
} from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { csvParserService, CSVParserResult } from '../../services/import/CSVParser';
import { useUserStore } from '../../store/userStore';
import { useHaptics } from '../../hooks/useHaptics';
import { logger } from '../../utils/logger';

/**
 * Legacy Bridge导入界面 - MyFitnessPal数据迁移
 */
export default function ImportModal() {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<CSVParserResult | null>(null);
  const { addDailyLog } = useUserStore(state => state);
  const { triggerSuccess, triggerError } = useHaptics();

  // 选择CSV文件
  const handleFilePick = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file.uri) {
        throw new Error('无法访问文件');
      }

      await processCSVFile(file.uri);
    } catch (error) {
      logger.error('文件选择错误:', error);
      triggerError();
      Alert.alert('导入失败', '请选择有效的CSV文件');
    }
  }, []);

  // 处理CSV文件
  const processCSVFile = async (fileUri: string) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      // 读取文件内容
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      
      // 验证文件格式
      if (!csvParserService.validateCSVFormat(fileContent)) {
        throw new Error('文件格式不符合MyFitnessPal标准');
      }

      // 解析CSV数据
      const result = await csvParserService.parseCSVData(fileContent);
      setImportResult(result);

      if (result.success) {
        await importDailyLogs(result.data);
        triggerSuccess();
        Alert.alert('导入成功', `成功导入 ${result.data.length} 条记录`);
      } else {
        triggerError();
        Alert.alert('导入失败', `发现 ${result.errors.length} 个错误`);
      }
    } catch (error) {
      logger.error('CSV处理错误:', error);
      triggerError();
      Alert.alert('导入失败', error instanceof Error ? error.message : '未知错误');
      setIsImporting(false);
    }
  };

  // 导入数据到用户存储
  const importDailyLogs = async (logs: any[]) => {
    for (const log of logs) {
      addDailyLog(log);
      // 添加小延迟避免UI阻塞
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  };

  // 重新开始导入
  const handleRestart = () => {
    setImportResult(null);
  };

  // 关闭模态框
  const handleClose = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 背景遮罩 */}
      <Pressable 
        style={{ flex: 1 }} 
        onPress={handleClose}
      />
      
      {/* 导入界面内容 */}
      <Animated.View 
        entering={SlideInDown.springify().damping(15)}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80%',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          overflow: 'hidden',
        }}
      >
        <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 24 }}>
            
            {/* 标题区域 */}
            <Animated.View 
              entering={FadeIn.duration(600)}
              style={{ alignItems: 'center', marginBottom: 32 }}
            >
              <Text style={{ 
                fontSize: 28, 
                fontWeight: 'bold', 
                color: '#fff',
                marginBottom: 8 
              }}>
                Legacy Bridge
              </Text>
              <Text style={{ 
                fontSize: 16, 
                color: '#9CA3AF',
                textAlign: 'center',
                lineHeight: 22 
              }}>
                从MyFitnessPal迁移您的历史数据
              </Text>
            </Animated.View>

            <ScrollView showsVerticalScrollIndicator={false}>
              
              {!importResult ? (
                // 初始导入界面
                <Animated.View entering={FadeIn.delay(200)}>
                  
                  {/* 功能介绍 */}
                  <View style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: 20, 
                    padding: 20,
                    marginBottom: 24 
                  }}>
                    <Text style={{ 
                      fontSize: 16, 
                      color: '#fff', 
                      marginBottom: 12,
                      fontWeight: '600' 
                    }}>
                      📊 支持的数据类型
                    </Text>
                    <Text style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 20 }}>
                      • 每日卡路里摄入{"\n"}
                      • 营养元素分布{"\n"}
                      • 饮食记录时间线{"\n"}
                      • 长达数年的历史数据
                    </Text>
                  </View>

                  {/* 文件选择区域 */}
                  <Pressable 
                    onPress={handleFilePick}
                    disabled={isImporting}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                      borderWidth: 2,
                      borderColor: '#3B82F6',
                      borderStyle: 'dashed',
                      borderRadius: 20,
                      padding: 40,
                      alignItems: 'center',
                      marginBottom: 24
                    })}
                  >
                    {isImporting ? (
                      <ActivityIndicator size="large" color="#3B82F6" />
                    ) : (
                      <>
                        <Text style={{ fontSize: 48, marginBottom: 16 }}>📁</Text>
                        <Text style={{ 
                          fontSize: 18, 
                          fontWeight: 'bold', 
                          color: '#3B82F6',
                          marginBottom: 8 
                        }}>
                          选择CSV文件
                        </Text>
                        <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
                          支持MyFitnessPal导出的标准CSV格式
                        </Text>
                      </>
                    )}
                  </Pressable>

                  {/* 使用说明 */}
                  <View style={{ 
                    backgroundColor: 'rgba(107, 114, 128, 0.2)', 
                    borderRadius: 16, 
                    padding: 16 
                  }}>
                    <Text style={{ 
                      fontSize: 14, 
                      color: '#9CA3AF',
                      fontStyle: 'italic',
                      textAlign: 'center' 
                    }}>
                      在MyFitnessPal中：设置 → 导出数据 → 选择CSV格式
                    </Text>
                  </View>

                </Animated.View>
              ) : (
                // 导入结果界面
                <Animated.View entering={ZoomIn}>
                  
                  {/* 结果统计 */}
                  <View style={{ 
                    backgroundColor: importResult.success ? 
                      'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    borderRadius: 20, 
                    padding: 20,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: importResult.success ? '#10B981' : '#EF4444'
                  }}>
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: 'bold', 
                      color: importResult.success ? '#10B981' : '#EF4444',
                      marginBottom: 12,
                      textAlign: 'center'
                    }}>
                      {importResult.success ? '✅ 导入成功' : '❌ 导入失败'}
                    </Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
                          {importResult.stats.validRows}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>成功导入</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
                          {importResult.stats.errorCount}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>错误数量</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
                          {((importResult.stats.validRows / importResult.stats.totalRows) * 100).toFixed(0)}%
                        </Text>
                        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>成功率</Text>
                      </View>
                    </View>
                  </View>

                  {/* 错误详情（如果有） */}
                  {importResult.errors.length > 0 && (
                    <View style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                      borderRadius: 16, 
                      padding: 16,
                      marginBottom: 24 
                    }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600', 
                        color: '#EF4444',
                        marginBottom: 8 
                      }}>
                        错误详情
                      </Text>
                      <ScrollView style={{ maxHeight: 120 }}>
                        {importResult.errors.map((error, index) => (
                          <Text key={index} style={{ 
                            fontSize: 12, 
                            color: '#FCA5A5',
                            marginBottom: 4 
                          }}>
                            • {error}
                          </Text>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* 操作按钮 */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Pressable 
                      onPress={handleRestart}
                      style={({ pressed }) => ({
                        flex: 1,
                        backgroundColor: pressed ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center'
                      })}
                    >
                      <Text style={{ color: '#D1D5DB', fontWeight: '600' }}>重新导入</Text>
                    </Pressable>
                    <Pressable 
                      onPress={handleClose}
                      style={({ pressed }) => ({
                        flex: 1,
                        backgroundColor: pressed ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center'
                      })}
                    >
                      <Text style={{ color: '#3B82F6', fontWeight: '600' }}>查看数据</Text>
                    </Pressable>
                  </View>

                </Animated.View>
              )}
            </ScrollView>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}