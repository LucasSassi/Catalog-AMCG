import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../common/errors/app-error";
import {
  CNPJ_LENGTH,
  CONTENT_TYPES_IMAGEM,
  CPF_LENGTH,
  E164_PHONE_REGEX,
  MAX_DESTAQUES,
  MAX_FOTOS,
  MAX_HISTORIA_LENGTH,
  MAX_REDES_SOCIAIS,
  MIN_FOTOS,
  REGISTRO_PRODUTOR_TIPO,
  STATUS_PRODUTOR,
  TIPO_DOCUMENTO,
  isTipoRedeSocial,
  isUfBrasil,
  type RegistroProdutorTipo,
  type StatusProdutor,
  type TipoDocumento,
  type TipoRedeSocial,
} from "../entity/produtor.constants";
import type { IProdutorService } from "../entity/interfaces/produtor.service.interface";
import type {
  Arquivo,
  AtualizarProdutorInput,
  CadastrarProdutorInput,
  CatalogoDestaquesProdutores,
  CatalogoProdutores,
  Contato,
  Documento,
  Endereco,
  ListarProdutoresFiltros,
  Produtor,
  ProdutorCatalogo,
  RedeSocialItem,
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
    const historia = this.assertHistoria(input.historia);
    const logo = this.normalizeArquivo(input.logo);
    const fotos = this.normalizeFotos(input.fotos);
    const redesSociais = this.normalizeRedesSociais(input.redesSociais);
    const site = this.normalizeOptionalSite(input.site);

    await this.assertDocumentoDisponivel(documento.numero);
    await this.assertRegistrosDisponiveis(registros.map((r) => r.numero));

    return this.writeRepository.create({
      nomeEmpresa,
      municipioId,
      documento,
      registros,
      contato,
      endereco,
      historia,
      logo,
      fotos,
      redesSociais,
      ...(site !== undefined ? { site } : {}),
      ativo: true,
      status: "PENDENTE",
      destaque: false,
    });
  }

  async list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]> {
    if (filtros?.status !== undefined) {
      this.assertStatus(filtros.status);
    }
    return this.readRepository.list(filtros);
  }

  async listCatalog(): Promise<CatalogoProdutores> {
    const produtores = await this.readRepository.list({
      ativo: true,
      status: "APROVADO",
    });

    return {
      produtores: produtores.map((produtor) => this.toProdutorCatalogo(produtor)),
    };
  }

  async listDestaques(): Promise<CatalogoDestaquesProdutores> {
    const manuais = await this.readRepository.listLimited(
      {
        ativo: true,
        status: "APROVADO",
        destaque: true,
      },
      MAX_DESTAQUES,
    );
    const selecionados = manuais.map((produtor) =>
      this.toProdutorCatalogo(produtor),
    );

    if (selecionados.length >= MAX_DESTAQUES) {
      return { produtores: selecionados };
    }

    const aleatorios = await this.readRepository.sampleApproved(
      selecionados.map((produtor) => produtor.id),
      MAX_DESTAQUES - selecionados.length,
    );

    return {
      produtores: [
        ...selecionados,
        ...aleatorios.map((produtor) => this.toProdutorCatalogo(produtor)),
      ],
    };
  }

  async getCatalogById(id: string): Promise<ProdutorCatalogo> {
    const produtor = await this.readRepository.findById(id);

    if (!produtor || !produtor.ativo || produtor.status !== "APROVADO") {
      throw new NotFoundError("Produtor não encontrado");
    }

    return this.toProdutorCatalogo(produtor);
  }

  async getById(id: string): Promise<Produtor> {
    const produtor = await this.readRepository.findById(id);

    if (!produtor) {
      throw new NotFoundError("Produtor não encontrado");
    }

    return produtor;
  }

  async setDestaque(id: string, destaque: boolean): Promise<Produtor> {
    const atual = await this.readRepository.findById(id);

    if (!atual) {
      throw new NotFoundError("Produtor não encontrado");
    }

    if (!atual.ativo) {
      throw new ValidationError("Produtor inativo não pode ser destacado");
    }

    if (atual.status !== "APROVADO") {
      throw new ValidationError(
        "Somente produtores aprovados podem ser destacados",
      );
    }

    if (destaque && !atual.destaque) {
      const total = await this.readRepository.countDestaques();
      if (total >= MAX_DESTAQUES) {
        throw new ValidationError(
          "Limite de 3 destaques atingido — remova um destaque antes",
        );
      }
    }

    const atualizado = await this.writeRepository.update(id, { destaque });

    if (!atualizado) {
      throw new NotFoundError("Produtor não encontrado");
    }

    return atualizado;
  }

  async update(id: string, input: AtualizarProdutorInput): Promise<Produtor> {
    if (
      input.nomeEmpresa === undefined &&
      input.municipioId === undefined &&
      input.documento === undefined &&
      input.registros === undefined &&
      input.contato === undefined &&
      input.endereco === undefined &&
      input.historia === undefined &&
      input.logo === undefined &&
      input.fotos === undefined &&
      input.redesSociais === undefined &&
      input.site === undefined &&
      input.status === undefined &&
      input.motivoRejeicao === undefined
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
      historia?: string;
      logo?: Arquivo;
      fotos?: Arquivo[];
      redesSociais?: RedeSocialItem[];
      site?: string | null;
      status?: StatusProdutor;
      motivoRejeicao?: string | null;
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

    if (input.historia !== undefined) {
      data.historia = this.assertHistoria(input.historia);
    }

    if (input.logo !== undefined) {
      data.logo = this.normalizeArquivo(input.logo);
    }

    if (input.fotos !== undefined) {
      data.fotos = this.normalizeFotos(input.fotos);
    }

    if (input.redesSociais !== undefined) {
      data.redesSociais = this.normalizeRedesSociais(input.redesSociais);
    }

    if (input.site !== undefined) {
      data.site =
        input.site === null
          ? null
          : (this.normalizeOptionalSite(input.site) ?? null);
    }

    if (input.status !== undefined) {
      this.assertStatus(input.status);
      data.status = input.status;

      if (input.status === "REJEITADO") {
        const motivo =
          input.motivoRejeicao?.trim() ?? atual.motivoRejeicao?.trim();
        if (!motivo) {
          throw new ValidationError("Motivo da rejeição é obrigatório");
        }
        data.motivoRejeicao = motivo;
      } else {
        data.motivoRejeicao = null;
      }
    } else if (input.motivoRejeicao !== undefined) {
      throw new ValidationError(
        "Motivo da rejeição só pode ser informado quando o status for REJEITADO",
      );
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

  private toProdutorCatalogo(produtor: Produtor): ProdutorCatalogo {
    return {
      id: produtor.id,
      nome: produtor.nomeEmpresa,
      municipio: produtor.endereco.cidade,
      telefone: produtor.contato.telefone,
      destaque: produtor.destaque,
      historia: produtor.historia,
      ...(produtor.logo !== undefined ? { logo: produtor.logo } : {}),
      fotos: produtor.fotos,
      endereco: {
        bairro: produtor.endereco.bairro,
        cidade: produtor.endereco.cidade,
        estado: produtor.endereco.estado,
      },
      redesSociais: produtor.redesSociais,
      ...(produtor.site !== undefined ? { site: produtor.site } : {}),
    };
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

  private assertHistoria(historia: string): string {
    const trimmed = historia.trim();
    if (!trimmed) {
      throw new ValidationError("História do produtor é obrigatória");
    }
    if (trimmed.length > MAX_HISTORIA_LENGTH) {
      throw new ValidationError(
        `História deve ter no máximo ${MAX_HISTORIA_LENGTH} caracteres`,
      );
    }
    return trimmed;
  }

  private normalizeFotos(fotos: Arquivo[]): Arquivo[] {
    if (!Array.isArray(fotos)) {
      throw new ValidationError("Fotos inválidas");
    }

    if (fotos.length < MIN_FOTOS || fotos.length > MAX_FOTOS) {
      throw new ValidationError(
        `Fotos deve ter entre ${MIN_FOTOS} e ${MAX_FOTOS} itens`,
      );
    }

    return fotos.map((foto) => this.normalizeArquivo(foto));
  }

  private normalizeArquivo(arquivo: Arquivo): Arquivo {
    const url = arquivo.url.trim();
    const contentType = arquivo.contentType.trim().toLowerCase();
    const nomeOriginal = arquivo.nomeOriginal.trim();

    if (!url) {
      throw new ValidationError("URL do arquivo é obrigatória");
    }

    try {
      new URL(url);
    } catch {
      throw new ValidationError("URL do arquivo inválida");
    }

    if (!(CONTENT_TYPES_IMAGEM as readonly string[]).includes(contentType)) {
      throw new ValidationError("Tipo de conteúdo do arquivo inválido");
    }

    if (!nomeOriginal) {
      throw new ValidationError("Nome original do arquivo é obrigatório");
    }

    return { url, contentType, nomeOriginal };
  }

  private normalizeRedesSociais(
    redesSociais: RedeSocialItem[] | undefined,
  ): RedeSocialItem[] {
    if (redesSociais === undefined) {
      return [];
    }

    if (!Array.isArray(redesSociais)) {
      throw new ValidationError("Redes sociais inválidas");
    }

    if (redesSociais.length > MAX_REDES_SOCIAIS) {
      throw new ValidationError(
        `Máximo de ${MAX_REDES_SOCIAIS} redes sociais`,
      );
    }

    const tipos = new Set<TipoRedeSocial>();

    return redesSociais.map((rede) => {
      if (!isTipoRedeSocial(rede.tipo)) {
        throw new ValidationError("Tipo de rede social inválido");
      }

      if (tipos.has(rede.tipo)) {
        throw new ValidationError(
          "Não é permitido cadastrar o mesmo tipo de rede social mais de uma vez",
        );
      }
      tipos.add(rede.tipo);

      const handle = rede.handle.trim();
      if (!handle) {
        throw new ValidationError("Handle da rede social é obrigatório");
      }

      return { tipo: rede.tipo, handle };
    });
  }

  private normalizeOptionalText(value?: string): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed || undefined;
  }

  private normalizeOptionalSite(value?: string): string | undefined {
    const trimmed = this.normalizeOptionalText(value);
    if (trimmed === undefined) {
      return undefined;
    }

    try {
      new URL(trimmed);
    } catch {
      throw new ValidationError("Site inválido");
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
