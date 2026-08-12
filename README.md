# NekoVerse Companion

<p align="center">
  <img src="assets/icon.png" alt="NekoVerse Companion icon" width="220" />
</p>

> A modern Star Citizen desktop companion created by **NekoSuneVR**.

NekoVerse Companion combines Star Citizen status/news, a multilingual Jarvis voice assistant, new-player Verse Guide, Star Citizen UI shortcuts, FleetYards, marketplace search and conservative hardware-aware optimisation in one desktop app.

**Current source version: v0.1.2**

## Highlights

- **Jarvis wake word by default** — easy to pronounce and fully customizable.
- **Strict wake-word voice mode** — examples: `Jarvis, request landing`, `Jarvis, gear down`, `Jarvis, headlights`, `Jarvis, call rescue`.
- **Wake confirmation sound** and an approximately 8-second follow-up listening window.
- **Speech interrupt** — `Jarvis, shut up` and supported-language equivalents stop current TTS.
- **One request at a time** — prevents microphone/TTS command spam.
- **Verse Guide** — Star Citizen Wiki API-backed location/item/commodity/ore/ship/mission help for new players.
- **Multilingual UI + Jarvis** — English, Spanish, German, Polish, Russian, French, Italian and Portuguese.
- **Native Ollama** — defaults to `https://ollama.nekosunevr.co.uk` and `qwen2.5:3b`, with `/api/tags` model discovery and `/api/chat` assistant responses.
- **Automatic Star Citizen install detection** — running process, RSI Launcher hints, registry entries and common game-library locations across mounted drives.
- **SQLite settings** — stored under Electron's AppData/user-data folder as `nekoverse.sqlite`.
- **Automatic app update checker** — checks GitHub Releases at startup and every 5 minutes while running, then shows a bottom-right update card.
- **Windows x64 + Linux AMD64 builds** — NSIS installer, portable EXE, AppImage, DEB and SHA-256 checksums.

See [`CHANGELOG.md`](CHANGELOG.md) for the complete history from v0.1.0 onward.

## v0.1.2 — Star Citizen UI shortcuts

Jarvis can now recognize shorter UI commands such as:

```text
Jarvis, open mobiGlas
Jarvis, open map
Jarvis, open starmap
Jarvis, open comms
Jarvis, open contacts
Jarvis, open contracts
Jarvis, open missions
Jarvis, open inventory
Jarvis, open chat
Jarvis, open journal
Jarvis, open vehicle manager
```

Useful defaults:

| UI action | Default |
|---|---:|
| mobiGlas | `F1` |
| Starmap / Map | `F2` |
| Comms / Contacts | `F11` |
| Personal Inventory | `I` |
| Text Chat | `ENTER` |
| Contracts Manager | User-bindable |
| Journal | User-bindable |
| Vehicle Manager / Loadout | User-bindable |

NekoVerse intentionally leaves a UI command blank when it cannot safely assume a dependable direct key for the player's current Star Citizen profile. Configure those entries in **Settings → Voice / hotkey commands**.

## Voice examples

```text
Jarvis, request landing
Jarvis, gear down
Jarvis, headlights
Jarvis, open the ramp
Jarvis, open map
Jarvis, open comms
Jarvis, remove my helmet
Jarvis, call rescue
Jarvis, where is New Babbage?
Jarvis, where can I mine Titanium?
Jarvis, shut up
```

The assistant name can be changed in Settings. Users who prefer direct commands can disable strict wake-word mode.

See [`docs/COMMANDS.md`](docs/COMMANDS.md) for the complete command catalog.

## Verse Guide

The **Verse Guide** page helps new players answer questions such as:

- Where is New Babbage?
- Where is GrimHEX?
- Where can I find Titanium or Quantanium?
- Where can I buy an item or component?
- What planet/moon/station is a location on?

Jarvis uses the same Star Citizen Wiki API search data to ground location/acquisition answers instead of relying only on the language model.

## Automatic Star Citizen install detection

Detection checks:

1. A manual override if configured.
2. A running `StarCitizen.exe` process.
3. RSI Launcher AppData/config/log hints.
4. Windows registry/uninstall installation entries.
5. Common Roberts Space Industries / game-library folders across mounted drive letters.
6. The candidate folder for real Star Citizen channel/game files before accepting it.

The optimizer separately finds the newest `%LOCALAPPDATA%\Star Citizen\starcitizen_*\GraphicsSettings\GraphicsSettings.json` profile.

## Optimizer philosophy

NekoVerse deliberately applies only conservative, reversible settings. It backs up `GraphicsSettings.json` before changing the renderer and avoids aggressive registry/service tweak packs or undocumented CVars.

## Language and speech

The first launch asks for a language; it can be changed later in Settings. On Windows, NekoVerse requests the matching `System.Speech` recognition culture and falls back to Windows' default recognizer if that speech pack is unavailable.

## Application data

Persistent settings are stored in SQLite under Electron's app user-data directory. On normal Windows installs this is the NekoVerse Companion AppData folder and contains:

```text
nekoverse.sqlite
```

Existing v0.1.0 JSON settings are imported automatically by newer builds.

## Ollama

Default configuration:

```text
Server: https://ollama.nekosunevr.co.uk
Model:  qwen2.5:3b
```

The app scans `/api/tags` for models and uses native `/api/chat` for assistant responses. Embedding-only models remain excluded from chat selection.

## Marketplace warning

Third-party pledge stores are a grey market and are not supported by CIG/RSI. NekoVerse only searches public listings and opens external result pages. Verify the item, insurance, seller, refund/escrow conditions and transfer yourself.

## Fair-play boundary

NekoVerse is a companion/accessibility tool, not an autonomous game bot. Voice actions map to explicit user-configured one-shot/hold key actions. It does not implement aim assistance, combat automation, unattended navigation/play, memory/process injection, packet manipulation or anti-cheat bypasses.

## Development

Requirements:

- Node.js 22
- Windows 10/11 for built-in `System.Speech` voice/hotkey features
- Linux AMD64 supported for desktop UI and Linux package builds

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

## Releases and changelogs

The GitHub Actions workflow builds Windows and Linux first, then publishes the release only after both succeed.

Future release bodies are generated from the matching version section of `CHANGELOG.md`, with one compare link:

```text
Full Changelog: .../compare/vPREVIOUS...vCURRENT
```

This avoids duplicate `Full Changelog` entries. Release commits such as `release-v0.1.2` get their own concurrency group so ordinary later `main` pushes do not cancel a release already being published.

`electron-builder` always runs with `--publish never`; the final GitHub Actions release job uploads the packages. This avoids requiring `GH_TOKEN` during packaging.

## Credits

Created and maintained by **[NekoSuneVR](https://github.com/NekoSuneVR)**.

This is an unofficial community project and is not affiliated with, endorsed by, or sponsored by Cloud Imperium Games or Roberts Space Industries. Star Citizen and related marks/assets belong to their respective owners.

## License

MIT © 2026 NekoSuneVR
