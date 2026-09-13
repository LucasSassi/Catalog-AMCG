import { ProdutorService } from "../../domain/produtor/service/produtor.service";
import { ProdutorRepositoryRead } from "../../infraestructure/repository/produtor/produtor.repository.read";
import { ProdutorRepositoryWrite } from "../../infraestructure/repository/produtor/produtor.repository.write";

export function createProdutorService(): ProdutorService {
  return new ProdutorService({
    readRepository: new ProdutorRepositoryRead(),
    writeRepository: new ProdutorRepositoryWrite(),
  });
}
