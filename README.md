# Mine Clicker Re²-excavated（中英双语）

本仓库基于 [ducdat0507/mineClickerReexcavated](https://github.com/ducdat0507/mineClickerReexcavated) 的源码，在保留原版英文的同时加入了简体中文汉化。

## 语言切换

- `index.html` — 简体中文版（默认入口）
- `index.en.html` — 英文原版

在任意语言的「统计与信息 / Stats & Info」页面点击「语言 / Language」按钮即可切换。选择会保存在浏览器 `localStorage` 的 `mineClickerLang` 键中，下次打开 `index.html` 会自动进入上次使用的语言；若想临时以中文打开，可访问 `index.html?lang=zh`。

两个版本共用同一份存档（`mineClickerSave`），切换语言不会丢失进度。

## 来源与版权

- 原版《Mine Clicker》：Tolan（2014）
- 《Mine Clicker Re-excavated》：Demonin
- 《Re²-excavated》模组：ducdat0507
- 在线版本：<https://duducat.moe/mineClickerReexcavated/>

原作与模组版权归各自作者所有。本仓库仅整理并汉化公开网页资源，请勿用于商业用途。游戏内「统计与信息」页面保留了原始作者署名。

## 本地运行

纯静态页面，无需构建。建议用静态服务器打开（剪贴板/存档 API 在 `file://` 下可能受限）：

```bash
python -m http.server 8000
# 打开 http://localhost:8000/
```

操作：点击矿石图标或按任意键挖掘；底部按钮切换工具 / 升级 / 飞升 / 信息页面。存档保存在浏览器 `localStorage`，可在信息页面导出/导入。

## 汉化内容

- 全部界面文案：主界面、工具、神器、飞升、轮回、升级、统计与设置、弹窗与提示消息。
- 数据名称：78 种矿石、24 种工具、22 种伙伴、11 个地层，以及全部普通/轮回升级的标题、描述与解锁条件。
- 保留所有程序标识符、升级 ID 和存档字段名称不变，与英文原版存档互相兼容。

## 相对原版的改动

1. 新增中文入口与语言切换，英文原版脚本保留在 `scripts/`，中文脚本位于 `scripts/zh/`。
2. 修复原版已失效的资源引用（`texture1.png`、`toolIcons/1.png`、`oreIcons/1.png`、重复引入的 `style.css`、无效 favicon/prefetch）。
3. 导入存档失败时原本调用了不存在的 `navigator()`，改为弹出错误提示。

除此之外未改动游戏数值、公式与逻辑。

## 目录结构

```
index.html                  简体中文入口
index.en.html               英文入口
style.css / 98.css          样式
scripts/
  lang.js                   语言切换
  *.js                      英文原版游戏逻辑
  data/*.js                 英文原版数据
  zh/*.js                   中文游戏逻辑
  zh/data/*.js              中文数据
  ext/break_eternity.min.js 大数库（第三方，未改动）
assets/
  fonts/                    像素字体
  icons/                    矿石、背景、工具、伙伴与升级图标
*.png                       箭头、按钮等界面图片
```
