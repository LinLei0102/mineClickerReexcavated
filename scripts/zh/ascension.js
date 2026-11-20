let ascensionPointLastUpdated = 0;

function openAscensionScreen() {
	if (game.level >= 100 || game.minerSoulTotal > 0) {
		document.getElementById("ascensionScreen").style.left = "0"
		document.getElementById("artifactScreen").style.left = "100%"
		document.getElementById("ascensionPoints").innerHTML = format(game.ascensionPoints)
		document.getElementById("reincarnationTabButton").style.display = game.gameFinished ? "" : "none"
		updateAscensionGain();
	} else {
		showPopup("等级 100 解锁！");
	}
}

function getPendingAscensionPoints() {
	let ascensionPointMulti = getUpgradeEffect("normal", 7);
	let ascensionPointsToGet = Decimal.pow(game.ascensionCash, 0.12).mul(5).mul(ascensionPointMulti).floor()
	if (!getUpgradeEffect("reincarnation", 11)) ascensionPointsToGet = Decimal.sub(ascensionPointsToGet, game.ascensionPoints).max(0)
	return ascensionPointsToGet;
}

function updateAscensionGain() {
	let ascensionPointMulti = getUpgradeEffect("normal", 7);
	ascensionPointsToGet = getPendingAscensionPoints()
	document.getElementById("ascensionPointsToGet").innerHTML = format(ascensionPointsToGet)
	let nextAscensionPoint = ascensionPointsToGet
	if (!getUpgradeEffect("reincarnation", 11)) nextAscensionPoint = nextAscensionPoint.add(game.ascensionPoints);
	nextAscensionPoint = nextAscensionPoint.add(1).div(ascensionPointMulti).div(5).pow(1/0.12).floor()
	document.getElementById("nextAscensionPoint").innerHTML = "$" + format(nextAscensionPoint)
}

function closeAscensionScreen() {
	document.getElementById("ascensionScreen").style.left = "100%"
}

function confirmAscension() {
	document.getElementById("ascensionConfirmation").style.display = "block"
}

function cancelAscension() {
	document.getElementById("ascensionConfirmation").style.display = "none"
}

function ascend() {
	let ascensionPointsToGet = getPendingAscensionPoints()

	game.ascensionPoints = Decimal.add(game.ascensionPoints, ascensionPointsToGet)
	game.currentOre = 1
	game.cash = getUpgradeEffect("normal", 18)
	game.ascensionCash = 0
	game.unlockedOres = 1
	game.currentTool = getUpgradeEffect("normal", 17) + 1
	game.currentCompanion = getUpgradeEffect("normal", 16) + 1
	game.artifacts = 0
	game.artifactChance = 0.05
	game.artifactBoost = 0
	game.baseDamage = 1

	for (let upg in upgrades.normal) {
		if (!upgrades.normal[upg].keepOn?.includes("ascension")) {
			game.upgradesBought.normal[upg] = 0;
		}
	}

	calculateDamage()
	document.getElementById("ascensionConfirmation").style.display = "none"
	document.getElementById("ascensionScreen").style.left = "100%"
	document.getElementById("toolScreen").style.left = "100%"
	updateCurrencies()
	loadOre(game.currentOre)
}