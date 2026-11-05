import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "OxyEnergy Cardo Mariano 80% Silimarina | Desintoxicante Hepático y Digestivo",
  description: "Desinflama tu abdomen, limpia el hígado graso y reactiva tu energía con OxyEnergy Cardo Mariano 80% Silimarina. 90 cápsulas vegetales. Pago contra entrega en toda Venezuela por Tealca.",
  applicationName: "OxyEnergy Botanical Clinic",
  robots: { index: true, follow: true },
  openGraph: {
    title: "OxyEnergy Cardo Mariano 80% Silimarina | 90 Cápsulas",
    description: "Tratamiento botánico clínico para el hígado y digestión pesada. Paga solo al recibir en mano por Tealca en toda Venezuela.",
    locale: "es_VE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2045055106181681";

  return (
    <html lang="es-VE">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView',{},{eventID:'pv-'+Date.now()+'-'+Math.random().toString(36).slice(2,9)});`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </head>
      <body className="antialiased selection:bg-[#1b3320] selection:text-white">
        {children}
      </body>
    </html>
  );
}
