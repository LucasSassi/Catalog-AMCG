import { apiRequest } from '../../../shared/api/client'
import type {
  Banner,
  CatalogBanner,
  CreateBannerInput,
  UpdateBannerInput,
} from '../types'

export function listCatalogBanners(): Promise<CatalogBanner[]> {
  return apiRequest<CatalogBanner[]>('/api/banners/catalogo')
}

export function listBanners(): Promise<Banner[]> {
  return apiRequest<Banner[]>('/api/banners', { authenticated: true })
}

export function createBanner(input: CreateBannerInput): Promise<Banner> {
  return apiRequest<Banner>('/api/banners', {
    method: 'POST',
    authenticated: true,
    body: input,
  })
}

export function updateBanner(
  id: string,
  input: UpdateBannerInput,
): Promise<Banner> {
  return apiRequest<Banner>(`/api/banners/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: input,
  })
}

export function setBannerAtivo(id: string, ativo: boolean): Promise<Banner> {
  return apiRequest<Banner>(`/api/banners/${id}/ativo`, {
    method: 'PATCH',
    authenticated: true,
    body: { ativo },
  })
}

export function reorderBanners(ids: string[]): Promise<Banner[]> {
  return apiRequest<Banner[]>('/api/banners/ordem', {
    method: 'PUT',
    authenticated: true,
    body: { ids },
  })
}

export function deleteBanner(id: string): Promise<void> {
  return apiRequest<void>(`/api/banners/${id}`, {
    method: 'DELETE',
    authenticated: true,
  })
}
