import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomTabs } from './BottomTabs'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useUIStore } from '../../store/uiStore'

export function AppShell({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-screen">
      {isDesktop ? <Sidebar /> : <BottomTabs />}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isDesktop
            ? collapsed
              ? 'ml-16'
              : 'ml-56'
            : 'pb-16'
        }`}
      >
        <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
