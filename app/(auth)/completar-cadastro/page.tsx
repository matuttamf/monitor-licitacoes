'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mascararCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2)  return d
  if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`
  if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function mascararCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0,5)}-${d.slice(5)}`
}

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

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CompletarCadastroPage() {
  const router = useRouter()

  const [cnpj, setCnpj]               = useState('')
  const [cnpjErro, setCnpjErro]       = useState('')
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false)
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomefantasia, setNomefantasia] = useState('')
  const [ie, setIe]                   = useState('')
  const [cep, setCep]                 = useState('')
  const [buscandoCEP, setBuscandoCEP] = useState(false)
  const [logradouro, setLogradouro]   = useState('')
  const [numero, setNumero]           = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro]           = useState('')
  const [cidade, setCidade]           = useState('')
  const [estadoUF, setEstadoUF]       = useState('')
  const [erro, setErro]               = useState('')
  const [salvando, setSalvando]       = useState(false)

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
    } catch { /* CNPJ válido mas não encontrado — preencher manualmente */ }
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

    if (!validarCNPJ(cnpj)) { setErro('CNPJ inválido. Verifique e tente novamente.'); return }
    if (!razaoSocial.trim()) { setErro('Informe a Razão Social.'); return }
    if (cep.replace(/\D/g, '').length !== 8) { setErro('CEP inválido.'); return }
    if (!logradouro.trim() || !numero.trim() || !cidade.trim() || !estadoUF) {
      setErro('Preencha o endereço completo.'); return
    }

    setSalvando(true)
    try {
      const res = await fetch('/api/auth/completar-perfil', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj, razao_social: razaoSocial, nome_fantasia: nomefantasia,
          ie, cep, logradouro, numero, complemento, bairro, cidade, estado_uf: estadoUF,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar. Tente novamente.'); return }
      router.push('/dashboard')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  // ── Estilos ─────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1.5px solid #D5D2C8', background: 'white',
    fontSize: '14px', color: '#1A1A1C', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#4a4a4d', marginBottom: '5px',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#6B0F1A'
    e.target.style.boxShadow   = '0 0 0 3px rgba(107,15,26,0.1)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#D5D2C8'
    e.target.style.boxShadow   = 'none'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>ML</div>
            <span style={{ color: '#1A1A1C', fontWeight: 600, fontSize: '15px' }}>Monitor de Licitações</span>
          </Link>

          {/* Progress indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 700 }}>✓</div>
              <span style={{ fontSize: '12px', color: '#9AA0A6' }}>Conta criada</span>
            </div>
            <div style={{ width: '40px', height: '2px', background: '#D5D2C8' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 700 }}>✓</div>
              <span style={{ fontSize: '12px', color: '#9AA0A6' }}>E-mail confirmado</span>
            </div>
            <div style={{ width: '40px', height: '2px', background: '#D5D2C8' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6B0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 700 }}>3</div>
              <span style={{ fontSize: '12px', color: '#6B0F1A', fontWeight: 600 }}>Dados da empresa</span>
            </div>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Quase lá! Dados da empresa
          </h1>
          <p style={{ fontSize: '14px', color: '#9AA0A6', margin: 0, lineHeight: 1.6 }}>
            Precisamos das informações fiscais para emissão de nota fiscal e para personalizar suas licitações.
          </p>
        </div>

        {/* Card do formulário */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 8px 32px rgba(0,0,0,0.07)', border: '1px solid #E8E4DF' }}>
          <form onSubmit={handleSubmit}>

            {/* ── Dados fiscais ─────────────────────────────── */}
            <SectionTitle>Dados fiscais</SectionTitle>

            {/* CNPJ */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>
                CNPJ <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9AA0A6' }}>— preenchimento automático ao digitar</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input type="text" value={cnpj} inputMode="numeric"
                  onChange={e => { setCnpj(mascararCNPJ(e.target.value)); setCnpjErro('') }}
                  onBlur={() => buscarCNPJ(cnpj)}
                  placeholder="00.000.000/0001-00" required
                  style={{ ...inputStyle, paddingRight: buscandoCNPJ ? '110px' : '14px' }}
                  onFocus={onFocus} />
                {buscandoCNPJ && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#9AA0A6' }}>
                    Buscando…
                  </span>
                )}
              </div>
              {cnpjErro && <p style={{ fontSize: '12px', color: '#b91c1c', margin: '4px 0 0' }}>{cnpjErro}</p>}
            </div>

            {/* Razão social */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Razão Social</label>
              <input type="text" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)}
                placeholder="Empresa Ltda." required style={inputStyle}
                onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Nome fantasia + IE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>
                  Nome Fantasia <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opc.)</span>
                </label>
                <input type="text" value={nomefantasia} onChange={e => setNomefantasia(e.target.value)}
                  placeholder="Como é conhecida" style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>
                  Insc. Estadual <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opc.)</span>
                </label>
                <input type="text" value={ie} onChange={e => setIe(e.target.value)}
                  placeholder="Isento ou número" style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            {/* ── Endereço ──────────────────────────────────── */}
            <SectionTitle>Endereço da sede</SectionTitle>

            {/* CEP */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>CEP</label>
              <div style={{ position: 'relative', maxWidth: '200px' }}>
                <input type="text" value={cep} inputMode="numeric"
                  onChange={e => setCep(mascararCEP(e.target.value))}
                  onBlur={() => buscarCEP(cep)}
                  placeholder="00000-000" required
                  style={{ ...inputStyle, paddingRight: buscandoCEP ? '100px' : '14px' }}
                  onFocus={onFocus} />
                {buscandoCEP && (
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#9AA0A6' }}>Buscando…</span>
                )}
              </div>
            </div>

            {/* Logradouro + Número */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Logradouro</label>
                <input type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)}
                  placeholder="Rua, Avenida…" required style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>Número</label>
                <input type="text" value={numero} onChange={e => setNumero(e.target.value)}
                  placeholder="123" required style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            {/* Complemento + Bairro */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Complemento <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opc.)</span></label>
                <input type="text" value={complemento} onChange={e => setComplemento(e.target.value)}
                  placeholder="Sala, andar…" style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>Bairro</label>
                <input type="text" value={bairro} onChange={e => setBairro(e.target.value)}
                  placeholder="Centro" required style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            {/* Cidade + Estado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input type="text" value={cidade} onChange={e => setCidade(e.target.value)}
                  placeholder="São Paulo" required style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select value={estadoUF} onChange={e => setEstadoUF(e.target.value)} required
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                  onFocus={onFocus} onBlur={onBlur}>
                  <option value="">UF</option>
                  {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>
                ⚠ {erro}
              </div>
            )}

            <button type="submit" disabled={salvando}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', background: salvando ? '#9AA0A6' : '#6B0F1A', color: 'white', fontSize: '16px', fontWeight: 700, border: 'none', cursor: salvando ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {salvando ? 'Salvando...' : 'Concluir cadastro e começar →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9AA0A6', margin: '16px 0 0', lineHeight: 1.5 }}>
            🔒 Seus dados são criptografados e usados exclusivamente para emissão de NF e personalização do serviço.
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#9AA0A6', marginTop: '20px' }}>
          Prefere preencher depois?{' '}
          <Link href="/dashboard" style={{ color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>
            Ir para o painel →
          </Link>
        </p>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 14px' }}>
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B0F1A', whiteSpace: 'nowrap' }}>{children}</span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(107,15,26,0.12)' }} />
    </div>
  )
}
