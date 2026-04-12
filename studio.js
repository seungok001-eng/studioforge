// ═══════════════════════════════════════════════════
//  StudioForge v3 — studio.js
// ═══════════════════════════════════════════════════

let CH = null, ST = {}, P = {};
let splitN = 2, editIdx = null;
let pvIdx = 0, pvPlaying = false, pvTimer = null;
let saveTimer = null, charEditIdx = null;
let selVoice = null, curLangF = 'ALL';
let ytFileBlob = null;

// ── 영상 효과 목록 ─────────────────────────────────
const FX_LIST = [
  { id:'none',    name:'없음',        desc:'효과 없음' },
  { id:'zoomin',  name:'줌 인',       desc:'서서히 확대' },
  { id:'zoomout', name:'줌 아웃',     desc:'서서히 축소' },
  { id:'panl',    name:'패닝 ←',      desc:'오른쪽→왼쪽 이동' },
  { id:'panr',    name:'패닝 →',      desc:'왼쪽→오른쪽 이동' },
  { id:'panu',    name:'패닝 ↑',      desc:'아래→위 이동' },
  { id:'pand',    name:'패닝 ↓',      desc:'위→아래 이동' },
  { id:'zleft',   name:'줌+왼쪽',     desc:'확대하며 왼쪽 이동' },
  { id:'zright',  name:'줌+오른쪽',   desc:'확대하며 오른쪽 이동' },
  { id:'shake',   name:'흔들림',      desc:'미세하게 떨림' },
  { id:'vignette',name:'비네팅',      desc:'가장자리 어둡게' },
  { id:'random',  name:'랜덤',        desc:'랜덤 효과 적용' },
];
const FX_RANDOM_POOL = ['zoomin','zoomout','panl','panr','panu','pand','zleft','zright'];

// ── 음성 데이터 ────────────────────────────────────
const VOICES = {
  elevenlabs:[
    {id:'eun-woo',name:'Eun Woo',desc:'Calm, Clear and Steady',region:'KR',gender:'남'},
    {id:'mi-rae',name:'Mi-rae',desc:'Bright, Energetic',region:'KR',gender:'여'},
    {id:'ji-ho',name:'Ji-ho',desc:'Warm, Professional',region:'KR',gender:'남'},
    {id:'soo-yeon',name:'Soo-yeon',desc:'Soft, Natural',region:'KR',gender:'여'},
    {id:'21m00Tcm4TlvDq8ikWAM',name:'Rachel',desc:'Calm, professional',region:'US',gender:'여'},
    {id:'EXAVITQu4vr4xnSDxMaL',name:'Bella',desc:'Soft, calm',region:'US',gender:'여'},
    {id:'ErXwobaYiN019PkySvjV',name:'Antoni',desc:'Well-rounded',region:'US',gender:'남'},
    {id:'MF3mGyEYCl7XYWbV9V6O',name:'Elli',desc:'Emotional range',region:'US',gender:'여'},
    {id:'TxGEqnHWrfWFTfGW9XjX',name:'Josh',desc:'Deep, natural',region:'US',gender:'남'},
    {id:'VR6AewLTigWG4xSOukaG',name:'Arnold',desc:'Crisp, authoritative',region:'US',gender:'남'},
    {id:'pNInz6obpgDQGcFmaJgB',name:'Adam',desc:'Deep, narrative',region:'US',gender:'남'},
    {id:'ZQe5CZNOzWyzPSCn5a3c',name:'Glinda',desc:'Warm, friendly',region:'UK',gender:'여'},
    {id:'g5CIjZEefAph4nQFvHAz',name:'Freya',desc:'Energetic, casual',region:'UK',gender:'여'},
    {id:'hana-jp',name:'Hana',desc:'Soft, natural',region:'JP',gender:'여'},
    {id:'kenji-jp',name:'Kenji',desc:'Professional, clear',region:'JP',gender:'남'},
    {id:'mei-cn',name:'Mei',desc:'Clear, professional',region:'CN',gender:'여'},
    {id:'pedro-es',name:'Pedro',desc:'Natural, conversational',region:'ES',gender:'남'},
    {id:'pierre-fr',name:'Pierre',desc:'Smooth, elegant',region:'FR',gender:'남'},
    {id:'hans-de',name:'Hans',desc:'Strong, authoritative',region:'DE',gender:'남'},
    {id:'joao-pt',name:'João',desc:'Warm, natural',region:'BR',gender:'남'},
    {id:'marco-it',name:'Marco',desc:'Rich, expressive',region:'IT',gender:'남'},
    {id:'ali-ar',name:'Ali',desc:'Deep, professional',region:'AR',gender:'남'},
  ],
  gemini:[
    {id:'Aoede',name:'Aoede',desc:'Bright, Upbeat',region:'ALL',gender:'여'},
    {id:'Charon',name:'Charon',desc:'Informational',region:'ALL',gender:'남'},
    {id:'Fenrir',name:'Fenrir',desc:'Excitable',region:'ALL',gender:'남'},
    {id:'Kore',name:'Kore',desc:'Firm, Clear',region:'ALL',gender:'여'},
    {id:'Puck',name:'Puck',desc:'Upbeat, Playful',region:'ALL',gender:'남'},
    {id:'Leda',name:'Leda',desc:'Youthful',region:'ALL',gender:'여'},
    {id:'Orus',name:'Orus',desc:'Firm, Steady',region:'ALL',gender:'남'},
    {id:'Perseus',name:'Perseus',desc:'Easy, Conversational',region:'ALL',gender:'남'},
    {id:'Schedar',name:'Schedar',desc:'Even, Neutral',region:'ALL',gender:'남'},
    {id:'Sulafat',name:'Sulafat',desc:'Warm, Soft',region:'ALL',gender:'여'},
    {id:'Zephyr',name:'Zephyr',desc:'Bright, Energetic',region:'ALL',gender:'여'},
    {id:'Achernar',name:'Achernar',desc:'Soft, Gentle',region:'ALL',gender:'여'},
    {id:'Algenib',name:'Algenib',desc:'Gravelly, Deep',region:'ALL',gender:'남'},
    {id:'Autonoe',name:'Autonoe',desc:'Bright, Clear',region:'ALL',gender:'여'},
    {id:'Despina',name:'Despina',desc:'Smooth, Natural',region:'ALL',gender:'여'},
    {id:'Enceladus',name:'Enceladus',desc:'Breathy, Soft',region:'ALL',gender:'남'},
    {id:'Isonoe',name:'Isonoe',desc:'Even, Steady',region:'ALL',gender:'여'},
    {id:'Laomedeia',name:'Laomedeia',desc:'Upbeat, Friendly',region:'ALL',gender:'여'},
    {id:'Rasalgethi',name:'Rasalgethi',desc:'Informative',region:'ALL',gender:'남'},
    {id:'Sadachbia',name:'Sadachbia',desc:'Lively',region:'ALL',gender:'남'},
    {id:'Shaula',name:'Shaula',desc:'Lively, Young',region:'ALL',gender:'여'},
    {id:'Umbriel',name:'Umbriel',desc:'Easy, Relaxed',region:'ALL',gender:'남'},
    {id:'Vindemiatrix',name:'Vindemiatrix',desc:'Gentle, Calm',region:'ALL',gender:'여'},
    {id:'Wasat',name:'Wasat',desc:'Direct, Clear',region:'ALL',gender:'남'},
    {id:'Zubenelgenubi',name:'Zubenelgenubi',desc:'Casual, Relaxed',region:'ALL',gender:'남'},
    {id:'Pulcherrima',name:'Pulcherrima',desc:'Forward, Confident',region:'ALL',gender:'여'},
    {id:'Sadaltager',name:'Sadaltager',desc:'Knowledgeable',region:'ALL',gender:'남'},
    {id:'Algieba',name:'Algieba',desc:'Smooth, Polished',region:'ALL',gender:'남'},
    {id:'Alnilam',name:'Alnilam',desc:'Firm, Confident',region:'ALL',gender:'남'},
    {id:'Callirrhoe',name:'Callirrhoe',desc:'Easy, Casual',region:'ALL',gender:'여'},
    {id:'Achird',name:'Achird',desc:'Friendly, Warm',region:'ALL',gender:'남'},
  ],
  naver:[
    {id:'nara',name:'Nara',desc:'표준 여성, 밝고 자연스러운',region:'KR',gender:'여'},
    {id:'nminsang',name:'Minsang',desc:'표준 남성, 자연스러운',region:'KR',gender:'남'},
    {id:'njinho',name:'Jinho',desc:'표준 남성, 중저음',region:'KR',gender:'남'},
    {id:'njooahn',name:'Jooan',desc:'표준 남성, 깊고 안정적',region:'KR',gender:'남'},
    {id:'njiyeon',name:'Jiyeon',desc:'표준 여성, 따뜻한',region:'KR',gender:'여'},
    {id:'nsujin',name:'Sujin',desc:'표준 여성, 선명한',region:'KR',gender:'여'},
    {id:'nmijin',name:'Mijin',desc:'표준 여성, 부드러운',region:'KR',gender:'여'},
    {id:'nkyunglee',name:'Kyunglee',desc:'표준 여성, 안정적',region:'KR',gender:'여'},
    {id:'nara_call',name:'Nara (콜센터)',desc:'콜센터 전용',region:'KR',gender:'여'},
    {id:'noyj',name:'Yujin',desc:'뉴스 낭독 스타일',region:'KR',gender:'여'},
    {id:'neunyoung',name:'Eunyoung',desc:'뉴스 낭독 스타일',region:'KR',gender:'여'},
    {id:'nsabina',name:'Sabina',desc:'내레이션',region:'KR',gender:'여'},
    {id:'nraewon',name:'Raewon',desc:'내레이션',region:'KR',gender:'남'},
    {id:'ntiffany',name:'Tiffany',desc:'활발하고 밝은',region:'KR',gender:'여'},
    {id:'nwoongi',name:'Woongi',desc:'차분하고 부드러운',region:'KR',gender:'남'},
    {id:'nhajun',name:'Hajun',desc:'10대 소년',region:'KR',gender:'남'},
    {id:'nbora',name:'Bora',desc:'활기찬',region:'KR',gender:'여'},
    {id:'njangho',name:'Jangho',desc:'노인 남성',region:'KR',gender:'남'},
    {id:'njoonyoung',name:'Joonyoung',desc:'20대 남성',region:'KR',gender:'남'},
    {id:'nminsang_call',name:'Minsang (콜센터)',desc:'콜센터 전용',region:'KR',gender:'남'},
  ]
};

const LANG_FILTERS = {
  elevenlabs:[{k:'ALL',l:'전체'},{k:'KR',l:'🇰🇷 한국어'},{k:'US',l:'🇺🇸 영어US'},{k:'UK',l:'🇬🇧 영어UK'},{k:'JP',l:'🇯🇵 일본어'},{k:'CN',l:'🇨🇳 중국어'},{k:'ES',l:'🇪🇸 스페인어'},{k:'FR',l:'🇫🇷 프랑스어'},{k:'DE',l:'🇩🇪 독일어'},{k:'BR',l:'🇧🇷 포르투갈어'},{k:'IT',l:'🇮🇹 이탈리아어'},{k:'AR',l:'🇸🇦 아랍어'}],
  gemini:[{k:'ALL',l:'전체 (다국어)'}],
  naver:[{k:'ALL',l:'전체'},{k:'KR',l:'🇰🇷 한국어'}],
  browser:[{k:'ALL',l:'전체'}]
};

// ── 초기화 ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const chId = localStorage.getItem('sf_current_channel');
  if (!chId) { location.href = 'index.html'; return; }
  const chs = JSON.parse(localStorage.getItem('sf_channels') || '[]');
  CH = chs.find(c => c.id === chId);
  if (!CH) { location.href = 'index.html'; return; }
  loadST();
  initUI();
  updateSubPrev();
  changeTtsEng();
});

function loadST() {
  try { ST = JSON.parse(localStorage.getItem('sf_ch_' + CH.id) || '{}'); } catch { ST = {}; }
  ST.settings = ST.settings || {};
  ST.projects = ST.projects || {};
  const def = {
    engine: CH.engine || 'api', ratio: '16:9',
    ttsEngine: 'elevenlabs', ttsSpeed: 1.0, selVoice: null,
    subFont: "'Noto Sans KR', sans-serif", subSz: 25, subCh: 20,
    subPos: 'bottom', subTc: '#FFFFFF', subBc: '#000000',
    subOp: 80, subShd: true, subFade: false, transT: 1, useBgm: false,
    globalStyle: 'cinematic photo, 4K, dramatic lighting, ultra realistic',
    globalPrompt: '',
    thumbPrompt: '', thumbStyle: '',
    gemKey: '', elKey: '', falKey: '', navCid: '', navCs: '',
    ytCid: '', ytCs: '', ytAk: '', ytPriv: 'private', ytCat: '22',
    characters: [], styleRefs: [], mascots: [],
  };
  Object.keys(def).forEach(k => { if (ST.settings[k] === undefined) ST.settings[k] = def[k]; });
  if (ST.currentPid && ST.projects[ST.currentPid]) {
    P = ST.projects[ST.currentPid];
  } else { newProj(); }
}

function newProj() {
  const id = 'p_' + Date.now();
  P = { id, name: '새 프로젝트', scenes: [], thumbnails: [] };
  ST.projects[id] = P;
  ST.currentPid = id;
}

function initUI() {
  const s = ST.settings;
  document.getElementById('topIcon').textContent = CH.icon;
  document.getElementById('topName').textContent = CH.name;
  document.getElementById('sbCh').textContent = CH.name;
  document.getElementById('projEl').textContent = P.name;
  setEngSilent(s.engine);
  setRatioSilent(s.ratio);
  const g = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.value = v; };
  const gc = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.checked = v; };
  g('ttsEng', s.ttsEngine); g('ttsSpd', s.ttsSpeed);
  document.getElementById('ttsSpdV').textContent = parseFloat(s.ttsSpeed).toFixed(2) + 'x';
  g('subFont', s.subFont); g('subSz', s.subSz);
  document.getElementById('subSzV').textContent = s.subSz;
  g('subCh', s.subCh); document.getElementById('subChV').textContent = s.subCh;
  g('subPos', s.subPos); g('subTc', s.subTc); g('subBc', s.subBc);
  g('subOp', s.subOp); document.getElementById('subOpV').textContent = s.subOp;
  gc('subShd', s.subShd); gc('subFade', s.subFade);
  g('transT', s.transT); document.getElementById('transV').textContent = s.transT + '초';
  g('globalStyle', s.globalStyle); g('globalPrompt', s.globalPrompt);
  g('thumbPrompt', s.thumbPrompt); g('thumbStyle', s.thumbStyle);
  g('gemKey', s.gemKey); g('elKey', s.elKey); g('falKey', s.falKey);
  g('navCid', s.navCid); g('navCs', s.navCs);
  g('ytCid', s.ytCid); g('ytCs', s.ytCs); g('ytAk', s.ytAk);
  g('ytPriv', s.ytPriv); g('ytCat', s.ytCat);
  selVoice = s.selVoice;
  renderChars(); renderStyleRefs(); renderMascots();
  if (P.scenes?.length) renderSB();
}

// ── 자동 저장 ──────────────────────────────────────
function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    collectS();
    localStorage.setItem('sf_ch_' + CH.id, JSON.stringify(ST));
    const d = document.getElementById('sdot'); d.classList.add('on');
    setTimeout(() => d.classList.remove('on'), 1200);
  }, 500);
}

function collectS() {
  const s = ST.settings;
  const g = id => { const el = document.getElementById(id); return el ? el.value : undefined; };
  const gc = id => { const el = document.getElementById(id); return el ? el.checked : undefined; };
  s.ttsEngine = g('ttsEng') || s.ttsEngine;
  s.ttsSpeed = parseFloat(g('ttsSpd') || s.ttsSpeed);
  s.selVoice = selVoice;
  s.subFont = g('subFont') || s.subFont;
  s.subSz = parseInt(g('subSz') || s.subSz);
  s.subCh = parseInt(g('subCh') || s.subCh);
  s.subPos = g('subPos') || s.subPos;
  s.subTc = g('subTc') || s.subTc;
  s.subBc = g('subBc') || s.subBc;
  s.subOp = parseInt(g('subOp') || s.subOp);
  s.subShd = gc('subShd'); s.subFade = gc('subFade');
  s.transT = parseFloat(g('transT') || s.transT);
  s.useBgm = gc('useBgm');
  s.globalStyle = g('globalStyle') || s.globalStyle;
  s.globalPrompt = g('globalPrompt') || '';
  s.thumbPrompt = g('thumbPrompt') || '';
  s.thumbStyle = g('thumbStyle') || '';
  s.gemKey = g('gemKey') || ''; s.elKey = g('elKey') || '';
  s.falKey = g('falKey') || ''; s.navCid = g('navCid') || ''; s.navCs = g('navCs') || '';
  s.ytCid = g('ytCid') || ''; s.ytCs = g('ytCs') || ''; s.ytAk = g('ytAk') || '';
  s.ytPriv = g('ytPriv') || 'private'; s.ytCat = g('ytCat') || '22';
  if (g('vidTitle') !== undefined) { P.title = g('vidTitle'); }
  if (g('scriptIn') !== undefined) { P.script = g('scriptIn'); }
  ST.projects[P.id] = P;
}

function manualSave() {
  collectS();
  localStorage.setItem('sf_ch_' + CH.id, JSON.stringify(ST));
  const b = document.querySelector('.btn-sv'); b.textContent = '저장됨 ✓';
  setTimeout(() => b.textContent = '저장', 1500);
}
function saveKeys() {
  collectS(); localStorage.setItem('sf_ch_' + CH.id, JSON.stringify(ST));
  const m = document.getElementById('keySaveMsg'); m.style.display = 'block';
  setTimeout(() => m.style.display = 'none', 2000);
}
function saveYtKeys() { collectS(); localStorage.setItem('sf_ch_' + CH.id, JSON.stringify(ST)); alert('저장됨'); }

// ── 네비게이션 ─────────────────────────────────────
function gp(name) {
  document.querySelectorAll('.nav').forEach(n => n.classList.toggle('on', n.dataset.p === name));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.getElementById('page-' + name)?.classList.add('on');
  if (name === 'storyboard') { renderSB(); updateFlowBar(); }
  if (name === 'timeline') renderTL();
  if (name === 'preview') renderPV();
  if (name === 'settings') changeTtsEng();
}
function goChannels() { location.href = 'index.html'; }
function renameProj() {
  const n = prompt('프로젝트 이름:', P.name);
  if (n) { P.name = n; document.getElementById('projEl').textContent = n; autoSave(); }
}

// ── 엔진 ───────────────────────────────────────────
function setEng(e) { setEngSilent(e); autoSave(); }
function setEngSilent(e) {
  ST.settings.engine = e;
  ['api','flow','both'].forEach(k => {
    const b = document.getElementById('eng' + k.charAt(0).toUpperCase() + k.slice(1));
    if (b) b.classList.toggle('on', e === k);
  });
  updateFlowBar();
}
function updateFlowBar() {
  const b = document.getElementById('sbFlowBar');
  if (b) b.style.display = (ST.settings.engine === 'flow' || ST.settings.engine === 'both') ? 'flex' : 'none';
}
function openFlow() { window.open('https://flow.google.com', '_blank'); }

// ── 비율 ───────────────────────────────────────────
function setRatio(r, btn) { setRatioSilent(r); autoSave(); }
function setRatioSilent(r) {
  ST.settings.ratio = r;
  document.getElementById('r169')?.classList.toggle('bp', r === '16:9');
  document.getElementById('r169')?.classList.toggle('bgh', r !== '16:9');
  document.getElementById('r916')?.classList.toggle('bp', r === '9:16');
  document.getElementById('r916')?.classList.toggle('bgh', r !== '9:16');
}

// ── 대본 ───────────────────────────────────────────
function countW() {
  const t = document.getElementById('scriptIn')?.value || '';
  const w = t.trim() ? t.trim().split(/\s+/).length : 0;
  const el = document.getElementById('wc'); if (el) el.textContent = `${w}어절`;
}
function clearScript() { const el = document.getElementById('scriptIn'); if (el) el.value = ''; countW(); }
function setSplit(n, btn) {
  splitN = n;
  document.querySelectorAll('#splitOpts .btn').forEach(b => { b.className = b === btn ? 'btn bp bsm' : 'btn bgh bsm'; });
}
function loadSample() {
  document.getElementById('vidTitle').value = '한화솔루션 유상증자 분석';
  document.getElementById('scriptIn').value = `[장면1] 인트로
2026년 3월 26일 아침 8시 42분. 한화솔루션을 2,000주 들고 있던 직장인 한 명이 출근길 지하철에서 MTS를 켰어. 전날 종가 51,000원. 화면에 뜬 숫자는 -19%.

[장면2] 유상증자 분석
유상증자 공시를 열면 제일 먼저 볼 곳이 있어. 자금 사용 목적이야. 한화솔루션 2.4조 중 1.5조가 차입금 상환, 9,000억이 시설 투자야.

[장면3] 생존 vs 성장
조달 자금의 절반 이상이 빚 갚는 데 들어가는 구조. 이걸 생존형 증자라고 분류해. 반대로 한화에어로의 3.6조는 성장형이야.

[장면4] 5가지 체크포인트
첫째, 채무 상환 비율 50% 초과 여부. 둘째, 발행가. 셋째, 실권주 처리. 넷째, 대주주 참여. 다섯째, 업황 사이클.

[장면5] 마무리
이 5가지를 모르면 다음번에도 똑같이 잃어. 유상증자 공시가 뜨는 순간 3초 만에 판단하는 투자자가 되어보자.`;
  countW(); autoSave();
}

// 텍스트 기반 장면 분할
function splitScenes() {
  const script = document.getElementById('scriptIn')?.value.trim();
  if (!script) { alert('대본을 입력하세요.'); return; }
  const blocks = [], titles = [];
  const tagRe = /\[장면\d+\]\s*([^\n]*)/g;
  let match;
  while ((match = tagRe.exec(script)) !== null) titles.push(match[1].trim());
  const raw = script.split(/\n{2,}|\[장면\d+\][^\n]*/g).map(b => b.trim()).filter(Boolean);
  const sentRe = /[^.!?。！？\n]+[.!?。！？]?/g;
  let idx = 0;
  const scenes = [];
  raw.forEach((block, bi) => {
    const sents = (block.match(sentRe) || [block]).map(s => s.trim()).filter(s => s.length > 2);
    for (let i = 0; i < sents.length; i += splitN) {
      const chunk = sents.slice(i, i + splitN).join(' ');
      if (!chunk.trim()) continue;
      scenes.push({ id: idx++, title: titles[bi] || `장면 ${idx}`, narration: chunk, imagePrompt: '', videoPrompt: '', transition: 'cut', fx: 'none', status: 'pending', imgBlob: null, audioBlob: null, checked: false });
    }
  });
  if (!scenes.length) { alert('분할할 내용이 없습니다.'); return; }
  P.scenes = scenes;
  renderSB(); sbLog(`${scenes.length}개 장면 분할 완료`, 'ok');
  gp('storyboard'); autoSave();
}

// AI 분석
async function analyzeAI() {
  const key = ST.settings.gemKey;
  if (!key) { alert('Gemini API 키를 설정 탭에서 입력하세요.'); gp('settings'); return; }
  const script = document.getElementById('scriptIn')?.value.trim();
  if (!script) { alert('대본을 입력하세요.'); return; }
  const style = ST.settings.globalStyle || '';
  const gPrompt = ST.settings.globalPrompt || '';
  const charDesc = (ST.settings.characters || []).map(c => `Character: ${c.name} — ${c.desc}`).join(', ');
  sbLog('AI 씬 분석 중...', 'info');
  document.getElementById('sbLogWrap').style.display = 'block';
  try {
    let raw = await callGemini(key, `다음 스크립트를 씬별로 분석하고 JSON만 응답하세요 (마크다운 없이):
[{"id":0,"title":"제목","narration":"내레이션","imagePrompt":"영어 이미지 프롬프트${style ? ', ' + style : ''}${gPrompt ? ', ' + gPrompt : ''}${charDesc ? ', featuring ' + charDesc : ''}","videoPrompt":"카메라 무브먼트 포함 영상 프롬프트","transition":"cut","fx":"none"}]
스크립트:\n${script}`);
    raw = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    P.scenes = parsed.map((s, i) => ({ ...s, id: i, status: 'pending', imgBlob: null, audioBlob: null, checked: false }));
    renderSB(); sbLog(`AI 분석 완료: ${P.scenes.length}개 씬`, 'ok');
    gp('storyboard'); autoSave();
  } catch (e) { sbLog('AI 분석 실패: ' + e.message, 'err'); alert('오류: ' + e.message); }
}

// ── 스토리보드 ─────────────────────────────────────
function renderSB() {
  const grid = document.getElementById('sceneGrid');
  if (!grid) return;
  document.getElementById('sbBadge').textContent = P.scenes?.length || 0;
  document.getElementById('sbCnt').textContent = (P.scenes?.length || 0) + '개 장면';
  if (!P.scenes?.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><h3>스토리보드가 비어 있습니다</h3><p>대본 탭에서 장면 분할을 실행하세요</p></div>`;
    return;
  }
  grid.innerHTML = P.scenes.map((s, i) => {
    const fx = FX_LIST.find(f => f.id === s.fx) || FX_LIST[0];
    return `<div class="sc${s._sel ? ' sel' : ''}" id="sc-${i}">
      <div class="sc-hd" onclick="selSc(${i})">
        <label class="sc-cb" onclick="event.stopPropagation()"><input type="checkbox" ${s.checked?'checked':''} onchange="P.scenes[${i}].checked=this.checked"></label>
        <span class="sc-num">장면 ${i+1}</span>
        <span class="sc-title">${esc(s.title||'')}</span>
        <button class="ib" onclick="event.stopPropagation();openEdit(${i})" title="편집">✎</button>
        <button class="ib" onclick="event.stopPropagation();delSc(${i})" title="삭제" style="color:var(--text3)">✕</button>
      </div>
      ${s.imgBlob ? `<div class="sc-img"><img src="${URL.createObjectURL(s.imgBlob)}" loading="lazy"></div>` : `<div class="sc-ph"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>이미지 없음</div>`}
      <div class="sc-body">
        <div class="sc-narr">${esc(s.narration||'')}</div>
        <div class="sc-prompt">${esc(s.imagePrompt||'프롬프트 없음')}</div>
        <div class="sc-acts">
          <span class="sc-st ss-${s.status}">${{pending:'대기',generating:'생성중',img_done:'이미지✓',tts_done:'TTS✓',done:'완료',error:'오류'}[s.status]||s.status}</span>
          ${s.audioBlob ? '<span class="badge bvc" style="font-size:9px">TTS✓</span>' : ''}
          <span class="fx-badge" onclick="openEdit(${i})" title="효과 변경">${fx.id==='none'?'효과없음':fx.name}</span>
        </div>
        <div class="sc-acts" style="margin-top:5px">
          <button class="ib" onclick="genImg1(${i})" title="이미지 재생성">🖼</button>
          <button class="ib" onclick="genTts1(${i})" title="TTS 재생성">🔊</button>
          <button class="ib" onclick="dlScImg(${i})" title="이미지 다운" ${!s.imgBlob?'disabled':''}>↓🖼</button>
          <button class="ib" onclick="dlScTts(${i})" title="TTS 다운" ${!s.audioBlob?'disabled':''}>↓🔊</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function selSc(i) {
  P.scenes.forEach((s, j) => s._sel = j === i);
  renderSB();
}
function addScene() {
  P.scenes = P.scenes || [];
  P.scenes.push({ id: P.scenes.length, title: '새 장면', narration: '', imagePrompt: '', videoPrompt: '', transition: 'cut', fx: 'none', status: 'pending', imgBlob: null, audioBlob: null, checked: false });
  renderSB(); autoSave();
}
function delSc(i) {
  if (!confirm('삭제할까요?')) return;
  P.scenes.splice(i, 1); P.scenes.forEach((s, j) => s.id = j);
  renderSB(); autoSave();
}

// ── 씬 편집 모달 ───────────────────────────────────
function openEdit(i) {
  editIdx = i;
  const s = P.scenes[i];
  document.getElementById('sceneModalTtl').textContent = `장면 ${i+1} 편집`;
  document.getElementById('mNarr').value = s.narration || '';
  document.getElementById('mImg').value = s.imagePrompt || '';
  document.getElementById('mVid').value = s.videoPrompt || '';
  document.getElementById('mTrans').value = s.transition || 'cut';
  // 효과 선택 그리드
  document.getElementById('mFxGrid').innerHTML = FX_LIST.map(f =>
    `<div class="fx-opt${s.fx===f.id?' on':''}" onclick="selFx('${f.id}',this)" title="${f.desc}">${f.name}</div>`
  ).join('');
  document.getElementById('sceneModal').classList.add('open');
}
function selFx(id, el) {
  document.querySelectorAll('#mFxGrid .fx-opt').forEach(e => e.classList.remove('on'));
  el.classList.add('on');
  if (editIdx !== null) P.scenes[editIdx].fx = id;
}
function saveSceneEdit() {
  if (editIdx === null) return;
  const s = P.scenes[editIdx];
  s.narration = document.getElementById('mNarr').value;
  s.imagePrompt = document.getElementById('mImg').value;
  s.videoPrompt = document.getElementById('mVid').value;
  s.transition = document.getElementById('mTrans').value;
  closeModal('sceneModal'); renderSB(); autoSave();
}
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// ── 영상 효과 적용 ─────────────────────────────────
function applyFxSel() {
  const sel = P.scenes.filter(s => s.checked);
  if (!sel.length) { alert('체크박스로 장면을 먼저 선택하세요.'); return; }
  sel.forEach(s => { s.fx = FX_RANDOM_POOL[Math.floor(Math.random() * FX_RANDOM_POOL.length)]; });
  sbLog(`선택 ${sel.length}개 장면에 랜덤 효과 적용`, 'ok');
  renderSB(); autoSave();
}
function applyFxAll() {
  P.scenes.forEach(s => { s.fx = FX_RANDOM_POOL[Math.floor(Math.random() * FX_RANDOM_POOL.length)]; });
  sbLog(`전체 ${P.scenes.length}개 장면에 랜덤 효과 적용`, 'ok');
  renderSB(); autoSave();
}

// ── 이미지 생성 ────────────────────────────────────
function buildImgPrompt(scene) {
  const style = ST.settings.globalStyle || '';
  const gp2 = ST.settings.globalPrompt || '';
  const chars = (ST.settings.characters || []).filter(c => c.name || c.desc)
    .map(c => `${c.name}: ${c.desc}`).join('; ');
  let prompt = scene.imagePrompt || scene.narration;
  if (style) prompt += ', ' + style;
  if (gp2) prompt += ', ' + gp2;
  if (chars) prompt += '. Characters: ' + chars;
  return prompt;
}

async function genImg1(i) {
  if (ST.settings.engine === 'flow') {
    alert(`Google Flow 이미지 프롬프트:\n\n${buildImgPrompt(P.scenes[i])}`); return;
  }
  const key = ST.settings.gemKey;
  if (!key) { alert('Gemini API 키가 필요합니다.'); return; }
  P.scenes[i].status = 'generating'; renderSB();
  try {
    P.scenes[i].imgBlob = await generateImg(key, buildImgPrompt(P.scenes[i]));
    P.scenes[i].status = 'img_done';
    sbLog(`장면 ${i+1} 이미지 ✓`, 'ok');
  } catch (e) { P.scenes[i].status = 'error'; sbLog(`장면 ${i+1} 오류: ${e.message}`, 'err'); }
  renderSB(); autoSave();
}

async function genTts1(i) {
  try {
    P.scenes[i].audioBlob = await generateTTS(P.scenes[i].narration);
    sbLog(`장면 ${i+1} TTS ✓`, 'ok');
    renderSB(); autoSave();
  } catch (e) { sbLog(`장면 ${i+1} TTS 오류: ${e.message}`, 'err'); }
}

async function genAllImg() {
  if (ST.settings.engine === 'flow') { sendToFlow('image'); return; }
  const key = ST.settings.gemKey;
  if (!key) { alert('Gemini API 키가 필요합니다.'); return; }
  document.getElementById('sbLogWrap').style.display = 'block';
  for (let i = 0; i < P.scenes.length; i++) {
    P.scenes[i].status = 'generating'; renderSB();
    try {
      P.scenes[i].imgBlob = await generateImg(key, buildImgPrompt(P.scenes[i]));
      P.scenes[i].status = 'img_done';
      sbLog(`장면 ${i+1}/${P.scenes.length} 이미지 ✓`, 'ok');
    } catch (e) { P.scenes[i].status = 'error'; sbLog(`장면 ${i+1} 오류: ${e.message}`, 'err'); }
    renderSB(); await sleep(900);
  }
  autoSave();
}
async function genAllTts() {
  document.getElementById('sbLogWrap').style.display = 'block';
  for (let i = 0; i < P.scenes.length; i++) {
    try {
      P.scenes[i].audioBlob = await generateTTS(P.scenes[i].narration);
      sbLog(`장면 ${i+1}/${P.scenes.length} TTS ✓`, 'ok');
    } catch (e) { sbLog(`장면 ${i+1} TTS 오류: ${e.message}`, 'err'); }
    renderSB(); await sleep(300);
  }
  autoSave();
}
async function genSelImg() {
  const key = ST.settings.gemKey;
  if (!key && ST.settings.engine !== 'flow') { alert('API 키가 필요합니다.'); return; }
  const sel = P.scenes.filter(s => s.checked);
  if (!sel.length) { alert('장면을 체크박스로 선택하세요.'); return; }
  for (const s of sel) {
    const i = P.scenes.indexOf(s);
    await genImg1(i); await sleep(800);
  }
}
async function genSelTts() {
  const sel = P.scenes.filter(s => s.checked);
  if (!sel.length) { alert('장면을 체크박스로 선택하세요.'); return; }
  for (const s of sel) { await genTts1(P.scenes.indexOf(s)); await sleep(300); }
}

// ── 다운로드 ───────────────────────────────────────
function dlScImg(i) {
  if (!P.scenes[i]?.imgBlob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(P.scenes[i].imgBlob);
  a.download = `scene_${String(i+1).padStart(3,'0')}.png`; a.click();
}
function dlScTts(i) {
  if (!P.scenes[i]?.audioBlob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(P.scenes[i].audioBlob);
  a.download = `tts_${String(i+1).padStart(3,'0')}.${P.scenes[i].audioBlob.type.includes('mp3')?'mp3':'wav'}`; a.click();
}
function dlSelImg() {
  const sel = P.scenes.filter(s => s.checked && s.imgBlob);
  if (!sel.length) { alert('이미지가 있는 장면을 선택하세요.'); return; }
  sel.forEach((s, i) => { setTimeout(() => dlScImg(P.scenes.indexOf(s)), i * 200); });
}
function dlSelTts() {
  const sel = P.scenes.filter(s => s.checked && s.audioBlob);
  if (!sel.length) { alert('TTS가 있는 장면을 선택하세요.'); return; }
  sel.forEach((s, i) => { setTimeout(() => dlScTts(P.scenes.indexOf(s)), i * 250); });
}
function dlAllImg() {
  P.scenes.filter(s => s.imgBlob).forEach((s, i) => setTimeout(() => dlScImg(P.scenes.indexOf(s)), i * 200));
}

// 전체 TTS 합치기 다운로드 (Web Audio API로 concat)
async function dlAllTtsMerged() {
  const withAudio = P.scenes.filter(s => s.audioBlob);
  if (!withAudio.length) { alert('TTS가 생성된 장면이 없습니다.'); return; }
  sbLog('TTS 파일 합치는 중...', 'info');
  try {
    const ctx = new AudioContext();
    const buffers = await Promise.all(withAudio.map(async s => {
      const arr = await s.audioBlob.arrayBuffer();
      try { return await ctx.decodeAudioData(arr); }
      catch { return null; }
    }));
    const valid = buffers.filter(Boolean);
    if (!valid.length) { alert('오디오 디코딩 실패. 개별 다운로드를 사용하세요.'); return; }
    const totalLen = valid.reduce((a, b) => a + b.length, 0);
    const merged = ctx.createBuffer(1, totalLen, valid[0].sampleRate);
    let offset = 0;
    valid.forEach(b => { merged.copyToChannel(b.getChannelData(0), 0, offset); offset += b.length; });
    // WAV 인코딩
    const wav = audioBufferToWav(merged);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${P.name || 'all_tts'}_merged.wav`; a.click();
    sbLog('전체 TTS 합치기 완료', 'ok');
    await ctx.close();
  } catch (e) {
    sbLog('TTS 합치기 실패: ' + e.message, 'err');
    // 폴백: 개별 다운로드
    withAudio.forEach((s, i) => setTimeout(() => dlScTts(P.scenes.indexOf(s)), i * 250));
    sbLog('개별 파일로 다운로드합니다', 'warn');
  }
}

function audioBufferToWav(buffer) {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numCh * 2;
  const data = new ArrayBuffer(44 + length);
  const view = new DataView(data);
  const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
  writeStr(0, 'RIFF'); view.setUint32(4, 36 + length, true);
  writeStr(8, 'WAVE'); writeStr(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true); view.setUint16(34, 16, true);
  writeStr(36, 'data'); view.setUint32(40, length, true);
  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2;
    }
  }
  return data;
}

function sendToFlow(type) {
  const prompts = P.scenes.map((s, i) => `=== 장면 ${i+1}: ${s.title||''} ===\n${type==='video'?(s.videoPrompt||buildImgPrompt(s)):buildImgPrompt(s)}`).join('\n\n');
  const blob = new Blob([prompts], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `flow_${type}_${P.name}.txt`; a.click();
  window.open('https://flow.google.com', '_blank');
  sbLog(`${P.scenes.length}개 ${type==='video'?'영상':'이미지'} 프롬프트 → Flow`, 'ok');
}

// ── 캐릭터 관리 ────────────────────────────────────
function renderChars() {
  const chars = ST.settings.characters || [];
  const list = document.getElementById('charList'); if (!list) return;
  const add = document.getElementById('charAdd');
  list.innerHTML = chars.map((c, i) => `
    <div class="char-item">
      <div class="char-thumb" onclick="clickCharThumb(${i})">
        ${c.imgUrl ? `<img src="${c.imgUrl}">` : `<span>사진</span>`}
      </div>
      <div class="char-info">
        <input type="text" value="${esc(c.name||'')}" placeholder="캐릭터 이름" oninput="ST.settings.characters[${i}].name=this.value;autoSave()">
        <input type="text" value="${esc(c.desc||'')}" placeholder="설명 (예: tall young man in a suit)" oninput="ST.settings.characters[${i}].desc=this.value;autoSave()">
      </div>
      <button class="char-del" onclick="delChar(${i})">✕</button>
    </div>`).join('');
  if (add) add.style.display = chars.length >= 5 ? 'none' : 'flex';
}
function addChar() {
  if ((ST.settings.characters || []).length >= 5) { alert('최대 5개까지 등록 가능합니다.'); return; }
  ST.settings.characters = ST.settings.characters || [];
  ST.settings.characters.push({ name: '', desc: '', imgUrl: null });
  renderChars(); autoSave();
}
function delChar(i) {
  ST.settings.characters.splice(i, 1); renderChars(); autoSave();
}
function clickCharThumb(i) {
  charEditIdx = i;
  document.getElementById('charImgInput').click();
}
function charImgUploaded(input) {
  if (!input.files[0] || charEditIdx === null) return;
  const url = URL.createObjectURL(input.files[0]);
  ST.settings.characters[charEditIdx].imgUrl = url;
  renderChars(); autoSave();
}

// ── 스타일 참조 이미지 ─────────────────────────────
function renderStyleRefs() {
  const refs = ST.settings.styleRefs || [];
  const list = document.getElementById('styleRefList'); if (!list) return;
  list.innerHTML = refs.map((r, i) => `
    <div class="ref-item"><img src="${r}">
    <button class="ref-del" onclick="ST.settings.styleRefs.splice(${i},1);renderStyleRefs();autoSave()">✕</button></div>`).join('') +
    (refs.length < 3 ? '<div class="ref-add" onclick="document.getElementById(\'styleRefInput\').click()">+</div>' : '');
}
function addStyleRef(input) {
  ST.settings.styleRefs = ST.settings.styleRefs || [];
  Array.from(input.files).slice(0, 3 - ST.settings.styleRefs.length).forEach(f =>
    ST.settings.styleRefs.push(URL.createObjectURL(f)));
  renderStyleRefs(); autoSave();
}

// ── 마스코트 ───────────────────────────────────────
function renderMascots() {
  const ms = ST.settings.mascots || [];
  const list = document.getElementById('mascotList'); if (!list) return;
  list.innerHTML = ms.map((m, i) => `
    <div class="ref-item"><img src="${m}">
    <button class="ref-del" onclick="ST.settings.mascots.splice(${i},1);renderMascots();autoSave()">✕</button></div>`).join('') +
    (ms.length < 5 ? '<div class="ref-add" onclick="document.getElementById(\'mascotInput\').click()">+</div>' : '');
}
function addMascot(input) {
  ST.settings.mascots = ST.settings.mascots || [];
  Array.from(input.files).slice(0, 5 - ST.settings.mascots.length).forEach(f =>
    ST.settings.mascots.push(URL.createObjectURL(f)));
  renderMascots(); autoSave();
}

// ── 타임라인 ───────────────────────────────────────
function renderTL() {
  const tracks = ['tlV','tlA','tlS'];
  if (!P.scenes?.length) { tracks.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:5px">없음</div>'; }); return; }
  const mk = (s, i, cls, lbl) => {
    const w = Math.max(50, estDur(s.narration) * 8);
    return `<div class="clip ${cls}" style="width:${w}px" onclick="tlSel(${i})">${lbl}</div>`;
  };
  const vt = document.getElementById('tlV'), at = document.getElementById('tlA'), st2 = document.getElementById('tlS');
  if (vt) vt.innerHTML = P.scenes.map((s,i) => mk(s,i,'clip-v','씬'+(i+1)+(s.imgBlob?'🖼':''))).join('');
  if (at) at.innerHTML = P.scenes.map((s,i) => mk(s,i,'clip-a',(s.audioBlob?'🔊':'—')+'TTS')).join('');
  if (st2) st2.innerHTML = P.scenes.map((s,i) => mk(s,i,'clip-s','자막')).join('');
  const tot = P.scenes.reduce((a,s) => a + estDur(s.narration), 0);
  const te = document.getElementById('tlTot'); if (te) te.textContent = fmtT(tot);
  tlSel(0);
}
function tlSel(i) {
  const s = P.scenes[i]; if (!s) return;
  const img = document.getElementById('tlImg'), empty = document.getElementById('tlEmpty');
  if (s.imgBlob) { img.src = URL.createObjectURL(s.imgBlob); img.style.display = 'block'; if(empty) empty.style.display='none'; }
  else { img.style.display='none'; if(empty) empty.style.display='flex'; }
  document.getElementById('tlSN').textContent = '장면 '+(i+1);
  const fx = FX_LIST.find(f => f.id === s.fx); document.getElementById('tlFX').textContent = fx&&fx.id!=='none'?fx.name:'';
  const pr = document.getElementById('tlProp');
  if (pr) pr.innerHTML = `<div style="color:var(--accent);font-weight:700;margin-bottom:6px">장면 ${i+1}</div>
    <div style="font-size:11px;color:var(--text3)">길이</div><div style="font-weight:600;margin-bottom:5px">${estDur(s.narration).toFixed(1)}초</div>
    <div style="font-size:11px;color:var(--text3)">전환</div><div style="margin-bottom:5px">${s.transition||'Cut'}</div>
    <div style="font-size:11px;color:var(--text3)">효과</div><div style="margin-bottom:5px">${FX_LIST.find(f=>f.id===s.fx)?.name||'없음'}</div>
    <div style="font-size:11px;color:var(--text3)">나레이션</div><div style="font-size:11px;color:var(--text2);line-height:1.5">${esc((s.narration||'').substring(0,100))}</div>`;
}
function tlPP(){const b=document.getElementById('tlPBtn');if(b)b.textContent=b.textContent==='▶'?'⏸':'▶';}
function tlPrev(){const c=P.scenes?.findIndex(s=>s._sel)||0;tlSel(Math.max(0,c-1));}
function tlNext(){const c=P.scenes?.findIndex(s=>s._sel)||0;tlSel(Math.min((P.scenes?.length||1)-1,c+1));}

// ── 미리보기 ───────────────────────────────────────
function renderPV(){pvIdx=0;showPV(0);}
function showPV(i){
  const s=P.scenes?.[i];if(!s)return;
  const img=document.getElementById('pvImg'),empty=document.getElementById('pvEmpty');
  if(s.imgBlob){img.src=URL.createObjectURL(s.imgBlob);img.style.display='block';if(empty)empty.style.display='none';}
  else{img.style.display='none';if(empty)empty.style.display='flex';}
  const sub=document.getElementById('pvSub');
  if(sub){sub.textContent=(s.narration||'').substring(0,parseInt(ST.settings.subCh||20));sub.style.display=s.narration?'block':'none';}
  document.getElementById('pvInfo').textContent=`장면 ${i+1} / ${P.scenes.length}`;
  document.getElementById('pvT').textContent=`${fmtT(pvIdx*7)} / ${fmtT(P.scenes.length*7)}`;
}
function pvPlay(){
  pvPlaying=!pvPlaying;document.getElementById('pvBtn').textContent=pvPlaying?'⏸':'▶';
  if(pvPlaying){const step=()=>{if(!pvPlaying)return;if(pvIdx>=P.scenes.length-1){pvPlaying=false;document.getElementById('pvBtn').textContent='▶';return;}pvIdx++;showPV(pvIdx);pvTimer=setTimeout(step,estDur(P.scenes[pvIdx]?.narration)*1000);};pvTimer=setTimeout(step,estDur(P.scenes[pvIdx]?.narration)*1000);}else clearTimeout(pvTimer);
}
function pvPrev(){if(pvIdx>0){pvIdx--;showPV(pvIdx);}}
function pvNext(){if(pvIdx<(P.scenes?.length||1)-1){pvIdx++;showPV(pvIdx);}}
function toggleFS(){document.getElementById('pvW')?.requestFullscreen?.();}
function setPvR(r,btn){document.querySelectorAll('.pv-ctrl .eng-btn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');const p=document.getElementById('pvPl');if(p){p.style.aspectRatio=r==='16:9'?'16/9':'9/16';p.style.maxWidth=r==='16:9'?'720px':'360px';}}

// ── 썸네일 ─────────────────────────────────────────
async function genThumbs() {
  const key = ST.settings.gemKey;
  if (!key) { alert('Gemini API 키가 필요합니다.'); return; }
  const p = document.getElementById('thumbPrompt')?.value.trim();
  const sty = document.getElementById('thumbStyle')?.value.trim();
  if (!p) { alert('썸네일 프롬프트를 입력하세요.'); return; }
  const count = parseInt(document.getElementById('thumbCount')?.value || 3);
  const grid = document.getElementById('thumbGrid');
  if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text3)">생성 중...</div>';
  P.thumbnails = [];
  const fullP = p + (sty ? ', ' + sty : '') + ', YouTube thumbnail, 16:9, high quality';
  for (let i = 0; i < count; i++) {
    try {
      const blob = await generateImg(key, fullP + ` variation ${i+1}`);
      P.thumbnails.push(blob);
    } catch (e) { sbLog('썸네일 오류: ' + e.message, 'err'); }
  }
  renderThumbs(); autoSave();
}
function renderThumbs() {
  const grid = document.getElementById('thumbGrid'); if (!grid) return;
  if (!P.thumbnails?.length) { grid.innerHTML = '<div class="empty" style="grid-column:1/-1;padding:20px"><p>썸네일을 생성해보세요</p></div>'; return; }
  grid.innerHTML = P.thumbnails.map((b, i) => `
    <div class="ti"><span class="ti-lbl">#${i+1}</span>
    <img src="${URL.createObjectURL(b)}" loading="lazy">
    <button class="ti-dl" onclick="dlThumb(${i})">↓</button></div>`).join('');
}
function dlThumb(i) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(P.thumbnails[i]);
  a.download = `thumbnail_${i+1}.png`; a.click();
}

// ── 자막 미리보기 ──────────────────────────────────
function updateSubPrev() {
  const el = document.getElementById('subPrev'); if (!el) return;
  const font = document.getElementById('subFont')?.value || "'Noto Sans KR', sans-serif";
  const sz = parseInt(document.getElementById('subSz')?.value || 25);
  const tc = document.getElementById('subTc')?.value || '#FFFFFF';
  const bc = document.getElementById('subBc')?.value || '#000000';
  const op = parseInt(document.getElementById('subOp')?.value || 80) / 100;
  const pos = document.getElementById('subPos')?.value || 'bottom';
  const shd = document.getElementById('subShd')?.checked;
  const brd = document.getElementById('subBrd')?.checked;
  const r=parseInt(bc.slice(1,3),16), g2=parseInt(bc.slice(3,5),16), b=parseInt(bc.slice(5,7),16);
  const posMap = { bottom:'bottom:10%;top:auto', center:'top:50%;transform:translate(-50%,-50%)', top:'top:10%;bottom:auto' };
  const shadow = shd ? 'text-shadow:1px 1px 3px rgba(0,0,0,.8)' : '';
  const border = brd ? `text-shadow:${tc===shd?'':'-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000'}` : '';
  el.style.cssText = `position:absolute;left:50%;transform:translateX(-50%);${posMap[pos]||'bottom:10%'};padding:5px 12px;border-radius:4px;font-size:${Math.round(sz*0.54)}px;white-space:nowrap;color:${tc};background:rgba(${r},${g2},${b},${op});font-family:${font};${shadow}`;
}

function toggleBgm() {
  const w = document.getElementById('bgmWrap');
  if (w) w.style.display = document.getElementById('useBgm')?.checked ? 'block' : 'none';
}

// ── 음성 목록 ──────────────────────────────────────
function changeTtsEng() {
  const eng = document.getElementById('ttsEng')?.value || 'elevenlabs';
  curLangF = 'ALL';
  const filters = LANG_FILTERS[eng] || [{k:'ALL',l:'전체'}];
  const fwrap = document.getElementById('voiceFilter'); if (!fwrap) return;
  fwrap.innerHTML = filters.map(f => `<button class="vfb${f.k===curLangF?' on':''}" onclick="setLF('${f.k}',this,'${eng}')">${f.l}</button>`).join('');
  renderVoices(eng, curLangF);
}
function setLF(k, btn, eng) {
  curLangF = k;
  document.querySelectorAll('.vfb').forEach(b => b.classList.remove('on')); btn.classList.add('on');
  renderVoices(eng || document.getElementById('ttsEng')?.value || 'elevenlabs', k);
}
function renderVoices(eng, langF) {
  const list = VOICES[eng] || [];
  const filtered = langF === 'ALL' ? list : list.filter(v => v.region === langF);
  const hint = document.getElementById('vcHint'); if (hint) hint.textContent = `${filtered.length}개 음성`;
  const el = document.getElementById('voiceList'); if (!el) return;
  el.innerHTML = filtered.map(v => `
    <div class="vi${selVoice===v.id?' sel':''}" onclick="selV('${v.id}',this)">
      <div style="flex:1"><div class="vi-nm">${v.name}</div><div class="vi-ds">${v.desc}</div></div>
      <div style="display:flex;gap:3px;flex-shrink:0">
        <span class="badge bc" style="font-size:9px">${v.region}</span>
        <span class="badge bvc" style="font-size:9px">${v.gender}</span>
      </div>
      <button class="vi-pv" onclick="event.stopPropagation();testVoice('${v.name}')">▶</button>
    </div>`).join('') || '<div style="font-size:12px;color:var(--text3);padding:7px">음성 없음</div>';
}
function selV(id, el) {
  selVoice = id; document.querySelectorAll('.vi').forEach(v => v.classList.remove('sel')); el.classList.add('sel');
  autoSave();
}
function testVoice(name) {
  const utt = new SpeechSynthesisUtterance('안녕하세요. 테스트 음성입니다.'); utt.lang = 'ko-KR'; speechSynthesis.speak(utt);
}

// ── YouTube 업로드 ─────────────────────────────────
function ytConnect() {
  const cid = document.getElementById('ytCid')?.value.trim() || ST.settings.ytCid;
  if (!cid) { alert('먼저 YouTube OAuth Client ID를 입력하세요.'); return; }
  const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname.replace('studio.html','') + 'studio.html');
  const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${cid}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  const popup = window.open(url, 'ytauth', 'width=500,height=600');
  const chk = setInterval(() => {
    try {
      if (popup.closed) { clearInterval(chk); return; }
      const h = popup.location.hash;
      if (h.includes('access_token')) {
        clearInterval(chk); popup.close();
        const tk = new URLSearchParams(h.slice(1)).get('access_token');
        ST.settings.ytAccessToken = tk; autoSave();
        fetchYtCh(tk);
      }
    } catch {}
  }, 500);
}
async function fetchYtCh(token) {
  try {
    const r = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: { Authorization: 'Bearer ' + token } });
    const d = await r.json();
    if (d.items?.length) {
      document.getElementById('ytChNm').textContent = d.items[0].snippet.title;
      document.getElementById('ytDis').style.display = 'none';
      document.getElementById('ytCon').style.display = 'block';
    }
  } catch (e) { alert('채널 정보 오류: ' + e.message); }
}
function ytDiscon() { ST.settings.ytAccessToken = null; document.getElementById('ytDis').style.display='block'; document.getElementById('ytCon').style.display='none'; autoSave(); }

let ytFileBlob = null;
function selYtFile(input) {
  if (input.files[0]) {
    ytFileBlob = input.files[0];
    const info = document.getElementById('ytFileInfo');
    if (info) { info.textContent = `${input.files[0].name} (${(input.files[0].size/1024/1024).toFixed(1)}MB)`; info.style.display='block'; }
  }
}
async function startUpload() {
  const token = ST.settings.ytAccessToken;
  if (!token) { alert('YouTube 계정을 먼저 연결하세요.'); return; }
  if (!ytFileBlob) { alert('업로드할 영상 파일을 선택하세요.'); return; }
  const title = document.getElementById('ytTitle')?.value.trim() || P.name || '새 영상';
  const desc = document.getElementById('ytDesc')?.value.trim() || '';
  const tags = (document.getElementById('ytTags')?.value||'').split(',').map(t=>t.trim()).filter(Boolean);
  const privacy = document.getElementById('ytPriv')?.value || 'private';
  const cat = document.getElementById('ytCat')?.value || '22';
  const schedule = document.getElementById('ytSched')?.value;
  document.getElementById('ytStat').style.display = 'block';
  document.getElementById('ytStatTxt').textContent = '업로드 초기화 중...';
  const meta = { snippet:{ title, description:desc, tags, categoryId:cat }, status:{ privacyStatus: schedule?'private':privacy } };
  if (schedule) meta.status.publishAt = new Date(schedule).toISOString();
  try {
    const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method:'POST', headers:{ Authorization:'Bearer '+token, 'Content-Type':'application/json', 'X-Upload-Content-Type':ytFileBlob.type, 'X-Upload-Content-Length':ytFileBlob.size }, body:JSON.stringify(meta)
    });
    if (!init.ok) { const e=await init.json(); throw new Error(e.error?.message||'초기화 오류'); }
    const upUrl = init.headers.get('Location');
    if (!upUrl) throw new Error('업로드 URL 없음');
    const CHUNK = 5*1024*1024;
    let offset = 0;
    while (offset < ytFileBlob.size) {
      const end = Math.min(offset+CHUNK, ytFileBlob.size);
      const resp = await fetch(upUrl, { method:'PUT', headers:{ 'Content-Range':`bytes ${offset}-${end-1}/${ytFileBlob.size}`, 'Content-Type':ytFileBlob.type }, body:ytFileBlob.slice(offset,end) });
      offset = end;
      const pct = Math.round(offset/ytFileBlob.size*100);
      document.getElementById('ytProg').style.width = pct+'%';
      document.getElementById('ytPct').textContent = pct+'%';
      document.getElementById('ytStatTxt').textContent = `업로드 중... ${pct}%`;
      if (resp.status===200||resp.status===201) {
        const result = await resp.json();
        document.getElementById('ytStatTxt').textContent = '✓ 완료!';
        document.getElementById('ytLinkRow').style.display='block';
        document.getElementById('ytLink').href = `https://www.youtube.com/watch?v=${result.id}`;
        break;
      }
    }
  } catch (e) { document.getElementById('ytStatTxt').textContent = '오류: '+e.message; }
}

// ── API 호출 ───────────────────────────────────────
async function callGemini(key, prompt) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || 'Gemini 오류');
  return d.candidates[0].content.parts[0].text;
}
async function generateImg(key, prompt) {
  const ratio = ST.settings.ratio || '16:9';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`,
    {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({instances:[{prompt}],parameters:{sampleCount:1,aspectRatio:ratio}})});
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || '이미지 생성 실패');
  const b64=d.predictions[0].bytesBase64Encoded, bytes=atob(b64), arr=new Uint8Array(bytes.length);
  for(let i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
  return new Blob([arr],{type:'image/png'});
}
async function generateTTS(text) {
  const eng = document.getElementById('ttsEng')?.value || ST.settings.ttsEngine || 'gemini';
  const spd = parseFloat(document.getElementById('ttsSpd')?.value || ST.settings.ttsSpeed || 1.0);
  const voice = selVoice || ST.settings.selVoice;
  if (eng==='elevenlabs') {
    const key=ST.settings.elKey; if(!key) return browserTTS(text);
    const vid=voice||'EXAVITQu4vr4xnSDxMaL';
    const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`,{method:'POST',headers:{'Content-Type':'application/json','xi-api-key':key},body:JSON.stringify({text,model_id:'eleven_multilingual_v2',voice_settings:{stability:.5,similarity_boost:.75,speed:spd}})});
    if(!r.ok){const e=await r.json();throw new Error(e.detail?.message||'ElevenLabs 오류');}
    return await r.blob();
  }
  if (eng==='gemini') {
    const key=ST.settings.gemKey; if(!key) return browserTTS(text);
    const vn=voice||'Kore';
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:vn}}}}})});
    const d=await r.json(); if(!r.ok) throw new Error(d.error?.message||'Gemini TTS 오류');
    const b64=d.candidates[0].content.parts[0].inlineData.data, bytes=atob(b64), arr=new Uint8Array(bytes.length);
    for(let i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
    return new Blob([arr],{type:'audio/wav'});
  }
  if (eng==='naver') {
    const cid=ST.settings.navCid, cs=ST.settings.navCs; if(!cid||!cs) return browserTTS(text);
    const spk=voice||'nara';
    const body=new URLSearchParams({text,speaker:spk,volume:0,speed:0,pitch:0,format:'mp3'});
    const r=await fetch('https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts',{method:'POST',headers:{'X-NCP-APIGW-API-KEY-ID':cid,'X-NCP-APIGW-API-KEY':cs,'Content-Type':'application/x-www-form-urlencoded'},body});
    if(!r.ok) throw new Error('네이버 TTS 오류');
    return await r.blob();
  }
  return browserTTS(text);
}
function browserTTS(text) {
  return new Promise((res,rej)=>{
    const utt=new SpeechSynthesisUtterance(text); utt.lang='ko-KR';
    utt.rate=parseFloat(document.getElementById('ttsSpd')?.value||1.0);
    speechSynthesis.speak(utt);
    utt.onend=()=>res(new Blob([''],{type:'audio/webm'}));
    utt.onerror=()=>rej(new Error('브라우저 TTS 실패'));
  });
}
async function testKey(type) {
  if(type==='gemini'){const key=document.getElementById('gemKey')?.value.trim();if(!key){alert('키를 입력하세요.');return;}try{const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);alert(r.ok?'✓ 연결 성공!':'✕ 키 오류 ('+r.status+')');}catch{alert('✕ 네트워크 오류');}}
  else if(type==='elevenlabs'){const key=document.getElementById('elKey')?.value.trim();if(!key){alert('키를 입력하세요.');return;}try{const r=await fetch('https://api.elevenlabs.io/v1/user',{headers:{'xi-api-key':key}});alert(r.ok?'✓ 연결 성공!':'✕ 키 오류 ('+r.status+')');}catch{alert('✕ 네트워크 오류');}}
}
function doRender() { alert(`이미지 완성: ${P.scenes?.filter(s=>s.imgBlob).length||0}개 / TTS: ${P.scenes?.filter(s=>s.audioBlob).length||0}개\n\n다운로드 후 FFmpeg으로 합성하세요.`); }

// ── 유틸 ───────────────────────────────────────────
function estDur(t){return Math.max(3,(t||'').length/7);}
function fmtT(s){const m=Math.floor(s/60),sec=Math.floor(s%60);return `${m}:${String(sec).padStart(2,'0')}`;}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function sbLog(text, level='info') {
  const box=document.getElementById('sbLog'); if(!box) return;
  const div=document.createElement('div'); div.className='l-'+level;
  div.textContent=`[${new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}] ${text}`;
  box.appendChild(div); box.scrollTop=box.scrollHeight;
}
