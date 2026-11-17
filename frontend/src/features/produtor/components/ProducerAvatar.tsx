import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { getInitials } from '../../../shared/lib/review-status'
import type { Producer } from '../types'

type AvatarSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-10 w-10 rounded-lg text-sm',
  md: 'h-14 w-14 rounded-xl text-lg',
  lg: 'h-16 w-16 rounded-2xl text-xl',
}

export function ProducerAvatar({
  producer,
  size = 'sm',
}: {
  producer: Pick<Producer, 'nomeEmpresa' | 'logo'>
  size?: AvatarSize
}) {
  const sizeClasses = SIZE_CLASSES[size]

  if (producer.logo) {
    return (
      <img
        src={buildThumbnailUrl(producer.logo.url, THUMBNAIL_WIDTH.avatar)}
        alt=""
        loading="lazy"
        decoding="async"
        className={`${sizeClasses} shrink-0 border border-border-soft bg-white object-cover`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={`${sizeClasses} grid shrink-0 place-items-center bg-accent-yellow-soft font-extrabold text-foreground`}
    >
      {getInitials(producer.nomeEmpresa)}
    </span>
  )
}
