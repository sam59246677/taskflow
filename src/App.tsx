
import { Plus } from 'lucide-react'
import { useState } from 'react'

import Sidebar from './layouts/Sidebar'
import type { AppPage } from './layouts/Sidebar'
import Header from './layouts/Header'
import type { StoredUser } from './types/user'
import type { UserRole } from './types/user'


import StatsCards from './components/StatsCards'
import WeeklyActivity from './components/WeeklyActivity'
import RecentTasks from './components/RecentTasks'
import UpcomingDeadlines from './components/UpcomingDeadlines'
import AddTaskForm from './components/AddTaskForm'
import AllTasks from './components/AllTasks'
import Projects from './components/Projects'
import Team from './pages/Team'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('Dashboard')
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(() => {
    const email = localStorage.getItem('taskflow-user')
    if (!email) {
      return null
    }

    const users: StoredUser[] = JSON.parse(localStorage.getItem('taskflow-users') ?? '[]',)
    const user = users.find((item) => item.email === email,)

    if (!user) {
      return null
    }

    return {
      ...user,
      role: user.role ?? 'Developer',
    }
  })

  const allowedPages: Record<UserRole, AppPage[]> = {
    Admin: ['Dashboard', 'Tasks', 'Projects', 'Team', 'Settings'],
    'Project Manager': ['Dashboard', 'Tasks', 'Projects', 'Team'],
    Developer: ['Dashboard', 'Tasks'],
    Designer: ['Dashboard', 'Tasks'],
  }

  function handleNavigate(page: AppPage) {
    if (!currentUser) {
      return
    }

    if (!allowedPages[currentUser.role].includes(page)) {
      setActivePage('Dashboard')
      setIsAddTaskOpen(false)
      return
    }

    setActivePage(page)
    setIsAddTaskOpen(false)
  }

  function handleLogin(email: string) {
    const users: StoredUser[] = JSON.parse(localStorage.getItem('taskflow-users') ?? '[]',)
    const user = users.find( (item) => item.email === email)

    if (!user) {
      return
    }
    localStorage.setItem('taskflow-user', user.email)
    setCurrentUser({
      ...user,
      role: user.role ?? 'Developer',
    })
  }
  function handleLogout() {
    localStorage.removeItem('taskflow-user')
    setCurrentUser(null)
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} userRole={currentUser.role} />
        <div className="min-w-0 flex-1">
          <Header
            userEmail={currentUser.email}
            userName={currentUser.name}
            userRole={currentUser.role}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />


          <main className="space-y-6 p-5 sm:p-8">
            {activePage === 'Dashboard' ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Overview </h1>
                    <p className="mt-1 text-sm text-slate-500"> Welcome back! Here is your project overview.</p>
                  </div>

                  <button type="button" onClick={() => setIsAddTaskOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    <Plus size={18} />
                    {isAddTaskOpen ? 'Close Form' : 'Add Task'}
                  </button>
                </div>

                {isAddTaskOpen && (
                  <AddTaskForm onCancel={() => setIsAddTaskOpen(false)} onSuccess={() => setIsAddTaskOpen(false)} />
                )}

                <StatsCards />
                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
                  <div className="min-w-0 xl:col-span-2"><WeeklyActivity /></div>
                  <div className="min-w-0"> <RecentTasks /> </div>
                  <div className="min-w-0 xl:col-span-2"> <UpcomingDeadlines /> </div>
                </div>
              </>
            ) : activePage === 'Tasks' ? (
              <AllTasks />
            ) : activePage === 'Projects' ? (
              <Projects />
            ) : activePage === 'Team' ? (
              <Team />
            ) : activePage === 'Settings' ? (
              <Settings />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
}
export default App