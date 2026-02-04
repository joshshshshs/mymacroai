/**
 * VitalGrid - 2x2 grid container for health cards
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SleepCard } from './cards/SleepCard';
import { RespirationCard } from './cards/RespirationCard';
import { StressCard } from './cards/StressCard';
import { OxygenCard } from './cards/OxygenCard';
import { HealthData } from '@/hooks/useHealthData';

interface Props {
    data: HealthData;
}

export const VitalGrid: React.FC<Props> = ({ data }) => {
    return (
        <View style={styles.grid}>
            <View style={styles.row}>
                <SleepCard data={data.sleep} />
                <RespirationCard data={data.respiration} />
            </View>
            <View style={styles.row}>
                <StressCard level={data.stress} history={data.stressHistory} />
                <OxygenCard spo2={data.spo2} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
});
