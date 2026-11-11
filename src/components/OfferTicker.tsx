const offers: { label: string; icon?: "truck" }[] = [
  { label: "100% original" },
  { label: "Nationwide delivery", icon: "truck" },
];

export function OfferTicker() {
  const loop = [...offers, ...offers, ...offers, ...offers];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-[var(--accent)] text-white">
      <div className="ticker-scroll flex w-max items-center py-2.5">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {loop.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span className="mx-3 h-1 w-1 shrink-0 rounded-full bg-white/35" aria-hidden="true" />
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

function TruckIcon() {
  return (
    <svg className="mr-2 h-4 w-4 text-[var(--sage)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 7h11v8H3V7Zm11 3h4l3 3v2h-7v-5ZM7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}
