# Automatisierungs-Plan für Mira Autowellness

Grundlage: WhatsApp-Terminerinnerung & Nachfassnachrichten, WhatsApp-Buchungs-Bot, automatische Angebots-/Rechnungserstellung. Reihenfolge unten ist so gewählt, dass jede Phase auf der vorherigen aufbaut und schnell einen spürbaren Nutzen bringt.

## Reihenfolge im Überblick

1. Terminerinnerung & Nachfassnachrichten
2. WhatsApp-Buchungs-Bot
3. Angebots- & Rechnungserstellung

Phase 3 ist inhaltlich unabhängig von 1 und 2 und könnte theoretisch parallel laufen – sie steht trotzdem hinten, weil sie rechtliche Anforderungen hat (dazu unten mehr) und dadurch etwas mehr Vorlauf braucht.

---

## Phase 1: Terminerinnerung & Nachfassnachrichten

**Warum zuerst:** Technisch am einfachsten (keine Konversations-KI nötig, nur zeitgesteuerte Nachrichten), schnellster spürbarer Effekt – weniger No-Shows, mehr Google-Bewertungen – und legt gleichzeitig die technische Basis (WhatsApp-Anbindung), die Phase 2 sowieso braucht.

**Was gebaut wird:**
- Terminkalender als zentrale Quelle (Google Calendar – kennt er vermutlich schon, kostenlos, mobil nutzbar)
- Automatischer Versand am Vortag: "Erinnerung an Ihren Termin morgen um X Uhr"
- Automatischer Versand nach Abschluss: Dank-Nachricht + Bitte um Google-Bewertung (mit direktem Link)

**Werkzeuge:**
- WhatsApp Business Cloud API (offizielle Meta-Schnittstelle, im Rahmen kostenlos)
- Google Calendar
- Make.com als Verbindungsstück dazwischen (kein/kaum eigener Code, überschaubar wartbar für ihn selbst)

**Aufwand:** gering bis mittel, in 1–2 Sitzungen umsetzbar.

---

## Phase 2: WhatsApp-Buchungs-Bot

**Warum danach:** Nutzt die in Phase 1 aufgebaute WhatsApp-Anbindung weiter, kommt aber mit echter Komplexität dazu – der Bot muss freie Antworten von Kunden verstehen ("Habt ihr morgen Nachmittag Zeit?", "Was kostet Innenreinigung für einen Kombi?").

**Was gebaut wird:**
- Bot beantwortet Standardfragen automatisch (Preise, Öffnungszeiten, Leistungen – Inhalte kennt er ja schon von der Website)
- Bot prüft freie Slots im Google Calendar und schlägt Termine vor
- Bei allem, was der Bot nicht sicher beantworten kann, wird direkt an ihn persönlich weitergeleitet, statt zu raten

**Werkzeuge:**
- Gleiche WhatsApp-Anbindung wie Phase 1
- Claude API als "Verständnis"-Ebene, die die Kundennachricht einordnet und antwortet
- Kleine Anbindung (Webhook) zwischen WhatsApp und Claude API – das ist der Teil mit tatsächlichem Code, aber überschaubar

**Aufwand:** mittel, mehrere Sitzungen, plus eine Testphase, in der er die Antworten stichprobenartig kontrolliert, bevor der Bot komplett eigenständig läuft.

---

## Phase 3: Angebots- & Rechnungserstellung

**Was gebaut wird:**
- Der bestehende Preisrechner auf der Website (js/calculator.js) wird erweitert: aus der Auswahl entsteht automatisch ein PDF-Angebot, das direkt per E-Mail oder WhatsApp rausgeht
- Nach Auftragsabschluss automatische Rechnungsstellung aus denselben Daten

**Wichtiger Hinweis, kein Punkt zum Überspringen:** Rechnungen in Deutschland unterliegen gesetzlichen Pflichtangaben (u. a. fortlaufende Rechnungsnummer, Pflichtangaben nach § 14 UStG, GoBD-konforme Aufbewahrung). Ich bin kein Steuerberater, und eine komplett selbstgebaute Rechnungslogik hier ist riskant. Empfehlung: Die Angebots-Logik bauen wir selbst (unkritisch), für die eigentliche Rechnung aber eine etablierte Software wie sevDesk, lexoffice oder Fastbill anbinden (die haben passende Schnittstellen) – oder er lässt kurz seinen Steuerberater draufschauen, bevor das live geht.

**Werkzeuge:**
- Erweiterung des bestehenden Preisrechners
- Externe Rechnungssoftware (API-Anbindung) für den eigentlichen Rechnungsteil

**Aufwand:** gering für den Angebotsteil, mittel für die Rechnungsanbindung (abhängig davon, welche Software er schon nutzt oder nutzen möchte).

---

## Technischer Gesamtüberblick

| Baustein | Rolle |
|---|---|
| WhatsApp Business Cloud API | Kommunikationskanal für Erinnerungen, Nachfassen, Bot |
| Google Calendar | Terminquelle |
| Make.com | Verbindet die Bausteine ohne viel Eigenentwicklung |
| Claude API | Versteht und beantwortet freie Kundenanfragen im Bot |
| sevDesk/lexoffice o. ä. | Rechtssichere Rechnungsstellung |

Diese Kombination ist bewusst so gewählt, dass möglichst wenig Code selbst gewartet werden muss – wichtig, wenn er (bzw. wir) das langfristig ohne festen Entwickler am Laufen halten sollen.

## Nächster konkreter Schritt

Phase 1 starten: WhatsApp Business Account einrichten (braucht eine Verifizierung über Meta, das dauert ein paar Tage – lohnt sich, das als Erstes anzustoßen) und Google Calendar als Terminquelle aufsetzen. Sag Bescheid, dann fangen wir damit an.
