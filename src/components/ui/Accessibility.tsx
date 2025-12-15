import { useEffect } from 'react';
import { useMapStore } from '@/store/useMapStore';

/**
 * AccessibilityAnnouncer - Provides screen reader announcements for 3D interactions
 * Ensures the application is accessible to users with visual impairments
 */
export function AccessibilityAnnouncer() {
    const { selectedTool, selectedObjectId, assets } = useMapStore();

    useEffect(() => {
        // Announce tool changes
        const toolNames: Record<string, string> = {
            tile: 'Tile Placement Tool',
            asset: 'Asset Placement Tool',
            select: 'Selection Tool',
            delete: 'Delete Tool',
        };

        const announcement = toolNames[selectedTool] || selectedTool;
        announceToScreenReader(`${announcement} activated`);
    }, [selectedTool]);

    useEffect(() => {
        // Announce selection changes
        if (selectedObjectId) {
            const isAsset = assets.has(selectedObjectId);
            const type = isAsset ? 'Asset' : 'Tile';
            announceToScreenReader(`${type} selected`);
        } else {
            announceToScreenReader('Selection cleared');
        }
    }, [selectedObjectId, assets]);

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            id="a11y-announcer"
        />
    );
}

// Helper function to announce to screen readers
function announceToScreenReader(message: string) {
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
        announcer.textContent = message;
    }
}

/**
 * KeyboardShortcutsHelp - Displays keyboard shortcuts for accessibility
 */
export function KeyboardShortcutsHelp() {
    return (
        <div className="sr-only" role="region" aria-label="Keyboard Shortcuts">
            <h2>Keyboard Shortcuts</h2>
            <ul>
                <li>F3: Toggle performance statistics</li>
                <li>Arrow Keys: Pan camera view</li>
                <li>Delete/Backspace: Delete selected object</li>
                <li>W/A/S/D: Move selected asset (when in select mode)</li>
                <li>+/-: Rotate selected asset</li>
                <li>[ / ]: Scale selected asset</li>
                <li>Mouse Wheel: Rotate selected asset (when selected)</li>
                <li>Ctrl + Mouse Wheel: Scale selected asset</li>
            </ul>
        </div>
    );
}
