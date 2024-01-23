import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { AIMessage, HumanMessage } from '@langchain/core/messages'

import type { Conversation, Message } from '~/types'

export function useLlm() {
  const config = useRuntimeConfig()

  const prePrompt = useState<string>('prePromt', () => 'You are a nice chatbot.')

  const chatModel = new ChatOllama({
    baseUrl: config.public.ollamaUrl,
    model: config.public.ollamaModel,
  })

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', prePrompt.value],
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
  ])

  const formatChatHistory = (messages: Message[]) => {
    const history = messages
      .filter(message => message.text.length > 0) // to remove the new empty answer
      .slice(0, -1) // to remove the last question
    if (!history?.length)
      return []
    return history
      .map(
        message => message.is_from_user ? new HumanMessage(message.text) : new AIMessage(message.text),
      )
  }

  const streamAnswer = async (input: string, conversation: Conversation) => {
    return await prompt.pipe(chatModel).pipe(new StringOutputParser()).stream({
      input,
      chat_history: formatChatHistory(conversation.messages),
    })
  }

  return streamAnswer
}
