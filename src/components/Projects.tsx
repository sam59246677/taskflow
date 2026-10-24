
import { useState, type FormEvent } from 'react'
import {useMutation,useQuery,useQueryClient,} from '@tanstack/react-query'
import {FolderKanban,Plus,Pencil,Trash2,Eye,} from 'lucide-react'
import {createProject,deleteProject,getProjects,updateProject,type Project,} from '../services/projectService'
import {getTeamMembers,type TeamMember,} from '../services/teamService'
import {getTasks,updateTaskProject,} from '../services/taskService'
import ProjectDetails from './ProjectDetails'
import ProjectForm from './ProjectForm'

const inputStyles ='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900'

const labelStyles ='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'

function Projects() {
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'progress'>('name')
  const [taskFilter, setTaskFilter] = useState<'all' | 'empty' | 'hasTasks'>('all')
  const [successMessage, setSuccessMessage] = useState('')

  // دریافت پروژه‌ها
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  // دریافت تسک‌ها
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    isError: isTasksError,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })

  // دریافت اعضای تیم
  const {
    data: teamMembers = [],
    isLoading: isLoadingTeamMembers,
    isError: isTeamMembersError,
  } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
  })

  // بازنشانی فرم
  function resetForm() {
    setIsFormOpen(false)
    setEditingProject(null)
    setName('')
    setDescription('')
    setSelectedMemberIds([])
    setSelectedTaskIds([])
    setError('')
  }

  // ایجاد پروژه و اختصاص تسک‌های انتخاب‌شده
  const createMutation = useMutation({
    mutationFn: async ({projectData,taskIds,}: {projectData: Omit<Project, 'id'>,taskIds: string[]}) => {
      const newProject = await createProject(projectData)
      const selectedTasks = tasks.filter((task) => taskIds.includes(task.id),)
      await Promise.all( selectedTasks.map((task) =>updateTaskProject(task.id, newProject.name),),)
      return newProject
    },

    onSuccess: async () => {
      resetForm()
      setSuccessMessage('Project created successfully.')

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['projects'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['tasks'],
        }),
      ])
    },

    onError: (error) => {
      console.error('CREATE ERROR:', error)
      setError(
        'Failed to create the project or assign its tasks. Please try again.',
      )
    },
  })

  // ویرایش پروژه و مدیریت تسک‌های آن
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      fields,
      taskIds,
      previousProjectName,
    }: {
      id: string
      fields: Pick<Project, 'name' | 'description' | 'memberIds'>
      taskIds: string[]
      previousProjectName: string
    }) => {
      const updatedProject = await updateProject(id, fields)

      const tasksToUpdate = tasks.filter(
        (task) =>
          taskIds.includes(task.id) ||
          task.project === previousProjectName,
      )

      await Promise.all(
        tasksToUpdate.map((task) =>
          updateTaskProject(
            task.id,
            taskIds.includes(task.id) ? fields.name : '',
          ),
        ),
      )

      return updatedProject
    },

    onSuccess: async () => {
      resetForm()
      setSuccessMessage('Project updated successfully.')

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['projects'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['tasks'],
        }),
      ])
    },

    onError: (error) => {
      console.error('UPDATE ERROR:', error)
      setError(
        'Failed to update the project or assign its tasks. Please try again.',
      )
    },
  })

  // حذف پروژه
  const deleteMutation = useMutation({
    mutationFn: deleteProject,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['projects'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['tasks'],
        }),
      ])

      setError('')
      setSuccessMessage('Project deleted successfully.')
    },

    onError: (error) => {
      console.error('DELETE ERROR:', error)
      setError('Failed to delete the project. Please try again.')
    },
  })

  const isSaving =
    createMutation.isPending || updateMutation.isPending

  // تسک‌های مربوط به هر پروژه
  function getProjectTasks(project: Project) {
    return tasks.filter((task) => task.project === project.name)
  }

  // اعضای مربوط به هر پروژه
  function getProjectMembers(project: Project): TeamMember[] {
    const memberIds = project.memberIds ?? []

    return teamMembers.filter((member) =>
      memberIds.includes(member.id),
    )
  }

  // باز کردن فرم ساخت پروژه
  function handleAddProject() {
    setSuccessMessage('')
    setError('')
    setEditingProject(null)
    setName('')
    setDescription('')
    setSelectedMemberIds([])
    setSelectedTaskIds([])
    setIsFormOpen(true)
  }

  // باز کردن فرم ویرایش پروژه
  function handleEditProject(project: Project) {
    setSuccessMessage('')
    setError('')
    setEditingProject(project)
    setName(project.name)
    setDescription(project.description)
    setSelectedMemberIds(project.memberIds ?? [])

    setSelectedTaskIds(
      tasks
        .filter((task) => task.project === project.name)
        .map((task) => task.id),
    )

    setIsFormOpen(true)
  }

  // انتخاب یا لغو انتخاب یک عضو
  function handleMemberToggle(member: TeamMember) {
    setSelectedMemberIds((currentIds) => {
      const isSelected = currentIds.includes(member.id)

      // عضو غیرفعال جدید را نمی‌توان به پروژه اضافه کرد
      if (member.status !== 'Active' && !isSelected) {
        return currentIds
      }

      if (isSelected) {
        return currentIds.filter((id) => id !== member.id)
      }

      return [...currentIds, member.id]
    })
  }

  // انتخاب یا لغو انتخاب یک تسک
  function handleTaskToggle(taskId: string) {
    setSelectedTaskIds((currentIds) =>
      currentIds.includes(taskId)
        ? currentIds.filter((id) => id !== taskId)
        : [...currentIds, taskId],
    )
  }

  // ثبت فرم
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      setError('Project name is required.')
      return
    }

    const alreadyExists = projects.some(
      (project) =>
        project.name.toLowerCase() === trimmedName.toLowerCase() &&
        project.id !== editingProject?.id,
    )

    if (alreadyExists) {
      setError('A project with this name already exists.')
      return
    }

    setError('')
    setSuccessMessage('')

    if (editingProject) {
      updateMutation.mutate({
        id: editingProject.id,
        fields: {
          name: trimmedName,
          description: trimmedDescription,
          memberIds: selectedMemberIds,
        },
        taskIds: selectedTaskIds,
        previousProjectName: editingProject.name,
      })
    } else {
      createMutation.mutate({
        projectData: {
          name: trimmedName,
          description: trimmedDescription,
          createdAt: new Date().toISOString(),
          memberIds: selectedMemberIds,
        },
        taskIds: selectedTaskIds,
      })
    }
  }

  // حذف پروژه‌ای که تسک ندارد
  function handleDeleteProject(project: Project) {
    const projectTasks = getProjectTasks(project)

    if (projectTasks.length > 0) {
      setSuccessMessage('')
      setError(
        `This project has ${projectTasks.length} task(s) and cannot be deleted.`,
      )
      return
    }

    setError('')
    setSuccessMessage('')

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`,
    )

    if (confirmed) {
      deleteMutation.mutate(project.id)
    }
  }

  // جست‌وجو و فیلتر پروژه‌ها
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())

    const taskCount = getProjectTasks(project).length

    const matchesTaskFilter =
      taskFilter === 'all' ||
      (taskFilter === 'empty' && taskCount === 0) ||
      (taskFilter === 'hasTasks' && taskCount > 0)

    return matchesSearch && matchesTaskFilter
  })

  // مرتب‌سازی پروژه‌ها
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }

    const aTasks = getProjectTasks(a)
    const bTasks = getProjectTasks(b)

    const aCompleted = aTasks.filter(
      (task) => task.status === 'Completed',
    ).length

    const bCompleted = bTasks.filter(
      (task) => task.status === 'Completed',
    ).length

    const aProgress =
      aTasks.length === 0 ? 0 : aCompleted / aTasks.length

    const bProgress =
      bTasks.length === 0 ? 0 : bCompleted / bTasks.length

    return bProgress - aProgress
  })

  // وضعیت بارگذاری پروژه‌ها و تسک‌ها
  if (isLoadingProjects || isLoadingTasks) {
    return (
      <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
        Loading projects...
      </div>
    )
  }

  if (isProjectsError || isTasksError) {
    return (
      <div
        role="alert"
        className="p-6 text-sm text-red-600 dark:text-red-400"
      >
        Failed to load data. Please make sure the server is running and try
        again.
      </div>
    )
  }

  const currentSelectedProject = selectedProject
    ? projects.find(
        (project) => project.id === selectedProject.id,
      ) ?? null
    : null

  if (currentSelectedProject) {
    return (
      <ProjectDetails
        project={currentSelectedProject}
        tasks={tasks}
        onBack={() => setSelectedProject(null)}
      />
    )
  }

  return (
    <section className="space-y-6">
      {/* پیام موفقیت */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
        >
          <p>{successMessage}</p>

          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* پیام خطای عمومی */}
      {error && !isFormOpen && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError('')}
            className="shrink-0 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* عنوان صفحه */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage all your projects in one place
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddProject}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* جست‌وجو */}
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search projects..."
        aria-label="Search projects"
        className={inputStyles}
      />

      {/* مرتب‌سازی و فیلتر */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project-sort" className={labelStyles}>
            Sort by
          </label>

          <select
            id="project-sort"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as 'name' | 'progress')
            }
            className={inputStyles}
          >
            <option value="name">Project Name</option>
            <option value="progress">Highest Progress</option>
          </select>
        </div>

        <div>
          <label htmlFor="project-task-filter" className={labelStyles}>
            Filter by Tasks
          </label>

          <select
            id="project-task-filter"
            value={taskFilter}
            onChange={(event) =>
              setTaskFilter(
                event.target.value as 'all' | 'empty' | 'hasTasks',
              )
            }
            className={inputStyles}
          >
            <option value="all">All Projects</option>
            <option value="hasTasks">Projects with Tasks</option>
            <option value="empty">Projects without Tasks</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setSearchQuery('')
          setTaskFilter('all')
          setSortBy('name')
        }}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        Clear Filters
      </button>

      {/* فرم ایجاد و ویرایش پروژه */}
      {isFormOpen && (
        <ProjectForm
          editingProject={editingProject}
          name={name}
          description={description}
          selectedMemberIds={selectedMemberIds}
          teamMembers={teamMembers}
          isLoadingTeamMembers={isLoadingTeamMembers}
          isTeamMembersError={isTeamMembersError}
          selectedTaskIds={selectedTaskIds}
          tasks={tasks}
          isLoadingTasks={isLoadingTasks}
          isTasksError={isTasksError}
          isSaving={isSaving}
          error={error}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onMemberToggle={handleMemberToggle}
          onTaskToggle={handleTaskToggle}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {/* حالت بدون نتیجه */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <FolderKanban
            size={40}
            className="mx-auto text-slate-400 dark:text-slate-500"
          />

          <h2 className="mt-4 font-semibold text-slate-800 dark:text-slate-100">
            {projects.length === 0
              ? 'No projects yet'
              : 'No projects found'}
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {projects.length === 0
              ? 'Create your first project to get started.'
              : 'Try a different search term or adjust your filters.'}
          </p>

          {(searchQuery || taskFilter !== 'all') &&
            projects.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setTaskFilter('all')
                }}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
        </div>
      ) : (
        /* کارت پروژه‌ها */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedProjects.map((project) => {
            const projectTasks = getProjectTasks(project)
            const projectMembers = getProjectMembers(project)

            const pendingCount = projectTasks.filter(
              (task) => task.status === 'Pending',
            ).length

            const inProgressCount = projectTasks.filter(
              (task) => task.status === 'In Progress',
            ).length

            const completedCount = projectTasks.filter(
              (task) => task.status === 'Completed',
            ).length

            const progress =
              projectTasks.length === 0
                ? 0
                : Math.round(
                    (completedCount / projectTasks.length) * 100,
                  )

            return (
              <article
                key={project.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                {/* عنوان و توضیحات پروژه */}
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <FolderKanban size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="break-words font-semibold text-slate-900 dark:text-white">
                      {project.name}
                    </h2>

                    <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
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

                {/* اعضای پروژه */}
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      <span aria-hidden="true">👥</span>
                      Team Members
                    </p>

                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {project.memberIds?.length ?? 0}
                    </span>
                  </div>

                  {projectMembers.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      No members assigned yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {projectMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex min-w-0 items-center gap-2"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {member.name
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part[0] ?? '')
                              .join('')
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                              {member.name}
                            </p>

                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {member.role}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                              member.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                          >
                            {member.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* اعضایی که دیگر در فهرست تیم نیستند */}
                  {projectMembers.length <
                    (project.memberIds?.length ?? 0) && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      Some assigned members could not be found in the team
                      list.
                    </p>
                  )}
                </div>

                {/* تعداد تسک‌ها */}
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total Tasks
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {projectTasks.length}
                  </p>
                </div>

                {/* درصد پیشرفت */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Project Progress
                    </span>

                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
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
                      style={{ width: `${progress}%` }}
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* وضعیت تسک‌ها */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center dark:border-slate-700">
                  <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Pending
                    </p>
                    <p className="mt-1 font-semibold text-amber-800 dark:text-amber-200">
                      {pendingCount}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      In Progress
                    </p>
                    <p className="mt-1 font-semibold text-blue-800 dark:text-blue-200">
                      {inProgressCount}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Completed
                    </p>
                    <p className="mt-1 font-semibold text-emerald-800 dark:text-emerald-200">
                      {completedCount}
                    </p>
                  </div>
                </div>

                {/* جزئیات */}
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setSuccessMessage('')
                    setSelectedProject(project)
                  }}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  <Eye size={16} />
                  View Details
                </button>

                {/* ویرایش و حذف */}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditProject(project)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
export default Projects