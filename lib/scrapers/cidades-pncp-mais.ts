/**
 * Cidades médias — batch adicional via PNCP IBGE
 *
 * Municípios brasileiros acima de 50 mil habitantes ainda não cobertos
 * nos batches anteriores. Selecionados por:
 * - população significativa (>50k)
 * - diversidade geográfica (regiões sub-representadas)
 * - relevância econômica/industrial
 *
 * Todos os IDs são códigos IBGE de 7 dígitos (formato oficial do PNCP).
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── São Paulo — cidades médias não cobertas ───────────────────────────────────
/** Guarujá SP — 320k hab., porto, turismo, indústria */
export const coletarGuaruja         = criarScraperPNCPMunicipio(3519401, 'SP', 'Guarujá', 'PNCP Guarujá SP')
/** Itu SP — 175k hab., polo têxtil e industrial */
export const coletarItu             = criarScraperPNCPMunicipio(3523909, 'SP', 'Itu', 'PNCP Itu SP')
/** Itapetininga SP — 165k hab., agronegócio e indústria */
export const coletarItapetininga    = criarScraperPNCPMunicipio(3522604, 'SP', 'Itapetininga', 'PNCP Itapetininga SP')
/** Bragança Paulista SP — 165k hab., serviços e educação */
export const coletarBragancaPaulista = criarScraperPNCPMunicipio(3507605, 'SP', 'Bragança Paulista', 'PNCP Bragança Paulista SP')
/** Lorena SP — 90k hab., polo aeronáutico e industrial */
export const coletarLorena          = criarScraperPNCPMunicipio(3527306, 'SP', 'Lorena', 'PNCP Lorena SP')
/** Registro SP — 60k hab., Vale do Ribeira */
export const coletarRegistro        = criarScraperPNCPMunicipio(3542305, 'SP', 'Registro', 'PNCP Registro SP')

// ── Rio de Janeiro — interior ─────────────────────────────────────────────────
/** Resende RJ — 130k hab., polo automotivo (PSA Peugeot-Citroën) */
export const coletarResende         = criarScraperPNCPMunicipio(3304201, 'RJ', 'Resende', 'PNCP Resende RJ')
/** Três Rios RJ — 80k hab., entroncamento rodoviário */
export const coletarTresRios        = criarScraperPNCPMunicipio(3305752, 'RJ', 'Três Rios', 'PNCP Três Rios RJ')
/** Barra Mansa RJ — 180k hab., siderurgia */
export const coletarBarraMansa      = criarScraperPNCPMunicipio(3300407, 'RJ', 'Barra Mansa', 'PNCP Barra Mansa RJ')

// ── Minas Gerais ─────────────────────────────────────────────────────────────
/** Araxá MG — 110k hab., mineração de nióbio */
export const coletarAraxa           = criarScraperPNCPMunicipio(3103504, 'MG', 'Araxá', 'PNCP Araxá MG')
/** Conselheiro Lafaiete MG — 130k hab., siderurgia */
export const coletarConselheiro     = criarScraperPNCPMunicipio(3118304, 'MG', 'Conselheiro Lafaiete', 'PNCP Conselheiro Lafaiete MG')
/** Itajubá MG — 100k hab., polo tecnológico/energia */
export const coletarItajuba         = criarScraperPNCPMunicipio(3132503, 'MG', 'Itajubá', 'PNCP Itajubá MG')

// ── Bahia — interior ──────────────────────────────────────────────────────────
/** Juazeiro BA — 215k hab., polo fruticultor do Vale do São Francisco */
export const coletarJuazeiroBa      = criarScraperPNCPMunicipio(2918407, 'BA', 'Juazeiro', 'PNCP Juazeiro BA')
/** Jequié BA — 155k hab., serviços e agronegócio */
export const coletarJequie          = criarScraperPNCPMunicipio(2918001, 'BA', 'Jequié', 'PNCP Jequié BA')
/** Alagoinhas BA — 155k hab., polo petroquímico */
export const coletarAlagoinhas      = criarScraperPNCPMunicipio(2900702, 'BA', 'Alagoinhas', 'PNCP Alagoinhas BA')
/** Teixeira de Freitas BA — 165k hab., polo madeireiro */
export const coletarTeixeiraFreitas = criarScraperPNCPMunicipio(2931350, 'BA', 'Teixeira de Freitas', 'PNCP Teixeira de Freitas BA')

// ── Ceará ─────────────────────────────────────────────────────────────────────
/** Crato CE — 135k hab., região do Cariri */
export const coletarCrato          = criarScraperPNCPMunicipio(2304400, 'CE', 'Crato', 'PNCP Crato CE')
/** Iguatu CE — 105k hab., polo têxtil */
export const coletarIguatu         = criarScraperPNCPMunicipio(2305506, 'CE', 'Iguatu', 'PNCP Iguatu CE')

// ── Maranhão ──────────────────────────────────────────────────────────────────
/** Caxias MA — 160k hab., polo agroindustrial */
export const coletarCaxiasMa       = criarScraperPNCPMunicipio(2103000, 'MA', 'Caxias', 'PNCP Caxias MA')
/** Açailândia MA — 110k hab., polo siderúrgico/mineração */
export const coletarAcailandia     = criarScraperPNCPMunicipio(2100055, 'MA', 'Açailândia', 'PNCP Açailândia MA')

// ── Tocantins ─────────────────────────────────────────────────────────────────
/** Gurupi TO — 90k hab., polo agropecuário */
export const coletarGurupi         = criarScraperPNCPMunicipio(1709500, 'TO', 'Gurupi', 'PNCP Gurupi TO')

// ── Pará ──────────────────────────────────────────────────────────────────────
/** Parauapebas PA — 215k hab., polo minerador (Vale/Carajás) */
export const coletarParauapebas    = criarScraperPNCPMunicipio(1505536, 'PA', 'Parauapebas', 'PNCP Parauapebas PA')
/** Altamira PA — 115k hab., Belo Monte */
export const coletarAltamira       = criarScraperPNCPMunicipio(1500602, 'PA', 'Altamira', 'PNCP Altamira PA')

// ── Rondônia ──────────────────────────────────────────────────────────────────
/** Vilhena RO — 100k hab., polo agropecuário */
export const coletarVilhena        = criarScraperPNCPMunicipio(1100304, 'RO', 'Vilhena', 'PNCP Vilhena RO')
/** Cacoal RO — 90k hab., agropecuária e comércio */
export const coletarCacoal         = criarScraperPNCPMunicipio(1100049, 'RO', 'Cacoal', 'PNCP Cacoal RO')

// ── Mato Grosso ───────────────────────────────────────────────────────────────
/** Sinop MT — 145k hab., polo madeireiro/agro */
export const coletarSinop          = criarScraperPNCPMunicipio(5107909, 'MT', 'Sinop', 'PNCP Sinop MT')
/** Sorriso MT — 100k hab., maior produtor de soja do Brasil */
export const coletarSorriso        = criarScraperPNCPMunicipio(5107925, 'MT', 'Sorriso', 'PNCP Sorriso MT')

// ── Mato Grosso do Sul ────────────────────────────────────────────────────────
/** Três Lagoas MS — 125k hab., polo celulósico */
export const coletarTresLagoas     = criarScraperPNCPMunicipio(5008305, 'MS', 'Três Lagoas', 'PNCP Três Lagoas MS')
/** Corumbá MS — 115k hab., polo minero-siderúrgico e pantanal */
export const coletarCorumba        = criarScraperPNCPMunicipio(5003207, 'MS', 'Corumbá', 'PNCP Corumbá MS')

// ── Goiás ─────────────────────────────────────────────────────────────────────
/** Catalão GO — 85k hab., polo automobilístico */
export const coletarCatalao        = criarScraperPNCPMunicipio(5205109, 'GO', 'Catalão', 'PNCP Catalão GO')
/** Jataí GO — 100k hab., polo agropecuário */
export const coletarJatai          = criarScraperPNCPMunicipio(5211909, 'GO', 'Jataí', 'PNCP Jataí GO')

// ── Amapá ─────────────────────────────────────────────────────────────────────
/** Santana AP — 115k hab., polo portuário/industrial */
export const coletarSantanaAP      = criarScraperPNCPMunicipio(1600600, 'AP', 'Santana', 'PNCP Santana AP')

// ── Rio Grande do Norte ───────────────────────────────────────────────────────
/** Caicó RN — 75k hab., polo comercial do Seridó */
export const coletarCaico          = criarScraperPNCPMunicipio(2401552, 'RN', 'Caicó', 'PNCP Caicó RN')

// ── Paraíba ───────────────────────────────────────────────────────────────────
/** Santa Rita PB — 135k hab., polo têxtil */
export const coletarSantaRitaPB    = criarScraperPNCPMunicipio(2513703, 'PB', 'Santa Rita', 'PNCP Santa Rita PB')
