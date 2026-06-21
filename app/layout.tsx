import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import AnalyticsProvider from "@/components/AnalyticsProvider";
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
    default: 'Monitor de Licitações — Alertas Automáticos de Editais Públicos',
    template: '%s | Monitor de Licitações',
  },
  description:
    'Monitore licitações públicas do PNCP, ComprasNet, BLL, estados e municípios. Alertas por e-mail, Telegram e WhatsApp assim que o edital é publicado. 7 dias grátis, sem cartão.',
  keywords: [
    'monitor de licitações', 'alerta de licitações', 'licitações públicas',
    'edital de licitação', 'pregão eletrônico', 'PNCP', 'ComprasNet', 'BLL',
    'licitação federal', 'licitação estadual', 'licitação municipal',
    'contratação pública', 'fornecedor governo', 'compras governamentais',
    'Portal Nacional de Contratações Públicas', 'monitoramento de licitações',
    'notificação licitação', 'licitações para MEI', 'licitações para pequenas empresas',
    'buscar editais', 'dispensa de licitação', 'aviso de licitação',
  ],
  authors: [{ name: 'Monitor de Licitações', url: APP_URL }],
  creator: 'Monitor de Licitações',
  publisher: 'Monitor de Licitações',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: APP_URL,
    siteName: 'Monitor de Licitações',
    title: 'Monitor de Licitações — Alertas Automáticos de Editais Públicos',
    description:
      'Monitore licitações do PNCP, ComprasNet, BLL, estados e municípios. Alertas por e-mail, Telegram e WhatsApp assim que o edital é publicado. 7 dias grátis.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Monitor de Licitações — Alertas automáticos de editais públicos',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@monitorlicit',
    title: 'Monitor de Licitações — Alertas Automáticos de Editais Públicos',
    description:
      'Monitore licitações do PNCP, ComprasNet e portais estaduais. Alertas por e-mail, Telegram e WhatsApp. 7 dias grátis, sem cartão.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${instrument.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}

        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        )}

        {/* Meta Pixel — carregado apenas após consentimento de cookies */}
        {pixelId && <AnalyticsProvider pixelId={pixelId} />}
      </body>
    </html>
  );
}
