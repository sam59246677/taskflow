
import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  title: string
  value: number
  description: string
  icon: LucideIcon
  iconColor: string
  iconBackground: string
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBackground}`}
        >
          <Icon size={22} className={iconColor} />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </article>
  )
}
export default StatCard