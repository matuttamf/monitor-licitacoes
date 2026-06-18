/**
 * Script unificado: baixa arquivos da RFB, filtra por CNAE,
 * cruza razão social e enriquece e-mails, insere leads no Supabase.
 *
 * Chamado pelo GitHub Actions (workflow: coletar-leads-rfb.yml)
 * ou manualmente:
 *   npx tsx scripts/coletar-leads-rfb.ts          # índices 0-9, mês anterior
 *   npx tsx scripts/coletar-leads-rfb.ts 0 3
 *   npx tsx scripts/coletar-leads-rfb.ts 0 9 2026 5
 */

import { createClient } from '@supabase/supabase-js'
import { createWriteStream, existsSync, unlinkSync, statSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createInflateRaw } from 'node:zlib'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { config } from 'dotenv'
config({ path: '.env.local' })
config()

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/$/, '')
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

const cliArgs   = process.argv.slice(2)
const IDX_START = Number(cliArgs[0] ?? 0)
const IDX_END   = Number(cliArgs[1] ?? 9)
const MAX_ROWS  = parseInt(process.env.MAX_ROWS ?? '0') || 0

function getAnoMes(): { ano: number; mes: number } {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}
const { ano: anoDefault, mes: mesDefault } = getAnoMes()
const ANO = Number(cliArgs[2] ?? anoDefault)
const MES = Number(cliArgs[3] ?? mesDefault)
const MES_PAD = String(MES).padStart(2, '0')

// URL pública do Nextcloud da Receita Federal (fallback)
const RF_BASE = `https://arquivos.receitafederal.gov.br/public.php/dav/files/YggdBLfdninEJX9/${ANO}-${MES_PAD}`

// Supabase Storage (fonte primária — arquivos já enviados via upload-rf-cnpj.ts)
const STORAGE_BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/rf-cnpj`
  : null

// Retorna lista de URLs para tentar, em ordem de preferência
function getUrlsArquivo(tipo: 'Estabelecimentos' | 'Empresas', idx: number): string[] {
  const rfUrl = `${RF_BASE}/${tipo}${idx}.zip`
  if (!STORAGE_BASE) return [rfUrl]
  return [`${STORAGE_BASE}/${tipo}${idx}.zip`, rfUrl]
}

// Índices padrão (fallback quando o arquivo não tem cabeçalho legível)
const EST_DEF = { BASICO: 0, ORDEM: 1, DV: 2, MATFIL: 3, NOME_FANTASIA: 4, SITUACAO: 5, DATA_INICIO: 10, CNAE: 11, UF: 19, MUNICIPIO: 20, DDD1: 21, TEL1: 22, EMAIL: 27 }
const EMP_DEF = { BASICO: 0, RAZAO: 1, PORTE: 5 }

type ColEst = typeof EST_DEF
type ColEmp = typeof EMP_DEF

function detectarColEst(headerCols: string[]): ColEst {
  const find = (...keys: string[]) => {
    for (const k of keys) {
      const i = headerCols.findIndex(h => h.replace(/\W/g, '').toUpperCase().includes(k))
      if (i >= 0) return i
    }
    return null
  }
  const cols = {
    BASICO:        find('CNPJBASICO', 'NUBASICO', 'BASICO')            ?? EST_DEF.BASICO,
    ORDEM:         find('CNPJORDEM',  'NUORDEM',  'ORDEM')             ?? EST_DEF.ORDEM,
    DV:            find('CNPJDV',     'NUDV',     'DV')                ?? EST_DEF.DV,
    MATFIL:        find('IDENTIFICADORMATRIZFILIAL', 'MATFIL')         ?? EST_DEF.MATFIL,
    NOME_FANTASIA: find('NOMEFANTASIA', 'FANTASIA')                    ?? EST_DEF.NOME_FANTASIA,
    SITUACAO:      find('SITUACAOCADASTRAL', 'SITUACAO')               ?? EST_DEF.SITUACAO,
    DATA_INICIO:   find('DATAINICIOATIVIDADE', 'DATAINICIO')           ?? EST_DEF.DATA_INICIO,
    CNAE:          find('CNAEFISCALPRINCIPAL', 'CNAEPRINCIPAL', 'CNAE') ?? EST_DEF.CNAE,
    UF:            find('UF')                                          ?? EST_DEF.UF,
    MUNICIPIO:     find('MUNICIPIO', 'CODIGOMUNICIPIO')                ?? EST_DEF.MUNICIPIO,
    DDD1:          find('DDD1', 'DDDTELEFONE1')                        ?? EST_DEF.DDD1,
    TEL1:          find('TELEFONE1', 'TEL1')                           ?? EST_DEF.TEL1,
    EMAIL:         find('CORREIOELETRONICO', 'EMAIL')                  ?? EST_DEF.EMAIL,
  }
  console.log(`  [colunas EST] BASICO=${cols.BASICO} SITUACAO=${cols.SITUACAO} CNAE=${cols.CNAE} UF=${cols.UF} MUN=${cols.MUNICIPIO} DDD=${cols.DDD1} TEL=${cols.TEL1} EMAIL=${cols.EMAIL}`)
  return cols
}

function detectarColEmp(headerCols: string[]): ColEmp {
  const find = (...keys: string[]) => {
    for (const k of keys) {
      const i = headerCols.findIndex(h => h.replace(/\W/g, '').toUpperCase().includes(k))
      if (i >= 0) return i
    }
    return null
  }
  const cols = {
    BASICO: find('CNPJBASICO', 'NUBASICO', 'BASICO') ?? EMP_DEF.BASICO,
    RAZAO:  find('RAZAOSOCIAL', 'RAZAO')             ?? EMP_DEF.RAZAO,
    PORTE:  find('PORTEEMPRESA', 'PORTE')            ?? EMP_DEF.PORTE,
  }
  console.log(`  [colunas EMP] BASICO=${cols.BASICO} RAZAO=${cols.RAZAO} PORTE=${cols.PORTE}`)
  return cols
}

// Domínios/palavras típicas de escritórios contábeis — e-mails desses domínios
// costumam ser da contabilidade, não da empresa. Marcamos como inválido.
const RE_CONTABIL = /contab[il]|escritorio|assessor[ia]|fiscal|tribut|contadora?|cgcontabil|escritcontab/i

function isEmailContabilidade(email: string, emailsContagem: Map<string, number>): boolean {
  const [, dominio] = email.split('@')
  if (RE_CONTABIL.test(dominio)) return true
  const contagem = emailsContagem.get(email) ?? 0
  return contagem >= 3  // mesmo e-mail em 3+ CNPJs = provavelmente contabilidade
}

// Data limite para filtro de 60 dias (formato YYYYMMDD)
function getDataLimite60Dias(): string {
  const d = new Date()
  d.setDate(d.getDate() - 60)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

// Seed amplo: top CNAEs em licitações públicas brasileiras (~300 códigos)
const CNAE_SEED = new Set([
  // TI e Software
  '6201500','6202300','6203100','6204000','6209100','6311900','6312600','6190601','6190699',
  // Limpeza e conservação
  '8121400','8122200','8129000','8111700',
  // Segurança patrimonial
  '8011101','8011102','8012900',
  // Monitoramento eletrônico e CFTV
  '8020001','8020002',
  // Construção civil
  '4120400','4211101','4211102','4212000','4213800','4221901','4221902','4222701','4222702',
  '4223500','4291000','4292801','4292802','4299501','4299502','4299599',
  // Reforma e instalações
  '4311801','4311802','4312600','4313400','4319300','4321500','4322301','4322302','4322399',
  '4329101','4329102','4329103','4329104','4329105','4330404','4330405','4391600','4399101',
  // Sinalização viária e urbana
  '3329501','3329502',
  // Móveis e equipamentos
  '3101200','3102100','3103900','3104700','3105100','3109800','4754701','4756300',
  // Material de construção
  '4744001','4744002','4744003','4744004','4744005','4744006','4744099',
  // Saúde e medicina
  '8630501','8630502','8630503','8630504','8630505','8630506','8630507','8630508','8650001','8650002',
  '8650003','8650004','8650099','8640201','8640202','8640203','8660700',
  // Laboratório e equipamentos médicos
  '4645101','4645102','4773300','4789005',
  // Farmácia especializada
  '4771701','4771702','4771703','4771704',
  // Assistência social e cuidados
  '8711501','8711502','8720401','8730101','8730102','8800600',
  // Alimentação
  '5611201','5611202','5611203','5612100','4721101','4721102','4721103','4722901','4722902',
  // Agropecuária e merenda escolar (PNAE)
  '0111301','0111302','0113000','0133401','0133402','0133403','0133499','0141501','0141502',
  '0146001','0146002','0146003','0159801','0159899','4691500','4724500',
  // Transporte e logística
  '4921301','4921302','4922101','4922102','4922103','4930201','4930202','4950700','5229099',
  '5250801','5250802','4912401','4912402','4929901','4929902','4929903','4929904','4929999',
  // Locação de veículos e máquinas
  '7711000','7719599','7731400','7732201','7732202','7733100','7739003','7739099',
  // Locação de mão-de-obra / RH
  '7810800','7820500','7830200',
  // Impressão e gráfica
  '1811301','1811302','1812100','1813099','1822901','1822999',
  // Papelaria e escritório
  '4761001','4761002','4761003','4763601','4763602','4763603','4763604','4763605','4763699',
  // Combustível
  '4731800','4732600',
  // Uniformes e vestuário
  '1412601','1412602','4781400','4782201','4782202',
  // Consultoria e engenharia
  '7111100','7112000','7119701','7119703','7119799','7490101','7490104','7490199',
  // Jardinagem e paisagismo
  '8130300',
  // Manutenção e reparação
  '3311200','3312101','3312102','3312103','3312104','3313901','3313902','3314700','3319800',
  // Gestão de resíduos e meio ambiente
  '3811400','3812200','3821100','3822000','3831901','3831999','3832700','3839401','3900500',
  '3700100','3702900',
  // Eventos e comunicação
  '8230001','8230002','9001901','9001902','9001903','7319001','7319002','7319003','7319099',
  // Publicidade institucional
  '7311400','7312200','7319004',
  // Serviços audiovisuais e fotografia
  '7420001','7420004','5912001','5912002','5919299',
  // Telecomunicações
  '6110801','6110802','6110803','6120501','6120502','6130200','6141800','6142600','6143400',
  // Energia e utilidades
  '3511501','3511502','3512300','3513100','3600601','3600602',
  // Educação e treinamento
  '8512100','8513900','8520100','8531700','8532500','8541400','8542200','8550301','8550302',
  '8599603','8599604','8599699',
  // Hotelaria e hospedagem
  '5510801','5510802','5590601','5590602','5590603','5590699',
  // Seguros e planos de saúde coletivos
  '6511101','6511102','6550200','6512100','6521300',
  // Serviços funerários
  '9603300',
  // Estacionamentos
  '5223100',
  // Outros serviços frequentes
  '6920601','6920602','6911701','6911702','6912500','7020400','7410202','7500100',
])

// ── Validação de e-mail ───────────────────────────────────────────────────────
const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const DOMINIOS_INVALIDOS = new Set([
  'naotem.com','naopossui.com','sempossui.com','semcadastro.com',
  'naoinformado.com','naoconsta.com','inexistente.com','nenhum.com',
  'naodisponivel.com','nodomain.com','domain.com','test.com','example.com',
  'email.com','mail.com','fake.com','null.com','none.com',
])

function validarEmail(raw: string | null): string | null {
  if (!raw) return null
  const e = raw.trim().toLowerCase()
  if (!RE_EMAIL.test(e) || e.length > 100) return null
  const [, dominio] = e.split('@')
  if (DOMINIOS_INVALIDOS.has(dominio)) return null
  if (/\b(nao|sem|null|fake|none|test|dummy|exemplo)\b/.test(dominio)) return null
  return e
}

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// CNAEs por segmento: palavras-chave dos usuários → CNAEs relacionados
const CNAE_POR_SEGMENTO: Record<string, string[]> = {
  limpeza:         ['8121400','8122200','8129000'],
  conservacao:     ['8121400','8111700','8129000'],
  seguranca:       ['8011101','8011102','8012900'],
  monitoramento:   ['8020001','8020002'],
  cftv:            ['8020001','8020002'],
  vigilancia:      ['8011101','8011102','8020001','8020002'],
  ti:              ['6209100','6201500','6202300','6203100','6204000','6311900'],
  software:        ['6209100','6201500','6202300'],
  informatica:     ['6209100','4751200','4752100'],
  construcao:      ['4120400','4211101','4221901','4292801','4299501'],
  reforma:         ['4330404','4329101','4391600'],
  eletrica:        ['4321500','4322301'],
  hidraulica:      ['4322302','4322399'],
  manutencao:      ['8121400','3313901','3314700','3319800'],
  jardinagem:      ['8130300'],
  paisagismo:      ['8130300'],
  alimentacao:     ['5611201','5612100','4721102'],
  refeicao:        ['5611201','5612100'],
  merenda:         ['5611201','5612100','4721101','4721102','0111301','0113000','0133401','4691500'],
  agropecuaria:    ['0111301','0111302','0113000','0133401','0133499','0141501','0141502','0146001','4691500'],
  agricultura:     ['0111301','0111302','0113000','0133401','0141501','4724500'],
  transporte:      ['4921301','4922101','4930201','4950700'],
  logistica:       ['5250801','5229099','4930201'],
  locacao:         ['7711000','7719599','7731400','7732201','7732202','7733100','7739099'],
  frota:           ['7711000','7719599','4930201'],
  veiculo:         ['7711000','7719599'],
  maoDeObra:       ['7810800','7820500','7830200'],
  terceirizacao:   ['7820500','7830200','8111700'],
  saude:           ['8630501','8630502','8650001','8650099'],
  medicina:        ['8630501','8630502'],
  laboratorio:     ['8640201','8640202','8640203'],
  farmacia:        ['4771701','4771702','4771703','4771704'],
  medicamento:     ['4771701','4771702','4771704'],
  assistenciaSocial: ['8800600','8711501','8711502','8720401','8730101','8730102'],
  cras:            ['8800600','8720401'],
  abrigo:          ['8730101','8730102','8711501'],
  mobiliario:      ['3101200','3102100','3103900','4754701'],
  moveis:          ['3101200','4754701'],
  papelaria:       ['4761001','4761003','1721400'],
  grafica:         ['1811301','1811302','1812100','1822901'],
  impressao:       ['1811301','1812100','1822901','1822999'],
  uniformes:       ['1412601','1412602','4781400'],
  vestuario:       ['1412601','4781400'],
  combustivel:     ['4731800','4732600'],
  material:        ['4744001','4744002','4744003'],
  ferramentas:     ['4744001','4744002'],
  equipamentos:    ['4669999','3314700','4662100'],
  residuos:        ['3811400','3812200','3821100','3822000','3900500','3700100','3702900'],
  lixo:            ['3811400','3821100','3900500'],
  saneamento:      ['3700100','3702900','3600601','3600602'],
  meioAmbiente:    ['3811400','3812200','3821100','3822000','3831901','3839401','3900500'],
  sinalizacao:     ['3329501','3329502'],
  transito:        ['3329501','3329502'],
  publicidade:     ['7311400','7312200','7319004'],
  marketing:       ['7311400','7319004'],
  fotografia:      ['7420001','7420004'],
  audiovisual:     ['7420001','7420004','5912001','5912002','5919299'],
  video:           ['7420004','5912002','5919299'],
  treinamento:     ['8550301','8550302','8599603','8599604','8599699'],
  capacitacao:     ['8541400','8542200','8550301','8550302','8599604'],
  hotel:           ['5510801','5510802','5590601','5590602','5590699'],
  hospedagem:      ['5510801','5510802','5590601','5590602'],
  diaria:          ['5510801','5510802','5590601'],
  seguro:          ['6511101','6511102','6550200','6512100','6521300'],
  planoSaude:      ['6511101','6511102','6550200'],
  funerario:       ['9603300'],
  estacionamento:  ['5223100'],
}

async function getTargetCnaes(): Promise<Set<string>> {
  // Top 200 CNAEs por frequência nos leads (coluna cnae_codigo — código numérico 7 dígitos)
  const { data: leadsData } = await supabase
    .from('leads')
    .select('cnae_codigo')
    .not('cnae_codigo', 'is', null)
    .limit(50000)
  const counts: Record<string, number> = {}
  for (const r of (leadsData ?? []) as { cnae_codigo: string | null }[]) {
    const code = String(r.cnae_codigo).replace(/\D/g,'').slice(0,7)
    if (code.length >= 4) counts[code] = (counts[code] ?? 0) + 1
  }
  const top200 = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,200).map(([c]) => c)
  // Sempre inclui o seed amplo para garantir cobertura mesmo com base escassa
  const todos = new Set([...top200, ...CNAE_SEED])
  console.log(`  CNAEs-alvo: ${todos.size} (${top200.length} da base + seed)`)
  return todos
}

// CNPJs já contatados — não reinserir nem reprocessar
async function getCnpjsContatados(): Promise<Set<string>> {
  const cnpjs = new Set<string>()
  let offset = 0
  while (true) {
    const { data, error } = await supabase
      .from('leads')
      .select('cnpj')
      .not('disparado_em', 'is', null)
      .range(offset, offset + 999)
    if (error || !data?.length) break
    for (const r of data) cnpjs.add((r.cnpj as string).slice(0, 8))
    if (data.length < 1000) break
    offset += 1000
  }
  return cnpjs
}

// Basicós (8 dígitos) de TODOS os leads sem e-mail — qualquer origem
async function getBasicosSemEmail(): Promise<Set<string>> {
  const set = new Set<string>()
  let offset = 0
  while (true) {
    const { data } = await supabase
      .from('leads')
      .select('cnpj')
      .is('email', null)
      .not('status', 'in', '("descadastrado","usuario")')
      .range(offset, offset + 4999)
    if (!data?.length) break
    for (const r of data) set.add((r.cnpj as string).slice(0, 8))
    if (data.length < 5000) break
    offset += 5000
  }
  return set
}

// Carrega tabela IBGE código → nome do município
async function carregarMunicipios(): Promise<Map<string, string>> {
  const mapa = new Map<string, string>()
  const urls = [
    STORAGE_BASE ? `${STORAGE_BASE}/Municipios.zip` : null,
    `${RF_BASE.replace(/\/\d{4}-\d{2}$/, '')}/Municipios.zip`,
    `https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/Municipios.zip`,
  ].filter(Boolean) as string[]
  const tmpPath = join(tmpdir(), 'rf-municipios.zip')
  if (!await downloadComRetry(urls, tmpPath, 3)) {
    console.warn('  Municipios.zip indisponível — municípios ficarão como código IBGE')
    return mapa
  }
  await processarZip(tmpPath, (cols) => {
    const codigo = cols[0]?.trim()
    const nome = cols[1]?.trim()
    if (codigo && nome && /^\d+$/.test(codigo)) mapa.set(codigo, nome)
  })
  if (existsSync(tmpPath)) unlinkSync(tmpPath)
  console.log(`  ${mapa.size} municípios carregados`)
  return mapa
}

// ── Download com retry e Range ────────────────────────────────────────────────
// urls: lista de URLs tentadas em ordem — a primeira que funcionar é usada.
async function downloadComRetry(urls: string | string[], tmpPath: string, tentativas = 5): Promise<boolean> {
  const lista = Array.isArray(urls) ? urls : [urls]

  for (const url of lista) {
    console.log(`  Tentando: ${url}`)
    for (let t = 1; t <= tentativas; t++) {
      try {
        let bytesJaBaixados = 0
        if (existsSync(tmpPath)) {
          bytesJaBaixados = statSync(tmpPath).size
          if (bytesJaBaixados > 0) console.log(`  Retomando do byte ${bytesJaBaixados} (tentativa ${t})`)
        }
        const headers: Record<string,string> = { 'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)' }
        if (bytesJaBaixados > 0) headers['Range'] = `bytes=${bytesJaBaixados}-`

        const res = await fetch(url, { headers, signal: AbortSignal.timeout(120_000) })
        if (!res.ok || !res.body) {
          console.error(`  HTTP ${res.status}`)
          if (res.status === 404 || res.status === 403 || res.status === 400) break  // tenta próxima URL
          // 416 = arquivo local maior/igual ao remoto — recomeça do zero
          if (res.status === 416) {
            if (existsSync(tmpPath)) { unlinkSync(tmpPath); console.log('  Arquivo local removido, reiniciando') }
            bytesJaBaixados = 0
            delete headers['Range']
            const res2 = await fetch(url, { headers })
            if (!res2.ok || !res2.body) { console.error(`  HTTP ${res2.status}`); break }
            const cl = res2.headers.get('content-length')
            if (cl) console.log(`  Tamanho: ${(Number(cl) / 1024 / 1024).toFixed(0)} MB`)
            const writer2 = createWriteStream(tmpPath, { flags: 'w' })
            await pipeline(res2.body as unknown as NodeJS.ReadableStream, writer2)
            console.log(`  ✓ Download concluído`)
            return true
          }
          if (t < tentativas) { await new Promise(r => setTimeout(r, 10000 * t)); continue }
          break  // esgotou tentativas para esta URL — tenta próxima
        }
        if (t === 1) {
          const cl = res.headers.get('content-length')
          if (cl) console.log(`  Tamanho: ${(Number(cl) / 1024 / 1024).toFixed(0)} MB`)
        }
        const flags = bytesJaBaixados > 0 && res.status === 206 ? 'a' : 'w'
        const writer = createWriteStream(tmpPath, { flags })
        await pipeline(res.body as unknown as NodeJS.ReadableStream, writer)
        console.log(`  ✓ Download concluído`)
        return true
      } catch (e) {
        console.error(`  Tentativa ${t} falhou: ${e instanceof Error ? e.message : e}`)
        if (t < tentativas) await new Promise(r => setTimeout(r, 10000 * t))
      }
    }
    // Falhou nesta URL — limpa arquivo parcial antes de tentar a próxima
    if (existsSync(tmpPath)) { unlinkSync(tmpPath); }
  }
  return false
}

// ── Parser CSV com suporte a campos entre aspas ───────────────────────────────
// Necessário porque o arquivo RFB usa aspas duplas em todos os campos,
// e alguns campos (ex: NOME_FANTASIA) podem conter o separador ";" dentro das aspas.
function parseCSVLine(line: string, sep: string): string[] {
  const result: string[] = []
  let i = 0
  while (i <= line.length) {
    if (line[i] === '"') {
      i++ // abre aspas
      let val = ''
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { val += '"'; i += 2 } // aspas escapadas
        else if (line[i] === '"') { i++; break } // fecha aspas
        else { val += line[i++] }
      }
      result.push(val)
      if (line[i] === sep) i++ // pula separador
    } else {
      const end = line.indexOf(sep, i)
      if (end === -1) { result.push(line.slice(i)); break }
      result.push(line.slice(i, end))
      i = end + 1
    }
  }
  return result
}

// ── Processamento ZIP (stream local) ─────────────────────────────────────────
type OnLine = (cols: string[]) => void

async function processarZip(tmpPath: string, onLine: OnLine): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const inflate = createInflateRaw()
    const fileStream = require('node:fs').createReadStream(tmpPath)
    let headerBuf = Buffer.alloc(0)
    let headerParsed = false

    const startDeflate = (src: NodeJS.ReadableStream) => {
      inflate.on('error', reject)
      src.pipe(inflate)

      // Detecta separador (| ou ;) na primeira linha para compatibilidade
      // com todas as versões dos arquivos da RFB
      let sep = '|'
      let primeiraLinha = true

      const rl = createInterface({ input: inflate, crlfDelay: Infinity })
      rl.on('line', (line) => {
        if (primeiraLinha) {
          primeiraLinha = false
          const contPipe  = (line.match(/\|/g) ?? []).length
          const contPonto = (line.match(/;/g)  ?? []).length
          sep = contPonto > contPipe ? ';' : '|'
          console.log(`  Separador: "${sep}"`)
        }
        const cols = parseCSVLine(line, sep)
        if (cols.length >= 2) onLine(cols)
      })
      rl.on('close', resolve)
      rl.on('error', reject)
    }

    fileStream.on('data', (chunk: Buffer | string) => {
      if (headerParsed) return
      headerBuf = Buffer.concat([headerBuf, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)])
      if (headerBuf.length >= 30) {
        const deflateStart = 30 + headerBuf.readUInt16LE(26) + headerBuf.readUInt16LE(28)
        if (headerBuf.length >= deflateStart) {
          headerParsed = true
          fileStream.pause()
          fileStream.removeAllListeners('data')
          const combined = new Readable({ read() {} })
          combined.push(headerBuf.slice(deflateStart))
          fileStream.on('data', (d: Buffer | string) => combined.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))
          fileStream.on('end', () => combined.push(null))
          fileStream.on('error', (e: Error) => combined.destroy(e))
          fileStream.resume()
          startDeflate(combined)
        }
      }
    })
    fileStream.on('error', reject)
  })
}

// ── Processamento por índice ──────────────────────────────────────────────────
type LeadRFB = { cnpj: string; email: string|null; uf: string|null; municipio: string|null; cnae: string; data_abertura: string|null; nome_fantasia: string|null; telefone: string|null }

// Varre arquivo de estabelecimentos coletando e-mails de leads JÁ existentes na base
// (independente de CNAE) — uma passagem única, sem carregar tudo em memória
async function coletarEmailsExistentes(
  tmpPath: string,
  basicosSemEmail: Set<string>,
): Promise<Map<string, string>> {
  const emailMap = new Map<string, string>()
  let COL = EST_DEF
  let primeira = true
  await processarZip(tmpPath, (cols) => {
    if (primeira) { primeira = false; COL = detectarColEst(cols); return }
    if (cols[COL.SITUACAO] !== '02') return
    const basico = cols[COL.BASICO]?.trim()
    if (!basico || !basicosSemEmail.has(basico) || emailMap.has(basico)) return
    const email = validarEmail(cols[COL.EMAIL] ?? null)
    if (email) emailMap.set(basico, email)
  })
  return emailMap
}

async function aplicarEmailsExistentes(emailMap: Map<string, string>): Promise<number> {
  if (!emailMap.size) return 0
  let atualizados = 0
  const entries = [...emailMap.entries()]
  for (let i = 0; i < entries.length; i += 200) {
    const lote = entries.slice(i, i + 200)
    for (const [basico, email] of lote) {
      const { error } = await supabase
        .from('leads')
        .update({ email })
        .like('cnpj', `${basico}%`)
        .is('email', null)
        .not('status', 'in', '("descadastrado","usuario")')
      if (!error) atualizados++
    }
  }
  return atualizados
}

async function coletarEstabelecimentos(
  tmpPath: string,
  targetCnaes: Set<string>,
  contatados: Set<string>,
  municipios: Map<string, string>,
): Promise<Map<string, LeadRFB>> {
  const leads = new Map<string, LeadRFB>()
  const emailContagem = new Map<string, number>()
  let COL = EST_DEF
  let primeira = true
  let pulados = 0
  let totalLinhas = 0, passouMatfil = 0, passouSituacao = 0
  await processarZip(tmpPath, (cols) => {
    if (primeira) { primeira = false; COL = detectarColEst(cols); return }
    totalLinhas++
    if (cols[COL.MATFIL] !== '1') return
    passouMatfil++
    if (cols[COL.SITUACAO] !== '02') return
    passouSituacao++
    const cnae = cols[COL.CNAE]?.trim().replace(/\D/g, '') ?? ''
    if (!targetCnaes.has(cnae)) return
    const basico = cols[COL.BASICO]?.trim()
    if (!basico) return
    if (contatados.has(basico)) { pulados++; return }
    const cnpj = (cols[COL.BASICO] + cols[COL.ORDEM] + cols[COL.DV]).replace(/\D/g, '')
    if (cnpj.length !== 14) return
    const emailRaw = validarEmail(cols[COL.EMAIL] ?? null)
    if (emailRaw) emailContagem.set(emailRaw, (emailContagem.get(emailRaw) ?? 0) + 1)
    const dataInicio = cols[COL.DATA_INICIO]?.trim() ?? ''
    const dataAberturaStr = dataInicio.length === 8
      ? `${dataInicio.slice(0, 4)}-${dataInicio.slice(4, 6)}-${dataInicio.slice(6, 8)}`
      : null
    const ddd = cols[COL.DDD1]?.trim() || ''
    const tel = cols[COL.TEL1]?.trim() || ''
    const telefone = ddd && tel && /\d{6,}/.test(ddd + tel) ? ddd + tel : null
    const nomeFantasiaRaw = cols[COL.NOME_FANTASIA]?.trim() || null
    const munCodigo = cols[COL.MUNICIPIO]?.trim() || null
    const municipioNome = munCodigo ? (municipios.get(munCodigo) ?? null) : null
    leads.set(basico, {
      cnpj,
      email: emailRaw,
      uf: cols[COL.UF]?.trim() || null,
      municipio: municipioNome,
      cnae,
      data_abertura: dataAberturaStr,
      nome_fantasia: nomeFantasiaRaw && /[a-zA-ZÀ-ÿ]/.test(nomeFantasiaRaw) ? nomeFantasiaRaw : null,
      telefone,
    })
  })
  let emailsContabil = 0
  for (const [basico, lead] of leads) {
    if (lead.email && isEmailContabilidade(lead.email, emailContagem)) {
      leads.set(basico, { ...lead, email: null })
      emailsContabil++
    }
  }
  console.log(`  [EST] linhas=${totalLinhas} matrizes=${passouMatfil} ativas=${passouSituacao} leads=${leads.size} pulados=${pulados} emailsContabil=${emailsContabil}`)
  return leads
}

const PORTE_MAP: Record<string, string | null> = { '00': null, '01': 'MICRO EMPRESA', '03': 'EMPRESA DE PEQUENO PORTE', '05': 'DEMAIS' }

async function enriquecerEmpresa(tmpPath: string, leads: Map<string, LeadRFB>): Promise<Map<string, { razao: string; porte: string|null }>> {
  const empresas = new Map<string, { razao: string; porte: string|null }>()
  let COL = EMP_DEF
  let primeira = true
  await processarZip(tmpPath, (cols) => {
    if (primeira) { primeira = false; COL = detectarColEmp(cols); return }
    const basico = cols[COL.BASICO]?.trim()
    if (!basico || !leads.has(basico)) return
    const razao = cols[COL.RAZAO]?.trim()
    if (!razao) return
    const porteCode = cols[COL.PORTE]?.trim() || '00'
    empresas.set(basico, { razao, porte: PORTE_MAP[porteCode] ?? null })
  })
  return empresas
}

async function inserirLeads(leads: Map<string, LeadRFB>, empresas: Map<string, { razao: string; porte: string|null }>): Promise<{ inseridos: number; emailsEnriquecidos: number }> {
  const allLeads = Array.from(leads.values())
  const limitedLeads = MAX_ROWS > 0 ? allLeads.slice(0, MAX_ROWS) : allLeads
  if (MAX_ROWS > 0 && allLeads.length > MAX_ROWS) console.log(`  Limite de ${MAX_ROWS} aplicado (${allLeads.length} disponíveis → ${MAX_ROWS} processados)`)
  const rows = limitedLeads.map(l => {
    const emp = empresas.get(l.cnpj.slice(0, 8))
    const razaoSocial = emp?.razao ?? l.cnpj
    const razaoVerificada = /[a-zA-ZÀ-ÿ]/.test(razaoSocial)
    return {
      cnpj: l.cnpj,
      razao_social: razaoSocial,
      nome_fantasia: l.nome_fantasia,
      email: l.email,
      telefone: l.telefone,
      uf: l.uf,
      municipio: l.municipio,
      cnae_codigo: l.cnae,
      porte: emp?.porte ?? null,
      data_abertura: l.data_abertura,
      status: (l.email && razaoVerificada && l.municipio && l.cnae ? 'pendente' : 'invalido') as 'pendente' | 'invalido',
      situacao: 'ATIVA' as const,
      origem: 'cnae' as const,
      fonte: 'cnae' as const,
    }
  })

  // Insere novos leads (ignora se CNPJ já existe)
  let inseridos = 0
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200)
    const { error } = await supabase.from('leads').upsert(batch, { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) inseridos += batch.length
    else console.error(`  Erro batch inserção ${i}: ${error.message}`)
  }

  // Atualiza leads existentes via RPC com arrays — 7 queries totais em vez de 7×N
  // Lotes de 5000 para não estourar o limite de payload do Supabase
  const LOTE = 5000
  let atualizados = 0
  for (let i = 0; i < rows.length; i += LOTE) {
    const lote = rows.slice(i, i + LOTE)
    const { error } = await supabase.rpc('rfb_atualizar_leads', {
      p_cnpjs:          lote.map(r => r.cnpj),
      p_municipios:     lote.map(r => r.municipio ?? null),
      p_ufs:            lote.map(r => r.uf ?? null),
      p_emails:         lote.map(r => r.email ?? null),
      p_telefones:      lote.map(r => r.telefone ?? null),
      p_nomes_fantasia: lote.map(r => r.nome_fantasia ?? null),
      p_portes:         lote.map(r => r.porte ?? null),
      p_datas_abertura: lote.map(r => r.data_abertura ?? null),
      p_razoes_sociais: lote.map(r => r.razao_social ?? null),
    })
    if (error) console.error(`  Erro RPC atualizar lote ${i}: ${error.message}`)
    else atualizados += lote.length
  }
  console.log(`  [RPC] ${Math.ceil(rows.length / LOTE)} chamadas para ${rows.length} leads`)

  return { inseridos, emailsEnriquecidos: atualizados }
}

// ── Pipeline por arquivo ──────────────────────────────────────────────────────
async function processarArquivo(
  idx: number,
  targetCnaes: Set<string>,
  contatados: Set<string>,
  basicosSemEmail: Set<string>,
  municipios: Map<string, string>,
) {
  const tmpEst = join(tmpdir(), `rf-est-${idx}.zip`)
  const tmpEmp = join(tmpdir(), `rf-emp-${idx}.zip`)

  console.log(`\n╔═══ Arquivo ${idx}/${IDX_END} ════════════════════════════`)

  // 1. Download Estabelecimentos (Storage primeiro, RF como fallback)
  const urlsEst = getUrlsArquivo('Estabelecimentos', idx)
  console.log(`  ↓ Estabelecimentos${idx}.zip`)
  if (!await downloadComRetry(urlsEst, tmpEst)) { console.log('  ✗ Pulando.'); return }

  // 2a. Enriquece e-mail de leads existentes na base (independente de CNAE)
  if (basicosSemEmail.size > 0) {
    console.log(`  ⚙ Buscando e-mails para ${basicosSemEmail.size} leads existentes sem e-mail...`)
    const t0 = Date.now()
    const emailMap = await coletarEmailsExistentes(tmpEst, basicosSemEmail)
    console.log(`  → ${emailMap.size} e-mails encontrados nos arquivos RFB | ${((Date.now()-t0)/1000).toFixed(1)}s`)
    if (emailMap.size > 0) {
      const atualizados = await aplicarEmailsExistentes(emailMap)
      console.log(`  ✓ ${atualizados} leads existentes atualizados com e-mail da RFB`)
      // Remove basicós já enriquecidos para não re-processar nos próximos arquivos
      for (const basico of emailMap.keys()) basicosSemEmail.delete(basico)
    }
  }

  // 2b. Filtra novos leads por CNAE
  console.log(`  ⚙ Filtrando por CNAE (${targetCnaes.size} códigos-alvo, ${contatados.size} já contatados ignorados)...`)
  const t1 = Date.now()
  const leads = await coletarEstabelecimentos(tmpEst, targetCnaes, contatados, municipios)
  const emailsValidos = Array.from(leads.values()).filter(l => l.email).length
  console.log(`  → ${leads.size} leads novos | ${emailsValidos} com e-mail | ${((Date.now()-t1)/1000).toFixed(1)}s`)
  if (existsSync(tmpEst)) unlinkSync(tmpEst)

  if (!leads.size) { console.log('  Nenhum lead novo por CNAE.'); return }

  // 3. Download Empresas → razão social, porte
  const urlsEmp = getUrlsArquivo('Empresas', idx)
  console.log(`  ↓ Empresas${idx}.zip`)
  let empresas = new Map<string, { razao: string; porte: string|null }>()
  if (await downloadComRetry(urlsEmp, tmpEmp)) {
    console.log(`  ⚙ Enriquecendo razão social e porte...`)
    const t2 = Date.now()
    empresas = await enriquecerEmpresa(tmpEmp, leads)
    console.log(`  → ${empresas.size}/${leads.size} empresas encontradas | ${((Date.now()-t2)/1000).toFixed(1)}s`)
    if (existsSync(tmpEmp)) unlinkSync(tmpEmp)
  }

  // 4. Inserção
  console.log(`  ⚙ Inserindo no Supabase...`)
  const { inseridos, emailsEnriquecidos } = await inserirLeads(leads, empresas)
  console.log(`  ✓ ${inseridos} inseridos | ${emailsEnriquecidos} e-mails enriquecidos em leads existentes`)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log(`Monitor de Licitações — Coleta RFB`)
  console.log(`Período: ${ANO}-${MES_PAD} | Índices: ${IDX_START}–${IDX_END}`)
  console.log(`Fonte: ${RF_BASE}`)

  // Reseta email_tentativas de leads bloqueados (>=3) sem email — nova chance com dados frescos da RFB
  console.log('Resetando email_tentativas de leads bloqueados...')
  const { count: bloqueados } = await supabase
    .from('leads').select('id', { count: 'exact', head: true })
    .is('email', null).gte('email_tentativas', 3)
  await supabase
    .from('leads').update({ email_tentativas: 0 })
    .is('email', null).gte('email_tentativas', 3)
  console.log(`  ${bloqueados ?? 0} leads desbloqueados para nova tentativa`)

  const [targetCnaes, contatados, basicosSemEmail, municipios] = await Promise.all([
    getTargetCnaes(),
    getCnpjsContatados(),
    getBasicosSemEmail(),
    carregarMunicipios(),
  ])
  console.log(`Contatados a ignorar: ${contatados.size}`)
  console.log(`Leads sem e-mail para enriquecer: ${basicosSemEmail.size}`)

  for (let i = IDX_START; i <= IDX_END; i++) {
    await processarArquivo(i, targetCnaes, contatados, basicosSemEmail, municipios)
  }

  console.log('\n✓ Coleta concluída.')
}

main().catch(e => { console.error(e); process.exit(1) })
