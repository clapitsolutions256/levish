import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { MetaPixelPageView } from "@/components/MetaPixel";
import { META_PIXEL_ID } from "@/lib/metaPixel";
import { TikTokPageView } from "@/components/TikTokPixel";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ReduxProvider } from "@/store/ReduxProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SHARE_IMAGE, SITE_TITLE } from "@/lib/site";

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

const defaultTitle = SITE_TITLE;

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

// Browser chrome (Safari's top bar, Android's status bar) matches the sage strip at the top of the page.
export const viewport: Viewport = {
  themeColor: "#a6cdab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PK" className={`${poppins.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        {META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="beforeInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          if (location.pathname.indexOf('/admin') !== 0) fbq('track', 'PageView');
        `}</Script>
        ) : null}
        {/* TikTok Pixel Code Start: TikTok's base code exactly as given, as a plain script tag so TikTok's checker finds it in the HTML. */}
        <script
          id="tiktok-pixel"
          dangerouslySetInnerHTML={{
            __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};


  ttq.load('DBU8173C77UCDH70Q9T0');
  ttq.page();
}(window, document, 'ttq');
`,
          }}
        />
        {/* TikTok Pixel Code End */}
      </head>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        {META_PIXEL_ID ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        ) : null}
        <MetaPixelPageView />
        <TikTokPageView />
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
          <CartProvider>
            {children}
            <WhatsAppButton />
          </CartProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
