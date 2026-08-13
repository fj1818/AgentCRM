/**
 * Prompts de arranque y comandos rápidos.
 *
 * Un chat vacío es la peor pantalla de un producto agéntico: el usuario no sabe
 * qué puede pedir. Estas sugerencias son el catálogo visible de capacidades.
 */

export interface Sugerencia {
  icono: string
  titulo: string
  prompt: string
  descripcion: string
  grupo: 'Vender' | 'Analizar' | 'Ejecutar' | 'Aprender'
}

export const SUGERENCIAS: Sugerencia[] = [
  {
    icono: 'sparkles',
    titulo: 'Arma mi plan del día',
    prompt: 'Arma mi plan del día',
    descripcion: 'Prioriza tareas, ofertas calientes y clientes fríos',
    grupo: 'Ejecutar',
  },
  {
    icono: 'briefcase',
    titulo: '¿Cómo va mi portafolio?',
    prompt: '¿Cómo va mi portafolio?',
    descripcion: 'Embudo, pronóstico ponderado y tasa de cierre',
    grupo: 'Analizar',
  },
  {
    icono: 'alert',
    titulo: 'Ofertas estancadas',
    prompt: 'Muéstrame mis ofertas estancadas',
    descripcion: 'Lo que lleva más de 30 días sin moverse',
    grupo: 'Analizar',
  },
  {
    icono: 'flame',
    titulo: 'Clientes en riesgo de fuga',
    prompt: 'Muéstrame clientes en riesgo de fuga',
    descripcion: 'Cartera frágil por salud, NPS y silencio',
    grupo: 'Vender',
  },
  {
    icono: 'plus',
    titulo: 'Crear una oferta',
    prompt: 'Crear una oferta nueva',
    descripcion: 'Formulario listo para capturar y guardar',
    grupo: 'Ejecutar',
  },
  {
    icono: 'chart',
    titulo: '¿Qué producto vendo mejor?',
    prompt: '¿Cómo van mis cierres por producto?',
    descripcion: 'Efectividad y monto ganado por familia',
    grupo: 'Analizar',
  },
  {
    icono: 'calendar',
    titulo: 'Cierres de esta semana',
    prompt: 'Qué ofertas cierran esta semana',
    descripcion: 'Compromisos vigentes y vencidos',
    grupo: 'Ejecutar',
  },
  {
    icono: 'book',
    titulo: 'Playbook de objeciones',
    prompt: 'Muéstrame el playbook de objeciones',
    descripcion: 'Tarjetas de entrenamiento para campo',
    grupo: 'Aprender',
  },
]

/** Comandos con "/" para usuarios que ya conocen la herramienta. */
export const COMANDOS: { comando: string; descripcion: string; prompt: string }[] = [
  { comando: '/dia', descripcion: 'Plan del día priorizado', prompt: 'Arma mi plan del día' },
  { comando: '/portafolio', descripcion: 'Resumen del embudo', prompt: '¿Cómo va mi portafolio?' },
  { comando: '/estancadas', descripcion: 'Ofertas sin movimiento', prompt: 'Muéstrame mis ofertas estancadas' },
  { comando: '/riesgo', descripcion: 'Clientes en riesgo de fuga', prompt: 'Muéstrame clientes en riesgo de fuga' },
  { comando: '/oferta', descripcion: 'Crear una oferta nueva', prompt: 'Crear una oferta nueva' },
  { comando: '/tarea', descripcion: 'Agendar una tarea', prompt: 'Agendar una tarea' },
  { comando: '/cierres', descripcion: 'Ofertas que cierran esta semana', prompt: 'Qué ofertas cierran esta semana' },
  { comando: '/analiza', descripcion: 'Efectividad por producto', prompt: '¿Cómo van mis cierres por producto?' },
  { comando: '/playbook', descripcion: 'Tarjetas de venta', prompt: 'Muéstrame el playbook de objeciones' },
  { comando: '/buscar', descripcion: 'Buscar un cliente por nombre o RFC', prompt: 'Buscar ' },
]
