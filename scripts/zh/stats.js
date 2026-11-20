

function openStatsScreen() {
	document.getElementById("statsScreen").style.left = "0"
	document.getElementById("toolScreen").style.left = "100%"
	document.getElementById("upgradeScreen").style.left = "-100%"
	document.getElementById("totalOresMined").innerHTML = format(game.totalOresMined)
	if (game.numberFormat == "standard") {document.getElementById("numberFormat").innerHTML = "标准"}
	else if (game.numberFormat == "standardLong") {document.getElementById("numberFormat").innerHTML = "标准（长单位）"}
	else {document.getElementById("numberFormat").innerHTML = "科学计数"}
}

function closeStatsScreen() {
	document.getElementById("statsScreen").style.left = "-100%"
}