import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { enviarEmailSugestoesKeywords } from '@/lib/emails/sugestoes-keywords'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function buscarCnaes(cnpj: string): Promise<string[]> {
  try {
    const res = await fetch(`https://minhareceita.org/${cnpj.replace(/\D/g, '')}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MonitorLicitacoes/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const principal = data.atividade_principal ?? []
    const secundarias = data.atividades_secundarias ?? []
    return [...principal, ...secundarias]
      .map((a: { text?: string }) => a.text ?? '')
      .filter(Boolean)
      .slice(0, 6)
  } catch {
    return []
  }
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const service = await createServiceClient()

  const [{ data: profile }, { data: keywords }] = await Promise.all([
    service.from('profiles').select('nome, empresa, cnpj').eq('id', user.id).single(),
    service.from('keywords').select('termo').eq('user_id', user.id).eq('ativo', true),
  ])

  const keywordsSalvas = (keywords ?? []).map(k => k.termo)
  if (keywordsSalvas.length === 0) return NextResponse.json({ ok: true })

  const nome = profile?.nome || ''

  // Enriquece com CNAEs se CNPJ disponível
  const cnaes = profile?.cnpj ? await buscarCnaes(profile.cnpj) : []

  let sugestoes: string[] = []
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const contexto = cnaes.length > 0
      ? `CNAEs da empresa: ${cnaes.join('; ')}`
      : `Empresa: "${profile?.empresa || profile?.nome || 'não informada'}"`

    const prompt = `Você é especialista em licitações públicas brasileiras.

${contexto}
Palavras-chave já cadastradas: ${keywordsSalvas.map(k => `"${k}"`).join(', ')}

Gere exatamente 12 sugestões de palavras-chave adicionais que essa empresa deveria monitorar para encontrar editais públicos no Brasil.
- Baseie-se ${cnaes.length > 0 ? 'nos CNAEs informados' : 'no segmento inferido pelas palavras cadastradas'}
- Varie entre termos específicos e mais abrangentes do mesmo setor
- Use termos que aparecem frequentemente em editais governamentais brasileiros
- Não repita as palavras já cadastradas
- Retorne APENAS um array JSON com as 12 strings, sem explicação. Exemplo: ["term1","term2"]`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed)) {
        sugestoes = parsed.slice(0, 12).map(s => String(s).toLowerCase())
      }
    }
  } catch {
    // Gemini falhou — não bloqueia o fluxo
  }

  if (sugestoes.length === 0) return NextResponse.json({ ok: true })

  enviarEmailSugestoesKeywords(user.email!, nome, keywordsSalvas, sugestoes).catch(console.error)

  return NextResponse.json({ ok: true })
}
