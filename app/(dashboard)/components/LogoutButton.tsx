'use client'

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    // Navega para login sem depender de redirect do servidor (evita 405)
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
