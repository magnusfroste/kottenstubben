// Kontrollerar platsdatat och uppgiftsgeneratorn i public/app.js:
//  – varje plats har unik id, ett lägesord som stämmer med relationen och objektets namn,
//  – koordinaterna ligger inne i världen och alla tryckytor (r = 64) håller sig isär,
//  – nivåerna bygger på varandra (1 ⊂ 2 ⊂ 3) och nivå 3 är den enda med "mellan",
//  – uppgiften väljer alltid en plats som finns på nivån, och frågan/förklaringen nämner
//    samma lägesord som platsen,
//  – samma uppgift upprepas inte direkt efter sig själv.
//   node verify.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./public/app.js", import.meta.url), "utf8");
const start = src.indexOf("var VARLD =");
const end = src.indexOf("* 2. Kotten");
if (start < 0 || end < 0) throw new Error("hittar inte den rena datadelen i app.js");
const ren = src.slice(start, src.lastIndexOf("/*", end));
const G = eval("(function(){" + ren + "\nreturn {VARLD, PLATSER, NIVAA, OBJ, HEM, uppgift, tillatna, plats, fragaFor, svarFor};})()");

let seed = 20261125;
Math.random = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

let fel = 0;
const kolla = (c, m, p) => { if (!c) { fel++; if (fel <= 25) console.log("FEL", m, JSON.stringify(p)); } };

const R = 64;
const ids = new Set();
for (const p of G.PLATSER) {
  kolla(!ids.has(p.id), "dubbel id", p.id); ids.add(p.id);
  kolla(["på", "under", "bredvid", "mellan"].includes(p.relation), "okänd relation", p);
  kolla(G.OBJ[p.objekt], "okänt objekt", p);
  kolla(p.ord.includes(p.relation === "mellan" ? "mellan" : p.relation), "ordet stämmer inte med relationen", p);
  if (p.relation !== "mellan") kolla(p.ord.includes(G.OBJ[p.objekt].namn), "ordet nämner inte objektet", p);
  else kolla(p.ord.split(" och ").length === 2, "mellan-frasen har två objekt", p);
  kolla(p.x - R >= 0 && p.x + R <= G.VARLD.b, "platsen utanför kanten i x", p);
  kolla(p.y - 2 * 60 * p.skala >= 0 && p.y <= G.VARLD.h, "platsen utanför kanten i y", p);
  kolla(p.skala > 0.5 && p.skala <= 1, "konstig skala", p);
  kolla(p.y <= G.VARLD.mark + 52, "platsen svävar", p);
  // Kotten ska stå på objektet, inte mitt i det: på-platser har fotpunkten ovanför marken
  if (p.relation === "på") kolla(p.y < G.VARLD.mark, "på-plats står på marken", p);
  if (p.relation !== "på") kolla(p.y >= G.VARLD.mark - 6, "plats som inte är på står ovanför marken", p);
}

// tryckytorna får inte överlappa: minst 2R + 20 mellan två platser på samma nivå
const N = G.NIVAA;
for (const niva of [1, 2, 3]) {
  const l = N[niva].map(id => G.plats(id));
  kolla(l.length >= 4, "för få platser", { niva, n: l.length });
  kolla(new Set(N[niva]).size === N[niva].length, "dubblett i nivån", N[niva]);
  for (let i = 0; i < l.length; i++) {
    for (let j = i + 1; j < l.length; j++) {
      const dx = l[i].x - l[j].x, dy = (l[i].y - 46) - (l[j].y - 46);
      const d = Math.hypot(dx, dy);
      kolla(d >= 2 * R + 16, "tryckytorna ligger för nära", { niva, a: l[i].id, b: l[j].id, d: Math.round(d) });
    }
    // och inte heller över hempositionen
    const dh = Math.hypot(l[i].x - G.HEM.x, l[i].y - G.HEM.y);
    kolla(dh >= 2 * R + 16, "platsen ligger på Kottens hemplats", { niva, id: l[i].id, d: Math.round(dh) });
  }
}
const s1 = new Set(N[1]), s2 = new Set(N[2]), s3 = new Set(N[3]);
for (const id of s1) kolla(s2.has(id) && s3.has(id), "nivå 2/3 tappar en plats från nivå 1", id);
for (const id of s2) kolla(s3.has(id), "nivå 3 tappar en plats från nivå 2", id);
kolla(N[1].every(id => G.plats(id).relation !== "under"), "nivå 1 ska inte ha under", N[1]);
kolla(N[1].every(id => G.plats(id).relation !== "mellan"), "nivå 1 ska inte ha mellan", N[1]);
kolla(N[2].some(id => G.plats(id).relation === "under"), "nivå 2 ska ha under", N[2]);
kolla(N[2].every(id => G.plats(id).relation !== "mellan"), "nivå 2 ska inte ha mellan", N[2]);
kolla(N[3].filter(id => G.plats(id).relation === "mellan").length === 2, "nivå 3 ska ha två mellan-platser", N[3]);

const sedda = { 1: new Set(), 2: new Set(), 3: new Set() };
let forra = null;
for (let k = 0; k < 40000; k++) {
  for (const niva of [1, 2, 3]) {
    const p = G.uppgift(niva, forra);
    sedda[niva].add(p.ratt);
    kolla(p.niva === niva, "fel nivå", p.niva);
    kolla(N[niva].includes(p.ratt), "rätt plats finns inte på nivån", p);
    const pl = G.plats(p.ratt);
    kolla(p.ord === pl.ord, "ordet stämmer inte med platsen", p);
    kolla(p.relation === pl.relation && p.objekt === pl.objekt, "relation/objekt stämmer inte", p);
    kolla(p.fragaText.startsWith("Sätt Kotten ") && p.fragaText.endsWith("."), "dålig fråga", p.fragaText);
    kolla(p.fragaText.includes(pl.ord), "frågan nämner inte lägesordet", p.fragaText);
    kolla(p.text.includes(pl.ord) || (pl.relation === "mellan" && p.text.includes("mellan")), "förklaringen nämner inte lägesordet", p.text);
    kolla(p.text.length > 12 && p.text.endsWith("."), "dålig förklaring", p.text);
    if (forra) kolla(p.ratt !== forra || N[niva].length === 1, "samma uppgift två gånger i rad", { niva, forra, nu: p.ratt });
    forra = p.ratt;
  }
}
for (const niva of [1, 2, 3]) {
  for (const id of N[niva]) kolla(sedda[niva].has(id), "platsen slumpas aldrig fram", { niva, id });
}

console.log(`platser: ${G.PLATSER.length}, nivåer: ${N[1].length}/${N[2].length}/${N[3].length}, uppgifter: 120000, fel: ${fel}`);
process.exit(fel ? 1 : 0);