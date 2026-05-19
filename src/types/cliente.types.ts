/**
 * Tipos para la entidad Cliente
 */

export type TipoPersona = 'Persona Moral' | 'Persona Fisica con Actividad Empresarial' | 'Persona Fisica';

export interface Cliente {
  /** Valor numérico de 8 cifras */
  ide: number;
  /** 13 dígitos para personas físicas, 12 para persona moral */
  rfc: string;
  /** Texto de hasta 500 caracteres */
  nombreRazonSocial: string;
  /** Fecha en formato dd/mm/yyyy - obligatorio */
  fechaAlta: string;
  /** Fecha en formato dd/mm/yyyy - opcional */
  fechaBaja?: string;
  /** Tipo de persona */
  tipoPersona: TipoPersona;
  /** ID único de 18 caracteres que inicia con "Pr" */
  idProspecto: string;
  /** ID único de 18 caracteres que inicia con "Cl" */
  idCliente: string;
  /** Número de promotor asignado (6 dígitos) */
  numeroPromotor: string;
}

export interface ClientesState {
  clientes: Cliente[];
  isLoading: boolean;
  error: string | null;
  selectedCliente: Cliente | null;
  filtros: ClientesFiltros;
}

export interface ClientesFiltros {
  busqueda: string;
  tipoPersona: TipoPersona | 'todos';
  soloActivos: boolean;
}
