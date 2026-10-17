<div align="center">

# 🎓 LingoMate · 英语伴学

A **zero-dependency, pure-frontend, locally served** companion app for primary-school English:
quiz challenges + word dictation + read-aloud follow-up. Open it on your phone by scanning a QR code.

**[中文说明](README.md)** · English

</div>

> The Chinese README is the primary one; this file mirrors it. Section anchors: [What is this](#what-is-this) · [Three modes](#three-modes) · [Quick start](#quick-start) · [Project layout](#project-layout) · [Data format](#data-format) · [Technical notes](#technical-notes) · [Troubleshooting](#troubleshooting)

## What is this

A local web app for day-to-day English practice with a primary-school child. Textbook content
(Shanghai Education Press edition) lives entirely in **JSON question banks** — the program itself
contains no specific questions. Code, levels and data are three separate layers, so adding a new
textbook means adding one JSON file.

Everything runs in the browser: text-to-speech uses the built-in **Web Speech API** (no network,
nothing uploaded), and progress / dictation results are stored in `localStorage`. Start a local HTTP
server on your computer, connect your phone to the same Wi-Fi, scan a QR code, and go — or "Add to
Home Screen" and it feels like a native mini-app.

## Three modes

| Mode | Icon | Description |
|---|---|---|
| Quiz challenge | 🎯 | **15 questions** drawn at random from the unit bank; **70%** correct clears the stage (11 of 15), awarding 1–3 ⭐ based on the score. Question types: vocabulary / sentence patterns / dictation / phonics / communication |
| Word dictation | ✏️ | The whole unit's word list in **random order, each word read aloud three times**, with a selectable 5/10/15 s gap. Nothing is shown on screen while playing — write on paper, then tick off each word against the playback order and the result is logged automatically |
| Read-aloud follow-up | 🗣️ | Full-text subtitle scrolling, play one sentence then repeat it aloud. Dialogue lines get distinct male/female voices per speaker, and an **auto mode** rests 5/10/15 s after each sentence before advancing |

Also included:

- **Multiple textbooks**: the home screen lists everything in `data/books.json`, sorted by grade and
  volume; progress is saved per book.
- **Auto speech**: the English part of each new stem is read aloud automatically; after answering,
  only the **correct option** is spoken (cloze items are never pre-read, so they can't give the answer
  away). Toggle 🔊/🔇 any time.
- **Scoring details**: dictation ignores case and extra spaces; multi-blank cloze answers are
  `;`-separated in blank order and the completed sentence is read aloud.
- **Breadcrumbs**: Home › Book › Unit › Mode, with one-tap jumps to any level.
- **Dictation history**: keeps the last 200 runs, including per-word mastery data (`items`), with
  per-unit counts / average / latest score.

The UI itself is Chinese-only (labels, prompts and feedback messages are hard-coded in
[`app.js`](app.js)); the JSON banks keep an `en` field per sentence so read-aloud and dictation work
on English content regardless.

## Quick start

### Option 1 — one click (Windows, recommended)

1. Double-click [`启动手机伴学.bat`](启动手机伴学.bat) ("start phone companion")
2. A QR-code image opens in your browser and the console prints your LAN address, e.g.
   `http://192.168.1.23:8000/`
3. Connect the **phone to the same Wi-Fi**, scan the code with the iPhone camera, or type the address
   in Safari
4. Close the console window to stop the server; if it won't close, double-click
   [`停止服务.bat`](停止服务.bat) ("stop server")

> Rendering the QR *image* needs internet (it comes from an online QR service); the address itself
> works with no internet at all.
> Desktop only? Just open `http://localhost:8000/`.

### Option 2 — start a server manually

```bash
# Must be served over HTTP — double-clicking index.html will fail to load the banks
py serve_qr.py              # or python serve_qr.py
# Any static server works as well
python -m http.server 8000
```

### Option 3 — without a computer

The app is plain static files, so any static host works: deploy `index.html`, `app.js` and `data/`
keeping the directory structure to any static host (GitHub Pages, a school server, a home NAS) and
open the URL on the phone.

> Note: **do not copy `index.html` to the phone and open it with Safari** — under `file://` browsers
> refuse to read local JSON, so the banks will always fail to load. On a phone, either run a local
> HTTP server from a file-manager app or serve the files as a URL.

## Project layout

```
LingoMate/
├── index.html              Page skeleton + all CSS (mobile-first, safe-area aware)
├── app.js                  Engine: book select / level map / quiz & scoring / speech / dictation / read-aloud
├── data/
│   ├── books.json          Book manifest (add one line per textbook)
│   ├── 4A.json             Grade 4 Vol.1 · 8 units
│   ├── 4B.json             Grade 4 Vol.2 · 8 units
│   └── 5A.json             Grade 5 Vol.1 · 8 units
├── serve_qr.py             Local HTTP server + LAN IP detection + QR code
├── 启动手机伴学.bat          One-click start (runs: py serve_qr.py)
├── 停止服务.bat              One-click stop (kills the serve_qr.py listener on port 8000)
├── stop_server.ps1           Script called by the .bat above
├── README.md                Chinese README (primary)
├── README-en.md              This file
├── 教材转题库-技能提示词.md   Full prompt + validator for converting a PDF textbook into a bank
├── .claude/skills/textbook-to-quiz/   The same conversion workflow packaged as a skill
└── 英语/                   Textbook PDFs and notes (large local assets — not meant to be committed)
```

## Bundled textbooks

| id | Book | Units | Words | Read-aloud sentences | Questions |
|---|---|---|---|---|---|
| 4A | 📕 Grade 4 Vol.1 | 8 | 124 | 204 | 246 |
| 4B | 📘 Grade 4 Vol.2 (2024) | 8 | 301 | 255 | 247 |
| 5A | 📗 Grade 5 Vol.1 | 8 | 120 | 269 | 347 |
| **Total** | | **24** | **545** | **728** | **840** |

Question types across the three books: vocabulary 391 · sentence patterns 234 · dictation 104 ·
phonics 46 · communication 48 (+ 17 legacy `拓展` items in 5A).

## Data format

`data/books.json` is an array registering every book:

```json
[
  { "id": "4A", "file": "data/4A.json" },
  { "id": "4B", "file": "data/4B.json" }
]
```

Contract for `data/<id>.json` (full spec in
[`教材转题库-技能提示词.md`](教材转题库-技能提示词.md) — Chinese, see the skill folder for the same
workflow):

```json
{
  "id": "6A",
  "title": "六年级上册",
  "subtitle": "上海教育出版社 · 沪教版",
  "icon": "📙",
  "units": [
    {
      "name": "Unit 1",
      "title": "Chinese unit name",
      "icon": "🏃",
      "color": "#ff9800",
      "en": "English unit title (optional; shown and speakable when present)",
      "vocab": [ { "en": "go jogging", "cn": "去慢跑" } ],
      "read":  [ { "en": "Mum: Hurry up!", "cn": "妈妈：快点！",
                   "st": "课文 · section name", "sp": "p.4–5", "sec": "拓展阅读" } ]
    }
  ],
  "questions": {
    "1": [
      { "type": "单词", "q": "\"do chores\" 的中文意思是？",
        "options": ["放风筝", "做家务", "去野餐", "和朋友玩"], "answer": 1 },
      { "type": "句型", "q": "My grandpa ____ lots of plants.",
        "options": ["have", "has", "is", "like"], "answer": 1 },
      { "type": "听写", "q": "仔细听单词，拼写出它的英文", "word": "go jogging", "cn": "去慢跑" },
      { "type": "语音", "q": "Find the word in which the letter a says a different sound.",
        "options": ["cat", "apple", "cake", "bag"], "answer": 2 },
      { "type": "交际", "q": "Which sentence should you say in this situation?",
        "options": ["…", "…", "…", "…"], "answer": 0 }
    ]
  }
}
```

Notes:

- Field values are **matched literally by the engine**: `type` must use the Chinese labels below, and
  the dictation stem must be the fixed Chinese string. The `cn` fields are the Chinese meanings of
  words/sentences, so they stay in Chinese by design.
- `questions` is keyed by **unit number as a string** `"1".."N"`; the array is the unit's full bank,
  and 15 questions are sampled from it on each run.
- Allowed `type` values: **`单词` / `句型` / `听写` / `语音` / `交际`**
  (vocabulary / sentence pattern / dictation / phonics / communication). The engine still recognises
  the legacy labels `课文` and `拓展` for colouring only — don't use them in new books.
- Multiple-choice items need **exactly 4 options** and an integer `answer` in `0..3`, roughly evenly
  distributed across the unit.
- Cloze items belong to `句型`: use runs of underscores `____` in the stem and separate multi-blank
  answers with `;` in blank order.
- A dictation `word` may only contain letters / digits / apostrophes / spaces (a `.` or `…` breaks
  speech and grading), and its `q` must always be the fixed string `仔细听单词，拼写出它的英文`.
- `vocab` drives dictation, `read` drives read-aloud; a unit without them shows those cards greyed out.

## Adding a textbook (three steps, no code changes)

1. Copy `data/5A.json` to `data/5B.json` and edit `id` / `title` / `icon` plus the content (the shape
   stays identical).
2. Add `{ "id": "5B", "file": "data/5B.json" }` to `data/books.json`.
3. Reload the page. Books are sorted by grade/volume automatically, and the "choose a textbook"
   screen appears as soon as there is more than one.

To generate a bank straight from a scanned PDF textbook (page-by-page image reading, page-offset
probing, word list / read-aloud / question quotas, merge validator), hand the whole of
[`教材转题库-技能提示词.md`](教材转题库-技能提示词.md) to a vision-capable AI agent and append
"the PDF is at `<path>`, produce the bank for `6A`".

## Technical notes

| Topic | Implementation |
|---|---|
| Runtime dependencies | None. Plain HTML + vanilla JS + Python stdlib; no bundler, no build step, no npm packages |
| Speech | Browser `speechSynthesis`, preferring an `en-US` voice. Only the English part of a stem is spoken (`___` reads as "blank"); dialogue speakers get different voices |
| iOS compatibility | ① voice list loads asynchronously → polled until ready; ② iOS Safari silently stops long speech after ~15 s → an 8 s `pause()/resume()` keep-alive; ③ `viewport-fit=cover` + `safe-area-inset` for the notch; ④ double-tap zoom and phone-number detection disabled |
| State | `localStorage`, keys `english_quiz_progress_<bookId>` and `english_quiz_dict_records_<bookId>`; lost when the cache is cleared or the device changes |
| Rendering | Single skeleton with incremental `innerHTML` re-renders; the read-aloud list builds its skeleton once and only moves the highlight per sentence, so nothing flickers |
| Server | `serve_qr.py`: maps `/` to `index.html` (sidestepping Chinese-filename encoding issues), directory listing shows only HTML files, access logging silenced |
| Safety | All data stays local and no business network calls are made (the QR image is the one exception); the book titles on the selection screen go through `escapeHtml`. Bank JSON is treated as locally trusted content — don't load question banks from unknown sources |

## Troubleshooting

**"⚠️ 题库加载失败" (failed to load the bank).**
Almost always caused by opening `index.html` directly — browsers block `fetch` of local JSON under
`file://`. Serve it over HTTP (`启动手机伴学.bat`, or `python -m http.server 8000`).

**The phone can't reach the computer's address.**
Make sure both are on the same Wi-Fi (not cellular / a guest network). Windows Firewall may prompt on
first run — allow port 8000 on private networks. Otherwise check `http://localhost:8000/` on the
computer first to confirm the server itself works.

**No sound / odd pronunciation.**
Speech uses the OS voices. ① Install an English voice (iOS: Settings → General → Accessibility →
Spoken Content; Windows: Settings → Time & Language → Speech). ② On Apple devices, check the silent
switch and let Safari play sound. ③ On the first question you may need to tap 🔊 to wake the engine.

**Can I pause or skip during dictation?**
Yes — use ⬅ previous / next ➡ to jump, 🔊 to replay the current word, or ⏹ to stop playback. The
self-check list only includes words that were **already played**, so it can't spoil upcoming ones.

**Does progress sync across devices?**
No. Progress lives in each device's browser storage only.

**Port 8000 is busy.**
Edit `PORT = 8000` at the top of `serve_qr.py` (and the port in `停止服务.bat` / `stop_server.ps1`),
or run `停止服务.bat` first to clear a stale process.

**The UI is in Chinese.**
Expected — labels are hard-coded in [`app.js`](app.js). Translating them is a string-level change in
one file; the data format itself does not care about UI language.

## Browser support

Safari (iOS 14+, recommended), Chrome and Edge on desktop and mobile. Requires `speechSynthesis` and
`localStorage`; browsers without speech support show a hint to use Safari or Chrome, and everything
apart from reading aloud still works.

## Notes

- Textbook PDFs and notes are copyrighted material kept for personal / family study only — please
  don't redistribute them; the `英语/` folder is not intended to be committed.
- The banks were transcribed by close reading of the textbooks; if something differs from the latest
  printed edition, trust the book and fix the JSON — patches welcome.
