// Rate limiter com dois modos:
// - Upstash Redis (distribuído): quando UPSTASH_REDIS_REST_URL + TOKEN estão definidos.
//   Usa INCR + EXPIRE — atômico, funciona em múltiplas instâncias Vercel simultâneas.
// - In-memory Map (fallback): desenvolvimento local sem Redis configurado.

import { Redis } from '@upstash/redis'

const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const redis = hasUpstash ? new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
}) : null

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
  const count = await redis!.incr(`rl:${key}`)
  if (count === 1) await redis!.expire(`rl:${key}`, ttl)
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
  if (redis) return checkRedis(key, limit, windowMs)
  return checkInMemory(key, limit, windowMs)
}

/** Alias conveniente — mesma assinatura, mesmo comportamento. */
export async function rateLimitGuard(key: string, limit: number, windowMs: number): Promise<boolean> {
  return checkRateLimit(key, limit, windowMs)
}
