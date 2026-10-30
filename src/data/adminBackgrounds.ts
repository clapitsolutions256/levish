// Scenery behind the admin's glass panels. Photos are served from Unsplash's CDN (Unsplash licence).
export type AdminBackground = { id: string; name: string; photo: string; tone: "light" | "dark" };

const unsplash = (id: string, width: number) => `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;

const scenes: { id: string; name: string; photo: string; tone: "light" | "dark" }[] = [
  { id: "alps", name: "Alpine sunrise", photo: "1506905925346-21bda4d32df4", tone: "light" },
  { id: "highlands", name: "Misty highlands", photo: "1470071459604-3b5ec3a7fe05", tone: "light" },
  { id: "forest", name: "Forest light", photo: "1441974231531-c6227db76b6e", tone: "dark" },
  { id: "shore", name: "Tropical shore", photo: "1507525428034-b723cf961d3e", tone: "light" },
  { id: "milky-way", name: "Milky Way", photo: "1519681393784-d120267933ba", tone: "dark" },
  { id: "earth-night", name: "Earth at night", photo: "1451187580459-43490279c0fa", tone: "dark" },
  { id: "orbit", name: "Orbit view", photo: "1446776811953-b23d57bd21aa", tone: "light" },
  { id: "circuit", name: "Neon circuit", photo: "1550751827-4bd374c3f58b", tone: "dark" },
];

export const adminBackgrounds: (AdminBackground & { thumb: string })[] = scenes.map((scene) => ({
  ...scene,
  photo: unsplash(scene.photo, 2400),
  thumb: unsplash(scene.photo, 240),
}));

export const DEFAULT_ADMIN_BACKGROUND = "alps";
