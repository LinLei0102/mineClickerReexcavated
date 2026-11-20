let autoUpgradeTime = 0;

let autoFunctions = {
    "advance": {
        name: "自动前进矿石",
        unlocked: () => game.minerSoulTotal >= 1,
        unlockText: () => format(1) + " 矿工灵魂"
    },
    "upgrade": {
        name: "自动购买升级",
        unlocked: () => game.minerSoulTotal >= 1e4,
        unlockText: () => format(1e4) + " 矿工灵魂"
    },
    "artifact": {
        name: "自动使用神器",
        unlocked: () => game.minerSoulTotal >= 1e5,
        unlockText: () => format(1e5) + " 矿工灵魂"
    },
    "comp": {
        name: "自动升级伙伴",
        unlocked: () => game.minerSoulTotal >= 1e7,
        unlockText: () => format(1e7) + " 矿工灵魂"
    },
    "tool": {
        name: "自动升级工具",
        unlocked: () => game.minerSoulTotal >= 1e9,
        unlockText: () => format(1e9) + " 矿工灵魂"
    },
}

function showAutoScreen() {
    document.getElementById("autoScreen").style.left = "0";
    updateAutoScreen();
}

function hideAutoScreen() {
    document.getElementById("autoScreen").style.left = "-100%";
}

function toggleAuto(id) {
    game.auto[id] = !game.auto[id];
    updateAutoScreen();
}

function updateAutoScreen() {
    for (const item in autoFunctions) {
        let data = autoFunctions[item];
        if (!data.element) {
            data.element = document.createElement("div");
            data.element.classList.add("thickButton");
            data.element.onclick = () => { if (data.unlocked()) toggleAuto(item); }
            document.getElementById("autoButtons").append(data.element);
        }

        let unlocked = data.unlocked();
        data.element.innerHTML = unlocked
            ? `${data.name}: ${game.auto[item] ? "开" : "关"}` 
            : `达到 ${data.unlockText()}`;
        data.element.style.color = unlocked ? "" : "#777";
    }
}