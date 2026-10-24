
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

type ToastProps = {
  message: string
  type: ToastType
  onClose: () => void
}

function Toast({ message, type, onClose }: ToastProps) {
  const isSuccess = type === 'success'

  const styles = isSuccess
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300'

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-colors ${styles}`}
    >
      {isSuccess ? (
        <CheckCircle2
          size={20}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
      ) : (
        <CircleAlert
          size={20}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
      )}

      <p className="min-w-0 flex-1 break-words text-sm font-medium">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="shrink-0 rounded p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

export default Toast