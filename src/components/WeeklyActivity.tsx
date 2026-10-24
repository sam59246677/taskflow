
import { useQuery } from '@tanstack/react-query'

import { getTasks } from '../services/taskService'

const DAY_COUNT = 7
const CHART_HEIGHT = 160

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function WeeklyActivity() {
  const {
    data: tasks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    staleTime: 1000 * 60,
  })

  const today = new Date()

  const weeklyData = Array.from(
    { length: DAY_COUNT },
    (_, index) => {
      const date = new Date(today)

      date.setDate(today.getDate() - (DAY_COUNT - 1 - index))

      const dateKey = getDateKey(date)

      const taskCount = tasks.filter((task) => {
        if (!task.completedAt) {
          return false
        }

        const completedDate = new Date(task.completedAt)

        return getDateKey(completedDate) === dateKey
      }).length

      return {
        day: date.toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        dateKey,
        tasks: taskCount,
      }
    },
  )

  const maxTasks = Math.max(
    ...weeklyData.map((item) => item.tasks),
    1,
  )

  if (isLoading) {
    return (
      <section
        aria-label="Loading weekly activity"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

        <div className="mt-2 h-4 w-52 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />

        <div className="mt-8 flex h-40 items-end gap-3">
          {Array.from({ length: DAY_COUNT }, (_, index) => (
            <div
              key={index}
              className="flex-1 animate-pulse rounded-t-md bg-slate-100 dark:bg-slate-700"
              style={{
                height: `${30 + index * 12}px`,
              }}
            />
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Weekly Activity
        </h2>

        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Could not load weekly activity.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors sm:p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Weekly Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tasks completed over the last 7 days
          </p>
        </div>

        <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">
          Last 7 days
        </span>
      </div>

      <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-4">
        {weeklyData.map((item) => {
          const barHeight = (item.tasks / maxTasks) * CHART_HEIGHT

          return (
            <div
              key={item.dateKey}
              className="flex min-w-0 flex-col items-center"
            >
              <span className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                {item.tasks}
              </span>

              <div className="flex h-40 w-full items-end justify-center rounded-t-md bg-slate-50 dark:bg-slate-700/50">
                <div
                  role="img"
                  aria-label={`${item.tasks} tasks completed on ${item.day}`}
                  className="w-3/5 max-w-10 rounded-t-md bg-blue-600 transition-all hover:bg-blue-500"
                  style={{
                    height: `${barHeight}px`,
                  }}
                />
              </div>

              <span className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {item.day}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
export default WeeklyActivity