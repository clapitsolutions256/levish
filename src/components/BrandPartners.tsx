import Image from "next/image";
import Link from "next/link";
import { getBrands } from "@/lib/catalog";

// `match` lists the brand names products may be saved under for each logo.
const partners = [
  { name: "Nike", match: ["Nike"], src: "/kairo/brand/nikelogo.webp", width: 333, height: 188 },
  { name: "Adidas", match: ["Adidas"], src: "/kairo/brand/adidaslogo.webp", width: 297, height: 196 },
  { name: "Loro Piana", match: ["Loro Piana"], src: "/kairo/brand/loralogo.webp", width: 336, height: 93 },
  { name: "Vans", match: ["Vans"], src: "/kairo/brand/vanslogo.webp", width: 334, height: 132 },
  { name: "On", match: ["On", "On Running"], src: "/kairo/brand/onlcoudelogo.webp", width: 110, height: 191 },
  { name: "Lacoste", match: ["Lacoste"], src: "/kairo/brand/lacostelogo.webp", width: 337, height: 173 },
  { name: "GANT", match: ["GANT"], src: "/kairo/brand/gantlogo.webp", width: 274, height: 193 },
  { name: "Calvin Klein", match: ["Calvin Klein"], src: "/kairo/brand/calvinkleinlogo.webp", width: 333, height: 75 },
  { name: "Ralph Lauren", match: ["Polo Ralph Lauren", "Ralph Lauren"], src: "/kairo/brand/ralphlogo.webp", width: 336, height: 134 },
];

/** Partner logos; a logo opens that brand's products once the store stocks any. This is the store's brand filter. */
export async function BrandPartners() {
  const brands = await getBrands().catch(() => []);
  const linkFor = (match: string[]) => {
    const wanted = match.map((name) => name.toLowerCase());
    const brand = brands.find((item) => item.count > 0 && wanted.includes(item.name.toLowerCase()));
    return brand ? `/brands/${brand.slug}` : null;
  };

  return (
    <section className="bg-[var(--cream)] py-8 md:py-10" aria-label="Shop by brand">
      <div className="overflow-hidden">
        <div className="partners-scroll flex w-max items-center">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex items-center" aria-hidden={copy === 1 ? true : undefined}>
              {partners.map((partner) => {
                const href = linkFor(partner.match);
                const logo = (
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    width={partner.width}
                    height={partner.height}
                    className="partner-logo h-11 w-auto max-w-[9.5rem] object-contain"
                    sizes="152px"
                  />
                );
                return (
                  <li key={`${copy}-${partner.name}`} className="flex h-24 w-44 shrink-0 items-center justify-center px-5">
                    {href ? (
                      <Link
                        href={href}
                        aria-label={`Shop ${partner.name}`}
                        tabIndex={copy === 1 ? -1 : undefined}
                        className="flex h-full w-full items-center justify-center rounded-2xl transition-colors hover:bg-white/60"
                      >
                        {logo}
                      </Link>
                    ) : (
                      logo
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
