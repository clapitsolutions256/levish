const offers: { label: string; icon?: "shoe" | "truck" }[] = [
  { label: "100% original" },
  { label: "First check then pay", icon: "shoe" },
  { label: "Nationwide delivery", icon: "truck" },
];

export function OfferTicker() {
  const loop = [...offers, ...offers, ...offers, ...offers];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-[#161616] text-white">
      <div className="ticker-scroll flex w-max items-center py-2.5">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {loop.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span className="mx-3 h-1 w-1 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
                {item.icon === "shoe" ? <ShoeIcon /> : null}
                {item.icon === "truck" ? <TruckIcon /> : null}
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] sm:text-xs">
                  {item.label}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShoeIcon() {
  return (
    <svg className="mr-2 h-4 w-4 text-[#c989a3]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 16.5c0-.4.2-.8.6-1l4.2-2.2c.5-.3 1.1-.2 1.5.2l1.2 1.3c.3.3.7.5 1.1.5h7.1c.7 0 1.3.6 1.3 1.3v.4c0 .8-.7 1.5-1.5 1.5H4.5A1.5 1.5 0 0 1 3 17v-.5Zm5.2-4.4 1.6-3.2c.3-.6.9-1 1.6-1h2.1c.4 0 .7.2.9.5l2.4 4.2" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="mr-2 h-4 w-4 text-[#c989a3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 7h11v8H3V7Zm11 3h4l3 3v2h-7v-5ZM7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}
