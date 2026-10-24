import Image from "next/image";

const partners = [
  { name: "Nike", src: "/kairo/brand/nikelogo.webp", width: 333, height: 188 },
  { name: "Adidas", src: "/kairo/brand/adidaslogo.webp", width: 297, height: 196 },
  { name: "Loro Piana", src: "/kairo/brand/loralogo.webp", width: 336, height: 93 },
  { name: "Vans", src: "/kairo/brand/vanslogo.webp", width: 334, height: 132 },
  { name: "On", src: "/kairo/brand/onlcoudelogo.webp", width: 110, height: 191 },
  { name: "Lacoste", src: "/kairo/brand/lacostelogo.webp", width: 337, height: 173 },
  { name: "GANT", src: "/kairo/brand/gantlogo.webp", width: 274, height: 193 },
  { name: "Calvin Klein", src: "/kairo/brand/calvinkleinlogo.webp", width: 333, height: 75 },
  { name: "Ralph Lauren", src: "/kairo/brand/ralphlogo.webp", width: 336, height: 134 },
];

export function BrandPartners() {
  return (
    <section className="bg-[#f3f3f3] py-8 md:py-10" aria-label="Our partners">
      <div className="overflow-hidden">
        <div className="partners-scroll flex w-max items-center">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex items-center">
              {partners.map((partner) => (
                <li key={`${copy}-${partner.name}`} className="flex h-24 w-44 shrink-0 items-center justify-center px-5">
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    width={partner.width}
                    height={partner.height}
                    className="partner-logo h-11 w-auto max-w-[9.5rem] object-contain"
                    unoptimized
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
