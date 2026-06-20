import { NextResponse } from 'next/server'
import { criarTodosPlanosMP } from '@/lib/mercadopago'

export async function POST(request: Request) {
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const ids = await criarTodosPlanosMP()
    return NextResponse.json({
      sucesso: true,
      ids,
      instrucoes: 'Adicione estas variáveis na Vercel e faça redeploy:',
      variaveis: Object.entries(ids).map(([k, v]) => `${k}=${v}`).join('\n'),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
