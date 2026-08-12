const commandCatalog = {
  // Flight / ship operations
  request_landing: {
    label: 'Request landing / takeoff (ATC)', category: 'Flight & Landing', combo: 'LALT+N',
    aliases: [/request (a )?landing/i, /landing permission/i, /request takeoff/i, /call (atc|landing services)/i, /contact atc/i, /hail atc/i]
  },
  request_docking: {
    label: 'Request docking / undocking', category: 'Flight & Landing', combo: 'RALT+N',
    aliases: [/request dock(ing)?/i, /request undock(ing)?/i, /dock with (the )?(station|ship)/i, /undock/i]
  },
  landing_gear: {
    label: 'Landing gear toggle', category: 'Flight & Landing', combo: 'N',
    aliases: [/landing gear/i, /gear (down|up)/i, /(raise|lower) (the )?gear/i]
  },
  vtol: {
    label: 'VTOL toggle', category: 'Flight & Landing', combo: '',
    aliases: [/(toggle|enable|disable) vtol/i, /vtol (mode|up|down|forward)/i]
  },
  precision_mode: {
    label: 'Precision mode toggle', category: 'Flight & Landing', combo: '',
    aliases: [/precision mode/i, /toggle precision/i, /automatic precision/i]
  },
  gravity_compensation: {
    label: 'Gravity compensation toggle', category: 'Flight & Landing', combo: '',
    aliases: [/gravity compensation/i, /gravity assist/i]
  },
  flight_ready: {
    label: 'Flight ready', category: 'Ship Systems', combo: 'RALT+R',
    aliases: [/flight ready/i, /start (the )?ship/i, /bring (the )?ship online/i, /power everything on/i]
  },
  ship_power: {
    label: 'Ship power toggle', category: 'Ship Systems', combo: 'U',
    aliases: [/(ship|vehicle) power/i, /power (the )?ship/i, /turn (the )?ship (on|off)/i]
  },
  engines_power: {
    label: 'Engine power toggle', category: 'Ship Systems', combo: '',
    aliases: [/engine(s)? (power|on|off)/i, /toggle engines/i, /power (up|down) engines/i]
  },
  shields_power: {
    label: 'Shield power toggle', category: 'Ship Systems', combo: '',
    aliases: [/shield(s)? (power|on|off)/i, /toggle shields/i, /power (up|down) shields/i]
  },
  weapons_power: {
    label: 'Weapon system power toggle', category: 'Ship Systems', combo: 'P',
    aliases: [/weapon(s)? power/i, /power (up|down) weapons/i, /toggle weapon power/i]
  },
  lights: {
    label: 'Exterior / head lights', category: 'Ship Systems', combo: 'L',
    aliases: [/(ship|vehicle|head|exterior) ?lights/i, /toggle lights/i, /headlights/i, /(turn|switch) lights (on|off)/i]
  },
  cockpit_lights: {
    label: 'Cockpit / interior lights', category: 'Ship Systems', combo: '',
    aliases: [/cockpit lights/i, /interior lights/i, /cabin lights/i]
  },
  doors: {
    label: 'Doors toggle', category: 'Ship Access', combo: '',
    aliases: [/(open|close|toggle) (the )?(ship )?doors/i, /ship doors/i, /all doors/i]
  },
  ramp: {
    label: 'Ramp toggle', category: 'Ship Access', combo: '',
    aliases: [/(open|close|lower|raise|toggle) (the )?ramp/i, /cargo ramp/i]
  },
  canopy: {
    label: 'Canopy toggle', category: 'Ship Access', combo: '',
    aliases: [/(open|close|toggle) (the )?canopy/i, /cockpit canopy/i]
  },
  exit_seat: {
    label: 'Exit seat', category: 'Ship Access', combo: '',
    aliases: [/exit (the )?(pilot )?seat/i, /leave (the )?seat/i, /get out of (the )?seat/i]
  },
  wings: {
    label: 'Wing / configuration toggle', category: 'Ship Configuration', combo: '',
    aliases: [/(deploy|retract|toggle) wings/i, /wing configuration/i, /ship configuration/i]
  },

  // Master modes / combat operator modes
  quantum_mode: {
    label: 'SCM / NAV Master Mode toggle', category: 'Combat & Operator Modes', combo: 'B',
    aliases: [/quantum (drive|mode)/i, /nav mode/i, /(enter|leave|toggle|switch) nav/i, /(enter|leave|toggle|switch) scm/i, /master mode/i, /combat mode/i, /switch to combat/i, /switch to navigation/i]
  },
  operator_mode_cycle: {
    label: 'Cycle Operator Mode (current default MMB)', category: 'Combat & Operator Modes', combo: 'MOUSE3',
    aliases: [/cycle (the )?operator mode/i, /next operator mode/i, /cycle flight mode/i, /cycle combat mode/i, /next combat mode/i, /cycle weapon mode/i]
  },
  scm_gun_mode: {
    label: 'SCM GUN mode (bind direct key if configured)', category: 'Combat & Operator Modes', combo: '',
    aliases: [/(switch|go|change|set) (to )?(scm )?gun mode/i, /(enter|enable) (scm )?gun mode/i, /guns mode/i, /weapon gun mode/i]
  },
  scm_missile_mode: {
    label: 'SCM Missile mode (bind direct key if configured)', category: 'Combat & Operator Modes', combo: '',
    aliases: [/(switch|go|change|set) (to )?(scm )?missile mode/i, /(enter|enable) missile mode/i, /missiles mode/i, /missile operator mode/i]
  },
  scm_scan_mode: {
    label: 'SCM Scan mode (bind direct key if configured)', category: 'Combat & Operator Modes', combo: '',
    aliases: [/(switch|go|change|set) (to )?(scm )?scan mode/i, /(enter|enable) scan operator mode/i, /scm scanning/i]
  },
  gimbal_mode: {
    label: 'Cycle weapon gimbal mode', category: 'Combat & Operator Modes', combo: '',
    aliases: [/gimbal mode/i, /cycle gimbal/i, /toggle gimbal/i, /manual gimbal/i, /fixed guns/i]
  },
  precision_targeting: {
    label: 'Precision targeting mode', category: 'Combat & Operator Modes', combo: '',
    aliases: [/precision targeting/i, /precision target mode/i, /component targeting mode/i]
  },

  // Weapon groups / missiles — explicit user-triggered mode selection only.
  weapon_group_1: {
    label: 'Select weapon group 1', category: 'Weapons & Missiles', combo: '',
    aliases: [/(select|switch to|use) weapon group (one|1)/i, /guns group (one|1)/i, /primary weapon group/i]
  },
  weapon_group_2: {
    label: 'Select weapon group 2', category: 'Weapons & Missiles', combo: '',
    aliases: [/(select|switch to|use) weapon group (two|2)/i, /guns group (two|2)/i, /secondary weapon group/i]
  },
  weapon_group_3: {
    label: 'Select weapon group 3', category: 'Weapons & Missiles', combo: '',
    aliases: [/(select|switch to|use) weapon group (three|3)/i, /guns group (three|3)/i, /third weapon group/i]
  },
  weapon_group_next: {
    label: 'Next weapon group', category: 'Weapons & Missiles', combo: '',
    aliases: [/next weapon group/i, /cycle weapon group/i, /next guns/i]
  },
  missile_type_next: {
    label: 'Next missile type', category: 'Weapons & Missiles', combo: '',
    aliases: [/next missile type/i, /cycle missile type/i, /change missiles/i, /switch missile type/i]
  },
  missile_type_previous: {
    label: 'Previous missile type', category: 'Weapons & Missiles', combo: '',
    aliases: [/previous missile type/i, /last missile type/i, /missile type back/i]
  },
  missile_count_up: {
    label: 'Increase armed missile count', category: 'Weapons & Missiles', combo: '',
    aliases: [/(increase|add|raise) missile count/i, /arm more missiles/i, /more missiles/i]
  },
  missile_count_down: {
    label: 'Decrease armed missile count', category: 'Weapons & Missiles', combo: '',
    aliases: [/(decrease|reduce|lower) missile count/i, /arm fewer missiles/i, /less missiles/i]
  },

  // Targeting / defensive utility; no aiming or firing automation.
  target_under_reticle: {
    label: 'Target under reticle', category: 'Targeting & Defense', combo: '',
    aliases: [/target under (the )?reticle/i, /target what i am looking at/i, /select target ahead/i]
  },
  target_nearest_hostile: {
    label: 'Target nearest hostile', category: 'Targeting & Defense', combo: '',
    aliases: [/target nearest hostile/i, /nearest enemy target/i, /target closest enemy/i]
  },
  target_next_hostile: {
    label: 'Cycle next hostile target', category: 'Targeting & Defense', combo: '',
    aliases: [/next hostile target/i, /next enemy/i, /cycle hostile target/i]
  },
  target_previous_hostile: {
    label: 'Cycle previous hostile target', category: 'Targeting & Defense', combo: '',
    aliases: [/previous hostile target/i, /previous enemy/i, /last hostile target/i]
  },
  clear_target: {
    label: 'Clear target', category: 'Targeting & Defense', combo: '',
    aliases: [/clear target/i, /deselect target/i, /drop target/i]
  },
  countermeasure_decoy: {
    label: 'Launch decoy countermeasure', category: 'Targeting & Defense', combo: '',
    aliases: [/(launch|deploy|drop) decoy/i, /countermeasure decoy/i, /flare/i]
  },
  countermeasure_noise: {
    label: 'Launch noise countermeasure', category: 'Targeting & Defense', combo: '',
    aliases: [/(launch|deploy|drop) noise/i, /countermeasure noise/i, /noise field/i]
  },
  capacitor_weapons: {
    label: 'Power bias to weapons', category: 'Power Management', combo: '',
    aliases: [/power to weapons/i, /weapons capacitor/i, /bias weapons/i]
  },
  capacitor_shields: {
    label: 'Power bias to shields', category: 'Power Management', combo: '',
    aliases: [/power to shields/i, /shield capacitor/i, /bias shields/i]
  },
  capacitor_engines: {
    label: 'Power bias to engines', category: 'Power Management', combo: '',
    aliases: [/power to engines/i, /engine capacitor/i, /bias engines/i]
  },
  capacitor_reset: {
    label: 'Reset power distribution', category: 'Power Management', combo: '',
    aliases: [/reset power distribution/i, /balance power/i, /reset capacitors/i]
  },

  quantum_engage: {
    label: 'Quantum engage (bind your preferred key)', category: 'Navigation', combo: '',
    aliases: [/engage quantum/i, /quantum jump/i, /start quantum/i, /jump now/i]
  },

  // mobiGlas / UI shortcuts
  mobiglas: {
    label: 'Open mobiGlas', category: 'mobiGlas & UI', combo: 'F1',
    aliases: [/(open|show) (my )?mobi ?glas/i, /mobi ?glas/i, /(open|show) (the )?(wrist|mobi) ui/i, /open main ui/i]
  },
  starmap: {
    label: 'Open Starmap / Map', category: 'mobiGlas & UI', combo: 'F2',
    aliases: [/(open|show) (the )?star ?map/i, /(open|show) (the )?map/i, /navigation map/i, /route planner/i, /star ?map/i]
  },
  comms: {
    label: 'Open Comms / Contacts', category: 'mobiGlas & UI', combo: 'F11',
    aliases: [/(open|show) (the )?comms/i, /(open|show) (the )?contacts/i, /communication(s)? menu/i, /contacts screen/i, /comms screen/i]
  },
  contracts: {
    label: 'Open Contracts Manager (bind if needed)', category: 'mobiGlas & UI', combo: '',
    aliases: [/(open|show) (the )?contracts/i, /(open|show) (the )?contract manager/i, /(open|show) (the )?mission manager/i, /(open|show) (the )?missions/i, /contracts screen/i, /missions screen/i]
  },
  inventory: {
    label: 'Open Personal Inventory', category: 'mobiGlas & UI', combo: 'I',
    aliases: [/(open|show) (my )?inventory/i, /my inventory/i, /inventory screen/i, /(open|show) (my )?backpack/i]
  },
  text_chat: {
    label: 'Open Text Chat', category: 'mobiGlas & UI', combo: 'ENTER',
    aliases: [/(open|show) (the )?(text )?chat/i, /chat box/i, /type in chat/i, /open message box/i]
  },
  journal: {
    label: 'Open Journal (bind if available)', category: 'mobiGlas & UI', combo: '',
    aliases: [/(open|show) (the )?journal/i, /journal screen/i, /logbook/i]
  },
  vehicle_manager: {
    label: 'Open Vehicle Manager (bind if available)', category: 'mobiGlas & UI', combo: '',
    aliases: [/(open|show) (the )?vehicle manager/i, /(open|show) (the )?vehicle loadout/i, /ship loadout screen/i, /vehicle loadout screen/i]
  },

  cruise_control: {
    label: 'Cruise control toggle', category: 'Flight Movement', combo: 'LALT+C',
    aliases: [/cruise control/i, /toggle cruise/i, /hold (this )?speed/i]
  },
  coupled_mode: {
    label: 'Coupled / decoupled toggle', category: 'Flight Movement', combo: '',
    aliases: [/decoupled/i, /coupled mode/i, /toggle coupled/i, /toggle decoupled/i]
  },
  speed_limiter_up: {
    label: 'Speed limiter increase', category: 'Flight Movement', combo: '',
    aliases: [/(raise|increase) speed limiter/i, /speed limit up/i, /increase max speed/i]
  },
  speed_limiter_down: {
    label: 'Speed limiter decrease', category: 'Flight Movement', combo: '',
    aliases: [/(lower|decrease) speed limiter/i, /speed limit down/i, /decrease max speed/i]
  },
  throttle_up: {
    label: 'Throttle / target speed increase (single tap)', category: 'Flight Movement', combo: '',
    aliases: [/(increase|raise) throttle/i, /throttle up/i, /increase speed/i]
  },
  throttle_down: {
    label: 'Throttle / target speed decrease (single tap)', category: 'Flight Movement', combo: '',
    aliases: [/(decrease|lower) throttle/i, /throttle down/i, /slow down/i]
  },
  spacebrake: {
    label: 'Space brake', category: 'Flight Movement', combo: 'X',
    aliases: [/space ?brake/i, /space brake/i, /stop (the )?ship/i, /brake ship/i]
  },
  boost: {
    label: 'Boost (single tap / configured hold)', category: 'Flight Movement', combo: '',
    aliases: [/boost/i, /afterburner/i]
  },
  scan_mode: {
    label: 'Scanning mode toggle', category: 'Scanning', combo: '',
    aliases: [/(enter|leave|toggle) scan(ning)? mode/i, /scanner mode/i]
  },
  ping: {
    label: 'Radar / scanner ping', category: 'Scanning', combo: '',
    aliases: [/(radar|scanner) ping/i, /send (a )?ping/i, /ping scanner/i]
  },
  mining_mode: {
    label: 'Mining mode toggle', category: 'Industrial', combo: '',
    aliases: [/mining mode/i, /(enable|disable|toggle) mining/i]
  },
  salvage_mode: {
    label: 'Salvage mode toggle', category: 'Industrial', combo: '',
    aliases: [/salvage mode/i, /(enable|disable|toggle) salvage/i]
  },
  tractor_mode: {
    label: 'Tractor beam mode toggle', category: 'Industrial', combo: '',
    aliases: [/tractor (beam )?mode/i, /(enable|disable|toggle) tractor/i]
  },

  // Ground vehicles
  vehicle_power: {
    label: 'Ground vehicle power', category: 'Ground Vehicles', combo: 'U',
    aliases: [/ground vehicle power/i, /rover power/i, /(start|stop) (the )?(car|rover|vehicle)/i]
  },
  vehicle_lights: {
    label: 'Ground vehicle headlights', category: 'Ground Vehicles', combo: 'L',
    aliases: [/(car|rover|ground vehicle) lights/i, /vehicle headlights/i]
  },
  vehicle_horn: {
    label: 'Ground vehicle horn', category: 'Ground Vehicles', combo: '',
    aliases: [/(sound|use|press) (the )?horn/i, /honk/i, /vehicle horn/i]
  },
  vehicle_cruise: {
    label: 'Ground vehicle cruise control', category: 'Ground Vehicles', combo: '',
    aliases: [/vehicle cruise/i, /rover cruise/i, /car cruise control/i]
  },
  vehicle_brake: {
    label: 'Ground vehicle brake / handbrake', category: 'Ground Vehicles', combo: '',
    aliases: [/(vehicle|rover|car) brake/i, /handbrake/i, /parking brake/i]
  },
  vehicle_speed_up: {
    label: 'Ground vehicle speed limiter increase', category: 'Ground Vehicles', combo: '',
    aliases: [/(raise|increase) vehicle speed/i, /vehicle speed up/i]
  },
  vehicle_speed_down: {
    label: 'Ground vehicle speed limiter decrease', category: 'Ground Vehicles', combo: '',
    aliases: [/(lower|decrease) vehicle speed/i, /vehicle speed down/i]
  },

  // Camera / view / comms
  third_person: {
    label: 'Third-person camera toggle', category: 'Camera & View', combo: 'F4',
    aliases: [/third person/i, /external camera/i, /outside view/i, /toggle camera/i]
  },
  freelook: {
    label: 'Freelook toggle', category: 'Camera & View', combo: '',
    aliases: [/free ?look/i, /look around/i, /toggle freelook/i]
  },
  head_tracking: {
    label: 'Head tracking toggle', category: 'Camera & View', combo: '',
    aliases: [/head tracking/i, /trackir/i, /toggle tracking/i]
  },
  voip_toggle: {
    label: 'VOIP toggle', category: 'Comms', combo: '',
    aliases: [/(toggle|enable|disable) voip/i, /voice chat/i]
  },
  push_to_talk: {
    label: 'Push-to-talk (configured hold)', category: 'Comms', combo: '', mode: 'hold', holdMs: 700,
    aliases: [/push to talk/i, /ptt/i, /transmit voice/i]
  },

  // On-foot / personal utility
  helmet_toggle: {
    label: 'Helmet attach / remove', category: 'On Foot', combo: '',
    aliases: [/(remove|take off|put on|wear|attach) (my )?helmet/i, /helmet (off|on)/i, /toggle helmet/i]
  },
  personal_light: {
    label: 'Personal flashlight', category: 'On Foot', combo: 'T',
    aliases: [/(personal|helmet|suit) light/i, /flashlight/i, /(turn|switch) torch (on|off)/i]
  },
  interact_mode: {
    label: 'Interaction mode', category: 'On Foot', combo: 'F',
    aliases: [/interaction mode/i, /interact/i]
  },
  holster: {
    label: 'Holster / unholster', category: 'On Foot', combo: '',
    aliases: [/(holster|unholster) (my )?(tool|weapon)/i, /put (it|weapon|tool) away/i]
  },
  medpen: {
    label: 'Use medpen / medical item', category: 'Medical', combo: '',
    aliases: [/(use|take) (a )?med ?pen/i, /heal me/i, /medical pen/i]
  },
  rescue_beacon: {
    label: 'SOS / Rescue Beacon (hold)', category: 'Medical', combo: 'M', mode: 'hold', holdMs: 1400,
    aliases: [/call (an )?(sos|rescue|medic|medical rescue)/i, /send (an )?sos/i, /rescue beacon/i, /medical beacon/i, /help me i('| a)?m down/i, /i('| a)?m incapacitated/i, /call for help/i]
  }
};

function buildDefaultCommands() {
  return Object.fromEntries(Object.entries(commandCatalog).map(([id, command]) => [id, {
    label: command.label,
    category: command.category,
    combo: command.combo || '',
    mode: command.mode || 'tap',
    holdMs: command.holdMs || 45
  }]));
}

function detectCommandIntent(text = '') {
  for (const [intent, command] of Object.entries(commandCatalog)) {
    if ((command.aliases || []).some(pattern => pattern.test(text))) return intent;
  }
  return null;
}

function commandLabel(intent) {
  return commandCatalog[intent]?.label || String(intent || '').replaceAll('_', ' ');
}

module.exports = { commandCatalog, buildDefaultCommands, detectCommandIntent, commandLabel };
