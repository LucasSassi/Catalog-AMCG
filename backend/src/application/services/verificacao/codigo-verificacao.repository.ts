/** Desafio de verificação por e-mail do pré-cadastro (o código fica só como hash). */
export interface CodigoVerificacao {
  id: string;
  produtorId: string;
  codigoHash: string;
  tentativas: number;
  expiraEm: Date;
  criadoEm: Date;
}

export interface CriarCodigoVerificacaoData {
  produtorId: string;
  codigoHash: string;
  expiraEm: Date;
}

export interface ICodigoVerificacaoRepository {
  /** Desafio mais recente do produtor (para limitar reenvios). */
  findUltimoPorProdutor(produtorId: string): Promise<CodigoVerificacao | null>;
  findById(id: string): Promise<CodigoVerificacao | null>;
  /** Cria um desafio novo e invalida os anteriores do mesmo produtor. */
  substituir(data: CriarCodigoVerificacaoData): Promise<CodigoVerificacao>;
  /** Soma uma tentativa errada e devolve o total. */
  registrarTentativa(id: string): Promise<number>;
  delete(id: string): Promise<void>;
}
