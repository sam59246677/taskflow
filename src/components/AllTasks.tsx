
import { useEffect, useState } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  Search,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import type { FormEvent } from 'react'

import type {
  Task,
  TaskStatus,
  TaskPriority,
} from '../types/task'

import {
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from '../services/taskService'

import { getTeamMembers } from '../services/teamService'
import Toast, { type ToastType } from './Toast'

const statuses: Array<'All' | TaskStatus> = [
  'All',
  'Pending',
  'In Progress',
  'Completed',
]

const priorities: TaskPriority[] = [
  'High',
  'Medium',
  'Low',
]

const statusStyles: Record<TaskStatus, string> = {
  Pending:
    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'In Progress':
    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Completed:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const priorityStyles: Record<TaskPriority, string> = {
  High: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Medium:
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

type EditableFields = {
  title: string
  project: string
  priority: TaskPriority
  dueDate: string
  assigneeId: string
}

type EditFormProps = {
  task: Task
  onCancel: () => void
  onSave: (fields: EditableFields) => void
  isSaving: boolean
}

function taskDateValue(value: string) {
  if (!value) return ''
  return value.slice(0, 10)
}

const inputStyles =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900'

const labelStyles =
  'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'

function EditTaskForm({
  task,
  onCancel,
  onSave,
  isSaving,
}: EditFormProps) {
  const [title, setTitle] = useState(task.title)
  const [project, setProject] = useState(task.project)
  const [priority, setPriority] = useState<TaskPriority>(
    task.priority,
  )
  const [dueDate, setDueDate] = useState(
    taskDateValue(task.dueDate),
  )
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? '')

  const {
    data: teamMembers = [],
    isLoading: isLoadingTeamMembers,
    isError: isTeamMembersError,
  } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
    staleTime: 1000 * 60,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim() || !project.trim()) return

    onSave({
      title: title.trim(),
      project: project.trim(),
      priority,
      dueDate,
      assigneeId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor={`title-${task.id}`}
          className={labelStyles}
        >
          Task title
        </label>

        <input
          id={`title-${task.id}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={120}
          className={inputStyles}
        />
      </div>

      <div>
        <label
          htmlFor={`project-${task.id}`}
          className={labelStyles}
        >
          Project
        </label>

        <input
          id={`project-${task.id}`}
          value={project}
          onChange={(event) => setProject(event.target.value)}
          required
          maxLength={80}
          className={inputStyles}
        />
      </div>

      <div>
        <label
          htmlFor={`assignee-${task.id}`}
          className={labelStyles}
        >
          Assign to team member
        </label>

        <select
          id={`assignee-${task.id}`}
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          className={inputStyles}
          disabled={isLoadingTeamMembers || isTeamMembersError}
        >
          <option value="">Unassigned</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} — {member.role}
            </option>
          ))}
        </select>

        {isLoadingTeamMembers && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Loading team members...
          </p>
        )}

        {isTeamMembersError && (
          <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
            Could not load team members.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`priority-${task.id}`} 
            className={labelStyles}
          >
            Priority
          </label>

          <select
            id={`priority-${task.id}`}
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority)
            }
            className={inputStyles}
          >
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`dueDate-${task.id}`}
            className={labelStyles}
          >
            Due date
          </label>

          <input
            id={`dueDate-${task.id}`}
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={inputStyles}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving || !title.trim() || !project.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function AllTasks() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<'All' | TaskStatus>('All')
  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null)

  const [toast, setToast] = useState<{
    message: string
    type: ToastType
  } | null>(null)

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 10000)

    return () => window.clearTimeout(timer)
  }, [toast])

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

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
    staleTime: 1000 * 60,
  })

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: TaskStatus
    }) => updateTaskStatus(id, status),

    onSuccess: async () => {
      setToast({
        message: 'Task status updated successfully.',
        type: 'success',
      })

      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },

    onError: () => {
      setToast({
        message: 'Could not update task status. Please try again.',
        type: 'error',
      })
    },
  })

  const editMutation = useMutation({
    mutationFn: ({
      id,
      fields,
    }: {
      id: string
      fields: EditableFields
    }) => updateTask(id, fields),

    onSuccess: async () => {
      setEditingTaskId(null)

      setToast({
        message: 'Task updated successfully.',
        type: 'success',
      })

      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },

    onError: () => {
      setToast({
        message: 'Could not save task changes. Please try again.',
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,

    onSuccess: async () => {
      setToast({
        message: 'Task deleted successfully.',
        type: 'success',
      })

      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },

    onError: () => {
      setToast({
        message: 'Could not delete the task. Please try again.',
        type: 'error',
      })
    },
  })

  const isBusy =
    statusMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      task.project.toLowerCase().includes(searchText)

    const matchesStatus =
      statusFilter === 'All' || task.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          All Tasks
        </h2>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Loading tasks...
        </p>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          All Tasks
        </h2>

        <p
          role="alert"
          className="mt-4 text-sm text-red-600 dark:text-red-400"
        >
          {error instanceof Error
            ? error.message
            : 'Could not load tasks.'}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          All Tasks
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Search, filter, edit, and manage your tasks.
        </p>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search tasks</span>
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by task or project..."
            className={`${inputStyles} py-2.5 pl-10 pr-3 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
          />
        </label>

        <label className="sm:w-48">
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as 'All' | TaskStatus,
              )
            }
            className={`${inputStyles} py-2.5`}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All statuses' : status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Task list
          </h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No tasks match your search or filter.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredTasks.map((task) => {
              const isEditing = editingTaskId === task.id

              return (
                <article key={task.id} className="p-5">
                  {isEditing ? (
                    <>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Edit task
                      </h4>

                      <EditTaskForm
                        task={task}
                        onCancel={() => {
                          setEditingTaskId(null)
                          editMutation.reset()
                        }}
                        isSaving={editMutation.isPending}
                        onSave={(fields) => {
                          setToast(null)
                          editMutation.mutate({
                            id: task.id,
                            fields,
                          })
                        }}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {task.title}
                        </h4>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Project: {task.project}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Assigned to:{' '}
                          {teamMembers.find(
                            (member) => member.id === task.assigneeId,
                          )?.name ?? 'Unassigned'}
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Due: {task.dueDate || 'No due date'}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                          >
                            {task.status}
                          </span>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
                          >
                            {task.priority} priority
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:w-52">
                        <label>
                          <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                            Change status
                          </span>

                          <select
                            value={task.status}
                            disabled={isBusy}
                            onChange={(event) => {
                              const newStatus =
                                event.target.value as TaskStatus

                              if (newStatus !== task.status) {
                                setToast(null)
                                statusMutation.mutate({
                                  id: task.id,
                                  status: newStatus,
                                })
                              }
                            }}
                            className={`${inputStyles} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {statuses
                              .filter(
                                (status): status is TaskStatus =>
                                  status !== 'All',
                              )
                              .map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                          </select>
                        </label>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              setToast(null)
                              editMutation.reset()
                              setEditingTaskId(task.id)
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Delete "${task.title}"? This action cannot be undone.`,
                              )

                              if (confirmed) {
                                setToast(null)
                                deleteMutation.mutate(task.id)
                              }
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
export default AllTasks