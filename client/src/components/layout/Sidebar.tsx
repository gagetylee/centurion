import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/budgets', label: 'Summary', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-52 flex-col border-r" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
      <div className="px-5 py-5">
        <h1 className="text-lg font-bold">
          <span style={{ color: '#4A9B8E' }}>b</span>budget
        </h1>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pt-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#4A9B8E] text-white'
                  : 'text-[var(--sidebar-text)] hover:bg-black/5 hover:text-foreground'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
