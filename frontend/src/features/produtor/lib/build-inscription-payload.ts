import type { CreateProductInput } from '../../produto/types'
import type {
  CreateInscriptionInput,
  CreateProducerInput,
  InscriptionFormState,
  InscriptionProductDraft,
  ProducerSocialNetwork,
} from '../types'
import { parseDocumentNumber } from './parse-document'
import { phoneToE164 } from './phone-mask'
import { stripSocialHandle } from './social-url'

export function buildInscriptionPayload(
  form: InscriptionFormState,
): CreateInscriptionInput {
  return {
    produtor: buildProducerPayload(form),
    produtos: form.produtos.map(buildProductPayload),
  }
}

function buildProducerPayload(
  form: InscriptionFormState,
): CreateProducerInput {
  if (!form.logo) {
    throw new Error('Logo da empresa é obrigatório.')
  }

  if (form.fotosDivulgacao.length === 0) {
    throw new Error('Ao menos uma foto de divulgação do produtor é obrigatória.')
  }

  const municipio = form.municipio.trim()
  const enderecoBase = form.endereco.trim()
  const cep = form.cep.trim()
  const rua = cep ? `${enderecoBase}, CEP ${cep}` : enderecoBase

  return {
    nomeEmpresa: form.nomeEmpresa.trim(),
    municipioId: municipio,
    documento: parseDocumentNumber(form.documentoNumero),
    registros: [
      {
        tipo: 'SIM',
        numero: form.numeroRegistro.trim(),
      },
    ],
    contato: {
      telefone: phoneToE164(form.telefone),
      email: form.email.trim(),
    },
    endereco: {
      rua,
      bairro: municipio,
      cidade: municipio,
      estado: 'PR',
    },
    historia: form.historia.trim(),
    logo: form.logo,
    fotos: form.fotosDivulgacao,
    redesSociais: buildRedesSociais(form.instagram, form.facebook),
    site: form.site.trim() || undefined,
  }
}

function buildProductPayload(
  product: InscriptionProductDraft,
): Omit<CreateProductInput, 'produtorId'> {
  if (product.fotosAvaliacao.length === 0) {
    throw new Error('Foto de avaliação é obrigatória para cada produto.')
  }

  if (product.fotosDivulgacao.length === 0) {
    throw new Error('Foto de divulgação é obrigatória para cada produto.')
  }

  const hasSeloArte = product.seloArte === 'Sim'
  const isPremiado = product.premiado === 'Sim'

  if (isPremiado && !product.comprovantePremiacao) {
    throw new Error('Comprovação de premiação é obrigatória quando premiado.')
  }

  const descricaoBreve = product.descricaoBreve.trim()
  const descricaoCompleta = product.descricaoCompleta.trim()
  const descricao = descricaoBreve
    ? `${descricaoBreve}\n\n${descricaoCompleta}`
    : descricaoCompleta

  return {
    nome: product.nome.trim(),
    descricao,
    categoria: product.categoria,
    unidadeMedida: 'UNIDADE',
    registros: [
      hasSeloArte
        ? {
            tipo: 'SELO ARTE',
            numero: product.numeroRegistro.trim(),
          }
        : {
            tipo: 'Outro',
            tipoOutros: 'Sem selo arte',
            numero: product.numeroRegistro.trim(),
          },
    ],
    fotosAvaliacao: product.fotosAvaliacao,
    fotosDivulgacao: product.fotosDivulgacao,
    premiacoes:
      isPremiado && product.comprovantePremiacao
        ? [
            {
              nome: 'Premiação',
              descricao: 'Produto premiado',
              ano: new Date().getFullYear(),
              comprovante: product.comprovantePremiacao,
            },
          ]
        : [],
    valorCentavos: reaisToCentavos(product.valorReais),
    observacoes: product.outrasInformacoes.trim() || undefined,
  }
}

function buildRedesSociais(
  instagram: string,
  facebook: string,
): ProducerSocialNetwork[] {
  const redes: ProducerSocialNetwork[] = []

  const instagramHandle = extractSocialHandle(instagram)
  if (instagramHandle) {
    redes.push({ tipo: 'INSTAGRAM', handle: instagramHandle })
  }

  const facebookHandle = extractSocialHandle(facebook)
  if (facebookHandle) {
    redes.push({ tipo: 'FACEBOOK', handle: facebookHandle })
  }

  return redes
}

function extractSocialHandle(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  try {
    const url = new URL(
      trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    )
    const segment = url.pathname.split('/').filter(Boolean)[0]
    if (segment) {
      return stripSocialHandle(segment)
    }
  } catch {
    // plain handle
  }

  return stripSocialHandle(trimmed)
}

function reaisToCentavos(value: string): number {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  const amount = Number(normalized)

  if (Number.isNaN(amount) || amount < 0) {
    return 0
  }

  return Math.round(amount * 100)
}
