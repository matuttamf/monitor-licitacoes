'use client'

import Script from 'next/script'
import { useState, useEffect } from 'react'
import CookieBanner, { type ConsentState } from './CookieBanner'

const COOKIE_KEY = 'ml_cookie_consent'

export default function AnalyticsProvider({ pixelId }: { pixelId: string }) {
  const [consent, setConsent] = useState<ConsentState>(null)

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY) as ConsentState
    if (saved) setConsent(saved)
  }, [])

  return (
    <>
      {/* Pixel só carrega se houver consentimento explícito */}
      {consent === 'accepted' && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}</Script>
      )}

      <CookieBanner onConsent={setConsent} />
    </>
  )
}
