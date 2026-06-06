/**
 * Cidades — Sul extra (PR/SC/RS médios) + GO/MT/MS extra via PNCP por código IBGE
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── Paraná — municípios médios ────────────────────────────────────────────────
/** Apucarana PR — 130k hab, polo confecções */
export const coletarApucarana       = criarScraperPNCPMunicipio(4101408, 'PR', 'Apucarana',         'Apucarana PR')
/** Guarapuava PR — 175k hab, polo grãos do Centro-Sul */
export const coletarGuarapuava      = criarScraperPNCPMunicipio(4109401, 'PR', 'Guarapuava',        'Guarapuava PR')
/** Paranaguá PR — 145k hab, maior porto graneleiro da AL */
export const coletarParanagua       = criarScraperPNCPMunicipio(4118204, 'PR', 'Paranaguá',         'Paranaguá PR')
/** Araucária PR — 140k hab, refinery/polo petroquímico */
export const coletarAraucaria       = criarScraperPNCPMunicipio(4101804, 'PR', 'Araucária',         'Araucária PR')
/** Pinhais PR — 130k hab, Grande Curitiba norte */
export const coletarPinhais         = criarScraperPNCPMunicipio(4119152, 'PR', 'Pinhais',           'Pinhais PR')
/** Almirante Tamandaré PR — 110k hab, Grande Curitiba */
export const coletarAlmiranteTam    = criarScraperPNCPMunicipio(4100400, 'PR', 'Almirante Tamandaré','Almirante Tamandaré PR')
/** Toledo PR — 130k hab, polo agroindustrial Oeste */
export const coletarToledo          = criarScraperPNCPMunicipio(4127700, 'PR', 'Toledo',             'Toledo PR')
/** Umuarama PR — 110k hab, Noroeste do PR */
export const coletarUmuarama        = criarScraperPNCPMunicipio(4128104, 'PR', 'Umuarama',           'Umuarama PR')

// ── Santa Catarina — municípios médios ────────────────────────────────────────
/** Criciúma SC — 220k hab, polo cerâmico/mineral */
export const coletarCricuma         = criarScraperPNCPMunicipio(4204608, 'SC', 'Criciúma',          'Criciúma SC')
/** Lages SC — 160k hab, polo madeireiro e suíno */
export const coletarLages           = criarScraperPNCPMunicipio(4209300, 'SC', 'Lages',             'Lages SC')
/** São José do Rio do Peixe ... não, Jaraguá do Sul SC — 170k hab, polo têxtil */
export const coletarJaragua         = criarScraperPNCPMunicipio(4209102, 'SC', 'Jaraguá do Sul',    'Jaraguá do Sul SC')
/** Florianópolis foi adicionado — este é Biguaçu SC — 65k hab, Grande Floripa */
export const coletarBiguacu         = criarScraperPNCPMunicipio(4202305, 'SC', 'Biguaçu',           'Biguaçu SC')
/** Tubarão SC — 100k hab, polo energético/carbono */
export const coletarTubarao         = criarScraperPNCPMunicipio(4218707, 'SC', 'Tubarão',           'Tubarão SC')
/** Navegantes SC — 70k hab, polo portuário */
export const coletarNavegantes      = criarScraperPNCPMunicipio(4211306, 'SC', 'Navegantes',        'Navegantes SC')

// ── Rio Grande do Sul — municípios médios ─────────────────────────────────────
/** Caxias do Sul foi adicionado — este é Passo Fundo RS — 200k hab, polo agro do norte */
export const coletarPassoFundo      = criarScraperPNCPMunicipio(4314100, 'RS', 'Passo Fundo',       'Passo Fundo RS')
/** Bagé RS — 120k hab, pecuária de corte */
export const coletarBage            = criarScraperPNCPMunicipio(4301602, 'RS', 'Bagé',              'Bagé RS')
/** Santa Cruz do Sul RS — 130k hab, polo fumageiro */
export const coletarSantaCruzSul    = criarScraperPNCPMunicipio(4316808, 'RS', 'Santa Cruz do Sul', 'Santa Cruz do Sul RS')
/** Cachoeirinha RS — 130k hab, Grande Porto Alegre */
export const coletarCachoeirinha    = criarScraperPNCPMunicipio(4303103, 'RS', 'Cachoeirinha',      'Cachoeirinha RS')
/** Alvorada RS — 200k hab, Grande Porto Alegre sul */
export const coletarAlvorada        = criarScraperPNCPMunicipio(4300604, 'RS', 'Alvorada',          'Alvorada RS')
/** Erechim RS — 100k hab, polo agroindustrial norte */
export const coletarErechim         = criarScraperPNCPMunicipio(4307203, 'RS', 'Erechim',           'Erechim RS')

// ── Goiás — municípios extras ─────────────────────────────────────────────────
/** Luziânia GO — 185k hab, Entorno de Brasília */
export const coletarLuzianiaGO      = criarScraperPNCPMunicipio(5212501, 'GO', 'Luziânia',          'Luziânia GO')
/** Aparecida de Goiânia foi adicionado no batch 3 */
/** Valparaíso de Goiás GO — 160k hab, Entorno de Brasília */
export const coletarValparaisoGO    = criarScraperPNCPMunicipio(5221858, 'GO', 'Valparaíso de Goiás', 'Valparaíso de Goiás GO')
/** Caldas Novas GO — 85k hab, polo turístico/termal */
export const coletarCaldasNovas     = criarScraperPNCPMunicipio(5204102, 'GO', 'Caldas Novas',      'Caldas Novas GO')
/** Itumbiara GO — 95k hab, polo agro do Paranaíba */
export const coletarItumbiara       = criarScraperPNCPMunicipio(5211503, 'GO', 'Itumbiara',         'Itumbiara GO')
