const reasons = [
  {
    title: "Original brands",
    text: "Every piece is 100% original, from the shoes to the layers you wear every day.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: "First check, then pay",
    text: "Open the parcel, look it over, and pay only when you are happy with it.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    title: "Free shipping",
    text: "Delivery across Pakistan, and free shipping on orders above Rs. 5,000.",
    icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
  },
  {
    title: "Easy returns",
    text: "If it is not right, send it back. Returns stay simple so you can shop with ease.",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
];

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 md:py-20" aria-label="Why choose us">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="eyebrow mb-2">The Empulse promise</p>
        <h2 className="section-heading">Why Choose Us</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => (
          <article key={reason.title} className="card-warm p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f3ec] text-[#4a142a]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={reason.icon} />
              </svg>
            </div>
            <h3 className="section-heading text-[#2c2825]">{reason.title}</h3>
            <p className="type-copy mt-2 text-[var(--muted)]">{reason.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
