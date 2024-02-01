export interface Message {
  id: string
  text: string
  is_from_user: boolean
  created_at: Date
  has_errored: boolean
}

export interface Conversation {
  messages: Message[]
}

export interface ContextFile {
  id: string
  name: string
  size: number
  last_modified: Date
  content: Blob
}
