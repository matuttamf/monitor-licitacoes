'use client'

import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-xs py-2 rounded-lg px-3 text-left transition-colors"
      style={{ color: 'rgba(255,255,255,0.35)', background: 'transparent', cursor: 'pointer', border: 'none' }}
    >
      Sair da conta
    </button>
  )
}
