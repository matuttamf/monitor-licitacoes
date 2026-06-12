import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Monitor de Licitações — Alertas de Editais em Tempo Real',
    template: '%s | Monitor de Licitações',
  },
  description:
    'Receba alertas automáticos de licitações públicas que combinam com o seu negócio. Monitoramos PNCP, ComprasNet, BLL e portais estaduais. Teste grátis por 7 dias.',
  keywords: [
    'licitações públicas', 'monitor de licitações', 'alertas de editais',
    'PNCP', 'ComprasNet', 'pregão eletrônico', 'licitação federal',
    'licitação estadual', 'licitação municipal', 'edital público',
    'fornecedor governo', 'contratação pública',
  ],
  authors: [{ name: 'Monitor de Licitações', url: APP_URL }],
  creator: 'Monitor de Licitações',
  publisher: 'Monitor de Licitações',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: APP_URL,
    siteName: 'Monitor de Licitações',
    title: 'Monitor de Licitações — Alertas de Editais em Tempo Real',
    description:
      'Receba alertas automáticos de licitações públicas que combinam com o seu negócio. Monitoramos PNCP, ComprasNet, BLL e portais estaduais.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Monitor de Licitações' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monitor de Licitações — Alertas de Editais em Tempo Real',
    description:
      'Receba alertas automáticos de licitações públicas que combinam com o seu negócio.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${instrument.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
