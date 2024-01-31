import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { WebPDFLoader } from 'langchain/document_loaders/web/pdf'
import { formatDocumentsAsString } from 'langchain/util/document'
import type { Document } from '@langchain/core/documents'
import type { Conversation, Message } from '~/types'

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
  const config = useRuntimeConfig()

  const prePrompt = useState<string>('prePromt', () => 'You are a nice chatbot.')

  const savedFile = useState<{ name: string, content: Blob }>('file', () => ({
    name: '',
    content: new Blob(),
  }))

  // file loader
  let loader: TextLoader | WebPDFLoader | null = null
  let docs: Document[] = []

  if (savedFile.value.content.type === 'text/plain')
    loader = new TextLoader(savedFile.value.content)
  else if (savedFile.value.content.type === 'application/pdf')
    loader = new WebPDFLoader(savedFile.value.content) // not working yet

  if (loader)
    docs = await loader.load()

  const chatModel = new ChatOllama({
    baseUrl: config.public.ollamaUrl,
    model: config.public.ollamaModel,
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
