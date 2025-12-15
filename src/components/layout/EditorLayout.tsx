import { ReactNode } from 'react';

interface EditorLayoutProps {
  children: ReactNode;
  toolbar?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

/**
 * EditorLayout - Main layout wrapper for the 3D editor
 * Provides a flexible grid-based layout system for the application
 */
export function EditorLayout({ children, toolbar, sidebar, footer }: EditorLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Top Toolbar */}
      {toolbar && (
        <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
          {toolbar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <aside className="flex-shrink-0 w-80 border-r border-slate-800 bg-slate-900/95 backdrop-blur-sm overflow-y-auto">
            {sidebar}
          </aside>
        )}

        {/* 3D Canvas Area */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
          {footer}
        </div>
      )}
    </div>
  );
}
