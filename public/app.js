/* Kotten och stubben – lägesord (på, under, bredvid, mellan).
   Statisk app, inga beroenden. Tränar Lgr22 MA.1-3.3.1: "Vanliga lägesord för att beskriva
   föremåls och objekts läge i rummet."

   Uppgiften är en bild, inte en mening: målkortet längst upp visar en liten bild av Kotten
   på den plats han ska stå, och frasen ("på stubben") skrivs ut och läses upp. Barnet pekar
   på en plats i skogen. Fel svar kostar inget – efter två försök pulserar rätt plats.

   Allt ritas i kod: stubbe, bänk, sten och Kotten i SVG; ljud i WebAudio och talsyntes.
   Platserna är rena data (PLATSER) som verify.mjs kontrollerar. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. Platserna – ren data, kontrollerad av verify.mjs                  *
   * ------------------------------------------------------------------ */
  var VARLD = { b: 1000, h: 660, mark: 600 };

  var OBJ = {
    stubbe: { namn: "stubben" },
    bank: { namn: "bänken" },
    sten: { namn: "stenen" }
  };

  /* y är fotpunkten: Kotten står med fötterna där. */
  var PLATSER = [
    { id: "pa_stubbe", ord: "på stubben", relation: "på", objekt: "stubbe", x: 140, y: 424, skala: 1 },
    { id: "pa_bank", ord: "på bänken", relation: "på", objekt: "bank", x: 480, y: 404, skala: 1 },
    { id: "pa_sten", ord: "på stenen", relation: "på", objekt: "sten", x: 815, y: 452, skala: 1 },
    { id: "bredvid_sten", ord: "bredvid stenen", relation: "bredvid", objekt: "sten", x: 928, y: 600, skala: 1 },
    { id: "under_bank", ord: "under bänken", relation: "under", objekt: "bank", x: 480, y: 600, skala: 0.78 },
    { id: "mellan_stubbe_bank", ord: "mellan stubben och bänken", relation: "mellan", objekt: "stubbe", x: 310, y: 600, skala: 0.92 },
    { id: "mellan_bank_sten", ord: "mellan bänken och stenen", relation: "mellan", objekt: "bank", x: 655, y: 600, skala: 0.92 }
  ];

  /* Nivå 1: två lägesord (på, bredvid) på tre saker. Nivå 2 lägger till under bänken.
     Nivå 3 lägger till mellan – då måste barnet hålla två saker i huvudet samtidigt. */
  var NIVAA = {
    1: ["pa_stubbe", "pa_bank", "pa_sten", "bredvid_sten"],
    2: ["pa_stubbe", "pa_bank", "pa_sten", "bredvid_sten", "under_bank"],
    3: ["pa_stubbe", "pa_bank", "pa_sten", "bredvid_sten", "under_bank", "mellan_stubbe_bank", "mellan_bank_sten"]
  };
  var HEM = { x: 58, y: 652, skala: 1 };

  function plats(id) {
    for (var i = 0; i < PLATSER.length; i++) if (PLATSER[i].id === id) return PLATSER[i];
    return null;
  }
  function tillatna(niva) {
    var ids = NIVAA[niva] || NIVAA[1], ut = [], i;
    for (i = 0; i < ids.length; i++) ut.push(plats(ids[i]));
    return ut;
  }
  function fragaFor(p) {
    return "Sätt Kotten " + p.ord + ".";
  }
  function svarFor(p) {
    if (p.relation === "på") return "Kotten står på " + OBJ[p.objekt].namn + ".";
    if (p.relation === "under") return "Kotten står under " + OBJ[p.objekt].namn + ".";
    if (p.relation === "bredvid") return "Kotten står bredvid " + OBJ[p.objekt].namn + ".";
    return "Kotten står " + p.ord + ".";
  }

  function uppgift(niva, forra) {
    niva = niva === 2 || niva === 3 ? niva : 1;
    var lista = tillatna(niva), val = lista[0], försök = 0;
    do {
      val = lista[Math.floor(Math.random() * lista.length)];
      försök++;
    } while (lista.length > 1 && forra && val.id === forra && försök < 40);
    return {
      niva: niva,
      ratt: val.id,
      ord: val.ord,
      relation: val.relation,
      objekt: val.objekt,
      fragaText: fragaFor(val),
      text: svarFor(val)
    };
  }

  /* ------------------------------------------------------------------ *
   * 2. Kotten (egen SVG, fem uttryck – samma figur som i familjen)       *
   * ------------------------------------------------------------------ */
  function kottenInner(uttryck) {
    var F = "#b07d4b", M = "#8a5f36", O = "#2b2118", mun, ogen = "", extra = "";
    if (uttryck === "hejar") { mun = '<path d="M22 36 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else if (uttryck === "firar") {
      mun = '<path d="M21 34 q9 12 18 0" fill="#fff"/><path d="M21 34 q9 12 18 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
      extra = '<path d="M10 12 l3 6M50 12 l-3 6M30 6 v5" stroke="#e8a33d" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    }
    else if (uttryck === "tanker") { mun = '<path d="M24 37 h11" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>'; ogen = '<circle cx="46" cy="24" r="4" fill="none" stroke="' + M + '" stroke-width="1.6" opacity=".5"/>'; }
    else if (uttryck === "funderar") { mun = '<path d="M22 38 q8 -6 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else { mun = '<path d="M22 34 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    var oga = '<circle cx="23" cy="24" r="5.2" fill="#fff"/><circle cx="37" cy="24" r="5.2" fill="#fff"/>' +
      '<circle cx="24" cy="24.6" r="2.5" fill="' + O + '"/><circle cx="36" cy="24.6" r="2.5" fill="' + O + '"/>';
    return extra +
      '<path d="M30 6 q9 4 12 12 q9 12 4 24 q-4 12 -16 14 q-12 -2 -16 -14 q-5 -12 4 -24 q3 -8 12 -12z" fill="' + F + '"/>' +
      '<path d="M19 20 q11 -5 22 0M16 30 q14 -5 28 0M16 40 q14 -4 28 0" stroke="' + M + '" stroke-width="1.7" fill="none" opacity=".85" stroke-linecap="round"/>' +
      oga + ogen + mun;
  }
  function kottenSvg(uttryck, klass) {
    return '<svg class="' + (klass || "kotten-svg") + '" viewBox="0 0 60 60" aria-hidden="true">' +
      kottenInner(uttryck) + '</svg>';
  }
  /* Kotten i världen: 120 enheter lång, fötterna i (x, y). */
  function kottenPa(x, y, skala, uttryck, klass) {
    var s = 2 * skala;
    return '<g class="' + (klass || "") + '" transform="translate(' + (x - 30 * s) + ',' + (y - 60 * s) + ') scale(' + s + ')" aria-hidden="true">' +
      kottenInner(uttryck) + '</g>';
  }

  /* ------------------------------------------------------------------ *
   * 3. Ljud (WebAudio + talsyntes, skapas vid första gesten)             *
   * ------------------------------------------------------------------ */
  var ac = null, ljudPa = true;
  function ljud(frekvens, langd, typ) {
    if (!ljudPa) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || "sine"; o.frequency.value = frekvens;
      g.gain.value = 0.001; o.connect(g); g.connect(ac.destination);
      var t = ac.currentTime;
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + langd);
      o.start(t); o.stop(t + langd + 0.02);
    } catch (e) { }
  }
  function sag(text) {
    if (!ljudPa) return;
          try { if (window.__rost && window.__rost(text, true)) return; } catch (e) { }
        console.warn('saknar mp3:', text);
  }
  function spar(namn, varde) { try { if (window.skolappar && window.skolappar.event) window.skolappar.event(namn, varde); } catch (e) { } }

  /* ------------------------------------------------------------------ *
   * 4. Skogen, ritad i kod                                              *
   * ------------------------------------------------------------------ */
  function stubbe() {
    return '<g aria-hidden="true">' +
      '<ellipse cx="140" cy="600" rx="106" ry="16" fill="rgba(20,24,31,.08)"/>' +
      '<path d="M62 596 q-4 -152 78 -172 q82 20 78 172 z" fill="#b07d4b"/>' +
      '<path d="M62 596 q-4 -152 78 -172 q-20 70 -16 172 z" fill="#a1703f" opacity=".55"/>' +
      '<ellipse cx="140" cy="428" rx="79" ry="24" fill="#d2ab7c"/>' +
      '<ellipse cx="140" cy="428" rx="52" ry="15" fill="none" stroke="#b98d5f" stroke-width="5"/>' +
      '<ellipse cx="140" cy="428" rx="24" ry="7" fill="none" stroke="#b98d5f" stroke-width="5"/>' +
      '</g>';
  }
  function bank() {
    return '<g aria-hidden="true">' +
      '<ellipse cx="480" cy="602" rx="118" ry="14" fill="rgba(20,24,31,.08)"/>' +
      '<rect x="404" y="432" width="26" height="170" rx="10" fill="#96683c"/>' +
      '<rect x="530" y="432" width="26" height="170" rx="10" fill="#96683c"/>' +
      '<rect x="382" y="404" width="196" height="34" rx="12" fill="#c08c53"/>' +
      '<rect x="382" y="404" width="196" height="12" rx="6" fill="#d8ab74"/>' +
      '<rect x="382" y="452" width="196" height="14" rx="7" fill="#a57445"/>' +
      '</g>';
  }
  function sten() {
    return '<g aria-hidden="true">' +
      '<ellipse cx="815" cy="602" rx="112" ry="15" fill="rgba(20,24,31,.08)"/>' +
      '<path d="M714 600 q-16 -104 58 -132 q16 -30 46 -22 q52 10 66 60 q22 16 16 94 z" fill="#a8a49c"/>' +
      '<path d="M714 600 q-16 -104 58 -132 q12 44 6 132 z" fill="#918d85" opacity=".6"/>' +
      '<path d="M772 470 q30 -10 52 8" stroke="#8c8880" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '</g>';
  }
  function mark() {
    return '<rect x="0" y="' + VARLD.mark + '" width="' + VARLD.b + '" height="' + (VARLD.h - VARLD.mark) + '" fill="var(--mark)"/>' +
      '<path d="M0 ' + VARLD.mark + ' H' + VARLD.b + '" stroke="var(--mark-kant)" stroke-width="3"/>' +
      '<g stroke="var(--gräs)" stroke-width="4" stroke-linecap="round" fill="none">' +
      '<path d="M330 622 q6 -16 14 -22M352 624 q-2 -14 4 -22M690 630 q6 -16 14 -22M712 632 q-2 -14 4 -22M30 640 q6 -16 14 -22"/>' +
      '</g>';
  }
  function moln() {
    return '<g fill="var(--moln)" aria-hidden="true">' +
      '<ellipse cx="600" cy="120" rx="86" ry="34"/><ellipse cx="664" cy="108" rx="60" ry="26"/><ellipse cx="548" cy="108" rx="46" ry="22"/>' +
      '<ellipse cx="240" cy="86" rx="62" ry="26"/><ellipse cx="290" cy="80" rx="40" ry="18"/>' +
      '</g>';
  }

  function varld(kottenPlatsId, uttryck, extraKlass) {
    var h = [], underBank = kottenPlatsId === "under_bank";
    h.push(mark(), moln(), stubbe(), sten());
    if (underBank) {
      h.push(kottenPa(plats(kottenPlatsId).x, plats(kottenPlatsId).y, plats(kottenPlatsId).skala, uttryck, extraKlass));
      h.push(bank());
    } else {
      h.push(bank());
      if (kottenPlatsId) {
        var p = kottenPlatsId === "hem" ? HEM : plats(kottenPlatsId);
        h.push(kottenPa(p.x, p.y, p.skala, uttryck, extraKlass));
      }
    }
    return h.join("");
  }

  /* ------------------------------------------------------------------ *
   * 5. Ritningen                                                        *
   * ------------------------------------------------------------------ */
  var RUNDA = 6, VALBAR_R = 64;
  var S = {
    skarm: "start", niva: 1, item: 0, svarRatt: 0, stjarnor: 0,
    fel: 0, p: null, kotten: "hem", uttryck: "glad", klar: false,
    visaRatt: false, sistaVal: null
  };

  function slotsRit() {
    var h = [], lista = tillatna(S.niva), i, p;
    for (i = 0; i < lista.length; i++) {
      p = lista[i];
      var ratt = S.visaRatt && S.p && p.id === S.p.ratt;
      var fel = S.sistaVal === p.id && !(S.p && p.id === S.p.ratt);
      h.push('<g class="plats' + (ratt ? " ratt" : "") + (fel ? " fel" : "") + '" data-id="' + p.id + '" role="button" tabindex="0" aria-label="' + p.ord + '">');
      h.push('<ellipse class="plats-ring" cx="' + p.x + '" cy="' + (p.y - 4) + '" rx="52" ry="17" fill="none" stroke="' + (ratt ? "var(--accent)" : "var(--ring)") + '" stroke-width="' + (ratt ? 7 : 5) + '" stroke-dasharray="14 12"/>');
      h.push('<circle cx="' + p.x + '" cy="' + (p.y - 46) + '" r="' + VALBAR_R + '" fill="transparent"/>');
      h.push('</g>');
    }
    return h.join("");
  }

  function ritaScen() {
    var el = document.getElementById("scen");
    if (!el) return;
    el.innerHTML = varld(S.kotten, S.uttryck, "figur") + slotsRit();
    el.setAttribute("viewBox", "0 0 " + VARLD.b + " " + VARLD.h);
    ritaMal();
  }

  function ritaMal() {
    var el = document.getElementById("mal-svg");
    if (!el || !S.p) return;
    var p = plats(S.p.ratt);
    var cw = 400, ch = 300;
    var cx = Math.max(cw / 2, Math.min(VARLD.b - cw / 2, p.x));
    var cy = Math.max(ch / 2, Math.min(VARLD.h - ch / 2, p.y - 66));
    el.setAttribute("viewBox", (cx - cw / 2) + " " + (cy - ch / 2) + " " + cw + " " + ch);
    el.innerHTML = '<rect x="0" y="0" width="' + VARLD.b + '" height="' + VARLD.h + '" fill="var(--papper)"/>' +
      varld(p.id, "glad");
    document.getElementById("mal-text").textContent = p.ord;
  }

  function ritaPrickar() {
    var h = "", i;
    for (i = 0; i < RUNDA; i++) h += '<i class="' + (i < S.item ? "klar" : "") + '"></i>';
    document.getElementById("prickar").innerHTML = h;
  }
  function ritaStjarnor() {
    document.getElementById("stjarnor").textContent = "★".repeat(Math.min(S.stjarnor, 12)) + (S.stjarnor > 12 ? "+" : "");
  }
  function kottenByt(uttryck) {
    S.uttryck = uttryck;
    var el = document.getElementById("kotten");
    if (el) el.innerHTML = kottenSvg(uttryck, "kotten-svg");
  }

  /* ------------------------------------------------------------------ *
   * 6. Spelflöde                                                        *
   * ------------------------------------------------------------------ */
  var idleTimer = null;
  function startIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (S.skarm === "spel" && !S.klar) { sag(S.p.fragaText); spar("hint"); }
    }, 14000);
  }

  function nyUppgift() {
    S.p = uppgift(S.niva, S.p ? S.p.ratt : null);
    S.klar = false; S.fel = 0; S.visaRatt = false; S.sistaVal = null;
    S.kotten = "hem";
    kottenByt("glad");
    ritaScen(); ritaPrickar();
    sag(S.p.fragaText);
    startIdle();
  }

  function valj(id) {
    if (S.skarm !== "spel" || S.klar || !S.p) return;
    if (!plats(id) || tillatna(S.niva).map(function (p) { return p.id; }).indexOf(id) < 0) return;
    clearTimeout(idleTimer);
    S.sistaVal = id; S.kotten = id;
    if (id === S.p.ratt) {
      S.klar = true; S.visaRatt = true; S.item++; S.svarRatt++; S.stjarnor++;
      kottenByt("firar");
      ritaScen(); ritaPrickar(); ritaStjarnor();
      ljud(520, 0.12, "square");
      setTimeout(function () { ljud(780, 0.14, "sine"); }, 130);
      setTimeout(function () { ljud(1040, 0.18, "sine"); }, 260);
      sag(S.p.text);
      setTimeout(function () {
        kottenByt("glad");
        if (S.item >= RUNDA) rundaKlar(); else nyUppgift();
      }, 2400);
    } else {
      S.fel++;
      S.kotten = "hem"; S.uttryck = "funderar";
      ritaScen();
      ljud(240, 0.14, "triangle");
      setTimeout(function () { ljud(190, 0.16, "triangle"); }, 130);
      kottenByt("funderar");
      if (S.fel >= 2) {
        S.visaRatt = true;
        ritaScen();
        sag("Titta här. " + S.p.text);
        kottenByt("tanker");
        setTimeout(function () {
          S.item++; S.klar = true;
          kottenByt("glad");
          if (S.item >= RUNDA) rundaKlar(); else nyUppgift();
        }, 3000);
      } else {
        sag("Titta på bilden. " + S.p.fragaText);
        spar("hint");
        setTimeout(function () { S.uttryck = "glad"; ritaScen(); startIdle(); }, 900);
      }
    }
  }

  function rundaKlar() {
    S.skarm = "overlagg";
    var procent = Math.round(100 * S.svarRatt / RUNDA);
    spar("round_done", procent);
    sag("Rundan är klar. " + S.svarRatt + " av " + RUNDA + " rätt.");
    var stegUpp = S.svarRatt >= 5 && S.niva < 3;
    visaOverlay(S.svarRatt >= 5 ? "firar" : "hejar", "Rundan är klar!",
      S.svarRatt + " av " + RUNDA + " rätt. " + S.stjarnor + " stjärnor totalt." +
      (stegUpp ? " Nu blir det svårare!" : ""),
      "En runda till →", function () {
        if (stegUpp) { S.niva++; spar("level", S.niva); }
        startaRunda(S.niva);
      }, true);
  }

  function visaOverlay(uttryck, titel, text, knapptext, vidare, medNiva) {
    var ov = document.getElementById("overlay");
    document.getElementById("ov-bild").innerHTML = kottenSvg(uttryck, "ov-kotten");
    document.getElementById("ov-titel").textContent = titel;
    document.getElementById("ov-text").textContent = text;
    var b = document.getElementById("ov-nasta");
    b.textContent = knapptext;
    b.onclick = function () { ov.hidden = true; vidare(); };
    var n = document.getElementById("ov-niva");
    n.hidden = !medNiva;
    n.onclick = function () {
      ov.hidden = true;
      S.niva = S.niva >= 3 ? 1 : S.niva + 1;
      startaRunda(S.niva);
    };
    ov.hidden = false;
  }

  function startaRunda(niva) {
    S.niva = niva; S.skarm = "spel"; S.item = 0; S.svarRatt = 0; S.fel = 0; S.sistaVal = null; S.p = null;
    document.getElementById("startskarm").hidden = true;
    document.getElementById("spel").hidden = false;
    document.getElementById("overlay").hidden = true;
    ritaStjarnor(); kottenByt("glad");
    spar("round_start"); spar("level", niva);
    if (niva === 2) setTimeout(function () { sag("Nu kan Kotten också stå under bänken."); }, 3200);
    if (niva === 3) setTimeout(function () { sag("Nu kan Kotten också stå mellan två saker."); }, 3200);
    nyUppgift();
  }

  function tipsa() {
    if (S.skarm !== "spel" || S.klar || !S.p) return;
    sag(S.p.fragaText);
    spar("hint");
    kottenByt("tanker");
    setTimeout(function () { if (!S.klar) kottenByt("glad"); }, 2000);
  }

  /* ------------------------------------------------------------------ *
   * 7. Händelser och start                                              *
   * ------------------------------------------------------------------ */
  function ritaLjudIkon() {
    document.getElementById("ljudikon").innerHTML = ljudPa
      ? '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 8a5 5 0 0 1 0 8"/>'
      : '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 9l5 6M20 9l-5 6"/>';
  }

  function bind() {
    document.getElementById("scen").addEventListener("pointerdown", function (e) {
      var g = e.target.closest(".plats");
      if (g) { e.preventDefault(); valj(g.dataset.id); }
    });
    document.getElementById("spela").addEventListener("click", function () { ljud(600, 0.1); startaRunda(1); });
    document.getElementById("hjalp").addEventListener("click", tipsa);
    document.getElementById("ljud").addEventListener("click", function () {
      ljudPa = !ljudPa;
      if (!ljudPa && window.__rostStopp) window.__rostStopp();
      ritaLjudIkon(); spar("sound_off");
    });
    document.addEventListener("keydown", function (e) {
      if (S.skarm !== "spel") return;
      var lista = tillatna(S.niva);
      if (e.key >= "1" && e.key <= "9") {
        var i = Number(e.key) - 1;
        if (lista[i]) valj(lista[i].id);
      }
      if (e.key === "h" || e.key === "?") tipsa();
    });
    window.addEventListener("resize", function () { if (S.p) ritaScen(); });
  }

  function init() {
    bind(); ritaLjudIkon(); ritaStjarnor(); ritaPrickar();
    document.getElementById("kotten-hud").innerHTML = kottenSvg("glad", "kotten-hud");
    kottenByt("glad");
    window.__game = {
      S: S, uppgift: uppgift, PLATSER: PLATSER, NIVAA: NIVAA, tillatna: tillatna,
      valj: valj, startaRunda: startaRunda, nyUppgift: nyUppgift, tipsa: tipsa,
      ritaScen: ritaScen, VARLD: VARLD
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();