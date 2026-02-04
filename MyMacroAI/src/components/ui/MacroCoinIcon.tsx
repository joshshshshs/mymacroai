/**
 * MacroCoinIcon - Reusable coin icon component
 * Uses the gold dollar coin image asset
 */

import React from 'react';
import { Image, StyleSheet, ImageStyle, StyleProp } from 'react-native';

const COIN_ICON = require('../../../assets/coin_gold.png');

interface MacroCoinIconProps {
    size?: number;
    style?: StyleProp<ImageStyle>;
}

export const MacroCoinIcon: React.FC<MacroCoinIconProps> = ({
    size = 16,
    style
}) => {
    return (
        <Image
            source={COIN_ICON}
            style={[
                styles.icon,
                { width: size, height: size },
                style
            ]}
            resizeMode="contain"
        />
    );
};

const styles = StyleSheet.create({
    icon: {
        // Default styling
    },
});

export default MacroCoinIcon;
