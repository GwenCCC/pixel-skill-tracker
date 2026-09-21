# Pixel Skill Tracker

**[▶ Live demo](https://gwenccc.github.io/pixel-skill-tracker/)** · [English](#english) | [中文](#中文)

---

## English

A pixel-art skill tracker: log what you practised, earn EXP, watch the levels go up. Single static page — no backend, no account, everything stays in your browser.

### Features

- **Dashboard** — total EXP, today's EXP, skill count and highest level, plus the full skill list with per-skill progress bars
- **Skills** — create, edit and delete skills across five categories (Learning, Sports, Creative, Life, Other)
- **Add record** — quick +10 / +25 / +50 / +100 buttons, plus a note field so you remember what the session actually was
- **History** — every record, newest first, with per-record delete
- **Themes** — five palettes (green, blue, purple, orange, red)
- **Local-first** — all state lives in `localStorage`; nothing is uploaded anywhere

### Run it

Hosted copy: **https://gwenccc.github.io/pixel-skill-tracker/** — or just open `index.html` in any modern browser. No build step, no server.

Create a skill on the **Skills** tab first, then add EXP on **Add Record**; the dashboard fills in as you go.

### Levelling

`level = floor(sqrt(exp / 100)) + 1`

Each level band gets its own colour, and the progress bar on a skill card shows how far into the current level you are.

### Files

```
index.html        # markup — the whole UI shell
styles.css        # pixel-art styling and the five colour themes
script.js         # state, localStorage persistence, rendering
需求文档.md        # the original design notes (Chinese)
LICENSE
```

### Notes

- The font is [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) from Google Fonts, so the first load needs network access; everything else works offline.
- Responsive down to phone width.
- "Reset all data" in Settings clears `localStorage` and starts you over.

---

## 中文

像素风格的技能经验追踪器：记录你练了什么、攒经验、看等级往上涨。纯静态单页，没有后端、不用注册，数据只存在浏览器本地。

**在线试玩：https://gwenccc.github.io/pixel-skill-tracker/**

### 功能

- **数据面板** — 总经验、今日经验、技能数量、最高等级，以及全部技能卡（带进度条）
- **技能管理** — 创建 / 编辑 / 删除技能，分五类（学习、运动、创意、生活、其他）
- **加经验** — +10 / +25 / +50 / +100 快捷按钮，附带备注栏，记下这次练了什么
- **历史记录** — 全部记录按时间倒序，可单条删除
- **主题** — 五种配色（绿、蓝、紫、橙、红）
- **纯本地** — 全部数据存在 `localStorage`，不上传任何地方

### 使用

打开 `index.html` 即可，无需构建、无需起服务；或直接访问上面的在线地址。先在「Skills」建技能，再到「Add Record」加经验，面板会自动汇总。

### 等级公式

`level = floor(sqrt(exp / 100)) + 1`。不同等级区间有不同配色，技能卡上的进度条显示当前等级内的进度。

### 文件

```
index.html        # 页面结构
styles.css        # 像素风样式与五套主题
script.js         # 状态、localStorage 持久化、渲染
需求文档.md        # 最初的设计说明
LICENSE
```

### 说明

- 字体用的是 Google Fonts 的 [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)，首次加载需要联网，之后其余功能离线可用。
- 响应式，窄到手机宽度也能用。
- 设置里的「Reset all data」会清空 `localStorage`，重新开始。

---

## License

MIT — see [LICENSE](LICENSE).
