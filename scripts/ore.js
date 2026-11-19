
var currentLayer = 1
var previousLayer = 1

var timeSinceLevelUp = 0;
var oneShotIdleDamage = 0;

function getOreStats(x) {
	let length = oreNames.length;
	let rec = Math.floor((x - 1) / length);
	let index = (x - 1) % length;
	let factor = ((rec * rec + rec) / 2);

	let name = oreNames[index];
	if (index == length - 1 && rec) name = name + " " + romanize(rec + 1);
	else if (rec) name = "<small>Transcended" + (rec >= 2 ? `<sup>${format(rec)}</sup>` : "") + "</small> " + name;

	return {
		transLevel: rec,
		icon: index + 1,
		name: name,
		value: Decimal.pow(oreValues[index], rec + 1).mul(Decimal.pow(oreValues[length - 1] * 7, factor)),
		hitPoints: Decimal.pow(oreHitPoints[index], rec + 1).mul(Decimal.pow(oreHitPoints[length - 1] / 7, factor)),
		hardness: Decimal.max(oreHardnesses[index], (index + 1) * rec / 100).mul(Decimal.pow(oreHitPoints[index], rec)).mul(Decimal.pow(oreHitPoints[length - 1] / 7, factor)),
	}
}

function loadOre(x) {
	let stats = getOreStats(x);

	currentHitPoints = stats.hitPoints

	currentLayer = 1
	while ((x - 1) % oreNames.length >= layerPoints[currentLayer] - 1) currentLayer++;

	updateOreUI(stats);
}

function updateOreUI(stats) {
	stats ??= getOreStats(game.currentOre);

	if (game.currentOre % 77 == 76) {
		document.getElementById("oreIcon").style.filter = "none"
	}
	else if (stats.transLevel) {
		document.getElementById("oreIcon").style.filter = "drop-shadow(0 0 2vh " + levelToColour(stats.transLevel) + ")"
	}
	else {
		document.getElementById("oreIcon").style.filter = "drop-shadow(0 0 1vh #222)"
	}

	document.getElementById("oreIcon").style.backgroundImage = "url('assets/icons/ores" + (game.evilMode ? "Evil" : "") + "/" + stats.icon + ".png')"
	document.getElementById("oreName").innerHTML = stats.name
	let realName = document.getElementById("oreName").textContent;
	if (realName.length > 18) {document.getElementById("oreName").style.fontSize = "5vh"}
	else if (realName.length > 13) {document.getElementById("oreName").style.fontSize = "6vh"}
	else {document.getElementById("oreName").style.fontSize = "7vh"}
	document.getElementById("currentOreValue").innerHTML = "$" + format(stats.value)
	document.getElementById("currentHitPoints").innerHTML = format(currentHitPoints)
	document.getElementById("maxHitPoints").innerHTML = format(stats.hitPoints)
	document.getElementById("currentHardness").innerHTML = format(stats.hardness)


	document.getElementById("background").style.backgroundImage = "url('assets/icons/backgrounds" + (game.evilMode ? "Evil" : "") + "/" + (currentLayer) + ".png')"
	document.getElementById("background").style.boxShadow = game.currentOre > oreNames.length ? `inset 0 0 30vh ${levelToColour(stats.transLevel)}` : "";
	if (currentLayer != previousLayer) {
		setMessage(0,"Now entering: " + layerNames[currentLayer-1])
		previousLayer = currentLayer
	}
	
	if (game.currentOre == 1) {
		document.getElementById("arrowLeft").style.display = "none"
		document.getElementById("arrowSkipLeft").style.display = "none"
	}
	else {
		document.getElementById("arrowLeft").style.display = "block"
		document.getElementById("arrowSkipLeft").style.display = "block"
	}
	if (game.currentOre >= game.unlockedOres) {
		document.getElementById("arrowRight").style.display = "none"
		document.getElementById("arrowSkipRight").style.display = "none"
	}
	else {
		document.getElementById("arrowRight").style.display = "block"
		document.getElementById("arrowSkipRight").style.display = "block"
	}


	updateOreDamageUI(stats);
}

function updateOreDamageUI(stats) {
	stats ??= getOreStats(game.currentOre);

	let cashMulti = calculateFactorSum( 
			approximateFactorArray(
				getUpgradeEffect("reincarnation", 6) ? Infinity : getUpgradeEffect("normal", 9),
				getUpgradeEffect("normal", 3),
				getUpgradeEffect("normal", 13),
				5
			)
		);

	{
		let {damage, income, rate} = calculateOreDamage(game.currentOre, game.activeDamage, 
			approximateFactorArray(
				getUpgradeEffect("reincarnation", 7) ? Infinity : getUpgradeEffect("normal", 20),
				getUpgradeEffect("normal", 14),
				getUpgradeEffect("normal", "20a"),
				5
			)
		);
		income = Decimal.mul(income, cashMulti);

		switch(game.homeStat) {
			case "breakRate": 
				if (rate <= 1) {
					rate = 1 / rate;
					document.getElementById("currentDamage").innerHTML = 
						Decimal.gte(rate, 1000) ? format(rate) : formatWhole(rate, 2);
					document.getElementById("currentActiveStat").innerHTML = "breaks / tap";
				} else {
					document.getElementById("currentDamage").innerHTML = 
						Decimal.gte(rate, 1000) ? format(rate) : formatWhole(rate, 2);
					document.getElementById("currentActiveStat").innerHTML = "taps / break";
				}
				break;

			case "damage": default:
				document.getElementById("currentDamage").innerHTML = format(damage);
		}
			
		if (getUpgradeEffect("normal", 14) > 0 && Decimal.gt(damage, 0)) document.getElementById("currentDamage").prepend("~")

		let netGain = "$" + (Decimal.gte(income, 1000) ? format(income) : formatWhole(income, 2))
		if (Decimal.gt(cashMulti, 1) && Decimal.gt(damage, 0)) netGain = "~" + netGain;
		document.getElementById("currentNetGain").innerHTML = netGain

		document.getElementById("currentDamage").style.color = 
		document.getElementById("currentNetGain").style.color = Decimal.gt(damage, 0) ? "" : "#f44";
	}
	{
		let {damage, income, rate, minDamage} = calculateOreDamage(game.currentOre, game.idleDamage, 
			approximateFactorArray(
				getUpgradeEffect("reincarnation", 8) ? Infinity : getUpgradeEffect("normal", 21),
				getUpgradeEffect("normal", 15),
				getUpgradeEffect("normal", "21a"),
				25,
				1e-6 / Math.max(1, game.tapSpeed)
			)
		);

		rate = Decimal.div(rate, game.tapSpeed);
		damage = Decimal.mul(damage, game.tapSpeed);
		income = Decimal.mul(income, game.tapSpeed).mul(cashMulti);
		oneShotIdleDamage = minDamage;

		if (Decimal.gte(game.level, 5)) {
			switch(game.homeStat) {
				case "breakRate": 
					if (rate <= 1) {
						rate = 1 / rate;
						document.getElementById("currentIdleDamage").innerHTML = 
							Decimal.gte(rate, 1000) ? format(rate) : formatWhole(rate, 2);
						document.getElementById("currentIdleStat").innerHTML = "breaks / sec";
					} else {
						document.getElementById("currentIdleDamage").innerHTML = 
							Decimal.gte(rate, 1000) ? format(rate) : formatWhole(rate, 2);
						document.getElementById("currentIdleStat").innerHTML = "secs / break";
					}
					break;

				case "damage": default:
					document.getElementById("currentIdleDamage").innerHTML = format(damage);
			}
			
			if (getUpgradeEffect("normal", 15) > 0 && Decimal.gt(damage, 0)) document.getElementById("currentIdleDamage").prepend("~")
			
			let netGain = "$" + (Decimal.gte(income, 1000) ? format(income) : formatWhole(income, 2))
			if (Decimal.gt(cashMulti, 1) && Decimal.gt(damage, 0)) netGain = "~" + netGain;
			document.getElementById("currentIdleGain").innerHTML = netGain
		
			document.getElementById("currentIdle").style.display = "";
		} else {
			document.getElementById("currentIdle").style.display = "none";
		}

		document.getElementById("currentIdleDamage").style.color = 
		document.getElementById("currentIdleGain").style.color = Decimal.gt(damage, 0) ? "" : "#f44"
	}
}

function calculateFactorSum(critList) {
	let sum = new Decimal(0);
	critList.unshift([1, 1]);
	for (let i = 0; i < critList.length; i++) {
		let chance = critList[i][0] - (+critList[i+1]?.[0] || 0)
		let thisValue = critList[i][1]
		sum = Decimal.mul(thisValue, chance).add(sum);
	}
	return sum;
}
function calculateOreDamage(ore, damage, critList = []) {
	let stats = getOreStats(ore);
	critList.unshift([1, 1]);
	let result = {
		damage: new Decimal(0),
		minDamage: new Decimal(0),
		rate: new Decimal(0),
		income: new Decimal(0),
	}
	for (let i = 0; i < critList.length; i++) {
		let chance = critList[i][0] - (+critList[i+1]?.[0] || 0)
		let thisDamage = Decimal.mul(damage, critList[i][1]).sub(stats.hardness).max(0)
		result.damage = Decimal.mul(thisDamage, chance).add(result.damage);
		result.rate = Decimal.div(stats.hitPoints, thisDamage).ceil().reciprocate().mul(chance).add(result.rate);
		if (chance > 0 && Decimal.lte(result.minDamage, 0)) result.minDamage = thisDamage;
	}
	result.rate = result.rate.reciprocate();
	result.income = Decimal.div(stats.value, result.rate);
	return result;
}

function nextOre() {
	game.currentOre++
	loadOre(game.currentOre)
}

function previousOre() {
	game.currentOre = Math.max(game.currentOre-1, 1)
	loadOre(game.currentOre)
}

function firstOre() {
	currentLayer = 1
	while ((game.currentOre-1)>=layerPoints[currentLayer]) currentLayer++
	game.currentOre = layerPoints[currentLayer-1]
	loadOre(game.currentOre)
}

function lastOre() {
	currentLayer = 1
	while (game.currentOre>=layerPoints[currentLayer]) currentLayer++
	if (layerPoints[currentLayer] > game.unlockedOres) {
		game.currentOre = game.unlockedOres
		loadOre(game.currentOre)
	}
	else {
		game.currentOre = layerPoints[currentLayer]
		loadOre(game.currentOre)
	}
}

function calculateDamage() {
	game.damage = game.baseDamage = Decimal.mul(getToolDamage("tool"), getUpgradeEffect("normal", 10));
	game.damage = Decimal.div(game.artifactBoost, 100).add(1).mul(game.damage)
	game.damage = Decimal.div(game.ascensionPoints, 100).add(1).mul(game.damage);

	game.activeDamage = Decimal.mul(game.damage, getUpgradeEffect("normal", 1))
	game.activeDamage = Math.round(game.activeDamage)
	
	game.idleDamage = Decimal.mul(game.damage, getUpgradeEffect("normal", 2))
	game.idleDamage = Math.round(game.idleDamage)

	game.tapSpeed = Decimal.gte(game.level, 5) ? getToolDamage("comp") : 0;
}

function mineOre() {
	let damage = game.activeDamage;
	let factors = doFactors(
		1,
		getUpgradeEffect("normal", 14),
		getUpgradeEffect("normal", "20a"),
		getUpgradeEffect("reincarnation", 7) ? Infinity : getUpgradeEffect("normal", 20)
	)

	let stack = 0;
	let factor = new Decimal(0);
	for (let f in factors) {
		factor = Decimal.pow(5, f).mul(factors[f]).add(factor);
		if (factors[f] > 0) stack = Math.max(stack, f);
	}
	
	if (stack) {
		setMessage(1,"Critical hit!" + (stack > 1 ? " x" + format(stack) : ""));
		flash("currentHitPoints", "#f88");
	}
	dealDamage(Decimal.mul(damage, factor));
}

function doIdleDamage(times) {

	let damage = game.idleDamage;
	let maxFactor = 0;
	let factors = doFactors(
		times, 
		getUpgradeEffect("normal", 15),
		getUpgradeEffect("normal", "21a"),
		getUpgradeEffect("reincarnation", 8) ? Infinity : getUpgradeEffect("normal", 21)
	)
	for (let factor in factors) {
		factorTimes = factors[factor];
		dealDamage(Decimal.pow(25, factor).mul(damage), factorTimes);
		maxFactor = Math.max(maxFactor, factor);
	}
}

function dealDamage(damage, times = 1) {
	let stats = getOreStats(game.currentOre);
	damage = Decimal.sub(damage, stats.hardness);
	if (Decimal.lte(damage, 0)) return;

	let timesPerLoot = Decimal.div(stats.hitPoints, damage).ceil();
	let effectiveHitPoints = Decimal.mul(damage, timesPerLoot);
	let timesAlreadyHit = Decimal.sub(effectiveHitPoints, currentHitPoints).div(damage).floor();
	if (timesAlreadyHit.add(times).gte(timesPerLoot)) {
		lootOre(timesAlreadyHit.add(times).div(timesPerLoot).floor().max(1).toNumber());
		times = Decimal.add(times, timesAlreadyHit).toNumber() % timesPerLoot;
		currentHitPoints = Decimal.sub(stats.hitPoints, Decimal.mul(damage, times));
	} else {
		currentHitPoints = Decimal.sub(currentHitPoints, Decimal.mul(damage, times));
	}

	document.getElementById("currentHitPoints").innerHTML = format(currentHitPoints)

	if (game.auto.advance) {
		let nextStats = getOreStats(game.currentOre + 1);
		if (Decimal.gte(oneShotIdleDamage, nextStats.hitPoints)) nextOre();
	}
}

function lootOre(times = 1) {
	let stats = getOreStats(game.currentOre);

	let factors = doFactors(
		times,
		getUpgradeEffect("normal", 3),
		getUpgradeEffect("normal", 13),
		getUpgradeEffect("reincarnation", 6) ? Infinity : getUpgradeEffect("normal", 9)
	)
	let maxFactor = 0;
	
	let cashGain = 0, artifactGain = 0;
	let cashFactorEffect = getUpgradeEffect("normal", "9a")
	for (let factor in factors) {
		cashGain = Decimal.pow(cashFactorEffect, factor).mul(factors[factor]).add(cashGain);
		artifactGain = Decimal.mul(getArtifactGain(factor), factors[factor]).add(artifactGain);
		if (factors[factor] > 0) maxFactor = Math.max(maxFactor, factor);
	}
	cashGain = Decimal.mul(cashGain, stats.value).mul(getUpgradeEffect("reincarnation", 1));

	game.cash = Decimal.add(game.cash, cashGain);
	game.ascensionCash = Decimal.add(game.ascensionCash, cashGain);
	game.minerSoulCash = Decimal.add(game.minerSoulCash, cashGain);
	if (maxFactor > 0) setMessage(2, "Ore duplicated!" + (maxFactor > 1 ? " x" + format(maxFactor) : ""))
	flash("cash", levelToColour(maxFactor))

	game.totalOresMined += times;
	game.XP = Decimal.add(game.XP, Decimal.pow(1.2, game.currentOre-1).div(1.3).mul(times));
	let newLevel = XPToLevel(game.XP);
	let isNewLevel = Decimal.neq(game.level, newLevel);
	game.level = newLevel;
	document.getElementById("level").innerHTML = format(game.level);
	let XPToNextLevel = levelToXP(Decimal.add(game.level, 1)).sub(levelToXP(game.level))
	let ProgressToNextLevel = Decimal.sub(game.XP, levelToXP(game.level))
	document.getElementById("XPBar").style.width = Decimal.div(ProgressToNextLevel, XPToNextLevel).mul(100) + "%";
	if (isNewLevel) {
		document.getElementById("XPBar").animate([
			{ filter: "grayscale(1) brightness(1.5)", width: "100%", left: "0", easing: "cubic-bezier(.2, .8, .2, .8)" },
			{ filter: "grayscale(1) brightness(1.5)", width: "100%", left: "100%", offset: 0.2 },
			{ filter: "none", width: "0", left: "0%", offset: 0.2, easing: "cubic-bezier(.2, .8, .2, .8)" },
			{ left: "0%" },
		], {
			duration: 1000,
		});
	}

	if (game.currentOre >= game.unlockedOres) {
		game.unlockedOres++;
		game.minerSoulBestOre = Math.max(game.minerSoulBestOre, game.unlockedOres);
		if (Decimal.gte(game.level, 10)) {
			artifactGain = Decimal.mul(artifactGain, getUpgradeEffect("normal", 23));
			game.artifacts = Decimal.add(game.artifacts, artifactGain);
			game.minerSoulArtifacts = Decimal.add(game.minerSoulArtifacts, artifactGain);
			setMessage(1,"Found an artifact!" + (maxFactor > 1 ? " x" + format(maxFactor) : ""))
			flash("artifacts", "#ff8");
		}
		document.getElementById("arrowRight").style.display = "block"
		document.getElementById("arrowSkipRight").style.display = "block"
	}
	else if (Decimal.gte(game.level, 10) && Math.random() < game.artifactChance) {
		game.artifacts = Decimal.add(game.artifacts, artifactGain);
		game.minerSoulArtifacts = Decimal.add(game.minerSoulArtifacts, artifactGain);
		setMessage(1,"Found an artifact!" + (maxFactor > 1 ? " x" + format(maxFactor) : ""))
		flash("artifacts", "#ff8");
	}
	if (game.currentOre == 78 && !game.gameFinished) {
		document.getElementById("gameFinishScreen").style.display = "block"
		game.gameFinished = true
	}

	updateCurrencies();
}

function approximateFactorArray(cap, chanceBase, chanceDecay, factor, minChance = 1e-6) {
	if (chanceBase <= 0) return [];
	let stack = Math.max(0, Math.min(cap, Math.floor(Math.log(chanceBase) / -Math.log(1 - chanceDecay))));
	let chance = 1;
	let array = [];
	while (chance > minChance && stack <= cap)
	{
		array.push([
			chance *= Math.min(1, chanceBase * (1 - chanceDecay) ** stack), 
			Decimal.pow(factor, stack)
		]);
		stack++;
	}
	return array;
}