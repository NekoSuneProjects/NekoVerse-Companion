# NekoVerse Companion

> A modern Star Citizen desktop companion created by **NekoSuneVR**.

NekoVerse Companion brings the things you normally keep in separate tabs into one green sci-fi command deck: current LIVE/PTU state, a news feed, FleetYards ship search, voice-triggered utility hotkeys, hardware-aware graphics recommendations, and a cautious third-party marketplace finder.

**Status:** early public MVP / v0.1.0

## Highlights

- **LIVE + PTU status** – refreshes the current Star Citizen channel state from RSI support data and keeps a conservative fallback for offline periods.
- **News deck** – retrieves Comm-Link data through the Star Citizen Wiki API/RSI archive mirror and opens the original source externally.
- **Neko voice assistant** – Windows speech recognition + TTS, wake words, typed chat, and an optional OpenAI-compatible endpoint for richer answers.
- **Voice utility controls** – say phrases such as “Neko, request landing” and map them to your own one-shot Star Citizen hotkeys.
- **FleetYards search** – searches the public FleetYards ship database and opens full model pages.
- **Marketplace finder** – deep-searches public Star Hangar, Space Foundry and The Impound results with an LTI text filter and a prominent grey-market warning.
- **Adaptive optimizer** – detects CPU/GPU/RAM/VRAM, recommends a performance tier and can safely change the local renderer setting with a timestamped backup.
- **Modern UI** – React + Tailwind CSS, dark green HUD styling inspired by space-sim cockpit interfaces without shipping copyrighted Star Citizen artwork.
- **Windows builds** – GitHub Actions builds NSIS + portable packages and publishes tag releases.

## Important fair-play boundary

NekoVerse is a **companion/accessibility tool**, not a bot or cheat. Voice commands only trigger user-configured one-shot hotkeys. It does not implement combat automation, aim/recoil assistance, unattended loops, memory/process injection, packet manipulation or anti-cheat bypasses. See `docs/SECURITY.md`.

## Marketplace warning

Third-party pledge stores are a grey market. They are not CIG/RSI-supported purchases, and NekoVerse does **not** call a store “safe”. The app only searches public listings and opens the seller page. Confirm the exact pledge, insurance (including LTI), seller, escrow/refund rules and transfer yourself. See `docs/MARKETPLACE.md`.

## Optimizer philosophy

Star Citizen changes frequently, and aggressive “FPS tweak packs” can make a machine less stable. NekoVerse therefore uses a reversible approach:

1. Detect hardware.
2. Recommend renderer, upscaler, texture, cloud and resolution choices.
3. If you click **Apply safe renderer profile**, back up `GraphicsSettings.json` and modify only the renderer field.
4. Keep the rest as visible in-game recommendations rather than writing undocumented CVars.
5. **Restore backup** puts the latest NekoVerse backup back in place.

## Setup

Requirements:
- Windows 10/11 for hardware scan, System.Speech voice input/output and hotkey output.
- Node.js 22 for development/building.
- Star Citizen installed only if you want optimizer/hotkey features.

```bash
npm install
npm run dev
```

Build Windows installer + portable executable:

```bash
npm run check
npm run dist
```

Outputs are written to `release/`.

## Configure voice commands

Open **Settings → Utility hotkeys** and make the hotkeys match your own Star Citizen keybinds. Blank bindings are disabled. NekoVerse deliberately does not assume an ATC/landing hotkey because player mappings can differ.

Default wake words are `neko`, `nekoverse`, and `computer`.

Example:
- Configure **Request landing / ATC** to the single key/combo you use in-game.
- Focus Star Citizen.
- Start the voice listener.
- Say: **“Neko, request landing.”**

## Optional AI endpoint

The built-in intent engine works without a cloud model. In Settings you can optionally enable any compatible `/chat/completions` endpoint by supplying its base URL, model and optional API key. The system prompt always identifies the tool creator as **NekoSuneVR** and keeps automation inside the fair-play boundary.

## Data integrations

- RSI support / Star Citizen website – current channel status and original source links.
- Star Citizen Wiki API – community API over RSI archive/game data.
- FleetYards – public ship database/API.
- Star Hangar, Space Foundry and The Impound – public third-party listing search only; no account or purchasing integration.

NekoVerse caches no RSI login credentials and does not attempt to access private account data.

## Credits

Created by **NekoSuneVR**.

This is an unofficial community project and is not affiliated with, endorsed by, or sponsored by Cloud Imperium Games or Roberts Space Industries.

## License

MIT © 2026 NekoSuneVR
