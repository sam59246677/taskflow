
export type TaskStatus = 'Completed' | 'In Progress' | 'Pending'

export type TaskPriority = 'High' | 'Medium' | 'Low'

export interface Task {
  id: string
  title: string
  project: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  completedAt?: string | null
  assigneeId?: string
}
