import { VRButton, ARButton, XR, Controllers, Hands } from '@react-three/xr';
import { ReactNode } from 'react';

interface XRProviderProps {
    children: ReactNode;
}

/**
 * XRProvider - Wraps the 3D scene content with XR context
 * Must be used INSIDE the Canvas
 */
export function XRProvider({ children }: XRProviderProps) {
    return (
        <XR>
            <Controllers />
            <Hands />
            {children}
        </XR>
    );
}

interface XRInterfaceProps {
    enableVR?: boolean;
    enableAR?: boolean;
}

/**
 * XRInterface - Renders the VR/AR entry buttons
 * Must be used OUTSIDE the Canvas
 */
export function XRInterface({ enableVR = true, enableAR = true }: XRInterfaceProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex gap-2 pointer-events-auto">
            {enableVR && <VRButton />}
            {enableAR && <ARButton />}
        </div>
    );
}
