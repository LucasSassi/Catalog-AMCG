import { ProdutoService } from "../../domain/produto/service/produto.service";
import { ProdutoRepositoryRead } from "../../infraestructure/repository/produto/produto.repository.read";
import { ProdutoRepositoryWrite } from "../../infraestructure/repository/produto/produto.repository.write";
import { ProdutorRepositoryRead } from "../../infraestructure/repository/produtor/produtor.repository.read";

export function createProdutoService(): ProdutoService {
  return new ProdutoService({
    readRepository: new ProdutoRepositoryRead(),
    writeRepository: new ProdutoRepositoryWrite(),
    produtorReadRepository: new ProdutorRepositoryRead(),
  });
}
