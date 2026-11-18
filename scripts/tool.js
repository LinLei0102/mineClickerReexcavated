


let currentTool = "tool";

function openToolScreen() {
	document.getElementById("toolScreen").style.left = "0"
	document.getElementById("upgradeScreen").style.left = "-100%"
	document.getElementById("statsScreen").style.left = "-100%"
	loadToolScreenInfo()
}

function getToolDamage(type, x) {
	if (x === undefined) x = getToolLevel(type)

	if (type == "tool") {
		if (x < 33) {
			return toolDamages[x - 1]
		} else {
			return Decimal.pow(25, (x - 32)).mul(toolDamages[32])
		}
	} else if (type == "comp") {
		if (x <= compDamages.length) {
			return compDamages[x - 1]
		} else {
			return compDamages[compDamages.length - 1] + 50 * (x - compDamages.length)
		}
	}
}

function getToolCost(type, x) {
	if (x === undefined) x = getToolLevel(type)

	if (type == "tool") {
		if (x < 33) {
			return toolCosts[x - 1] * getUpgradeEffect("normal", 8)
		} else {
			return Decimal.pow(x * 1000, x - 33).mul(toolCosts[32]).mul(getUpgradeEffect("normal", 8))
		}
	} else if (type == "comp") {
		if (x <= compCosts.length) {
			return compCosts[x - 1]
		} else {
			return Decimal.pow(x, x - compCosts.length).mul(compCosts[compCosts.length - 1])
		}
	}
}

function getToolLevel(type) {
	if (type == "tool") {
		return game.currentTool;
	} else if (type == "comp") {
		return game.currentCompanion;
	}
}

function getToolName(type, x) {
	if (type == "tool") {
		return x < 25 ? toolNames[x - 1] : "Devourer Mk. " + romanize(x - 24);
	} else if (type == "comp") {
		return x <= compNames.length ? compNames[x - 1] : "Grey goo Mk. " + romanize(x - compNames.length);
	}
}

function getToolCurrency(type, x) {
	if (type == "tool") {
		return "$" + format(x ?? game.cash)
	} else if (type == "comp") {
		return format(x ?? game.artifacts) + " artifacts";
	}
}

function loadToolScreenInfo(tool) {

	if (tool == "comp" && game.level < 10) {
		showPopup("Unlocks at level 10!")
		return
	}

	if (tool) currentTool = tool;

	let level = getToolLevel(currentTool);
	let name = getToolName(currentTool, level);
	let nextName = getToolName(currentTool, level + 1);
	let damage = getToolDamage(currentTool, level);
	let nextDamage = getToolDamage(currentTool, level + 1);

	document.getElementById("currentTool").innerHTML = name
	if (name.length > 13) {document.getElementById("currentTool").style.fontSize = "6vh"}
	else {document.getElementById("currentTool").style.fontSize = "8vh"}
	
	if (currentTool == "tool") {
		let devourerMark = game.currentTool - toolNames.length
		document.getElementById("toolIconLarge").style.backgroundImage = "url('assets/icons/tools/" + Math.min(game.currentTool, toolNames.length + 1) + ".png')"
		document.getElementById("toolIconLarge").style.filter = devourerMark > 0 ? `hue-rotate(${devourerMark * Math.E * 30}deg)` : ""
	} else if (currentTool == "comp") {
		let devourerMark = game.currentTool - compNames.length
		document.getElementById("toolIconLarge").style.backgroundImage = "url('assets/icons/companions/" + Math.min(game.currentCompanion, compNames.length + 1) + ".png')"
		document.getElementById("toolIconLarge").style.filter = devourerMark > 0 ? `hue-rotate(${devourerMark * Math.E * 30}deg)` : ""
	}

	document.getElementById("nextTool").innerHTML = nextName

	if (currentTool == "tool") {
		if (damage < 1e6) document.getElementById("nextDamage").innerHTML = "Damage: " + format(damage) + " -> " + format(nextDamage)
		else document.getElementById("nextDamage").innerHTML = format(damage) + " -> " + format(nextDamage)
	} else if (currentTool == "comp") {
		if (damage < 1e6) document.getElementById("nextDamage").innerHTML = "Speed: " + format(damage) + "/s -> " + format(nextDamage) + "/s"
		else document.getElementById("nextDamage").innerHTML = format(damage) + "/s -> " + format(nextDamage) + "/s"
	}
	
	document.getElementById("nextToolCost").innerHTML = getToolCurrency(currentTool, getToolCost(currentTool))
	
	updateCurrencies()

	if (Decimal.gte(game.level, 10)) {
		document.getElementById("artifactBottomButton").style.color = "#860"
		document.getElementById("artifactBottomButton").innerHTML = "Gilding"

		document.getElementById("compButton").style.color = ""
		document.getElementById("compButton").innerHTML = "COMP"
	}
	document.getElementById("artifactBottomButton").style.display = currentTool == "tool" ? "" : "none";

	document.getElementById("autoScreenButton").style.display = Decimal.gte(game.minerSoulTotal, 1e4) ? "" : "none";
}

function closeToolScreen() {
	document.getElementById("toolScreen").style.left = "100%"
	updateOreUI();
}

function upgradeTool (tool) {
	tool ??= currentTool;
	let toolCost = 0
	toolCost = getToolCost(tool)
	if (tool == "tool" && Decimal.gte(game.cash, toolCost)) {
		game.cash = Decimal.sub(game.cash, toolCost)

		updateCurrencies()

		game.currentTool++
		game.artifactBoost = 0
		game.artifactUsed = 0

		if (tool == currentTool) loadToolScreenInfo()
		calculateDamage()
	} else if (tool == "comp" && Decimal.gte(game.artifacts, toolCost)) {
		game.artifacts = Decimal.sub(game.artifacts, toolCost)
		game.currentCompanion++

		if (tool == currentTool) loadToolScreenInfo()
		calculateDamage()
	}
}