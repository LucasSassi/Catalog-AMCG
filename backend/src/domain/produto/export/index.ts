export type { ProdutoService } from "../service/produto.service";
export type {
  Arquivo,
  RegistroProduto,
  Premiacao,
  Produto,
  CadastrarProdutoInput,
  AtualizarProdutoInput,
  ListarProdutosFiltros,
} from "../entity/produto.entity";
export type { IProdutoService } from "../entity/interfaces/produto.service.interface";
export type { IProdutoRepositoryRead } from "../repository/produto.repository.read";
export type {
  IProdutoRepositoryWrite,
  CreateProdutoData,
  UpdateProdutoData,
} from "../repository/produto.repository.write";
