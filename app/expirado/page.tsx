import Link from 'next/link'

export default function ExpiradoPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: 'var(--creme)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-10 text-center"
        style={{ background: 'white', border: '1px solid var(--cinza-light)' }}
      >
        {/* Logo */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm mx-auto mb-6"
          style={{ background: 'var(--vinho)', color: 'var(--dourado)' }}
        >
          ML
        </div>

        <h1 className="text-2xl font-semibold mb-3" style={{ color: 'var(--preto)' }}>
          Período de teste encerrado
        </h1>

        <p className="text-sm mb-2" style={{ color: 'var(--cinza)', lineHeight: '1.7' }}>
          Seus 7 dias gratuitos chegaram ao fim. Para continuar recebendo alertas de licitações, assine o Monitor de Licitações.
        </p>

        <div
          className="rounded-xl p-5 my-6 text-left"
          style={{ background: 'var(--creme)', border: '1px solid var(--cinza-light)' }}
        >
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--vinho)' }}>
            R$ 49,90
            <span className="text-base font-normal" style={{ color: 'var(--cinza)' }}>/mês</span>
          </div>
          <ul className="space-y-1.5 mt-3">
            {[
              'Alertas diários por e-mail e Telegram',
              'Palavras-chave ilimitadas',
              'Busca manual em tempo real',
              'PNCP, ComprasNet, Google e mais',
              'Cancele quando quiser',
            ].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--dourado)' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <a
          href="mailto:matuttamaquinaseferramentas@gmail.com?subject=Quero assinar o Monitor de Licitações&body=Olá, gostaria de assinar o Monitor de Licitações por R$ 49,90/mês. Meu e-mail de cadastro é: "
          className="block w-full py-3 rounded-xl text-sm font-semibold text-white text-center mb-3 transition-all"
          style={{ background: 'var(--vinho)', textDecoration: 'none' }}
        >
          Quero assinar → matuttamaquinaseferramentas@gmail.com
        </a>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-xs"
            style={{ color: 'var(--cinza)' }}
          >
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  )
}
