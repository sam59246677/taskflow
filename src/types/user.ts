
export type UserRole =
  | 'Admin'
  | 'Project Manager'
  | 'Developer'
  | 'Designer'

export type StoredUser = {
  name: string
  email: string
  password: string
  role: UserRole
}
