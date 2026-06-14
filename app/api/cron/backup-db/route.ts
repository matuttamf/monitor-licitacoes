/**
 * Cron: backup-db
 * Horário: domingos às 2h
 *
 * Exporta tabelas críticas para Supabase Storage (bucket "backups").
 * Se GOOGLE_SERVICE_ACCOUNT_JSON e GOOGLE_DRIVE_BACKUP_FOLDER_ID estiverem
 * configurados na Vercel, também envia o arquivo ao Google Drive.
 *
 * Tabelas exportadas: profiles, campanhas, configuracoes, cron_logs (7d)
 * Retém os últimos 12 backups no Storage (apaga mais antigos).
 *
 * Setup Google Drive (opcional):
 *   1. Google Cloud Console → criar projeto → habilitar Drive API
 *   2. IAM → criar Service Account → baixar JSON da chave
 *   3. Google Drive → criar pasta "Backups Monitor Licitações" → compartilhar com o e-mail da service account
 *   4. Vercel env vars:
 *        GOOGLE_SERVICE_ACCOUNT_JSON = <conteúdo do arquivo JSON da chave, minificado>
 *        GOOGLE_DRIVE_BACKUP_FOLDER_ID = <ID da pasta no Drive (parte da URL)>
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { createSign } from 'node:crypto'
import { verificarCronAuth } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 300

// ─── Google Drive helpers ──────────────────────────────────────────────────

interface ServiceAccount {
  client_email: string
  private_key:  string
}

async function getGoogleAccessToken(saJson: string): Promise<string | null> {
  try {
    const sa = JSON.parse(saJson) as ServiceAccount
    const now = Math.floor(Date.now() / 1000)

    const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({
      iss:   sa.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud:   'https://oauth2.googleapis.com/token',
      exp:   now + 3600,
      iat:   now,
    })).toString('base64url')

    const unsigned  = `${header}.${payload}`
    const sign      = createSign('RSA-SHA256')
    sign.update(unsigned)
    const signature = sign.sign(sa.private_key, 'base64url')
    const jwt       = `${unsigned}.${signature}`

    const res  = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion:  jwt,
      }),
    })
    const data = await res.json() as { access_token?: string }
    return data.access_token ?? null
  } catch { return null }
}

async function uploadToDrive(token: string, folderId: string, fileName: string, content: string): Promise<boolean> {
  const metadata = JSON.stringify({ name: fileName, parents: [folderId] })
  const boundary = 'bkp_boundary'
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    content,
    `--${boundary}--`,
  ].join('\r\n')

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  })
  return res.ok
}

// ─── Supabase Storage helpers ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function listarBackupsAntigos(supabase: any): Promise<string[]> {
  const { data } = await supabase.storage.from('backups').list('', {
    limit: 100, sortBy: { column: 'name', order: 'asc' },
  })
  return ((data ?? []) as { name: string }[]).map(f => f.name).filter(n => n.endsWith('.json'))
}

// ─── Main ─────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const ts       = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const fileName = `backup-${ts}.json`
  const resultado: Record<string, unknown> = { arquivo: fileName }

  try {
    // Coleta tabelas em paralelo
    const [
      { data: profiles },
      { data: campanhas },
      { data: configuracoes },
      { data: cron_logs },
      { count: totalLeads },
      { count: totalLicitacoes },
    ] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('campanhas').select('*'),
      supabase.from('configuracoes').select('*'),
      supabase.from('cron_logs')
        .select('*')
        .gte('criado_em', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
        .order('criado_em', { ascending: false })
        .limit(500),
      supabase.from('leads').select('*', { count: 'estimated', head: true }),
      supabase.from('licitacoes').select('*', { count: 'exact', head: true }),
    ])

    const payload = JSON.stringify({
      gerado_em:       new Date().toISOString(),
      totais:          { leads: totalLeads ?? 0, licitacoes: totalLicitacoes ?? 0 },
      profiles:        profiles        ?? [],
      campanhas:       campanhas       ?? [],
      configuracoes:   configuracoes   ?? [],
      cron_logs:       cron_logs       ?? [],
    }, null, 2)

    // Upload para Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from('backups')
      .upload(fileName, Buffer.from(payload, 'utf-8'), {
        contentType:  'application/json',
        cacheControl: '3600',
        upsert:       false,
      })

    if (uploadErr) {
      throw new Error(`Storage upload: ${uploadErr.message}`)
    }
    resultado.storage = 'ok'

    // Apaga backups além dos 12 mais recentes
    const todos = await listarBackupsAntigos(supabase)
    if (todos.length > 12) {
      const antigos = todos.slice(0, todos.length - 12)
      await supabase.storage.from('backups').remove(antigos)
      resultado.removidos = antigos.length
    }

    // Upload para Google Drive (opcional)
    const saJson    = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    const folderId  = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID

    if (saJson && folderId) {
      const token = await getGoogleAccessToken(saJson)
      if (token) {
        const ok = await uploadToDrive(token, folderId, fileName, payload)
        resultado.drive = ok ? 'ok' : 'upload_falhou'
      } else {
        resultado.drive = 'token_falhou'
      }
    } else {
      resultado.drive = 'nao_configurado'
    }

    await registrarCronLog({ job: 'backup-db', status: 'ok', mensagem: `${fileName} gerado`, detalhes: resultado })
    return NextResponse.json({ ok: true, ...resultado })

  } catch (e) {
    const erro = String(e)
    await registrarCronLog({ job: 'backup-db', status: 'erro', mensagem: erro })
    return NextResponse.json({ ok: false, erro }, { status: 500 })
  }
}
