
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CircleCheck, Clock3, CircleDashed } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { Task, TaskStatus } from '../types/task'
import { getTasks, updateTaskStatus } from '../services/taskService'

const statusStyles: Record<
  TaskStatus,
  {
    label: string
    className: string
    icon: LucideIcon
  }
> = {
  Completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700',
    icon: CircleCheck,
  },
  'In Progress': {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700',
    icon: Clock3,
  },
  Pending: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-600',
    icon: CircleDashed,
  },
}

const statuses: TaskStatus[] = [
  'Pending',
  'In Progress',
  'Completed',
]

function RecentTasks() {
  const queryClient = useQueryClient()

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

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: TaskStatus
    }) => updateTaskStatus(id, status),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })

  if (isLoading) {
    return (
      <section
        aria-labelledby="recent-tasks-title"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="recent-tasks-title"
          className="text-lg font-semibold text-slate-900"
        >
          Recent Tasks
        </h2>

        <div className="mt-5 space-y-4" aria-label="Loading tasks">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Tasks
        </h2>

        <p role="alert" className="mt-4 text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : 'Could not load tasks.'}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800" >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Tasks
        </h2>

        <span className="text-xs text-slate-500">
          {tasks.length} tasks
        </span>
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        {tasks.slice(0, 3).map((task: Task) => {
          const status = statusStyles[task.status]
          const StatusIcon = status.icon

          return (
            <article
              key={task.id}
              className="py-4 first:pt-0 last:pb-0"
            >
              <h3 className="text-sm font-medium text-slate-800">
                {task.title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {task.project}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
                >
                  <StatusIcon size={13} />
                  {status.label}
                </span>
              </div>

              <div className="mt-3">
                <label
                  htmlFor={`status-${task.id}`}
                  className="mb-1 block text-xs text-slate-500"
                >
                  Change status
                </label>

                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  disabled={mutation.isPending}
                  onChange={(event) => {
                    const newStatus = event.target.value as TaskStatus

                    if (newStatus !== task.status) {
                      mutation.mutate({
                        id: task.id,
                        status: newStatus,
                      })
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          )
        })}

        {tasks.length === 0 && (
          <p className="py-4 text-sm text-slate-500">
            No tasks found.
          </p>
        )}
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          Could not update the task status. Please try again.
        </p>
      )}

      {mutation.isPending && (
        <p role="status" className="mt-4 text-sm text-blue-600">
          Updating task status...
        </p>
      )}
    </section>
  )
}

export default RecentTasks
