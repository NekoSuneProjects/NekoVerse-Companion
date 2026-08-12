const localizedAliases = {
  request_landing: [
    /solicita(r)? (el )?aterrizaje/i, /permiso de aterrizaje/i,
    /landeerlaubnis (anfragen|bitte)/i, /landung anfragen/i,
    /popro[sś] o l[aą]dowanie/i, /zgoda na l[aą]dowanie/i,
    /запроси(ть)? посадк[уи]/i, /разрешение на посадку/i,
    /demande(r)? l['’]?atterrissage/i, /richiedi l['’]?atterraggio/i,
    /pedir aterragem/i
  ],
  request_docking: [/solicita(r)? atraque/i,/andocken anfragen/i,/popro[sś] o dokowanie/i,/запроси(ть)? стыковк[уи]/i,/demande(r)? l['’]?amarrage/i,/richiedi attracco/i,/pedir acoplagem/i],
  landing_gear: [/tren de aterrizaje/i,/fahrwerk/i,/podwozie/i,/шасси/i,/train d['’]?atterrissage/i,/carrello d['’]?atterraggio/i,/trem de aterragem/i],
  flight_ready: [/preparar vuelo/i,/flugbereit/i,/gotowo[sś][cć] do lotu/i,/готовность к полету/i,/pr[eê]t au vol/i,/pronto al volo/i,/pronto para voo/i],
  ship_power: [/energ[ií]a de la nave/i,/schiffs?strom/i,/zasilanie statku/i,/питание корабля/i,/alimentation du vaisseau/i,/alimentazione nave/i,/energia da nave/i],
  lights: [/luces( de la nave| exteriores| delanteras)?/i,/scheinwerfer|lichter/i,/[sś]wiat[łl]a|reflektory/i,/фары|огни корабля/i,/phares|lumi[eè]res/i,/fari|luci/i,/far[oó]is|luzes/i],
  doors: [/abrir (las )?puertas|cerrar (las )?puertas/i,/t[uü]ren (auf|zu|[oö]ffnen|schlie[sß]en)/i,/otw[oó]rz drzwi|zamknij drzwi/i,/открой двери|закрой двери/i,/ouvre les portes|ferme les portes/i,/apri le porte|chiudi le porte/i,/abrir portas|fechar portas/i],
  ramp: [/abrir (la )?rampa|cerrar (la )?rampa/i,/rampe (auf|zu)|rampe [oö]ffnen|rampe schlie[sß]en/i,/otw[oó]rz ramp[eę]|zamknij ramp[eę]/i,/открой рампу|закрой рампу/i,/ouvre la rampe|ferme la rampe/i,/apri la rampa|chiudi la rampa/i,/abrir rampa|fechar rampa/i],
  quantum_mode: [/modo cu[aá]ntico|modo nav/i,/quantenmodus|nav modus/i,/tryb kwantowy|tryb nav/i,/квантовый режим|режим навигации/i,/mode quantique|mode nav/i,/modalit[aà] quantica|modalit[aà] nav/i,/modo qu[aâ]ntico|modo nav/i],
  quantum_engage: [/inicia(r)? salto cu[aá]ntico/i,/quantensprung starten/i,/rozpocznij skok kwantowy/i,/начни квантовый прыжок/i,/lance le saut quantique/i,/avvia salto quantico/i,/iniciar salto qu[aâ]ntico/i],
  starmap: [/abrir mapa estelar/i,/sternkarte [oö]ffnen/i,/otw[oó]rz map[eę] gwiazd/i,/открой звездную карту/i,/ouvre la carte stellaire/i,/apri mappa stellare/i,/abrir mapa estelar/i],
  mobiglas: [/abrir mobiglas/i,/mobiglas [oö]ffnen/i,/otw[oó]rz mobiglas/i,/открой mobiglas/i,/ouvre mobiglas/i,/apri mobiglas/i],
  cruise_control: [/control de crucero/i,/tempomat|cruise control/i,/tempomat|kontrola pr[eę]dko[sś]ci/i,/круиз контроль/i,/r[eé]gulateur de vitesse/i,/controllo crociera/i,/controlo de cruzeiro/i],
  spacebrake: [/freno espacial/i,/raumbremse/i,/hamulec kosmiczny/i,/космический тормоз/i,/frein spatial/i,/freno spaziale/i,/trav[aã]o espacial/i],
  scan_mode: [/modo esc[aá]ner|modo de escaneo/i,/scanmodus/i,/tryb skanowania/i,/режим сканирования/i,/mode scanner/i,/modalit[aà] scansione/i,/modo de digitaliza[cç][aã]o/i],
  mining_mode: [/modo miner[ií]a/i,/bergbaumodus/i,/tryb g[oó]rniczy/i,/режим добычи/i,/mode minage/i,/modalit[aà] mineraria/i,/modo de minera[cç][aã]o/i],
  vehicle_lights: [/luces del veh[ií]culo/i,/fahrzeuglichter/i,/[sś]wiat[łl]a pojazdu/i,/фары машины|фары транспорта/i,/phares du v[eé]hicule/i,/fari del veicolo/i,/far[oó]is do ve[ií]culo/i],
  comms: [/abrir comunicaciones|abrir contactos/i,/kommunikation [oö]ffnen|kontakte [oö]ffnen/i,/otw[oó]rz komunikacj[eę]|otw[oó]rz kontakty/i,/открой связь|открой контакты/i,/ouvre les communications|ouvre les contacts/i,/apri comunicazioni|apri contatti/i,/abrir comunica[cç][oõ]es|abrir contactos/i],
  helmet_toggle: [/quitar casco|poner casco/i,/helm abnehmen|helm aufsetzen/i,/zdejmij he[łl]m|za[łl][oó][zż] he[łl]m/i,/сними шлем|надень шлем/i,/retire le casque|mets le casque/i,/togli il casco|metti il casco/i,/tirar capacete|colocar capacete/i],
  personal_light: [/linterna|luz personal/i,/taschenlampe/i,/latarka/i,/фонарик/i,/lampe torche/i,/torcia/i,/lanterna/i],
  inventory: [/abrir inventario/i,/inventar [oö]ffnen/i,/otw[oó]rz ekwipunek/i,/открой инвентарь/i,/ouvre l['’]?inventaire/i,/apri inventario/i,/abrir invent[aá]rio/i],
  rescue_beacon: [
    /pedir rescate|llamar rescate|enviar sos/i,
    /rettung rufen|notruf senden|sos senden/i,
    /wezwij ratunek|wy[sś]lij sos|wezwij medyka/i,
    /вызови спасателей|отправь sos|вызови медика|позови на помощь/i,
    /appelle les secours|envoie un sos/i,
    /chiama soccorso|invia sos/i,
    /chamar resgate|enviar sos/i
  ]
};

function detectLocalizedCommandIntent(text='') {
  for (const [intent, patterns] of Object.entries(localizedAliases)) {
    if (patterns.some(pattern=>pattern.test(text))) return intent;
  }
  return null;
}

module.exports = { localizedAliases, detectLocalizedCommandIntent };
