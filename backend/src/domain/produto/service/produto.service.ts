import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../common/errors/app-error";
import type { IProdutorRepositoryRead } from "../../produtor/repository/produtor.repository.read";
import {
  ANO_MIN,
  CATEGORIA_PRODUTO,
  CONTENT_TYPES_COMPROVANTE,
  CONTENT_TYPES_IMAGEM,
  MAX_FOTOS,
  MAX_REGISTROS,
  MIN_FOTOS,
  MIN_REGISTROS,
  REGISTRO_PRODUTO_TIPO,
  STATUS_PRODUTO,
  UNIDADE_MEDIDA,
  isCategoriaProduto,
  isUnidadeMedida,
  listCategoriasProduto,
  type CategoriaProduto,
  type RegistroProdutoTipo,
  type StatusProduto,
  type UnidadeMedida,
} from "../entity/produto.constants";
import type { IProdutoService } from "../entity/interfaces/produto.service.interface";
import type {
  Arquivo,
  AtualizarProdutoInput,
  CatalogoFiltros,
  CatalogoProdutos,
  CadastrarProdutoInput,
  ListarProdutosFiltros,
  Premiacao,
  Produto,
  RegistroProduto,
} from "../entity/produto.entity";
import type { IProdutoRepositoryRead } from "../repository/produto.repository.read";
import type { IProdutoRepositoryWrite } from "../repository/produto.repository.write";

export interface ProdutoServiceDeps {
  readRepository: IProdutoRepositoryRead;
  writeRepository: IProdutoRepositoryWrite;
  produtorReadRepository: IProdutorRepositoryRead;
}

export class ProdutoService implements IProdutoService {
  private readonly readRepository: IProdutoRepositoryRead;
  private readonly writeRepository: IProdutoRepositoryWrite;
  private readonly produtorReadRepository: IProdutorRepositoryRead;

  constructor(deps: ProdutoServiceDeps) {
    this.readRepository = deps.readRepository;
    this.writeRepository = deps.writeRepository;
    this.produtorReadRepository = deps.produtorReadRepository;
  }

  async create(input: CadastrarProdutoInput): Promise<Produto> {
    const produtorId = this.assertProdutorId(input.produtorId);
    await this.assertProdutorAprovado(produtorId);

    const nome = this.assertNome(input.nome);
    const descricao = this.assertDescricao(input.descricao);
    const categoria = this.assertCategoria(input.categoria);
    const unidadeMedida = this.assertUnidadeMedida(input.unidadeMedida);
    const registros = this.normalizeRegistros(input.registros);
    const fotosAvaliacao = this.normalizeFotos(
      input.fotosAvaliacao,
      "fotosAvaliacao",
    );
    const fotosDivulgacao = this.normalizeFotos(
      input.fotosDivulgacao,
      "fotosDivulgacao",
    );
    const premiacoes = this.normalizePremiacoes(input.premiacoes);
    const valorCentavos = this.assertValorCentavos(input.valorCentavos);
    const observacoes = this.normalizeObservacoes(input.observacoes);

    await this.assertRegistrosDisponiveis(registros.map((r) => r.numero));

    return this.writeRepository.create({
      produtorId,
      nome,
      descricao,
      categoria,
      unidadeMedida,
      registros,
      fotosAvaliacao,
      fotosDivulgacao,
      premiacoes,
      valorCentavos,
      ...(observacoes !== undefined ? { observacoes } : {}),
      ativo: true,
      status: "PENDENTE",
    });
  }

  async listCatalog(filtros: CatalogoFiltros = {}): Promise<CatalogoProdutos> {
    const categoria =
      filtros.categoria !== undefined
        ? this.assertCategoria(filtros.categoria)
        : undefined;
    const produtos = await this.readRepository.list({
      ativo: true,
      status: "APROVADO",
      ...(categoria !== undefined ? { categoria } : {}),
    });
    const produtores = await this.produtorReadRepository.list({
      ativo: true,
      status: "APROVADO",
    });
    const produtoresPorId = new Map(
      produtores.map((produtor) => [produtor.id, produtor]),
    );
    const busca = this.normalizeCatalogText(filtros.busca);
    const municipio = filtros.municipio?.trim();

    const produtosCatalogo = produtos.flatMap((produto) => {
      const produtor = produtoresPorId.get(produto.produtorId);
      const fotoDivulgacao = produto.fotosDivulgacao[0];

      if (!produtor || !fotoDivulgacao) {
        return [];
      }

      if (municipio && produtor.endereco.cidade !== municipio) {
        return [];
      }

      if (busca) {
        const conteudo = this.normalizeCatalogText(
          `${produto.nome} ${produto.descricao} ${produtor.nomeEmpresa}`,
        );

        if (!conteudo.includes(busca)) {
          return [];
        }
      }

      return [
        {
          id: produto.id,
          nome: produto.nome,
          descricao: produto.descricao,
          categoria: produto.categoria,
          unidadeMedida: produto.unidadeMedida,
          valorCentavos: produto.valorCentavos,
          fotoDivulgacao,
          produtor: {
            id: produtor.id,
            nome: produtor.nomeEmpresa,
            municipio: produtor.endereco.cidade,
            telefone: produtor.contato.telefone,
          },
        },
      ];
    });

    const municipios = [
      ...new Set(
        produtores
          .map((produtor) => produtor.endereco.cidade)
          .filter((cidade) => cidade.length > 0),
      ),
    ].sort((cidadeA, cidadeB) => cidadeA.localeCompare(cidadeB, "pt-BR"));

    return {
      produtos: produtosCatalogo,
      categorias: [...listCategoriasProduto()],
      municipios,
    };
  }

  async list(filtros?: ListarProdutosFiltros): Promise<Produto[]> {
    if (filtros?.status !== undefined) {
      this.assertStatus(filtros.status);
    }

    if (filtros?.categoria !== undefined && !isCategoriaProduto(filtros.categoria)) {
      throw new ValidationError("Categoria inválida");
    }

    if (filtros?.produtorId !== undefined) {
      this.assertProdutorId(filtros.produtorId);
    }

    return this.readRepository.list(filtros);
  }

  async getById(id: string): Promise<Produto> {
    const produto = await this.readRepository.findById(id);

    if (!produto) {
      throw new NotFoundError("Produto não encontrado");
    }

    return produto;
  }

  async update(id: string, input: AtualizarProdutoInput): Promise<Produto> {
    if (
      input.produtorId === undefined &&
      input.nome === undefined &&
      input.descricao === undefined &&
      input.categoria === undefined &&
      input.unidadeMedida === undefined &&
      input.registros === undefined &&
      input.fotosAvaliacao === undefined &&
      input.fotosDivulgacao === undefined &&
      input.premiacoes === undefined &&
      input.valorCentavos === undefined &&
      input.observacoes === undefined &&
      input.status === undefined &&
      input.motivoRejeicao === undefined
    ) {
      throw new ValidationError("Nenhum campo para atualizar");
    }

    const atual = await this.readRepository.findById(id);

    if (!atual) {
      throw new NotFoundError("Produto não encontrado");
    }

    const data: {
      produtorId?: string;
      nome?: string;
      descricao?: string;
      categoria?: CategoriaProduto;
      unidadeMedida?: UnidadeMedida;
      registros?: RegistroProduto[];
      fotosAvaliacao?: Arquivo[];
      fotosDivulgacao?: Arquivo[];
      premiacoes?: Premiacao[];
      valorCentavos?: number;
      observacoes?: string;
      status?: StatusProduto;
      motivoRejeicao?: string | null;
    } = {};

    if (input.produtorId !== undefined) {
      const produtorId = this.assertProdutorId(input.produtorId);
      await this.assertProdutorAprovado(produtorId);
      data.produtorId = produtorId;
    }

    if (input.nome !== undefined) {
      data.nome = this.assertNome(input.nome);
    }

    if (input.descricao !== undefined) {
      data.descricao = this.assertDescricao(input.descricao);
    }

    if (input.categoria !== undefined) {
      data.categoria = this.assertCategoria(input.categoria);
    }

    if (input.unidadeMedida !== undefined) {
      data.unidadeMedida = this.assertUnidadeMedida(input.unidadeMedida);
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

    if (input.fotosAvaliacao !== undefined) {
      data.fotosAvaliacao = this.normalizeFotos(
        input.fotosAvaliacao,
        "fotosAvaliacao",
      );
    }

    if (input.fotosDivulgacao !== undefined) {
      data.fotosDivulgacao = this.normalizeFotos(
        input.fotosDivulgacao,
        "fotosDivulgacao",
      );
    }

    if (input.premiacoes !== undefined) {
      data.premiacoes = this.normalizePremiacoes(input.premiacoes);
    }

    if (input.valorCentavos !== undefined) {
      data.valorCentavos = this.assertValorCentavos(input.valorCentavos);
    }

    if (input.observacoes !== undefined) {
      data.observacoes = this.normalizeObservacoes(input.observacoes);
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
        data.motivoRejeicao = this.assertMotivoRejeicao(motivo);
      } else {
        data.motivoRejeicao = null;
      }
    } else if (input.motivoRejeicao !== undefined) {
      throw new ValidationError(
        "Motivo da rejeição só pode ser informado quando o status for REJEITADO",
      );
    } else if (atual.status === "APROVADO") {
      data.status = "PENDENTE";
      data.motivoRejeicao = null;
    }

    const atualizado = await this.writeRepository.update(id, data);

    if (!atualizado) {
      throw new NotFoundError("Produto não encontrado");
    }

    return atualizado;
  }

  async remove(id: string): Promise<void> {
    const atual = await this.readRepository.findById(id);

    if (!atual) {
      throw new NotFoundError("Produto não encontrado");
    }

    if (!atual.ativo) {
      return;
    }

    const atualizado = await this.writeRepository.softDelete(id);

    if (!atualizado) {
      throw new NotFoundError("Produto não encontrado");
    }
  }

  private async assertProdutorAprovado(produtorId: string): Promise<void> {
    const produtor = await this.produtorReadRepository.findById(produtorId);

    if (!produtor) {
      throw new NotFoundError("Produtor não encontrado");
    }

    if (!produtor.ativo) {
      throw new ValidationError("Produtor inativo");
    }

    if (produtor.status !== "APROVADO") {
      throw new ValidationError("Produtor deve estar aprovado");
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

  private assertProdutorId(produtorId: string): string {
    const trimmed = produtorId.trim();
    if (!trimmed) {
      throw new ValidationError("Produtor é obrigatório");
    }
    return trimmed;
  }

  private normalizeCatalogText(value?: string): string {
    if (!value) {
      return "";
    }

    return value
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  }

  private assertNome(nome: string): string {
    const trimmed = nome.trim();
    if (!trimmed) {
      throw new ValidationError("Nome do produto é obrigatório");
    }
    return trimmed;
  }

  private assertDescricao(descricao: string): string {
    const trimmed = descricao.trim();
    if (!trimmed) {
      throw new ValidationError("Descrição é obrigatória");
    }
    return trimmed;
  }

  private assertCategoria(categoria: string): CategoriaProduto {
    if (!isCategoriaProduto(categoria)) {
      throw new ValidationError("Categoria inválida");
    }
    return categoria;
  }

  private assertUnidadeMedida(unidadeMedida: string): UnidadeMedida {
    if (!isUnidadeMedida(unidadeMedida)) {
      throw new ValidationError("Unidade de medida inválida");
    }
    return unidadeMedida;
  }

  private assertValorCentavos(valorCentavos: number): number {
    if (!Number.isInteger(valorCentavos)) {
      throw new ValidationError("Valor deve ser um número inteiro em centavos");
    }

    if (valorCentavos < 0) {
      throw new ValidationError("Valor não pode ser negativo");
    }

    return valorCentavos;
  }

  private assertMotivoRejeicao(motivoRejeicao: string): string {
    const trimmed = motivoRejeicao.trim();
    if (!trimmed) {
      throw new ValidationError("Motivo da rejeição é obrigatório");
    }
    return trimmed;
  }

  private normalizeObservacoes(observacoes?: string): string | undefined {
    if (observacoes === undefined) {
      return undefined;
    }

    const trimmed = observacoes.trim();
    return trimmed || undefined;
  }

  private normalizeRegistros(registros: RegistroProduto[]): RegistroProduto[] {
    if (!Array.isArray(registros)) {
      throw new ValidationError("Registros inválidos");
    }

    if (registros.length < MIN_REGISTROS || registros.length > MAX_REGISTROS) {
      throw new ValidationError(
        `Registros devem ter entre ${MIN_REGISTROS} e ${MAX_REGISTROS} itens`,
      );
    }

    return registros.map((registro) => this.normalizeRegistro(registro));
  }

  private normalizeRegistro(registro: RegistroProduto): RegistroProduto {
    if (!REGISTRO_PRODUTO_TIPO.includes(registro.tipo)) {
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
      tipo: registro.tipo as RegistroProdutoTipo,
      numero,
      ...(registro.dataEmissao !== undefined
        ? { dataEmissao: registro.dataEmissao }
        : {}),
      ...(registro.dataValidade !== undefined
        ? { dataValidade: registro.dataValidade }
        : {}),
    };
  }

  private normalizeFotos(
    fotos: Arquivo[],
    campo: "fotosAvaliacao" | "fotosDivulgacao",
  ): Arquivo[] {
    if (!Array.isArray(fotos)) {
      throw new ValidationError(`${campo} inválidas`);
    }

    if (fotos.length < MIN_FOTOS || fotos.length > MAX_FOTOS) {
      throw new ValidationError(
        `${campo} deve ter entre ${MIN_FOTOS} e ${MAX_FOTOS} itens`,
      );
    }

    return fotos.map((foto) => this.normalizeArquivo(foto, CONTENT_TYPES_IMAGEM));
  }

  private normalizePremiacoes(premiacoes: Premiacao[]): Premiacao[] {
    if (!Array.isArray(premiacoes)) {
      throw new ValidationError("Premiações inválidas");
    }

    return premiacoes.map((premiacao) => this.normalizePremiacao(premiacao));
  }

  private normalizePremiacao(premiacao: Premiacao): Premiacao {
    const nome = premiacao.nome.trim();
    const descricao = premiacao.descricao.trim();

    if (!nome) {
      throw new ValidationError("Nome da premiação é obrigatório");
    }

    if (!descricao) {
      throw new ValidationError("Descrição da premiação é obrigatória");
    }

    this.assertAno(premiacao.ano);

    return {
      nome,
      descricao,
      ano: premiacao.ano,
      comprovante: this.normalizeArquivo(
        premiacao.comprovante,
        CONTENT_TYPES_COMPROVANTE,
      ),
    };
  }

  private normalizeArquivo(
    arquivo: Arquivo,
    allowedContentTypes: readonly string[],
  ): Arquivo {
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

    if (!allowedContentTypes.includes(contentType)) {
      throw new ValidationError("Tipo de conteúdo do arquivo inválido");
    }

    if (!nomeOriginal) {
      throw new ValidationError("Nome original do arquivo é obrigatório");
    }

    return { url, contentType, nomeOriginal };
  }

  private assertAno(ano: number): void {
    const anoAtual = new Date().getFullYear();

    if (!Number.isInteger(ano) || ano < ANO_MIN || ano > anoAtual) {
      throw new ValidationError(
        `Ano da premiação deve estar entre ${ANO_MIN} e ${anoAtual}`,
      );
    }
  }

  private assertStatus(status: StatusProduto): void {
    if (!STATUS_PRODUTO.includes(status)) {
      throw new ValidationError("Status inválido");
    }
  }
}
