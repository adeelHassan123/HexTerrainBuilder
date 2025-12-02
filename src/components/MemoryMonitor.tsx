// Optional: Add this to App.tsx to monitor memory usage
// Place this code in a development-only component

import { useEffect, useState } from 'react';

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  materialCacheSize: number;
  cloneCacheSize: number;
}

export function MemoryMonitor() {
  const [stats, setStats] = useState<MemoryStats | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        
        // You would need to export these from their modules
        // import { getMaterialCacheSize } from '@/components/3d/Materials';
        // import { modelCloneCache } from '@/components/3d/PlacedAsset';
        
        setStats({
          usedJSHeapSize: memory.usedJSHeapSize / 1048576, // MB
          totalJSHeapSize: memory.totalJSHeapSize / 1048576,
          jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576,
          materialCacheSize: 0, // Would set from getMaterialCacheSize()
          cloneCacheSize: 0, // Would set from modelCloneCache.size
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!stats || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#0f0',
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 1000,
        borderRadius: '4px',
      }}
    >
      <div>Heap: {stats.usedJSHeapSize.toFixed(0)} / {stats.totalJSHeapSize.toFixed(0)} MB</div>
      <div>Limit: {stats.jsHeapSizeLimit.toFixed(0)} MB</div>
      <div>Materials Cached: {stats.materialCacheSize}</div>
      <div>Model Clones: {stats.cloneCacheSize}</div>
    </div>
  );
}

// Usage in App.tsx (development only):
// import { MemoryMonitor } from '@/components/MemoryMonitor';
// 
// export default function App() {
//   return (
//     <>
//       {process.env.NODE_ENV === 'development' && <MemoryMonitor />}
//       {/* rest of app */}
//     </>
//   );
// }
