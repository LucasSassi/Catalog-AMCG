import { useEffect, useState, type ReactNode } from 'react'
import { SOCIAL_NETWORK_LABELS } from '../../produtor/constants'
import { useCatalogProducer } from '../../produtor/hooks/useCatalogProducer'
import { formatPhoneDisplay } from '../../produtor/lib/format-phone'
import {
  buildSocialProfileUrl,
  formatSocialHandle,
} from '../../produtor/lib/social-url'
import type { ProducerFile } from '../../produtor/types'
import logoPlaceholder from '../../../shared/assets/logo-catalogo-campos-gerais.png'
import { Feedback } from '../../../shared/components/Feedback'
import { Modal } from '../../../shared/components/Modal'
import { WhatsAppIcon } from '../../../shared/components/WhatsAppIcon'
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

  const gallery = producer?.logo
    ? [producer.logo, ...(producer.fotos ?? [])]
    : (producer?.fotos ?? [])
  const hasLogo = Boolean(producer?.logo)
  const hasGallery = gallery.length > 0
  const hasMultiplePhotos = gallery.length > 1
  const mainPhoto = gallery[selectedPhotoIndex] ?? gallery[0]
  const isLogoSelected = hasLogo && selectedPhotoIndex === 0
  const canScrollThumbsDown =
    hasMultiplePhotos && thumbStartIndex + THUMBNAILS_VISIBLE < gallery.length
  const visibleThumbs = hasMultiplePhotos
    ? gallery.slice(thumbStartIndex, thumbStartIndex + THUMBNAILS_VISIBLE)
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
      Math.min(current + 1, gallery.length - THUMBNAILS_VISIBLE),
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
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                  {producer.municipio}
                </span>
                <div className="ml-auto inline-flex h-16 min-w-[8.5rem] max-w-[11rem] items-center justify-center overflow-hidden rounded-md bg-slate-900 px-2">
                  <img
                    src={
                      producer.logo
                        ? buildThumbnailUrl(
                            producer.logo.url,
                            THUMBNAIL_WIDTH.gallery,
                          )
                        : logoPlaceholder
                    }
                    alt={
                      producer.logo ? `Logo de ${producer.nome}` : ''
                    }
                    width={140}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="max-h-14 w-full object-contain"
                  />
                </div>
              </div>

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
                <div
                  className={`min-w-0 flex-1 overflow-hidden rounded-2xl bg-slate-100 ${
                    isLogoSelected ? 'p-6' : ''
                  }`}
                >
                  <img
                    src={buildThumbnailUrl(
                      mainPhoto.url,
                      THUMBNAIL_WIDTH.detail,
                    )}
                    alt={
                      isLogoSelected
                        ? `Logo de ${producer.nome}`
                        : `Foto de ${producer.nome}`
                    }
                    width={900}
                    height={900}
                    loading="eager"
                    decoding="async"
                    className={`aspect-square w-full ${
                      isLogoSelected ? 'object-contain' : 'object-cover'
                    }`}
                  />
                </div>

                {hasMultiplePhotos ? (
                  <div className="flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
                    <div className="flex w-full flex-col gap-2">
                      {visibleThumbs.map((photo, visibleIndex) => {
                        const absoluteIndex = thumbStartIndex + visibleIndex
                        const isLogoThumb = hasLogo && absoluteIndex === 0
                        return (
                          <ThumbnailButton
                            key={`${photo.url}-${absoluteIndex}`}
                            photo={photo}
                            selected={absoluteIndex === selectedPhotoIndex}
                            onSelect={() =>
                              setSelectedPhotoIndex(absoluteIndex)
                            }
                            alt={
                              isLogoThumb
                                ? `Logo de ${producer.nome}`
                                : `Miniatura ${absoluteIndex + 1} de ${producer.nome}`
                            }
                            contain={isLogoThumb}
                          />
                        )
                      })}
                    </div>

                    {gallery.length > THUMBNAILS_VISIBLE ? (
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
  contain = false,
}: {
  photo: ProducerFile
  selected: boolean
  onSelect: () => void
  alt: string
  contain?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`aspect-square w-full overflow-hidden rounded-xl border-2 bg-slate-100 ${
        selected ? 'border-primary' : 'border-transparent'
      } ${contain ? 'p-1.5' : ''}`}
    >
      <img
        src={buildThumbnailUrl(photo.url, THUMBNAIL_WIDTH.gallery)}
        alt={alt}
        width={96}
        height={96}
        loading="lazy"
        decoding="async"
        className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'}`}
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
