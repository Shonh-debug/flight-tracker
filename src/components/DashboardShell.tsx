'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useLanguage } from '@/components/LanguageContext';

export default function DashboardShell({
  children,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  loading,
}: {
  children: React.ReactNode;
  searchValue: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  loading: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-dash-bg">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <TopBar
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          loading={loading}
        />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {children}
        </main>

        <footer className="border-t border-dash-border px-6 py-3 flex items-center justify-between text-xs text-dash-muted">
          <span>{t.footer.copyright} © {new Date().getFullYear()}</span>
          <span>{t.footer.poweredBy}</span>
        </footer>
      </div>
    </div>
  );
}
