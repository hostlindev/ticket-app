import http, { type ApiResponse } from '@core/api/http'
import { USE_MOCK } from '@core/api/config'
import type { ManagedUser, UserInput } from '../interface/user.interface'

const MOCK_USERS: ManagedUser[] = [
  { id: 'usr_ada', name: 'Ada Lovelace', email: 'admin@ticket.dev', role: 'admin', department: 'Frontend & Web Platforms', specialty: 'Plataforma', systemsCount: 3, resolvedCount: 12 },
  { id: 'usr_linus', name: 'Linus Torvalds', email: 'linus@ticket.dev', role: 'developer', department: 'Core Backend & APIs', specialty: 'Backend', systemsCount: 1, resolvedCount: 8 },
  { id: 'usr_margaret', name: 'Margaret Hamilton', email: 'margaret@ticket.dev', role: 'agent', department: 'QA & Reliability', specialty: 'QA', systemsCount: 1, resolvedCount: 5 },
  { id: 'usr_tim', name: 'Tim Berners-Lee', email: 'tim@ticket.dev', role: 'developer', department: 'Frontend & Web Platforms', specialty: 'Frontend', systemsCount: 1, resolvedCount: 0 },
]

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function duplicatedEmail(email: string, ignoreId?: string): boolean {
  const value = email.trim().toLowerCase()
  return MOCK_USERS.some((u) => u.id !== ignoreId && u.email.toLowerCase() === value)
}

/** Equivale a `GET /users`. */
export async function getUsers(): Promise<ManagedUser[]> {
  if (!USE_MOCK) {
    const { data: body } = await http.get<ApiResponse<ManagedUser[]>>('/users')
    return body.data
  }

  await delay(250)
  return MOCK_USERS.map((u) => ({ ...u }))
}

/** Equivale a `POST /users`. */
export async function createUser(input: UserInput): Promise<ManagedUser> {
  if (!USE_MOCK) {
    const { data: body } = await http.post<ApiResponse<ManagedUser>>('/users', input)
    return body.data
  }

  await delay(350)
  if (duplicatedEmail(input.email)) throw new Error('Ya existe un usuario con ese correo.')
  const user: ManagedUser = {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    department: input.department || null,
    specialty: input.specialty || null,
    systemsCount: 0,
    resolvedCount: 0,
  }
  MOCK_USERS.push(user)
  return { ...user }
}

/** Equivale a `PUT /users/:id`. */
export async function updateUser(id: string, input: UserInput): Promise<ManagedUser> {
  if (!USE_MOCK) {
    const { data: body } = await http.put<ApiResponse<ManagedUser>>(`/users/${encodeURIComponent(id)}`, input)
    return body.data
  }

  await delay(350)
  const user = MOCK_USERS.find((u) => u.id === id)
  if (!user) throw new Error('El usuario ya no existe.')
  if (duplicatedEmail(input.email, id)) throw new Error('Ya existe un usuario con ese correo.')
  Object.assign(user, {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    department: input.department || null,
    specialty: input.specialty || null,
  })
  return { ...user }
}

/** Equivale a `DELETE /users/:id` (soft delete: sus incidencias resueltas se conservan). */
export async function deleteUser(id: string): Promise<void> {
  if (!USE_MOCK) {
    await http.delete(`/users/${encodeURIComponent(id)}`)
    return
  }

  await delay(300)
  const index = MOCK_USERS.findIndex((u) => u.id === id)
  if (index === -1) throw new Error('El usuario ya no existe.')
  MOCK_USERS.splice(index, 1)
}
