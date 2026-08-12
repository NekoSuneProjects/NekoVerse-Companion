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
  quantum_mode: {
    label: 'NAV / Quantum mode toggle', category: 'Navigation', combo: 'B',
    aliases: [/quantum (drive|mode)/i, /nav mode/i, /(enter|leave|toggle) nav/i, /master mode/i]
  },
  quantum_engage: {
    label: 'Quantum engage (bind your preferred key)', category: 'Navigation', combo: '',
    aliases: [/engage quantum/i, /quantum jump/i, /start quantum/i, /jump now/i]
  },
  starmap: {
    label: 'Open Starmap', category: 'Navigation', combo: 'F2',
    aliases: [/(open|show) (the )?star ?map/i, /navigation map/i, /route planner/i]
  },
  mobiglas: {
    label: 'Open mobiGlas', category: 'Navigation', combo: 'F1',
    aliases: [/(open|show) (my )?mobiglas/i, /mobi ?glas/i]
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
  comms: {
    label: 'Comms / contacts', category: 'Comms', combo: 'F11',
    aliases: [/(open|show) comms/i, /contacts/i, /communication(s)? menu/i]
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
  inventory: {
    label: 'Personal inventory', category: 'On Foot', combo: 'I',
    aliases: [/(open|show) inventory/i, /my inventory/i]
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
  },
  contracts: {
    label: 'Contracts Manager', category: 'Medical', combo: '',
    aliases: [/(open|show) contracts/i, /contracts manager/i, /missions/i]
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
