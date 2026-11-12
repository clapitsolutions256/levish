import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingNav } from "@/components/FloatingNav";
import { getActiveProducts } from "@/lib/catalog";
import { menuThumbnails, suggestionPool } from "@/lib/showcase";

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
      <CartDrawer suggestions={suggestionPool(products)} />
    </div>
  );
}
