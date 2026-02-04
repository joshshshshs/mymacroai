/**
 * ScanGhostOverlay - Dynamic silhouette overlay for body scan camera
 * Changes shape based on current scan step (Front, Side, Back)
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export type ScanStep = 'FRONT' | 'SIDE' | 'BACK';

interface ScanGhostOverlayProps {
    step: ScanStep;
    isAligned?: boolean;
}

// Front-facing A-pose silhouette
const FrontPosePath = `
    M 50 15
    C 50 10, 55 8, 60 8
    C 65 8, 70 10, 70 15
    C 70 22, 65 28, 60 28
    C 55 28, 50 22, 50 15
    M 60 28
    L 60 35
    M 45 40
    L 35 55
    L 30 75
    M 75 40
    L 85 55
    L 90 75
    M 45 40
    L 60 35
    L 75 40
    M 60 35
    L 60 70
    M 45 70
    L 60 70
    L 75 70
    M 45 70
    L 40 100
    L 38 130
    M 75 70
    L 80 100
    L 82 130
`;

// Side profile with arms raised (crucial for body comp)
const SidePosePath = `
    M 55 15
    C 55 10, 60 8, 65 8
    C 70 8, 75 12, 73 18
    C 71 24, 65 28, 60 28
    M 60 28
    L 58 35
    M 58 35
    C 52 36, 50 42, 50 50
    L 50 70
    M 58 35
    C 64 36, 68 40, 70 48
    M 70 48
    L 90 35
    L 100 30
    M 50 70
    L 48 100
    L 46 130
    M 50 70
    C 55 72, 58 75, 60 78
    L 62 100
    L 64 130
`;

// Back silhouette
const BackPosePath = `
    M 50 15
    C 50 10, 55 8, 60 8
    C 65 8, 70 10, 70 15
    C 70 22, 65 28, 60 28
    C 55 28, 50 22, 50 15
    M 60 28
    L 60 35
    M 40 42
    L 25 58
    L 20 78
    M 80 42
    L 95 58
    L 100 78
    M 40 42
    L 60 35
    L 80 42
    M 40 42
    L 45 70
    M 80 42
    L 75 70
    M 45 70
    L 60 70
    L 75 70
    M 60 35
    L 60 70
    M 45 70
    L 42 100
    L 40 130
    M 75 70
    L 78 100
    L 80 130
`;

export const ScanGhostOverlay: React.FC<ScanGhostOverlayProps> = ({ step, isAligned = false }) => {
    const getPath = () => {
        switch (step) {
            case 'FRONT':
                return FrontPosePath;
            case 'SIDE':
                return SidePosePath;
            case 'BACK':
                return BackPosePath;
            default:
                return FrontPosePath;
        }
    };

    const strokeColor = isAligned ? '#FF4500' : 'rgba(255, 255, 255, 0.4)';
    const glowColor = isAligned ? 'rgba(255, 69, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';

    return (
        <View style={styles.container} pointerEvents="none">
            <Svg
                width={width * 0.85}
                height={height * 0.65}
                viewBox="0 0 120 140"
                style={styles.svg}
            >
                <Defs>
                    <LinearGradient id="ghostGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={strokeColor} stopOpacity="0.3" />
                    </LinearGradient>
                </Defs>

                {/* Glow effect layer */}
                <G>
                    <Path
                        d={getPath()}
                        stroke={glowColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </G>

                {/* Main silhouette */}
                <G>
                    <Path
                        d={getPath()}
                        stroke="url(#ghostGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        strokeDasharray={isAligned ? "0" : "8 4"}
                    />
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        marginTop: -40,
    },
});
