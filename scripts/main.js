

function loadGame(loadgame) {
	game = deepCopy(loadgame, game);
	
	game.level = XPToLevel(Math.max(Math.floor(game.XP), 0))
	document.getElementById("level").innerHTML = format(game.level)
	let XPToNextLevel = levelToXP(game.level + 1) - levelToXP(game.level)
	let ProgressToNextLevel = (game.XP - levelToXP(game.level)).toFixed(1)
	document.getElementById("XPBar").style.width = (ProgressToNextLevel / XPToNextLevel * 100) + "%"

	updateSettings();
	updateCurrencies();

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
		setTimeout(tick, 100);
		return;
	}

	game.timePlayed += delta

	if (document.getElementById("statsScreen").style.left == "0px") {
		document.getElementById("timePlayed").innerHTML = formatDuration(game.timePlayed)
	}

	if (game.level >= 5) {
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
			if (game.auto.artifact && (getUpgradeEffect("reincarnation", 9) || game.artifactBoost < getUpgradeEffect("normal", 5) * getUpgradeEffect("normal", 6))) {
				hasAuto = true;
				useArtifact();
			}

			if (hasAuto) {
				updateOreDamageUI();
			}
		}
        game.minerSoulPending += game.minerSoulRate * delta / 3600;
    }
	if (game.auto.upgrade) {
		let rate = Math.log10(game.level + 10);
		autoUpgradeTime += rate * delta;
		let hasAuto = false;
		while (rate >= 1) {
			if (buyUpgrade("normal", "$all")) {
				hasAuto = true;
				rate -= 1;
			} else {
				rate %= 1;
			}
		}

		if (hasAuto) {
			updateOreDamageUI();
		}
	}

    updateVisuals();

	setTimeout(tick, 100);
}

function attemptOfflineTime(delta) {
	game.timePlayed += delta;

	let messages = []

	if (game.level >= 5) {
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
		let statsDelta = Object.fromEntries(Object.keys(newStats).map(x => [x, newStats[x] - oldStats[x]]))

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

    if (game.gameFinished) {
		updateReincarnationGain();
		var soulsPending = game.minerSoulRate * delta / 3600;
        game.minerSoulPending += soulsPending;

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