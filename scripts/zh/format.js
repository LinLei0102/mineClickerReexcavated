

function format(x,forceLargeFormat=false) {
	x = new Decimal(x)
	if (!Number.isFinite(x.exponent)) {return x.toLocaleString("en-US")}
	if (Math.abs(x.exponent) >= 9e15) {return "∞"}
	if (!forceLargeFormat && Decimal.lt(x, 1e6)) return Math.floor(+x).toLocaleString("en-US");
	
	let exponent = Math.floor(Decimal.log10(x))

	if (game.numberFormat == "standard") {
		let illionIndex = Math.floor(exponent / 3);
		if (illionsShort[illionIndex-1])
			return formatSig(x.div(Decimal.pow(1000, illionIndex)), 5) + " " + illionsShort[illionIndex-1]
	}
	if (game.numberFormat == "standardLong") {
		let illionIndex = Math.floor(exponent / 3);
		if (illions[illionIndex-1])
			return formatSig(x.div(Decimal.pow(1000, illionIndex)), 3) + " " + illions[illionIndex-1]
	}
		
	return formatSig(Math.floor(x.div(Decimal.pow(10, exponent))*10000)/10000, 5) + "e" + exponent
}

function formatSig(x, digits = 2) {
	return (+x).toLocaleString("en-US", {
		minimumSignificantDigits: digits,
		maximumSignificantDigits: digits,
	})
}

function formatWhole(x, digits = 2) {
	return (+x).toLocaleString("en-US", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	})
}

function formatDuration(seconds) {
	let str = Math.floor(seconds % 60) + "秒"
	seconds /= 60; if (seconds < 1) return str
	str = Math.floor(seconds % 60) + "分 " + str
	seconds /= 60; if (seconds < 1) return str
	str = Math.floor(seconds) + "小时 " + str
	return str
}

function romanize(x) {
	x = +x
	if (!Number.isFinite(x)) return x.toLocaleString("en-US");
	var digits = String(+x).split(""),
		key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
			"","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
			"","I","II","III","IV","V","VI","VII","VIII","IX"],
		roman = "",
		i = 3;
	while (i--)
		roman = (key[+digits.pop() + (i * 10)] || "") + roman;
	return Array(+digits.join("") + 1).join("M") + roman;
}
