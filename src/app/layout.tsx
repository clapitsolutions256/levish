import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Instrument_Serif, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider, type CartItem } from "@/context/CartContext";
import { MetaPixelPageView } from "@/components/MetaPixel";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { readCartCookie } from "@/lib/cartToken";
import { ReduxProvider } from "@/store/ReduxProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SHARE_IMAGE } from "@/lib/site";

// Editorial serif for the large display words on the home page.
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const defaultTitle = "Empulse | Premium   By Origin";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "shopping",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.png?v=5", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png?v=5", sizes: "180x180" }],
    shortcut: "/favicon.ico?v=5",
  },
  openGraph: {
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
    locale: "en_PK",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialItems = readCartCookie(cookieStore.get("empulse_cart_items")?.value) as CartItem[];

  return (
    <html lang="en-PK" className={`${poppins.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <Script id="meta-pixel" strategy="beforeInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '2346883336121456');
          if (location.pathname.indexOf('/admin') !== 0) fbq('track', 'PageView');
        `}</Script>
      </head>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2346883336121456&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <MetaPixelPageView />
        <Script id="strip-bis" strategy="beforeInteractive">{`
          (function(){
            function strip(el){el.removeAttribute('bis_skin_checked');}
            document.querySelectorAll('[bis_skin_checked]').forEach(strip);
            new MutationObserver(function(mutations){
              mutations.forEach(function(m){
                if(m.type==='attributes'&&m.attributeName==='bis_skin_checked'){
                  strip(m.target);
                }
                if(m.type==='childList'){
                  m.addedNodes.forEach(function(n){
                    if(n.nodeType===1){
                      strip(n);
                      n.querySelectorAll('[bis_skin_checked]').forEach(strip);
                    }
                  });
                }
              });
            }).observe(document.documentElement,{attributes:true,attributeFilter:['bis_skin_checked'],childList:true,subtree:true});
          })();
        `}</Script>
        <ReduxProvider>
          <CartProvider initialItems={initialItems}>
            {children}
            <WhatsAppButton />
          </CartProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
