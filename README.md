<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# geminiDAW

Browser-based DAW prototype with a step sequencer, piano roll, MIDI input support, and Tone.js synth engines.

View your app in AI Studio: https://ai.studio/apps/19aa1d13-78fb-4672-98ee-ba1fe5c9a08f

## Local setup

Prerequisites: Node.js 20+

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Build for production:
   `npm run build`
4. Run the type check:
   `npm run lint`

## Recent improvements

- Local project restore runs automatically on app load.
- Keyboard shortcuts: `Space` toggles playback, `Ctrl+S` or `Cmd+S` saves locally.
- Pattern length can be switched between `16`, `32`, and `64` steps.
- Projects can be exported to JSON and imported back into the app.
- Synth catalog is cleaned up and shared across the UI for easier maintenance.
- Channel ids now use `crypto.randomUUID()` for more reliable state handling.
