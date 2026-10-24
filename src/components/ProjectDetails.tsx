
import { useState } from 'react'
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  ArrowLeft,
  FolderKanban,
  RefreshCw,
} from 'lucide-react'

import { updateTaskStatus } from '../services/taskService'
import type { Project } from '../services/projectService'
import type { Task, TaskStatus } from '../types/task'

interface ProjectDetailsProps {
  project: Project
  tasks: Task[]
  onBack: () => void
}

function ProjectDetails({
  project,
  tasks,
  onBack,
}: ProjectDetailsProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: TaskStatus
    }) => updateTaskStatus(id, status),

    onSuccess: async () => {
      setError('')

      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },

    onError: () => {
      setError(
        'Failed to update task status. Please try again.',
      )
    },
  })

  const projectTasks = tasks.filter(
    (task) => task.project === project.name,
  )

  const completedCount = projectTasks.filter(
    (task) => task.status === 'Completed',
  ).length

  const inProgressCount = projectTasks.filter(
    (task) => task.status === 'In Progress',
  ).length

  const pendingCount = projectTasks.filter(
    (task) => task.status === 'Pending',
  ).length

  const progress =
    projectTasks.length === 0
      ? 0
      : Math.round(
          (completedCount / projectTasks.length) * 100,
        )

  const statusStyles: Record<TaskStatus, string> = {
    Completed:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'In Progress':
      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Pending:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  }

  const statusLabels: Record<TaskStatus, string> = {
    Completed: 'Completed',
    'In Progress': 'In Progress',
    Pending: 'Pending',
  }

  const priorityStyles: Record<string, string> = {
    High:
      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    Medium:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Low:
      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  }

  const priorityLabels: Record<string, string> = {
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
  }

  function handleStatusChange(
    taskId: string,
    status: TaskStatus,
  ) {
    setError('')

    statusMutation.mutate({
      id: taskId,
      status,
    })
  }

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
      >
        <ArrowLeft size={18} />
        Back to Projects
      </button>

      {/* Project information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <FolderKanban size={28} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold text-slate-900 dark:text-white">
              {project.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {project.description || 'No description provided.'}
            </p>

            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Created on:{' '}
              {new Date(project.createdAt).toLocaleDateString(
                'en-US',
              )}
            </p>
          </div>
        </div>

        {/* Project progress */}
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Project Progress
            </span>

            <span className="font-bold text-slate-900 dark:text-white">
              {progress}%
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
            role="progressbar"
            aria-label={`${project.name} project progress`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Tasks', value: projectTasks.length },
          { label: 'Completed', value: completedCount },
          { label: 'In Progress', value: inProgressCount },
          { label: 'Pending', value: pendingCount },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Project tasks */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Project Tasks
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage task statuses directly from this section.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {projectTasks.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No tasks have been added to this project yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {projectTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-medium text-slate-800 dark:text-slate-100">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Due date:{' '}
                    {task.dueDate
                      ? new Date(
                          `${task.dueDate}T00:00:00`,
                        ).toLocaleDateString('en-US')
                      : 'Not set'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                    >
                      {statusLabels[task.status]}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        priorityStyles[task.priority] ??
                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Priority: {priorityLabels[task.priority] ?? task.priority}
                    </span>
                  </div>
                </div>

                <div className="w-full sm:w-48">
                  <label
                    htmlFor={`status-${task.id}`}
                    className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    Change Status
                  </label>

                  <select
                    id={`status-${task.id}`}
                    value={task.status}
                    disabled={statusMutation.isPending}
                    onChange={(event) =>
                      handleStatusChange(
                        task.id,
                        event.target.value as TaskStatus,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  {statusMutation.isPending && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                      <RefreshCw
                        size={13}
                        className="animate-spin"
                      />
                      Saving changes...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectDetails
