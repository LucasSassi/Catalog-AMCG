import type { BannerVariante } from "../banner.constants";
import type {
  AtualizarBannerInput,
  Banner,
  BannerArquivo,
  BannerCatalogo,
  CadastrarBannerInput,
} from "../banner.entity";

export interface IBannerService {
  cadastrar(input: CadastrarBannerInput): Promise<Banner>;
  list(): Promise<Banner[]>;
  getById(id: string): Promise<Banner>;
  update(id: string, input: AtualizarBannerInput): Promise<Banner>;
  setAtivo(id: string, ativo: boolean): Promise<Banner>;
  reordenar(ids: string[]): Promise<Banner[]>;
  remove(id: string): Promise<void>;
  listCatalogo(agora?: Date): Promise<BannerCatalogo[]>;
  getImagem(id: string, variante: BannerVariante): Promise<BannerArquivo>;
}
