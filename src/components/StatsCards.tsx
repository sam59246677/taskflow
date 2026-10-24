
import {
  ListTodo,
  Clock3,
  CircleCheck,
  FolderKanban,
} from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import StatCard from './StatCard'
import { getTasks } from '../services/taskService'

function StatsCards() {
  const {
    data: tasks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    staleTime: 1000 * 60,
  })

  const totalTasks = tasks.length

  const inProgressTasks = tasks.filter(
    (task) => task.status === 'In Progress',
  ).length

  const completedTasks = tasks.filter(
    (task) => task.status === 'Completed',
  ).length

  const totalProjects = new Set(
    tasks
      .map((task) => task.project.trim())
      .filter(Boolean),
  ).size

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      description: 'All tasks in your workspace',
      icon: ListTodo,
      iconColor: 'text-blue-600',
      iconBackground: 'bg-blue-50',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      description: 'Tasks currently in progress',
      icon: Clock3,
      iconColor: 'text-amber-600',
      iconBackground: 'bg-amber-50',
    },
    {
      title: 'Completed',
      value: completedTasks,
      description: 'Tasks successfully completed',
      icon: CircleCheck,
      iconColor: 'text-emerald-600',
      iconBackground: 'bg-emerald-50',
    },
    {
      title: 'Projects',
      value: totalProjects,
      description: 'Projects in your workspace',
      icon: FolderKanban,
      iconColor: 'text-violet-600',
      iconBackground: 'bg-violet-50',
    },
  ]

  if (isLoading) {
    return (
      <section
        aria-label="Loading task statistics"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
          />
        ))}
      </section>
    )
  }

  if (isError) {
    return (
      <section
        aria-label="Task statistics error"
        className="rounded-xl border border-red-200 bg-white p-5 dark:border-red-900 dark:bg-slate-800"
      >
        <p className="text-sm text-red-600 dark:text-red-400">
          Could not load task statistics.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </section>
    )
  }

  return (
    <section
      aria-label="Task statistics"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </section>
  )
}
export default StatsCards