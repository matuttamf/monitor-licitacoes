/**
 * Cron: limpar-alertas
 * Horário: dia 1 de cada mês às 3h
 *
 * Remove alertas já enviados com mais de 30 dias.
 * Mantém alertas não enviados (pendentes) indefinidamente — eles são necessários
 * para o fluxo de envio normal.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const trintaDiasAtras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const { count, error } = await supabase
      .from('alertas')
      .delete({ count: 'exact' })
      .neq('canais', '{}')
      .lt('enviado_em', trintaDiasAtras)

    if (error) throw new Error(error.message)

    const removidos = count ?? 0
    console.log(`limpar-alertas: ${removidos} alertas removidos`)
    await registrarCronLog({ job: 'limpar-alertas', status: 'ok', mensagem: `${removidos} alertas antigos removidos` })
    return NextResponse.json({ ok: true, removidos })

  } catch (e) {
    const erro = String(e)
    await registrarCronLog({ job: 'limpar-alertas', status: 'erro', mensagem: erro })
    return NextResponse.json({ ok: false, erro }, { status: 500 })
  }
}
