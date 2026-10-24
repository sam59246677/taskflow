
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { StoredUser } from '../types/user'

type LoginProps = {
  onLogin: (email: string) => void
}

function Login({ onLogin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()

    const users: StoredUser[] = JSON.parse(
      localStorage.getItem('taskflow-users') ?? '[]',
    )

    if (isRegistering) {
      if (!name.trim()) {
        setError('Please enter your name.')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }

      const userExists = users.some(
        (user) => user.email === normalizedEmail,
      )

      if (userExists) {
        setError('An account with this email already exists.')
        return
      }

      const newUser: StoredUser = {
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'Developer',
      }

      localStorage.setItem(
        'taskflow-users',
        JSON.stringify([...users, newUser]),
      )

      onLogin(normalizedEmail)
      return
    }

    const existingUser = users.find(
      (user) =>
        user.email === normalizedEmail &&
        user.password === password,
    )

    if (!existingUser) {
      setError('Invalid email or password.')
      return
    }

    onLogin(existingUser.email)
  }

  function switchMode() {
    setIsRegistering((current) => !current)
    setError('')
    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">TaskFlow</h1>
          <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
            {isRegistering ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isRegistering ? 'Create your account to get started.' : 'Sign in to continue to your workspace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full name
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isRegistering ? 'At least 6 characters' : 'Enter your password'}
              minLength={isRegistering ? 6 : undefined}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {error && (<p role="alert" className="text-sm text-red-600">{error}</p>)}
          <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700">
            {isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" onClick={switchMode} className="font-medium text-blue-600 hover:text-blue-700">
            {isRegistering ? 'Sign in' : 'Register'}
          </button>
        </p>
      </section>
    </main>
  )
}
export default Login