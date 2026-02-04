import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface Props {
    size?: number;
    style?: ViewStyle;
}

export const MacroCoin = ({ size = 40, style }: Props) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 64 64" style={style}>
            <Defs>
                {/* The Glowing Lime Gradient (Outer Ring) */}
                <LinearGradient id="limeGlow" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#A3E635" stopOpacity="1" />
                    <Stop offset="50%" stopColor="#4ADE80" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#A3E635" stopOpacity="1" />
                </LinearGradient>

                {/* The Deep Glass Interior */}
                <RadialGradient id="glassBody" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                    <Stop offset="0%" stopColor="#2D4A3E" stopOpacity="0.8" />
                    <Stop offset="100%" stopColor="#0B1410" stopOpacity="1" />
                </RadialGradient>

                {/* The Inner "Liquid" Symbol Gradient */}
                <LinearGradient id="symbolGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#A3E635" stopOpacity="1" />
                </LinearGradient>
            </Defs>

            {/* 1. Outer Glow Blur (Fake shadow) */}
            <Circle cx="32" cy="32" r="30" fill="#A3E635" opacity="0.2" />

            {/* 2. The Main Coin Body (Dark Glass) */}
            <Circle cx="32" cy="32" r="28" fill="url(#glassBody)" stroke="url(#limeGlow)" strokeWidth="2.5" />

            {/* 3. The "Sheen" (Glass Reflection top-left) */}
            <Path
                d="M 15 32 Q 15 15 32 15"
                stroke="white"
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeLinecap="round"
            />

            {/* 4. The "M" Symbol (Heartbeat/Pulse Style) */}
            <Path
                d="M 20 36 L 26 24 L 32 36 L 38 24 L 44 36"
                stroke="url(#symbolGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* 5. Small Particles (Floating inside) */}
            <Circle cx="28" cy="42" r="1.5" fill="#A3E635" opacity="0.6" />
            <Circle cx="36" cy="18" r="1" fill="#A3E635" opacity="0.4" />
        </Svg>
    );
};
