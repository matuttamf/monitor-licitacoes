import { NextRequest, NextResponse } from 'next/server'
import { verificarCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 })
  return NextResponse.json({ ok: true, msg: 'desativado' })
}
