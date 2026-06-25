import React, { useState, ReactNode } from 'react';
import {
  Layout, FileText, Palette, Briefcase, Image, Grid3X3, Settings, Puzzle,
  ChevronLeft, ChevronRight, History, Share2, Download, Sparkles, Layers, Stamp, QrCode
} from 'lucide-react';

export interface DashboardTab {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const DASHBOARD_TABS: DashboardTab[] = [
  { id: 'design', label: 'Design', icon: Layout },
  { id: 'brand', label: 'Brand', icon: Briefcase },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'templates', label: 'Templates', icon: Grid3X3 },
  { id: 'assets', label: 'Assets', icon: Image },
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'stamp', label: 'Stamp', icon: Stamp },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'components', label: 'Components', icon: Puzzle },
  { id: 'history', label: 'History', icon: History },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles, badge: 'New' },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'share', label: 'Share', icon: Share2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarContent: ReactNode;
}

export function DashboardLayout({ children, activeTab, onTabChange, sidebarContent }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[500] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex">
        {/* Main Sidebar */}
        <aside
          className={`bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 shrink-0 ${
            sidebarCollapsed ? 'w-[52px]' : 'w-[52px]'
          }`}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <div className="h-14 flex items-center justify-center border-b border-slate-800 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <Briefcase size={16} className="text-white" />
            </div>
          </div>

          {/* Navigation Icons */}
          <nav aria-label="Sidebar tabs" className="flex-1 overflow-y-auto py-2 px-1 space-y-0.5 scrollbar-thin">
            {DASHBOARD_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-9 h-9 mx-auto flex items-center justify-center rounded-lg transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                  title={tab.label}
                >
                  <Icon size={16} aria-hidden="true" />
                  {tab.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full" aria-label="New" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse */}
          <div className="border-t border-slate-800 p-2 shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-9 h-9 mx-auto flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition cursor-pointer"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
          </div>
        </aside>

        {/* Secondary Sidebar (Active Tab Panel) */}
        {sidebarContent && (
          <aside className="w-[380px] bg-slate-950 border-r border-slate-800 flex flex-col overflow-hidden shrink-0" aria-label="Active panel sidebar">
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 flex flex-col overflow-hidden" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
