import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear } from '../../lib/utils'

interface Props {
  month: Date
  onPrev: () => void
  onNext: () => void
  canNext: boolean
}

export function MonthNavigator({ month, onPrev, onNext, canNext }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        className="rounded-lg p-1.5 transition-colors hover:bg-[var(--bg-tertiary)]"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="min-w-[160px] text-center text-lg font-semibold">
        {formatMonthYear(month)}
      </span>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="rounded-lg p-1.5 transition-colors hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
