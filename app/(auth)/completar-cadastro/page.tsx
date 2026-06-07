'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Máscaras ────────────────────────────────────────────────────────────────

function mascararCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2)  return d
  if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`
  if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function mascararCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3)  return d
  if (d.length <= 6)  return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9)  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

function mascararCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0,5)}-${d.slice(5)}`
}

// ─── Validações ───────────────────────────────────────────────────────────────

function validarCNPJ(cnpj: string): boolean {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14 || /^(\d)\1{13}$/.test(n)) return false
  const calc = (s: string, len: number) => {
    let sum = 0, pos = len - 7
    for (let i = len; i >= 1; i--) { sum += parseInt(s[len - i]) * pos--; if (pos < 2) pos = 9 }
    const r = sum % 11; return r < 2 ? 0 : 11 - r
  }
  return calc(n, 12) === parseInt(n[12]) && calc(n, 13) === parseInt(n[13])
}

function validarCPF(cpf: string): boolean {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false
  const calc = (s: string, len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(s[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 || r === 11 ? 0 : r
  }
  return calc(n, 9) === parseInt(n[9]) && calc(n, 10) === parseInt(n[10])
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CompletarCadastroPage() {
  const router = useRouter()

  const [tipoPessoa, setTipoPessoa]       = useState<'PJ' | 'PF'>('PJ')

  // PJ
  const [cnpj, setCnpj]                   = useState('')
  const [cnpjErro, setCnpjErro]           = useState('')
  const [buscandoCNPJ, setBuscandoCNPJ]   = useState(false)
  const [razaoSocial, setRazaoSocial]     = useState('')
  const [nomefantasia, setNomefantasia]   = useState('')

  // PF
  const [cpf, setCpf]                     = useState('')
  const [cpfErro, setCpfErro]             = useState('')
  const [nomeCompleto, setNomeCompleto]   = useState('')

  // Compartilhado
  const [ie, setIe]                       = useState('')
  const [cep, setCep]                     = useState('')
  const [buscandoCEP, setBuscandoCEP]     = useState(false)
  const [logradouro, setLogradouro]       = useState('')
  const [numero, setNumero]               = useState('')
  const [complemento, setComplemento]     = useState('')
  const [bairro, setBairro]               = useState('')
  const [cidade, setCidade]               = useState('')
  const [estadoUF, setEstadoUF]           = useState('')
  const [erro, setErro]                   = useState('')
  const [salvando, setSalvando]           = useState(false)

  // ── Auto-preencher via CNPJ ─────────────────────────────────────────────
  async function buscarCNPJ(cnpjRaw: string) {
    const nums = cnpjRaw.replace(/\D/g, '')
    if (nums.length !== 14) return
    if (!validarCNPJ(cnpjRaw)) { setCnpjErro('CNPJ inválido.'); return }
    setCnpjErro('')
    setBuscandoCNPJ(true)
    try {
      const r = await fetch(`https://publica.cnpj.ws/cnpj/${nums}`)
      if (!r.ok) throw new Error()
      const d = await r.json()
      setRazaoSocial(d.razao_social ?? '')
      setNomefantasia(d.estabelecimento?.nome_fantasia ?? '')
      const est = d.estabelecimento
      if (est) {
        const cepNum = (est.cep ?? '').replace(/\D/g, '')
        setCep(mascararCEP(cepNum))
        setLogradouro(`${est.tipo_logradouro ?? ''} ${est.logradouro ?? ''}`.trim())
        setNumero(est.numero ?? '')
        setComplemento(est.complemento ?? '')
        setBairro(est.bairro ?? '')
        setCidade(est.cidade?.nome ?? '')
        setEstadoUF(est.estado?.sigla ?? '')
      }
    } catch { /* preencher manualmente */ }
    finally { setBuscandoCNPJ(false) }
  }

  // ── Auto-preencher via CEP ──────────────────────────────────────────────
  async function buscarCEP(cepRaw: string) {
    const nums = cepRaw.replace(/\D/g, '')
    if (nums.length !== 8) return
    setBuscandoCEP(true)
    try {
      const r = await fetch(`https://viacep.com.br/ws/${nums}/json/`)
      const d = await r.json()
      if (!d.erro) {
        setLogradouro(d.logradouro ?? '')
        setBairro(d.bairro ?? '')
        setCidade(d.localidade ?? '')
        setEstadoUF(d.uf ?? '')
      }
    } catch { /* silencioso */ }
    finally { setBuscandoCEP(false) }
  }

  // ── Submissão ───────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    // Validações específicas por tipo
    if (tipoPessoa === 'PJ') {
      if (!validarCNPJ(cnpj)) { setErro('CNPJ inválido. Verifique e tente novamente.'); return }
      if (!razaoSocial.trim()) { setErro('Informe a Razão Social.'); return }
    } else {
      if (!validarCPF(cpf)) { setErro('CPF inválido. Verifique e tente novamente.'); return }
      if (!nomeCompleto.trim()) { setErro('Informe o nome completo.'); return }
    }

    // IE obrigatória para PJ (aceita "Isento")
    if (tipoPessoa === 'PJ' && !ie.trim()) {
      setErro('Informe a Inscrição Estadual ou "Isento".'); return
    }

    // Endereço obrigatório
    if (cep.replace(/\D/g, '').length !== 8) { setErro('CEP inválido.'); return }
    if (!logradouro.trim() || !numero.trim() || !cidade.trim() || !estadoUF) {
      setErro('Preencha o endereço completo (logradouro, número, cidade e estado).'); return
    }

    setSalvando(true)
    try {
      const body = tipoPessoa === 'PJ'
        ? { tipo_pessoa: 'PJ', cnpj, razao_social: razaoSocial, nome_fantasia: nomefantasia, ie, cep, logradouro, numero, complemento, bairro, cidade, estado_uf: estadoUF }
        : { tipo_pessoa: 'PF', cpf, nome_completo: nomeCompleto, ie, cep, logradouro, numero, complemento, bairro, cidade, estado_uf: estadoUF }

      const res = await fetch('/api/auth/completar-perfil', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar. Tente novamente.'); return }
      router.push('/onboarding')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const inputCls = "w-full px-3.5 py-3 rounded-xl border-[1.5px] border-[#D5D2C8] bg-white text-sm text-[#1A1A1C] outline-none focus:border-[#6B0F1A] focus:ring-2 focus:ring-[rgba(107,15,26,0.1)] transition-colors"
  const labelCls = "block text-[11px] font-bold tracking-[0.08em] uppercase text-[#4a4a4d] mb-1.5"

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans flex items-center justify-center p-5 sm:p-10">
      <div className="w-full max-w-[560px]">

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-6">
            <div className="w-9 h-9 rounded-[10px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-xs">ML</div>
            <span className="text-[#1A1A1C] font-semibold text-[15px]">Monitor de Licitações</span>
          </Link>

          {/* Steps */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {[
              { label: 'Conta criada', done: true },
              { label: 'E-mail confirmado', done: true },
              { label: 'Dados da empresa', done: false, active: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-8 h-0.5 bg-[#D5D2C8]" />}
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${s.done ? 'bg-[#4ade80]' : 'bg-[#6B0F1A]'}`}>
                    {s.done ? '✓' : '3'}
                  </div>
                  <span className={`text-xs ${s.active ? 'text-[#6B0F1A] font-semibold' : 'text-[#9AA0A6]'}`}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-extrabold text-[#1A1A1C] mb-1.5 tracking-tight">Quase lá! Dados da empresa</h1>
          <p className="text-sm text-[#9AA0A6] leading-relaxed">Personalize sua experiência informando os dados da sua empresa ou pessoa.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.07)] border border-[#E8E4DF]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Toggle PF / PJ */}
            <div>
              <label className={labelCls}>Tipo de pessoa</label>
              <div className="flex gap-2">
                {(['PJ', 'PF'] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => { setTipoPessoa(t); setErro('') }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-[1.5px] transition-colors ${tipoPessoa === t ? 'bg-[#6B0F1A] text-white border-[#6B0F1A]' : 'bg-white text-[#4a4a4d] border-[#D5D2C8] hover:border-[#6B0F1A]'}`}>
                    {t === 'PJ' ? '🏢 Pessoa Jurídica' : '👤 Pessoa Física'}
                  </button>
                ))}
              </div>
            </div>

            <SectionTitle>Dados fiscais</SectionTitle>

            {tipoPessoa === 'PJ' ? (
              <>
                {/* CNPJ */}
                <div>
                  <label className={labelCls}>CNPJ <span className="font-normal normal-case tracking-normal text-[#9AA0A6]">— preenchimento automático</span></label>
                  <div className="relative">
                    <input type="text" value={cnpj} inputMode="numeric"
                      onChange={e => { setCnpj(mascararCNPJ(e.target.value)); setCnpjErro('') }}
                      onBlur={() => buscarCNPJ(cnpj)}
                      placeholder="00.000.000/0001-00" required
                      className={inputCls + (buscandoCNPJ ? ' pr-24' : '')} />
                    {buscandoCNPJ && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9AA0A6]">Buscando…</span>}
                  </div>
                  {cnpjErro && <p className="text-xs text-[#b91c1c] mt-1">{cnpjErro}</p>}
                </div>

                {/* Razão Social */}
                <div>
                  <label className={labelCls}>Razão Social</label>
                  <input type="text" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)}
                    placeholder="Empresa Ltda." required className={inputCls} />
                </div>

                {/* Nome Fantasia + IE */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nome Fantasia <span className="font-normal normal-case tracking-normal">(opc.)</span></label>
                    <input type="text" value={nomefantasia} onChange={e => setNomefantasia(e.target.value)}
                      placeholder="Como é conhecida" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Insc. Estadual</label>
                    <input type="text" value={ie} onChange={e => setIe(e.target.value)}
                      placeholder="Isento ou número" required className={inputCls} />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* CPF */}
                <div>
                  <label className={labelCls}>CPF</label>
                  <input type="text" value={cpf} inputMode="numeric"
                    onChange={e => { setCpf(mascararCPF(e.target.value)); setCpfErro('') }}
                    onBlur={() => { if (cpf && !validarCPF(cpf)) setCpfErro('CPF inválido.') }}
                    placeholder="000.000.000-00" required className={inputCls} />
                  {cpfErro && <p className="text-xs text-[#b91c1c] mt-1">{cpfErro}</p>}
                </div>

                {/* Nome Completo */}
                <div>
                  <label className={labelCls}>Nome Completo</label>
                  <input type="text" value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)}
                    placeholder="Seu nome completo" required className={inputCls} />
                </div>

              </>
            )}

            <SectionTitle>Endereço da sede</SectionTitle>

            {/* CEP */}
            <div>
              <label className={labelCls}>CEP</label>
              <div className="relative max-w-[200px]">
                <input type="text" value={cep} inputMode="numeric"
                  onChange={e => setCep(mascararCEP(e.target.value))}
                  onBlur={() => buscarCEP(cep)}
                  placeholder="00000-000" required
                  className={inputCls + (buscandoCEP ? ' pr-24' : '')} />
                {buscandoCEP && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9AA0A6]">Buscando…</span>}
              </div>
            </div>

            {/* Logradouro + Número */}
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <div>
                <label className={labelCls}>Logradouro</label>
                <input type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)}
                  placeholder="Rua, Avenida…" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Número</label>
                <input type="text" value={numero} onChange={e => setNumero(e.target.value)}
                  placeholder="123" required className={inputCls} />
              </div>
            </div>

            {/* Complemento + Bairro */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Complemento <span className="font-normal normal-case tracking-normal">(opc.)</span></label>
                <input type="text" value={complemento} onChange={e => setComplemento(e.target.value)}
                  placeholder="Sala, andar…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Bairro</label>
                <input type="text" value={bairro} onChange={e => setBairro(e.target.value)}
                  placeholder="Centro" required className={inputCls} />
              </div>
            </div>

            {/* Cidade + Estado */}
            <div className="grid grid-cols-[1fr_110px] gap-3">
              <div>
                <label className={labelCls}>Cidade</label>
                <input type="text" value={cidade} onChange={e => setCidade(e.target.value)}
                  placeholder="São Paulo" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select value={estadoUF} onChange={e => setEstadoUF(e.target.value)} required
                  className={inputCls + ' cursor-pointer'}>
                  <option value="">UF</option>
                  {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.2)] rounded-xl px-4 py-3 text-sm text-[#b91c1c]">
                ⚠ {erro}
              </div>
            )}

            <button type="submit" disabled={salvando}
              className={`w-full py-4 rounded-xl text-white text-base font-bold border-none mt-1 transition-colors ${salvando ? 'bg-[#9AA0A6] cursor-not-allowed' : 'bg-[#6B0F1A] cursor-pointer hover:bg-[#5a0c16]'}`}>
              {salvando ? 'Salvando...' : 'Concluir cadastro e começar →'}
            </button>
          </form>

          <p className="text-center text-xs text-[#9AA0A6] mt-4 leading-relaxed">
            🔒 Seus dados são criptografados e usados exclusivamente para emissão de NF e personalização do serviço.
          </p>
        </div>

        <p className="text-center text-[13px] text-[#9AA0A6] mt-5">
          Prefere preencher depois?{' '}
          <Link href="/dashboard" className="text-[#6B0F1A] font-semibold no-underline">
            Ir para o painel →
          </Link>
        </p>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 my-1">
      <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#6B0F1A] whitespace-nowrap">{children}</span>
      <div className="flex-1 h-px bg-[rgba(107,15,26,0.12)]" />
    </div>
  )
}
