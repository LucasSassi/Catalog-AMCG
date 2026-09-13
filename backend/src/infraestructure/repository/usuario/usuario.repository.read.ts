import type { IUsuarioRepositoryRead } from "../../../domain/usuario/repository/usuario.repository.read";
import type { Usuario } from "../../../domain/usuario/entity/usuario.entity";
import { UsuarioModel } from "../../db/mongo/models/usuario.model";
import { toUsuarioEntity } from "./adapters/usuario.adapter";

export class UsuarioRepositoryRead implements IUsuarioRepositoryRead {
  async findById(id: string): Promise<Usuario | null> {
    const document = await UsuarioModel.findById(id).exec();
    return document ? toUsuarioEntity(document) : null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const document = await UsuarioModel.findOne({
      email: email.toLowerCase().trim(),
    }).exec();
    return document ? toUsuarioEntity(document) : null;
  }

  async list(): Promise<Usuario[]> {
    const documents = await UsuarioModel.find().sort({ createdAt: -1 }).exec();
    return documents.map(toUsuarioEntity);
  }
}
