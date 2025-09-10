export type Locale = "en" | "lg";

const dictionaries: Record<Locale, any> = {
  en: () => import("@/messages/en.json").then(m => m.default),
  lg: () => import("@/messages/lg.json").then(m => m.default),
};

export async function getDictionary(locale: Locale) {
  const loader = dictionaries[locale] ?? dictionaries.en;
  return loader();
}
