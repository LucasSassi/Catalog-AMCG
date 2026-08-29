import { UsuarioService } from "../../domain/usuario/service/usuario.service";
import { UsuarioRepositoryRead } from "../../infraestructure/repository/usuario/usuario.repository.read";
import { UsuarioRepositoryWrite } from "../../infraestructure/repository/usuario/usuario.repository.write";

export function createUsuarioService(jwtSecret: string): UsuarioService {
  return new UsuarioService({
    readRepository: new UsuarioRepositoryRead(),
    writeRepository: new UsuarioRepositoryWrite(),
    jwtSecret,
  });
}
