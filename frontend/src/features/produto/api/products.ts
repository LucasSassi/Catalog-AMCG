import { apiRequest } from '../../../shared/api/client'
import type {
  CatalogFilters,
  Product,
  ProductCatalog,
  ProductStatus,
} from '../types'

export function listCatalogProducts(
  filters: CatalogFilters,
): Promise<ProductCatalog> {
  const searchParams = new URLSearchParams()

  if (filters.busca) {
    searchParams.set('busca', filters.busca)
  }

  if (filters.categoria) {
    searchParams.set('categoria', filters.categoria)
  }

  if (filters.municipio) {
    searchParams.set('municipio', filters.municipio)
  }

  const query = searchParams.toString()
  let path = '/api/produtos/catalogo'

  if (query) {
    path += `?${query}`
  }

  return apiRequest<ProductCatalog>(path)
}

export function listProductsByStatus(
  status: ProductStatus,
): Promise<Product[]> {
  return apiRequest<Product[]>(`/api/produtos?status=${status}`, {
    authenticated: true,
  })
}

export function approveProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`/api/produtos/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: { status: 'APROVADO' },
  })
}

export function rejectProduct(id: string, reason: string): Promise<Product> {
  return apiRequest<Product>(`/api/produtos/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: {
      status: 'REJEITADO',
      motivoRejeicao: reason,
    },
  })
}
