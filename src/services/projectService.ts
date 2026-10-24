
export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  memberIds: string[]
}

const API_URL = 'http://localhost:3001/projects'

// دریافت همه پروژه‌ها
export async function getProjects(): Promise<Project[]> {
  const response = await fetch(API_URL)
  if (!response.ok) { throw new Error('Failed to fetch projects') }
  const projects = (await response.json()) as Array<Omit<Project, 'memberIds'> & { memberIds?: string[]}>
  // سازگاری با پروژه‌های قدیمی
  return projects.map((project) => ({
    ...project,
    memberIds: project.memberIds ?? [],
  }))
}

// ایجاد پروژه جدید
export async function createProject( project: Omit<Project, 'id'>,): Promise<Project> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', },
    body: JSON.stringify({
      ...project,
      memberIds: project.memberIds ?? [],
    }),
  })
  if (!response.ok) {throw new Error('Failed to create project')}
  return response.json() as Promise<Project>
}

// ویرایش پروژه
export async function updateProject(id: string,fields: Pick<Project, 'name' | 'description' | 'memberIds'>,): Promise<Project> {
  const projects = await getProjects()
  const currentProject = projects.find((project) => project.id === id,)
  if (!currentProject) {throw new Error('Project not found')}
  // اگر نام پروژه تغییر کرده، نام آن را در تسک‌های مرتبط هم تغییر بده
  if (currentProject.name !== fields.name) {
    const tasksResponse = await fetch('http://localhost:3001/tasks',)
    if (!tasksResponse.ok) {throw new Error('Failed to fetch tasks')}
    const tasks = (await tasksResponse.json()) as Array<{id: string, project: string }>
    const relatedTasks = tasks.filter((task) => task.project === currentProject.name,)
    await Promise.all( relatedTasks.map(async (task) => {
        const response = await fetch(`http://localhost:3001/tasks/${task.id}`,
          {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ project: fields.name,}),
          },
        )
        if (!response.ok) { throw new Error('Failed to update related task')}
      }),
    )
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(fields),
  })
  if (!response.ok) { throw new Error('Failed to update project')}
  return response.json() as Promise<Project>
}

// حذف پروژه
export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {throw new Error('Failed to delete project')}
}