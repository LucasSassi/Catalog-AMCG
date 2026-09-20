import { apiRequest } from '../../../shared/api/client'
import type {
  CatalogFilters,
  CatalogProductDetail,
  CreateProductInput,
  Product,
  ProductCatalog,
  ProductStatus,
} from '../types'

export type ProductListFilter = ProductStatus | 'TODOS'

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

  if (filters.certificacao) {
    searchParams.set('certificacao', filters.certificacao)
  }

  const query = searchParams.toString()
  let path = '/api/produtos/catalogo'

  if (query) {
    path += `?${query}`
  }

  return apiRequest<ProductCatalog>(path)
}

export function getCatalogProduct(id: string): Promise<CatalogProductDetail> {
  return apiRequest<CatalogProductDetail>(`/api/produtos/catalogo/${id}`)
}

export function listProducts(filter: ProductListFilter): Promise<Product[]> {
  if (filter === 'TODOS') {
    return apiRequest<Product[]>('/api/produtos', {
      authenticated: true,
    })
  }

  return apiRequest<Product[]>(`/api/produtos?status=${filter}`, {
    authenticated: true,
  })
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return apiRequest<Product>('/api/produtos', {
    method: 'POST',
    authenticated: true,
    body: input,
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

export function setProductDestaque(
  id: string,
  destaque: boolean,
): Promise<Product> {
  return apiRequest<Product>(`/api/produtos/${id}/destaque`, {
    method: 'PATCH',
    authenticated: true,
    body: { destaque },
  })
}
