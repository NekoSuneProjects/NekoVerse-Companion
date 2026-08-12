# NekoVerse Companion

<p align="center">
  <img src="assets/icon.png" alt="NekoVerse Companion icon" width="220" />
</p>

> A modern Star Citizen desktop companion created by **NekoSuneVR**.

NekoVerse Companion combines Star Citizen status/news, a multilingual Jarvis voice assistant, Verse Guide, Star Citizen UI/flight/targeting shortcuts, FleetYards, marketplace search and conservative hardware-aware optimisation in one desktop app.

**Current source version: v0.1.3**

## v0.1.3 highlights

- **Much more reliable Jarvis microphone listener** — continuous Windows speech recognition replaces the old repeating 3-second recognition windows.
- **Windows default microphone** — NekoVerse follows the current Windows default recording device.
- **Live mic HUD** — when listening, the app shows input level, recognition language, partial words, confidence, wake detection and recognition errors.
- **Near-match Jarvis detection** — a one-character recognition variation can still trigger a wake name of five or more characters.
- **Mouse hotkeys** — `MOUSE1` through `MOUSE5` plus wheel input are supported by the Windows hotkey engine.
- **Targeting voice controls** — `Jarvis, lock on`, `next hostile`, target-selection slots and countermeasures.
- **Combat/operator mode controls** — SCM/NAV, operator cycle, GUN/MISSILE/SCAN command slots, gimbal and precision targeting.
- **Weapon/missile controls** — weapon groups, missile type/count controls and explicit one-shot `fire`.
- **Quantum voice control** — `Jarvis, quantum jump` / `engage quantum` maps to a configurable hold action.
- **Power-management shortcuts** — weapons, engines/thrusters, shields and reset.
- **Build retries** — transient electron-builder binary-download `EOF` failures are retried automatically.

`Jarvis, fire` sends **one** primary-fire input. NekoVerse deliberately does not implement timed 1–3 minute rapid-fire loops, automatic firing or autonomous target following.

See [`CHANGELOG.md`](CHANGELOG.md) for the complete history from v0.1.0 onward and [`docs/COMMANDS.md`](docs/COMMANDS.md) for the full command catalog.

## Voice examples

```text
Jarvis, request landing
Jarvis, gear down
Jarvis, headlights
Jarvis, open the ramp
Jarvis, open map
Jarvis, open comms
Jarvis, lock on
Jarvis, next hostile
Jarvis, missile operator mode
Jarvis, fire
Jarvis, deploy decoy
Jarvis, power to shields
Jarvis, quantum jump
Jarvis, remove my helmet
Jarvis, call rescue
Jarvis, where is New Babbage?
Jarvis, where can I mine Titanium?
Jarvis, shut up
```

The assistant name can be changed in Settings. Users who prefer direct commands can disable strict wake-word mode.

## Microphone troubleshooting

The Windows listener uses the **Windows default recording device**. When voice listening is active, a small mic HUD displays the input level and what the recognizer thinks it hears.

If the level meter does not move when you speak:

1. Open Windows sound/input settings.
2. Set the microphone you actually use as the **default recording/input device**.
3. Stop and restart NekoVerse voice listening.
4. Say `Jarvis` and watch the live text/level HUD.

If the meter moves but `Jarvis` is transcribed slightly differently, v0.1.3 can accept a one-character near match for wake names of at least five characters.

## Current useful Star Citizen defaults

NekoVerse keeps all bindings editable because Star Citizen supports custom control profiles. Current defaults used by the companion include:

| Action | Default |
|---|---:|
| mobiGlas | `F1` |
| Starmap / Map | `F2` |
| Comms / Contacts | `F11` |
| Personal Inventory | `I` |
| SCM / NAV | `B` |
| Quantum Travel | hold `B` |
| Landing gear | `N` |
| Request landing/takeoff | `LALT+N` |
| Lock / unlock selected target | `F8` |
| Cycle hostile target | `5` |
| Primary fire / missile launch input | `MOUSE1` |
| Secondary fire / missile-type input | `MOUSE2` |
| Missile Operator / operator cycle | `MOUSE3` |
| Increase armed missiles | `G` |
| Reset armed missiles | `LALT+G` |
| Deploy decoy | `H` |
| Deploy noise | `J` |
| Power to weapons | `F5` |
| Power to engines/thrusters | `F6` |
| Power to shields | `F7` |
| Reset power distribution | `F8` |

Some direct GUN/MISSILE/SCAN and UI-page slots are intentionally left blank until the user assigns the matching key from their own Star Citizen control profile.

## Verse Guide

The **Verse Guide** helps new players answer questions such as:

- Where is New Babbage?
- Where is GrimHEX?
- Where can I find Titanium or Quantanium?
- Where can I buy an item or component?
- What planet/moon/station is a location on?

Jarvis uses Star Citizen Wiki API search data to ground location/acquisition answers instead of relying only on the language model.

## Star Citizen UI shortcuts

Jarvis recognizes shortcuts such as:

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

NekoVerse intentionally leaves a UI command blank when it cannot safely assume a dependable direct key for the player's current Star Citizen profile. Configure those entries in **Settings → Voice / hotkey commands**.

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

Supported language presets include English, Spanish, German, Polish, Russian, French, Italian and Portuguese. Common voice actions have localized aliases.

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

NekoVerse is a companion/accessibility tool, not an autonomous game bot. Combat-related voice controls are explicit single key/mouse inputs or mode-selection shortcuts. It does not implement aim/recoil assistance, timed rapid-fire loops, automatic firing, autonomous target following, unattended navigation/combat, memory/process injection, packet manipulation or anti-cheat bypasses.

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

The GitHub Actions workflow builds Windows and Linux first, creates checksums, and then attempts to publish a GitHub Release. Release bodies are generated from the matching version section of `CHANGELOG.md`, with one compare link rather than duplicate `Full Changelog` lines.

`electron-builder` always runs with `--publish never`; GitHub publishing is kept separate from package generation so builds do not require a personal `GH_TOKEN`.

The repository/organization must permit the GitHub Actions integration to create releases. If an organization policy blocks release creation, the build artifacts still complete but the final release API call will be rejected by GitHub until that Actions/repository permission is enabled.

## Credits

Created and maintained by **[NekoSuneVR](https://github.com/NekoSuneVR)**.

This is an unofficial community project and is not affiliated with, endorsed by, or sponsored by Cloud Imperium Games or Roberts Space Industries. Star Citizen and related marks/assets belong to their respective owners.

## License

MIT © 2026 NekoSuneVR
