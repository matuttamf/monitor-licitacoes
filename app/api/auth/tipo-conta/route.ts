import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ tipo: 'anonimo' })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: afiliado } = await admin
    .from('afiliados')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (afiliado) {
    if (afiliado.status === 'bloqueado') return NextResponse.json({ tipo: 'bloqueado' })
    return NextResponse.json({ tipo: 'afiliado' })
  }

  return NextResponse.json({ tipo: 'usuario' })
}
