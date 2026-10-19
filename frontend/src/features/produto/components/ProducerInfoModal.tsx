import { useEffect, useState, type ReactNode } from 'react'
import { SOCIAL_NETWORK_LABELS } from '../../produtor/constants'
import { useCatalogProducer } from '../../produtor/hooks/useCatalogProducer'
import { formatPhoneDisplay } from '../../produtor/lib/format-phone'
import {
  buildSocialProfileUrl,
  formatSocialHandle,
} from '../../produtor/lib/social-url'
import type { ProducerFile } from '../../produtor/types'
import { Feedback } from '../../../shared/components/Feedback'
import { Modal } from '../../../shared/components/Modal'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { buildWhatsAppUrl } from '../lib/whatsapp'

interface ProducerInfoModalProps {
  producerId: string
  onClose: () => void
}

const THUMBNAILS_VISIBLE = 3

export function ProducerInfoModal({
  producerId,
  onClose,
}: ProducerInfoModalProps) {
  const { producer, isLoading, error } = useCatalogProducer(producerId)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [thumbStartIndex, setThumbStartIndex] = useState(0)

  useEffect(() => {
    setSelectedPhotoIndex(0)
    setThumbStartIndex(0)
  }, [producerId, producer?.id])

  const fotos = producer?.fotos ?? []
  const hasGallery = fotos.length > 0
  const hasMultiplePhotos = fotos.length > 1
  const mainPhoto = fotos[selectedPhotoIndex] ?? fotos[0]
  const canScrollThumbsDown =
    hasMultiplePhotos && thumbStartIndex + THUMBNAILS_VISIBLE < fotos.length
  const visibleThumbs = hasMultiplePhotos
    ? fotos.slice(thumbStartIndex, thumbStartIndex + THUMBNAILS_VISIBLE)
    : []

  const whatsappUrl = producer
    ? buildWhatsAppUrl({
        telefone: producer.telefone,
        nomeProdutor: producer.nome,
      })
    : ''

  const addressLabel = producer
    ? `${producer.endereco.bairro}, ${producer.endereco.cidade} - ${producer.endereco.estado}`
    : ''

  const mapsUrl = producer
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${producer.endereco.bairro}, ${producer.endereco.cidade} - ${producer.endereco.estado}`,
      )}`
    : ''

  function handleScrollThumbs() {
    if (!canScrollThumbsDown) {
      setThumbStartIndex(0)
      return
    }

    setThumbStartIndex((current) =>
      Math.min(current + 1, fotos.length - THUMBNAILS_VISIBLE),
    )
  }

  return (
    <Modal
      title={producer?.nome ?? 'Produtor'}
      onClose={onClose}
      size="wide"
    >
      {isLoading ? <Feedback title="Carregando produtor..." /> : null}

      {!isLoading && error ? (
        <Feedback
          tone="error"
          title="Não foi possível carregar o produtor"
          description={error}
        />
      ) : null}

      {!isLoading && !error && producer ? (
        <div
          className={`grid gap-8 ${
            hasGallery ? 'lg:grid-cols-[1fr_1.05fr]' : ''
          }`}
        >
          <div className="flex min-w-0 flex-col">
            <h3 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {producer.nome}
            </h3>

            {producer.historia ? (
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[15px]">
                {producer.historia}
              </p>
            ) : null}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                {producer.municipio}
              </span>

              <dl className="mt-4 space-y-3 text-sm">
                <ContactRow label="Endereço">
                  <span className="min-w-0 flex-1 truncate text-slate-800">
                    {addressLabel}
                  </span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Abrir endereço no mapa"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-white transition hover:bg-primary-darker"
                  >
                    <MapPinIcon />
                  </a>
                </ContactRow>

                <ContactRow label="Contato">
                  <span className="min-w-0 flex-1 truncate text-slate-800">
                    {formatPhoneDisplay(producer.telefone)}
                  </span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-primary-darker"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                </ContactRow>

                {(producer.redesSociais ?? []).map((rede) => (
                  <ContactRow
                    key={rede.tipo}
                    label={SOCIAL_NETWORK_LABELS[rede.tipo]}
                  >
                    <a
                      href={buildSocialProfileUrl(rede.tipo, rede.handle)}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate font-medium text-primary-darker hover:underline"
                    >
                      {formatSocialHandle(rede)}
                    </a>
                  </ContactRow>
                ))}

                {producer.site ? (
                  <ContactRow label="Site">
                    <a
                      href={producer.site}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate font-medium text-primary-darker hover:underline"
                    >
                      {displaySite(producer.site)}
                    </a>
                  </ContactRow>
                ) : null}
              </dl>
            </div>
          </div>

          {hasGallery && mainPhoto ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
              <div
                className={`flex gap-3 ${
                  hasMultiplePhotos ? 'flex-row' : ''
                }`}
              >
                <div className="min-w-0 flex-1 overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={buildThumbnailUrl(
                      mainPhoto.url,
                      THUMBNAIL_WIDTH.detail,
                    )}
                    alt={`Foto de ${producer.nome}`}
                    width={900}
                    height={900}
                    loading="eager"
                    decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                </div>

                {hasMultiplePhotos ? (
                  <div className="flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
                    <div className="flex w-full flex-col gap-2">
                      {visibleThumbs.map((photo, visibleIndex) => {
                        const absoluteIndex = thumbStartIndex + visibleIndex
                        return (
                          <ThumbnailButton
                            key={`${photo.url}-${absoluteIndex}`}
                            photo={photo}
                            selected={absoluteIndex === selectedPhotoIndex}
                            onSelect={() =>
                              setSelectedPhotoIndex(absoluteIndex)
                            }
                            alt={`Miniatura ${absoluteIndex + 1} de ${producer.nome}`}
                          />
                        )
                      })}
                    </div>

                    {fotos.length > THUMBNAILS_VISIBLE ? (
                      <button
                        type="button"
                        onClick={handleScrollThumbs}
                        aria-label="Ver mais fotos"
                        className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700"
                      >
                        <ChevronDownIcon />
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  )
}

function ContactRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[7.5rem_1fr] sm:items-center">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
        {children}
      </dd>
    </div>
  )
}

function ThumbnailButton({
  photo,
  selected,
  onSelect,
  alt,
}: {
  photo: ProducerFile
  selected: boolean
  onSelect: () => void
  alt: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`aspect-square w-full overflow-hidden rounded-xl border-2 ${
        selected ? 'border-primary' : 'border-transparent'
      }`}
    >
      <img
        src={buildThumbnailUrl(photo.url, THUMBNAIL_WIDTH.gallery)}
        alt={alt}
        width={96}
        height={96}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </button>
  )
}

function displaySite(site: string): string {
  try {
    return new URL(site).host.replace(/^www\./, '')
  } catch {
    return site
  }
}

function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.2-.7.9-.8 1-.2.1-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.5-1-.9-1.5-1.9-1.7-2.2-.2-.3 0-.4.1-.6.1-.1.2-.3.3-.4.1-.1.1-.2.2-.4 0-.1 0-.3-.1-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 1.4.6 1.9.6 2.6.5.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.5-.3ZM12 2.1A9.9 9.9 0 0 0 2.1 12c0 1.7.5 3.4 1.3 4.9L2 22l5.2-1.4A9.9 9.9 0 1 0 12 2.1Zm0 18a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.1 8.1 0 1 1 12 20.1Z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
