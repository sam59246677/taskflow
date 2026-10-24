export type AppNotification = {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
  taskId?: string
}