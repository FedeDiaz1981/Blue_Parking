import fs from "node:fs";
import path from "node:path";

export type SimpleImage = { img: string; alt: string };

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/** Normaliza base: "images" | "/images" | "public/images" → "images" */
function normalizeBase(input = "images"): string {
  let b = input.trim().replace(/^\/+/, "");
  b = b.replace(/^public\//, "");
  if (!b.startsWith("images")) b = `images${b ? "/" + b : ""}`;
  return b;
}

/** Une rutas para URL públicas siempre con '/' (evita backslashes en Windows) */
function posixJoin(...segs: string[]) {
  return segs.join("/").replace(/\\/g, "/").replace(/\/+/g, "/");
}

/** Ordena por alt y después por nombre de archivo (numeric-aware) */
function sortByAltAndName(a: SimpleImage, b: SimpleImage) {
  const altCmp = a.alt.localeCompare(b.alt, "es", { numeric: true, sensitivity: "base" });
  if (altCmp !== 0) return altCmp;
  const an = a.img.split("/").pop() || "";
  const bn = b.img.split("/").pop() || "";
  return an.localeCompare(bn, "es", { numeric: true, sensitivity: "base" });
}

/**
 * Lee todas las imágenes dentro de /public/<base> y sus subcarpetas.
 * Devuelve { img: "/images/.../file.jpg", alt: "<carpeta contenedora|''>" }.
 *
 * @param base Relativo a /public. Ej: "images" (default) o "images/galeria"
 */
export function readPublicImages(base = "images"): SimpleImage[] {
  const baseRel = normalizeBase(base);                           // p.ej. "images"
  const PUBLIC_DIR = path.resolve(process.cwd(), "public");
  const absBase = path.join(PUBLIC_DIR, baseRel);

  const out: SimpleImage[] = [];

  function walk(dirAbs: string, dirRelFromBase: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      return; // carpeta inexistente → vacío
    }

    for (const e of entries) {
      const abs = path.join(dirAbs, e.name);
      const relFromBase = posixJoin(dirRelFromBase, e.name); // relativo a <base>
      if (e.isDirectory()) {
        walk(abs, relFromBase); // recursión
        continue;
      }
      const ext = path.extname(e.name).toLowerCase();
      if (!ALLOWED.has(ext)) continue;

      // alt = carpeta contenedora inmediata (si no hay, "")
      const parent = dirRelFromBase.split("/").filter(Boolean).pop() ?? "";

      // URL pública (siempre POSIX): "/images/.../file.jpg"
      const img = "/" + posixJoin(baseRel, relFromBase);

      out.push({ img, alt: parent });
    }
  }

  walk(absBase, ""); // arranca en base

  out.sort(sortByAltAndName);
  return out;
}

/* Cache simple en memoria (evita tocar FS en cada import) */
let _cache: Record<string, SimpleImage[]> = {};
export function readPublicImagesCached(base = "images"): SimpleImage[] {
  const key = normalizeBase(base);
  if (!_cache[key]) _cache[key] = readPublicImages(key);
  return _cache[key];
}
