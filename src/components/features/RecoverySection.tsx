import { View, Text, StyleSheet } from 'react-native';

export const RecoveryHeader = () => {
    return (
        <View style={styles.container}>
            {/* The Header */}
            <Text style={styles.title}>
                Smarter Recovery
            </Text>

            {/* The Subtext */}
            <Text style={styles.subtitle}>
                Know when to push, when to pause, and when you're ready to perform, backed by real-time metrics.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1F2937', // gray-900
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280', // gray-500
        textAlign: 'center',
        lineHeight: 28,
        maxWidth: 320,
    },
});
