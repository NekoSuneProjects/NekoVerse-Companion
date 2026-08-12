// Current keyboard/mouse defaults for common actions based on the maintained
// 2026 Star Citizen controls reference. These are only defaults: existing
// SQLite user settings and any manual rebinds always win.
const currentDefaults = {
  flight_ready: { label:'Flight ready', category:'Ship Systems', combo:'R', mode:'tap', holdMs:45 },
  cruise_control: { label:'Cruise control toggle', category:'Flight Movement', combo:'C', mode:'tap', holdMs:45 },
  coupled_mode: { label:'Coupled / decoupled toggle', category:'Flight Movement', combo:'LALT+C', mode:'tap', holdMs:45 },
  landing_gear: { label:'Landing gear / landing mode toggle', category:'Flight & Landing', combo:'N', mode:'tap', holdMs:45 },
  request_landing: { label:'Request landing / takeoff (ATC)', category:'Flight & Landing', combo:'LALT+N', mode:'tap', holdMs:45 },
  quantum_mode: { label:'SCM / NAV Master Mode toggle', category:'Combat & Operator Modes', combo:'B', mode:'tap', holdMs:45 },
  boost: { label:'Boost', category:'Flight Movement', combo:'LSHIFT', mode:'hold', holdMs:350 },
  spacebrake: { label:'Space brake', category:'Flight Movement', combo:'X', mode:'tap', holdMs:45 },
  speed_limiter_up: { label:'Speed limiter increase', category:'Flight Movement', combo:'WHEELUP', mode:'tap', holdMs:45 },
  speed_limiter_down: { label:'Speed limiter decrease', category:'Flight Movement', combo:'WHEELDOWN', mode:'tap', holdMs:45 },
  engines_power: { label:'Thruster / engine power toggle', category:'Ship Systems', combo:'I', mode:'tap', holdMs:45 },
  shields_power: { label:'Shield power toggle', category:'Ship Systems', combo:'O', mode:'tap', holdMs:45 },
  weapons_power: { label:'Weapon system power toggle', category:'Ship Systems', combo:'P', mode:'tap', holdMs:45 },
  ship_power: { label:'Ship power toggle', category:'Ship Systems', combo:'U', mode:'tap', holdMs:45 },
  scan_mode: { label:'Scanning mode toggle', category:'Scanning', combo:'V', mode:'tap', holdMs:45 },
  ping: { label:'Scanner / radar ping', category:'Scanning', combo:'V', mode:'hold', holdMs:650 },
  mining_mode: { label:'Mining mode toggle', category:'Industrial', combo:'M', mode:'tap', holdMs:45 },
  salvage_mode: { label:'Salvage mode toggle', category:'Industrial', combo:'M', mode:'tap', holdMs:45 },
  third_person: { label:'Third-person camera toggle', category:'Camera & View', combo:'F4', mode:'tap', holdMs:45 },
  freelook: { label:'Freelook toggle', category:'Camera & View', combo:'Z', mode:'tap', holdMs:45 },
  personal_light: { label:'Personal flashlight', category:'On Foot', combo:'T', mode:'tap', holdMs:45 },
  interact_mode: { label:'Interaction mode', category:'On Foot', combo:'F', mode:'tap', holdMs:45 },
  medpen: { label:'Use medpen / medical item', category:'Medical', combo:'C', mode:'tap', holdMs:45 },
  holster: { label:'Holster weapon / utility', category:'On Foot', combo:'R', mode:'hold', holdMs:650 },
  vehicle_brake: { label:'Ground vehicle brake', category:'Ground Vehicles', combo:'X', mode:'tap', holdMs:45 }
};

function buildCurrentDefaultOverrides(){
  return structuredClone(currentDefaults);
}

module.exports={ currentDefaults, buildCurrentDefaultOverrides };
