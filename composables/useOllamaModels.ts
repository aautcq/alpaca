import type { LLMModel } from '~/types'

interface OllamaModel {
  name: string
  details: { parameter_size: string }
  modified_at: string
}

function formatModel(model: OllamaModel) {
  return {
    name: model.name.split(':').slice(0, 1)[0],
    nb_parameters: model.details.parameter_size,
    updated_at: new Date(model.modified_at),
  }
}

export async function useOllamaModels() {
  const port = useState<number>('port', () => 11434)
  const isOllamaUp = useState<boolean>('isOllamaUp', () => false)
  const availableModels = useState<LLMModel[]>('models', () => ([]))
  const ollamaServerUrl = computed(() => `http://localhost:${port.value}`)

  const { status: ollamaStatus } = await useFetch<{ models: OllamaModel[] }>(
    `${ollamaServerUrl.value}`
  );

  isOllamaUp.value = ollamaStatus.value === 'success'

  if (!isOllamaUp.value)
    return

  const { data, status } = await useFetch<{ models: OllamaModel[] }>(
    `${ollamaServerUrl.value}/api/tags`
  );

  if (status.value === 'success' && data.value) {
    availableModels.value = data.value.models.map(
      (model) => formatModel(model)
    );
  }

}
