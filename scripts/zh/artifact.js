

function openArtifactScreen() {
	if (game.level >= 10) {
		document.getElementById("artifactScreen").style.left = "0"
		document.getElementById("ascensionScreen").style.left = "100%"
		document.getElementById("artifactChance").innerHTML = format(Decimal.mul(game.artifactChance, 100))
		document.getElementById("artifactBoost").innerHTML = format(game.artifactBoost)
		document.getElementById("artifactBoostCap").innerHTML = format(Decimal.mul(getUpgradeEffect("normal", 6), getUpgradeEffect("normal", 5)))
		document.getElementById("lastBoost").innerHTML = ""
	}
}

function closeArtifactScreen() {
	document.getElementById("artifactScreen").style.left = "100%"
}

function getArtifactGain(stack) {
    let gain = Decimal.pow(stack, getUpgradeEffect("normal", 22)).mul(getUpgradeEffect("normal", 12)).add(1)
    gain = gain.mul(getUpgradeEffect("reincarnation", 2));
    return gain;
}

function useArtifact() {
	let count = Decimal.min(getUpgradeEffect("normal", 11), game.artifacts);
	if (Decimal.gt(count, 0)) {
		game.artifacts = Decimal.sub(game.artifacts, count);
		game.artifactUsed = Decimal.add(game.artifactUsed, count);

		let multi = getUpgradeEffect("normal", 5);
		let maxBoost = getUpgradeEffect("normal", 6)
		let artifactBoost = 5 * Math.random() * (10 + (1 / Math.random() * (Math.random() * (count - 1) * 2 + 1)))
		if (Decimal.gt(artifactBoost, Decimal.pow(maxBoost, 0.5))) artifactBoost = Decimal.pow(maxBoost, 0.5).mul(artifactBoost).pow(0.5)
		artifactBoost = Decimal.mul(getUpgradeEffect("normal", 19), game.artifactUsed).div(multi).add(artifactBoost);
		if (Decimal.gt(artifactBoost, maxBoost)) {
			if (getUpgradeEffect("reincarnation", 9)) {
				let strength = getUpgradeEffect("reincarnation", "9a");
				artifactBoost = Decimal.pow(maxBoost, strength).mul(artifactBoost).pow(1 - strength);
			} else {
				artifactBoost = maxBoost;
			}
		}
		artifactBoost = Decimal.mul(artifactBoost, multi);

		if (Decimal.gt(artifactBoost, game.artifactBoost)) {
			game.artifactBoost = artifactBoost
			document.getElementById("artifactBoost").innerHTML = format(game.artifactBoost)
			document.getElementById("lastBoost").style.color = "#8f8"
			document.getElementById("lastBoost").innerHTML = "工具强化成功！（" + format(artifactBoost) + "%)"
			calculateDamage()
		}
		else {
			document.getElementById("lastBoost").style.color = "#bbb"
			document.getElementById("lastBoost").innerHTML = "强度不足……（" + format(artifactBoost) + "%)"
		}
		document.getElementById("gildingScreenArtifacts").innerHTML = format(game.artifacts)
	}
}