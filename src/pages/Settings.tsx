
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Save,
  UserRound,
  Bell,
  Palette,
} from 'lucide-react'

type Theme = 'Light' | 'Dark' | 'System'

interface UserSettings {
  name: string
  email: string
  theme: Theme
  emailNotifications: boolean
  taskNotifications: boolean
}

const STORAGE_KEY = 'taskflow-settings'

const defaultSettings: UserSettings = {
  name: 'Sam Rostami1',
  email: '',
  theme: 'Light',
  emailNotifications: true,
  taskNotifications: true,
}

function getSavedSettings(): UserSettings {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY)

    if (!savedSettings) {
      return defaultSettings
    }

    const parsed = JSON.parse(
      savedSettings,
    ) as Partial<UserSettings>

    return {
      ...defaultSettings,
      ...parsed,
      theme:
        parsed.theme === 'Light' ||
        parsed.theme === 'Dark' ||
        parsed.theme === 'System'
          ? parsed.theme
          : defaultSettings.theme,
    }
  } catch {
    return defaultSettings
  }
}

function Settings() {
  const [settings, setSettings] =
    useState<UserSettings>(getSavedSettings)

  const [message, setMessage] = useState('')

  // Apply and persist the selected theme immediately.
  useEffect(() => {
    const root = document.documentElement

    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    )

    function applyTheme() {
      const shouldUseDark =
        settings.theme === 'Dark' ||
        (settings.theme === 'System' && mediaQuery.matches)

      root.classList.toggle('dark', shouldUseDark)
    }

    applyTheme()

    // Save the theme immediately without waiting for Save Changes.
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      const existingSettings = saved
        ? JSON.parse(saved)
        : {}

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...defaultSettings,
          ...existingSettings,
          theme: settings.theme,
        }),
      )
    } catch {
      setMessage(
        'Unable to save theme preference. Please check your browser storage.',
      )
    }

    // Keep System theme synchronized with the operating system.
    if (settings.theme === 'System') {
      mediaQuery.addEventListener('change', applyTheme)

      return () => {
        mediaQuery.removeEventListener('change', applyTheme)
      }
    }
  }, [settings.theme])

  function updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))

    setMessage('')
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings),
      )

      setMessage('Settings saved successfully.')
    } catch {
      setMessage(
        'Unable to save settings. Please check your browser storage.',
      )
    }
  }

  const inputStyles =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/50'

  const labelStyles =
    'mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'

  const cardStyles =
    'rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900'

  const headingStyles =
    'font-semibold text-slate-900 dark:text-white'

  const descriptionStyles =
    'text-sm text-slate-500 dark:text-slate-400'

  const notificationTitleStyles =
    'block text-sm font-medium text-slate-800 dark:text-slate-200'

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account and application preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile information */}
        <div className={cardStyles}>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <UserRound size={20} />
            </div>

            <div>
              <h2 className={headingStyles}>
                Profile Information
              </h2>

              <p className={descriptionStyles}>
                Update your personal information.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="settings-name"
                className={labelStyles}
              >
                Full Name
              </label>

              <input
                id="settings-name"
                value={settings.name}
                onChange={(event) =>
                  updateSetting('name', event.target.value)
                }
                required
                className={inputStyles}
              />
            </div>

            <div>
              <label
                htmlFor="settings-email"
                className={labelStyles}
              >
                Email Address
              </label>

              <input
                id="settings-email"
                type="email"
                value={settings.email}
                onChange={(event) =>
                  updateSetting('email', event.target.value)
                }
                required
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={cardStyles}>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
              <Bell size={20} />
            </div>

            <div>
              <h2 className={headingStyles}>
                Notifications
              </h2>

              <p className={descriptionStyles}>
                Choose which notifications you want to receive.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className={notificationTitleStyles}>
                  Email Notifications
                </span>

                <span className={descriptionStyles}>
                  Receive updates by email.
                </span>
              </span>

              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(event) =>
                  updateSetting(
                    'emailNotifications',
                    event.target.checked,
                  )
                }
                className="h-4 w-4 shrink-0 accent-blue-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className={notificationTitleStyles}>
                  Task Notifications
                </span>

                <span className={descriptionStyles}>
                  Get notified about task updates.
                </span>
              </span>

              <input
                type="checkbox"
                checked={settings.taskNotifications}
                onChange={(event) =>
                  updateSetting(
                    'taskNotifications',
                    event.target.checked,
                  )
                }
                className="h-4 w-4 shrink-0 accent-blue-600"
              />
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className={cardStyles}>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <Palette size={20} />
            </div>

            <div>
              <h2 className={headingStyles}>
                Appearance
              </h2>

              <p className={descriptionStyles}>
                Choose your preferred theme.
              </p>
            </div>
          </div>

          <label
            htmlFor="settings-theme"
            className={labelStyles}
          >
            Theme
          </label>

          <select
            id="settings-theme"
            value={settings.theme}
            onChange={(event) =>
              updateSetting(
                'theme',
                event.target.value as Theme,
              )
            }
            className={`${inputStyles} sm:max-w-xs`}
          >
            <option value="Light">Light</option>
            <option value="Dark">Dark</option>
            <option value="System">System Default</option>
          </select>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Your theme preference is applied and saved immediately.
          </p>
        </div>

        {/* Save changes */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p
            aria-live="polite"
            className={`text-sm ${
              message.startsWith('Settings saved')
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {message}
          </p>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>
    </section>
  )
}
export default Settings