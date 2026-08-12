# NekoVerse Companion Voice Command Catalog

NekoVerse maps spoken/typed phrases to **user-configured Star Citizen hotkeys**. It is an accessibility/companion layer, not an autonomous pilot.

## How commands work

1. Configure the matching keybind in **Settings → Utility hotkeys**.
2. Start the voice listener.
3. Say a wake word such as `Neko` followed by the command.
4. NekoVerse sends one configured keyboard action to Windows.

Examples:

- `Neko, request landing`
- `Neko, gear down`
- `Neko, headlights on`
- `Neko, open the ramp`
- `Neko, engage quantum`
- `Neko, open the starmap`
- `Neko, cruise control`
- `Neko, remove my helmet`
- `Neko, call rescue`
- `Neko, send SOS`

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
- Starmap
- mobiGlas

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
- Comms / Contacts
- VOIP toggle
- Push-to-talk hold action

### On Foot

- Helmet attach/remove
- Personal flashlight
- Inventory
- Interaction mode
- Holster/unholster

### Medical / SOS

- Medpen / medical item
- SOS / Rescue Beacon
- Contracts Manager

The Rescue Beacon command is configured as a **hold action** because current Star Citizen medical guidance uses a held `M` input while incapacitated.

## Default bindings included

NekoVerse ships only a small number of useful defaults where the binding is established/current enough to be helpful. Every entry can be changed or blanked in Settings.

- Request landing/takeoff: `LALT+N`
- Request docking/undocking: `RALT+N`
- Landing gear: `N`
- Flight ready: `RALT+R`
- Ship power: `U`
- Weapon-system power: `P`
- Exterior/head lights: `L`
- NAV/Quantum mode: `B`
- Starmap: `F2`
- mobiGlas: `F1`
- Cruise control: `LALT+C`
- Space brake: `X`
- Third person: `F4`
- Comms: `F11`
- Personal light: `T`
- Inventory: `I`
- Interaction mode: `F`
- Rescue Beacon: hold `M`

Star Citizen bindings change over time and can be customized by the player. Treat these defaults as a starting point and match NekoVerse to your actual in-game profile.

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
