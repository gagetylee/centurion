import { Sun, Moon, Monitor } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import type { ThemeMode } from '../../types'

const modes: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
  { mode: 'system', icon: Monitor, label: 'System' },
]

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  return (
    <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      {modes.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setTheme(mode)}
          className={`rounded-md p-1.5 transition-colors ${
            theme === mode
              ? 'bg-accent text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title={label}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
