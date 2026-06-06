export interface LicitacaoRaw {
  fonte: string
  /** Identificador único nesta fonte. Usar external_id OU numero_edital (ou ambos). */
  numero_edital?: string
  external_id?: string
  orgao: string
  objeto: string
  titulo?: string
  valor_estimado?: number | null
  data_abertura?: string | null // formato YYYY-MM-DD
  url: string
  estado?: string | null
  cidade?: string | null
  municipio?: string | null
}
