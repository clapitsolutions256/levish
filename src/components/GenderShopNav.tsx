import Link from "next/link";
import type { Gender } from "@/data/categories";
import { typePath } from "@/lib/styles";

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

// Men's range has no undergarments.
const menTypes = types.filter((type) => type.id !== "undergarments");

// Each type lives on its own page (e.g. /hoodies) with the gender as a filter.
function hrefFor(gender: Gender, type: GenderShopType) {
  if (type === "all") return `/${gender}`;
  if (type === "shoes") return `/shoes?gender=${gender}`;
  return `${typePath(type)}?gender=${gender}`;
}

export function GenderShopNav({ active, gender = "women" }: { active: GenderShopType; gender?: Gender }) {
  return (
    <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
      {(gender === "men" ? menTypes : types).map((type) => {
        const selected = type.id === active;
        return (
          <Link
            key={type.id}
            href={hrefFor(gender, type.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
              selected
                ? "clay-sage font-medium"
                : "text-[var(--muted)] hover:text-[var(--accent)]"
            }`}
          >
            {type.label}
          </Link>
        );
      })}
    </div>
  );
}

const genderOptions: { id: Gender | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
];

/** All / Women / Men toggle for a type page such as /sweatshirts. */
export function GenderFilter({ path, active }: { path: string; active: Gender | null }) {
  return (
    <div className="clay mt-6 inline-flex items-center rounded-full p-1" role="group" aria-label="Filter by gender">
      {genderOptions.map((option) => {
        const selected = option.id === active;
        return (
          <Link
            key={option.label}
            href={option.id ? `${path}?gender=${option.id}` : path}
            scroll={false}
            aria-current={selected ? "page" : undefined}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
              selected ? "clay-ink [&:hover]:!text-white" : "text-[var(--foreground)]/75 [&:hover]:!text-[var(--foreground)]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
