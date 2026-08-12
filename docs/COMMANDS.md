# NekoVerse Companion Voice Command Catalog

NekoVerse maps spoken/typed phrases to **user-configured Star Citizen hotkeys**. It is an accessibility/companion layer, not an autonomous pilot.

## How commands work

1. Configure the matching keybind in **Settings → Voice / hotkey commands**.
2. Start the voice listener.
3. Say the configured wake name. The default is `Jarvis`.
4. After the confirmation tone, say the command. You can also say the wake name and command in one phrase.
5. NekoVerse sends one configured keyboard action to Windows.

Examples:

- `Jarvis, request landing`
- `Jarvis, gear down`
- `Jarvis, headlights on`
- `Jarvis, open the ramp`
- `Jarvis, engage quantum`
- `Jarvis, open map`
- `Jarvis, open comms`
- `Jarvis, open contracts`
- `Jarvis, open inventory`
- `Jarvis, open chat`
- `Jarvis, cruise control`
- `Jarvis, remove my helmet`
- `Jarvis, call rescue`
- `Jarvis, send SOS`

The wake name is customizable. Strict wake-word mode is enabled by default.

## Current command groups

### Flight & Landing

- Request landing / takeoff (ATC)
- Request docking / undocking
- Landing gear toggle
- VTOL toggle
- Precision mode toggle
- Gravity compensation toggle

### Ship Systems

- Flight ready
- Ship power
- Engine power
- Shield power
- Weapon-system power
- Exterior/head lights
- Cockpit/interior lights

### Ship Access & Configuration

- Ship doors
- Ramp
- Canopy
- Exit seat
- Wings / configuration mode

### Navigation

- NAV / Quantum mode
- Quantum engage

### mobiGlas & UI

NekoVerse v0.1.2 adds explicit AI/voice shortcuts for Star Citizen interface screens:

- **mobiGlas** — default `F1`
- **Starmap / Map** — default `F2`; accepts phrases such as `open map`, `show map`, and `open starmap`
- **Comms / Contacts** — default `F11`
- **Contracts Manager / Missions** — user-bindable; intentionally blank by default if no dependable direct key is available in the player's profile
- **Personal Inventory** — default `I`
- **Text Chat** — default `ENTER`
- **Journal** — user-bindable
- **Vehicle Manager / Vehicle Loadout** — user-bindable

Commands with blank defaults still work as AI intents, but NekoVerse will tell the user that the command needs a hotkey assigned instead of sending a guessed key.

### Flight Movement

- Cruise control
- Coupled / decoupled mode
- Speed limiter increase/decrease
- Throttle/target-speed increase/decrease
- Space brake
- Boost

Movement commands are deliberately single explicit actions. NekoVerse does not implement autonomous course flying, automated landing paths, combat manoeuvres, or unattended navigation.

### Scanning & Industrial

- Scanning mode
- Scanner/radar ping
- Mining mode
- Salvage mode
- Tractor-beam mode

### Ground Vehicles

- Ground vehicle power
- Headlights
- Horn
- Cruise control
- Brake / handbrake
- Speed limiter increase/decrease

The companion does not continuously steer or drive a route by itself.

### Camera & Comms

- Third-person camera
- Freelook
- Head tracking
- VOIP toggle
- Push-to-talk hold action

### On Foot

- Helmet attach/remove
- Personal flashlight
- Interaction mode
- Holster/unholster

### Medical / SOS

- Medpen / medical item
- SOS / Rescue Beacon

The Rescue Beacon command is configured as a **hold action** because it may require a held input depending on the player's current Star Citizen binding/profile.

## Default bindings included

Every entry can be changed or blanked in Settings. NekoVerse avoids inventing direct keys for UI screens where a dependable direct binding is not available.

- Request landing/takeoff: `LALT+N`
- Request docking/undocking: `RALT+N`
- Landing gear: `N`
- Flight ready: `RALT+R`
- Ship power: `U`
- Weapon-system power: `P`
- Exterior/head lights: `L`
- NAV/Quantum mode: `B`
- mobiGlas: `F1`
- Starmap / Map: `F2`
- Comms / Contacts: `F11`
- Personal Inventory: `I`
- Text Chat: `ENTER`
- Cruise control: `LALT+C`
- Space brake: `X`
- Third person: `F4`
- Personal light: `T`
- Interaction mode: `F`
- Rescue Beacon: hold `M`

Star Citizen bindings change over time and can be customized by the player. Treat these defaults as a starting point and match NekoVerse to your actual in-game profile.

## Multilingual commands

Common commands and UI shortcuts have localized aliases for the app's supported language presets, including English, Spanish, German, Polish, Russian, French, Italian and Portuguese. The underlying command ID remains the same, so all languages use the user's configured hotkey.

## Hold actions

Each command can contain:

```json
{
  "combo": "M",
  "mode": "hold",
  "holdMs": 1400
}
```

The Windows hotkey engine supports hold durations from 35 ms up to 10 seconds. This is intended for explicit actions such as a rescue beacon or push-to-talk, not unattended gameplay loops.

## Supported key names

- `A-Z`
- `0-9`
- `F1-F12`
- `CTRL`, `LCTRL`, `RCTRL`
- `ALT`, `LALT`, `RALT`
- `SHIFT`, `LSHIFT`, `RSHIFT`
- `WIN`, `LWIN`, `RWIN`
- `ENTER`, `ESC`, `TAB`, `SPACE`, `BACKSPACE`, `DELETE`, `INSERT`
- `HOME`, `END`, `PAGEUP`, `PAGEDOWN`
- `LEFT`, `RIGHT`, `UP`, `DOWN`
- `NUM0-NUM9`, `MULTIPLY`, `ADD`, `SUBTRACT`, `DECIMAL`, `DIVIDE`

Use `+` to form combinations, for example `LALT+N` or `CTRL+SHIFT+F7`.

## Fair-play boundary

NekoVerse intentionally does **not** provide:

- aim or recoil assistance
- automatic firing or targeting
- combat rotations
- autonomous travel/navigation
- automated trade/mining/salvage loops
- memory/process injection
- packet manipulation
- anti-cheat bypasses

The goal is fast voice-access to controls you could already press yourself.
