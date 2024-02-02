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
  const config = useRuntimeConfig()

  const availableModels = useState<LLMModel[]>('models', () => ([]))

  const { data, status } = await useFetch<{ models: OllamaModel[] }>(
    `${config.public.ollamaUrl}/api/tags`
  );

  if (status.value === 'success' && data.value) {
    console.log(data.value.models)
    availableModels.value = data.value.models.map(
      (model) => formatModel(model)
    );
  }

}
