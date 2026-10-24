import { BrandPartners } from "@/components/BrandPartners";
import { HeroMedia } from "@/components/HeroMedia";
import { listActiveBanners } from "@/lib/banners";

export async function HeroSlider() {
  const banners = await listActiveBanners();
  return (
    <>
    {banners.length ? (
      <section aria-label="Featured banners">
        <HeroMedia banners={banners} />
      </section>
    ) : (
      // The home header is overlaid, so keep content clear of it when there is no banner.
      <div aria-hidden className="h-[var(--header-h,6.5rem)]" />
    )}
    <BrandPartners />
    </>
  );
}
