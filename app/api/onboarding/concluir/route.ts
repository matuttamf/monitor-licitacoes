import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { enviarEmailSugestoesKeywords } from '@/lib/emails/sugestoes-keywords'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const service = await createServiceClient()

  // Busca perfil + keywords
  const [{ data: profile }, { data: keywords }] = await Promise.all([
    service.from('profiles').select('nome, empresa').eq('id', user.id).single(),
    service.from('keywords').select('termo').eq('user_id', user.id).eq('ativo', true),
  ])

  const keywordsSalvas = (keywords ?? []).map(k => k.termo)
  if (keywordsSalvas.length === 0) return NextResponse.json({ ok: true })

  const empresa = profile?.empresa || profile?.nome || ''
  const nome = profile?.nome || ''

  // Gemini gera sugestões baseadas nas keywords + empresa
  let sugestoes: string[] = []
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `Você é especialista em licitações públicas brasileiras.

Empresa: "${empresa || 'não informada'}"
Palavras-chave já cadastradas: ${keywordsSalvas.map(k => `"${k}"`).join(', ')}

Gere exatamente 12 sugestões de palavras-chave adicionais que essa empresa deveria monitorar para encontrar editais públicos no Brasil.
- Baseie-se no segmento inferido pelas palavras cadastradas
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
    // se Gemini falhar, envia com lista vazia — email não é crítico
  }

  if (sugestoes.length === 0) return NextResponse.json({ ok: true })

  // Envia email (não bloqueia retorno)
  enviarEmailSugestoesKeywords(user.email!, nome, keywordsSalvas, sugestoes).catch(console.error)

  return NextResponse.json({ ok: true })
}
