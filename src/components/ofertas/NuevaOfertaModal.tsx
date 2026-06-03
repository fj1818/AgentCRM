/**
 * Asistente Nueva oferta (2 pasos) — replica RN-146…150 de AppClient.html.
 * Paso 1: Cliente o Prospecto. Paso 2: búsqueda de cliente / captura de prospecto.
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '@/stores'
import { useOfertasStore } from '@/stores/ofertas.store'
import { cn } from '@/utils'
import type { Client } from '@/data/ofertas-seed'

const RFC_LEN: Record<string, number> = { PF: 13, PFAE: 13, PM: 12 }

export function NuevaOfertaModal({ onClose, tipoInicial = '' }: { onClose: () => void; tipoInicial?: '' | 'Cliente' | 'Prospecto' }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const { catalogs, searchClients, createClientOffer, createProspectOffer } = useOfertasStore()
  const familias = Object.keys(catalogs.families).map((id) => ({ id, nombre: catalogs.families[id]! }))

  const [tipo, setTipo] = useState<'' | 'Cliente' | 'Prospecto'>(tipoInicial)
  const [err, setErr] = useState('')

  // Cliente
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState<Client[]>([])
  const [clienteSel, setClienteSel] = useState<Client | null>(null)
  const [famCliente, setFamCliente] = useState('')

  // Prospecto
  const [pNombre, setPNombre] = useState('')
  const [pTipoPersona, setPTipoPersona] = useState('')
  const [pRfc, setPRfc] = useState('')
  const [pCorreo, setPCorreo] = useState('')
  const [pTel, setPTel] = useState('')
  const [famPros, setFamPros] = useState('')

  const inputCls = cn('w-full px-3 py-2 text-sm rounded-lg border', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')
  const lblCls = cn('block text-xs mb-1 mt-2', isHey ? 'text-gray-400' : 'text-gray-500')

  function buscar(v: string) {
    setQ(v)
    setResultados(v.trim().length >= 2 ? searchClients(v) : [])
  }

  function guardarCliente() {
    if (!clienteSel) { setErr('Selecciona un cliente de la búsqueda.'); return }
    if (!famCliente) { setErr('Selecciona una familia de producto.'); return }
    createClientOffer({ rfc: clienteSel.rfc, idFamilia: famCliente })
    onClose()
  }

  function guardarProspecto() {
    const rfc = pRfc.trim().toUpperCase()
    if (!pNombre.trim()) { setErr('Captura el nombre completo.'); return }
    if (!pTipoPersona) { setErr('Selecciona el tipo de persona.'); return }
    if (!rfc) { setErr('Captura el RFC.'); return }
    if (!/^[A-ZÑ&0-9]+$/.test(rfc)) { setErr('El RFC debe ser alfanumérico (A-Z, 0-9).'); return }
    if (rfc.length !== (RFC_LEN[pTipoPersona] || 13)) { setErr(`El RFC de ${pTipoPersona} debe tener ${RFC_LEN[pTipoPersona]} caracteres.`); return }
    if (!pCorreo.trim() && !pTel.trim()) { setErr('Captura al menos un correo o un teléfono.'); return }
    if (!famPros) { setErr('Selecciona una familia de producto.'); return }
    createProspectOffer({ nombre: pNombre.trim(), tipoPersona: pTipoPersona, rfc, correo: pCorreo.trim(), telefono: pTel.trim(), idFamilia: famPros })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={cn('w-full max-w-lg rounded-2xl border p-5', isHey ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-orange-200')} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn('text-lg font-bold', isHey ? 'text-white' : 'text-gray-900')}>
            {tipo === '' ? 'Nueva oferta' : `Nueva oferta — ${tipo}`}
          </h2>
          <button onClick={onClose} className={cn('p-2 rounded-lg', isHey ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-orange-50 text-gray-500')}><X className="w-5 h-5" /></button>
        </div>

        {tipo === '' && (
          <div className="space-y-3">
            <p className={cn('text-sm', isHey ? 'text-gray-300' : 'text-gray-600')}>¿La oferta es de un cliente o de un prospecto?</p>
            <div className="grid grid-cols-2 gap-3">
              {(['Cliente', 'Prospecto'] as const).map((t) => (
                <button key={t} onClick={() => { setTipo(t); setErr('') }}
                  className={cn('p-4 rounded-xl border text-left', isHey ? 'border-white/10 hover:bg-white/5 text-white' : 'border-orange-200 hover:bg-orange-50 text-gray-800')}>
                  <div className="text-2xl mb-1">{t === 'Cliente' ? '🏦' : '🌱'}</div>
                  <div className="font-semibold">{t}</div>
                  <div className={cn('text-xs', isHey ? 'text-gray-400' : 'text-gray-500')}>
                    {t === 'Cliente' ? 'Buscar un cliente existente por nombre o RFC.' : 'Capturar un nuevo prospecto.'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tipo === 'Cliente' && (
          <div>
            <label className={lblCls}>Buscar cliente (nombre o RFC)</label>
            <input className={inputCls} value={q} onChange={(e) => buscar(e.target.value)} placeholder="Escribe nombre o RFC…" />
            {resultados.length > 0 && !clienteSel && (
              <div className={cn('mt-1 max-h-40 overflow-y-auto rounded-lg border', isHey ? 'border-white/10' : 'border-orange-200')}>
                {resultados.map((c) => (
                  <button key={c.rfc} onClick={() => { setClienteSel(c); setQ(c.nombre); setResultados([]) }}
                    className={cn('block w-full text-left px-3 py-2 text-sm', isHey ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-orange-50 text-gray-700')}>
                    <b>{c.nombre}</b> <span className={isHey ? 'text-gray-400' : 'text-gray-500'}>· {c.rfc}{c.numero ? ` · ${c.numero}` : ''}</span>
                  </button>
                ))}
              </div>
            )}
            {clienteSel && <div className={cn('mt-2 text-sm', isHey ? 'text-cyan-300' : 'text-orange-600')}>Cliente: <b>{clienteSel.nombre}</b> ({clienteSel.rfc})</div>}
            <label className={lblCls}>Familia de producto</label>
            <select className={inputCls} value={famCliente} onChange={(e) => setFamCliente(e.target.value)}>
              <option value="">— Selecciona familia —</option>
              {familias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
            </select>
          </div>
        )}

        {tipo === 'Prospecto' && (
          <div>
            <label className={lblCls}>Nombre completo</label>
            <input className={inputCls} value={pNombre} onChange={(e) => setPNombre(e.target.value)} />
            <label className={lblCls}>Tipo de persona</label>
            <select className={inputCls} value={pTipoPersona} onChange={(e) => setPTipoPersona(e.target.value)}>
              <option value="">— Selecciona —</option>
              <option value="PF">PF — Persona Física (RFC 13)</option>
              <option value="PFAE">PFAE — Persona Física con Actividad Empresarial (RFC 13)</option>
              <option value="PM">PM — Persona Moral (RFC 12)</option>
            </select>
            <label className={lblCls}>RFC</label>
            <input className={inputCls} value={pRfc} maxLength={RFC_LEN[pTipoPersona] || 13} onChange={(e) => setPRfc(e.target.value.toUpperCase())} />
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lblCls}>Correo</label><input className={inputCls} value={pCorreo} onChange={(e) => setPCorreo(e.target.value)} /></div>
              <div><label className={lblCls}>Teléfono</label><input className={inputCls} value={pTel} onChange={(e) => setPTel(e.target.value)} /></div>
            </div>
            <label className={lblCls}>Familia de producto</label>
            <select className={inputCls} value={famPros} onChange={(e) => setFamPros(e.target.value)}>
              <option value="">— Selecciona familia —</option>
              {familias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
            </select>
          </div>
        )}

        {err && <p className="text-sm text-red-500 mt-2">{err}</p>}

        {tipo !== '' && (
          <div className="flex justify-between mt-4">
            <button onClick={() => { setTipo(''); setErr('') }} className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>‹ Cambiar tipo</button>
            <button onClick={tipo === 'Cliente' ? guardarCliente : guardarProspecto}
              className={cn('px-4 py-2 text-sm rounded-lg font-medium', isHey ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-orange-500 text-white hover:bg-orange-600')}>
              Crear oferta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
