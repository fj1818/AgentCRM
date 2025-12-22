/**
 * Lista de mensajes del chat
 */

import { type RefObject } from 'react'
import type { ChatMessage as ChatMessageType } from '@/types'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { WelcomeMessage } from './WelcomeMessage'

interface MessageListProps {
  messages: ChatMessageType[]
  isLoading: boolean
  messagesEndRef: RefObject<HTMLDivElement>
}

export function MessageList({
  messages,
  isLoading,
  messagesEndRef,
}: MessageListProps) {
  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {isEmpty ? (
        <WelcomeMessage />
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

