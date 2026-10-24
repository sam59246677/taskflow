
import {LayoutDashboard,CheckSquare,FolderKanban,Users, Settings,} from 'lucide-react'
import type { UserRole } from '../types/user'

export type AppPage = 'Dashboard'| 'Tasks'| 'Projects' | 'Team'| 'Settings'

type SidebarProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  userRole: UserRole
}

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Tasks', icon: CheckSquare },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Team', icon: Users },
  { label: 'Settings', icon: Settings },
] satisfies Array<{ label: AppPage; icon: typeof LayoutDashboard }>

const rolePermissions: Record<UserRole, AppPage[]> = {
  Admin: ['Dashboard', 'Tasks', 'Projects', 'Team', 'Settings'],
  'Project Manager': ['Dashboard', 'Tasks', 'Projects', 'Team'],
  Developer: ['Dashboard', 'Tasks'],
  Designer: ['Dashboard', 'Tasks'],
}

function Sidebar({activePage,onNavigate,userRole,}: SidebarProps) {
  const allowedPages = rolePermissions[userRole]
  const visibleMenuItems = menuItems.filter((item) =>  allowedPages.includes(item.label), )

  return (
    <aside className="min-h-screen w-[250px] shrink-0 border-r border-slate-200 bg-white px-3 py-6 transition-colors dark:border-slate-700 dark:bg-slate-900">
      <h1 className="mb-10 px-3 text-2xl font-bold text-blue-600">TaskFlow </h1>
      <nav aria-label="Main navigation" className="space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.label

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.label)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
export default Sidebar