

function loadGame(loadgame) {
	game = deepCopy(loadgame, game);

	updateSettings();
	updateCurrencies();

	document.getElementById("level").innerHTML = format(game.level);
	let XPToNextLevel = levelToXP(Decimal.add(game.level + 1)).sub(levelToXP(game.level))
	let ProgressToNextLevel = Decimal.sub(game.XP, levelToXP(game.level))
	document.getElementById("XPBar").style.width = Decimal.div(ProgressToNextLevel, XPToNextLevel).mul(100) + "%";

	time = game.lastSave;
}



let time = Date.now()
let tapTimer = 0;
let delta = 0;
function tick() {
	delta = (Date.now() - time)
	time += delta;
    delta /= 1000;

	if (delta > 60)
	{
		attemptOfflineTime(delta);
    	updateVisuals();
		setTimeout(tick, 100);
		return;
	}

	game.timePlayed += delta
	let hasAuto = false;

	if (document.getElementById("statsScreen").style.left == "0px") {
		document.getElementById("timePlayed").innerHTML = formatDuration(game.timePlayed)
	}

	if (getUpgradeEffect("reincarnation", "11a")) {
		if (ascensionPointLastUpdated == 0 || time - ascensionPointLastUpdated > 1000) {
			let ascensionPointsToGet = Decimal.mul(getPendingAscensionPoints(), getUpgradeEffect("reincarnation", "11a"))
				.mul(ascensionPointLastUpdated ? (time - ascensionPointLastUpdated) / 1000 : delta);
			game.ascensionPoints = Decimal.add(game.ascensionPoints, ascensionPointsToGet)
			ascensionPointLastUpdated = time;
			document.getElementById("ascensionPoints").innerHTML = format(game.ascensionPoints);
			calculateDamage();
			hasAuto = true;
		} 
	}

	if (Decimal.gte(game.level, 5)) {
		tapTimer += delta * game.tapSpeed;

		if (tapTimer > 0) {
			doIdleDamage(Math.floor(tapTimer));
			tapTimer %= 1;
		}
	}

    if (game.gameFinished) {
        if (time - minerSoulLastUpdated > 1000) {
			updateReincarnationGain();
			if (selectedUpgrade[1] == "$all") displayUpgrade(selectedUpgrade[0], selectedUpgrade[1]);
			
			let hasAuto;
			if (game.auto.tool) {
				hasAuto = true;
				upgradeTool("tool");
			}
			if (game.auto.comp) {
				hasAuto = true;
				upgradeTool("comp");
			}
			if (game.auto.artifact && (Decimal.gt(getUpgradeEffect("reincarnation", 9), 0) || Decimal.lt(game.artifactBoost, Decimal.mul(getUpgradeEffect("normal", 5), getUpgradeEffect("normal", 6))))) {
				hasAuto = true;
				useArtifact();
			}
		}

		let soulsPending = Decimal.mul(game.minerSoulRate, delta / 3600);
        game.minerSoulPending = Decimal.add(game.minerSoulPending, soulsPending);
    }
	if (game.auto.upgrade) {
		let rate = Decimal.add(game.level, 10).log10();
		autoUpgradeTime += rate * delta;
		while (rate >= 1) {
			if (buyUpgrade("normal", "$all")) {
				hasAuto = true;
				rate -= 1;
			} else {
				rate %= 1;
			}
		}
	}

	if (hasAuto) {
		updateOreDamageUI();
	}

    updateVisuals();

	setTimeout(tick, 100);
}

function attemptOfflineTime(delta) {
	game.timePlayed += delta;

	let messages = []

	if (Decimal.gte(game.level, 5)) {
		function getStats() {
			return {
				cash: game.cash,
				artifacts: game.artifacts,
				level: game.level,
				totalOresMined: game.totalOresMined,
			}
		}

		let oldStats = getStats();

		tapTimer += delta * game.tapSpeed;
		if (tapTimer > 0) {
			doIdleDamage(Math.floor(tapTimer));
			tapTimer %= 1;
		}

		let newStats = getStats();
		let statsDelta = Object.fromEntries(Object.keys(newStats).map(x => [x, Decimal.sub(newStats[x], oldStats[x])]))

		if (statsDelta.totalOresMined > 0)
		{
			let message = document.createElement("p");
			message.style.textAlign = "start";
			message.style.fontSize = "2.5vh";
			message.append(`Your companion mined ${format(statsDelta.totalOresMined)} ores, generating $${format(statsDelta.cash)}`);
			if (statsDelta.artifacts > 0) message.append(`, ${format(statsDelta.artifacts)} artifacts`);
			if (statsDelta.level > 0) message.append(`, ${format(statsDelta.level)} levels`);

			messages.push(message);
		}
	}

	if (getUpgradeEffect("reincarnation", "11a")) {
		let ascensionPointsToGet = Decimal.mul(getPendingAscensionPoints(), getUpgradeEffect("reincarnation", "11a")).mul(delta)
		game.ascensionPoints = Decimal.add(game.ascensionPoints, ascensionPointsToGet)

		let message = document.createElement("p");
		message.style.textAlign = "start";
		message.style.fontSize = "2.5vh";
		message.append(`${format(ascensionPointsToGet)} AP got passively generated`);
	}

    if (game.gameFinished) {
		updateReincarnationGain();
		let soulsPending = Decimal.mul(game.minerSoulRate, delta / 3600);
        game.minerSoulPending = Decimal.add(game.minerSoulPending, soulsPending);

		let message = document.createElement("p");
		message.style.textAlign = "start";
		message.style.fontSize = "2.5vh";
		message.append(`${format(soulsPending)} pending miner's souls became available in Reincarnation`);

		messages.push(message);
    }

	if (!messages.length) return;

	messages.unshift("While you're away:");

	let title = document.createElement("h3");
	title.style.margin = "0 0 1.5vh 0";
	title.style.fontSize = "4vh";
	title.style.fontWeight = "normal";
	title.style.color = "#ffb";
	title.append(`You were away for ${formatDuration(delta)}`);
	messages.unshift(title);

	showPopup(...messages);
}

window.addEventListener("DOMContentLoaded", () => {
    load()
    loadOre(game.currentOre);
    adjustDivSize();
	tick();
    if (!window.isDevVersion || true) setInterval(save, 5000)
})

window.addEventListener("error", (e) => {
	alert(e.message + "\n" + e.filename + ":" + e.lineno + ":" + e.colno + "\n\nPlease contact the developer.")
})