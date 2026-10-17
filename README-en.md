<div align="center">

# 🎓 LingoMate · 英语伴学

A **zero-dependency, pure-frontend, locally served** companion app for primary-school English:
quiz challenges + word dictation + read-aloud follow-up. Open it on your phone by scanning a QR code.

**[中文说明](README.md)** · English

⚠️ For personal / family study use only, provided **with no warranty**, and carrying **no licence to
the textbook content**. Read the [Disclaimer](#disclaimer) before using or redistributing.

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
- **Built-in disclaimer**: shown as a confirmation dialog on first launch (and again whenever the
  terms version is bumped), with a permanent "📜 免责声明与版权说明" entry in the footer. The same
  terms also live at the [end of this file](#disclaimer), in [README.md](README.md#disclaimer), and
  in the header comments of [`app.js`](app.js) and [`serve_qr.py`](serve_qr.py).

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
├── LICENSE                   MIT — covers the source code only, NOT data/ banks or 英语/ textbooks
├── README.md                Chinese README (primary)
├── README-en.md              This file
├── 教材转题库-技能提示词.md   Full prompt + validator for converting a PDF textbook into a bank
├── .claude/skills/textbook-to-quiz/   The same conversion workflow packaged as a skill
└── 英语/                   Textbook PDFs and notes (~697 MB, ignored via .gitignore)
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

## License

The **original source code and documents** of this project are released under the
[MIT License](LICENSE) (Copyright © 2026 xiegengcai): you may use, modify and redistribute them
freely, provided the copyright and permission notices are retained.

That licence **does not cover the teaching material**. The `data/*.json` banks and the textbook PDFs
and notes under `英语/`, including word lists and definitions copied from the books, remain the
copyright of the original publishers and rightsholders and are not licensed by this repository.
See sections 3 and 4 of the [Disclaimer](#disclaimer).

```
LICENSE                  ← MIT, covering this project's original code and documents only
data/*.json, 英语/        ← third-party textbook content, © the original publishers, not for
                           redistribution
```

## Version control and line endings

- The repo ships [`.gitattributes`](.gitattributes): `*.bat` / `*.cmd` are forced to **CRLF** on
  checkout, while sources and documents (including `*.ps1`) are forced to LF.
- **Do not delete that file.** Without it, cloning onto macOS / Linux (or a Windows machine with
  `core.autocrlf=false`) yields an LF `.bat`; cmd.exe then desyncs on `rem` lines and executes the
  comment text as a command, which shows up as **the launcher window flashing open and closing
  immediately, with the app never starting**.
- Keep `.bat` comments as pure-ASCII `rem` lines: Chinese there is parsed under the OEM codepage
  before `chcp 65001` takes effect and breaks easily.
- `stop_server.ps1` must keep its **UTF-8 BOM**, otherwise Windows PowerShell 5.1 decodes it as ANSI
  and prints mojibake.
- `英语/` (textbook PDFs, ~697 MB) is listed in [`.gitignore`](.gitignore) and never enters version
  control.

## Browser support

Safari (iOS 14+, recommended), Chrome and Edge on desktop and mobile. Requires `speechSynthesis` and
`localStorage`; browsers without speech support show a hint to use Safari or Chrome, and everything
apart from reading aloud still works.

## Disclaimer

> Read this section in full before using the project — especially before sharing it with anyone else
> or deploying it publicly.

### 1. Intended use: a personal / family study tool

This project is a local English-practice app built for one family's own child. It is **for personal
and in-home study reference only**. It is not part of any school, training institution or official
teaching product, and it has **no affiliation with, endorsement from, sponsorship by, or licence
from** Shanghai Education Press or any textbook author/publisher. Do not use it for commercial
teaching, paid tutoring, or providing a service to third parties.

### 2. No warranty (AS IS)

The software and the question banks are provided "as is", **without any express or implied
warranty**, including but not limited to warranties of merchantability, fitness for a particular
purpose, accuracy, completeness, timeliness, or stability.

- The banks were transcribed sentence by sentence from the textbooks by manual and AI-assisted
  reading. **They may contain errors, ambiguities, or content that no longer matches the latest
  printed edition.** Treat the printed book your school issues and your teacher's guidance as
  authoritative; do not rely on this app as the sole basis for homework, exams, or admissions prep.
- Speech relies on the browser's and operating system's built-in TTS. **Pronunciation quality varies
  a lot between devices and installed voice packs**, especially for proper nouns, stress and
  sentence breaks. The read-aloud output is not a model of correct pronunciation — pair it with the
  audio that ships with the textbook.
- The author accepts **no liability** for any direct, indirect, incidental or consequential loss
  arising from use of, or inability to use, this project — including academic outcomes, time spent,
  and lost data.

### 3. Copyright of the textbook content

The textbook PDFs and notes under `英语/`, and the course-book sentences, word lists and Chinese
definitions in `data/*.json` that are copied from those books, are **copyrighted by the original
publishers and rightsholders**. This project **grants you no permission whatsoever** to use that
content.

- Do not upload the textbook PDFs or the bank JSON files to public repositories, cloud drives, chat
  groups, or anywhere else third parties can reach them. Do not redistribute, sell, or publish
  derivative versions of that content.
- `英语/` (~697 MB) is already excluded from version control by this repo's `.gitignore`. The
  `data/*.json` files committed here are likewise intended for local study only and are not fit for
  publication.
- If you are a rightsholder and believe content in this project infringes your rights, contact the
  author; removal or correction will be handled promptly.
- Make sure the copies of the textbooks you use were obtained lawfully.

### 4. Code licence: MIT (teaching material excluded)

The **original source code and documents** authored in this repository (`app.js` / `index.html` /
`serve_qr.py` / `stop_server.ps1` / the two `.bat` files / `README.md` / `README-en.md` /
`教材转题库-技能提示词.md` / `.claude/`) are released under the [MIT License](LICENSE): you may
freely use, copy, modify, merge, publish, distribute, sublicense and sell them, provided the
copyright and permission notices are retained.

**The MIT licence deliberately does not cover any teaching material.** The `data/*.json` banks
(course-book sentences, word lists and Chinese definitions, all transcribed from textbooks published
by Shanghai Education Press) and the PDFs and notes under `英语/` remain the copyright of their
respective rightsholders, and this project **grants you no permission to use that content**. In the
LICENSE the exclusion **follows the content, not the filename** — copying a bank sentence into
another file does not make it yours. Treat it as described in section 3: do not publish,
redistribute, sell, or release adaptations of the banks or the textbooks.

- You may delete or replace everything under `data/` and `英语/` and reuse the bare code under MIT
  terms; that is fully compliant.
- If you write your own original question bank (not copied from a textbook), that content is yours
  and you may licence it however you wish.
- Section 2's "no warranty" is consistent with the MIT AS-IS clause; the author is not liable for
  academic outcomes, time spent, or lost data.

### 5. Data and privacy

- The app has **no account system, makes no network calls to any application endpoint, and uploads
  nothing**. Quiz progress and dictation history are stored as plain text in the browser's
  `localStorage` under the keys `english_quiz_progress_<bookId>` and
  `english_quiz_dict_records_<bookId>`; a third key, `english_quiz_disclaimer_ack_<version>`,
  records only whether you acknowledged these terms (it contains no personal information).
- Consequently: **clearing browser data, switching device, switching browser, or using private
  mode erases all progress and history permanently.** Save screenshots or export the storage
  yourself if a record matters.
- ⚠️ **The one third-party network request**: when [`serve_qr.py`](serve_qr.py) renders the QR code,
  it sends your **machine's LAN IP and the access URL** as a parameter to the third-party image
  service `api.qrserver.com`. The address is a private range (e.g. `http://192.168.x.x:8000/`), but
  it still reveals that you are using the app and something about your network environment. If that
  is not acceptable, skip the QR step: read the URL printed in the console and type it into the
  phone manually, or generate the QR code offline — commenting out the `webbrowser.open(qr)` line in
  `serve_qr.py` removes the request entirely.
- Apart from that, a running page makes no outbound requests at all: vocabulary, questions and
  course-book sentences all come from the local `data/*.json` files, and the speech is synthesised
  on the fly by the browser / OS TTS — no online audio is ever downloaded.

### 6. Usage and safety notes

- **LAN exposure**: `serve_qr.py` binds to `0.0.0.0:8000` and is a **static file server**, so other
  devices on the same local network can not only load the page but **download any file in this
  directory by path** — including the textbook PDFs under `英语/` and the `data/*.json` banks. (The
  directory *listing* is filtered to HTML files; requesting a path directly still works.) Do not run
  it on public or untrusted networks such as airports and cafés, and stop it when you are done by
  closing the console window or running [`停止服务.bat`](停止服务.bat). The same caveat applies if you
  have any sync / tunneling tool on that machine.
- **Bank JSON is treated as locally trusted content.** Only a few dynamic strings are escaped; text
  inside `data/*.json` is rendered as HTML. **Do not load bank files from unknown sources**, and do
  not put untrusted content into them.
- **Children should use it with a parent present.** This app targets primary-school pupils — please
  manage screen time, and keep system voices, browser permissions and network settings under
  parental control.
- The project **collects nothing and can see nothing** about any user's learning. There is no cloud
  sync, leaderboard, teacher dashboard, or similar feature.

### 7. Other notes

- UI labels, prompts and feedback messages are in Chinese and hard-coded in [`app.js`](app.js); the
  data format itself is independent of the UI language.
- If a bank disagrees with the newest printed edition, trust the book and edit the JSON — corrections
  are welcome.
- The project still evolves around family needs and the data structure may change. The repository's
  current state is authoritative; backward compatibility is not promised.
