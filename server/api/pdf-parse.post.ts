import { WebPDFLoader } from 'langchain/document_loaders/web/pdf'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import { coerceToArrayBuffer } from 'fido2-lib'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const blob = new Blob([coerceToArrayBuffer(body.data, 'pdf')])

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.mjs')
  // const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  // pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

  const loader = new WebPDFLoader(blob, { parsedItemSeparator: '', pdfjs: () => pdfjs })
  const document = await loader.load()
  return { data: document }
})
