import type { Task, TaskStatus } from '../types/task'
const API_URL = 'http://localhost:3001/tasks'
export type EditableTaskFields = Pick< Task,  'title' | 'project' | 'priority' | 'dueDate' | 'assigneeId'>

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(API_URL)
  if (!response.ok) { throw new Error('Failed to fetch tasks')}
  return response.json() as Promise<Task[]>
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(task),
  })
  if (!response.ok) {throw new Error('Failed to create task')}
  return response.json() as Promise<Task>
}
export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<Task> {
  const completedAt = status === 'Completed' ? new Date().toISOString() : null

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json', },
    body: JSON.stringify({ status,completedAt,}),
  })
  if (!response.ok) { throw new Error('Failed to update task status')}
  return response.json() as Promise<Task>
}

export async function updateTask(
  id: string,
  fields: EditableTaskFields,
): Promise<Task> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json', },
    body: JSON.stringify(fields),
  })
  if (!response.ok) {throw new Error('Failed to update task')}
  return response.json() as Promise<Task>
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) { throw new Error('Failed to delete task')}
}

export async function updateTaskProject(
  id: string,
  projectName: string,
): Promise<Task> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify({ project: projectName,}),
  })
  if (!response.ok) { throw new Error('Failed to update task project')}
  return response.json() as Promise<Task>
}