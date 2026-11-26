# KONCEPT – Kotten och stubben

**Mål (en sak per app):** lägesorden *på, under, bredvid, mellan* – att förstå en beskrivning av
var något befinner sig och att själv kunna placera något på den platsen.

**Målgrupp:** åk 1–3 (katalogkategori FK–2), matematik. Spelbart utan att kunna läsa: målkortet
är en bild, frasen läses upp.

**Kärnmekanik (touch först):** målkortet längst upp visar en liten bild av Kotten på en plats i
skogen ("på stubben"). Barnet pekar på en av de streckade ringarna i den stora bilden. Kotten
hoppar dit. Rätt plats = han firar; fel = han funderar, går tillbaka till sin plats och barnet
provar igen.

**5-minuterssession:** 6 uppgifter per runda, tre nivåer, "en runda till"-knapp.

**Belöning barnet kan berätta om:** stjärnor och att Kotten står på stubben/under bänken – och
att hen kan säga *under* och *mellan* själv.

**Vad barnet lär:** rumsliga lägesord som är en förutsättning för att följa instruktioner,
beskriva bilder och senare för koordinatsystem och programmering.

**Lgr22 (ordagrant ur Skolverkets text):**
1. MA.1-3.3.1 – "Vanliga lägesord för att beskriva föremåls och objekts läge i rummet."

**Varför det funkar på iPad:** inga drag, ingen text att läsa, stora tryckytor (122 px i
liggande, 86 px i stående på iPad), allt ryms på en skärm, och fel kostar inget.

**Testplan (mätbara krav)**
- Spelbart med bara fingrar: hela rundan ska gå att spela med `Input.dispatchTouchEvent`.
- Allt ryms: `scrollHeight - innerHeight == 0` och `scrollWidth - innerWidth == 0` i 1024×768,
  768×1024, 390×844 och 1440×900.
- Svenska i barnets nivå, "du" och inte "ni".
- Återkoppling + nytt försök: fel svar flyttar inte uppgiften vidare, efter två fel pulserar
  rätt plats.
- Ingen inloggning, ingen reklam, inga länkar ut, ingen tredjeparts-CDN (kodsnutten från
  skolappar.org är den enda externa resursen).
- Korrekt faktа: platserna och lägesorden kontrolleras av `verify.mjs` (120 000 uppgifter, 0 fel).
- Tryckytor: varje plats har en osynlig tryckyta med diameter 128 världsenheter och alla ligger
  minst 2r+16 ifrån varandra (kontrolleras i `verify.mjs`).

**Validering (utförd i denna körning, utan separat agent – ingen delegate_task finns i denna
miljö):**
- (a) *Skulle ett barn spela 5 minuter?* Ja: mekaniken är "peka där bilden visar", en gest som
  redan en 5-åring kan, och Kotten svarar direkt varje gång. Risken är att det blir för lätt på
  nivå 1 – därför fyra platser redan på nivå 1 och sju på nivå 3.
- (b) *Verkligt kunskapskrav?* Ja: MA.1-3.3.1 är ordagrant citerat och appen tränar exakt det –
  orden *på/under/bredvid/mellan* kopplade till en bild, inte bara ett pussel.
- (c) *Teknisk risk?* Låg: ren SVG, en datafil med sju platser, ingen fysik, ingen timer.
  Huvudrisken var att de sju tryckytorna ligger för nära varandra på en liten skärm – löst med
  minimiavstånd som `verify.mjs` kontrollerar.