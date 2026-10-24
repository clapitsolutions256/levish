// Product types are typed by hand in admin, so "Jacket" and "Jackets" must count as the same type.
function typeKey(value: string | undefined | null) {
  const key = (value ?? "").trim().toLowerCase();
  if (/(ss|sh|ch|x)es$/.test(key)) return key.slice(0, -2);
  if (key.length > 3 && key.endsWith("s") && !key.endsWith("ss")) return key.slice(0, -1);
  return key;
}

export function sameType(a: string | undefined | null, b: string | undefined | null) {
  const left = typeKey(a);
  return Boolean(left) && left === typeKey(b);
}
