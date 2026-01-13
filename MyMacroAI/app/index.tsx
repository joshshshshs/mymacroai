import { View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles/app';
import { ThemedText } from '@/src/components/ui/ThemedText';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        <ThemedText variant="premium-heading" style={styles.title}>
          MyMacroAI
        </ThemedText>
        <ThemedText variant="premium-body" style={styles.subtitle}>
          The Health Operating System
        </ThemedText>

        <Link href="/dashboard" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText variant="body" weight="600" style={styles.buttonText}>
              Get Started
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}