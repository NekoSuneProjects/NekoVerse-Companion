# NekoVerse Companion Voice Command Catalog

NekoVerse maps spoken/typed phrases to **user-configured Star Citizen hotkeys**. It is an accessibility/companion layer, not an autonomous pilot.

## How commands work

1. Configure the matching keybind in **Settings → Voice / hotkey commands**.
2. Start the voice listener.
3. Say the configured wake name. The default is `Jarvis`.
4. After the confirmation tone, say the command. You can also say the wake name and command in one phrase.
5. NekoVerse sends one configured keyboard/mouse action to Windows.

Examples:

- `Jarvis, request landing`
- `Jarvis, gear down`
- `Jarvis, headlights on`
- `Jarvis, open the ramp`
- `Jarvis, engage quantum`
- `Jarvis, open map`
- `Jarvis, open comms`
- `Jarvis, open contracts`
- `Jarvis, lock on`
- `Jarvis, next hostile`
- `Jarvis, missile operator mode`
- `Jarvis, fire`
- `Jarvis, deploy decoy`
- `Jarvis, power to shields`
- `Jarvis, remove my helmet`
- `Jarvis, call rescue`
- `Jarvis, send SOS`

The wake name is customizable. Strict wake-word mode is enabled by default.

## Microphone behavior in v0.1.3

NekoVerse now uses **continuous Windows System.Speech recognition** instead of repeatedly opening short recognition windows. This removes the old gaps where a short wake phrase such as `Jarvis` could be missed.

The built-in listener uses the **Windows default recording device**. When the listener is running, a small live microphone HUD shows:

- microphone input level
- recognizer language/culture
- partial text Windows thinks it hears
- final recognition confidence
- whether a fallback speech culture was used
- wake-word match status
- recognition errors

If the level meter does not move when you speak, change the Windows default input device to the microphone you actually use, then restart the listener.

## Current command groups

### Flight & Landing

- Request landing / takeoff (ATC)
- Request docking / undocking
- Landing gear toggle
- VTOL toggle
- Precision mode toggle
- Gravity compensation toggle
- Auto-land hold action

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

- SCM / NAV Master Mode toggle
- Quantum engage / Quantum Travel hold action

Current phrases include:

```text
Jarvis, nav mode
Jarvis, switch to SCM
Jarvis, quantum jump
Jarvis, engage quantum
```

### Combat & Operator Modes

v0.1.3 adds explicit mode-selection shortcuts:

- SCM / NAV Master Mode
- Cycle Operator Mode
- GUN mode command slot
- Missile mode command slot
- Scan operator mode command slot
- Missile Operator Mode toggle
- Gimbal mode
- Precision targeting mode

`Cycle Operator Mode` defaults to `MOUSE3`. Direct GUN/MISSILE/SCAN command slots can remain blank if the player has not assigned a dependable direct key in their own Star Citizen profile.

### Weapons & Missiles

- Fire once / weapon group 1 / launch missile input — `MOUSE1`
- Fire weapon group 2 / secondary input — `MOUSE2`
- Weapon group 1/2/3 selection slots
- Next weapon group
- Missile type next/previous
- Increase armed missile count — `G`
- Reset armed missile count — `LALT+G`

`Jarvis, fire` sends **one** primary-fire mouse input. NekoVerse does not run a timed rapid-fire loop. In Star Citizen modes where the primary input launches a missile, it remains one explicit launch input; in gun mode it remains one short user-triggered input.

### Targeting & Defense

- Lock / unlock selected target — `F8`
- Cycle next hostile — `5`
- Target under reticle command slot
- Target nearest hostile command slot
- Next/previous hostile target command slots
- Clear target command slot
- Deploy decoy — `H`
- Deploy noise — `J`

Examples:

```text
Jarvis, lock on
Jarvis, lock target
Jarvis, next hostile
Jarvis, deploy decoy
Jarvis, deploy noise
```

NekoVerse sends the selected targeting key once. It does not automatically follow a target or keep reacquiring targets without another user command.

### Power Management

- Raise power to weapons — `F5`
- Raise power to thrusters/engines — `F6`
- Raise power to shields — `F7`
- Reset power distribution — `F8`

These controls are context-sensitive inside Star Citizen, so a key can legitimately have a different function in a different control context.

### mobiGlas & UI

NekoVerse v0.1.2 added explicit AI/voice shortcuts for Star Citizen interface screens:

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

Every entry can be changed or blanked in Settings. Star Citizen supports custom profiles, so defaults should be treated as a starting point and matched to the player's actual controls.

- Request landing/takeoff: `LALT+N`
- Request docking/undocking: `RALT+N`
- Landing gear: `N`
- Flight ready: `RALT+R`
- Ship power: `U`
- Weapon-system power: `P`
- Exterior/head lights: `L`
- SCM/NAV mode: `B`
- Quantum Travel: hold `B`
- Lock/unlock selected target: `F8`
- Cycle hostile target: `5`
- Fire once / primary: `MOUSE1`
- Secondary / missile-type input: `MOUSE2`
- Missile Operator Mode / operator cycle: `MOUSE3`
- Increase armed missiles: `G`
- Reset armed missiles: `LALT+G`
- Decoy: `H`
- Noise: `J`
- Power weapons: `F5`
- Power engines/thrusters: `F6`
- Power shields: `F7`
- Power reset: `F8`
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

Star Citizen bindings can change over time and can be customized by the player. CIG's own keybinding settings remain the source of truth for a particular installation/profile.

## Multilingual commands

Common commands and UI shortcuts have localized aliases for the app's supported language presets, including English, Spanish, German, Polish, Russian, French, Italian and Portuguese. v0.1.3 also includes localized variants for core lock/fire/operator-mode phrases.

## Hold actions

Each command can contain:

```json
{
  "combo": "M",
  "mode": "hold",
  "holdMs": 1400
}
```

The Windows hotkey engine supports hold durations from 35 ms up to 10 seconds. Hold actions are intended for explicit utility controls such as rescue, push-to-talk, quantum engagement or auto-land—not unattended combat firing loops.

## Supported key and mouse names

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
- `MOUSE1`, `LEFTMOUSE`, `LMB`
- `MOUSE2`, `RIGHTMOUSE`, `RMB`
- `MOUSE3`, `MIDDLEMOUSE`, `MMB`
- `MOUSE4`, `MOUSE5`
- `WHEELUP`, `WHEELDOWN`

Use `+` to form combinations, for example `LALT+N` or `CTRL+SHIFT+F7`.

## Fair-play boundary

NekoVerse intentionally does **not** provide:

- aim or recoil assistance
- automatic or timed rapid-fire loops
- autonomous target following/reacquisition
- combat rotations or unattended combat
- autonomous travel/navigation
- automated trade/mining/salvage loops
- memory/process injection
- packet manipulation
- anti-cheat bypasses

The goal is fast voice-access to controls the player could already press themselves.
