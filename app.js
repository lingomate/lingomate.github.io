// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2026 xiegengcai <xiegengcai@foxmail.com>
// Note: MIT applies to this source file only. Question-bank content under data/ and textbook
// material under 英语/ are third-party copyrighted and are NOT licensed by this project.

// ===================== 英语伴学引擎（代码 / 关卡 / 题库 分离） =====================
// 目录结构：
//   index.html        页面骨架（样式）
//   app.js            引擎（本文件：课本选择 / 关卡地图 / 答题 / 判分 / 语音 / 听写，不含任何具体题目）
//   data/books.json   课本清单：添加新课本时在这里登记一行 {"id":"5B","file":"data/5B.json"}
//   data/5A.json      五年级上课时题库（一份课本一个文件）
//                        units 数组每项：{name,title,icon,color,en}
//                        name/title/icon/color=中文名/图标/主题色；en=单元英文标题（可选，有则显示并可🔊朗读）
//
// 添加新课本（如五年级下册）步骤：
//   1. 复制 data/5A.json 为 data/5B.json，修改里面的题目内容（格式完全一样）
//   2. 在 data/books.json 里加一行 {"id":"5B","file":"data/5B.json"}
//   3. 刷新页面即可，本文件不用改
//
// ----------------------------------------------------------------------------
// 法律提示 / Legal notice
//   本文件是「英语伴学 LingoMate」的一部分。免责声明与版权说明全文见
//   README.md 的「免责声明」章节（由 DISCLAIMER.md 单一来源同步），页面内亦可通过底部「📜 免责声明」
//   入口查看（渲染本文件下方的 DISCLAIMER_HTML）。要点：
//     · 仅供个人 / 家庭学习参考；按「现状」提供，不含任何明示或默示担保。
//     · 题库中照抄教材的词表、课文句与释义，著作权归原出版社及权利人所有；
//       本项目不授予任何使用许可，请勿分发、公开、售卖或改编发布这些内容。
//     · 源代码采用 MIT 许可证授权（见仓库根目录 LICENSE）；该许可证明确不覆盖
//       data/*.json 题库与 英语/ 教材内容——删除或替换数据后可自由复用本代码。
//     · 应用不上传学习数据；进度与听写记录仅存于浏览器 localStorage，清缓存即永久丢失。
//     · 本文件自身不发起任何网络请求；语音由浏览器 / 系统内置 TTS 现场合成。
//       公网部署时 index.html 会按需加载百度统计（本地 / 局域网 / 离线不加载），
//       其余唯一的第三方请求出现在 serve_qr.py 的在线二维码图片服务，见该文件说明。
// ----------------------------------------------------------------------------

// ===================== 免责声明（页面内展示） =====================
// 内容由 sync_disclaimer.py 从 DISCLAIMER.md 自动生成（下方 BEGIN/END 标记之间勿手改）；
// 修改条款请编辑 DISCLAIMER.md 后运行 `python sync_disclaimer.py`。
// 首次打开应用时以"需确认"模式弹出；之后可随时从底部入口以"查看"模式打开。
// 重要：条款文案有任何实质改动时，请把 DISCLAIMER_VERSION 递增，
// 已确认过的用户会重新看到一次确认（旧版本键不影响新版本判定）。
const DISCLAIMER_VERSION = '3';                 // 文案版本：升级后老用户会重新看到一次确认
const DISCLAIMER_KEY = 'english_quiz_disclaimer_ack_';   // + 版本号
/* === DISCLAIMER_HTML BEGIN（由 sync_disclaimer.py 从 DISCLAIMER.md 生成，勿手改） === */
const DISCLAIMER_HTML = `
  <div class="warn">请务必在使用（尤其是分发给他人或公开部署）之前完整阅读本节。</div>
  <h4>1. 用途定位：个人 / 家庭学习工具</h4>
  <p>本项目是为自家孩子做的本地英语学习辅助工具，<b>仅用于个人及家庭范围内的学习参考</b>。它不是学校、培训机构或任何官方教学产品的一部分，与上海教育出版社及各教材编写者、出版方<b>没有任何隶属、授权、赞助或背书关系</b>。请勿用于商业授课、牟利性培训或对外提供服务。</p>
  <h4>2. 不提供任何担保（AS IS）</h4>
  <p>本软件与题库数据按"现状"提供，<b>不附带任何形式的明示或默示担保</b>，包括但不限于对可商用性、特定用途适用性、准确性、完整性、及时性、稳定性的担保。</p>
  <ul>
  <li>题库内容为按教材逐句精读人工 / AI 整理而成，<b>可能存在错漏、歧义或与最新版纸质教材不一致之处</b>。请以学校发放的纸质课本和老师的讲解为准，不要将本应用作为作业、考试或升学备考的唯一依据。</li>
  <li>语音朗读依赖浏览器与操作系统的内置 TTS，<b>不同设备、不同语音包下的发音质量差异较大</b>（尤其对多音词、专有名词和句子的重音断句）。朗读结果不应被视为标准发音示范，请配合教材配套音频使用。</li>
  <li>因使用或无法使用本项目导致的任何直接、间接、附带或后果性损失（含学习成绩、时间投入、数据丢失），作者<b>不承担责任</b>。</li>
  </ul>
  <h4>3. 教材内容的版权归属</h4>
  <p><code>英语/</code> 目录内的教材 PDF、知识点 md，以及 <code>data/*.json</code> 中照抄教材的课文句、词表与释义，其<b>著作权均属于原出版社及相应权利人</b>，本项目<b>不授予你使用这些内容的任何许可</b>。</p>
  <ul>
  <li>请勿把教材 PDF、题库 JSON 上传到公开仓库、网盘、社群或任何可被他人获取的地方；请勿二次分发、售卖、改编后发布。</li>
  <li>请把 <code>英语/</code>（约 697 MB）排除在版本管理之外——本仓库的 <code>.gitignore</code> 已包含它。仓库中默认包含的 <code>data/*.json</code> 仅供本地学习使用，同样不适合公开。</li>
  <li>如权利人认为本项目涉及的内容侵犯了您的权益，请联系作者，将配合删除或更正。</li>
  <li>请确保你持有的教材副本本身来源合法。</li>
  </ul>
  <h4>4. 代码许可：MIT（教材内容除外）</h4>
  <p>本项目<b>原创的源代码与文档</b>（<code>app.js</code> / <code>index.html</code> / <code>serve_qr.py</code> / <code>stop_server.ps1</code> / 两个 <code>.bat</code> / <code>README.md</code> / <code>DISCLAIMER.md</code> / <code>sync_disclaimer.py</code> / <code>教材转题库-技能提示词.md</code> / <code>.claude/</code>）采用 MIT 许可证 授权：你可以免费使用、复制、修改、合并、发布、分发、再许可及销售，前提是保留版权与许可声明。</p>
  <p><b>但 MIT 许可证明确不覆盖任何教材内容</b>：<code>data/*.json</code> 题库（课文句、词表、释义均照抄自上海教育出版社出版的教材）与 <code>英语/</code> 目录内的 PDF 及笔记，其著作权归原出版社及相应权利人所有，本项目<b>不授予你使用这些内容的任何许可</b>。LICENSE 中的排除<b>跟随内容而非文件名</b>——把题库句子复制进别处，它仍是出版社的作品。请照第 3 节处理：不要公开、分发、售卖或改编发布题库与教材。</p>
  <ul>
  <li>你可以在<b>删除或替换全部 <code>data/</code> 与 <code>英语/</code> 内容</b>后，将纯代码以 MIT 条件自由复用与再分发，这完全合规。</li>
  <li>若你自行编写了原创题库（不抄教材），那部分由你所有，可按你自己的意愿授权。</li>
  <li>上文第 2 节"不提供任何担保"与 MIT 的 AS-IS 条款一致；对学习成绩、时间投入、数据丢失等损失，作者不承担责任。</li>
  </ul>
  <h4>5. 数据与隐私</h4>
  <ul>
  <li>本应用<b>没有账号系统、不联网请求任何业务接口、不上传任何学习数据</b>。闯关进度与听写记录只以明文形式保存在浏览器的 <code>localStorage</code> 里，键名为 <code>english_quiz_progress_&lt;bookId&gt;</code> 与 <code>english_quiz_dict_records_&lt;bookId&gt;</code>；另有一个 <code>english_quiz_disclaimer_ack_&lt;version&gt;</code> 记录你是否确认过本条款（不含任何个人信息）。</li>
  <li>这意味着：<b>清理浏览器缓存、换设备、换浏览器或使用无痕模式，进度与记录都会丢失且无法找回</b>。重要的成绩请自行截图或导出保存。</li>
  <li><b>访问统计（仅公网部署时）</b>：当页面通过公网域名（如 GitHub Pages）访问时，会加载百度统计脚本（<code>hm.baidu.com</code>）记录匿名的页面访问量与访问来源，用于了解部署情况；<b>不采集任何学习内容、进度或输入</b>。本地 / 局域网 / 离线访问时该脚本不会加载。如不愿被统计，可用广告拦截规则屏蔽 <code>hm.baidu.com</code>，或改用本地部署。</li>
  <li class="warn" style="list-style:none;margin-left:-18px">⚠️ <b>本地运行零外联</b>：二维码由页面内 <code>qr.js</code>（vendored <code>qrcode-generator</code>，MIT）<b>纯前端离线生成</b>，不会向任何第三方服务发送你的地址或数据；<code>serve_qr.py</code> 也仅在本地起静态服务，不发起任何出网请求。若你仍不想暴露局域网地址，可只用 <code>python -m http.server</code> 并手动在手机输入网址。</li>
  <li>除上述统计外，页面运行期间不会向外发送任何请求：词汇、题目、课文句子全部来自本地 <code>data/*.json</code>，朗读音频由浏览器 / 系统的内置 TTS 现场合成，不下载任何在线音频。</li>
  </ul>
  <h4>6. 使用与安全注意事项</h4>
  <ul>
  <li><b>局域网暴露</b>：<code>serve_qr.py</code> 监听 <code>0.0.0.0:8000</code> 且为静态文件服务——同一局域网内的其他设备不仅能访问页面，<b>还能按路径下载本目录下的任意文件</b>（包括 <code>英语/</code> 里的教材 PDF、<code>data/*.json</code> 题库；只有目录列表做了 html-only 过滤，直接给路径照样能取到）。请勿在机场、咖啡厅等公共或不受信网络下开启；不需要时及时关闭窗口或双击 <code>停止服务.bat</code>。若本机装有第三方同步 / 内网穿透工具，风险同样适用。</li>
  <li><b>二维码零外联</b>：手机扫码地址由页面内 <code>qr.js</code> 直接编码当前访问地址生成，全程不依赖任何第三方图片 / 二维码服务，也不会把你的地址发往外部。</li>
  <li><b>题库按本地可信内容处理</b>：引擎只对少数动态字符串做了转义，<code>data/*.json</code> 中的文本会被当作 HTML 渲染。请<b>不要加载来源不明的题库文件</b>，也不要在其中写入不可信内容。</li>
  <li><b>儿童使用需家长陪同</b>：本应用面向小学阶段学生，请家长控制屏幕使用时间；设备上的系统语音、浏览器权限与网络设置也建议由家长代为管理。</li>
  <li>本项目<b>不收集、也无法查看</b>任何使用者的学习数据；不存在"云端同步""排行榜""老师端"之类的功能。</li>
  </ul>
  <h4>7. 其它说明</h4>
  <ul>
  <li>界面文案（标签、提示、评语）为中文且硬编码在 <code>app.js</code> 中；数据格式本身与界面语言无关。</li>
  <li>题库如与最新纸质课本有出入，以课本为准，欢迎自行修正 JSON 后继续使用。</li>
  <li>本项目仍在按家庭使用需求迭代，数据结构可能调整；重大变更以仓库当前内容为准，不承诺向后兼容。</li>
  </ul>
`;
/* === DISCLAIMER_HTML END === */

// 打开免责声明弹窗。mode = 'ack'（首次使用，需点确认）| 'view'（随时查看，点关闭）
function openDisclaimer(mode) {
  const mask = document.getElementById('dlgMask');
  const body = document.getElementById('dlgBody');
  const foot = document.getElementById('dlgFoot');
  if (!mask || !body || !foot) return;
  body.innerHTML = DISCLAIMER_HTML;
  body.scrollTop = 0;
  const ack = mode === 'ack';
  foot.innerHTML = ack
    ? `<button class="btn btn-primary" onclick="ackDisclaimer()">我已阅读并理解，开始学习</button>
       <button class="dlg-alt" onclick="disagreeDisclaimer()">不同意，退出使用</button>`
    : `<button class="btn btn-next" onclick="closeDisclaimer()">关闭</button>`;
  mask.classList.add('show');
  // 查看模式下点遮罩可关；首次确认模式下必须点按钮，避免误触跳过
  mask.onclick = e => { if (!ack && e.target === mask) closeDisclaimer(); };
}

// 不同意：保持弹窗并提示（页面数据含受版权内容，无法在不同意的前提下继续使用）
function disagreeDisclaimer() {
  const body = document.getElementById('dlgBody');
  if (body) body.scrollTop = 0;
  alert('本应用仅供个人 / 家庭学习参考，题库含照抄教材的受版权内容，不提供任何保证。\n\n若不能接受上述条件，请关闭页面并删除本项目文件。');
}

function closeDisclaimer() {
  const mask = document.getElementById('dlgMask');
  if (mask) mask.classList.remove('show');
}

// 记录"已确认当前版本文案"
function ackDisclaimer() {
  try { localStorage.setItem(DISCLAIMER_KEY + DISCLAIMER_VERSION, '1'); } catch (e) {}
  closeDisclaimer();
}

// 首次打开（或文案版本升级后）弹出确认；已确认过则不打扰
function maybeShowDisclaimer() {
  let acked = false;
  try { acked = !!localStorage.getItem(DISCLAIMER_KEY + DISCLAIMER_VERSION); } catch (e) {}
  if (!acked) openDisclaimer('ack');
}

// 反馈与建议：用 mailto 预填环境信息，方便定位问题（不打扰，且不上传任何数据）
function openFeedback() {
  const ua = navigator.userAgent || 'unknown';
  let ctx = '';
  try {
    if (typeof BOOK !== 'undefined' && BOOK) {
      ctx += '当前课本：' + (BOOK.title || '?') + '\n';
      if (typeof state !== 'undefined' && state && state.currentUnit) {
        const u = BOOK.units[state.currentUnit - 1];
        ctx += '当前单元：' + (u ? u.name : '?') + '\n';
      }
    }
  } catch (e) {}
  const subject = encodeURIComponent('LingoMate 反馈与建议');
  const body = encodeURIComponent(
    '【反馈内容】\n\n（请在此描述您的问题或建议）\n\n\n---- 环境信息（可删除）----\n' +
    '设备/浏览器 UA：' + ua + '\n' +
    '是否支持语音朗读：' + ('speechSynthesis' in window ? '是' : '否') + '\n' +
    ctx +
    'LingoMate 版本：GitHub Pages 在线版'
  );
  // 优先尝试打开邮件客户端；失败则复制到剪贴板并提示
  const mail = 'mailto:xiegengcai@foxmail.com?subject=' + subject + '&body=' + body;
  const w = window.open(mail, '_blank');
  if (!w) {
    try {
      navigator.clipboard.writeText('xiegengcai@foxmail.com').then(
        () => alert('未能自动唤起邮件客户端。已将邮箱地址复制到剪贴板：\nxiegengcai@foxmail.com\n请手动发邮件，并把上面的环境信息一并附上，谢谢！'),
        () => alert('请手动发送邮件至：xiegengcai@foxmail.com\n（当前环境不允许自动打开邮件客户端或复制剪贴板）')
      );
    } catch (e) {
      alert('请手动发送邮件至：xiegengcai@foxmail.com');
    }
  }
}


let BOOK = null;      // 当前课本数据 {id,title,subtitle,units,questions}
let books = [];       // 课本清单（books.json）
let bookData = {};    // 各课本完整数据缓存 {id: {...}}

// ===================== 状态管理 =====================
let state = {
  completed: {}, // {1: {stars:3, score:14, total:15}, ...}
  currentUnit: 1,
  currentQ: 0,
  score: 0,
  selected: -1,
  answered: false,
  autoSpeak: true,   // 进入新题时是否自动朗读英文
  lastSpoken: null,  // 已自动朗读过的题目标识，避免重复朗读
  answeredCorrect: false, // 当前题是否答对（听写题结果展示用）
  drawn: []              // 本次闯关从单元题库中随机抽取的题目
};

// ===================== 语音朗读（Web Speech API，浏览器内置，无需联网） =====================
let enVoice = null;
let enVoices = [];   // 全部英文音色池（跟读时按角色分配）
let _voiceTimer = null;
let _voiceWarnShown = false;  // 无英文 voice 的提示只弹一次

// 华为/鸿蒙/安卓系统 TTS 引擎常不向页面暴露英文引擎、无法绑定具体 voice 对象
// （绑定后整句无声），且 pause/resume 续命会掐断朗读，故这类设备走安全路径：
// 不指定 voice、rate 用 1.0、跳过 keepalive。
const _isHuawei = /Huawei|HUAWEI|HarmonyOS|Android/i.test(navigator.userAgent || '');

// 无可用英文语音包时，非阻塞提示一次（不打断学习流）
function showVoiceWarn() {
  if (document.getElementById('voice-warn')) return;
  const d = document.createElement('div');
  d.id = 'voice-warn';
  d.textContent = '当前浏览器无可用英文语音包，朗读可能无声。可在系统“设置→辅助功能/语言→文字转语音”安装英文包，或改用 Chrome 打开。';
  d.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:90%;background:rgba(0,0,0,.82);color:#fff;padding:10px 14px;border-radius:10px;font-size:13px;line-height:1.5;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.3)';
  document.body.appendChild(d);
  setTimeout(() => { d.style.transition = 'opacity .4s'; d.style.opacity = '0'; setTimeout(() => d.remove(), 400); }, 5000);
}

function initVoices() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  if (!vs.length) return; // iOS 首次为空，等 onvoiceschanged 或轮询
  enVoices = vs.filter(v => /^en([-_]|$)/i.test(v.lang));
  // 优先选美音，其次任意英文音色
  enVoice = enVoices.find(v => /^en[-_]US/i.test(v.lang)) || enVoices[0] || null;
}

// iOS 兼容：音色列表异步加载，首次可能为空，轮询直到拿到
function ensureVoices() {
  if (!('speechSynthesis' in window)) return;
  initVoices();
  if (enVoice) return;
  let tries = 0;
  const iv = setInterval(() => {
    initVoices();
    if (enVoice || ++tries > 20) {
      clearInterval(iv);
      if (!enVoice) showVoiceWarn(); // 轮询耗尽仍无英文 voice（华为/鸿蒙常见）
    }
  }, 200);
}

// 从题目/选项的中英混排文本中提取英文部分（允许数字：9 p.m. / 7:10 a.m. 等由 TTS 读成 nine / seven ten）
function extractEn(text) {
  const m = text.match(/[A-Za-z][A-Za-z0-9\s.,!?'’;:()_-]*/g);
  if (!m) return '';
  return m.map(s => s.replace(/_+/g, ' blank ')   // 连续填空下划线读作一次 "blank"
                     .replace(/[.,!?;:()\s]+$/, '').trim())
          .filter(Boolean).join('. ');
}

function makeUtterance(en, voice, rate) {
  const u = new SpeechSynthesisUtterance(en);
  u.lang = 'en-US';
  // 华为/鸿蒙：系统 TTS 引擎常无法绑定具体 voice 对象（绑定后整句无声），
  // 且多数只接受 rate=1.0，故这类设备不指定 voice、用默认 rate。
  if (_isHuawei) {
    u.voice = null;
    u.rate = 1.0;
  } else {
    if (voice) u.voice = voice;
    else if (enVoice) u.voice = enVoice;
    // 语速 = 场景基准语速 × 用户语速倍率（滑条，存 localStorage）
    u.rate = Math.min(2, (rate || 0.85) * speakRateMul());
  }
  return u;
}

// ===================== 全局语速设置（滑条·4挡） =====================
// 挡位：慢0.7 / 稍慢0.85 / 正常1.0 / 稍快1.2；持久化在 localStorage，默认「正常」
const RATE_STEPS = [0.7, 0.85, 1.0, 1.2];
const RATE_NAMES = ['慢', '稍慢', '正常', '稍快'];

function speakRateMul() {
  let v = 0;
  try { v = parseFloat(localStorage.getItem('lingomate_rate')) || 0; } catch (e) {}
  if (!(v > 0)) return 1.0; // 未设置/无效 → 默认「正常」
  // 归到最近挡位（兼容旧存值）
  let best = RATE_STEPS[0];
  for (const s of RATE_STEPS) if (Math.abs(s - v) < Math.abs(best - v)) best = s;
  return best;
}

function rateIdx(v) {
  let i = 0;
  for (let k = 0; k < RATE_STEPS.length; k++) if (Math.abs(RATE_STEPS[k] - v) < Math.abs(RATE_STEPS[i] - v)) i = k;
  return i;
}

// 通用语速滑条片段：在有朗读的界面（跟读/听写/闯关）插入同一份标记
function rateSliderHTML() {
  const i = rateIdx(speakRateMul());
  return `
    <div class="rate-row">
      <span class="rate-label">🐢 语速</span>
      <input type="range" class="rate-range" min="0" max="${RATE_STEPS.length - 1}" step="1" value="${i}"
             oninput="onRateInput(this)" onchange="onRateChange()">
      <span class="rate-val">${RATE_NAMES[i]}</span>
    </div>`;
}

// 拖动中：即时保存 + 同步页面上所有滑条和文字（下次朗读即生效）
function onRateInput(el) {
  const v = RATE_STEPS[Math.round(Number(el.value))] || 1;
  try { localStorage.setItem('lingomate_rate', String(v)); } catch (e) {}
  const lbl = RATE_NAMES[rateIdx(v)];
  document.querySelectorAll('.rate-row').forEach(row => {
    const r = row.querySelector('.rate-range');
    const s = row.querySelector('.rate-val');
    if (r && r !== el) r.value = el.value;
    if (s) s.textContent = lbl;
  });
}

// 松手（change）：跟读模式立即按新语速重读当前句，直观反馈
function onRateChange() {
  if (rd) {
    rdToken++;
    clearTimeout(rd.timer);
    renderRead();
    speakReadCurrent();
  }
}

// 朗读一段文本中的英文（传原始文本即可，内部自动提取英文；onend：朗读结束回调；voice/rate：指定音色）
function speakText(raw, onend, voice, rate, _tries) {
  _tries = _tries || 0;
  const text = raw ? decodeURIComponent(raw) : '';
  if (!('speechSynthesis' in window)) { alert('当前浏览器不支持语音朗读，请使用 Safari 或 Chrome 打开。'); return; }
  const en = extractEn(text);
  if (!en) { if (onend) onend(); return; } // 无英文可读：立即回调，不拖到 4.5 秒兜底
  ensureVoices();
  speechSynthesis.cancel();
  // 音色未就绪时最多重试约 9 秒；超时后兜底用浏览器默认引擎朗读一次（华为/鸿蒙可能无声但至少不静默死循环）
  if (!enVoice) {
    if (_tries < 30) { setTimeout(() => speakText(raw, onend, voice, rate, _tries + 1), 300); return; }
    showVoiceWarn();
  }
  const u = makeUtterance(en, voice, rate);
  if (onend) { u.onend = onend; u.onerror = onend; }
  speechSynthesis.speak(u);
  startKeepAlive();
}

// 依次朗读多段文本（题目 + 各选项）
function speakSequence(texts) {
  if (!('speechSynthesis' in window)) return;
  const ens = texts.map(extractEn).filter(Boolean);
  if (!ens.length) return;
  ensureVoices();
  speechSynthesis.cancel();
  // iOS 上音色可能还没就绪，等一小会儿再读；华为等无英文语音包则兜底朗读
  if (!enVoice) {
    if (!speakSequence._tries || speakSequence._tries < 30) {
      speakSequence._tries = (speakSequence._tries || 0) + 1;
      setTimeout(() => speakSequence(texts), 300); return;
    }
    showVoiceWarn();
    speakSequence._tries = 0;
  } else {
    speakSequence._tries = 0;
  }
  ens.forEach(en => speechSynthesis.speak(makeUtterance(en)));
  startKeepAlive();
}

// iOS Safari 有个 bug：长朗读约15秒后会自动停止。
// 用一个低频 resume 定时器"续命"，只在有朗读在进行时开启。
// 华为/鸿蒙内核上 pause()+resume() 反而会掐断朗读，故这类设备直接跳过。
function startKeepAlive() {
  stopKeepAlive();
  if (_isHuawei) return;
  _voiceTimer = setInterval(() => {
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 8000);
}

function stopKeepAlive() {
  if (_voiceTimer) { clearInterval(_voiceTimer); _voiceTimer = null; }
}

function stopSpeech() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  stopKeepAlive();
}

// 完形填空（题干含 ___）判断
function isCloze(q) {
  return /_{2,}/.test(q.q);
}

// 听写判分归一化：忽略大小写和多余空格
function normalizeWord(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
}

// 答完题后播放"正确答案"的语音：
// 听写=单词本身；完形填空=补全后的整句；单词"中译英"题=正确选项（英文单词）；
// 语音题正确选项是音标（如 /w/）时改读题干中的例词；其余=正确选项（纯中文时回退题干英文）
function speakCorrectAnswer(q, onend) {
  let raw;
  if (q.type === '听写') raw = q.word;
  else if (q.type === '听音辨词') raw = q.word;                                  // 听音辨词：读正确答案对应的单词
  else if (isCloze(q)) raw = fillCloze(q);
  else {
    const opt = String(q.options[q.answer] || '');
    if (q.type === '单词' && /[A-Za-z]/.test(opt)) raw = opt;                                  // 中译英：读正确的英文词
    else if (q.type === '语音') raw = opt.replace(/[^A-Za-z]/g, '').length >= 2 ? opt : q.q;   // 辨音题读例词，辨词题读正确单词
    else if (q.type === '读音') raw = q.word || opt;                                          // 读音题：自动朗读读字母，否则读正确选项字母
    else if (/[A-Za-z]/.test(opt)) raw = opt;                                                  // 一般题：读正确选项
    else raw = q.q;                                                                            // 正确选项纯中文：回退读题干英文
  }
  speakText(encodeURIComponent(raw), onend);
}

// 完形填空补全：正确答案按空位依次填入，得到完整句子（供朗读整句）
// 多空题答案以 ';' 或 ',' 分隔各空（如 "Is, drawing"）；分隔数与空位数不符时整体填入第一空兜底
function fillCloze(q) {
  const blanks = (q.q.match(/_{2,}/g) || []).length;
  const ans = String(q.options[q.answer] || '');
  let parts = ans.split(/\s*;\s*/);
  if (parts.length === 1) parts = ans.split(/\s*,\s*/);
  if (blanks > 1 && parts.length === blanks) {
    let i = 0;
    return q.q.replace(/_{2,}/g, () => parts[i++]);
  }
  return q.q.replace(/_{2,}/, ans);
}

// 自动朗读开关
function toggleAutoSpeak() {
  state.autoSpeak = !state.autoSpeak;
  if (!state.autoSpeak) {
    stopSpeech();
  } else {
    // 刚打开开关：立即朗读当前题（完形填空不自动播放；选项不自动朗读，答后只读正确选项）
    const q = state.drawn[state.currentQ];
    state.lastSpoken = state.currentUnit + '-' + state.currentQ;
    if (q.type === '听写') speakText(encodeURIComponent(q.word));
    else if (!isCloze(q)) speakSequence([q.q]);
  }
  renderQuiz();
}

// 给题目和选项上的 🔊 按钮绑定点击事件（stopPropagation：点喇叭不触发选择）
function bindSpeakButtons() {
  document.querySelectorAll('[data-speak]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      speakText(el.getAttribute('data-speak'));
    });
  });
}

// 通关线：答对 70% 及以上
function passLine(total) {
  return Math.ceil(total * 0.7);
}

// ===================== 随机抽题 =====================
const DRAW_COUNT = 15;   // 每次闯关从单元题库中随机抽取的题数（题库已覆盖该单元全部知识点）

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 从单元题库中随机抽 DRAW_COUNT 题（题库不足时全取）
function drawQuestions(unitNum) {
  const bank = BOOK.questions[unitNum] || [];
  return shuffle(bank).slice(0, Math.min(DRAW_COUNT, bank.length));
}

// HTML 转义（防止课本数据中的特殊字符破坏页面）
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ===================== 进度存储（按课本分开保存） =====================
function progressKey() {
  return 'english_quiz_progress_' + (BOOK ? BOOK.id : '');
}

// 从localStorage读取进度
function loadProgress() {
  state.completed = {};
  try {
    const saved = localStorage.getItem(progressKey());
    if (saved) {
      const data = JSON.parse(saved);
      if (data.completed) state.completed = data.completed;
    }
  } catch(e) {}
}

// 保存进度
function saveProgress() {
  try {
    localStorage.setItem(progressKey(), JSON.stringify({
      completed: state.completed
    }));
  } catch(e) {}
}

// 读取某课本已保存的进度（不进游戏也能显示用）
function readCompleted(bookId) {
  try {
    const saved = localStorage.getItem('english_quiz_progress_' + bookId);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.completed) return data.completed;
    }
  } catch(e) {}
  return {};
}

// 更新顶部进度条
function updateProgress() {
  if (!BOOK) return;
  const total = BOOK.units.length;
  const done = Object.keys(state.completed).length;
  const pct = Math.round(done / total * 100);
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressText').textContent = `已完成 ${done} / ${total} 关`;
}

// ===================== 数据加载 =====================
function showLoadError() {
  const c = document.getElementById('content');
  c.innerHTML = '<div class="load-error">⚠️ 题库加载失败。<br>请不要直接双击打开本文件——请运行「启动手机伴学.bat」，用手机扫码或电脑访问显示的网址。</div>';
}

async function boot() {
  try {
    const res = await fetch('data/books.json', { cache: 'no-store' });
    books = await res.json();
    for (const b of books) {
      const r = await fetch(b.file, { cache: 'no-store' });
      bookData[b.id] = await r.json();
    }
  } catch (e) {
    showLoadError();
    return;
  }
  if (!books.length) { showLoadError(); return; }
  // 课本清单排序：按年级升序、上册在前（id 形如 "4A"/"4B"/"5A"；解析失败则保持原顺序）
  const rank = id => {
    const m = /^(\d+)([A-Z])$/i.exec(String(id));
    return m ? Number(m[1]) * 10 + (m[2].toUpperCase() === 'A' ? 0 : 1) : Infinity;
  };
  books.sort((a, b) => rank(a.id) - rank(b.id));
  if (books.length === 1) {
    loadBook(books[0]);
  } else {
    renderBookSelect();
  }
}

// 进入某一本课本
function loadBook(entry) {
  BOOK = bookData[entry.id];
  if (!BOOK || !BOOK.units || !BOOK.questions) { showLoadError(); return; }
  stopSpeech();
  // 重置答题状态
  state.currentUnit = 1;
  state.currentQ = 0;
  state.score = 0;
  state.selected = -1;
  state.answered = false;
  state.answeredCorrect = false;
  state.lastSpoken = null;
  loadProgress();

  // 页头 / 标题 / 底部信息随课本变化
  setHeader('quiz');
  renderMap();
  updateProgress();
}

// 设置页头文案：mode = 'quiz'（闯关）| 'dict'（听写）| 'read'（跟读）
function setHeader(mode) {
  if (!BOOK) return;
  const isDict = mode === 'dict';
  const isRead = mode === 'read';
  const label = isDict ? '英语听写' : isRead ? '课文跟读' : '英语伴学';
  const icon = isDict ? '✏️ ' : isRead ? '🗣️ ' : '🎓 ';
  const head = isDict ? '英语听写' : isRead ? '课文跟读' : '英语伴学';
  document.title = BOOK.title + label;
  document.getElementById('headerTitle').textContent = icon + BOOK.title + head;
  document.getElementById('headerSub').textContent = BOOK.subtitle || '';
  document.getElementById('progressWrap').style.display = (isDict || isRead) ? 'none' : '';
  document.getElementById('progressText').style.display = (isDict || isRead) ? 'none' : '';
  if (isDict) {
    document.getElementById('footerText').textContent =
      `${BOOK.title}英语听写 · 单元 1-${BOOK.units.length} · 每词读三遍，纸笔完成`;
  } else if (isRead) {
    document.getElementById('footerText').textContent =
      `${BOOK.title}课文跟读 · 单元 1-${BOOK.units.length} · 播一句跟读一句`;
  } else {
    const need = passLine(DRAW_COUNT);
    document.getElementById('footerText').textContent =
      `${BOOK.title}英语伴学 · 单元 1-${BOOK.units.length} · 每关 ${DRAW_COUNT} 题，答对 ${need} 题通关`;
  }
}

// ===================== 课本选择界面（多本课本时显示；只有一本时自动进入） =====================
function renderBookSelect() {
  stopSpeech();
  BOOK = null;
  document.title = '英语伴学';
  document.getElementById('headerTitle').textContent = '🎓 英语伴学';
  document.getElementById('headerSub').textContent = '选择要学习的课本';
  document.getElementById('progressWrap').style.display = 'none';
  document.getElementById('progressText').textContent = '';
  document.getElementById('footerText').textContent = '';

  const content = document.getElementById('content');
  let html = '<div class="map-title">📚 选择课本</div><div class="map-sub">点击课本卡片开始学习</div><div class="grid">';
  books.forEach(b => {
    const bd = bookData[b.id] || {};
    const n = (bd.units || []).length;
    const done = Object.keys(readCompleted(b.id)).length;
    html += `
      <div class="card" onclick="loadBookById('${b.id}')">
        <span class="icon">${bd.icon || '📖'}</span>
        <div class="name">${escapeHtml(bd.title || b.id)}</div>
        <div class="status">${n} 个单元 · 已完成 ${done} / ${n} 关</div>
      </div>`;
  });
  html += '</div>';
  content.innerHTML = html;
  setCrumb([{ t: '🏠 选择课本' }]);
}

function loadBookById(id) {
  const entry = books.find(b => b.id === id);
  if (entry) loadBook(entry);
}

// ===================== 主界面：关卡地图 =====================
function renderMap() {
  setHeader('quiz');
  if (dict) { dict.stopped = true; dictToken++; dict = null; } // 回地图即离开听写流程
  stopSpeech();
  const content = document.getElementById('content');
  const units = BOOK.units;
  const need = passLine(DRAW_COUNT);
  const types = [...new Set(Object.values(BOOK.questions).flat().map(q => q.type))];
  let html = '<div class="map-title">🎯 选择关卡开始学习</div>';
  html += `<div class="map-sub">每关 ${DRAW_COUNT} 题：${types.join(' · ')}，答对 ${need} 题通关 · 题库随机抽题，关卡全部开放，可自由挑战</div><div class="grid">`;

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const num = i + 1;
    const isCompleted = state.completed[num];

    let cls = 'card';
    let status = '';
    let stars = '';

    if (isCompleted) {
      cls += ' completed';
      const s = isCompleted.stars;
      stars = '<div class="stars">' + '⭐'.repeat(s) + '</div>';
      status = `<div class="status">通过 ✓ ${isCompleted.score}/${isCompleted.total}</div>`;
    } else {
      status = '<div class="status">👉 开始学习</div>';
    }

    html += `
      <div class="${cls}" data-unit="${num}" onclick="openUnit(${num})">
        <span class="icon">${unit.icon}</span>
        <div class="name">${unit.name}<br>${unit.title}</div>
        ${unit.en ? `<div class="unit-en">${unit.en}<span class="speak-btn" data-speak="${encodeURIComponent(unit.en)}" title="朗读单元英文标题">🔊</span></div>` : ''}
        ${stars}${status}
      </div>`;
  }

  html += '</div>';
  html += '<div class="btn-reset-wrap"><button class="btn-reset" onclick="renderDictRecords()">📜 听写记录</button></div>';
  html += '<div class="btn-reset-wrap"><button class="btn-reset" onclick="resetProgress()">🔄 重新开始</button></div>';

  content.innerHTML = html;
  bindSpeakButtons(); // 卡片上的 🔊 按钮（朗读单元英文标题）
  setCrumb([{ t: '🏠 首页', go: 'renderBookSelect()' }, { t: BOOK.title }]);
}

// ===================== 单元模式选择（闯关 / 听写 / 跟读） =====================
function openUnit(unitNum) {
  stopSpeech();
  if (dict) { dict.stopped = true; dictToken++; dict = null; } // 退出听写流程，终止后台播放
  if (rd) { rd = null; }                                        // 退出跟读流程
  setHeader('quiz');
  const unit = BOOK.units[unitNum - 1];
  const vocabCount = (unit.vocab || []).length;
  const readCount = (unit.read || []).length;
  const recCount = readDictRecords().filter(r => r.unit === unitNum).length;
  // 本单元实际出题的题型（用于模式卡片说明 & 决定“单词听写”是否显示）
  const unitQs = (BOOK.questions && BOOK.questions[String(unitNum)]) || [];
  const typesInUnit = [...new Set(unitQs.map(q => q.type))];
  const hasDictation = typesInUnit.includes('听写');
  const typeDesc = typesInUnit.length ? typesInUnit.join(' · ') : '本单元暂无题目';
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-title">${unit.icon} ${unit.name} · ${unit.title}</div>
      <div class="quiz-count"><button class="auto-toggle" onclick="renderMap()">← 返回</button></div>
    </div>
    <div class="mode-grid ${hasDictation ? 'mode-grid-3' : ''}">
      <div class="mode-card ${readCount ? '' : 'disabled'}" onclick="${readCount ? `startRead(${unitNum})` : ''}">
        <span class="mode-icon">🗣️</span>
        <div class="mode-name">课文跟读</div>
        <div class="mode-desc">${readCount ? `本单元课文 ${readCount} 句<br>播一句跟读一句<br>支持自动模式` : '本单元暂无课文'}</div>
      </div>
      <div class="mode-card ${vocabCount ? '' : 'disabled'}" onclick="${vocabCount ? `startWordRead(${unitNum})` : ''}">
        <span class="mode-icon">🔤</span>
        <div class="mode-name">单词跟读</div>
        <div class="mode-desc">${vocabCount ? `全单元 ${vocabCount} 个单词<br>听音 + 中文释义<br>逐词跟读` : '本单元暂无词汇表'}</div>
      </div>
      <div class="mode-card" onclick="startQuiz(${unitNum})">
        <span class="mode-icon">🎯</span>
        <div class="mode-name">闯关练习</div>
        <div class="mode-desc">随机 ${DRAW_COUNT} 题<br>${typeDesc}</div>
      </div>
      ${hasDictation ? `<div class="mode-card ${vocabCount ? '' : 'disabled'}" onclick="${vocabCount ? `startDictation(${unitNum})` : ''}">
        <span class="mode-icon">✏️</span>
        <div class="mode-name">单词听写</div>
        <div class="mode-desc">${vocabCount ? `全单元 ${vocabCount} 个词汇<br>纸笔听写<br>每词读三遍` : '本单元暂无词汇表'}</div>
      </div>` : ''}
    </div>
    ${recCount ? `<div class="mode-foot">本单元已有 ${recCount} 次听写记录 · <a href="javascript:void(0)" onclick="renderDictRecords()">查看记录</a></div>` : ''}
  `;
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: unit.name }
  ]);
}

// ===================== 课文跟读模式（播一句 → 跟读 → 下一句；支持自动播放） =====================
let rd = null;    // 当前跟读会话 {unitNum, list, idx, auto, interval, timer}
let rdToken = 0;  // 跟读会话令牌：递增即作废当前自动链（防跳句后旧定时器抢跑）

// 解析 "Mum: Hello!" 式对话行 → {speaker, text}；无说话人时 speaker=null
function parseSpeaker(en) {
  const m = /^\s*([A-Za-z][A-Za-z .''-]{0,24}?)\s*[:：]\s*(.+)$/.exec(en);
  if (m && /[A-Za-z]/.test(m[2])) return { speaker: m[1].trim(), text: m[2].trim() };
  return { speaker: null, text: en };
}

// —— 说话人性别识别：称呼/头衔/教材人名 → 'm' | 'f' | null ——
const GENDER_NAMES = {
  // 家庭称谓与头衔
  dad: 'm', father: 'm', grandpa: 'm', grandad: 'm', uncle: 'm', brother: 'm', boy: 'm', sir: 'm',
  mum: 'f', mom: 'f', mother: 'f', grandma: 'f', aunt: 'f', sister: 'f', girl: 'f', madam: 'f',
  // 两册教材常见人名
  'li sha': 'f', 'luo jie': 'm', 'fang xiao': 'm', 'zhang qi': 'm', 'zhu li': 'f',
  tingting: 'f', xiaowen: 'f', 'li na': 'f', katie: 'f', jim: 'm', matt: 'm',
  alice: 'f', joe: 'm', david: 'm', susan: 'f', kate: 'f', max: 'm', ella: 'f',
  lisa: 'f', eric: 'm', 'li ming': 'm', 'li liang': 'm', jiajia: 'f', peter: 'm',
  youyou: 'm', huihui: 'm', xiaorong: 'f', xiaoyuan: 'f', 'wu wei': 'm',
  shasha: 'm', jinjin: 'm', libo: 'm', 'li bo': 'm', 'wu yan': 'f', amy: 'f',
  kitty: 'f', sam: 'm', ann: 'f', bill: 'm', ben: 'm', bobby: 'm',
  may: 'f', mary: 'f', helen: 'f', nancy: 'f', simon: 'm', cindy: 'f', millie: 'f',
  // 三年级上册常见人名（沪教版 3A）
  junjun: 'm', lanlan: 'f', dangdang: 'm', wenwen: 'm', chenchen: 'm',
  taotao: 'm', lele: 'm', 'zhong yu': 'f'
};
function guessGender(sp) {
  if (!sp) return null;
  const s = String(sp).toLowerCase().replace(/[.·’']/g, ' ').replace(/\s+/g, ' ').trim();
  if (/^(mr|mister)\b/.test(s)) return 'm';
  if (/^(mrs|miss|ms|madam|lady)\b/.test(s)) return 'f';
  if (GENDER_NAMES[s]) return GENDER_NAMES[s];
  if (/\b(dad|father|grandpa|uncle|brother)\b/.test(s)) return 'm'; // "Pingping's dad"
  if (/\b(mum|mom|mother|grandma|aunt|sister)\b/.test(s)) return 'f';
  return null;
}

// 英文音色按名称猜性别（Microsoft/Google 音色名可辨识）
const FEMALE_VOICE_RE = /(aria|jenny|sonia|clara|samantha|karen|moira|tessa|veena|zira|susan|linda|catherine|hazel|naomi|colette|denise|eloise|female|woman|girl)/i;
const MALE_VOICE_RE = /(christopher|guy|davis|mark|eric|daniel|alex|fred|oliver|orville|george|paul|ivan|liam|male|man|boy)/i;

// 从音色池为角色分配不同播音员：旁白用默认美音；能辨性别的角色配男/女声，其余轮流
function buildVoicePool() {
  const pool = enVoices.length ? enVoices : (enVoice ? [enVoice] : []);
  rd.voiceMap = {};
  rd._alt = 0;
  rd._pool = pool;
  rd._female = pool.filter(v => FEMALE_VOICE_RE.test(v.name));
  rd._male = pool.filter(v => MALE_VOICE_RE.test(v.name));
  rd._fIdx = 0;
  rd._mIdx = 0;
}

function voiceForSpeaker(sp) {
  if (!rd._pool || !rd._pool.length) return null;
  if (!sp) return enVoice; // 旁白/叙述：默认美音
  if (rd.voiceMap[sp]) return rd.voiceMap[sp];
  const g = guessGender(sp);
  let v = null;
  if (g === 'f' && rd._female.length) v = rd._female[rd._fIdx++ % rd._female.length];
  else if (g === 'm' && rd._male.length) v = rd._male[rd._mIdx++ % rd._male.length];
  if (!v) {
    // 性别未知或该性别无音色：在默认音色之外轮流分配，保证角色间声音不同
    const others = rd._pool.filter(x => x !== enVoice);
    const list = others.length ? others : rd._pool;
    v = list[rd._alt++ % list.length];
  }
  rd.voiceMap[sp] = v;
  return v;
}

function startRead(unitNum) {
  const unit = BOOK.units[unitNum - 1];
  beginRead(unitNum, unit.read || [], '课文跟读');
}

// 一年级「单词跟读」：用本单元 vocab（含中文释义）生成跟读列表
function startWordRead(unitNum) {
  const unit = BOOK.units[unitNum - 1];
  const list = (unit.vocab || []).map(v => ({ en: v.en, cn: v.cn, st: '单词' }));
  beginRead(unitNum, list, '单词跟读');
}

function beginRead(unitNum, list, mode) {
  if (!list.length) return;
  stopSpeech();
  setHeader('read');
  rd = { unitNum, list, idx: 0, auto: false, interval: 10000, timer: null, mode: mode || '课文跟读' };
  rdToken++;
  ensureVoices();
  buildVoicePool();
  renderRead();
  speakReadCurrent(); // 进入第一句自动播放
}

function speakReadCurrent() {
  if (!rd) return;
  if (!rd._pool) buildVoicePool(); // iOS 音色晚就绪时懒初始化
  const { speaker, text } = parseSpeaker(rd.list[rd.idx].en);
  // 人名只用于分配音色，不朗读；对话语速略快更像说话，旁白稍慢清晰
  // 自动模式：本句朗读结束 + 设定间隔 → 自动下一句（token 防跳句后旧定时器抢跑）
  const token = rdToken;
  const onend = rd.auto ? () => {
    if (!rd || !rd.auto || token !== rdToken) return;
    rd.timer = setTimeout(() => {
      if (!rd || !rd.auto || token !== rdToken) return;
      if (rd.idx < rd.list.length - 1) { rd.idx++; renderRead(); speakReadCurrent(); }
      else { setAuto(false); } // 末句读完：自动模式关闭，停在完成按钮
    }, rd.interval);
  } : null;
  speakText(encodeURIComponent(text), onend, voiceForSpeaker(speaker), speaker ? 0.92 : 0.85);
}

function setAuto(on) {
  if (!rd) return;
  rd.auto = on;
  if (on) {
    renderRead();
    speakReadCurrent(); // 立即开始当前句的"朗读→间隔→下一句"链
  } else {
    rdToken++;            // 作废在途定时器链
    clearTimeout(rd.timer);
    stopSpeech();
    renderRead();
  }
}

function pickAutoInterval(btn) {
  if (!rd) return;
  document.querySelectorAll('.auto-seg [data-ms]').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  rd.interval = Number(btn.getAttribute('data-ms'));
}

// 面包屑：固定顶部导航（首页=选课本 → 课本=关卡地图 → 单元=模式选择 → 类别=当前模式）
// trail: [{t:'🏠 首页', go:'renderBookSelect'}, {t:'四年级下册', go:'renderMap'}, {t:'Unit 1', go:"openUnit(1)"}, {t:'🗣️ 跟读', go:null}]
function setCrumb(trail) {
  const el = document.getElementById('crumb');
  if (!el) return;
  if (!trail || !trail.length) { el.className = 'crumb-wrap'; el.innerHTML = ''; return; }
  el.className = 'crumb-wrap show';
  el.innerHTML = trail.map((c, i) => {
    const last = i === trail.length - 1;
    const sep = i > 0 ? '<span class="crumb-sep">›</span>' : '';
    return last
      ? `${sep}<span class="crumb-item cur">${c.t}</span>`
      : `${sep}<span class="crumb-item" onclick="${c.go || 'renderMap()'}">${c.t}</span>`;
  }).join('');
}

// 跳到第 i 句并朗读（手动跳句作废自动链旧定时器，随后按当前自动状态续链）
function gotoRead(i) {
  if (!rd || i < 0 || i >= rd.list.length) return;
  rd.idx = i;
  rdToken++;
  clearTimeout(rd.timer);
  renderRead();
  speakReadCurrent();
}

function renderRead() {
  // 骨架只构建一次；换句仅做增量更新，避免整列表重建导致的闪动
  if (!rd._built) buildReadShell();
  updateReadUI();
}

function buildReadShell() {
  const unit = BOOK.units[rd.unitNum - 1];
  const n = rd.list.length;

  // 整篇字幕：按句渲染，小节（课文/拓展）变化时插入标题+页码行
  let subs = '';
  let lastSt = null;
  rd.list.forEach((s, i) => {
    if (s.st && s.st !== lastSt) {
      lastSt = s.st;
      subs += `<div class="sub-head">${s.st}${s.sp ? ` <span class="sub-page">📖 ${s.sp}</span>` : ''}</div>`;
    }
    const { speaker, text } = parseSpeaker(s.en);
    subs += `
      <div class="sub-row" id="subRow${i}" onclick="gotoRead(${i})">
        <div class="sub-line">${speaker ? `<span class="sub-speaker">${speaker}:</span>` : ''}<span class="sub-en">${text}</span></div>
        <div class="sub-cn">${s.cn}</div>
      </div>`;
  });

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-title">🗣️ ${unit.name} · ${rd.mode || '课文跟读'}</div>
      <div class="quiz-count">第 <b id="readCur">1</b> / ${n} 句</div>
    </div>
    ${rateSliderHTML()}
    <div class="read-progress-bar"><div class="read-progress-fill" id="readFill" style="width:${Math.round(1 / n * 100)}%"></div></div>
    <div class="read-subs" id="readSubs">${subs}</div>
    <div class="read-tip" id="readTip">点击任意句子可跳读 · 听一句，大声跟读一句 🗣️</div>
    <div class="read-ctrl-row">
      <button class="btn btn-next read-ctrl" id="readPrevBtn" onclick="gotoRead(Math.max(rd.idx - 1, 0))">⬅ 上一句</button>
      <button class="btn btn-next read-ctrl" onclick="replayRead()">🔊 重听</button>
      <button class="btn btn-primary read-ctrl" id="readNextBtn" onclick="nextRead()">下一句 ➡</button>
    </div>
    <div class="read-auto-row">
      <button class="btn btn-primary read-auto-btn" id="readAutoBtn" onclick="setAuto(!rd.auto)">▶️ 自动模式</button>
      <div class="auto-seg">
        <button data-ms="5000" onclick="pickAutoInterval(this)">5秒</button>
        <button data-ms="10000" class="on" onclick="pickAutoInterval(this)">10秒</button>
        <button data-ms="15000" onclick="pickAutoInterval(this)">15秒</button>
      </div>
    </div>
  `;
  rd._built = true;
  rd._prevRow = null;
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: unit.name, go: `openUnit(${rd.unitNum})` },
    { t: '🗣️ ' + (rd.mode || '跟读') }
  ]);
}

function updateReadUI() {
  const n = rd.list.length;
  const pct = Math.round((rd.idx + 1) / n * 100);
  const cur = document.getElementById('readCur');
  const fill = document.getElementById('readFill');
  if (cur) cur.textContent = rd.idx + 1;
  if (fill) fill.style.width = pct + '%';

  // 高亮迁移：只动两行，不重建列表
  if (rd._prevRow) rd._prevRow.classList.remove('cur');
  const row = document.getElementById('subRow' + rd.idx);
  if (row) {
    row.classList.add('cur');
    rd._prevRow = row;
    // 容器内平滑居中（不触发整页滚动）
    const subs = document.getElementById('readSubs');
    if (subs) {
      subs.scrollTo({
        top: row.offsetTop - subs.clientHeight / 2 + row.offsetHeight / 2,
        behavior: 'smooth'
      });
    }
  }

  // 控制按钮状态
  const prevBtn = document.getElementById('readPrevBtn');
  const nextBtn = document.getElementById('readNextBtn');
  const tip = document.getElementById('readTip');
  const autoBtn = document.getElementById('readAutoBtn');
  if (prevBtn) prevBtn.disabled = rd.idx === 0;
  if (nextBtn) nextBtn.textContent = rd.idx === n - 1 ? '✅ 完成' : '下一句 ➡';
  if (tip) tip.textContent = rd.auto ? '⏳ 自动模式：读完本句后休息，进入下一句…' : '点击任意句子可跳读 · 听一句，大声跟读一句 🗣️';
  if (autoBtn) {
    autoBtn.textContent = rd.auto ? '⏸ 暂停自动' : '▶️ 自动模式';
    autoBtn.className = 'btn read-auto-btn ' + (rd.auto ? 'btn-next' : 'btn-primary');
  }
}

function replayRead() {
  if (!rd) return;
  rdToken++;              // 打断在途自动链，重听后重新起链
  clearTimeout(rd.timer);
  speakReadCurrent();
}

function nextRead() {
  if (!rd) return;
  if (rd.idx < rd.list.length - 1) {
    rd.idx++;
    rdToken++;            // 作废旧自动链，按当前自动状态重新起链
    clearTimeout(rd.timer);
    renderRead();
    speakReadCurrent(); // 下一句自动播放
  } else {
    const n = rd.list.length;
    const done = rd.mode === '单词跟读' ? '词' : '句';
    const msg = rd.mode === '单词跟读' ? '单词全部跟读完毕，每天读一遍，发音越来越标准！' : '课文全部跟读完毕，坚持每天读一遍，语感越来越好！';
    rd = null;
    rdToken++;
    stopSpeech();
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="result-box">
        <div class="result-icon">🌟</div>
        <div class="result-title">跟读完成！</div>
        <div class="result-score">${n} ${done}</div>
        <div class="result-msg">${msg}</div>
        <button class="btn btn-primary" onclick="renderMap()">返回关卡地图</button>
      </div>`;
    setHeader('quiz');
    setCrumb([
      { t: '🏠 首页', go: 'renderBookSelect()' },
      { t: BOOK.title, go: 'renderMap()' }
    ]);
  }
}

// ===================== 听写模式（纸笔听写 + 自检勾选 + 记录） =====================
let dict = null;      // 当前听写会话 {unitNum, order, idx, interval, played, stopped, startedAt}
let dictToken = 0;    // 播放序列令牌：递增即打断当前循环（重听/结束用）

function dictRecordsKey() {
  return 'english_quiz_dict_records_' + (BOOK ? BOOK.id : '');
}

function readDictRecords() {
  try {
    const saved = localStorage.getItem(dictRecordsKey());
    const arr = saved ? JSON.parse(saved) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function saveDictRecord(rec) {
  try {
    const arr = readDictRecords();
    arr.unshift(rec);
    if (arr.length > 200) arr.length = 200; // 只留最近200次
    localStorage.setItem(dictRecordsKey(), JSON.stringify(arr));
  } catch (e) {}
}

function startDictation(unitNum) {
  const unit = BOOK.units[unitNum - 1];
  const vocab = unit.vocab || [];
  if (!vocab.length) return;
  stopSpeech();
  setHeader('dict');
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-title">✏️ ${unit.name} · 单词听写</div>
      <div class="quiz-count"><button class="auto-toggle" onclick="renderMap()">← 退出</button></div>
    </div>
    <div class="question-box">
      <div class="question-text">准备好纸和笔 📝<br>共 ${vocab.length} 个单词/短语，顺序随机，每个播放三遍；全部放完后按播放顺序对照自检。</div>
    </div>
    <div class="rate-setup">${rateSliderHTML()}</div>
    <div class="dict-setup-label">每遍之间 / 换词前的间隔：</div>
    <div class="interval-row">
      <button class="interval-btn" data-sec="5" onclick="pickInterval(this)">5 秒</button>
      <button class="interval-btn selected" data-sec="10" onclick="pickInterval(this)">10 秒</button>
      <button class="interval-btn" data-sec="15" onclick="pickInterval(this)">15 秒</button>
    </div>
    <button class="btn btn-primary" onclick="beginDictation(${unitNum})">▶️ 开始听写</button>
  `;
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: BOOK.units[unitNum - 1].name, go: `openUnit(${unitNum})` },
    { t: '✏️ 听写' }
  ]);
}

function pickInterval(btn) {
  document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function beginDictation(unitNum) {
  const unit = BOOK.units[unitNum - 1];
  const secBtn = document.querySelector('.interval-btn.selected');
  const interval = (secBtn ? Number(secBtn.getAttribute('data-sec')) : 10) * 1000;
  dict = {
    unitNum,
    order: shuffle(unit.vocab),
    idx: 0,
    interval,
    played: null,
    stopped: false,
    startedAt: Date.now()
  };
  renderDictStage();
  dictRunWord();
}

function renderDictStage() {
  const unit = BOOK.units[dict.unitNum - 1];
  const content = document.getElementById('content');
  const n = dict.order.length;
  const cur = Math.min(dict.idx + 1, n);
  content.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-title">✏️ ${unit.name} · 听写中</div>
      <div class="quiz-count"><button class="auto-toggle" onclick="stopDictation()">⏹ 结束播放</button></div>
    </div>
    <div class="rate-setup">${rateSliderHTML()}</div>
    <div class="question-box dict-stage">
      <div class="dict-progress">第 <b id="dictCur">${cur}</b> / ${n} 词</div>
      <div class="dict-tip">仔细听，写纸上 🔉<br><span id="dictRep" class="dict-rep">第 1 遍…</span></div>
      <button class="btn btn-next" id="dictReplayBtn" onclick="replayDictWord()">🔊 重听这个词</button>
      <div class="dict-nav-row">
        <button class="btn btn-next dict-nav" onclick="dictPrevWord()">⬅ 上一个</button>
        <button class="btn btn-next dict-nav" onclick="dictNextWord()">下一个 ➡</button>
      </div>
    </div>
    <div class="dict-note">播放中不显示单词内容；可随时点"结束播放"提前进入自检。</div>
  `;
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: unit.name, go: `openUnit(${dict.unitNum})` },
    { t: '✏️ 听写' }
  ]);
}

// 播放当前词三遍（每遍之间与换词前都是同一间隔）；token 失效即静默退出
function dictRunWord(token) {
  token = token === undefined ? dictToken : token;
  if (!dict || dict.stopped || token !== dictToken) return;
  if (dict.idx >= dict.order.length) { showDictChecklist(false); return; }
  const word = dict.order[dict.idx];
  let rep = 0;
  const step = () => {
    if (!dict || dict.stopped || token !== dictToken) return;
    rep++;
    const repEl = document.getElementById('dictRep');
    if (repEl) repEl.textContent = `第 ${rep} 遍…`;
    const curEl = document.getElementById('dictCur');
    if (curEl) curEl.textContent = String(dict.idx + 1);
    speakText(encodeURIComponent(word.en));
    if (rep < 3) setTimeout(step, dict.interval);
    else setTimeout(() => {                    // 第三遍后的间隔 → 下一词
      if (!dict || dict.stopped || token !== dictToken) return;
      dict.idx++;
      dictRunWord(token);
    }, dict.interval);
  };
  step();
}

function replayDictWord() {
  if (!dict || dict.stopped) return;
  dictToken++;              // 打断当前序列
  const word = dict.order[Math.min(dict.idx, dict.order.length - 1)];
  speakText(encodeURIComponent(word.en)); // 立即重放当前词
  setTimeout(() => dictRunWord(dictToken), dict.interval); // 间隔后从当前词继续三遍流程
}

// 上一个 / 下一个：跳到目标词并重新走"三遍+间隔"流程
function dictJump(delta) {
  if (!dict || dict.stopped) return;
  const target = Math.min(Math.max(dict.idx + delta, 0), dict.order.length - 1);
  if (target === dict.idx && delta > 0) { showDictChecklist(false); return; } // 末词再点"下一个"=提前结束播放
  dict.idx = target;
  dictToken++;
  stopSpeech();
  dictRunWord(dictToken);
}

function dictPrevWord() { dictJump(-1); }
function dictNextWord() { dictJump(1); }

function stopDictation() {
  if (!dict) { renderMap(); return; }
  dict.stopped = true;
  dictToken++;
  stopSpeech();
  // 只把已播放过的词纳入自检清单
  dict.played = dict.order.slice(0, Math.max(dict.idx, 1));
  showDictChecklist(true);
}

function showDictChecklist(partial) {
  stopSpeech();
  dictToken++; // 打断播放序列
  const list = dict.played || dict.order;
  const unit = BOOK.units[dict.unitNum - 1];
  const content = document.getElementById('content');
  let html = `
    <div class="quiz-header">
      <div class="quiz-title">📋 ${unit.name} · 对照自检</div>
      <div class="quiz-count">${partial ? `已播 ${list.length}/${dict.order.length} 词` : `共 ${list.length} 词`}</div>
    </div>
    <div class="question-box">
      <div class="question-text">按刚才的播放顺序核对纸上的听写：写对并勾选 ✅，最后点"完成听写"。</div>
    </div>
    <div class="check-list">`;
  list.forEach((v, i) => {
    html += `
      <div class="check-row">
        <span class="check-no">${i + 1}</span>
        <span class="check-en">${v.en}</span>
        <span class="check-cn">${v.cn}</span>
        <input type="checkbox" class="check-box" data-i="${i}">
      </div>`;
  });
  html += `</div>
    <button class="btn btn-primary" onclick="finishDictation()">✅ 完成听写（${list.length} 词）</button>
    <button class="btn btn-next" onclick="cancelDictation()" style="margin-top:10px">放弃本次听写</button>`;
  content.innerHTML = html;
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: unit.name, go: `openUnit(${dict.unitNum})` },
    { t: '✏️ 听写·自检' }
  ]);
  window.scrollTo(0, 0);
}

function cancelDictation() {
  dict = null;
  renderMap();
}

function finishDictation() {
  const list = dict.played || dict.order;
  const boxes = document.querySelectorAll('.check-box');
  const items = list.map((v, i) => ({
    en: v.en,
    cn: v.cn,
    ok: boxes[i] ? !!boxes[i].checked : false
  }));
  const passed = items.filter(x => x.ok).length;
  const rec = {
    time: new Date().toISOString(),
    unit: dict.unitNum,
    interval: dict.interval / 1000,
    total: items.length,
    passed,
    score: items.length ? Math.round(passed / items.length * 100) : 0,
    items // 逐词掌握数据：后续"按掌握程度调整听写策略"用
  };
  saveDictRecord(rec);
  dict = null;
  const unit = BOOK.units[rec.unit - 1];
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="result-box">
      <div class="result-icon">${rec.score >= 90 ? '🏆' : rec.score >= 70 ? '🎉' : '💪'}</div>
      <div class="result-title">听写完成！</div>
      <div class="result-score">${rec.passed} / ${rec.total}（${rec.score} 分）</div>
      <div class="result-msg">${unit.name} · 间隔 ${rec.interval} 秒 · ${rec.score >= 90 ? '掌握得非常好！' : rec.score >= 70 ? '不错的成绩，错词再练一练！' : '把没勾出的词多听几遍，明天再战！'}</div>
      <button class="btn btn-primary" onclick="renderDictRecords()">📜 查看听写记录</button>
      <button class="btn btn-next" onclick="openUnit(${rec.unit})" style="margin-top:10px">再来一次</button>
    </div>`;
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: unit.name, go: `openUnit(${rec.unit})` },
    { t: '✏️ 听写·成绩' }
  ]);
}

// ===================== 听写记录页 =====================
function renderDictRecords() {
  stopSpeech();
  setHeader('dict');
  const content = document.getElementById('content');
  const recs = readDictRecords();
  let html = `
    <div class="quiz-header">
      <div class="quiz-title">📜 听写记录（${BOOK.title}）</div>
      <div class="quiz-count"><button class="auto-toggle" onclick="renderMap()">← 返回</button></div>
    </div>`;
  if (!recs.length) {
    html += '<div class="question-box"><div class="question-text">还没有听写记录。进入单元 → 单词听写，完成一次即可在此查看历史成绩。</div></div>';
  } else {
    // 汇总：按单元统计
    const byUnit = {};
    recs.forEach(r => {
      byUnit[r.unit] = byUnit[r.unit] || { n: 0, sum: 0, last: r };
      byUnit[r.unit].n++;
      byUnit[r.unit].sum += r.score;
    });
    html += '<div class="rec-summary">';
    Object.keys(byUnit).sort((a, b) => a - b).forEach(u => {
      const s = byUnit[u];
      const unit = BOOK.units[u - 1] || {};
      html += `<div class="rec-unit">${unit.icon || '📖'} ${unit.name}：${s.n} 次 · 平均 ${Math.round(s.sum / s.n)} 分 · 最近 ${s.last.score} 分</div>`;
    });
    html += '</div>';
    html += '<div class="rec-list">';
    recs.slice(0, 50).forEach(r => {
      const unit = BOOK.units[r.unit - 1] || {};
      const d = new Date(r.time);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      html += `<div class="rec-row"><span class="rec-date">${ds}</span><span class="rec-unit-name">${unit.name || ''}</span><span class="rec-score">${r.passed}/${r.total} · ${r.score}分</span><span class="rec-int">间隔${r.interval}s</span></div>`;
    });
    html += '</div>';
    html += '<div class="btn-reset-wrap"><button class="btn-reset" onclick="clearDictRecords()">🗑 清空听写记录</button></div>';
  }
  content.innerHTML = html;
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: '📜 听写记录' }
  ]);
}

function clearDictRecords() {
  if (confirm('确定清空本课本的所有听写记录吗？')) {
    try { localStorage.removeItem(dictRecordsKey()); } catch (e) {}
    renderDictRecords();
  }
}

// ===================== 答题界面 =====================
function startQuiz(unitNum) {
  state.currentUnit = unitNum;
  state.currentQ = 0;
  state.score = 0;
  state.selected = -1;
  state.answered = false;
  state.answeredCorrect = false;
  state.lastSpoken = null;
  state.drawn = drawQuestions(unitNum);  // 每次闯关从大题库随机抽 15 题
  stopSpeech();

  renderQuiz();
}

function renderQuiz() {
  const content = document.getElementById('content');
  const unit = BOOK.units[state.currentUnit - 1];
  const qs = state.drawn;
  const q = qs[state.currentQ];
  const isDict = q.type === '听写';

  // 按钮可用条件：选择题需已选答案且未提交；听写题只要未提交就能点（点时会校验输入）
  const btnDisabled = isDict
    ? (state.answered ? 'disabled' : '')
    : ((state.selected === -1 || state.answered) ? 'disabled' : '');
  const btnText = isDict && !state.answered ? '✏️ 检查答案'
    : (state.currentQ === qs.length - 1 ? '提交答案' : '下一题');

  // 🔊 题目朗读按钮：听写/听音辨词/读音 题=听单词或字母；完形填空（含___）不出按钮（避免提前播放）；其余题干含英文时显示
  const isWordType = q.type === '听音辨词' || q.type === '读音';
  const qSpeak = (isDict || (isWordType && q.word))
    ? `<span class="speak-btn" data-speak="${encodeURIComponent(q.word || '')}" title="再听一次">🔊</span>`
    : (!isCloze(q) && /[A-Za-z]/.test(q.q)
      ? `<span class="speak-btn" data-speak="${encodeURIComponent(q.q)}" title="朗读英文">🔊</span>` : '');

  const typeColor = { '单词':'#4caf50', '听写':'#ff9800', '句型':'#4facfe', '课文':'#9c27b0', '语音':'#e91e63', '交际':'#00bcd4', '拓展':'#795548', '听音辨词':'#ff7043', '读音':'#26a69a' };

  // 听写题：输入框（答后显示结果）；选择题：选项列表（选项上不再有朗读按钮）
  const body = isDict ? `
    <div class="dict-hint">💡 中文意思：${q.cn}</div>
    ${state.answered
      ? `<div class="dict-result ${state.answeredCorrect ? 'ok' : 'no'}">${state.answeredCorrect ? '✓ 拼写正确！' : '✗ 正确写法：' + q.word + '（' + q.cn + '）'}</div>`
      : `<input class="dict-input" id="dictationInput" type="text" placeholder="拼写听到的英文单词" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">`}
  ` : `
    <div class="options">
      ${q.options.map((opt, i) => `
        <div class="option ${state.selected === i ? 'selected' : ''} ${state.answered && i === q.answer ? 'correct' : ''} ${state.answered && state.selected === i && i !== q.answer ? 'wrong' : ''}"
             onclick="selectOption(${i})">${String.fromCharCode(65 + i)}. ${opt}</div>
      `).join('')}
    </div>`;

  const html = `
    <div class="quiz-header">
      <div class="quiz-title">${unit.icon} ${unit.name} · ${unit.title}${unit.en ? `<div class="quiz-unit-en">${unit.en}</div>` : ''}</div>
      <div class="quiz-count">${state.currentQ + 1} / ${qs.length} · 得分 ${state.score}<button class="auto-toggle ${state.autoSpeak ? 'on' : ''}" onclick="toggleAutoSpeak()">${state.autoSpeak ? '🔊 自动朗读' : '🔇 朗读关'}</button></div>
    </div>
    <div class="rate-setup">${rateSliderHTML()}</div>
    <div class="question-box">
      <span class="question-type" style="background:${typeColor[q.type] || '#4facfe'}">${q.type}</span>
      <div class="question-text">${q.q}${qSpeak}</div>
    </div>
    ${body}
    <button class="btn btn-next" onclick="nextQuestion()" ${btnDisabled}>${btnText}</button>
  `;

  content.innerHTML = html;
  bindSpeakButtons();
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: unit.name, go: `openUnit(${state.currentUnit})` },
    { t: '🎯 闯关' }
  ]);

  // 听写题：聚焦输入框，回车直接检查
  const inp = document.getElementById('dictationInput');
  if (inp) {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') nextQuestion(); });
    inp.focus();
  }

  // 自动朗读：进入新题时只朗读题干英文（选项不自动播放——英文选项全读一遍既啰嗦又等于广播答案；
  // 提交答案后由 speakCorrectAnswer 只朗读正确选项）
  const key = state.currentUnit + '-' + state.currentQ;
  if (state.autoSpeak && state.lastSpoken !== key) {
    state.lastSpoken = key;
    setTimeout(() => {
      if (isDict) speakText(encodeURIComponent(q.word));
      else if (isWordType && q.word) speakText(encodeURIComponent(q.word));
      else if (!isCloze(q)) speakSequence([q.q]);
    }, 200);
  }
}

function selectOption(index) {
  if (state.answered) return;
  state.selected = index;
  renderQuiz();
}

function nextQuestion() {
  if (state.answered) return;

  const q = state.drawn[state.currentQ];
  let isCorrect;

  if (q.type === '听写') {
    const input = document.getElementById('dictationInput');
    const val = input ? input.value : '';
    if (!val.trim()) { alert('请先仔细听一听，再拼写单词'); return; }
    state.selected = val;
    isCorrect = normalizeWord(val) === normalizeWord(q.word);
  } else {
    if (state.selected === -1) return;
    isCorrect = state.selected === q.answer;
  }

  if (isCorrect) {
    state.score++;
    showFeedback(true);
  } else {
    showFeedback(false);
  }

  state.answered = true;
  state.answeredCorrect = isCorrect;

  // 重新渲染以显示正确答案
  renderQuiz();

  // 选择答案提示对错后，播放正确答案的语音
  // （听写=单词；单词题=题干英文；完形填空=补全整句；其余=正确选项）
  let advanced = false;
  const advance = () => {
    if (advanced) return;
    advanced = true;
    const qs = state.drawn;
    if (state.currentQ < qs.length - 1) {
      state.currentQ++;
      state.selected = -1;
      state.answered = false;
      state.answeredCorrect = false;
      renderQuiz();
    } else {
      showResult();
    }
  };
  setTimeout(() => speakCorrectAnswer(q, advance), 350);
  setTimeout(advance, 4500); // 兜底：无语音环境或朗读异常时也能进入下一题
}

// 反馈动画
function showFeedback(isCorrect) {
  const fb = document.getElementById('feedback');
  fb.textContent = isCorrect ? '✓' : '✗';
  fb.className = 'feedback show ' + (isCorrect ? 'correct' : 'wrong');
  setTimeout(() => { fb.className = 'feedback'; }, 800);
}

// ===================== 结果界面 =====================
function showResult() {
  stopSpeech();
  const content = document.getElementById('content');
  const total = state.drawn.length;
  const score = state.score;
  const unitNum = state.currentUnit;
  const unit = BOOK.units[unitNum - 1];
  const need = passLine(total);
  const passed = score >= need;

  let icon, title, msg;

  if (passed) {
    const stars = (score === total || score >= Math.ceil(total * 0.9)) ? 3
                : (score >= Math.ceil(total * 0.8)) ? 2 : 1;
    state.completed[unitNum] = { stars, score, total };
    saveProgress();

    icon = '🎉';
    title = '闯关成功！';
    msg = score === total
      ? `太棒了！满分通过${unit.name}！你是英语小达人！🌟`
      : `恭喜通过${unit.name}！答对 ${score} / ${total} 题，继续加油！`;
  } else {
    icon = '💪';
    title = '再接再厉！';
    msg = `答对 ${score} / ${total} 题，答对 ${need} 题才能通过。复习单词和句型，再来一次吧！`;
  }

  const html = `
    <div class="result-box">
      <div class="result-icon">${icon}</div>
      <div class="result-title">${title}</div>
      <div class="result-score">${score} / ${total}</div>
      <div class="result-msg">${msg}</div>
      ${passed && unitNum < BOOK.units.length ? `<button class="btn btn-primary" onclick="startQuiz(${unitNum + 1})">下一关：${BOOK.units[unitNum].icon} ${BOOK.units[unitNum].name}</button>` : ''}
      <button class="btn btn-next" onclick="backToMap()" style="margin-top:10px">返回关卡地图</button>
      ${!passed ? `<button class="btn btn-next" onclick="startQuiz(${unitNum})" style="margin-top:10px">🔄 再试一次</button>` : ''}
    </div>
  `;

  content.innerHTML = html;
  updateProgress();
  setCrumb([
    { t: '🏠 首页', go: 'renderBookSelect()' },
    { t: BOOK.title, go: 'renderMap()' },
    { t: unit.name, go: `openUnit(${unitNum})` },
    { t: '🎯 闯关·成绩' }
  ]);
}

// 返回地图
function backToMap() {
  stopSpeech();
  renderMap();
  updateProgress();
}

// 重置进度
function resetProgress() {
  if (confirm('确定要清除本课本所有闯关进度吗？')) {
    state.completed = {};
    saveProgress();
    renderMap();
    updateProgress();
  }
}

// ===================== 初始化 =====================
initVoices();
if ('speechSynthesis' in window) {
  // 音色列表异步加载，变化时重新取一次
  speechSynthesis.onvoiceschanged = initVoices;
}
boot();
initQR();               // 右上角“手机访问”二维码（离线生成）
initShare();            // 底部「分享」入口（仅公网部署显示）
maybeShowDisclaimer();   // 首次打开（或免责声明文案升级后）弹出确认

// ===================== 分享（仅公网部署） =====================
// 背景与限制（2026 实测）：
//  · 微信没有「网页一键发朋友圈」的纯前端 API；正规途径是微信 JS-SDK
//    wx.updateTimelineShareData，但要求【认证服务号 + 备案 JS 安全域名 + 后端签名】，
//    纯静态 GitHub Pages 三者皆无，故不做（做了也必然 invalid signature）。
//  · 本实现按环境分三档：
//    1) 系统 Web Share 可用（Android/iOS 浏览器、Edge/Chrome 81+、Safari 14+）：
//       调 navigator.share 分享链接+标题，系统分享面板里可直接选「朋友圈/微信」；
//       支持 files 的浏览器（覆盖率 94%+）连 1200×630 分享卡 share.png 一起带出去。
//    2) 微信内置浏览器：无 JS-SDK 签名，退而求其次——弹层引导用户点右上角「⋯ →
//       分享到朋友圈」；卡片标题/图由 index.html 的 OG 标签尽力优化（未认证域名下
//       微信可能仍只显示纯链接，属平台限制）。
//    3) 桌面端（含本机 localhost 预览）：弹层展示链接 + 「复制链接」按钮，手动粘贴。
//  · 仅公网 hostname 显示入口；localhost / 局域网 / file:// 完全隐藏，保持零外联。
const SHARE_TITLE = '英语伴学 LingoMate';
const SHARE_TEXT = '课文跟读 · 单词跟读 · 闯关练习 · 听写 —— 零依赖纯前端，数据不出设备';

function isPublicHost() {
  try {
    const h = location.hostname;
    return !!h && !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) && h !== '[::1]';
  } catch (e) { return false; }
}

function isWeixinBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

function initShare() {
  const entry = document.getElementById('shareEntry');
  if (!entry || !isPublicHost()) return;   // 本地 / 局域网 / 离线：不注入，零外联
  entry.innerHTML = ' · <a href="javascript:void(0)" class="share-link" onclick="openShareDialog()">📤 分享</a>';
}

function shareCardUrl() {
  // 分享卡用绝对地址（OG 与 files 分享都要求公网可直达）
  try { return new URL('share.png', location.href).href; } catch (e) { return ''; }
}

// 尽力把 share.png 转成可分享的 File；失败（浏览器不支持 canvas 转码）返回 null
async function buildShareFile() {
  try {
    const url = shareCardUrl();
    if (!url || !window.fetch) return null;
    const resp = await fetch(url, { cache: 'force-cache' });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    if (!blob.type || blob.type.indexOf('image/') !== 0) return null;
    // 部分分享目标只认 image/jpeg，用 canvas 转码一次；失败则退回原 PNG
    try {
      const bmp = await createImageBitmap(blob);
      const cv = document.createElement('canvas');
      cv.width = bmp.width; cv.height = bmp.height;
      cv.getContext('2d').drawImage(bmp, 0, 0);
      const jpegBlob = await new Promise(res => cv.toBlob(res, 'image/jpeg', 0.9));
      if (jpegBlob && jpegBlob.size > 0) {
        return new File([jpegBlob], 'lingomate-share.jpg', { type: 'image/jpeg' });
      }
    } catch (e) { /* 转码失败退回 PNG */ }
    return new File([blob], 'lingomate-share.png', { type: blob.type });
  } catch (e) { return null; }
}

async function openShareDialog() {
  const url = location.href;
  const title = SHARE_TITLE;
  const text = SHARE_TEXT;

  // 1) 系统 Web Share：优先带图（朋友圈在系统面板中可直接选）
  if (navigator.share) {
    const file = await buildShareFile();
    try {
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text, url });
      } else {
        await navigator.share({ title, text, url });
      }
      return; // 用户完成或取消都结束
    } catch (e) {
      if (e && e.name === 'AbortError') return;   // 用户主动取消
      // 其余错误（如数据不受支持）落到弹层兜底
    }
  }

  // 2) 微信内置浏览器 / 桌面端：引导层
  showShareFallback(url, isWeixinBrowser());
}

function showShareFallback(url, inWeixin) {
  const mask = document.createElement('div');
  mask.className = 'dlg-mask show';
  mask.id = 'shareMask';
  const steps = inWeixin
    ? `<p>在微信里打开本页，微信不提供网页直接发朋友圈的接口，按下面两步操作：</p>
       <ol>
         <li>点右上角 <b>「⋯」</b></li>
         <li>选 <b>「分享到朋友圈」</b>（或「发送给朋友」）</li>
       </ol>
       <p style="font-size:11px;color:#999">提示：分享卡片由页面的 OG 标签生成；若显示为纯链接，属微信对未认证域名的限制，不影响打开。</p>`
    : `<p>复制下面的链接，粘贴给朋友或发到朋友圈（微信里长按即可粘贴）：</p>
       <p class="share-url" id="shareUrlText">${url}</p>
       <button class="btn btn-primary" id="shareCopyBtn" onclick="copyShareUrl('${url.replace(/'/g, "\\'")}')">📋 复制链接</button>
       <p style="font-size:11px;color:#999">手机浏览器点「📤 分享」可直接呼出系统面板（含朋友圈），本页已优先尝试。</p>`;
  mask.innerHTML = `
    <div class="dlg share-dlg">
      <div class="dlg-head">📤 分享${inWeixin ? ' · 微信' : ''}</div>
      <div class="dlg-body share-dlg-body">${steps}</div>
      <div class="dlg-foot"><button class="btn btn-next" onclick="closeShareDialog()">我知道了</button></div>
    </div>`;
  document.body.appendChild(mask);
}

function closeShareDialog() {
  const m = document.getElementById('shareMask');
  if (m) m.remove();
}

function copyShareUrl(url) {
  const done = () => {
    const b = document.getElementById('shareCopyBtn');
    if (b) b.textContent = '✅ 已复制';
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(() => legacyCopy(url, done));
  } else {
    legacyCopy(url, done);
  }
}

function legacyCopy(url, done) {
  const ta = document.createElement('textarea');
  ta.value = url;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) {}
  ta.remove();
}

// ===================== 手机扫码访问 =====================
// 纯前端离线生成二维码：直接编码「浏览器当前实际访问的完整地址」，
// 因此无论是本地局域网 IP、公网域名还是端口，扫码得到的都是真实可达地址。
function initQR() {
  const mini = document.getElementById('qrMini');
  const url = window.location.href;

  // 手机/平板端本身就在移动设备上（平板屏幕够大，无需扫码跨设备），整体隐藏。
  // 注意 iPadOS 13+ 桌面模式 UA 是 "Macintosh"，需用多点触控特征识别。
  const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|Mobile|MicroMessenger/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent)); // iPadOS 桌面模式
  if (isMobile) {
    if (mini) mini.style.display = 'none';
    const pop = document.getElementById('qrPop');
    if (pop) pop.style.display = 'none';
    return;
  }

  if (typeof qrcode !== 'function') {
    // 库未加载（如离线打开）则隐藏小码，展开时给出手动地址
    if (mini) mini.style.display = 'none';
    const w = document.getElementById('qrWarn');
    if (w) w.textContent = '离线模式：无法生成二维码，请用手机手动输入下方网址。';
    return;
  }
  // file:// 直接双击打开时，地址为本地文件路径，手机无法访问
  if (url.indexOf('file://') === 0) {
    if (mini) mini.style.display = 'none';
    const w = document.getElementById('qrWarn');
    if (w) w.textContent = '请通过「启动手机伴学」运行后扫码（直接双击打开无法生成可访问地址）。';
    return;
  }
  try {
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    // 右上角小码
    if (mini) {
      const c = document.createElement('canvas');
      c.className = 'qr-mini-img';
      drawQR(qr, c, 2);
      mini.innerHTML = '';
      mini.appendChild(c);
    }
    // 点击放大后的大码
    drawQR(qr, document.getElementById('qrCanvas'), 6);
    const u = document.getElementById('qrUrl');
    if (u) u.textContent = url;
    // 根据访问地址类型给出差异化提示
    const tip = document.getElementById('qrTip');
    if (tip) {
      const host = (function () { try { return new URL(url).hostname; } catch (e) { return ''; } })();
      const isLan = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/.test(host) || host === 'localhost';
      if (isLan) {
        tip.textContent = '手机与电脑连同一个 WiFi，用相机 / 扫一扫扫描下方二维码，即可在手机上继续学习。';
      } else {
        tip.textContent = '用手机相机 / 扫一扫扫描下方二维码，即可在手机上继续学习（此链接已发布到公网）。';
      }
    }
  } catch (e) {
    if (mini) mini.style.display = 'none';
    const w = document.getElementById('qrWarn');
    if (w) w.textContent = '二维码生成失败，请手动在手机输入下方网址。';
  }
}

// 在 canvas 上绘制二维码（深色模块黑、留白；自适应缩放保持清晰）
function drawQR(qr, canvas, scale) {
  const count = qr.getModuleCount();
  const size = count * scale;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#111';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(c * scale, r * scale, scale, scale);
    }
  }
}

function toggleQR(force) {
  const pop = document.getElementById('qrPop');
  if (!pop) return;
  const show = typeof force === 'boolean' ? force : !pop.classList.contains('show');
  pop.classList.toggle('show', show);
  // 弹窗打开时，让右上角小码保持展开（完整二维码）状态
  const mini = document.getElementById('qrMini');
  if (mini) mini.classList.toggle('active', show);
}
