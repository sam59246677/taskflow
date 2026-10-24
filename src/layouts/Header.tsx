
import { Bell, Search, UserRound, LogOut, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { AppPage } from './Sidebar'
import { getTasks } from '../services/taskService'
import { getProjects } from '../services/projectService'
import { getTeamMembers } from '../services/teamService'
import type { AppNotification } from '../types/notification'
import { generateNotifications } from '../utils/notificationUtils'
import { getStoredNotifications, saveNotifications, } from '../utils/notificationStorage'

type HeaderProps = {
  userEmail: string
  userName: string
  userRole: string
  onLogout: () => void
  onNavigate: (page: AppPage) => void
}

function Header({ userEmail, userName, userRole, onLogout, onNavigate, }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>(getStoredNotifications)

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const isSearching = normalizedQuery.length > 0

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    enabled: true,
  })

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    enabled: isSearching,
  })

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
    enabled: isSearching,
  })

  const matchingTasks = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.project.toLowerCase().includes(normalizedQuery),
    )
    .slice(0, 5)

  const matchingProjects = projects
    .filter(
      (project) =>
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.description.toLowerCase().includes(normalizedQuery),
    )
    .slice(0, 5)

  const matchingMembers = teamMembers
    .filter(
      (member) =>
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery),
    )
    .slice(0, 5)

  const isLoading = tasksLoading || projectsLoading || membersLoading
  const hasResults = matchingTasks.length > 0 || matchingProjects.length > 0 || matchingMembers.length > 0

  function handleLogout() {
    setIsProfileOpen(false)
    onLogout()
  }

  function handleSearchNavigate(page: AppPage) {
    onNavigate(page)
    setSearchQuery('')
  }

  useEffect(() => {
    if (tasksLoading) {
      return
    }

    const generatedNotifications = generateNotifications(tasks)

    setNotifications((previousNotifications) =>
      generatedNotifications.map((notification) => {
        const existingNotification = previousNotifications.find((item) => item.id === notification.id)
        return {
          ...notification,
          read: existingNotification?.read ?? false,
          createdAt: existingNotification?.createdAt ?? notification.createdAt,
        }
      }),
    )
  }, [tasks, tasksLoading])

  useEffect(() => {
    saveNotifications(notifications)
  }, [notifications])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 transition-colors sm:px-8 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white"> Dashboard</h2>
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="relative">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search tasks, projects and team members"
              aria-expanded={isSearching}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-20 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:w-36 dark:text-slate-100"
            />

            {searchQuery && (
              <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X size={16} />
              </button>
            )}
          </label>

          {isSearching && (
            <div className="absolute right-0 top-full z-40 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg sm:w-96 dark:border-slate-700 dark:bg-slate-900">
              {isLoading ? (
                <p className="px-2 py-4 text-sm text-slate-500"> Searching... </p>
              ) : !hasResults ? (
                <p className="px-2 py-4 text-sm text-slate-500"> No results found.</p>
              ) : (
                <div className="space-y-4">
                  {matchingTasks.length > 0 && (
                    <section>
                      <h3 className="px-2 pb-1 text-xs font-semibold uppercase text-slate-400"> Tasks</h3>

                      {matchingTasks.map((task) => (
                        <button key={task.id} type="button" onClick={() => handleSearchNavigate('Tasks')} className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">
                          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                            {task.title}
                          </span>
                          <span className="block text-xs text-slate-500">Project: {task.project || 'No project'}</span>
                        </button>
                      ))}
                    </section>
                  )}

                  {matchingProjects.length > 0 && (
                    <section>
                      <h3 className="px-2 pb-1 text-xs font-semibold uppercase text-slate-400"> Projects</h3>

                      {matchingProjects.map((project) => (
                        <button key={project.id} type="button" onClick={() => handleSearchNavigate('Projects')} className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">
                          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                            {project.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {project.description}
                          </span>
                        </button>
                      ))}
                    </section>
                  )}

                  {matchingMembers.length > 0 && (
                    <section>
                      <h3 className="px-2 pb-1 text-xs font-semibold uppercase text-slate-400">Team Members</h3>

                      {matchingMembers.map((member) => (
                        <button key={member.id} type="button" onClick={() => handleSearchNavigate('Team')} className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">
                          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                            {member.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {member.email}
                          </span>
                        </button>
                      ))}
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            onClick={() => setIsNotificationsOpen((open) => !open) }
            className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Notifications
              </h3>

              {notifications.length > 0 && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifications((previous) =>
                        previous.map((notification) => ({
                          ...notification,
                          read: true,
                        })),
                      )
                    }}
                    disabled={unreadCount === 0}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400"
                  >
                    Mark all as read
                  </button>
                </div>
              )}

              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        setNotifications((previous) =>
                          previous.map((item) =>
                            item.id === notification.id
                              ? { ...item, read: true }
                              : item,
                          ),
                        )
                      }}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${notification.read
                          ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                          : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                        }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {notification.title}
                        </span>

                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </span>

                      <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">
                        {notification.message}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="User profile"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen((open) => !open)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
          >
            <UserRound size={20} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="px-2 py-2">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                <p className="mt-1 truncate text-xs text-slate-500"> {userEmail}</p>
                <p className="mt-2 text-xs font-medium text-blue-600"> {userRole}</p>
              </div>
              <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
export default Header