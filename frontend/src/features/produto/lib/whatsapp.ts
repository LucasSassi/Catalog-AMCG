import type { CatalogProduct } from '../types'

interface WhatsAppContact {
  telefone: string
  nomeProduto?: string
  nomeProdutor?: string
}

export function buildWhatsAppUrl(contact: WhatsAppContact): string {
  const phone = contact.telefone.replace(/\D/g, '')
  let messageText =
    'Olá! Vi o Catálogo AMCG e gostaria de saber mais sobre os produtos.'

  if (contact.nomeProduto) {
    messageText = `Olá! Vi o produto "${contact.nomeProduto}" no Catálogo AMCG e gostaria de saber mais.`
  } else if (contact.nomeProdutor) {
    messageText = `Olá! Vi os produtos de "${contact.nomeProdutor}" no Catálogo AMCG e gostaria de saber mais.`
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`
}

export function buildProductWhatsAppUrl(product: CatalogProduct): string {
  return buildWhatsAppUrl({
    telefone: product.produtor.telefone,
    nomeProduto: product.nome,
  })
}
