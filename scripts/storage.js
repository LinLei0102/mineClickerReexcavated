
function initSave() {
	game = {
		cash: new Decimal(0),
		XP: new Decimal(0),
		level: new Decimal(0),

		baseDamage: new Decimal(0),
		damage: new Decimal(0),
		idleDamage: new Decimal(0),
		activeDamage: new Decimal(0),
		tapSpeed: 0,

		lastSave: Date.now(),
		lastVisualUpdate: Date.now(),
		totalOresMined: 0,
		timePlayed: 0,
		numberFormat: "standardLong",
		homeStat: "damage",
		messages: true,
		evilMode: false,

		unlockedOres: 1,
		currentOre: 1,
		currentTool: 1,
		currentCompanion: 1,
		upgradesBought: {},

		artifacts: new Decimal(0),
		artifactChance: 0.05,
		artifactBoost: new Decimal(0),
		artifactUsed: new Decimal(0),

		ascensionPoints: new Decimal(0),
		ascensionCash: new Decimal(0),

        minerSouls: new Decimal(0),
        minerSoulTotal: new Decimal(0),
        minerSoulPending: new Decimal(0),
        minerSoulRate: new Decimal(0),
        minerSoulBestOre: 0,
		minerSoulCash: new Decimal(0),
		minerSoulArtifacts: new Decimal(0),

		gameFinished: false,
		gameTrulyFinished: false,

		auto: Object.fromEntries(Object.keys(autoFunctions).map(k => [k, false])),
	}

	for (let cat in upgrades) {
		game.upgradesBought[cat] = {};
		for (let id in upgrades[cat]) {
			game.upgradesBought[cat][id] = 0;
		}
	}
}

function hardReset() {
  if (confirm("Are you sure you want to reset? You will lose everything!")) {
    initSave()
    save()
    location.reload()
  }
}

function save() {
  //console.log("saving")
  game.lastSave = Date.now();
  localStorage.setItem("mineClickerSave", JSON.stringify(game));
  localStorage.setItem("mineClickerLastSaved", game.lastSave);
}

function load() {
	initSave()
	let loadgame = JSON.parse(localStorage.getItem("mineClickerSave"))
	if (loadgame != null) {loadGame(loadgame)}
	//mainLoop = function() {
  //  updateVisuals();
  //  requestAnimationFrame(mainLoop);
  //};
  //requestAnimationFrame(mainLoop)
}

function exportGame() {
  save()
  navigator.clipboard.writeText(btoa(JSON.stringify(game))).then(function() {
    showPopup("Copied to clipboard!")
  }, function() {
    showPopup("Error copying to clipboard, try again...")
  });
}

function importGame() {
  loadgame = JSON.parse(atob(prompt("Input your save here:")))
  if (loadgame && loadgame != null && loadgame != "") {
    initSave()
    loadGame(loadgame)
    save()
		location.reload()
  }
  else {
    navigator("Invalid input.")
  }
}

function deepCopy(from, to) {
	for (let key in to) {
		if (from[key] === undefined) {
			continue;
		}
		else if ((typeof to[key]) == "number" && from[key] === null) {
			continue;
		}
		else if (to[key] instanceof Decimal) {
			to[key] = from[key] ?? to[key];
		}
		else if ((typeof(to[key])) == "object") {
			to[key] = deepCopy(from[key], to[key])
		}
		else {
			to[key] = from[key];
		}
	}
	return to;
}