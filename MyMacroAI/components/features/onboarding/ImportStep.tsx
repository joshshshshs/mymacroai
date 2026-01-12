import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import Button from '../../../components/ui/Button';
import Typography from '../../../components/ui/Typography';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { csvParserService, CSVParserResult } from '../../../services/import/CSVParser';
import { useUserActions, useDailyLogs } from '../../../store/userStore';
import { logger } from '../../../utils/logger';

const { width } = Dimensions.get('window');

interface ImportStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const ImportStep: React.FC<ImportStepProps> = ({ onNext, onBack }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<CSVParserResult | null>(null);
  const { addDailyLog } = useUserActions();
  const dailyLogs = useDailyLogs();

  const handleFilePick = async () => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled) return;

      const file = pickerResult.assets[0];
      setIsImporting(true);

      // 读取CSV文件内容
      const response = await fetch(file.uri);
      const csvContent = await response.text();

      // 验证CSV格式
      if (!csvParserService.validateCSVFormat(csvContent)) {
        Alert.alert(
          'Invalid Format',
          'The selected file does not appear to be a valid MyFitnessPal CSV file.'
        );
        setIsImporting(false);
        return;
      }

      // 解析CSV数据
      const parseResult = await csvParserService.parseCSVData(csvContent);
      setImportResult(parseResult);

      if (parseResult.success && parseResult.data.length > 0) {
        // 保存导入的数据
        parseResult.data.forEach(log => {
          addDailyLog(log);
        });

        Alert.alert(
          'Import Successful',
          `Successfully imported ${parseResult.data.length} days of data from MyFitnessPal.`
        );
      } else {
        Alert.alert(
          'Import Issues',
          `Imported ${parseResult.data.length} days. ${parseResult.errors.length} errors occurred.`
        );
      }
    } catch (error) {
      logger.error('Import error:', error);
      Alert.alert(
        'Import Failed',
        'An error occurred while importing your data. Please try again.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Import?',
      'You can always import your data later from the settings menu.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: onNext }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#4facfe', '#00f2fe']}
      style={styles.container}
    >
      <Animated.View 
        entering={SlideInLeft.duration(600)}
        style={styles.content}
      >
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Import Your Data
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Bring your MyFitnessPal history to get personalized insights from day one.
          </Typography>
        </View>

        <View style={styles.importSection}>
          <View style={styles.importCard}>
            <Text style={styles.importIcon}>📊</Text>
            <Typography variant="h3" style={styles.importTitle}>
              MyFitnessPal CSV Import
            </Typography>
            <Typography variant="body" style={styles.importDescription}>
              Export your data from MyFitnessPal as CSV and import it here to continue your progress.
            </Typography>

            <Button
              title={isImporting ? "Importing..." : "Choose CSV File"}
              variant="secondary"
              onPress={handleFilePick}
              disabled={isImporting}
              style={styles.importButton}
            />

            {importResult && (
              <Animated.View 
                entering={FadeIn.duration(400)}
                style={styles.resultContainer}
              >
                <Typography variant="body" style={styles.resultText}>
                  ✅ Imported {importResult.data.length} days
                </Typography>
                {importResult.errors.length > 0 && (
                  <Typography variant="caption" style={styles.errorText}>
                    {importResult.errors.length} warnings
                  </Typography>
                )}
              </Animated.View>
            )}
          </View>

          <View style={styles.benefits}>
            <Typography variant="h4" style={styles.benefitsTitle}>
              Why import?
            </Typography>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <Typography variant="body" style={styles.benefitText}>
                Personalized baseline based on your history
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📈</Text>
              <Typography variant="body" style={styles.benefitText}>
                Track progress across multiple platforms
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🤖</Text>
              <Typography variant="body" style={styles.benefitText}>
                AI learns faster with your existing data
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            variant="transparent"
            onPress={onBack}
            style={styles.backButton}
          />
          <Button
            title={dailyLogs.length > 0 ? "Continue" : "Skip Import"}
            variant="primary"
            onPress={dailyLogs.length > 0 ? onNext : handleSkip}
            style={styles.continueButton}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  importSection: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  importCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  importIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  importTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  importDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  importButton: {
    minWidth: 200,
  },
  resultContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  resultText: {
    color: '#90EE90',
    fontWeight: '600',
  },
  errorText: {
    color: '#FFB6C1',
    marginTop: 4,
  },
  benefits: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  benefitsTitle: {
    color: '#FFFFFF',
    marginBottom: 16,
    fontWeight: '600',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  benefitText: {
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 20,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    borderWidth: 0,
  },
  continueButton: {
    flex: 2,
    marginLeft: 8,
  },
});
