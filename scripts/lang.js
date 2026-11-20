// 语言切换 / Language switch
// 中文入口: index.html  |  English entry: index.en.html
(function () {
  var KEY = "mineClickerLang";
  function isEnglishPage() { return /index\.en\.html/i.test(location.pathname); }
  window.switchLanguage = function () {
    var next = isEnglishPage() ? "zh" : "en";
    try { localStorage.setItem(KEY, next); } catch (e) {}
    location.href = next === "en" ? "index.en.html" : "index.html?lang=zh";
  };
  var pref = null;
  try { pref = localStorage.getItem(KEY); } catch (e) {}
  var forceZh = /[?&]lang=zh\b/.test(location.search);
  if (!forceZh && pref === "en" && !isEnglishPage()) {
    location.replace("index.en.html" + location.search);
  }
})();
