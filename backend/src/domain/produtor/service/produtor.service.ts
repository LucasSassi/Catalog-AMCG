import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../common/errors/app-error";
import {
  CNPJ_LENGTH,
  CPF_LENGTH,
  E164_PHONE_REGEX,
  REGISTRO_PRODUTOR_TIPO,
  STATUS_PRODUTOR,
  TIPO_DOCUMENTO,
  isUfBrasil,
  type RegistroProdutorTipo,
  type StatusProdutor,
  type TipoDocumento,
} from "../entity/produtor.constants";
import type { IProdutorService } from "../entity/interfaces/produtor.service.interface";
import type {
  AtualizarProdutorInput,
  CadastrarProdutorInput,
  Contato,
  Documento,
  Endereco,
  ListarProdutoresFiltros,
  Produtor,
  RegistroProdutor,
} from "../entity/produtor.entity";
import type { IProdutorRepositoryRead } from "../repository/produtor.repository.read";
import type { IProdutorRepositoryWrite } from "../repository/produtor.repository.write";

export interface ProdutorServiceDeps {
  readRepository: IProdutorRepositoryRead;
  writeRepository: IProdutorRepositoryWrite;
}

export class ProdutorService implements IProdutorService {
  private readonly readRepository: IProdutorRepositoryRead;
  private readonly writeRepository: IProdutorRepositoryWrite;

  constructor(deps: ProdutorServiceDeps) {
    this.readRepository = deps.readRepository;
    this.writeRepository = deps.writeRepository;
  }

  async create(input: CadastrarProdutorInput): Promise<Produtor> {
    const nomeEmpresa = this.assertNomeEmpresa(input.nomeEmpresa);
    const municipioId = this.assertMunicipioId(input.municipioId);
    const documento = this.normalizeDocumento(input.documento);
    const registros = this.normalizeRegistros(input.registros);
    const contato = this.normalizeContato(input.contato);
    const endereco = this.normalizeEndereco(input.endereco);

    await this.assertDocumentoDisponivel(documento.numero);
    await this.assertRegistrosDisponiveis(registros.map((r) => r.numero));

    return this.writeRepository.create({
      nomeEmpresa,
      municipioId,
      documento,
      registros,
      contato,
      endereco,
      ativo: true,
      status: "PENDENTE",
    });
  }

  async list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]> {
    if (filtros?.status !== undefined) {
      this.assertStatus(filtros.status);
    }
    return this.readRepository.list(filtros);
  }

  async getById(id: string): Promise<Produtor> {
    const produtor = await this.readRepository.findById(id);

    if (!produtor) {
      throw new NotFoundError("Produtor não encontrado");
    }

    return produtor;
  }

  async update(id: string, input: AtualizarProdutorInput): Promise<Produtor> {
    if (
      input.nomeEmpresa === undefined &&
      input.municipioId === undefined &&
      input.documento === undefined &&
      input.registros === undefined &&
      input.contato === undefined &&
      input.endereco === undefined
    ) {
      throw new ValidationError("Nenhum campo para atualizar");
    }

    const atual = await this.readRepository.findById(id);

    if (!atual) {
      throw new NotFoundError("Produtor não encontrado");
    }

    const data: {
      nomeEmpresa?: string;
      municipioId?: string;
      documento?: Documento;
      registros?: RegistroProdutor[];
      contato?: Contato;
      endereco?: Endereco;
    } = {};

    if (input.nomeEmpresa !== undefined) {
      data.nomeEmpresa = this.assertNomeEmpresa(input.nomeEmpresa);
    }

    if (input.municipioId !== undefined) {
      data.municipioId = this.assertMunicipioId(input.municipioId);
    }

    if (input.documento !== undefined) {
      const documento = this.normalizeDocumento(input.documento);
      if (documento.numero !== atual.documento.numero) {
        await this.assertDocumentoDisponivel(documento.numero);
      }
      data.documento = documento;
    }

    if (input.registros !== undefined) {
      const registros = this.normalizeRegistros(input.registros);
      const numerosAtuais = new Set(atual.registros.map((r) => r.numero));
      const novosNumeros = registros
        .map((r) => r.numero)
        .filter((numero) => !numerosAtuais.has(numero));
      await this.assertRegistrosDisponiveis(novosNumeros);
      data.registros = registros;
    }

    if (input.contato !== undefined) {
      data.contato = this.normalizeContato(input.contato);
    }

    if (input.endereco !== undefined) {
      data.endereco = this.normalizeEndereco(input.endereco);
    }

    const atualizado = await this.writeRepository.update(id, data);

    if (!atualizado) {
      throw new NotFoundError("Produtor não encontrado");
    }

    return atualizado;
  }

  async remove(id: string): Promise<void> {
    const atual = await this.readRepository.findById(id);

    if (!atual) {
      throw new NotFoundError("Produtor não encontrado");
    }

    if (!atual.ativo) {
      return;
    }

    const atualizado = await this.writeRepository.softDelete(id);

    if (!atualizado) {
      throw new NotFoundError("Produtor não encontrado");
    }
  }

  private async assertDocumentoDisponivel(numero: string): Promise<void> {
    const existing = await this.readRepository.findByDocumentoNumero(numero);
    if (existing) {
      throw new ConflictError("Documento já cadastrado");
    }
  }

  private async assertRegistrosDisponiveis(numeros: string[]): Promise<void> {
    const unique = new Set<string>();

    for (const numero of numeros) {
      if (unique.has(numero)) {
        throw new ValidationError(
          "Números de registro duplicados no mesmo cadastro",
        );
      }
      unique.add(numero);

      const existing = await this.readRepository.findByRegistroNumero(numero);
      if (existing) {
        throw new ConflictError("Número de registro já cadastrado");
      }
    }
  }

  private assertNomeEmpresa(nomeEmpresa: string): string {
    const trimmed = nomeEmpresa.trim();
    if (!trimmed) {
      throw new ValidationError("Nome da empresa é obrigatório");
    }
    return trimmed;
  }

  private assertMunicipioId(municipioId: string): string {
    const trimmed = municipioId.trim();
    if (!trimmed) {
      throw new ValidationError("Município é obrigatório");
    }
    return trimmed;
  }

  private normalizeDocumento(documento: Documento): Documento {
    if (!TIPO_DOCUMENTO.includes(documento.tipo)) {
      throw new ValidationError("Tipo de documento inválido");
    }

    let numero = documento.numero.trim();

    if (documento.tipo === "CPF" || documento.tipo === "CNPJ") {
      numero = numero.replace(/\D/g, "");
      const expected =
        documento.tipo === "CPF" ? CPF_LENGTH : CNPJ_LENGTH;
      if (numero.length !== expected) {
        throw new ValidationError(
          `${documento.tipo} deve ter ${expected} dígitos`,
        );
      }
    } else {
      if (!numero) {
        throw new ValidationError("Número do documento é obrigatório");
      }
    }

    return { tipo: documento.tipo as TipoDocumento, numero };
  }

  private normalizeRegistros(registros: RegistroProdutor[]): RegistroProdutor[] {
    if (!Array.isArray(registros) || registros.length === 0) {
      throw new ValidationError("Ao menos um registro é obrigatório");
    }

    return registros.map((registro) => this.normalizeRegistro(registro));
  }

  private normalizeRegistro(registro: RegistroProdutor): RegistroProdutor {
    if (!REGISTRO_PRODUTOR_TIPO.includes(registro.tipo)) {
      throw new ValidationError("Tipo de registro inválido");
    }

    const numero = registro.numero.trim();
    if (!numero) {
      throw new ValidationError("Número do registro é obrigatório");
    }

    if (registro.tipo === "Outro") {
      const tipoOutros = registro.tipoOutros?.trim();
      if (!tipoOutros) {
        throw new ValidationError(
          "tipoOutros é obrigatório quando o tipo for Outro",
        );
      }
      return {
        tipo: "Outro",
        tipoOutros,
        numero,
        ...(registro.dataEmissao !== undefined
          ? { dataEmissao: registro.dataEmissao }
          : {}),
        ...(registro.dataValidade !== undefined
          ? { dataValidade: registro.dataValidade }
          : {}),
      };
    }

    return {
      tipo: registro.tipo as RegistroProdutorTipo,
      numero,
      ...(registro.dataEmissao !== undefined
        ? { dataEmissao: registro.dataEmissao }
        : {}),
      ...(registro.dataValidade !== undefined
        ? { dataValidade: registro.dataValidade }
        : {}),
    };
  }

  private normalizeContato(contato: Contato): Contato {
    const telefone = contato.telefone.trim();
    if (!E164_PHONE_REGEX.test(telefone)) {
      throw new ValidationError(
        "Telefone deve estar no formato E.164 (ex.: +5542999999999)",
      );
    }

    const email = contato.email.toLowerCase().trim();
    if (!email || !email.includes("@")) {
      throw new ValidationError("E-mail inválido");
    }

    return { telefone, email };
  }

  private normalizeEndereco(endereco: Endereco): Endereco {
    const rua = endereco.rua.trim();
    const bairro = endereco.bairro.trim();
    const cidade = endereco.cidade.trim();
    const estado = endereco.estado;

    if (!rua) {
      throw new ValidationError("Rua é obrigatória");
    }
    if (!bairro) {
      throw new ValidationError("Bairro é obrigatório");
    }
    if (!cidade) {
      throw new ValidationError("Cidade é obrigatória");
    }
    if (!isUfBrasil(estado)) {
      throw new ValidationError("Estado (UF) inválido");
    }

    return {
      rua,
      bairro,
      cidade,
      estado,
    };
  }

  private assertStatus(status: StatusProdutor): void {
    if (!STATUS_PRODUTOR.includes(status)) {
      throw new ValidationError("Status inválido");
    }
  }
}
