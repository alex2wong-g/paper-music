# Pianola · Paper & Sound

An ivory and brass player-piano web app with an animated, textured 88-note paper roll.

## Run

```sh
npm install
npm run dev
```

Build with `npm run build`. Deploy `dist/` as static assets.

## Features

- Built-in full Für Elise MusicXML score supplied by the user, parsed by the same importer as uploaded scores.

- Full piano and close-up paper-roll cameras with eased transitions.
- MIDI (`.mid`, `.midi`), MusicXML (`.xml`, `.musicxml`) and compressed MusicXML (`.mxl`) imports, processed locally.
- MIDI timing and tempo maps; MusicXML divisions, rests, chords, voices, backup/forward, tempo changes, transposition, ties, repeats, and alternate endings.
- Synchronized downward roll movement, synthesized sound and piano-key highlights.
- Play/pause, seek, rewind, volume, mute and speed. Space toggles playback.
- Responsive layout, keyboard controls, file drag and drop, reduced-motion support.

## Playback boundaries

The instrument uses a local additive piano-like synthesizer, not sampled acoustic piano audio or a physical pneumatic model. MusicXML must be score-partwise. Grace notes, expressive ornaments, D.C./D.S./coda navigation and pedal markings are not interpreted. MIDI percussion tracks are excluded. Only the 88-key range A0–C8 is played. Playback pauses when the browser tab is hidden.

`qa/browser-check.js` is a browser verification function for MIDI tempo maps, MusicXML timing/polyphony/ties/repeats, compressed MusicXML, rejected invalid files, file import and playback controls. Run against the Vite dev server through browser evaluation.
