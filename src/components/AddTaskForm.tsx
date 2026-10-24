
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TaskPriority } from '../types/task'
import { createTask } from '../services/taskService'
import { getTeamMembers } from '../services/teamService'

type AddTaskFormProps = {
  onCancel: () => void
  onSuccess: () => void
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function AddTaskForm({ onCancel, onSuccess }: AddTaskFormProps) {
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [project, setProject] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [dueDate, setDueDate] = useState(getToday())
  const [assigneeId, setAssigneeId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    data: teamMembers = [],
    isLoading: isLoadingTeamMembers,
    isError: isTeamMembersError,
  } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
    staleTime: 1000 * 60,
  })

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onSuccess()
    },
    onError: () => {setFormError('Could not create the task. Please try again.')},
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    mutation.mutate({
      title: title.trim(),
      project: project.trim(),
      status: 'Pending',
      priority,
      dueDate,
      ...(assigneeId ? { assigneeId } : {}),
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900"> Add New Task </h2>
      <p className="mt-1 text-sm text-slate-500">Enter the details of your new task.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="task-title" className="mb-2 block text-sm font-medium text-slate-700">
            Task title
          </label>

          <input
            id="task-title"
            type="text"
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Design dashboard UI"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="task-project" className="mb-2 block text-sm font-medium text-slate-700">
            Project name
          </label>

          <input
            id="task-project"
            type="text"
            required
            maxLength={80}
            value={project}
            onChange={(event) => setProject(event.target.value)}
            placeholder="e.g. TaskFlow"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="task-assignee" className="mb-2 block text-sm font-medium text-slate-700">
            Assign to team member
          </label>

          <select
            id="task-assignee"
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            disabled={isLoadingTeamMembers || isTeamMembersError}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {isLoadingTeamMembers
                ? 'Loading team members...'
                : isTeamMembersError
                  ? 'Could not load team members'
                  : 'Unassigned'}
            </option>

            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>{member.name} — {member.role} </option>
            ))}
          </select>

          {isTeamMembersError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              Could not load team members. You can still create an unassigned task.
            </p>
          )}

          {!isLoadingTeamMembers &&
            !isTeamMembersError &&
            teamMembers.length === 0 && (
              <p className="mt-2 text-sm text-slate-500"> No team members available. You can assign a member later.</p>
            )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="task-priority" className="mb-2 block text-sm font-medium text-slate-700">
              Priority
            </label>

            <select
              id="task-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className="mb-2 block text-sm font-medium text-slate-700">
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              required
              min={getToday()}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {formError && (<p role="alert" className="text-sm text-red-600">{formError} </p> )}
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          <button type="button" onClick={onCancel} disabled={mutation.isPending}className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending}className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {mutation.isPending ? 'Saving...' : 'Create Task'}
          </button>
        </div>
      </form>
    </section>
  )
}
export default AddTaskForm