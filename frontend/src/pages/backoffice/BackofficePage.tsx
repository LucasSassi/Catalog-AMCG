import { useState } from 'react'
import { ProductReviewList } from '../../features/produto/components/ProductReviewList'
import { ProductReviewModal } from '../../features/produto/components/ProductReviewModal'
import { useReviewProducts } from '../../features/produto/hooks/useReviewProducts'
import type { Product } from '../../features/produto/types'
import { ProducerReviewList } from '../../features/produtor/components/ProducerReviewList'
import { ProducerReviewModal } from '../../features/produtor/components/ProducerReviewModal'
import { useReviewProducers } from '../../features/produtor/hooks/useReviewProducers'
import type { Producer } from '../../features/produtor/types'
import { Button } from '../../shared/components/Button'
import {
  BackofficeNavigation,
  DesktopStatusTabs,
  type ReviewStatus,
  type ReviewTab,
} from './BackofficeNavigation'

export function BackofficePage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('producers')
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('PENDENTE')
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const producers = useReviewProducers(reviewStatus)
  const products = useReviewProducts(reviewStatus)

  function changeStatus(status: ReviewStatus) {
    setReviewStatus(status)
    setSelectedProducer(null)
    setSelectedProduct(null)
  }

  let content = (
    <ProducerReviewList
      producers={producers.producers}
      status={reviewStatus}
      isLoading={producers.isLoading}
      error={producers.error}
      onSelect={setSelectedProducer}
    />
  )

  if (activeTab === 'products') {
    content = (
      <ProductReviewList
        products={products.products}
        status={reviewStatus}
        isLoading={products.isLoading}
        error={products.error}
        onSelect={setSelectedProduct}
      />
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-700">Visão geral</p>
          <h1 className="text-3xl font-bold text-slate-900">
            Curadoria de cadastros
          </h1>
          <p className="mt-2 text-slate-600">
            Avalie os dados enviados antes da publicação no catálogo.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            producers.reload()
            products.reload()
          }}
        >
          Atualizar dados
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        <BackofficeNavigation
          activeTab={activeTab}
          status={reviewStatus}
          producerCount={producers.producers.length}
          productCount={products.products.length}
          onTabChange={setActiveTab}
          onStatusChange={changeStatus}
        />

        <div className="min-w-0 flex-1">
          <DesktopStatusTabs status={reviewStatus} onChange={changeStatus} />
          <div className="mt-5">{content}</div>
        </div>
      </div>

      {selectedProducer ? (
        <ProducerReviewModal
          producer={selectedProducer}
          disabled={producers.isUpdating}
          onClose={() => setSelectedProducer(null)}
          onApprove={producers.approve}
          onReject={producers.reject}
        />
      ) : null}

      {selectedProduct ? (
        <ProductReviewModal
          product={selectedProduct}
          disabled={products.isUpdating}
          onClose={() => setSelectedProduct(null)}
          onApprove={products.approve}
          onReject={products.reject}
        />
      ) : null}
    </main>
  )
}
