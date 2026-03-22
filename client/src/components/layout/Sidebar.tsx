import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, Calendar, Settings, ChevronLeft, ChevronRight, Monitor } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useUIStore } from '../../store/uiStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Transactions' },
  { to: '/monthly', icon: Calendar, label: 'Monthly' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      <div className={`flex items-center gap-2 border-b p-4 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <h1 className="text-base font-semibold tracking-tight">
            Budget<span className="text-accent">Tracker</span>
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className={`rounded-lg p-1.5 transition-colors hover:bg-[var(--bg-tertiary)] ${collapsed ? '' : 'ml-auto'}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`border-t p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button
            onClick={() => {
              const current = useUIStore.getState().theme
              const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'
              useUIStore.getState().setTheme(next)
            }}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
          >
            <Monitor size={16} />
          </button>
        ) : (
          <ThemeToggle />
        )}
      </div>
    </aside>
  )
}
