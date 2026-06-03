import { type RefObject } from 'react'
import type { ChatMessage as ChatMessageType } from '@/types'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { WelcomeMessage } from './WelcomeMessage'
import { DynamicChart } from '@/components/charts'
import { FilterableProductTable } from './FilterableProductTable'
import { SmartResultTable } from './SmartResultTable'
import { KpiCards, InsightCallout } from './ChatInsights'

interface GraficoData {
  tipo: 'pie' | 'bar' | 'line' | 'column' | 'polar'
  titulo: string
  datos: { x: string; value: number }[]
}

interface TablaData {
  columnas: string[]
  filas: Record<string, unknown>[]
  titulo?: string
  paginate?: boolean
  pageSize?: number
}

interface MessageListProps {
  messages: ChatMessageType[]
  isLoading: boolean
  messagesEndRef: RefObject<HTMLDivElement>
  ultimoGrafico?: GraficoData | null
  ultimaTabla?: TablaData | null
  onSendMessage?: (message: string) => void
}

export function MessageList({ messages, isLoading, messagesEndRef, onSendMessage }: MessageListProps) {
  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
      {isEmpty ? (
        <WelcomeMessage onSend={onSendMessage} />
      ) : (
        <>
          {messages.map((message) => {
            const grafico = message.grafico as GraficoData | null
            const tabla = message.tabla as TablaData | null
            const esAsistente = message.role === 'assistant'

            return (
              <div key={message.id}>
                <ChatMessage message={message} />

                {/* Tarjetas KPI */}
                {esAsistente && message.kpis && message.kpis.length > 0 && (
                  <KpiCards kpis={message.kpis} />
                )}

                {/* Tabla de resultados */}
                {esAsistente && tabla && tabla.filas?.length > 0 && (() => {
                  const esDistribucion =
                    tabla.titulo?.toLowerCase().includes('distribución') ||
                    tabla.titulo?.toLowerCase().includes('distribucion')
                  return esDistribucion ? (
                    <div className="my-4">
                      <FilterableProductTable data={tabla.filas} columns={tabla.columnas} titulo={tabla.titulo} />
                    </div>
                  ) : (
                    <SmartResultTable tabla={tabla} />
                  )
                })()}

                {/* Multi-tabla */}
                {esAsistente && message.tablas && message.tablas.length > 0 &&
                  message.tablas.map((t, index) => (
                    <SmartResultTable
                      key={index}
                      tabla={{ columnas: t.columnas, filas: t.datos, titulo: t.titulo }}
                    />
                  ))}

                {/* Gráfico */}
                {esAsistente && grafico && grafico.datos?.length > 0 && (
                  <div className="max-w-3xl mx-auto animate-fade-in my-4">
                    <DynamicChart tipo={grafico.tipo} titulo={grafico.titulo} datos={grafico.datos} height={360} />
                  </div>
                )}

                {/* Insight analítico ("el porqué") */}
                {esAsistente && message.insight && <InsightCallout texto={message.insight} />}
              </div>
            )
          })}

          {isLoading && <TypingIndicator />}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
