import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, Calendar, Settings } from 'lucide-react'

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Transactions' },
  { to: '/monthly', icon: Calendar, label: 'Monthly' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomTabs() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-accent'
                : 'text-[var(--text-tertiary)]'
            }`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
