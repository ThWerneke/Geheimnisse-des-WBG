# Geheimnisse des WBG — Projektwoche

Website der Projektwoche am **Walburgisgymnasium & der Walburgisrealschule**:
Audioguides über das Schulgelände, das WBG als Wohnraum, Kunstwerke,
die NS-Zeit, ein Damals-&-Heute-Vergleich und ein Zeitstrahl.

**Design:** Standard ist die Farbwelt „WBG“ (Farben des SMMP-Logos).
Über das Farbrad oben rechts lassen sich weitere Designs ausklappen —
Hover zeigt eine Live-Vorschau, Klick übernimmt das Design dauerhaft.
Die Designs sind in `assets/js/common.js` (Liste) und
`assets/css/style.css` (Farbwerte) definiert.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Hauptseite mit der Themenauswahl |
| `audioguide.html` | Übersicht der zwei Rundgänge |
| `audioguide-oberpark.html` | Route 1: Oberparktour (Stationen mit Riss-Effekt + Audio) |
| `audioguide-unterpark.html` | Route 2: Unterparktour (Stationen mit Riss-Effekt + Audio) |
| `wohnraum.html` | Das WBG als Wohnraum (Collagen + Berichte) |
| `kunstwerke.html` | Galerie der Kunstwerke |
| `ns-zeit.html` | Das WBG zur NS-Zeit (Comic, Texte, Fotos) |
| `vergleich.html` | Damals & Heute mit Schieberegler |
| `archiv.html` | Das Bildarchiv (alte Aufnahmen & Fundstücke) |
| `zeitstrahl.html` | Wichtige Stationen der Schulhistorie als Zeitstrahl |

## Inhalte eintragen

Jede Seite hat **oben im `<script>`-Bereich einen kommentierten Datenblock**
(z.B. `ROUTE.stations`, `WERKE`, `PANELS`, `VERGLEICHE`). Neuer Eintrag =
Block kopieren und anpassen — HTML, QR-Codes und Player entstehen automatisch.

Medien-Dateien kommen in diese Ordner (in jedem liegt eine LIESMICH.txt):

```
assets/audio/Oberpark/Oberparktour/1Klassentrakt…9Hühnerstall/
                         Pro Station ein Ordner: alt.jpg, heute.jpg + Audio
assets/audio/Unterpark/Unterparktour/1TorWilhelmshöhe…6Sekretariat/
                         Pro Station ein Ordner: Fotos + Audio (m4a)
assets/img/stationen/    Reserve-Fotos vom Gelände (aktuell unbenutzt)
assets/img/collagen/     Collagen der Wohnraum-Seite
assets/img/kunstwerke/   Fotos der Kunstwerke
assets/img/comic/        Comic-Panels der NS-Zeit-Seite
assets/img/ns/           Scans und Fotos der NS-Zeit-Seite
assets/img/vergleich/    Bildpaare für Damals & Heute
assets/img/archiv/       Bilder für das Bildarchiv
assets/img/zeitstrahl/   Die zwei Bilder für den Zeitstrahl
assets/img/schulleben/   Fotos der Berichte auf der Wohnraum-Seite
```

Im Datenblock dann den Pfad eintragen, z.B.
`old: 'assets/img/stationen/pausenhof-frueher.jpg'`.

**Tipp:** Fotos vor dem Hochladen verkleinern (max. ~1600 px Breite),
damit die Seite schnell lädt.

## Veröffentlichen mit GitHub Pages

1. Diesen Ordner als Repository **Geheimnisse-des-WBG** auf GitHub
   (Konto `thwerneke`) hochladen. Der Ordner `Logo/` muss nicht mit —
   die Website nutzt nur die kleinen Versionen in `assets/img/`.
2. Im Repository: **Settings → Pages → Source: „Deploy from a branch“**,
   Branch `main`, Ordner `/ (root)` wählen und speichern.
3. Nach 1–2 Minuten ist die Seite unter
   `https://thwerneke.github.io/Geheimnisse-des-WBG/` erreichbar.

Die **QR-Codes** auf den Audioguide-Seiten sind fest auf diese Adresse
eingestellt (`baseUrl` oben im Datenblock der beiden Routen-Seiten).
Zum Aushängen einfach die Routen-Seite drucken — das Druck-Layout ist
vorbereitet: es werden nur die QR-Karten gedruckt.

## Vor dem Go-Live

- [ ] Platzhalter-Texte und -Fotos ersetzen
- [ ] Fotos nur als JPG/PNG einbinden (HEIC zeigen Browser nicht an —
      auf dem Mac konvertieren oder von Claude konvertieren lassen)
- [ ] Entscheiden, ob das Design-Rad für Besucher sichtbar bleiben soll —
      sonst `<div class="theme-switcher"></div>` aus den Seiten löschen
      (das gewählte `data-theme` im `<body>`-Tag bleibt dann fest)
- [ ] `preview-badge` („VORSCHAU …“) aus den Seiten entfernen
- [ ] Impressum/Datenschutz ergänzen (Footer)
- [ ] Der Ordner `Logo/` (Original-Dateien, ~40 MB) und `Text 6.txt`
      müssen nicht mit hochgeladen werden — die Website nutzt nur die
      kleinen Versionen in `assets/img/`
