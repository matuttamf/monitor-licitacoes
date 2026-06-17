'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { removerRegiao } from '@/lib/regioes'
import { RegiaoSelector, RegiaoChips } from '@/components/RegiaoSelector'
import BannerPausa from '@/app/(dashboard)/components/BannerPausa'

type Licitacao = {
  id: string
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  estado?: string
  cidade?: string
  fonte: string
  alertas: { keywords: { termo: string } }[]
}

type Resposta = {
  data: Licitacao[]
  total: number
  pagina: number
  paginas: number
  volumeTotal: number
}

const fonteConfig: Record<string, { cor: string; bg: string }> = {
  // Camada 1 — Federal
  'PNCP':              { cor: '#6B0F1A', bg: 'rgba(107,15,26,0.07)'  },
  'PNCP Contratos':    { cor: '#7c1d1d', bg: 'rgba(124,29,29,0.07)'  },
  'PNCP Atas':         { cor: '#991b1b', bg: 'rgba(153,27,27,0.07)'  },
  'PNCP PCA':          { cor: '#b91c1c', bg: 'rgba(185,28,28,0.07)'  },
  'ComprasNet':        { cor: '#8B1E2D', bg: 'rgba(139,30,45,0.07)'  },
  'Querido Diário':    { cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)'  },
  'Google':            { cor: '#2d6a4f', bg: 'rgba(45,106,79,0.07)'  },
  'DOU':               { cor: '#374151', bg: 'rgba(55,65,81,0.07)'   },
  'DOU Seção 1':       { cor: '#4b5563', bg: 'rgba(75,85,99,0.07)'  },
  'DOU Seção 2':       { cor: '#6b7280', bg: 'rgba(107,114,128,0.07)'},
  // Plataformas privadas
  'BBMNET':            { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.07)'  },
  'Licitanet':         { cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
  'BLL':               { cor: '#4a4a4d', bg: 'rgba(74,74,77,0.07)'   },
  'Licitações-e':      { cor: '#b45309', bg: 'rgba(180,83,9,0.07)'   },
  'Licitar Digital':   { cor: '#9f1239', bg: 'rgba(159,18,57,0.07)'  },
  'Negócios Públicos': { cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  'Compras Públicas':  { cor: '#1e40af', bg: 'rgba(30,64,175,0.07)'  },
  // Camada 2 — Estados
  'BEC/SP':            { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  'Portal MG':         { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Portal RS':         { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)'   },
  'Portal PR':         { cor: '#3b0764', bg: 'rgba(59,7,100,0.07)'   },
  'Portal BA':         { cor: '#92400e', bg: 'rgba(146,64,14,0.07)'  },
  'Portal RJ':         { cor: '#166534', bg: 'rgba(22,101,52,0.07)'  },
  'Portal SC':         { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.08)'   },
  'Portal CE':         { cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)'  },
  'Portal PE':         { cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)'  },
  'Portal GO':         { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Portal DF':         { cor: '#1c1917', bg: 'rgba(28,25,23,0.07)'   },
  'Portal ES':         { cor: '#064e3b', bg: 'rgba(6,78,59,0.07)'    },
  'Portal MT':         { cor: '#78350f', bg: 'rgba(120,53,15,0.07)'  },
  'Portal AM':         { cor: '#1a2e05', bg: 'rgba(26,46,5,0.07)'    },
  'Portal MS':         { cor: '#166534', bg: 'rgba(22,101,52,0.08)'  },
  'Portal PB':         { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.09)'   },
  'Portal PA':         { cor: '#064e3b', bg: 'rgba(6,78,59,0.08)'    },
  'Portal AC':         { cor: '#1a2e05', bg: 'rgba(26,46,5,0.08)'    },
  'Portal RO':         { cor: '#78350f', bg: 'rgba(120,53,15,0.08)'  },
  'Portal RR':         { cor: '#92400e', bg: 'rgba(146,64,14,0.08)'  },
  'Portal TO':         { cor: '#7c2d12', bg: 'rgba(124,45,18,0.08)'  },
  'Portal MA':         { cor: '#3b0764', bg: 'rgba(59,7,100,0.08)'   },
  'Portal PI':         { cor: '#4c1d95', bg: 'rgba(76,29,149,0.08)'  },
  'Portal RN':         { cor: '#065f46', bg: 'rgba(6,95,70,0.08)'    },
  'Portal SE':         { cor: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  'Portal AL':         { cor: '#1e40af', bg: 'rgba(30,64,175,0.08)'  },
  'Portal AP':         { cor: '#14532d', bg: 'rgba(20,83,45,0.08)'   },
  // Camada 3 — Municípios
  'SP Capital':        { cor: '#831843', bg: 'rgba(131,24,67,0.07)'  },
  'Portal BH':         { cor: '#312e81', bg: 'rgba(49,46,129,0.07)'  },
  'Portal Recife':     { cor: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  'Portal Fortaleza':  { cor: '#b45309', bg: 'rgba(180,83,9,0.08)'   },
  'Portal Manaus':     { cor: '#1a2e05', bg: 'rgba(26,46,5,0.09)'    },
  'Portal Curitiba':   { cor: '#3b0764', bg: 'rgba(59,7,100,0.09)'   },
  'Portal POA':        { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.1)'    },
  'Portal Belém':      { cor: '#064e3b', bg: 'rgba(6,78,59,0.09)'    },
  'Portal Goiânia':    { cor: '#14532d', bg: 'rgba(20,83,45,0.09)'   },
  'Portal Salvador':   { cor: '#92400e', bg: 'rgba(146,64,14,0.09)'  },
  // Capitais restantes
  'Portal Natal':      { cor: '#065f46', bg: 'rgba(6,95,70,0.09)'    },
  'Portal Campo Grande':{ cor: '#166534', bg: 'rgba(22,101,52,0.1)'  },
  'Portal Maceió':     { cor: '#1e40af', bg: 'rgba(30,64,175,0.09)'  },
  'Portal São Luís':   { cor: '#3b0764', bg: 'rgba(59,7,100,0.1)'    },
  'Portal Teresina':   { cor: '#4c1d95', bg: 'rgba(76,29,149,0.09)'  },
  'Portal João Pessoa':{ cor: '#1e3a5f', bg: 'rgba(30,58,95,0.1)'    },
  'Portal Aracaju':    { cor: '#0f766e', bg: 'rgba(15,118,110,0.09)' },
  // Cidades 200k+
  'Portal Campinas':   { cor: '#831843', bg: 'rgba(131,24,67,0.08)'  },
  'Portal Guarulhos':  { cor: '#7c2d12', bg: 'rgba(124,45,18,0.09)'  },
  'Portal Uberlândia': { cor: '#065f46', bg: 'rgba(6,95,70,0.1)'     },
  'Portal Joinville':  { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.11)'   },
  'Portal Londrina':   { cor: '#3b0764', bg: 'rgba(59,7,100,0.11)'   },
  'Portal Ribeirão Preto':{ cor: '#92400e', bg: 'rgba(146,64,14,0.1)'},
  // Camada 3 — Cidades batch 2 e 3
  'Portal Santos':             { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.08)'  },
  'Portal Sorocaba':           { cor: '#065f46', bg: 'rgba(6,95,70,0.08)'   },
  'Portal São Bernardo':       { cor: '#831843', bg: 'rgba(131,24,67,0.08)' },
  'Portal Contagem':           { cor: '#312e81', bg: 'rgba(49,46,129,0.08)' },
  'Portal Maringá':            { cor: '#3b0764', bg: 'rgba(59,7,100,0.08)'  },
  'Portal São José dos Campos':{ cor: '#1e40af', bg: 'rgba(30,64,175,0.08)' },
  'Portal Mogi das Cruzes':    { cor: '#7c2d12', bg: 'rgba(124,45,18,0.08)' },
  'Portal Juiz de Fora':       { cor: '#065f46', bg: 'rgba(6,95,70,0.09)'   },
  'Portal Niterói':            { cor: '#166534', bg: 'rgba(22,101,52,0.08)' },
  'Portal Feira de Santana':   { cor: '#92400e', bg: 'rgba(146,64,14,0.09)' },
  'Portal Osasco':             { cor: '#4c1d95', bg: 'rgba(76,29,149,0.08)' },
  'Portal Santo André':        { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.09)'  },
  'Portal Duque de Caxias':    { cor: '#14532d', bg: 'rgba(20,83,45,0.08)'  },
  'Portal Aparecida de Goiânia':{ cor: '#14532d', bg: 'rgba(20,83,45,0.09)' },
  'Portal Caxias do Sul':      { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.1)'   },
  'Portal São José do Rio Preto':{ cor: '#831843', bg: 'rgba(131,24,67,0.09)' },
  'Portal Jundiaí':            { cor: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  'Portal Betim':              { cor: '#065f46', bg: 'rgba(6,95,70,0.1)'     },
  // Camada 4 — Consórcios + autarquias
  'Consórcio Grande ABC':      { cor: '#b45309', bg: 'rgba(180,83,9,0.09)'  },
  'FNDE':                      { cor: '#0f766e', bg: 'rgba(15,118,110,0.09)' },
  'FNS / Ministério da Saúde': { cor: '#6B0F1A', bg: 'rgba(107,15,26,0.09)' },
  'DNIT':                      { cor: '#374151', bg: 'rgba(55,65,81,0.09)'  },
  'Consórcio PCJ':             { cor: '#0369a1', bg: 'rgba(3,105,161,0.09)' },
  // Camada 5 — Estatais
  'Petronect':         { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.1)'   },
  'Correios':          { cor: '#d97706', bg: 'rgba(217,119,6,0.1)'   },
  'Caixa':             { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.09)'  },
  'Eletrobras':        { cor: '#065f46', bg: 'rgba(6,95,70,0.1)'     },
  'SABESP':            { cor: '#0369a1', bg: 'rgba(3,105,161,0.1)'   },
  // Camada 6 — Órgãos federais via PNCP CNPJ
  'INSS':              { cor: '#6B0F1A', bg: 'rgba(107,15,26,0.08)'  },
  'MEC':               { cor: '#065f46', bg: 'rgba(6,95,70,0.09)'    },
  'CAPES':             { cor: '#14532d', bg: 'rgba(20,83,45,0.08)'   },
  'CNPq':              { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.09)'   },
  'EMBRAPA':           { cor: '#78350f', bg: 'rgba(120,53,15,0.08)'  },
  'IBGE':              { cor: '#374151', bg: 'rgba(55,65,81,0.09)'   },
  'FIOCRUZ':           { cor: '#7c1d1d', bg: 'rgba(124,29,29,0.08)'  },
  'ANVISA':            { cor: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  'INFRAERO':          { cor: '#1e40af', bg: 'rgba(30,64,175,0.08)'  },
  'ANATEL':            { cor: '#4c1d95', bg: 'rgba(76,29,149,0.08)'  },
  'CODEVASF':          { cor: '#064e3b', bg: 'rgba(6,78,59,0.09)'    },
  'CONAB':             { cor: '#92400e', bg: 'rgba(146,64,14,0.09)'  },
  'AGU':               { cor: '#1c1917', bg: 'rgba(28,25,23,0.09)'   },
  'TCU':               { cor: '#312e81', bg: 'rgba(49,46,129,0.08)'  },
  'INCRA':             { cor: '#1a2e05', bg: 'rgba(26,46,5,0.1)'     },
  'IBAMA':             { cor: '#14532d', bg: 'rgba(20,83,45,0.1)'    },
  'SERPRO':            { cor: '#0369a1', bg: 'rgba(3,105,161,0.08)'  },
  'DATAPREV':          { cor: '#b45309', bg: 'rgba(180,83,9,0.08)'   },
  // Camada 7 — Cidades PNCP Sudeste
  'São Gonçalo RJ':    { cor: '#166534', bg: 'rgba(22,101,52,0.07)'  },
  'Nova Iguaçu RJ':    { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Campos Goytacazes RJ':{ cor: '#065f46', bg: 'rgba(6,78,59,0.07)' },
  'Volta Redonda RJ':  { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)'  },
  'Macaé RJ':          { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)' },
  'Petrópolis RJ':     { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.07)' },
  'Piracicaba SP':     { cor: '#831843', bg: 'rgba(131,24,67,0.07)'  },
  'Mauá SP':           { cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)'  },
  'Diadema SP':        { cor: '#9f1239', bg: 'rgba(159,18,57,0.07)'  },
  'Carapicuíba SP':    { cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)'  },
  'Bauru SP':          { cor: '#78350f', bg: 'rgba(120,53,15,0.07)'  },
  'Franca SP':         { cor: '#92400e', bg: 'rgba(146,64,14,0.07)'  },
  'Limeira SP':        { cor: '#b45309', bg: 'rgba(180,83,9,0.07)'   },
  'Barueri SP':        { cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
  'Taubaté SP':        { cor: '#1e40af', bg: 'rgba(30,64,175,0.07)'  },
  'Suzano SP':         { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.07)'  },
  'Sumaré SP':         { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.08)'   },
  'São Vicente SP':    { cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  'Praia Grande SP':   { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  'Taboão da Serra SP':{ cor: '#312e81', bg: 'rgba(49,46,129,0.07)'  },
  'Uberaba MG':        { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Gov. Valadares MG': { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Ipatinga MG':       { cor: '#064e3b', bg: 'rgba(6,78,59,0.07)'    },
  'Sete Lagoas MG':    { cor: '#1a2e05', bg: 'rgba(26,46,5,0.07)'    },
  'Divinópolis MG':    { cor: '#166534', bg: 'rgba(22,101,52,0.07)'  },
  'Montes Claros MG':  { cor: '#14532d', bg: 'rgba(20,83,45,0.08)'   },
  'Vila Velha ES':     { cor: '#065f46', bg: 'rgba(6,95,70,0.08)'    },
  'Serra ES':          { cor: '#064e3b', bg: 'rgba(6,78,59,0.08)'    },
  'Cariacica ES':      { cor: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  // Camada 7 — Sul
  'Ponta Grossa PR':   { cor: '#3b0764', bg: 'rgba(59,7,100,0.07)'   },
  'Cascavel PR':       { cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)'  },
  'Foz do Iguaçu PR':  { cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
  'SJ dos Pinhais PR': { cor: '#312e81', bg: 'rgba(49,46,129,0.07)'  },
  'Colombo PR':        { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)'   },
  'Blumenau SC':       { cor: '#1e40af', bg: 'rgba(30,64,175,0.07)'  },
  'São José SC':       { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.07)'  },
  'Chapecó SC':        { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  'Itajaí SC':         { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.07)'  },
  'Balneário Camboriú SC':{ cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  'Palhoça SC':        { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Pelotas RS':        { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.08)'   },
  'Canoas RS':         { cor: '#374151', bg: 'rgba(55,65,81,0.07)'    },
  'Santa Maria RS':    { cor: '#4b5563', bg: 'rgba(75,85,99,0.07)'   },
  'Novo Hamburgo RS':  { cor: '#1e40af', bg: 'rgba(30,64,175,0.08)'  },
  'Gravataí RS':       { cor: '#312e81', bg: 'rgba(49,46,129,0.08)'  },
  'Viamão RS':         { cor: '#3b0764', bg: 'rgba(59,7,100,0.08)'   },
  'São Leopoldo RS':   { cor: '#4c1d95', bg: 'rgba(76,29,149,0.08)'  },
  // Camada 7 — Nordeste
  'Vitória da Conquista BA':{ cor: '#92400e', bg: 'rgba(146,64,14,0.07)' },
  'Camaçari BA':       { cor: '#78350f', bg: 'rgba(120,53,15,0.07)'  },
  'Itabuna BA':        { cor: '#b45309', bg: 'rgba(180,83,9,0.07)'   },
  'Ilhéus BA':         { cor: '#92400e', bg: 'rgba(146,64,14,0.08)'  },
  'Lauro de Freitas BA':{ cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)' },
  'Caruaru PE':        { cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)'  },
  'Petrolina PE':      { cor: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  'Olinda PE':         { cor: '#312e81', bg: 'rgba(49,46,129,0.07)'  },
  'Cabo Sto. Agostinho PE':{ cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)' },
  'Caucaia CE':        { cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)'  },
  'Juazeiro do Norte CE':{ cor: '#6B0F1A', bg: 'rgba(107,15,26,0.07)' },
  'Maracanaú CE':      { cor: '#831843', bg: 'rgba(131,24,67,0.07)'  },
  'Sobral CE':         { cor: '#9f1239', bg: 'rgba(159,18,57,0.07)'  },
  'Mossoró RN':        { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Campina Grande PB': { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)'   },
  'Imperatriz MA':     { cor: '#3b0764', bg: 'rgba(59,7,100,0.07)'   },
  'Timon MA':          { cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)'  },
  'Parnaíba PI':       { cor: '#064e3b', bg: 'rgba(6,78,59,0.07)'    },
  'Arapiraca AL':      { cor: '#1e40af', bg: 'rgba(30,64,175,0.07)'  },
  // Camada 7 — Norte + Centro-Oeste + Capitais faltantes
  'Florianópolis SC':  { cor: '#1e40af', bg: 'rgba(30,64,175,0.08)'  },
  'Vitória ES':        { cor: '#064e3b', bg: 'rgba(6,78,59,0.08)'    },
  'Cuiabá MT':         { cor: '#78350f', bg: 'rgba(120,53,15,0.08)'  },
  'Porto Velho RO':    { cor: '#92400e', bg: 'rgba(146,64,14,0.08)'  },
  'Rio Branco AC':     { cor: '#1a2e05', bg: 'rgba(26,46,5,0.09)'    },
  'Macapá AP':         { cor: '#14532d', bg: 'rgba(20,83,45,0.09)'   },
  'Boa Vista RR':      { cor: '#065f46', bg: 'rgba(6,95,70,0.09)'    },
  'Palmas TO':         { cor: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  'Ananindeua PA':     { cor: '#064e3b', bg: 'rgba(6,78,59,0.07)'    },
  'Santarém PA':       { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Marabá PA':         { cor: '#1a2e05', bg: 'rgba(26,46,5,0.07)'    },
  'Castanhal PA':      { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Anápolis GO':       { cor: '#14532d', bg: 'rgba(20,83,45,0.08)'   },
  'Rio Verde GO':      { cor: '#166534', bg: 'rgba(22,101,52,0.08)'  },
  'Dourados MS':       { cor: '#166534', bg: 'rgba(22,101,52,0.07)'  },
  'Várzea Grande MT':  { cor: '#78350f', bg: 'rgba(120,53,15,0.07)'  },
  'Rondonópolis MT':   { cor: '#92400e', bg: 'rgba(146,64,14,0.07)'  },
  'Ji-Paraná RO':      { cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)'  },
  'Araguaína TO':      { cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  // Camada 8 — SP interior
  'Itaquaquecetuba SP':{ cor: '#831843', bg: 'rgba(131,24,67,0.07)'  },
  'Cotia SP':          { cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)'  },
  'Embu das Artes SP': { cor: '#92400e', bg: 'rgba(146,64,14,0.07)'  },
  'Itapevi SP':        { cor: '#b45309', bg: 'rgba(180,83,9,0.07)'   },
  'Hortolândia SP':    { cor: '#1e40af', bg: 'rgba(30,64,175,0.07)'  },
  'Indaiatuba SP':     { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.07)'  },
  'Americana SP':      { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  'Ferraz de Vasconcelos SP':{ cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)' },
  'Itapecerica da Serra SP':{ cor: '#312e81', bg: 'rgba(49,46,129,0.07)' },
  'São Caetano do Sul SP':{ cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)' },
  'São Carlos SP':     { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Araraquara SP':     { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Presidente Prudente SP':{ cor: '#064e3b', bg: 'rgba(6,78,59,0.07)' },
  'Rio Claro SP':      { cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  'Jacareí SP':        { cor: '#374151', bg: 'rgba(55,65,81,0.07)'   },
  'Araçatuba SP':      { cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
  'Marília SP':        { cor: '#6B0F1A', bg: 'rgba(107,15,26,0.07)'  },
  'Mogi Guaçu SP':     { cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)'  },
  'Botucatu SP':       { cor: '#92400e', bg: 'rgba(146,64,14,0.07)'  },
  'Catanduva SP':      { cor: '#78350f', bg: 'rgba(120,53,15,0.07)'  },
  'Guaratinguetá SP':  { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)'   },
  'Sertãozinho SP':    { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Leme SP':           { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  // Camada 8 — Baixada Fluminense + MG/ES
  'Belford Roxo RJ':   { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'SJ de Meriti RJ':   { cor: '#166534', bg: 'rgba(22,101,52,0.07)'  },
  'Magé RJ':           { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Itaboraí RJ':       { cor: '#064e3b', bg: 'rgba(6,78,59,0.07)'    },
  'Nova Friburgo RJ':  { cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  'Angra dos Reis RJ': { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  'Cabo Frio RJ':      { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.07)'  },
  'Nilópolis RJ':      { cor: '#1e40af', bg: 'rgba(30,64,175,0.07)'  },
  'Teresópolis RJ':    { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.07)'  },
  'Queimados RJ':      { cor: '#312e81', bg: 'rgba(49,46,129,0.07)'  },
  'Patos de Minas MG': { cor: '#78350f', bg: 'rgba(120,53,15,0.07)'  },
  'Teófilo Otoni MG':  { cor: '#92400e', bg: 'rgba(146,64,14,0.07)'  },
  'Poços de Caldas MG':{ cor: '#b45309', bg: 'rgba(180,83,9,0.07)'   },
  'Barbacena MG':      { cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)'  },
  'Coronel Fabriciano MG':{ cor: '#6B0F1A', bg: 'rgba(107,15,26,0.07)' },
  'Muriaé MG':         { cor: '#831843', bg: 'rgba(131,24,67,0.07)'  },
  'Varginha MG':       { cor: '#9f1239', bg: 'rgba(159,18,57,0.07)'  },
  'Lavras MG':         { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Alfenas MG':        { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Linhares ES':       { cor: '#064e3b', bg: 'rgba(6,78,59,0.07)'    },
  'São Mateus ES':     { cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  'Colatina ES':       { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Cachoeiro de Itapemirim ES':{ cor: '#14532d', bg: 'rgba(20,83,45,0.07)' },
  // Camada 8 — Sul extra
  'Apucarana PR':      { cor: '#3b0764', bg: 'rgba(59,7,100,0.07)'   },
  'Guarapuava PR':     { cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)'  },
  'Paranaguá PR':      { cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
  'Araucária PR':      { cor: '#312e81', bg: 'rgba(49,46,129,0.07)'  },
  'Pinhais PR':        { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)'   },
  'Almirante Tamandaré PR':{ cor: '#1e40af', bg: 'rgba(30,64,175,0.07)' },
  'Toledo PR':         { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Umuarama PR':       { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Criciúma SC':       { cor: '#374151', bg: 'rgba(55,65,81,0.07)'   },
  'Lages SC':          { cor: '#4b5563', bg: 'rgba(75,85,99,0.07)'   },
  'Jaraguá do Sul SC': { cor: '#1e40af', bg: 'rgba(30,64,175,0.07)'  },
  'Biguaçu SC':        { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.07)'  },
  'Tubarão SC':        { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  'Navegantes SC':     { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.07)'  },
  'Passo Fundo RS':    { cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)'  },
  'Bagé RS':           { cor: '#3b0764', bg: 'rgba(59,7,100,0.07)'   },
  'Santa Cruz do Sul RS':{ cor: '#065f46', bg: 'rgba(6,95,70,0.07)'  },
  'Cachoeirinha RS':   { cor: '#064e3b', bg: 'rgba(6,78,59,0.07)'    },
  'Alvorada RS':       { cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  'Erechim RS':        { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Luziânia GO':       { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Valparaíso de Goiás GO':{ cor: '#166534', bg: 'rgba(22,101,52,0.07)' },
  'Caldas Novas GO':   { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Itumbiara GO':      { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  // Camada 9 — Estatais estaduais
  'CEMIG':             { cor: '#065f46', bg: 'rgba(6,95,70,0.09)'    },
  'COPEL':             { cor: '#3b0764', bg: 'rgba(59,7,100,0.09)'   },
  'CELESC':            { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.09)'   },
  'CEAL':              { cor: '#b45309', bg: 'rgba(180,83,9,0.09)'   },
  'Energisa SE':       { cor: '#d97706', bg: 'rgba(217,119,6,0.09)'  },
  'CELPA':             { cor: '#064e3b', bg: 'rgba(6,78,59,0.09)'    },
  'CEMAR':             { cor: '#14532d', bg: 'rgba(20,83,45,0.09)'   },
  'CEDAE':             { cor: '#166534', bg: 'rgba(22,101,52,0.09)'  },
  'COPASA':            { cor: '#065f46', bg: 'rgba(6,95,70,0.09)'    },
  'SANEPAR':           { cor: '#4c1d95', bg: 'rgba(76,29,149,0.09)'  },
  'CASAN':             { cor: '#1e40af', bg: 'rgba(30,64,175,0.09)'  },
  'EMBASA':            { cor: '#92400e', bg: 'rgba(146,64,14,0.09)'  },
  'CAGEPA':            { cor: '#7c2d12', bg: 'rgba(124,45,18,0.09)'  },
  'CAERN':             { cor: '#0f766e', bg: 'rgba(15,118,110,0.09)' },
  'CAGECE':            { cor: '#7c2d12', bg: 'rgba(124,45,18,0.1)'   },
  'COMPESA':           { cor: '#4c1d95', bg: 'rgba(76,29,149,0.09)'  },
  'COSANPA':           { cor: '#064e3b', bg: 'rgba(6,78,59,0.09)'    },
  'CAEMA':             { cor: '#3b0764', bg: 'rgba(59,7,100,0.09)'   },
  'AGESPISA':          { cor: '#312e81', bg: 'rgba(49,46,129,0.09)'  },
  'DESO':              { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.09)'   },
  'SANESUL':           { cor: '#166534', bg: 'rgba(22,101,52,0.09)'  },
  'CASAL':             { cor: '#065f46', bg: 'rgba(6,95,70,0.09)'    },
  'BDMG':              { cor: '#065f46', bg: 'rgba(6,95,70,0.1)'     },
  'BRDE':              { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.1)'    },
  'BANRISUL':          { cor: '#1e40af', bg: 'rgba(30,64,175,0.1)'   },
  'BRB':               { cor: '#374151', bg: 'rgba(55,65,81,0.1)'    },
  // Camada 9 — Portos
  'Porto de Santos':   { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.1)'   },
  'Porto de Paranaguá':{ cor: '#064e3b', bg: 'rgba(6,78,59,0.1)'     },
  'Porto de Rio Grande':{ cor: '#1e3a5f', bg: 'rgba(30,58,95,0.1)'   },
  'Porto de Vitória':  { cor: '#065f46', bg: 'rgba(6,95,70,0.1)'     },
  'Porto do Recife':   { cor: '#4c1d95', bg: 'rgba(76,29,149,0.1)'   },
  'Porto de Salvador': { cor: '#92400e', bg: 'rgba(146,64,14,0.1)'   },
  'Porto do Itaqui':   { cor: '#3b0764', bg: 'rgba(59,7,100,0.1)'    },
  'Porto de Manaus':   { cor: '#14532d', bg: 'rgba(20,83,45,0.1)'    },
  'Porto de Belém':    { cor: '#064e3b', bg: 'rgba(6,78,59,0.1)'     },
  'Porto de Fortaleza':{ cor: '#7c2d12', bg: 'rgba(124,45,18,0.1)'   },
  'VALEC':             { cor: '#374151', bg: 'rgba(55,65,81,0.1)'    },
  'CPRM':              { cor: '#78350f', bg: 'rgba(120,53,15,0.1)'   },
  'EBC':               { cor: '#4b5563', bg: 'rgba(75,85,99,0.1)'    },
  'HEMOBRÁS':          { cor: '#6B0F1A', bg: 'rgba(107,15,26,0.1)'   },
  'PPSA':              { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.09)'  },
  'EBSERH':            { cor: '#7c1d1d', bg: 'rgba(124,29,29,0.1)'   },
  // Camada 10 — Empresas privadas/capital aberto
  'Vale':              { cor: '#065f46', bg: 'rgba(6,95,70,0.11)'    },
  'Embraer':           { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.11)'  },
  'Gerdau':            { cor: '#374151', bg: 'rgba(55,65,81,0.11)'   },
  'Suzano':            { cor: '#14532d', bg: 'rgba(20,83,45,0.11)'   },
  'Raízen':            { cor: '#d97706', bg: 'rgba(217,119,6,0.11)'  },
}


function formatarValor(valor?: number) {
  if (!valor) return null
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function formatarValorCurto(valor: number): string {
  if (valor >= 1_000_000_000) return `R$ ${(valor / 1_000_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}B`
  if (valor >= 1_000_000)     return `R$ ${(valor / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (valor >= 1_000)         return `R$ ${(valor / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
  return formatarValor(valor) ?? '—'
}

function Paginacao({ pagina, paginas, onChange }: { pagina: number; paginas: number; onChange: (p: number) => void }) {
  if (paginas <= 1) return null

  const pagNums: (number | '...')[] = []
  if (paginas <= 7) {
    for (let i = 1; i <= paginas; i++) pagNums.push(i)
  } else {
    pagNums.push(1)
    if (pagina > 3) pagNums.push('...')
    for (let i = Math.max(2, pagina - 1); i <= Math.min(paginas - 1, pagina + 1); i++) pagNums.push(i)
    if (pagina < paginas - 2) pagNums.push('...')
    pagNums.push(paginas)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onChange(pagina - 1)}
        disabled={pagina === 1}
        className="px-3 py-2 rounded-xl text-sm font-medium"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: pagina === 1 ? 'var(--text-3)' : 'var(--text-2)', cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}
      >
        ← Anterior
      </button>

      {pagNums.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-2 text-sm" style={{ color: 'var(--text-3)' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className="w-9 h-9 rounded-xl text-sm font-medium"
            style={{
              background: p === pagina ? 'var(--vinho)' : 'var(--surface)',
              color:      p === pagina ? 'white' : 'var(--text-2)',
              border:     `1px solid ${p === pagina ? 'var(--vinho)' : 'var(--border)'}`,
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(pagina + 1)}
        disabled={pagina === paginas}
        className="px-3 py-2 rounded-xl text-sm font-medium"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: pagina === paginas ? 'var(--text-3)' : 'var(--text-2)', cursor: pagina === paginas ? 'not-allowed' : 'pointer' }}
      >
        Próxima →
      </button>
    </div>
  )
}

type EstadoStat = { uf: string; count: number; valor_total: number }

const nomeEstado: Record<string, string> = {
  AC:'Acre', AL:'Alagoas', AP:'Amapá', AM:'Amazonas', BA:'Bahia', CE:'Ceará',
  DF:'Distrito Federal', ES:'Espírito Santo', GO:'Goiás', MA:'Maranhão',
  MT:'Mato Grosso', MS:'Mato Grosso do Sul', MG:'Minas Gerais', PA:'Pará',
  PB:'Paraíba', PR:'Paraná', PE:'Pernambuco', PI:'Piauí', RJ:'Rio de Janeiro',
  RN:'Rio Grande do Norte', RS:'Rio Grande do Sul', RO:'Rondônia', RR:'Roraima',
  SC:'Santa Catarina', SP:'São Paulo', SE:'Sergipe', TO:'Tocantins',
}

export default function DashboardPage() {
  const [roi, setRoi] = useState<{ totalAlertas: number; totalLicitacoes: number; volumeMonitorado: number } | null>(null)

  const [resposta, setResposta]       = useState<Resposta | null>(null)
  const [carregando, setCarregando]   = useState(true)
  const [primeiraVez, setPrimeiraVez] = useState(true)
  const [pagina, setPagina]               = useState(1)
  const [filtroRegioes,  setFiltroRegioes] = useState<string[]>([])
  const [filtroValorMin, setFiltroValorMin] = useState('')
  const [filtroValorMax, setFiltroValorMax] = useState('')
  const [ordenar,        setOrdenar]        = useState('valor')
  const [statsEstados, setStatsEstados]     = useState<EstadoStat[]>([])
  const [pcaItems, setPcaItems]             = useState<Licitacao[]>([])

  useEffect(() => {
    fetch('/api/stats/roi')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRoi(d) })
  }, [])

  useEffect(() => {
    fetch('/api/stats/por-estado')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.estados) setStatsEstados(d.estados) })
  }, [])

  useEffect(() => {
    fetch('/api/licitacoes?fonte=PNCP+PCA&pagina=1')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.length) setPcaItems(d.data.slice(0, 4)) })
  }, [])

  const carregar = useCallback(async (p: number) => {
    setCarregando(true)
    const params = new URLSearchParams({ pagina: String(p), ordenar })
    if (filtroRegioes.length > 0 && !filtroRegioes.includes('brasil'))
      params.set('regioes', filtroRegioes.join(','))
    if (filtroValorMin) params.set('valor_min', filtroValorMin)
    if (filtroValorMax) params.set('valor_max', filtroValorMax)
    const res = await fetch(`/api/licitacoes?${params}`)
    if (res.ok) setResposta(await res.json())
    setCarregando(false)
    setPrimeiraVez(false)
  }, [filtroRegioes, filtroValorMin, filtroValorMax, ordenar])

  useEffect(() => {
    setPagina(1)
    carregar(1)
  }, [filtroRegioes, filtroValorMin, filtroValorMax, ordenar]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    carregar(pagina)
  }, [pagina, carregar])

  const licitacoes  = resposta?.data ?? []
  const totalValor  = resposta?.volumeTotal ?? 0
  const semFiltros  = filtroRegioes.length === 0 && !filtroValorMin && !filtroValorMax
  const semResultados = !carregando && !primeiraVez && resposta?.total === 0 && semFiltros

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Licitações com match nas suas palavras-chave
          </p>
        </div>

        {/* Filtros */}
        <div className="w-full sm:w-auto flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          {/* Região */}
          <div className="w-full sm:min-w-[200px]">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Região / Estado</label>
            <RegiaoSelector
              value={filtroRegioes}
              onChange={setFiltroRegioes}
              placeholder="Todos"
            />
            {filtroRegioes.length > 0 && !filtroRegioes.includes('brasil') && (
              <RegiaoChips regioes={filtroRegioes} onRemove={r => setFiltroRegioes(removerRegiao(r, filtroRegioes))} />
            )}
          </div>

          {/* Valor mín + máx lado a lado */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 sm:flex-none">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Valor mín.</label>
              <input
                type="number"
                value={filtroValorMin}
                onChange={e => setFiltroValorMin(e.target.value)}
                placeholder="0"
                className="text-sm rounded-xl px-3 py-2.5 outline-none w-full sm:w-28"
                style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)' }}
              />
            </div>
            <div className="flex-1 sm:flex-none">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Valor máx.</label>
              <input
                type="number"
                value={filtroValorMax}
                onChange={e => setFiltroValorMax(e.target.value)}
                placeholder="Sem limite"
                className="text-sm rounded-xl px-3 py-2.5 outline-none w-full sm:w-28"
                style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)' }}
              />
            </div>
            <div className="flex-1 sm:flex-none">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Ordenar por</label>
              <select
                value={ordenar}
                onChange={e => setOrdenar(e.target.value)}
                className="text-sm rounded-xl px-3 py-2.5 outline-none w-full sm:w-36"
                style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)' }}
              >
                <option value="valor">Maior valor</option>
                <option value="recente">Mais recentes</option>
                <option value="abertura">Abertura próxima</option>
                <option value="menor">Menor valor</option>
              </select>
            </div>
            {!semFiltros && (
              <button
                onClick={() => { setFiltroRegioes([]); setFiltroValorMin(''); setFiltroValorMax('') }}
                className="text-sm rounded-xl px-3 py-2.5 flex-shrink-0"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <BannerPausa />
      </Suspense>

      {/* Painel ROI — só aparece se já tem alertas */}
      {roi && roi.totalAlertas > 0 && (
        <div className="rounded-2xl mb-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1A1C 0%, #2d1018 100%)', border: '1px solid rgba(201,166,90,0.25)' }}>

          {/* Cabeçalho */}
          <div className="px-6 pt-5 pb-4 flex items-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#C9A65A' }}>Monitoramento ativo</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(201,166,90,0.12)', color: '#C9A65A', border: '1px solid rgba(201,166,90,0.2)' }}>
              acumulado desde o início
            </span>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 px-4 pb-5 gap-3">
            {[
              {
                label: 'Editais monitorados',
                valor: roi.totalLicitacoes.toLocaleString('pt-BR'),
                sub: 'licitações únicas',
                icon: '📋',
                destaque: false,
              },
              {
                label: 'Volume monitorado',
                valor: roi.volumeMonitorado >= 1_000_000_000
                  ? `R$ ${(roi.volumeMonitorado / 1_000_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}B`
                  : roi.volumeMonitorado >= 1_000_000
                    ? `R$ ${(roi.volumeMonitorado / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
                    : `R$ ${(roi.volumeMonitorado / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`,
                sub: 'em contratos potenciais',
                icon: '💰',
                destaque: true,
              },
              {
                label: 'Alertas gerados',
                valor: roi.totalAlertas.toLocaleString('pt-BR'),
                sub: 'notificações enviadas',
                icon: '🔔',
                destaque: false,
              },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-xl px-4 py-4 flex flex-col gap-1"
                style={{
                  background: stat.destaque ? 'rgba(201,166,90,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${stat.destaque ? 'rgba(201,166,90,0.25)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base leading-none">{stat.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: stat.destaque ? '#C9A65A' : 'rgba(255,255,255,0.65)' }}>
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-black leading-none tabular-nums" style={{ color: stat.destaque ? '#C9A65A' : '#f0e6d3' }}>
                  {stat.valor}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          <p className="px-6 pb-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            * Soma dos valores estimados dos editais — não representa receita garantida
          </p>
        </div>
      )}

      {/* Banner de onboarding — só aparece se não há licitações e não há filtros */}
      {semResultados && (
        <div className="rounded-2xl p-6 mb-8 flex items-start gap-5"
          style={{ background: 'linear-gradient(135deg, rgba(107,15,26,0.06), rgba(201,166,90,0.06))', border: '1.5px solid rgba(107,15,26,0.15)' }}>
          <div className="text-3xl flex-shrink-0">🚀</div>
          <div className="flex-1">
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
              Configure suas palavras-chave para começar
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
              O Monitor rastreia tudo que o setor público publica — governo federal, todos os estados, as principais capitais e estatais como Petrobras e Caixa. Para receber alertas personalizados, cadastre o que sua empresa vende.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/palavras-chave"
                className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{ background: 'var(--vinho)', color: 'white', textDecoration: 'none' }}
              >
                Cadastrar palavras-chave →
              </Link>
              <Link
                href="/busca"
                className="inline-block text-sm font-medium px-5 py-2.5 rounded-xl"
                style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)', textDecoration: 'none' }}
              >
                Buscar licitações agora
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats — só exibe se já carregou e tem dados */}
      {!semResultados && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            {
              label: 'Encontradas',
              valor: carregando ? '—' : (resposta?.total ?? 0).toString(),
              cor: 'var(--vinho)',
            },
            {
              label: 'Volume total',
              valor: carregando ? '—' : (totalValor > 0 ? formatarValorCurto(totalValor) : '—'),
              cor: 'var(--dourado)',
            },
            {
              label: 'Página',
              valor: carregando ? '—' : `${resposta?.pagina ?? 1}/${resposta?.paginas ?? 1}`,
              cor: 'var(--bordo)',
            },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-3 sm:p-5 overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>
                {stat.label}
              </p>
              <p className="text-lg sm:text-2xl font-semibold leading-tight" style={{ color: stat.cor }}>
                {stat.valor}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Radar PCA ── */}
      {pcaItems.length > 0 && (
        <div className="rounded-2xl mb-6 overflow-hidden" style={{ border: '1.5px solid rgba(201,166,90,0.35)', background: 'linear-gradient(135deg, rgba(201,166,90,0.05) 0%, rgba(107,15,26,0.04) 100%)' }}>
          {/* Header PCA */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(201,166,90,0.15)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: '16px' }}>🗓</span>
                <span className="text-sm font-bold" style={{ color: '#C9A65A', letterSpacing: '-0.01em' }}>
                  Radar PCA — O que o governo planeja comprar
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-3)', lineHeight: '1.5' }}>
                Contratações planejadas para este ano. Prepare sua proposta <strong style={{ color: 'var(--text-2)' }}>antes do edital existir</strong> — seus concorrentes ainda não sabem disso.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-4" style={{ background: 'rgba(201,166,90,0.15)', color: '#C9A65A', border: '1px solid rgba(201,166,90,0.3)' }}>
              Exclusivo
            </span>
          </div>

          {/* Cards PCA */}
          <div className="p-4 grid grid-cols-1 gap-3">
            {pcaItems.map(l => {
              const cfg = fonteConfig['PNCP PCA'] ?? { cor: '#b91c1c', bg: 'rgba(185,28,28,0.07)' }
              return (
                <div
                  key={l.id}
                  className="rounded-xl p-4 flex items-start gap-4"
                  style={{ background: 'var(--surface)', border: '1px solid rgba(201,166,90,0.2)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {/* Badge "Planejado" no lugar da data */}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(201,166,90,0.12)', color: '#C9A65A', border: '1px solid rgba(201,166,90,0.25)' }}>
                        📋 Planejado {new Date().getFullYear()}
                      </span>
                      {l.alertas?.map((a, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(107,15,26,0.07)', color: 'var(--vinho)' }}>
                          {a.keywords?.termo}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm font-semibold mb-0.5 truncate" style={{ color: 'var(--text-1)' }}>{l.orgao}</p>
                    <p className="text-sm" style={{ color: 'var(--text-2)', lineHeight: '1.5' }}>
                      {l.objeto.length > 140 ? l.objeto.substring(0, 140) + '…' : l.objeto}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                    {l.valor_estimado && (
                      <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{formatarValor(l.valor_estimado)}</p>
                    )}
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(201,166,90,0.15)', color: '#C9A65A', textDecoration: 'none', border: '1px solid rgba(201,166,90,0.3)' }}
                    >
                      Ver plano →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rodapé explicativo */}
          <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(201,166,90,0.12)', background: 'rgba(201,166,90,0.03)' }}>
            <p className="text-xs" style={{ color: 'var(--text-3)', lineHeight: '1.6' }}>
              💡 O Plano de Contratações Anual (PCA) é obrigatório para todos os órgãos públicos. Ele revela o que o governo pretende comprar no ano — antes de qualquer edital ser publicado. Use isso para preparar sua empresa com meses de antecedência.
            </p>
          </div>
        </div>
      )}

      {/* Painel de inteligência por estado */}
      {statsEstados.length > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-3)' }}>
                Oportunidades por estado
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                Clique em um estado para filtrar
              </p>
            </div>
            {filtroRegioes.length > 0 && (
              <button
                onClick={() => setFiltroRegioes([])}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }}
              >
                ✕ Ver todos
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {statsEstados.map((e, i) => {
              const ativo = filtroRegioes.includes(e.uf)
              const barMax = statsEstados[0]?.count ?? 1
              const pct = Math.round((e.count / barMax) * 100)
              return (
                <button
                  key={e.uf}
                  onClick={() => setFiltroRegioes(ativo ? filtroRegioes.filter(r => r !== e.uf) : [...filtroRegioes, e.uf])}
                  className="text-left rounded-xl p-3 transition-all"
                  style={{
                    background:  ativo ? 'var(--vinho)' : 'rgba(107,15,26,0.04)',
                    border:      `1.5px solid ${ativo ? 'var(--vinho)' : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold" style={{ color: ativo ? 'white' : 'var(--text-1)' }}>
                      {e.uf}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: ativo ? 'rgba(255,255,255,0.85)' : 'var(--vinho)' }}>
                      {e.count}
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="rounded-full overflow-hidden" style={{ height: '3px', background: ativo ? 'rgba(255,255,255,0.2)' : 'var(--border)' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: ativo ? 'rgba(255,255,255,0.7)' : 'var(--vinho)', borderRadius: '9999px' }} />
                  </div>
                  {e.valor_total > 0 && (
                    <p className="text-xs mt-1.5 truncate" style={{ color: ativo ? 'rgba(255,255,255,0.65)' : 'var(--text-3)' }}>
                      {e.valor_total >= 1_000_000
                        ? `R$ ${(e.valor_total / 1_000_000).toFixed(1)}M`
                        : `R$ ${(e.valor_total / 1_000).toFixed(0)}k`}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)', height: '110px' }} />
          ))}
        </div>
      ) : licitacoes.length === 0 && !semResultados ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-1)' }}>Nenhuma licitação para esses filtros</p>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Tente remover os filtros ou ampliar os critérios.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {licitacoes.map(l => {
              const cfg = fonteConfig[l.fonte] ?? { cor: '#64748b', bg: 'rgba(100,116,139,0.08)' }
              return (
                <div
                  key={l.id}
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${cfg.cor}` }}
                >
                  {/* Tags + localização */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.cor }}>
                      {l.fonte}
                    </span>
                    {l.alertas?.map((a, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(107,15,26,0.07)', color: 'var(--vinho)' }}>
                        {a.keywords?.termo}
                      </span>
                    ))}
                    {l.cidade && (
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {l.cidade}{l.estado ? `/${l.estado}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Órgão */}
                  <p className="text-sm font-semibold mb-1 truncate" style={{ color: 'var(--text-1)' }}>{l.orgao}</p>

                  {/* Objeto — capitaliza a primeira letra para reduzir impacto do all-caps */}
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>
                    {(() => {
                      const txt = l.objeto.length > 160 ? l.objeto.substring(0, 160) + '…' : l.objeto
                      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
                    })()}
                  </p>

                  {/* Rodapé: valor + data + botão — alinhados na horizontal */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      {l.valor_estimado && (
                        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{formatarValor(l.valor_estimado)}</p>
                      )}
                      {l.data_abertura && (
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          Abertura: {new Date(l.data_abertura).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{ background: 'var(--vinho)', color: 'white', textDecoration: 'none' }}
                    >
                      Ver edital →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginação */}
          <Paginacao
            pagina={resposta?.pagina ?? 1}
            paginas={resposta?.paginas ?? 1}
            onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          />

          <p className="text-center text-xs mt-3" style={{ color: 'var(--text-3)' }}>
            Mostrando {(pagina - 1) * 20 + 1}–{Math.min(pagina * 20, resposta?.total ?? 0)} de {resposta?.total ?? 0} licitações
          </p>
        </>
      )}
    </div>
  )
}
