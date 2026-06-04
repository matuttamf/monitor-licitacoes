export interface LicitacaoRaw {
  fonte: string
  numero_edital: string
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string // formato YYYY-MM-DD
  url: string
  estado?: string
  cidade?: string
}
