import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { ReviewActions } from '../../../shared/components/ReviewActions'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { Product } from '../types'

interface ProductReviewModalProps {
  product: Product
  disabled: boolean
  onClose: () => void
  onApprove: (id: string) => Promise<boolean>
  onReject: (id: string, reason: string) => Promise<boolean>
}

export function ProductReviewModal({
  product,
  disabled,
  onClose,
  onApprove,
  onReject,
}: ProductReviewModalProps) {
  const isRejected = product.status === 'REJEITADO'

  async function handleApprove() {
    const didApprove = await onApprove(product.id)

    if (didApprove) {
      onClose()
    }
  }

  async function handleReject(reason: string) {
    const didReject = await onReject(product.id, reason)

    if (didReject) {
      onClose()
    }
  }

  return (
    <Modal title={product.nome} onClose={onClose}>
      <div className="grid gap-5 sm:grid-cols-2">
        <PhotoGallery
          title="Fotos para avaliação"
          description="Imagens internas enviadas para análise da equipe."
          images={product.fotosAvaliacao}
          productName={product.nome}
        />
        <PhotoGallery
          title="Fotos de divulgação"
          description="Imagens que serão exibidas no catálogo após a aprovação."
          images={product.fotosDivulgacao}
          productName={product.nome}
        />
      </div>

      <div className="mt-6 border-t border-slate-200 pt-6">
        {isRejected ? (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
            Rejeitado
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            Pendente
          </span>
        )}
        <p className="mt-4 leading-7 text-slate-700">{product.descricao}</p>

        {product.motivoRejeicao ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase text-red-700">
              Motivo da rejeição
            </p>
            <p className="mt-1 text-sm text-red-900">
              {product.motivoRejeicao}
            </p>
          </div>
        ) : null}

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <Detail label="Categoria" value={product.categoria} />
          <Detail label="Unidade" value={product.unidadeMedida} />
          <Detail
            label="Valor"
            value={formatCurrency(product.valorCentavos)}
          />
          <Detail label="ID do produtor" value={product.produtorId} />
          <Detail
            label="Registros"
            value={product.registros
              .map((item) => `${item.tipo}: ${item.numero}`)
              .join(', ')}
          />
          <Detail
            label="Premiações"
            value={
              product.premiacoes.length > 0
                ? product.premiacoes.map((item) => item.nome).join(', ')
                : 'Nenhuma'
            }
          />
        </dl>

        {product.observacoes ? (
          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Observações
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {product.observacoes}
            </p>
          </div>
        ) : null}
      </div>

      {!isRejected ? (
        <ReviewActions
          disabled={disabled}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <Button disabled={disabled} onClick={handleApprove}>
            Reconsiderar e aprovar
          </Button>
        </div>
      )}
    </Modal>
  )
}

interface PhotoGalleryProps {
  title: string
  description: string
  images: Product['fotosAvaliacao']
  productName: string
}

function PhotoGallery({
  title,
  description,
  images,
  productName,
}: PhotoGalleryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-bold text-brand-900">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <figure key={`${image.url}-${index}`}>
            <img
              src={image.url}
              alt={`${title} de ${productName}`}
              className="aspect-square w-full rounded-lg bg-slate-100 object-cover"
            />
            <figcaption className="mt-1 truncate text-xs text-slate-500">
              {image.nomeOriginal}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words font-semibold text-slate-900">{value}</dd>
    </div>
  )
}
