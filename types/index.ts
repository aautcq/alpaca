export interface Message {
  id: string
  text: string
  is_from_user: boolean
  created_at: Date
}

export interface Conversation {
  messages: Message[]
}
