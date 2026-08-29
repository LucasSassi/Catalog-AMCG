import type {
  CreateUsuarioData,
  IUsuarioRepositoryWrite,
  UpdateUsuarioData,
} from "../../../domain/usuario/repository/usuario.repository.write";
import type { Usuario } from "../../../domain/usuario/entity/usuario.entity";
import { UsuarioModel } from "../../db/mongo/models/usuario.model";
import { toUsuarioEntity } from "./adapters/usuario.adapter";

export class UsuarioRepositoryWrite implements IUsuarioRepositoryWrite {
  async create(data: CreateUsuarioData): Promise<Usuario> {
    const document = await UsuarioModel.create({
      nome: data.nome,
      email: data.email.toLowerCase().trim(),
      senhaHash: data.senhaHash,
    });
    return toUsuarioEntity(document);
  }

  async update(id: string, data: UpdateUsuarioData): Promise<Usuario | null> {
    const payload: UpdateUsuarioData = { ...data };

    if (payload.email) {
      payload.email = payload.email.toLowerCase().trim();
    }

    const document = await UsuarioModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).exec();

    return document ? toUsuarioEntity(document) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UsuarioModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
