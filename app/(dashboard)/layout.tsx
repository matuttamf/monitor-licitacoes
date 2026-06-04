import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="font-bold text-lg text-gray-900">Monitor de Licitações</h1>
          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/" label="Dashboard" />
          <NavItem href="/busca" label="Busca" />
          <NavItem href="/palavras-chave" label="Palavras-chave" />
          <NavItem href="/alertas" label="Histórico de Alertas" />
        </nav>

        <form action="/api/auth/logout" method="POST" className="p-4 border-t border-gray-200">
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
            Sair
          </button>
        </form>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      {label}
    </Link>
  )
}
