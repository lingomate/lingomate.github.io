---
name: textbook-to-quiz
description: 把 PDF 英语电子教材自动转换为"英语伴学"网页的题库数据文件（data/<id>.json：闯关题目+单元词汇表+课文跟读）。当用户给出教材 PDF 并要求"转录/转换/生成题库/新增教材"时使用。适用于沪教版等图片版或文字版教材，产出与现有 4B/5A 格式完全一致并自动注册到 books.json。
---

# PDF 英语教材 → 英语伴学 data 文件

## 输入（向用户确认，缺失才问）
- PDF 路径；课本 id（年级+册别：4A/4B/5A/5B/6A…，A=上册）；title（如"四年级上册"）；icon（📕📘📗📙…避免与现有重复）
- subtitle 默认"上海教育出版社 · 沪教版"；已有知识点汇总 md 可作交叉验证

## 输出契约（与 data/4B.json、data/5A.json 逐字段一致）
`data/<id>.json`：
```json
{
  "id": "6A", "title": "六年级上册", "subtitle": "上海教育出版社 · 沪教版", "icon": "📙",
  "units": [{ "name": "Unit 1", "title": "中文单元名", "icon": "🏃", "color": "#ff9800",
    "en": "单元英文标题",
    "vocab": [{ "en": "go jogging", "cn": "去慢跑" }],
    "read":  [{ "en": "Mum: Hurry up!", "cn": "妈妈：快点！", "st": "课文 · 板块名", "sp": "p.4–5", "sec": "拓展阅读(仅拓展句才有)" }]
  }],
  "questions": { "1": [ … ] }
}
```
- 题目 type 白名单：**单词/句型/听写/语音/交际**（禁止 课文/拓展）
- 听写题 q 固定：`仔细听单词，拼写出它的英文`
- 完形填空归"句型"：题干含 `____`；多空题答案按空序以 `; ` 分隔（如 `"hard work; good luck"`），每空各出现一次 `____`

## 流程
1. **探测**：`py -c` 用 pymupdf 打开，抽样 get_text()——文字层字符 <500 即图片版，渲染 `dpi=150` 到 `_pages/pNNN.png`，用 read_image 精读；有文字层直接文本处理。
2. **结构**：读目录页得单元数/页码范围/Words List 页码；**实测页码偏移**（书页+偏移=PDF页，不同书不同，+6/+7 都出现过）。翻到书末读 Words List 与 Proper nouns/Daily expressions 附录。
3. **vocab**：以**书末 Words List 为准**（正文框内词表常不全）。去 `*`/`**` 标记；`a.m. / p.m.` 拆两条；保留短语；剔除句子词条（含 `...`/`!`/`?`/超4词）。中文照抄。
4. **read**：每单元 Explore 主课文（st=`课文 · <标题>`）+ Extend 拓展（st=`拓展阅读 · <标题>`，每句加 `"sec":"拓展阅读"`）。逐句拆分，en 照抄原文，句末 `.`/`!`/`?`；对话保留 `Mum: ` 前缀（程序运行时剥离），教材无印刷人名不要自加。排除练习指令/chant/Learn 语法框/Communicate 听力脚本。每单元合计 14–40 句（校验上限 45）。
5. **questions**（每单元 26–34 题）：单词 10–14（覆盖 vocab 全部词条，英译中/中译英各半）；句型 8–10（含 1–2 完形）；听写 4（word 纯字母空格，短语/带标点词不进听写）；语音 2（该单元 Sounds 音素辨音，options 全英文；无 Sounds 板块则 0 题并入句型）；交际 2（Communicate/Daily expressions 情景应答）。每题恰 4 选项，answer 0–3 均匀分布，干扰项同类 plausible，题干/听写词不重复。
6. **并行**：单元数≥4 时每单元派一个子代理（给图片路径+页码范围+偏移+契约+配额+硬规则+自检要求），产出 `data/bank_<id>_U<n>.json`、`data/read_<id>_U<n>.json`、`data/vocab_<id>_U<n>.json`。并发上限 8，完成一个补派一个。
7. **合并**：跑下方校验脚本生成 `data/<id>.json`；`data/books.json` 追加 `{ "id": "<id>", "file": "data/<id>.json" }`（引擎自动按年级排序，位置随意）。
8. **校验**：JSON 结构/配额/去重全过 → 每单元 shuffle 抽 15 题×1000 次模拟 → HTTP 冒烟（起 serve_qr.py，fetch `/`、`/data/books.json`、`/data/<id>.json`、`/app.js` 全 200）→ 停服清端口（`Get-NetTCPConnection -LocalPort 8000` 查占用者逐个 Stop-Process，批量命令内 Stop-Process 可能静默失败，须单独复查）→ 删除 `_pages/`、bank/read/vocab 中间文件、临时脚本。
9. **汇报**：每单元题型数量表、vocab 总词数、read 总句数（主课文+拓展）、校验清单、books.json 注册结果。

## 已知坑
- 图片版 PDF get_text() 只有水印；词表以书末 Words List 为准
- 听写 word 含 `.`/`…`/数字会导致朗读与判分异常（脚本正则强校验）
- 子代理可能改写听写 q 文案——合并时统一重置标准文案
- Windows 下 `node -e` 内联脚本引号/`$` 会被 PowerShell 转义破坏——一律写临时 .cjs 跑完即删
- 现有课本 id 已用：4B（四下）、5A（五上）；新教材勿冲突

## 合并校验脚本模板（`_merge_<id>.cjs`，跑完即删）
```js
const fs = require('fs');
const ID = process.argv[2], N = Number(process.argv[3]);
const META = JSON.parse(fs.readFileSync(`_${ID}_meta.json`, 'utf8')); // {title,subtitle,icon,units:[{name,title,icon,color,en}]}
const ALLOWED = new Set(['单词','句型','听写','语音','交际']);
const DICT_Q = '仔细听单词，拼写出它的英文';
const errs = [];
const norm = s => String(s).replace(/\s+/g,' ').trim().toLowerCase();
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const out = { id: ID, title: META.title, subtitle: META.subtitle, icon: META.icon, units: META.units, questions: {} };
for (let u = 1; u <= N; u++) {
  const bank = JSON.parse(fs.readFileSync(`data/bank_${ID}_U${u}.json`, 'utf8'));
  const read = JSON.parse(fs.readFileSync(`data/read_${ID}_U${u}.json`, 'utf8'));
  const vocab = JSON.parse(fs.readFileSync(`data/vocab_${ID}_U${u}.json`, 'utf8'));
  if (bank.length < 26 || bank.length > 34) errs.push(`U${u} 题数 ${bank.length}`);
  if (read.length < 10 || read.length > 45) errs.push(`U${u} 跟读句数 ${read.length}`);
  const stems = new Set(), words = new Set(), dist = {};
  for (const q of bank) {
    if (!ALLOWED.has(q.type)) errs.push(`U${u} 非法题型 ${q.type}`);
    if (q.type === '听写') {
      if (!q.word || !q.cn || !/^[A-Za-z0-9' ]+$/.test(q.word)) errs.push(`U${u} 听写word非法 ${q.word}`);
      if (words.has(norm(q.word))) errs.push(`U${u} 听写重复 ${q.word}`);
      words.add(norm(q.word)); q.q = DICT_Q;
    } else {
      if (!Array.isArray(q.options) || q.options.length !== 4 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errs.push(`U${u} 选项/答案非法 ${q.q}`);
      const k = q.type + '|' + norm(q.q);
      if (stems.has(k)) errs.push(`U${u} 题干重复 ${q.q}`);
      stems.add(k);
    }
    dist[q.type] = (dist[q.type]||0)+1;
  }
  for (const s of read) if (!s.en || !s.cn || !s.st || !s.sp) errs.push(`U${u} 跟读缺字段`);
  out.questions[u] = bank.map(({unit, ...r}) => r);
  out.units[u-1].vocab = vocab;
  out.units[u-1].read = read;
  console.log(`U${u}: ${bank.length}题`, JSON.stringify(dist));
}
if (errs.length) { console.error('✗', errs.join('\n')); process.exit(1); }
for (let u = 1; u <= N; u++) for (let t = 0; t < 1000; t++) {
  const d = shuffle(out.questions[u]).slice(0, 15);
  if (d.length !== 15 || new Set(d).size !== 15) { console.error(`U${u} 抽题模拟失败`); process.exit(1); }
}
fs.writeFileSync(`data/${ID}.json`, JSON.stringify(out, null, 2) + '\n');
console.log(`✓ data/${ID}.json 生成，总题数 ${Object.values(out.questions).reduce((s,a)=>s+a.length,0)}`);
```
