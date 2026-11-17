/**
 * Validação visual dos formulários (usar com `<form noValidate>`):
 * - marca o formulário com `data-validated`, o que faz o CSS global
 *   (`styles/index.css`) pintar de vermelho os campos inválidos;
 * - encontra o primeiro campo inválido na ordem da tela.
 *
 * Campos que não são inputs nativos (ex.: `ImageDropzone`) participam por meio
 * de um input oculto com `data-required-proxy`.
 */

const INVALID_FIELD_SELECTOR =
  'input:invalid, select:invalid, textarea:invalid'

export function findFirstInvalidField(
  form: HTMLFormElement,
): HTMLElement | null {
  form.dataset.validated = 'true'
  return form.querySelector<HTMLElement>(INVALID_FIELD_SELECTOR)
}

/** Rola até o campo (centralizado, por causa do cabeçalho fixo) e foca nele. */
export function revealField(field: HTMLElement): void {
  const target =
    field.dataset.requiredProxy !== undefined
      ? (field
          .closest('[data-dropzone]')
          ?.querySelector<HTMLElement>('input[type="file"]') ??
        field
          .closest('[data-file-input]')
          ?.querySelector<HTMLElement>('button') ??
        field)
      : field

  const scrollAnchor =
    field.closest<HTMLElement>('[data-dropzone]') ??
    field.closest<HTMLElement>('label') ??
    field

  scrollAnchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
  target.focus({ preventScroll: true })
}

/** Mensagem curta para o resumo de erro do formulário. */
export function describeInvalidField(field: HTMLElement): string {
  const label = field.dataset.fieldLabel ?? labelText(field.closest('label'))

  const message =
    field.dataset.requiredMessage ??
    (field as HTMLInputElement).validationMessage

  const cleanLabel = label?.replace(/\*$/, '').trim()
  return cleanLabel
    ? `Confira o campo “${cleanLabel}”: ${message}`
    : `Confira o campo destacado: ${message}`
}

/**
 * Texto do rótulo: o texto solto dentro do <label> (ex.: "Senha<input/>") ou,
 * se não houver, o primeiro <span> (padrão do InscriptionField).
 */
function labelText(label: HTMLLabelElement | null): string | undefined {
  if (!label) {
    return undefined
  }

  const ownText = Array.from(label.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join(' ')
    .trim()

  return ownText || label.querySelector('span')?.textContent?.trim()
}

/**
 * Atalho para formulários simples: se houver campo inválido, destaca, rola
 * até ele e devolve a mensagem; senão devolve `null`.
 */
export function revealFirstInvalidField(form: HTMLFormElement): string | null {
  const field = findFirstInvalidField(form)
  if (!field) {
    return null
  }

  revealField(field)
  return describeInvalidField(field)
}
