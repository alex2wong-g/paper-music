# Pianola · Paper & Sound

[中文](README.md) | [English](README.en.md)

A vintage player-piano web app with a warm-white interface, an ivory upright piano, and brass mechanical details. Import a MIDI or MusicXML score to watch a perforated paper roll move downward in sync with the music and piano keys.

[Try the app](https://pianola-paper-and-sound.huangyixiu1.chatgpt.site/)

## Preview

![Pianola full-piano view with a warm-white interface, ivory upright player piano, and perforated paper roll](docs/images/pianola-full-piano.png)

Full-piano view: the complete instrument, including its 88-key keyboard, paper-roll mechanism, and pedals.

![Pianola paper-roll close-up with vintage paper texture, note perforations, and playback controls](docs/images/pianola-paper-roll.png)

In the paper-roll view, horizontal position represents pitch and perforation length represents note duration. During playback, the paper moves downward and notes sound as they cross the tracker line.

## Features

- **Two cameras:** full piano and paper-roll close-up, with smooth transitions.
- **Vintage visuals:** a 2.5D upright piano, textured and aged paper, brass spools, and a complete 88-key keyboard.
- **Built-in score:** the full Für Elise MusicXML score, parsed by the same importer used for uploaded files.
- **Score import:** MIDI (`.mid`, `.midi`), MusicXML (`.xml`, `.musicxml`), and compressed MusicXML (`.mxl`), through file selection or drag and drop.
- **Synchronized performance:** paper movement, synthesized sound, and key highlights share one timeline.
- **Playback controls:** play, pause, seek, rewind, speed, volume, and mute. Space toggles playback.
- **Local processing:** scores are parsed in the browser without uploading them to a server.
- **Responsive interaction:** responsive layout, keyboard controls, and support for reduced-motion preferences.

## Run locally

Requires Node.js and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed in your terminal.

## Build and deploy

```sh
npm run build
```

The build output is written to `dist/` and can be deployed to a static hosting service. `.openai/hosting.json` retains this project's existing Sites deployment configuration.

## Score parsing and playback scope

MIDI preserves note timing, velocity, and tempo changes, excluding percussion tracks. MusicXML supports divisions, rests, chords, multiple voices, backup/forward timing, tempo changes, transposition, ties, repeats, and alternate endings.

Current limitations:

- Audio uses a local piano-like synthesizer rather than acoustic piano samples or a physical pneumatic model.
- MusicXML must use the `score-partwise` format.
- Grace notes, expressive ornaments, D.C./D.S./coda navigation, and pedal markings are not interpreted.
- Only notes within the 88-key range A0–C8 are played.
- Playback pauses when the browser tab is hidden.

## Verification

`qa/browser-check.js` provides a browser verification function covering the default score, 88-key layout, MIDI tempo changes, MusicXML polyphony and ties, repeats and alternate endings, compressed MusicXML, invalid files, file import, and playback controls. Run it through browser script evaluation against the development server.
