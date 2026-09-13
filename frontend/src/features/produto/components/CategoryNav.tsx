import type { ProductCategory } from '../types'

const categoryLabels: Record<ProductCategory, string> = {
  MEL: 'Méis',
  QUEIJO: 'Queijos',
  GELEIA: 'Geleias',
  CARNE: 'Carnes',
  BEBIDAS: 'Bebidas',
  BOLACHAS: 'Bolachas',
  PAES: 'Pães',
  OUTROS: 'Outros',
}

interface CategoryNavProps {
  categories: ProductCategory[]
  selected: string
  onSelect: (categoria: string) => void
}

export function CategoryNav({
  categories,
  selected,
  onSelect,
}: CategoryNavProps) {
  function itemClass(isActive: boolean): string {
    return [
      'shrink-0 px-1 py-2 text-sm font-extrabold transition sm:text-base',
      isActive
        ? 'text-brand-800 underline decoration-2 underline-offset-8'
        : 'text-slate-900 hover:text-brand-600',
    ].join(' ')
  }

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200 bg-white">
      <nav
        aria-label="Categorias de produtos"
        className="mx-auto flex max-w-7xl justify-center gap-6 overflow-x-auto px-4 py-3 sm:gap-8 sm:px-6 lg:px-8"
      >
        <button
          type="button"
          onClick={() => onSelect('')}
          className={itemClass(selected === '')}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={itemClass(selected === category)}
          >
            {categoryLabels[category] ?? category}
          </button>
        ))}
      </nav>
    </div>
  )
}
