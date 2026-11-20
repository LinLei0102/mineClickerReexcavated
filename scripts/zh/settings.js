

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
		standardLong: "标准（长单位）",
		standard: "标准",
		scientific: "科学计数",
	}[game.numberFormat]

	document.getElementById("homeStatButton").style.display = Decimal.gt(game.minerSoulTotal, 0) ? "" : "none";
	document.getElementById("homeStat").innerHTML = {
		damage: "伤害",
		breakRate: "破坏速率",
	}[game.homeStat];
	
	({
		active: document.getElementById("currentActiveStat").innerHTML,
		idle: document.getElementById("currentIdleStat").innerHTML
	} = {
		damage: { active: "伤害/点击", idle: "伤害/秒" },
		breakRate: { active: "次点击/破坏", idle: "秒/破坏" },
	}[game.homeStat])

	document.getElementById("topBarMessages").innerHTML = game.messages ? "开" : "关"
	document.getElementById("evilMode").innerHTML = game.evilMode ? "开" : "关"
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
