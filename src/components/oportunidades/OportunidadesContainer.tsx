/**
 * Oportunidades Container (antes Clientes)
 * Layout dividido: Filtros y Tabla (Izq) + Chat Agente (Der)
 */

import { useState } from 'react'
import { Users } from 'lucide-react'
import { useUIStore, useClientesStore } from '@/stores'
import { cn } from '@/utils'
import { OportunidadesFilters, type FiltrosOportunidades } from './OportunidadesFilters'
import { OportunidadesTable } from './OportunidadesTable'
import { OportunidadesChatSidebar } from './OportunidadesChatSidebar'
import { ofertasClientesData } from '@/data/ofertasClientesData'
import { buscarClientes, obtenerClientePorIde, obtenerClientePorRfc } from '@/data/clientesData'

export function OportunidadesContainer() {
  const { theme } = useUIStore()
  const { filtros: storeFiltros, setFiltros: setStoreFiltros } = useClientesStore()
  const isHey = theme === 'hey'
  
  // Estado local para filtros adicionales o UI
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosOportunidades>({
    busqueda: storeFiltros.busqueda,
    tipoPersona: storeFiltros.tipoPersona,
    soloActivos: storeFiltros.soloActivos,
    promotor: ''
  })

  // Estado de ofertas (Elevado desde OportunidadesTable)
  const [ofertas, setOfertas] = useState(() => ofertasClientesData)
  
  // Sincronizar cambios de filtros locales con el store de clientes
  const handleFiltroChange = (nuevosFiltros: Partial<FiltrosOportunidades>) => {
    const actualizados = { ...filtrosLocales, ...nuevosFiltros }
    setFiltrosLocales(actualizados)
    
    // Actualizar store global para que useClientesStore filtre la data
    setStoreFiltros({
      busqueda: actualizados.busqueda,
      tipoPersona: actualizados.tipoPersona,
      soloActivos: actualizados.soloActivos
    })
  }

  // Función para actualizar una oferta (pasada al Chat y a la Tabla)
  const handleUpdateOferta = (idOferta: string, campo: string, valor: any): boolean => {
    const index = ofertas.findIndex(o => o.idOferta === idOferta)
    
    if (index === -1) return false
    
    const nuevasOfertas = [...ofertas]
    const oferta = nuevasOfertas[index]
    
    if (!oferta) return false
    
    // Mapear campos
    if (campo === 'etapa') {
      const etapasValidas = ['No contactado', 'Interesado', 'Negociación', 'Descartado', 'Fabrica', 'Entregado', 'Timbrado'];
      if (etapasValidas.includes(valor)) {
        oferta.etapa = valor
      } else {
        console.warn(`Etapa inválida: ${valor}`);
        return false;
      }
    } else if (campo === 'montoOferta') {
      const monto = typeof valor === 'string' ? parseFloat(valor.replace(/[^0-9.]/g, '')) : valor
      if (monto > 0) {
        oferta.montoOferta = monto
      } else {
        console.warn(`Monto inválido: ${valor}`);
        return false;
      }
    } else if (campo === 'producto' || campo === 'productoInteres') {
        oferta.productoInteres = valor
        
        // Inferir familia automáticamente (siempre, no solo si es válido exacto)
        const prodUpper = String(valor).toUpperCase();
        if (prodUpper.includes('TARJETA') || prodUpper.includes('TDC') || prodUpper.includes('CREDITO')) {
            oferta.familiaProducto = 'TDC';
        } else if (prodUpper.includes('TPV') || prodUpper.includes('TERMINAL')) {
            oferta.familiaProducto = 'TPV';
        } else if (prodUpper.includes('NOMINA') || prodUpper.includes('CHEQUE') || prodUpper.includes('CUENTA')) {
            oferta.familiaProducto = 'Cheques';
        }

    } else if (campo === 'familiaProducto') {
        const familiasValidas = ['TDC', 'TPV', 'Cheques'];
        if (familiasValidas.includes(valor)) {
            oferta.familiaProducto = valor;
        } else {
            return false;
        }
    }
    
    setOfertas(nuevasOfertas)
    return true
  }

  // Función para crear una nueva oferta desde el chat
  const handleCreateOferta = (datos: any): boolean => {
      console.log('handleCreateOferta datos recibidos:', datos);
      let clienteEncontrado = null;

      // 1. Buscar por IDE
      if (datos.ide) {
          const ideNum = parseInt(datos.ide.toString().replace(/\D/g, ''));
          if (!isNaN(ideNum)) {
              clienteEncontrado = obtenerClientePorIde(ideNum);
          }
      }

      // 2. Buscar por RFC
      if (!clienteEncontrado && datos.rfc) {
          clienteEncontrado = obtenerClientePorRfc(datos.rfc.toString().toUpperCase());
      }

      // 3. Buscar por Nombre
      if (!clienteEncontrado && datos.nombre) {
          const resultados = buscarClientes(datos.nombre);
          if (resultados.length > 0) {
              // Tomamos el primero por defecto
              clienteEncontrado = resultados[0];
          }
      }

      // Inferir familia basada en el producto si no viene definida
      const producto = datos.producto || 'Producto Genérico';
      let familia = datos.familia;
      
      if (!familia || familia === 'Otros') {
          const prodUpper = producto.toUpperCase();
          if (prodUpper.includes('TDC') || prodUpper.includes('TARJETA')) familia = 'TDC';
          else if (prodUpper.includes('TPV') || prodUpper.includes('TERMINAL')) familia = 'TPV';
          else if (prodUpper.includes('CHEQUE') || prodUpper.includes('CUENTA')) familia = 'Cheques';
          else familia = 'Otros';
      }

      // Obtener datos del promotor
      const numeroPromotor = clienteEncontrado ? clienteEncontrado.numeroPromotor : '017577';
      // Mapeo simple de ID a Nombre (simulado)
      const mapPromotores: Record<string, string> = {
          '017577': 'Roberto Hernández',
          '023145': 'María del Carmen López',
          '034892': 'Alejandro González',
          '045123': 'Ana Sofía Martínez',
          '056789': 'Carlos Alberto Ruiz',
          '067890': 'Lucía Fernández'
      };
      const promotorNombre = mapPromotores[numeroPromotor] || 'Promotor Asignado';

      const nuevaOferta = {
          idOferta: `Of${Date.now()}`,
          ide: clienteEncontrado ? clienteEncontrado.ide : (datos.ide || 99999999),
          nombreRazonSocial: clienteEncontrado ? clienteEncontrado.nombreRazonSocial : (datos.nombre || 'Cliente Nuevo'),
          rfc: clienteEncontrado ? clienteEncontrado.rfc : (datos.rfc || ''),
          productoInteres: producto, 
          familiaProducto: familia,
          montoOferta: datos.monto || 0,
          etapa: 'No contactado',
          probabilidad: 'Alta',
          fechaAlta: new Date().toLocaleDateString('es-MX'),
          numeroPromotor: numeroPromotor, // Asignar ID correcto
          promotorNombre: promotorNombre, // Asignar Nombre correcto
          campaña: 'Campaña Chat',
          descripcionOferta: datos.descripcion || 'Oferta creada desde chat'
      }
      
      // @ts-ignore
      setOfertas(prev => [nuevaOferta, ...prev])
      return true
  }
  
  return (
    <div className={cn(
      "flex h-full overflow-hidden transition-colors duration-300",
      isHey ? "bg-[#0f1219]" : "bg-gray-50"
    )}>
      {/* Panel Izquierdo: Tubería de Oportunidades */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className={cn(
          "px-6 py-5 border-b shrink-0",
          isHey ? "border-white/10 bg-[#1a1f2e]" : "border-orange-100 bg-white"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "p-2 rounded-lg",
              isHey ? "bg-cyan-500/10 text-cyan-400" : "bg-orange-100 text-orange-600"
            )}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className={cn("text-2xl font-bold", isHey ? "text-white" : "text-gray-900")}>
                Cartera de Oportunidades
              </h1>
              <p className={cn("text-sm", isHey ? "text-gray-400" : "text-gray-500")}>
                Gestiona y analiza tus clientes activos y potenciales
              </p>
            </div>
          </div>
        </div>
        
        {/* Contenido Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Barra de Búsqueda Principal */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, promotor..."
              value={filtrosLocales.busqueda}
              onChange={(e) => handleFiltroChange({ busqueda: e.target.value })}
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-lg transition-all shadow-sm focus:ring-2 search-cancel:text-gray-400",
                isHey 
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500/50" 
                  : "bg-white border-orange-100 text-gray-900 placeholder-gray-400 focus:ring-orange-500/20 focus:border-orange-400"
              )}
            />
          </div>

          <OportunidadesFilters 
            filtros={filtrosLocales} 
            onFiltroChange={handleFiltroChange} 
          />
          
          <OportunidadesTable 
            filtros={filtrosLocales} 
            data={ofertas}
            onUpdateOferta={handleUpdateOferta}
          />
        </div>
      </div>
      
      {/* Panel Derecho: Chat Agente (Ancho Fijo) */}
      <div className="w-[450px] shrink-0 h-full border-l border-white/10">
        <OportunidadesChatSidebar 
            onUpdateOferta={handleUpdateOferta} 
            onCreateOferta={handleCreateOferta}
        />
      </div>
    </div>
  )
}
