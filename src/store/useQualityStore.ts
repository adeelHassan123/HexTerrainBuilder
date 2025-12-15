import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface QualitySettings {
    preset: QualityPreset;
    shadowMapSize: number;
    pixelRatio: number;
    antialias: boolean;
    enablePostProcessing: boolean;
    maxAssetInstances: number;
}

interface QualityStore {
    settings: QualitySettings;
    setPreset: (preset: QualityPreset) => void;
    setCustomSettings: (settings: Partial<QualitySettings>) => void;
    autoDetectQuality: () => void;
}

// Quality presets based on device capabilities
const QUALITY_PRESETS: Record<QualityPreset, QualitySettings> = {
    low: {
        preset: 'low',
        shadowMapSize: 512,
        pixelRatio: 1,
        antialias: false,
        enablePostProcessing: false,
        maxAssetInstances: 50,
    },
    medium: {
        preset: 'medium',
        shadowMapSize: 1024,
        pixelRatio: 1,
        antialias: true,
        enablePostProcessing: false,
        maxAssetInstances: 100,
    },
    high: {
        preset: 'high',
        shadowMapSize: 2048,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        antialias: true,
        enablePostProcessing: true,
        maxAssetInstances: 200,
    },
    ultra: {
        preset: 'ultra',
        shadowMapSize: 4096,
        pixelRatio: window.devicePixelRatio,
        antialias: true,
        enablePostProcessing: true,
        maxAssetInstances: 500,
    },
};

// Detect device tier based on hardware
const detectDeviceTier = (): QualityPreset => {
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );

    if (isMobile) {
        return 'low';
    }

    // Check GPU capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        return 'low';
    }

    // Check for hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;

    // Check memory (if available)
    const memory = (navigator as any).deviceMemory || 4;

    // Determine quality based on hardware
    if (cores >= 8 && memory >= 8) {
        return 'ultra';
    } else if (cores >= 4 && memory >= 4) {
        return 'high';
    } else if (cores >= 2) {
        return 'medium';
    }

    return 'low';
};

export const useQualityStore = create<QualityStore>()(
    persist(
        (set) => ({
            settings: QUALITY_PRESETS.medium,

            setPreset: (preset) => {
                set({ settings: QUALITY_PRESETS[preset] });
            },

            setCustomSettings: (customSettings) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        ...customSettings,
                    },
                }));
            },

            autoDetectQuality: () => {
                const detectedPreset = detectDeviceTier();
                set({ settings: QUALITY_PRESETS[detectedPreset] });
            },
        }),
        {
            name: 'quality-settings',
        }
    )
);
