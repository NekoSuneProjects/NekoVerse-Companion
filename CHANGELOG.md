# Changelog

All notable NekoVerse Companion changes are documented here.

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
- **Improved automatic Star Citizen install discovery.** Detection now considers:
  - A user override, if configured.
  - A running `StarCitizen.exe` process.
  - RSI Launcher AppData configuration/log hints.
  - Windows uninstall/installation registry entries.
  - Program Files / Roberts Space Industries locations.
  - Common game/library folders across mounted Windows drive letters.
  - Candidate locations are verified by real Star Citizen channel contents before use.

### Changed

- App version bumped to **0.1.1**.
- Old default wake words (`neko`, `nekoverse`, `computer`) migrate to **Jarvis**.
- Voice commands now default to strict wake-word mode, so examples become `Jarvis, request landing`, `Jarvis, gear down`, etc. Users can disable strict mode in Settings if desired.
- Ollama remains native and defaults to `https://ollama.nekosunevr.co.uk` with `qwen2.5:3b`.
- Release workflow now accepts generic `release-vX.Y.Z` release commits as well as ordinary `v*` tags.

### Build targets

- Windows x64 NSIS installer
- Windows x64 portable EXE
- Linux AMD64 AppImage
- Linux AMD64 DEB
- SHA-256 release checksums
