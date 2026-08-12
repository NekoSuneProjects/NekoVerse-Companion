# NekoVerse Companion

<p align="center">
  <img src="assets/icon.png" alt="NekoVerse Companion icon" width="220" />
</p>

> A modern Star Citizen desktop companion created by **NekoSuneVR**.

NekoVerse Companion combines Star Citizen status/news, a multilingual Jarvis voice assistant, new-player location help, FleetYards, marketplace search and conservative hardware-aware optimisation in one desktop app.

**Current version: v0.1.1**

## v0.1.1 highlights

- **Jarvis wake word by default** – easy to pronounce and fully customizable.
- **Wake word applies to voice commands by default** – examples: `Jarvis, request landing`, `Jarvis, gear down`, `Jarvis, headlights`, `Jarvis, call rescue`.
- **Wake confirmation sound** – a short two-tone beep confirms Jarvis was heard.
- **8-second wake window** – say only `Jarvis`, hear the tone, then ask the question.
- **Speech interrupt** – say `Jarvis, shut up`, `stop talking`, or supported-language equivalents to stop TTS immediately.
- **One request at a time** – assistant and microphone requests are locked so speech recognition/TTS cannot spam the same action repeatedly.
- **Verse Guide** – search Star Citizen Wiki API data for cities, stations, ores, commodities, items, ships and missions. Jarvis uses this data when answering new-player location/acquisition questions.
- **Multilingual first-run setup** – English, Spanish, German, Polish, Russian, French, Italian and Portuguese.
- **Multilingual Jarvis** – replies in the selected language and requests the matching Windows speech-recognition culture when available.
- **Multilingual command aliases** – common landing, docking, lighting, access, quantum, navigation, mining, vehicle, helmet, inventory and rescue commands support multiple languages.
- **Automatic Star Citizen install detection** – checks the running game, RSI Launcher hints, registry entries, Program Files and common library paths across mounted drives before falling back to a manual path.
- **SQLite settings storage** – `%APPDATA%\NekoVerse Companion\nekoverse.sqlite` on Windows. Existing v0.1.0 JSON settings are imported automatically.
- **Automatic app update checker** – checks the latest GitHub Release shortly after startup and every 5 minutes while the app is running. A bottom-right card appears when a newer version is available and opens that release when clicked.
- **Native Ollama** – defaults to `https://ollama.nekosunevr.co.uk` with `qwen2.5:3b`; model discovery uses `/api/tags` and chat uses `/api/chat`.
- **Windows x64 + Linux AMD64 releases** – NSIS installer, portable EXE, AppImage, DEB and SHA-256 checksums.

See [`CHANGELOG.md`](CHANGELOG.md) for the full v0.1.1 changelog.

## Voice examples

With the default strict wake-word setting enabled:

```text
Jarvis, request landing
Jarvis, gear down
Jarvis, headlights
Jarvis, open the ramp
Jarvis, remove my helmet
Jarvis, call rescue
Jarvis, where is New Babbage?
Jarvis, where can I mine Titanium?
Jarvis, shut up
```

The assistant name can be changed in **Settings → Wake word / assistant name**. Users who prefer direct commands can disable strict wake-word mode in Settings.

## Verse Guide

The **Verse Guide** page is intended to help new players answer questions such as:

- Where is New Babbage?
- Where is GrimHEX?
- Where can I find Titanium or Quantanium?
- Where can I buy an item or component?
- What planet/moon/station is a location on?

Jarvis can use the same live Star Citizen Wiki API search data to ground its answers instead of relying only on the language model.

## Automatic Star Citizen install detection

The optimizer no longer guesses only a few fixed drive paths. It attempts, in order:

1. A manual override if the user configured one.
2. A running `StarCitizen.exe` process.
3. RSI Launcher AppData/config/log hints.
4. Windows registry/uninstall installation entries.
5. Common Roberts Space Industries / game-library folders across mounted drive letters.
6. Validation that the candidate actually contains Star Citizen channel data such as LIVE/PTU and game files.

The graphics settings detector separately finds the newest Star Citizen graphics profile under `%LOCALAPPDATA%\Star Citizen\starcitizen_*\GraphicsSettings\GraphicsSettings.json`.

## Optimizer philosophy

NekoVerse deliberately applies only conservative, reversible settings. It backs up `GraphicsSettings.json` before changing the renderer and avoids aggressive registry/service tweak packs or undocumented CVars.

## Language and speech

On first launch, NekoVerse asks for a language. It can be changed at any time in Settings.

Supported UI/Jarvis language presets in v0.1.1:

- English
- Español
- Deutsch
- Polski
- Русский
- Français
- Italiano
- Português

On Windows, NekoVerse requests the selected System.Speech recognizer culture. If that Windows speech pack is unavailable, it falls back to the Windows default recognizer.

## Application data

NekoVerse stores its persistent application settings in SQLite:

```text
%APPDATA%\NekoVerse Companion\nekoverse.sqlite
```

This includes language, onboarding state, wake-word configuration, hotkey mappings, Ollama settings and other app preferences. Existing `settings.json` data from v0.1.0 is imported automatically when v0.1.1 first starts.

## Ollama

Default server/model:

```text
Server: https://ollama.nekosunevr.co.uk
Model:  qwen2.5:3b
```

The app can scan the configured server for currently available chat models and switch models in Settings. Embedding-only models are not offered as chat choices.

## Fair-play boundary

NekoVerse is a companion/accessibility tool, not a cheat or autonomous game bot. Voice actions map to explicit user-configured one-shot/hold key actions. It does not implement aim assistance, combat automation, unattended navigation/play, memory/process injection, packet manipulation or anti-cheat bypasses.

## Marketplace warning

Third-party pledge stores are a grey market and are not supported by CIG/RSI. NekoVerse only searches public listings and opens external result pages. Verify the item, insurance, seller, refund/escrow conditions and transfer yourself.

## Development

Requirements:

- Node.js 22
- Windows 10/11 for built-in System.Speech voice/hotkey features
- Linux AMD64 supported for the desktop UI and Linux package builds

```bash
npm install
npm run check
npm run dev
```

Windows x64:

```bash
npm run dist:win:x64
```

Linux AMD64:

```bash
npm run dist:linux:x64
```

## Releases

Normal `v*` tags build and publish releases. The workflow can also create a release from a commit whose message starts with `release-vX.Y.Z`, which is used when the connected GitHub tool cannot directly create a tag reference.

The release job publishes:

- Windows x64 NSIS installer
- Windows x64 portable EXE
- Linux AMD64 AppImage
- Linux AMD64 DEB
- `SHA256SUMS.txt`
- Generated GitHub release notes

`electron-builder` always runs with `--publish never`; only the final GitHub Actions release job performs publishing.

## Credits

Created by **NekoSuneVR**.

This is an unofficial community project and is not affiliated with, endorsed by, or sponsored by Cloud Imperium Games or Roberts Space Industries. Star Citizen and related marks/assets belong to their respective owners.

## License

MIT © 2026 NekoSuneVR
