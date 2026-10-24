
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, CircleAlert } from 'lucide-react'

import type { Task, TaskPriority } from '../types/task'
import { getTasks } from '../services/taskService'

const priorityStyles: Record<TaskPriority, string> = {
  High: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Medium:
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

function formatDueDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function UpcomingDeadlines() {
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    staleTime: 1000 * 60,
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingTasks = tasks
    .filter((task: Task) => {
      const dueDate = new Date(`${task.dueDate}T00:00:00`)
      return dueDate >= today
    })
    .sort((a: Task, b: Task) => {
      return a.dueDate.localeCompare(b.dueDate)
    })
    .slice(0, 3)

  return (
    <section
      aria-labelledby="upcoming-deadlines-title"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="upcoming-deadlines-title"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            Upcoming Deadlines
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tasks that need your attention
          </p>
        </div>

        <CalendarDays
          size={21}
          className="shrink-0 text-slate-400 dark:text-slate-500"
        />
      </div>

      {isLoading && (
        <div
          className="mt-5 space-y-4"
          aria-label="Loading deadlines"
        >
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse py-2">
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-700/60" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-5">
          <p
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {error instanceof Error
              ? error.message
              : 'Could not load deadlines.'}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-700">
          {upcomingTasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
                  <CircleAlert
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-sm font-medium text-slate-800 dark:text-slate-100">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {task.project}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
                >
                  {task.priority}
                </span>

                <time
                  dateTime={task.dueDate}
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  {formatDueDate(task.dueDate)}
                </time>
              </div>
            </article>
          ))}

          {upcomingTasks.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No upcoming deadlines.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export default UpcomingDeadlines
