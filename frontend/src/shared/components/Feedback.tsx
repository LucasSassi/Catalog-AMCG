interface FeedbackProps {
  title: string
  description?: string
  tone?: 'neutral' | 'error'
}

export function Feedback({
  title,
  description,
  tone = 'neutral',
}: FeedbackProps) {
  let toneClasses = 'border-slate-200 bg-white text-slate-700'

  if (tone === 'error') {
    toneClasses = 'border-red-200 bg-red-50 text-red-800'
  }

  return (
    <div
      className={`rounded-xl border p-6 text-center ${toneClasses}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm">{description}</p> : null}
    </div>
  )
}
