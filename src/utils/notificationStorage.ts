import type { AppNotification } from '../types/notification'

const STORAGE_KEY = 'taskflow-notifications'

export function getStoredNotifications(): AppNotification[] {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
  } catch {
    return []
  }
}

export function saveNotifications(notifications: AppNotification[],): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notifications),
  )
}