import { useEffect, useState } from 'react'
import {
  createBanner,
  deleteBanner,
  listBanners,
  reorderBanners,
  setBannerAtivo,
  updateBanner,
} from '../api/banners'
import type { Banner, CreateBannerInput, UpdateBannerInput } from '../types'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

/** Lista e operações de banners para o backoffice. */
export function useManageBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    listBanners()
      .then((response) => {
        if (isCurrent) {
          setBanners(response)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(errorMessage(requestError, 'Não foi possível carregar os banners.'))
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  async function run<T>(
    request: () => Promise<T>,
    apply: (result: T) => void,
  ): Promise<{ ok: true; result: T } | { ok: false; message: string }> {
    setIsUpdating(true)

    try {
      const result = await request()
      apply(result)
      return { ok: true, result }
    } catch (requestError) {
      return {
        ok: false,
        message: errorMessage(requestError, 'Não foi possível salvar.'),
      }
    } finally {
      setIsUpdating(false)
    }
  }

  function replace(updated: Banner) {
    setBanners((current) =>
      current.map((banner) => (banner.id === updated.id ? updated : banner)),
    )
  }

  function create(input: CreateBannerInput) {
    return run(
      () => createBanner(input),
      (created) => setBanners((current) => [...current, created]),
    )
  }

  function update(id: string, input: UpdateBannerInput) {
    return run(() => updateBanner(id, input), replace)
  }

  function setAtivo(id: string, ativo: boolean) {
    return run(() => setBannerAtivo(id, ativo), replace)
  }

  function reorder(ids: string[]) {
    const previous = banners
    const byId = new Map(banners.map((banner) => [banner.id, banner]))

    // Atualiza já na tela; se falhar, volta para a ordem anterior.
    setBanners(
      ids.flatMap((id, ordem) => {
        const banner = byId.get(id)
        return banner ? [{ ...banner, ordem }] : []
      }),
    )

    return run(
      () => reorderBanners(ids),
      (result) => setBanners(result),
    ).then((outcome) => {
      if (!outcome.ok) {
        setBanners(previous)
      }
      return outcome
    })
  }

  function remove(id: string) {
    return run(
      () => deleteBanner(id),
      () => setBanners((current) => current.filter((banner) => banner.id !== id)),
    )
  }

  /** Recria um banner removido na mesma posição (desfazer a remoção). */
  async function restore(removed: Banner, previousOrder: string[]) {
    const outcome = await create({
      titulo: removed.titulo,
      textoAlternativo: removed.textoAlternativo,
      imagem: removed.imagem,
      imagemMobile: removed.imagemMobile,
      link: removed.link,
      ativo: removed.ativo,
      inicioEm: removed.inicioEm,
      fimEm: removed.fimEm,
    })

    if (!outcome.ok) {
      return outcome
    }

    const order = previousOrder.map((id) =>
      id === removed.id ? outcome.result.id : id,
    )
    return reorder(order)
  }

  function reload() {
    setIsLoading(true)
    setReloadKey((current) => current + 1)
  }

  return {
    banners,
    isLoading,
    isUpdating,
    error,
    create,
    update,
    setAtivo,
    reorder,
    remove,
    restore,
    reload,
  }
}
