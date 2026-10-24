
import type { FormEvent } from 'react'
import { Users, ListTodo, X } from 'lucide-react'
import type { Project } from '../services/projectService'
import type { TeamMember } from '../services/teamService'
import type { Task } from '../types/task'

interface ProjectFormProps {
  editingProject: Project | null
  name: string
  description: string
  selectedMemberIds: string[]
  selectedTaskIds: string[]
  teamMembers: TeamMember[]
  tasks: Task[]
  isLoadingTeamMembers: boolean
  isTeamMembersError: boolean
  isLoadingTasks: boolean
  isTasksError: boolean
  isSaving: boolean
  error: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onMemberToggle: (member: TeamMember) => void
  onTaskToggle: (taskId: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

const inputStyles ='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900'

const labelStyles ='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'

function ProjectForm({
  editingProject,
  name,
  description,
  selectedMemberIds,
  selectedTaskIds,
  teamMembers,
  tasks,
  isLoadingTeamMembers,
  isTeamMembersError,
  isLoadingTasks,
  isTasksError,
  isSaving,
  error,
  onNameChange,
  onDescriptionChange,
  onMemberToggle,
  onTaskToggle,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </h2>

        <button type="button" onClick={onCancel} aria-label="Close form"className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Project name */}
        <div>
          <label htmlFor="project-name" className={labelStyles}>Project Name </label>
          <input
            id="project-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="e.g. Website Redesign"
            maxLength={80}
            required
            className={inputStyles}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="project-description" className={labelStyles}> Description </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Write a short project description..."
            rows={3}
            maxLength={500}
            className={`${inputStyles} resize-y`}
          />
        </div>

        {/* Team members */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className={labelStyles}>
              <span className="flex items-center gap-2">
                <Users size={18} />
                Team Members
              </span>
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedMemberIds.length} selected
            </span>
          </div>

          {isLoadingTeamMembers ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              Loading team members...
            </p>
          ) : isTeamMembersError ? (
            <p  role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              Failed to load team members. Check that the JSON Server is running and try again.
            </p>
          ) : teamMembers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              No team members found. Add team members first.
            </p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-600">
              {teamMembers.map((member) => {
                const isSelected = selectedMemberIds.includes(member.id)
                const isUnavailable = member.status !== 'Active'

                return (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 rounded-lg p-3 transition ${
                      isUnavailable && !isSelected
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    } ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isUnavailable && !isSelected}
                      onChange={() => onMemberToggle(member)}
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {member.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {member.role} · {member.email}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                        member.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      {member.status}
                    </span>
                  </label>
                )
              })}
            </div>
          )}

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Only active members can be newly assigned. Existing unavailable members can be unassigned.
          </p>
        </div>

        {/* Tasks */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <ListTodo size={18} />
              Project Tasks
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">{selectedTaskIds.length} selected </span>
          </div>

          {isLoadingTasks ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              Loading tasks...
            </p>
          ) : isTasksError ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              Failed to load tasks. Check that the JSON Server is running and try again.
            </p>
          ) : tasks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              No tasks found. Create tasks first.
            </p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-600">
              {tasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id)
                const assignedElsewhere =
                  Boolean(task.project) &&
                  task.project !== editingProject?.name &&
                  !isSelected

                return (
                  <label key={task.id} className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition hover:bg-slate-50 dark:hover:bg-slate-700/60 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <input type="checkbox" checked={isSelected} onChange={() => onTaskToggle(task.id)} className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-slate-800 dark:text-slate-100">
                        {task.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {task.status} · {task.priority}
                      </p>

                      {assignedElsewhere && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          Currently assigned to: {task.project}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            A task can belong to one project at a time. Selecting it here will assign it to this project when you save.
          </p>
        </div>

        {/* Form error */}
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
            Cancel
          </button>

          <button type="submit" disabled={isSaving ||isLoadingTeamMembers ||isTeamMembersError ||isLoadingTasks ||isTasksError}className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving
              ? 'Saving...'
              : editingProject
                ? 'Save Changes'
                : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
export default ProjectForm