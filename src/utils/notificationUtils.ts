import type { Task } from '../types/task'
import type { AppNotification } from '../types/notification'

export function generateNotifications(tasks: Task[]): AppNotification[] {
    const now = new Date()

    return tasks.filter((task) => {
        if (task.status === 'Completed' || !task.dueDate) {
            return false
        }
        const dueDate = new Date(task.dueDate)

        if (Number.isNaN(dueDate.getTime())) {
            return false
        }

        const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return daysUntilDue >= 0 && daysUntilDue <= 3
    })
        .map((task) => ({
            id: `deadline-${task.id}`,
            title: 'Upcoming deadline',
            message: `"${task.title}" is due within 3 days.`,
            createdAt: now.toISOString(),
            read: false,
            taskId: task.id,
        }))
}