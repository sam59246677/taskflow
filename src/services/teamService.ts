
export type TeamRole ='Admin'| 'Project Manager'| 'Developer'| 'Designer'
export type TeamMemberStatus = 'Active' | 'Away'

export type TeamMember = {
  id: string
  name: string
  email: string
  role: TeamRole
  status: TeamMemberStatus
}

export type EditableTeamMemberFields = Pick<TeamMember,'name' | 'email' | 'role' | 'status'>
const API_URL = 'http://localhost:3001/teamMembers'

export async function getTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch(API_URL)
  if (!response.ok) { throw new Error('Failed to fetch team members')}
  return response.json() as Promise<TeamMember[]>
}

export async function createTeamMember(member: EditableTeamMemberFields,): Promise<TeamMember> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(member),
  })
  if (!response.ok) {throw new Error('Failed to create team member')}
  return response.json() as Promise<TeamMember>
}

export async function updateTeamMember(id: string, fields: EditableTeamMemberFields,): Promise<TeamMember> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(fields),
  })
  if (!response.ok) { throw new Error('Failed to update team member')}
  return response.json() as Promise<TeamMember>
}

export async function deleteTeamMember(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete team member')
  }
}