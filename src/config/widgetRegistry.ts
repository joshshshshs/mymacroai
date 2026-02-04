/**
 * Widget Registry - Defines available health widgets and their hardware dependencies
 */

// ============================================================================
// Types
// ============================================================================

export type DeviceCapability =
    | 'sleep_tracking'
    | 'heart_rate_variability'
    | 'heart_rate'
    | 'respiratory_rate'
    | 'stress_tracking'
    | 'cycle_tracking'
    | 'blood_oxygen'
    | 'body_temperature';

export type DeviceSource =
    | 'apple_health'
    | 'apple_watch'
    | 'oura'
    | 'whoop'
    | 'garmin'
    | 'fitbit'
    | 'manual';

export interface WidgetConfig {
    id: string;
    name: string;
    shortName: string;
    description: string;
    requiredCapabilities: DeviceCapability[];
    compatibleDevices: DeviceSource[];
    defaultVisible: boolean;
    category: 'vital' | 'recovery' | 'hormonal' | 'activity';
}

// ============================================================================
// Device Capability Mapping
// ============================================================================

export const DEVICE_CAPABILITIES: Record<DeviceSource, DeviceCapability[]> = {
    apple_health: ['sleep_tracking', 'heart_rate', 'blood_oxygen', 'respiratory_rate'],
    apple_watch: ['sleep_tracking', 'heart_rate_variability', 'heart_rate', 'blood_oxygen', 'respiratory_rate'],
    oura: ['sleep_tracking', 'heart_rate_variability', 'heart_rate', 'body_temperature', 'respiratory_rate'],
    whoop: ['sleep_tracking', 'heart_rate_variability', 'heart_rate', 'respiratory_rate', 'stress_tracking'],
    garmin: ['sleep_tracking', 'heart_rate', 'blood_oxygen', 'respiratory_rate', 'stress_tracking'],
    fitbit: ['sleep_tracking', 'heart_rate', 'blood_oxygen', 'stress_tracking'],
    manual: ['cycle_tracking'],
};

// ============================================================================
// Widget Registry
// ============================================================================

export const WIDGET_REGISTRY: WidgetConfig[] = [
    {
        id: 'SLEEP',
        name: 'Sleep Performance',
        shortName: 'Sleep',
        description: 'Track sleep duration and quality',
        requiredCapabilities: ['sleep_tracking'],
        compatibleDevices: ['apple_watch', 'oura', 'whoop', 'garmin', 'fitbit'],
        defaultVisible: true,
        category: 'recovery',
    },
    {
        id: 'HRV',
        name: 'Heart Rate Variability',
        shortName: 'HRV',
        description: 'Monitor nervous system recovery',
        requiredCapabilities: ['heart_rate_variability'],
        compatibleDevices: ['apple_watch', 'oura', 'whoop'],
        defaultVisible: true,
        category: 'vital',
    },
    {
        id: 'RHR',
        name: 'Resting Heart Rate',
        shortName: 'RHR',
        description: 'Track cardiovascular health',
        requiredCapabilities: ['heart_rate'],
        compatibleDevices: ['apple_watch', 'oura', 'whoop', 'garmin', 'fitbit'],
        defaultVisible: true,
        category: 'vital',
    },
    {
        id: 'RESPIRATION',
        name: 'Respiratory & Temp',
        shortName: 'Respiration',
        description: 'Breathing rate and body temperature',
        requiredCapabilities: ['respiratory_rate'],
        compatibleDevices: ['apple_watch', 'oura', 'whoop', 'garmin'],
        defaultVisible: true,
        category: 'vital',
    },
    {
        id: 'STRESS',
        name: 'Stress Monitor',
        shortName: 'Stress',
        description: 'Track daily stress levels',
        requiredCapabilities: ['stress_tracking'],
        compatibleDevices: ['whoop', 'garmin', 'fitbit'],
        defaultVisible: true,
        category: 'recovery',
    },
    {
        id: 'SPO2',
        name: 'Blood Oxygen',
        shortName: 'SpO2',
        description: 'Monitor blood oxygen saturation',
        requiredCapabilities: ['blood_oxygen'],
        compatibleDevices: ['apple_watch', 'oura', 'garmin', 'fitbit'],
        defaultVisible: true,
        category: 'vital',
    },
    {
        id: 'CYCLE',
        name: 'Cycle Sync',
        shortName: 'Cycle',
        description: 'Track menstrual cycle and BMR',
        requiredCapabilities: ['cycle_tracking'],
        compatibleDevices: ['manual', 'oura'],
        defaultVisible: false,
        category: 'hormonal',
    },
    // Dashboard widgets
    {
        id: 'macro-ring',
        name: 'Macro Ring',
        shortName: 'Macros',
        description: 'Daily calorie and macro progress ring',
        requiredCapabilities: [],
        compatibleDevices: [],
        defaultVisible: true,
        category: 'activity',
    },
    {
        id: 'ai-summary',
        name: 'AI Summary',
        shortName: 'AI',
        description: 'Personalized AI coaching insights',
        requiredCapabilities: [],
        compatibleDevices: [],
        defaultVisible: true,
        category: 'activity',
    },
    {
        id: 'quick-actions',
        name: 'Quick Actions',
        shortName: 'Actions',
        description: 'Quick log buttons for meals, water, etc.',
        requiredCapabilities: [],
        compatibleDevices: [],
        defaultVisible: true,
        category: 'activity',
    },
    {
        id: 'activity-cards',
        name: 'Activity Cards',
        shortName: 'Activity',
        description: 'Daily summary stats cards',
        requiredCapabilities: [],
        compatibleDevices: [],
        defaultVisible: true,
        category: 'activity',
    },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a device provides a specific capability
 */
export function deviceHasCapability(device: DeviceSource, capability: DeviceCapability): boolean {
    return DEVICE_CAPABILITIES[device]?.includes(capability) ?? false;
}

/**
 * Get all capabilities from connected devices
 */
export function getConnectedCapabilities(connectedDevices: DeviceSource[]): DeviceCapability[] {
    const capabilities = new Set<DeviceCapability>();
    for (const device of connectedDevices) {
        const deviceCaps = DEVICE_CAPABILITIES[device] || [];
        deviceCaps.forEach(cap => capabilities.add(cap));
    }
    return Array.from(capabilities);
}

/**
 * Check if a widget is unlocked based on connected devices
 */
export function isWidgetUnlocked(widget: WidgetConfig, connectedDevices: DeviceSource[]): boolean {
    const capabilities = getConnectedCapabilities(connectedDevices);
    return widget.requiredCapabilities.every(cap => capabilities.includes(cap));
}

/**
 * Get the friendly name for a device requirement
 */
export function getRequirementText(widget: WidgetConfig): string {
    const devices = widget.compatibleDevices.slice(0, 2);
    const names = devices.map(d => {
        switch (d) {
            case 'apple_watch': return 'Apple Watch';
            case 'oura': return 'Oura Ring';
            case 'whoop': return 'WHOOP';
            case 'garmin': return 'Garmin';
            case 'fitbit': return 'Fitbit';
            case 'manual': return 'Manual Entry';
            default: return d;
        }
    });
    return names.join(' or ');
}
