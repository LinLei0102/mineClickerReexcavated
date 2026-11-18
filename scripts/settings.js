

function changeNumberFormat() {
	const list = ["standard", "standardLong", "scientific"];
	game.numberFormat = list[(list.indexOf(game.numberFormat) + 1) % list.length]
	updateOreUI()
	updateSettings();
	document.getElementById("cash").innerHTML = "$" + format(game.cash)
}

function changeHomeStat() {
	const list = ["damage", "breakRate"];
	game.homeStat = list[(list.indexOf(game.homeStat) + 1) % list.length]
	updateOreDamageUI();
	updateSettings();
}

function updateSettings() {
	document.getElementById("numberFormat").innerHTML = {
		standardLong: "Standard long",
		standard: "Standard",
		scientific: "Scientific",
	}[game.numberFormat]

	document.getElementById("homeStatButton").style.display = Decimal.gt(game.minerSoulTotal, 0) ? "" : "none";
	document.getElementById("homeStat").innerHTML = {
		damage: "Damage",
		breakRate: "Break rate",
	}[game.homeStat];
	
	({
		active: document.getElementById("currentActiveStat").innerHTML,
		idle: document.getElementById("currentIdleStat").innerHTML
	} = {
		damage: { active: "dmg / tap", idle: "dmg / sec" },
		breakRate: { active: "taps / break", idle: "sec / break" },
	}[game.homeStat])

	document.getElementById("topBarMessages").innerHTML = game.messages ? "On" : "Off"
	document.getElementById("evilMode").innerHTML = game.evilMode ? "On" : "Off"
	document.getElementById("evilModeCredit").style.display = game.evilMode ? "" : "none";
}

function enableDisableMessages() {
	game.messages = !game.messages
	updateSettings();
}

function enableDisableEvilMode() {
	game.evilMode = !game.evilMode
	updateOreUI();
	updateSettings();
}
