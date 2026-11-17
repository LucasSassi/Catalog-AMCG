import type {
  CodigoVerificacao,
  CriarCodigoVerificacaoData,
  ICodigoVerificacaoRepository,
} from "../../application/services/verificacao/codigo-verificacao.repository";
import type {
  EmailMessage,
  IEmailSender,
} from "../../application/services/email/email-sender";

export class InMemoryCodigoVerificacaoRepository
  implements ICodigoVerificacaoRepository
{
  readonly items = new Map<string, CodigoVerificacao>();
  private sequence = 1;

  constructor(private readonly agora: () => Date = () => new Date()) {}

  async findUltimoPorProdutor(
    produtorId: string,
  ): Promise<CodigoVerificacao | null> {
    const doProdutor = [...this.items.values()]
      .filter((item) => item.produtorId === produtorId)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    return doProdutor[0] ?? null;
  }

  async findById(id: string): Promise<CodigoVerificacao | null> {
    return this.items.get(id) ?? null;
  }

  async substituir(
    data: CriarCodigoVerificacaoData,
  ): Promise<CodigoVerificacao> {
    for (const [id, item] of this.items) {
      if (item.produtorId === data.produtorId) this.items.delete(id);
    }
    const item: CodigoVerificacao = {
      id: `desafio-${this.sequence++}`,
      ...data,
      tentativas: 0,
      criadoEm: this.agora(),
    };
    this.items.set(item.id, item);
    return item;
  }

  async registrarTentativa(id: string): Promise<number> {
    const item = this.items.get(id);
    if (!item) return Number.POSITIVE_INFINITY;
    item.tentativas += 1;
    return item.tentativas;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}

export class FakeEmailSender implements IEmailSender {
  readonly enviados: EmailMessage[] = [];
  falhar = false;

  async send(message: EmailMessage): Promise<void> {
    if (this.falhar) throw new Error("SMTP indisponível");
    this.enviados.push(message);
  }
}
