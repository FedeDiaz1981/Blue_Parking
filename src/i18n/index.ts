import es from "./es";
import en from "./en";

const dictionaries = { es, en };

// Función simple: t("menu.service", "es")
export function t(path: string, lang: "es" | "en" = "es"): string {
  const parts = path.split(".");
  let obj: any = dictionaries[lang];
  for (const p of parts) {
    if (!obj[p]) return path; // fallback: muestra la key
    obj = obj[p];
  }
  return obj;
}
