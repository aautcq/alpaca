import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

export function useLlm(
  prePrompt = 'You are a world class technical documentation writer.',
) {
  const config = useRuntimeConfig()

  const outputParser = new StringOutputParser()

  const chatModel = new ChatOllama({
    baseUrl: config.public.ollamaUrl,
    model: config.public.ollamaModel,
  })

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', prePrompt],
    ['user', '{input}'],
  ])

  return prompt.pipe(chatModel).pipe(outputParser)
}
