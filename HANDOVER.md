# Developer-Handover — Mira Autowellness Website

> **Interne Doku — nicht mit deployen.** Stand: 2026-06-30.
> Ergänzt die Auto-Memory unter `/Users/ben/.claude/projects/-Users-ben-Documents-Dokumente--Claude-Website/memory/`.

## 1. Projektstatus
Neue, **statische** Premium-Website für **Mira Autowellness** (Autoaufbereitung, Hofheim am Taunus). Ersetzt die alte Seite https://mira-autowellness.de.
Funktional fertig als mehrseitige Brochure-Site **+ interaktiver Preis-Rechner**. **Noch nicht deployed.** Mehrere Platzhalter warten auf echte Inhalte (Fotos, Instagram, finale Preise, Rechtstexte).

## 2. Architektur / Stack
- **Build-frei: reines HTML + CSS + Vanilla-JS.** Kein Framework, kein Build-Step, kein Backend.
- Grund: Mac des Users hat **kein Node, kein Homebrew**; gewählter „smarter Rechner" läuft clientseitig; Buchung via WhatsApp-Deeplinks.
- **Eine** Stylesheet-Datei `css/styles.css` mit Design-Tokens (CSS-Variablen).
- JS: `js/main.js` (Sticky-Header, Mobile-Menü, Scroll-Reveal, Jahr im Footer) + `js/calculator.js` (Preis-Rechner + Info-Toggles).
- **Header + Footer sind auf JEDER Seite dupliziert** (kein Templating/Includes) → Änderung daran = alle Seiten anfassen.
- Design: Navy `#0A1C2E` + Marken-Cyan `#00B5E3` (= Logofarbe) + Weiß/Silber. Selbst gehostete Fonts (Inter + Sora) in `assets/fonts/`.

## 3. Pfade / „Branch/State"
- **Kein Git-Repo** — keine Branches/History (Empfehlung: `git init`).
- **Canonical-Verzeichnis:** `/Users/ben/Documents/Dokumente /Claude/Website`
  - ⚠️ „Dokumente " endet mit **non-breaking space (U+00A0)**, kein normales Leerzeichen.
  - Bash: `cd /Users/ben/Documents/Dokumente*/Claude/Website` (Glob).
  - **Read/Write/Edit-Tools können den nbsp-Pfad nicht** → ASCII-**Symlink** nutzen: `<scratchpad>/site` (mit `ln -sfn` angelegt).
- **Preview:** Server kann NICHT aus `~/Documents` laufen (macOS TCC blockt `getcwd`). Lösung: Kopie nach `<scratchpad>/preview` syncen, via `.claude/launch.json` (`bash -c "cd <preview> && python3 -m http.server 4173"`). **Nach jeder Änderung `cp` neu syncen.** **Nicht** `rm -rf` auf preview während der Server läuft (killt ihn → `preview_start` neu).

## 4. Seiten (10 HTML)
| Datei | Inhalt |
|---|---|
| `index.html` | Hero · Trust-Strip · **5 Service-Karten** · „Warum Mira" · Rechner-Teaser · **Galerie** (Vorher/Nachher-Platzhalter + Instagram-Vorschau) · Bewertungen (Platzhalter) · Kontakt-CTA (mit **Chef-Foto-Platzhalter**) · Footer · Sticky Mobile-CTA |
| `preise.html` | Preisübersicht (5 Services) + **interaktiver Rechner** (`#rechner`) |
| `innenreinigung.html` · `aussenreinigung.html` · `autoaufbereitung.html` (=komplett innen+außen) · `smart-repair.html` · `keramikversiegelung.html` | Leistungs-Detailseiten |
| `jobs.html` | Karriere, echte Stelle **Fahrzeugpfleger (Vollzeit)** |
| `impressum.html` · `datenschutz.html` | **Rechts-Stubs (unvollständig)** |

## 5. Preis-Rechner (`js/calculator.js`)
- 5 Services: `innen`, `aussen`, `komplett` (= innen+außen), `smart`, `keramik`.
- `MODEL`: `innen.base/extras`, `aussen.base/extras`, gemeinsamer `cond`-Multiplikator (leicht .9 / normal 1 / stark 1.25), `smart`-Ranges.
- `komplett` summiert innen+außen-Base und zeigt **beide** Extra-Sets (`name=extras` + `name=extras_a`).
- `keramik` → „Individuelles Angebot"; `smart`-Hagel → „individuell".
- Baut vorbefüllte WhatsApp-Nachricht; Ergebnis-Panel live. `.opt__i`-Buttons klappen Kurz-Erklärungen (`.opt__desc`) auf.
- ⚠️ **Preise sind Platzhalter** (von alter Seite abgeleitet/teils geschätzt). Verifiziert: Innen 110–160, Außen 130–190, komplett 240–350 (+Extras bis 320–520), Smart Kratzer 50–100.

## 6. Wichtige Daten
- **WhatsApp:** `wa.me/4915115298007` (real) — überall + in calculator.js. **„Anrufen"/Telefon = Festnetz** `tel:+4961922069079` (Anzeige „06192 – 206 90 79").
- **Social:** Instagram `@miraautowellness`, TikTok `@miraautowellness` (Footer aller Seiten).
- Adresse: Alte Bleiche 1–3, 65719 Hofheim a. Ts. · info@mira-autowellness.de · Mo–Fr 8–18, Sa 9–15.
- Trust: 3M Select Gold, GTECHNIQ Accredited, Google 4,9★ (Badges in `assets/img/`). Logo `assets/logo/logo.png` (Cyan, transparent), Quelle/Composite in `assets/logo/logo_neu.*`.

## 7. Letzte Änderungen (neueste zuerst)
- `smart-repair.html`: Lead gekürzt → „Endpreis nach kurzer Begutachtung."; **Icon der ersten Preiszeile (Kratzer entfernen) entfernt**, damit Text bündig steht.
- Leistungen: **5 Karten in einer Reihe** (`.cards` minmax → 190px); `.card h3` kleiner + `hyphens:auto` → Keramikversiegelung-Clipping behoben.
- Galerie: Vorher/Nachher-Platzhalter **+** Instagram-Vorschau-Card.
- **3-Service-Umbau**: Innen / Außen / Autoaufbereitung(komplett); neue `aussenreinigung.html`; `autoaufbereitung.html` = komplett.
- Preis-Sublabels unter Preisen raus (nur „ab X €"/„auf Anfrage"). Extras-Infos gekürzt; ⓘ-Toggles.
- Echte WhatsApp-Nummer; Social-Links; jobs.html mit echter Stelle; Chef-Foto-Platzhalter im Kontakt.

## 8. Offene Tasks (warten auf User-Input)
- [ ] **Instagram**: echte Bilder (Dateien) ODER konkrete Beitrags-/Reel-Links — IG ist nicht automatisch scrapebar (Login-Wall, CDN-URLs laufen ab). Galerie-Kacheln/IG-Card sind vorbereitet (Bilder → `assets/img/`).
- [ ] **Fotos**: Hero (`.hero__photo`), Galerie Vorher/Nachher (`.gallery .shot`), Chef/Inhaber-Porträt (`#kontakt .person__photo`).
- [ ] **Preise** im Rechner bestätigen/anpassen (v.a. Außen/komplett — geschätzt).
- [ ] **Impressum**: Inhaber-Name + USt-IdNr. **Datenschutz**: vollständiger, juristisch geprüfter Text.

## 9. Risiken / bekannte Stolpersteine
- **nbsp im Pfad (U+00A0)** → Datei-Tools nur über den Symlink, Bash über Glob.
- **Header/Footer 8× dupliziert** → leicht inkonsistent zu halten.
- **Scroll-Reveal + Smooth-Scroll nutzen CSS-Transitions, die der Vorschau-Hintergrund-Tab PAUSIERT** → Screenshots wirken leer/abgeschnitten. Vor Screenshot injecten: `*{transition:none!important;animation:none!important} .reveal{opacity:1!important;transform:none!important}` + `document.documentElement.style.scrollBehavior='auto'`. **Kein Real-User-Bug** (sichtbarer Tab animiert normal). Reveal hat 2-s-JS-Fail-Safety-Net (Inline-Script im `<head>` + `clearTimeout` in main.js). Sehr hohe Viewports (>~6800px) lassen den Screenshot fehlschlagen → in Abschnitten capturen.
- **Kein Git** → keine Rollbacks.
- **Rechts-Seiten unvollständig** + **Rechner-Preise = Platzhalter** → beides vor Launch klären.

## 10. Nächste sinnvolle Schritte
1. Platzhalter ersetzen, sobald User Fotos / IG-Links / finale Preise liefert.
2. **Launch-Readiness:** Lokales SEO (LocalBusiness-JSON-LD „Autoaufbereitung Hofheim", `sitemap.xml`, `robots.txt`), Google-Maps eingebettet (consent-gated) im Kontakt, Cookie-Consent-Banner, Rechts-Seiten fertigstellen.
3. **Deployment:** auf Vercel/Netlify hochladen + DNS für `mira-autowellness.de` umziehen (Anleitung erstellen). `HANDOVER.md` vom Upload ausschließen.
4. Optional: `git init`. Astro/SSG nur falls CMS gewünscht (braucht Node-Installation).

## Schnellstart für den nächsten Chat
```bash
cd /Users/ben/Documents/Dokumente*/Claude/Website     # Bash via Glob (nbsp im Pfad!)
# Datei-Tools (Read/Write/Edit): über Symlink <scratchpad>/site arbeiten
# Preview: site → preview cp-syncen, dann preview_start "mira" (Port 4173)
```
