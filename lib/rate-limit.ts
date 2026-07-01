// Rate limiter com dois modos:
// - Upstash Redis (distribuído): quando UPSTASH_REDIS_REST_URL + TOKEN estão definidos.
//   Usa INCR + EXPIRE — atômico, funciona em múltiplas instâncias Vercel simultâneas.
// - In-memory Map (fallback): desenvolvimento local sem Redis configurado.

import { Redis } from '@upstash/redis'

// Lazy — não instancia no módulo load (build falha sem as env vars disponíveis)
let _redis: Redis | null | undefined = undefined

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  _redis = url && token ? new Redis({ url, token }) : null
  return _redis
}

// ── In-memory fallback ────────────────────────────────────────────────────────
type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

function checkInMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

// ── Redis distribuído ─────────────────────────────────────────────────────────
async function checkRedis(key: string, limit: number, windowMs: number): Promise<boolean> {
  const ttl = Math.ceil(windowMs / 1000)
  const r = getRedis()!
  const count = await r.incr(`rl:${key}`)
  if (count === 1) await r.expire(`rl:${key}`, ttl)
  return count <= limit
}

// ── API pública ───────────────────────────────────────────────────────────────

/** Extrai o IP real da requisição (considera proxy Vercel). */
export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

/**
 * Retorna true se a requisição está dentro do limite.
 * Usa Redis distribuído quando disponível, in-memory como fallback.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (getRedis()) return checkRedis(key, limit, windowMs)
  return checkInMemory(key, limit, windowMs)
}

/** Alias conveniente — mesma assinatura, mesmo comportamento. */
export async function rateLimitGuard(key: string, limit: number, windowMs: number): Promise<boolean> {
  return checkRateLimit(key, limit, windowMs)
}
