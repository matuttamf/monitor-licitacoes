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

export const metadata: Metadata = {
  title: "Monitor de Licitações",
  description: "Monitoramento de licitações públicas brasileiras",
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
