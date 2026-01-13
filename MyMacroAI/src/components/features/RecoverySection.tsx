import { View, Text } from 'react-native';

export const RecoveryHeader = () => {
    return (
        <View className="px-6 py-10 items-center">
            {/* The Header */}
            <Text className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter text-center mb-4 font-inter-bold">
                Smarter Recovery
            </Text>

            {/* The Subtext */}
            <Text className="text-lg text-gray-500 text-center leading-relaxed max-w-md font-inter-regular">
                Know when to push, when to pause, and when you’re ready to perform, backed by real-time metrics.
            </Text>
        </View>
    );
};
