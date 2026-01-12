import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../../components/ui/Button';
import Typography from '../../../components/ui/Typography';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { healthSyncService } from '../../../services/health/HealthSync';
import { useUserActions, usePreferences } from '../../../store/userStore';
import { logger } from '../../../utils/logger';

const { width } = Dimensions.get('window');

interface HealthStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const HealthStep: React.FC<HealthStepProps> = ({ onNext, onBack }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { updatePreferences, syncHealthData } = useUserActions();
  const preferences = usePreferences();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const currentPermissions = await healthSyncService.checkPermissions();
      setPermissions(currentPermissions);
    } catch (error) {
      logger.error('Permission check error:', error);
    }
  };

  const requestHealthPermissions = async () => {
    try {
      setIsRequesting(true);
      setSyncStatus('syncing');

      // 初始化健康同步服务
      const initialized = await healthSyncService.initialize();
      
      if (!initialized) {
        throw new Error('Health service initialization failed');
      }

      // 请求权限并同步数据
      const permissions = await healthSyncService.checkPermissions();
      setPermissions(permissions);

      // 更新用户偏好设置
      updatePreferences({ healthSync: true });

      // 执行初始数据同步
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 同步最近30天数据
      const endDate = new Date();

      await syncHealthData();
      setSyncStatus('success');

      Alert.alert(
        'Health Data Connected',
        'Your health data has been successfully synced and will be used for personalized insights.'
      );

    } catch (error) {
      logger.error('Health permission error:', error);
      setSyncStatus('error');
      
      Alert.alert(
        'Permission Required',
        'Health data access is required for optimal functionality. You can enable it later in settings.',
        [
          { text: 'Try Again', onPress: requestHealthPermissions },
          { text: 'Skip for Now', onPress: onNext }
        ]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Health Data?',
      'You can enable health data sync later in settings. Some features will be limited.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => {
            updatePreferences({ healthSync: false });
            onNext();
          }
        }
      ]
    );
  };

  const getPermissionStatus = (type: string) => {
    return permissions[type] ? 'granted' : 'denied';
  };

  const grantedCount = Object.values(permissions).filter(Boolean).length;
  const totalCount = Object.keys(permissions).length;

  return (
    <LinearGradient
      colors={['#43e97b', '#38f9d7']}
      style={styles.container}
    >
      <Animated.View 
        entering={SlideInLeft.duration(600)}
        style={styles.content}
      >
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Connect Health Data
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Sync with your device's health app for personalized insights and automatic tracking.
          </Typography>
        </View>

        <View style={styles.permissionsSection}>
          <View style={styles.permissionsCard}>
            <Text style={styles.healthIcon}>❤️</Text>
            <Typography variant="h3" style={styles.permissionsTitle}>
              Health Data Access
            </Typography>

            <View style={styles.permissionList}>
              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>👣</Text>
                <Typography variant="body" style={styles.permissionText}>
                  Steps & Activity
                </Typography>
                <Text style={[
                  styles.permissionStatus,
                  styles[getPermissionStatus('steps')]
                ]}>
                  {getPermissionStatus('steps')}
                </Text>
              </View>

              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>🔥</Text>
                <Typography variant="body" style={styles.permissionText}>
                  Calories Burned
                </Typography>
                <Text style={[
                  styles.permissionStatus,
                  styles[getPermissionStatus('calories')]
                ]}>
                  {getPermissionStatus('calories')}
                </Text>
              </View>

              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>💓</Text>
                <Typography variant="body" style={styles.permissionText}>
                  Heart Rate
                </Typography>
                <Text style={[
                  styles.permissionStatus,
                  styles[getPermissionStatus('heartRate')]
                ]}>
                  {getPermissionStatus('heartRate')}
                </Text>
              </View>

              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>😴</Text>
                <Typography variant="body" style={styles.permissionText}>
                  Sleep Analysis
                </Typography>
                <Text style={[
                  styles.permissionStatus,
                  styles[getPermissionStatus('sleep')]
                ]}>
                  {getPermissionStatus('sleep')}
                </Text>
              </View>
            </View>

            {grantedCount > 0 && (
              <Animated.View 
                entering={FadeIn.duration(400)}
                style={styles.progressContainer}
              >
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${(grantedCount / totalCount) * 100}%` }
                    ]} 
                  />
                </View>
                <Typography variant="caption" style={styles.progressText}>
                  {grantedCount} of {totalCount} permissions granted
                </Typography>
              </Animated.View>
            )}

            <Button
              title={
                syncStatus === 'syncing' ? 'Connecting...' :
                syncStatus === 'success' ? 'Connected!' :
                isRequesting ? 'Requesting...' : 'Connect Health Data'
              }
              variant="secondary"
              onPress={requestHealthPermissions}
              disabled={isRequesting || syncStatus === 'syncing'}
              style={styles.connectButton}
            />
          </View>

          <View style={styles.benefits}>
            <Typography variant="h4" style={styles.benefitsTitle}>
              Benefits of Health Data
            </Typography>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🤖</Text>
              <Typography variant="body" style={styles.benefitText}>
                AI-powered insights based on your activity
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Typography variant="body" style={styles.benefitText}>
                Automatic calorie and macro adjustments
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📊</Text>
              <Typography variant="body" style={styles.benefitText}>
                Comprehensive progress tracking
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
            title={syncStatus === 'success' ? "Continue" : "Skip"}
            variant="primary"
            onPress={syncStatus === 'success' ? onNext : handleSkip}
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
  permissionsSection: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  permissionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  permissionsTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  permissionList: {
    width: '100%',
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  permissionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  permissionText: {
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '500',
  },
  permissionStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
  granted: {
    backgroundColor: 'rgba(76, 217, 100, 0.2)',
    color: '#4CD964',
  },
  denied: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    color: '#FF3B30',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CD964',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  connectButton: {
    minWidth: 200,
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
