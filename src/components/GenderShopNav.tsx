import Link from "next/link";

const types = [
  { id: "all", label: "All" },
  { id: "shoes", label: "Shoes" },
  { id: "trouser", label: "Trouser" },
  { id: "sweatshirt", label: "Sweatshirt" },
  { id: "jeans", label: "Jeans" },
  { id: "hoodie", label: "Hoodies" },
  { id: "jacket", label: "Jackets" },
  { id: "undergarments", label: "Undergarments" },
] as const;

export type GenderShopType = (typeof types)[number]["id"];

function hrefFor(type: GenderShopType) {
  if (type === "all") return "/women";
  if (type === "shoes") return "/shoes/women";
  return `/women?type=${type}`;
}

export function GenderShopNav({ active }: { active: GenderShopType }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {types.map((type) => {
        const selected = type.id === active;
        return (
          <Link
            key={type.id}
            href={hrefFor(type.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              selected
                ? "bg-[#f4e6ec] font-medium text-[#4a142a]"
                : "text-[var(--muted)] hover:text-[#4a142a]"
            }`}
          >
            {type.label}
          </Link>
        );
      })}
    </div>
  );
}
