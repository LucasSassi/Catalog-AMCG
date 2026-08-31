export interface LoginCredentials {
  email: string
  senha: string
}

export interface RegisterCredentials {
  nome: string
  email: string
  senha: string
}

export interface AuthUser {
  id: string
  nome: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  usuario: AuthUser
  token: string
}
