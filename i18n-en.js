/*
 * Time Mirror static interactive demo — English presentation layer.
 * English is the default (no flag). Simplified Chinese is opt-in via ?lang=zh.
 * UI chrome translated; dictionary is longest-first and single/ambiguous
 * tokens are matched only as whole nodes or inside explicit phrases.
 */
(function () {
  if (new URLSearchParams(window.location.search).get("lang") === "zh") {
    document.documentElement.lang = "zh-CN";
    document.addEventListener("DOMContentLoaded", function () {
      if (document.getElementById("tm-lang-en")) return;
      var a = document.createElement("a");
      a.id = "tm-lang-en"; a.href = "?"; a.textContent = "EN";
      a.setAttribute("aria-label", "View in English");
      a.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:3000;font:700 12px/1 system-ui,sans-serif;color:#5B4A1E;background:#E8D068;padding:6px 11px;border-radius:20px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.2)";
      document.body.appendChild(a);
    });
    return;
  }
  if (window.__tmI18nOn) return;
  window.__tmI18nOn = true;
  document.documentElement.lang = "en";

  var PAIRS = [
    ["：对话回复由本地检索 + 模板合成，未调用大模型，用来展示交互与检索逻辑；\n    完整版是 Next.js 16 全栈应用（流式接口接入大模型 + 数据库 + 对象存储），源码在本仓库", ": replies are composed by local retrieval + templates, with no LLM call, to demonstrate the interaction and retrieval logic. The full version is a Next.js 16 full-stack app (streaming LLM API + database + object storage); source is in this repository"],
    ["写下一件关于 TA 的小事：时间标签决定它归入哪一类时间，情绪与场景会进入分身的画像。", "Write one small memory about them: the time tag decides which category it belongs to; emotion and scene feed the persona profile."],
    ["给孩子创建数字分身 · 投喂回忆，让分身随记忆成长", "Create a digital double for your child · feed it memories and watch it grow"],
    ["给孩子创建数字分身 · ", "Create a digital double for your child · "],
    ["，让分身随记忆生长", " and watch it grow"],
    ["投喂回忆，让分身随记忆成长", "feed it memories and watch it grow"],
    ["例：第一次自己系鞋带，蹲在地上试了很多次才成功", "e.g. The first time they tied their own shoes, crouching on the floor and trying many times before succeeding"],
    ["光点连成时间线，每一条都是分身的记忆依据。", "Light points form a timeline; each one is a memory the double draws on."],
    ["每一次投喂都会多一粒光点，轮廓随之清晰。", "Every memory adds a point of light and makes the outline clearer."],
    ["Time Mirror · 时光镜像（交互演示）", "Time Mirror (Interactive Demo)"],
    ["自定义标签（逗号分隔）", "Custom tags (comma-separated)"],
    ["时间分类（可多选）", "Time category (multiple choice)"],
    ["参与投喂的回忆条目", "Memories fed in"],
    ["孩子的一天", "A child's day"],
    ["静态交互演示", "static interactive demo"],
    ["投喂这一颗光点", "Feed this light point"],
    ["回忆面板", "Memory panel"],
    ["成长中的幼苗", "Growing seedling"],
    ["成长度 50%", "Growth 50%"],
    ["分身进度", "Double progress"],
    ["回忆内容", "Memory content"],
    ["时光镜像", "Time Mirror"],
    ["客厅 / 公园", "Living room / Park"],
    ["好玩时间", "Play time"],
    ["好看时间", "Beauty time"],
    ["心流时间", "Flow time"],
    ["生存时间", "Survival time"],
    ["赚钱时间", "Earning time"],
    ["第一次, 坚持", "First time, Perseverance"],
    ["投喂回忆", "Feed memory"],
    ["这是 ", "This is a "],
    ["这是", "This is"],
    ["目录。", "directory."],
    ["对话", "Chat"],
    ["镜像", "Mirror"],
    ["专注", "Focus"],
    ["倔强", "Stubborn"],
    ["兴奋", "Excited"],
    ["场景", "Scene"],
    ["好奇", "Curious"],
    ["安静", "Calm"],
    ["开心", "Happy"],
    ["情绪", "Emotion"],
    ["成长", "Growth"],
    ["投喂", "Feed"],
    ["温柔", "Gentle"],
    ["骄傲", "Proud"],
    ["已投喂", "Fed"],
    ["光点 ", "Light points "],
    [" 粒", " points"],
    ["成长度", "Growth"],
    ["条回忆", "memories"]
  ];
  PAIRS.sort(function (a, b) { return b[0].length - a[0].length; });

  var ATTRS = ["placeholder", "title", "aria-label", "alt", "value"];
  var busy = false;
  function translate(s) {
    if (!s || !/[\u4e00-\u9fff]/.test(s)) return s;
    var out = s;
    for (var i = 0; i < PAIRS.length; i++) {
      if (out.indexOf(PAIRS[i][0]) !== -1) out = out.split(PAIRS[i][0]).join(PAIRS[i][1]);
    }
    return out;
  }
  function patchTextNode(n) {
    if (!n.nodeValue || !/[\u4e00-\u9fff]/.test(n.nodeValue)) return;
    var t = translate(n.nodeValue);
    if (t !== n.nodeValue) n.nodeValue = t;
  }
  function patchElement(el) {
    if (!el || !el.attributes) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]);
      if (v && /[\u4e00-\u9fff]/.test(v)) el.setAttribute(ATTRS[i], translate(v));
    }
  }
  function patchTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { patchTextNode(root); return; }
    patchElement(root);
    if (!root.querySelectorAll) return;
    var els = root.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) patchElement(els[i]);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var n;
    while ((n = w.nextNode())) patchTextNode(n);
  }
  function addSwitch() {
    if (document.getElementById("tm-lang-switch")) return;
    var a = document.createElement("a");
    a.id = "tm-lang-switch"; a.href = "?lang=zh"; a.textContent = "中文";
    a.setAttribute("aria-label", "Switch to Chinese");
    a.style.cssText = "position:fixed;left:14px;bottom:14px;z-index:3000;font:600 12px/1 system-ui,sans-serif;color:#5B4A1E;background:#E8D068;padding:6px 11px;border-radius:20px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.2)";
    document.body.appendChild(a);
  }
  function patchAll() {
    if (busy) return;
    busy = true;
    try { document.title = translate(document.title); patchTree(document.body); addSwitch(); }
    finally { busy = false; }
  }
  function boot() {
    patchAll();
    var obs = new MutationObserver(function (muts) {
      if (busy) return;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === "childList") { for (var j = 0; j < m.addedNodes.length; j++) patchTree(m.addedNodes[j]); }
        else if (m.type === "characterData") patchTextNode(m.target);
        else if (m.type === "attributes") patchElement(m.target);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
