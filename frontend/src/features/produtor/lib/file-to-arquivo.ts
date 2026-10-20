import type { ProducerFile } from '../types'

const MAX_FILE_BYTES = 700 * 1024

export class FileConversionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileConversionError'
  }
}

export async function fileToArquivo(
  file: File,
  allowedContentTypes: readonly string[],
): Promise<ProducerFile> {
  if (file.size > MAX_FILE_BYTES) {
    throw new FileConversionError(
      `O arquivo "${file.name}" excede 700 KB.`,
    )
  }

  const contentType = file.type.trim().toLowerCase()

  if (!allowedContentTypes.includes(contentType)) {
    throw new FileConversionError(
      `Tipo de arquivo não suportado: ${file.name}`,
    )
  }

  const url = await readAsDataUrl(file)

  return {
    url,
    contentType,
    nomeOriginal: file.name,
  }
}

export async function filesToArquivos(
  fileList: FileList | null,
  allowedContentTypes: readonly string[],
  maxFiles: number,
): Promise<ProducerFile[]> {
  if (!fileList || fileList.length === 0) {
    return []
  }

  const files = Array.from(fileList).slice(0, maxFiles)
  const resultados: ProducerFile[] = []

  for (const file of files) {
    resultados.push(await fileToArquivo(file, allowedContentTypes))
  }

  return resultados
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new FileConversionError('Falha ao ler o arquivo.'))
        return
      }

      resolve(reader.result)
    }

    reader.onerror = () => {
      reject(new FileConversionError('Falha ao ler o arquivo.'))
    }

    reader.readAsDataURL(file)
  })
}
