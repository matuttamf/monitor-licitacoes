import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
const REPO_OWNER  = 'matuttamf'
const REPO_NAME   = 'monitor-licitacoes'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { workflow, inputs } = await request.json()
  if (!workflow) return NextResponse.json({ error: 'workflow obrigatório' }, { status: 400 })

  const token = process.env.GITHUB_ACTIONS_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'GITHUB_ACTIONS_TOKEN não configurado na Vercel' }, { status: 500 })
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${workflow}/dispatches`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main', ...(inputs ? { inputs } : {}) }),
  })

  if (res.status === 204) {
    return NextResponse.json({ ok: true, msg: 'Workflow disparado com sucesso. Acompanhe em github.com/matuttamf/monitor-licitacoes/actions' })
  }

  const erro = await res.text()
  return NextResponse.json({ error: `GitHub retornou ${res.status}: ${erro}` }, { status: 500 })
}
