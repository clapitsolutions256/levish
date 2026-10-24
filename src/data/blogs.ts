export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
  paragraphs: string[];
};

export const blogs: BlogPost[] = [
  {
    slug: "hoodies-that-still-look-dressed",
    title: "Hoodies that still look dressed",
    excerpt: "A soft hoodie can leave the house. Pair it with a clean trouser and it stops feeling like loungewear.",
    date: "2026-09-18",
    image: "/kairo/catalog/hoodie-burgundy.png",
    category: "Hoodies",
    paragraphs: [
      "The burgundy pullover is the one we keep reaching for when the evening cools down and a jacket feels like too much. The shape is relaxed, but the color does the dressing-up for you.",
      "Wear it with a straight trouser rather than a jogger. The contrast is what makes it look considered: soft on top, clean through the leg. A simple court shoe or a dark derby keeps the whole outfit in the same quiet lane.",
      "If you want a lighter version of the same idea, the cream and navy hoodies work the same way. Keep the rest of the outfit in one or two colors so the hoodie stays the softest thing in the picture.",
    ],
  },
  {
    slug: "trousers-for-an-easy-week",
    title: "Trousers for an easy week",
    excerpt: "Pleats, a straight leg, and a color you can repeat. That is the whole formula.",
    date: "2026-09-12",
    image: "/kairo/catalog/trouser-cream.png",
    category: "Trouser",
    paragraphs: [
      "A good trouser should disappear into the week. Cream, khaki, charcoal, and navy cover almost every plan, from a slow morning to dinner.",
      "Pleats give the waist room without looking oversized. A straight or wide leg sits better with a sweatshirt or a short jacket than a skinny cut does. If the shoe is simple, the trouser can be the piece people notice.",
      "Start with one neutral you will actually wear twice. The cream pair is the easiest with a black or burgundy top. Charcoal is the one that goes with almost every shoe in the shop.",
    ],
  },
  {
    slug: "denim-without-the-stiff-break-in",
    title: "Denim without the stiff break-in",
    excerpt: "Indigo, black, and a pale wash. Three jeans, and most of a season is covered.",
    date: "2026-09-06",
    image: "/kairo/catalog/jeans-indigo.png",
    category: "Jeans",
    paragraphs: [
      "Stiff raw denim has its fans. For everyday wear we would rather start with a jean that already bends at the knee. Indigo straight is the default: it works with a sweatshirt, a hoodie, or a tucked shirt.",
      "Black slim is the evening version of the same idea. Pale and light washes are for the warmer weeks, especially with a sandal or a white court shoe. You do not need a drawer full of cuts if these three fit.",
      "Hem them so they sit on the shoe, not bunch over it. A small break looks finished. A long stack only works if the jean was cut wide on purpose.",
    ],
  },
  {
    slug: "the-shoe-that-finishes-the-outfit",
    title: "The shoe that finishes the outfit",
    excerpt: "Loafers, derbies, and a clean court shoe. Pick one and wear it until it looks like yours.",
    date: "2026-08-28",
    image: "/kairo/catalog/shoe-white-court.png",
    category: "Shoes",
    paragraphs: [
      "A white court shoe is the easiest finish for jeans and a sweatshirt. It keeps a dark outfit from feeling heavy, and it does not ask for a matching bag or belt.",
      "When the plan is smarter, switch to a leather loafer or a derby. Brown and burgundy sit well with khaki and cream trousers. Black is the one to keep with charcoal and a jacket.",
      "One pair worn often looks better than four pairs worn once. Clean the edge, replace the laces when they grey, and let the leather crease. That is the point of a shoe you actually live in.",
    ],
  },
];

export function getBlog(slug: string) {
  return blogs.find((post) => post.slug === slug);
}

export function formatBlogDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
