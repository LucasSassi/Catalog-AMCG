export interface LoginCredentials {
  email: string
  senha: string
}

export interface RegisterCredentials {
  nome: string
  email: string
  senha: string
}

export type AuthUserRole = 'admin' | 'usuario'

export interface AuthUser {
  id: string
  nome: string
  email: string
  role: AuthUserRole
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  usuario: AuthUser
  token: string
}
