// Explicit, user-triggered combat/navigation shortcuts only.
// No timed fire loops, aim automation, target tracking automation, or unattended combat.
const combatExtraCatalog = {
  target_lock_toggle: {
    label: 'Lock / unlock selected target', category: 'Targeting & Defense', combo: 'F8',
    aliases: [
      /^lock on$/i, /^lock target$/i, /^lock on target$/i, /lock (the )?(enemy|hostile|marker|target)/i,
      /target lock/i, /unlock target/i, /desbloquear objetivo/i, /bloquear objetivo/i,
      /ziel (sperren|erfassen|entsperren)/i, /zablokuj cel/i, /odblokuj cel/i,
      /захвати цель/i, /снять захват/i, /verrouille la cible/i, /d[eé]verrouille la cible/i,
      /blocca bersaglio/i, /sblocca bersaglio/i, /bloquear alvo/i, /desbloquear alvo/i
    ]
  },
  target_next_hostile_current: {
    label: 'Cycle next hostile target', category: 'Targeting & Defense', combo: '5',
    aliases: [
      /next hostile/i, /next enemy/i, /cycle hostiles/i, /cycle enemies/i,
      /siguiente enemigo/i, /n[aä]chster feind/i, /nast[eę]pny wr[oó]g/i,
      /следующая вражеская цель/i, /ennemi suivant/i, /prossimo nemico/i, /pr[oó]ximo inimigo/i
    ]
  },
  fire_once: {
    label: 'Fire once / weapon group 1 / launch missile once', category: 'Weapons & Missiles', combo: 'MOUSE1',
    aliases: [
      /^fire$/i, /^fire once$/i, /^shoot$/i, /^shoot once$/i, /fire primary/i,
      /launch (the )?missile/i, /fire (the )?missile/i, /dispara(r)?$/i, /fuego$/i,
      /feuer$/i, /strzel$/i, /огонь$/i, /tir(e|er)$/i, /spara$/i, /dispara$/i
    ]
  },
  fire_secondary_once: {
    label: 'Fire weapon group 2 / cycle missile type once', category: 'Weapons & Missiles', combo: 'MOUSE2',
    aliases: [
      /fire secondary/i, /secondary fire/i, /weapon group two fire/i,
      /cycle missile type once/i, /next missile type once/i
    ]
  },
  missile_operator_toggle_current: {
    label: 'Missile Operator Mode toggle', category: 'Combat & Operator Modes', combo: 'MOUSE3',
    aliases: [
      /missile operator mode/i, /toggle missile mode/i, /switch missile operator/i,
      /modo operador de misiles/i, /raketen operatormodus/i, /tryb operatora rakiet/i,
      /режим оператора ракет/i, /mode op[eé]rateur missile/i, /modalit[aà] operatore missili/i,
      /modo operador de m[ií]sseis/i
    ]
  },
  armed_missiles_increase_current: {
    label: 'Increase armed missile count', category: 'Weapons & Missiles', combo: 'G',
    aliases: [/arm more missiles/i, /increase armed missiles/i, /more armed missiles/i]
  },
  armed_missiles_reset_current: {
    label: 'Reset armed missile count', category: 'Weapons & Missiles', combo: 'LALT+G',
    aliases: [/reset armed missiles/i, /reset missile count/i]
  },
  deploy_decoy_current: {
    label: 'Deploy decoy', category: 'Targeting & Defense', combo: 'H', mode: 'hold', holdMs: 120,
    aliases: [/deploy decoy/i, /launch decoy/i, /drop decoy/i, /flare/i]
  },
  deploy_noise_current: {
    label: 'Deploy noise', category: 'Targeting & Defense', combo: 'J',
    aliases: [/deploy noise/i, /launch noise/i, /drop noise/i]
  },
  power_weapons_current: {
    label: 'Raise power to weapons', category: 'Power Management', combo: 'F5',
    aliases: [/power to weapons/i, /raise weapon power/i, /weapons power priority/i]
  },
  power_engines_current: {
    label: 'Raise power to thrusters / engines', category: 'Power Management', combo: 'F6',
    aliases: [/power to engines/i, /power to thrusters/i, /raise engine power/i]
  },
  power_shields_current: {
    label: 'Raise power to shields', category: 'Power Management', combo: 'F7',
    aliases: [/power to shields/i, /raise shield power/i, /shield power priority/i]
  },
  power_reset_current: {
    label: 'Reset power distribution', category: 'Power Management', combo: 'F8',
    aliases: [/reset power distribution/i, /balance power distribution/i]
  },
  quantum_jump_current: {
    label: 'Engage Quantum Travel (hold)', category: 'Navigation', combo: 'B', mode: 'hold', holdMs: 900,
    aliases: [
      /quantum jump/i, /engage quantum/i, /start quantum/i, /activate quantum travel/i,
      /jump to marker/i, /jump now/i
    ]
  },
  autoland_current: {
    label: 'Auto land (hold)', category: 'Flight & Landing', combo: 'LCTRL', mode: 'hold', holdMs: 900,
    aliases: [/auto land/i, /autoland/i, /land automatically/i]
  }
};

function buildCombatExtraCommands() {
  return Object.fromEntries(Object.entries(combatExtraCatalog).map(([id, command]) => [id, {
    label: command.label,
    category: command.category,
    combo: command.combo || '',
    mode: command.mode || 'tap',
    holdMs: command.holdMs || 45
  }]));
}

function detectCombatExtraIntent(text = '') {
  for (const [intent, command] of Object.entries(combatExtraCatalog)) {
    if ((command.aliases || []).some(pattern => pattern.test(text))) return intent;
  }
  return null;
}

function combatExtraLabel(intent) {
  return combatExtraCatalog[intent]?.label || null;
}

module.exports = { combatExtraCatalog, buildCombatExtraCommands, detectCombatExtraIntent, combatExtraLabel };
