import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { WebPDFLoader } from 'langchain/document_loaders/web/pdf'
import { formatDocumentsAsString } from 'langchain/util/document'
import { Document } from '@langchain/core/documents'
import type { ContextFile, Conversation, Message, LLMModel } from '~/types'

function formatChatHistory(messages: Message[]) {
  const history = messages
    .filter(message => message.text.length > 0) // to remove the new empty answer
    .slice(0, -1) // to remove the last question
  if (!history?.length)
    return []
  return history
    .map((message) => {
      return message.is_from_user ? new HumanMessage(message.text) : new AIMessage(message.text)
    })
}

export async function useLlm() {
  const port = useState<number>('port')
  const prePrompt = useState<string>('prePromt', () => 'You are a nice chatbot.')
  const savedFiles = useState<ContextFile[]>('files', () => ([]))
  const availableModels = useState<LLMModel[]>('models')
  const model = useState<LLMModel>('model', () => availableModels.value[0])

  const ollamaServerUrl = computed(() => `http://localhost:${port.value}`)

  const loadedFiles = savedFiles.value.map(async (file) => {
    let loader: TextLoader | WebPDFLoader | null = null
    if (file.content.type === 'text/plain')
      loader = new TextLoader(file.content)
    else if (file.content.type === 'application/pdf')
      loader = new WebPDFLoader(file.content) // not working yet

    return loader
      ? await loader.load()
      : Promise.resolve([new Document({ pageContent: '' })]) // empty document
  })

  const docs = (await Promise.all(loadedFiles)).flat()

  const chatModel = new ChatOllama({
    baseUrl: ollamaServerUrl.value,
    model: model.value.name,
  })

  // create prompt
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', prePrompt.value],
    ['system', `Use the following context to answer the user:
      <context>
        {context}
      </context>
    `],
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
  ])

  return async (input: string, conversation: Conversation) => {
    return await prompt.pipe(chatModel).pipe(new StringOutputParser()).stream({
      input,
      chat_history: formatChatHistory(conversation.messages),
      context: formatDocumentsAsString(docs),
    })
  }
}
