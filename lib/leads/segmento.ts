export function mapearSegmento(cnae: string | null | undefined): string {
  if (!cnae) return 'outros'
  const c = cnae.toLowerCase()
  if (/constru|engenharia|obra|reform|pavimentaç/.test(c))           return 'construção'
  if (/tecnolog|informátic|software|sistema|hardware|ti\b|dados/.test(c)) return 'tecnologia'
  if (/saúde|hospital|médic|farmac|laborat|clínic|enfermag/.test(c)) return 'saúde'
  if (/limpeza|conservaç|higienizaç|saneament|desinfeç/.test(c))     return 'limpeza'
  if (/vigilânc|segurança|monitoram|portaria|armado/.test(c))        return 'segurança'
  if (/transport|logístic|frete|mudança|veícul|frota/.test(c))       return 'transporte'
  if (/aliment|nutriç|refeição|caterinг|merenda|buffet/.test(c))     return 'alimentação'
  if (/consult|assessor|gestão|planejam|auditoria/.test(c))          return 'consultoria'
  if (/educaç|treinament|capacitaç|ensino|curso|escola/.test(c))     return 'educação'
  if (/manutençã|reparo|instalação|calibraç|assistência técn/.test(c)) return 'manutenção'
  if (/paisag|jardim|arborizaç|verde/.test(c))                       return 'jardinagem'
  if (/gráfic|impres|copiaç|editoraç/.test(c))                       return 'gráfica'
  return 'outros'
}
