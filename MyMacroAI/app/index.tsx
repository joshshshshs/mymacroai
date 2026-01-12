import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles/app';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          MyMacroAI
        </Text>
        <Text style={styles.subtitle}>
          The Health Operating System
        </Text>
        
        <Link href="/dashboard" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              Get Started
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}