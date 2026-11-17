import { Kbd } from '../../shared/components/Kbd'
import { Modal } from '../../shared/components/Modal'

const SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ['↓', 'J'], label: 'Próximo produtor da lista' },
  { keys: ['↑', 'K'], label: 'Produtor anterior' },
  { keys: ['Enter'], label: 'Abrir revisão rápida' },
  { keys: ['P'], label: 'Abrir perfil completo' },
  { keys: ['A'], label: 'Aprovar' },
  { keys: ['R'], label: 'Rejeitar (abre os motivos)' },
  { keys: ['X'], label: 'Selecionar para aprovação em lote' },
  { keys: ['/'], label: 'Buscar' },
  { keys: ['Ctrl', 'Z'], label: 'Desfazer a última decisão' },
  { keys: ['Esc'], label: 'Fechar painel ou diálogo' },
  { keys: ['?'], label: 'Mostrar esta lista' },
]

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Atalhos de teclado" size="small" onClose={onClose}>
      <p className="text-sm text-text-muted">
        Funcionam na lista de produtores quando nenhum campo está em foco.
      </p>
      <dl className="mt-4 divide-y divide-border-soft">
        {SHORTCUTS.map((shortcut) => (
          <div
            key={shortcut.label}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <dt className="text-sm text-text">{shortcut.label}</dt>
            <dd className="flex shrink-0 items-center gap-1">
              {shortcut.keys.map((key, index) => (
                <span key={key} className="flex items-center gap-1">
                  {index > 0 ? (
                    <span className="text-xs text-text-muted">
                      {shortcut.keys[0] === 'Ctrl' ? '+' : 'ou'}
                    </span>
                  ) : null}
                  <Kbd>{key}</Kbd>
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  )
}
