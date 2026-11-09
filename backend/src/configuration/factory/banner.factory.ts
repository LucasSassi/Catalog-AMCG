import { BannerService } from "../../domain/banner/service/banner.service";
import { BannerRepositoryRead } from "../../infraestructure/repository/banner/banner.repository.read";
import { BannerRepositoryWrite } from "../../infraestructure/repository/banner/banner.repository.write";

export function createBannerService(): BannerService {
  return new BannerService({
    readRepository: new BannerRepositoryRead(),
    writeRepository: new BannerRepositoryWrite(),
  });
}
