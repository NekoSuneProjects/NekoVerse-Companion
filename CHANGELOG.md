# Changelog

All notable changes to **NekoVerse Companion** are documented here. Releases are maintained by [NekoSuneVR](https://github.com/NekoSuneVR).

## 0.1.3 — Microphone Reliability, Targeting & Combat Controls

### Added

- **Continuous Windows speech recognition** for the Jarvis listener.
  - Replaces the old repeating 3-second `Recognize()` loop that could leave short gaps and miss a fast wake word.
  - Uses asynchronous continuous recognition against the current Windows default recording device.
  - Emits microphone level, partial speech hypotheses, final recognized text, confidence, selected recognizer culture, fallback state and recognizer errors to the Electron renderer bridge.
- **More tolerant Jarvis wake matching.** Wake names of at least five characters can accept a one-character speech-recognition variation such as a nearby vowel/consonant result while still requiring an explicit wake word in strict mode.
- **Expanded mouse-output support** in the Windows hotkey engine:
  - Left mouse / `MOUSE1`
  - Right mouse / `MOUSE2`
  - Middle mouse / `MOUSE3`
  - Mouse buttons 4/5
  - Mouse wheel up/down
- **Combat & Operator Modes** command group with configurable voice actions for:
  - SCM / NAV Master Mode
  - Operator-mode cycling
  - GUN mode
  - Missile mode
  - Scan operator mode
  - Gimbal mode
  - Precision targeting
- **Weapons & Missiles** command group with configurable shortcuts for:
  - Weapon groups 1/2/3
  - Next weapon group
  - Missile type next/previous
  - Armed missile count up/down/reset
- **Targeting & Defense** command group with configurable shortcuts for:
  - Lock / unlock the selected target
  - Cycle the next hostile target
  - Target under reticle / nearest hostile / hostile cycling slots
  - Clear target
  - Decoy and noise countermeasures
- **Power Management** shortcuts for weapon, engine/thruster and shield power priority plus reset.
- **Explicit one-shot `fire` command.** `Jarvis, fire` sends one primary-fire input (`MOUSE1`). In a mode where Star Citizen maps that input to missile launch, it remains one explicit launch input; in gun mode it remains one short user-triggered input rather than a timed firing loop.
- **Explicit one-shot secondary-fire command** mapped to `MOUSE2` by default.
- **Current control-reference defaults** added where a recent 2026 Star Citizen control reference provides a dependable binding:
  - Target lock/unlock: `F8`
  - Cycle hostiles: `5`
  - Primary fire / missile launch input: `MOUSE1`
  - Secondary fire / missile type input: `MOUSE2`
  - Missile Operator Mode: `MOUSE3`
  - Increase armed missiles: `G`
  - Reset armed missiles: `LALT+G`
  - Decoy: `H`
  - Noise: `J`
  - Power priority: `F5` / `F6` / `F7`
  - Power reset: `F8`
- **Quantum Travel hold command** for phrases such as `Jarvis, quantum jump` and `Jarvis, engage quantum`, with a configurable hold action.
- **Auto-land hold command** as a separate configurable voice action.
- Automatic retry logic around electron-builder packaging so transient GitHub/electron-builder binary CDN `EOF` download failures do not immediately kill a release build.

### Fixed

- Jarvis wake detection is substantially less likely to miss short utterances because recognition no longer stops and restarts every few seconds.
- Voice output uses the selected application language consistently when spoken from both voice and typed assistant requests.
- The app now exposes recognizer diagnostics through the preload/API bridge for UI troubleshooting.
- Target/fire/quantum phrases are matched before broad legacy aliases so `fire`, `lock on`, and `quantum jump` resolve to the intended explicit actions.

### Safety / scope

- Combat controls remain **explicit one-shot user actions** or normal mode-selection shortcuts.
- NekoVerse does **not** add 1–3 minute rapid-fire loops, automatic firing, autonomous target following, aim/recoil assistance, unattended combat, memory/process injection, packet manipulation, or anti-cheat bypass behavior.

### Changed

- App version bumped to **0.1.3**.
- The assistant system prompt now documents that combat commands are limited to explicit single inputs and mode/target selection.

### Build targets

- Windows x64 NSIS installer
- Windows x64 portable EXE
- Linux AMD64 AppImage
- Linux AMD64 DEB
- SHA-256 release checksums

## 0.1.2 — Release Notes & Star Citizen UI Shortcuts

### Added

- **Expanded Jarvis / AI UI shortcuts** for Star Citizen interface screens.
  - `Jarvis, open mobiGlas` → mobiGlas (`F1` default).
  - `Jarvis, open map` / `open starmap` → Starmap (`F2` default).
  - `Jarvis, open comms` / `open contacts` → Comms (`F11` default).
  - `Jarvis, open contracts` / `open missions` → Contracts Manager command slot.
  - `Jarvis, open inventory` → Personal Inventory (`I` default).
  - `Jarvis, open chat` → Text Chat (`ENTER` default).
  - New user-bindable Journal and Vehicle Manager / Vehicle Loadout command slots.
- **Multilingual aliases for the new UI shortcuts** across Spanish, German, Polish, Russian, French, Italian and Portuguese.
- **Safer blank defaults for UI pages without a dependable direct key.** Contracts, Journal and Vehicle Manager remain configurable rather than pretending another key opens the exact requested page.

### Fixed

- **GitHub Release changelog formatting.** Releases no longer rely on the sparse GitHub-generated body that could produce duplicate or unhelpful `Full Changelog` text.
- Release publishing now extracts the matching version section directly from this `CHANGELOG.md`.
- Each release adds exactly **one** compare link in the form `vPrevious...vCurrent`.
- Release notes explicitly credit [NekoSuneVR](https://github.com/NekoSuneVR) while still using GitHub Actions for token-free automated publishing.
- Release workflow concurrency now gives release commits/tags their own group so a later normal `main` push cannot cancel an active release publication.

### Changed

- App version bumped to **0.1.2**.
- `mobiGlas`, Starmap, Comms, Contracts, Inventory, Text Chat, Journal and Vehicle Manager commands are grouped together as **mobiGlas & UI** in Settings.
- `open map` and similar shorter natural phrases now map directly to the Starmap shortcut.

### Build targets

- Windows x64 NSIS installer
- Windows x64 portable EXE
- Linux AMD64 AppImage
- Linux AMD64 DEB
- SHA-256 release checksums

## 0.1.1 — Jarvis, Verse Guide & Update System

### Added

- **Automatic update checking** against the latest public GitHub Release.
  - Checks shortly after startup.
  - Re-checks every 5 minutes while the app remains open.
  - Shows a bottom-right update card when a newer release exists.
  - Clicking the update card opens the newest GitHub Release page.
  - A newer version is only notified once per app session to avoid notification spam.
- **Jarvis wake word** as the new easy-to-pronounce default assistant name.
  - Wake name is fully customizable in Settings.
  - Wake word applies to normal voice commands by default.
  - A short two-tone sound confirms that the wake word was heard.
  - Saying only `Jarvis` opens an approximately 8-second listening window for the next phrase.
- **Immediate speech interruption.** Phrases such as `Jarvis, shut up`, `stop talking`, and equivalents in supported languages stop current TTS without waiting for an active AI request to finish.
- **One-request-at-a-time protection** for microphone and typed assistant requests.
  - Duplicate speech intents are ignored briefly after a command completes.
  - TTS remains inside the command lock so its own audio cannot repeatedly retrigger the same action.
- **Verse Guide** powered by the public Star Citizen Wiki API.
  - Search cities, landing zones, stations, items, commodities, ores, ships and missions.
  - Jarvis automatically uses matching Verse Guide data when answering new-player location/acquisition questions.
  - Search results link back to the Star Citizen Wiki source.
- **Multilingual first-run setup and UI language switching.**
  - English
  - Spanish / Español
  - German / Deutsch
  - Polish / Polski
  - Russian / Русский
  - French / Français
  - Italian / Italiano
  - Portuguese / Português
- **Multilingual Jarvis responses.** The configured Ollama model is instructed to answer in the selected app language.
- **Multilingual Windows speech recognition preference.** NekoVerse requests the selected culture and falls back to the Windows default recognizer if that speech pack is not installed.
- **Multilingual command aliases** for common landing, docking, lights, access, quantum, navigation, mining, vehicle, helmet, inventory and rescue actions.
- **SQLite application storage.** Settings are stored in:
  - `%APPDATA%\NekoVerse Companion\nekoverse.sqlite` on Windows.
  - The platform Electron user-data directory on other systems.
  - Existing v0.1.0 `settings.json` data is imported automatically on first launch of v0.1.1.
- **Improved automatic Star Citizen install discovery.** Detection checks a user override, a running `StarCitizen.exe`, RSI Launcher AppData hints, Windows registry entries and common game-library locations across mounted drives, then verifies real channel/game files before accepting the path.
- **Native NekoSuneVR Ollama assistant configuration** with default server `https://ollama.nekosunevr.co.uk`, default model `qwen2.5:3b`, model discovery through `/api/tags`, and chat through Ollama's native `/api/chat` endpoint.

### Fixed

- `npm version --no-git-tag-version` release stamping now allows the same version, preventing the `Version not changed` failure when the checked-in package version already matches the release version.
- Electron Builder is run with `--publish never`, preventing `GH_TOKEN` / GitHub Personal Access Token errors during package generation.
- Release uploads are handled only by the final GitHub Actions release job.

### Changed

- App version bumped to **0.1.1**.
- Old default wake words (`neko`, `nekoverse`, `computer`) migrate to **Jarvis**.
- Voice commands default to strict wake-word mode, so examples become `Jarvis, request landing`, `Jarvis, gear down`, etc. Users can disable strict mode in Settings if desired.
- Release workflow accepts generic `release-vX.Y.Z` release commits as well as ordinary `v*` tags.

### Build targets

- Windows x64 NSIS installer
- Windows x64 portable EXE
- Linux AMD64 AppImage
- Linux AMD64 DEB
- SHA-256 release checksums

## 0.1.0 — First Public MVP

### Added

- First public **NekoVerse Companion** desktop release created by NekoSuneVR.
- Electron + React + Tailwind desktop UI with dark green Star Citizen-inspired HUD styling.
- Star Citizen LIVE/PTU status panel and Comm-Link/news integration.
- Initial Windows voice recognition and text-to-speech support using `System.Speech`.
- Initial assistant intent system with creator attribution and command recognition.
- First flight utility commands including:
  - Request landing / ATC.
  - Landing gear.
  - Exterior/head lights.
  - Doors.
  - NAV / Quantum mode.
- Expanded flight, vehicle, medical/SOS, on-foot and configurable hotkey catalog added during the initial 0.1.0 development cycle.
- FleetYards ship database search.
- Public third-party marketplace searching for Star Hangar, Space Foundry and The Impound, including an LTI text filter and grey-market warning.
- Hardware detection for CPU, GPU, RAM and VRAM.
- Conservative Star Citizen optimizer recommendations with `GraphicsSettings.json` backup/restore and safe renderer switching.
- Windows x64 NSIS installer and portable EXE packaging.
- Linux AMD64 AppImage and DEB packaging.
- GitHub Actions artifact builds and automated GitHub Release publishing.
- NekoVerse application icon/branding and creator credit for NekoSuneVR.

### Safety / scope

- Voice/hotkey actions are explicit one-shot or user-configured hold actions.
- No autonomous navigation, combat automation, aim/recoil assistance, process/memory injection, packet manipulation or anti-cheat bypass behavior.

### Build targets

- Windows x64 NSIS installer
- Windows x64 portable EXE
- Linux AMD64 AppImage
- Linux AMD64 DEB
