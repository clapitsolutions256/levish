import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingNav } from "@/components/FloatingNav";
import { getActiveProducts } from "@/lib/catalog";
import { menuThumbnails } from "@/lib/showcase";

// Store pages are served from a cache and rebuilt at most every five minutes; saving a product refreshes them at once.
export const revalidate = 300;

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Photos for the phone shop menu; the menu still works without them.
  const products = await getActiveProducts().catch(() => []);
  const thumbs = menuThumbnails(products);
  return (
    <div className="contents" suppressHydrationWarning>
      <Header thumbs={thumbs} />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingNav thumbs={thumbs} />
      <CartDrawer />
    </div>
  );
}
