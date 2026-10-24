import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingNav } from "@/components/FloatingNav";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="contents" suppressHydrationWarning>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingNav />
      <CartDrawer />
    </div>
  );
}
