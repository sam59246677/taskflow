
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient, } from '@tanstack/react-query'
import { Mail, Users, ShieldCheck, Plus, Pencil, Trash2, } from 'lucide-react'
import {
  createTeamMember, getTeamMembers, updateTeamMember, deleteTeamMember, type EditableTeamMemberFields,
  type TeamRole,
  type TeamMemberStatus,
} from '../services/teamService'

const roles: TeamRole[] = ['Admin', 'Project Manager', 'Developer', 'Designer',]
const statuses: TeamMemberStatus[] = ['Active', 'Away']

export default function Team() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null,)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('Developer')
  const [status, setStatus] = useState<TeamMemberStatus>('Active')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  // دریافت اعضای تیم از API
  const {
    data: teamMembers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
    staleTime: 1000 * 60,
  })

  // افزودن عضو جدید
  const createMutation = useMutation({
    mutationFn: createTeamMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teamMembers'], })
      resetForm()
    },
  })

  // ویرایش عضو
  const updateMutation = useMutation({
    mutationFn: ({ id, fields, }: { id: string, fields: EditableTeamMemberFields }) => updateTeamMember(id, fields),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teamMembers'], })
      resetForm()
    },
  })

  // حذف عضو
  const deleteMutation = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teamMembers'], })
    },
  })

  function resetForm() {
    setIsFormOpen(false)
    setEditingMemberId(null)
    setName('')
    setEmail('')
    setRole('Developer')
    setStatus('Active')
  }

  function openAddForm() {
    resetForm()
    setIsFormOpen(true)
  }

  function openEditForm(member: {
    id: string
    name: string
    email: string
    role: TeamRole
    status: TeamMemberStatus
  }) {
    setEditingMemberId(member.id)
    setName(member.name)
    setEmail(member.email)
    setRole(member.role)
    setStatus(member.status)
    setIsFormOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields: EditableTeamMemberFields = {
      name: name.trim(),
      email: email.trim(),
      role,
      status,
    }

    if (editingMemberId) {
      updateMutation.mutate({id: editingMemberId,fields, })
    } else {
      createMutation.mutate(fields)
    }
  }

  function handleDelete(id: string, memberName: string) {
    const confirmed = window.confirm(`Are you sure you want to delete ${memberName}?`,)
    if (confirmed) { deleteMutation.mutate(id) }
  }

  const filteredMembers = teamMembers.filter((member) => {
    const search = searchTerm.toLowerCase().trim()
    const matchesSearch = member.name.toLowerCase().includes(search) || member.email.toLowerCase().includes(search)
    const matchesRole = roleFilter === 'All' || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const activeMembers = teamMembers.filter((member) => member.status === 'Active',).length
  const administrators = teamMembers.filter((member) => member.role === 'Admin',).length
  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Members</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your team and its members.</p>
        </div>

        <button type="button" onClick={openAddForm} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Members" value={teamMembers.length} icon={<Users size={22} />} iconClass="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" />
        <StatCard title="Active Members" value={activeMembers} icon={<Users size={22} />} iconClass="bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" />
        <StatCard title="Administrators" value={administrators} icon={<ShieldCheck size={22} />} iconClass="bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" />
      </section>

      {/* Add / Edit form */}
      {isFormOpen && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
            {editingMemberId ? 'Edit Member' : 'Add New Member'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="member-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </label>

                <input
                  id="member-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter full name"
                  required
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                />
              </div>

              <div>
                <label htmlFor="member-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>

                <input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                  maxLength={254}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                />
              </div>

              <div>
                <label htmlFor="member-role" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Role
                </label>

                <select id="member-role" value={role} onChange={(event) => setRole(event.target.value as TeamRole)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  {roles.map((item) => ( <option key={item} value={item}>{item}</option> ))}
                </select>
              </div>

              <div>
                <label htmlFor="member-status" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>

                <select id="member-status" value={status} onChange={(event) => setStatus(event.target.value as TeamMemberStatus)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  {statuses.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <p role="alert" className="text-sm text-red-600">Failed to save the member. Please try again.</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isSaving
                  ? 'Saving...'
                  : editingMemberId
                    ? 'Save Changes'
                    : 'Add Member'}
              </button>
              <button type="button" onClick={resetForm} disabled={isSaving} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Search and filter */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search team members"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role"className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <option value="All">All Roles</option>
          {roles.map((item) => ( <option key={item} value={item}>{item}</option>))}
        </select>
      </section>

      {/* Members list */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Team Directory</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filteredMembers.length} members found</p>
        </div>

        {isLoading ? (<div className="p-8 text-center text-sm text-slate-500">Loading team members...</div>)
          : isError ? (
            <div role="alert" className="p-8 text-center text-sm text-red-600">
              {error instanceof Error ? error.message : 'Failed to load team members. Make sure JSON Server is running.'}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={32} className="mx-auto mb-3 text-slate-400" />
              <p className="font-medium text-slate-700 dark:text-slate-300"> No team members found</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try another search or change the role filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredMembers.map((member) => (
                <article key={member.id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/50">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {member.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {member.role}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${member.status === 'Active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(member)}
                      disabled={deleteMutation.isPending || isSaving}
                      aria-label={`Edit ${member.name}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(member.id, member.name)}
                      disabled={deleteMutation.isPending || isSaving}
                      aria-label={`Delete ${member.name}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

        {deleteMutation.isError && (
          <p role="alert" className="border-t border-red-200 p-4 text-sm text-red-600 dark:border-red-900">
            Failed to delete the member. Please try again.
          </p>
        )}
      </section>
    </main>
  )
}

type StatCardProps = {
  title: string
  value: number
  icon: React.ReactNode
  iconClass: string
}

function StatCard({title,value,icon,iconClass,}: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className={`rounded-lg p-2.5 ${iconClass}`}>{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </article>
  )
}