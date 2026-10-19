export const USUARIO_COLLECTION = "usuarios";
export const BCRYPT_SALT_ROUNDS = 10;
export const JWT_EXPIRES_IN = "8h";
export const MIN_SENHA_LENGTH = 6;

export const ROLE_USUARIO = ["admin", "usuario"] as const;
export type RoleUsuario = (typeof ROLE_USUARIO)[number];
export const ROLE_PADRAO: RoleUsuario = "usuario";
