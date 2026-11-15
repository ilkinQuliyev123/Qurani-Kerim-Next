// translate/out/*.json -> data/commentary-i18n.json (id -> {az,ru,en}); giriş faylları ilə uyğunluğu yoxlayır.
import fs from "node:fs";
import path from "node:path";

type In = { id: string; tr: string };
type Out = { id: string; az: string; ru: string; en: string };
const dir = (d: string) => path.join(process.cwd(), "translate", d);
const target = path.join(process.cwd(), "data", "commentary-i18n.json");
const merged: Record<string, Omit<Out, "id">> = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, "utf8")) : {};
let ok = 0, bad = 0, missing = 0;

for (const f of fs.readdirSync(dir("in")).filter((x) => x.endsWith(".json")).sort()) {
  const outPath = path.join(dir("out"), f);
  if (!fs.existsSync(outPath)) { missing++; continue; }
  try {
    const inp: In[] = JSON.parse(fs.readFileSync(path.join(dir("in"), f), "utf8"));
    const out: Out[] = JSON.parse(fs.readFileSync(outPath, "utf8"));
    if (inp.length !== out.length) throw new Error(`say fərqli: ${inp.length} ≠ ${out.length}`);
    inp.forEach((it, i) => {
      const o = out[i];
      if (o.id !== it.id) throw new Error(`id uyğun deyil (${i})`);
      for (const k of ["az", "ru", "en"] as const) {
        if (!o[k]?.trim() || o[k].length < it.tr.length * 0.4) throw new Error(`${k} boş/qısa (${o.id})`);
      }
    });
    for (const o of out) merged[o.id] = { az: o.az, ru: o.ru, en: o.en };
    ok++;
  } catch (e) { bad++; console.error(`XƏTA ${f}: ${(e as Error).message}`); }
}
fs.writeFileSync(target, JSON.stringify(merged));
console.log(`fayl: ${ok} OK, ${bad} xətalı, ${missing} hələ tərcümə olunmayıb; cəmi ${Object.keys(merged).length} mətn`);
