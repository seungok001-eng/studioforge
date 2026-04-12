'use strict';
// ═══════════════════════════════════════════════════
//  StudioForge v3 — studio.js  (bugfix)
// ═══════════════════════════════════════════════════

var CH = null, ST = {}, P = {};
var splitN = 2, editIdx = null, charEditIdx = null;
var pvIdx = 0, pvPlaying = false, pvTimer = null;
var saveTimer = null;
var selVoice = null, curLangF = 'ALL';
var ytFileBlobGlobal = null;

// ── 영상 효과 ──────────────────────────────────────
var FX_LIST = [
  { id:'none',     name:'없음',       desc:'효과 없음' },
  { id:'zoomin',   name:'줌 인',      desc:'서서히 확대' },
  { id:'zoomout',  name:'줌 아웃',    desc:'서서히 축소' },
  { id:'panl',     name:'패닝 ←',     desc:'오른→왼 이동' },
  { id:'panr',     name:'패닝 →',     desc:'왼→오른 이동' },
  { id:'panu',     name:'패닝 ↑',     desc:'아래→위 이동' },
  { id:'pand',     name:'패닝 ↓',     desc:'위→아래 이동' },
  { id:'zleft',    name:'줌+좌이동',  desc:'확대+왼쪽' },
  { id:'zright',   name:'줌+우이동',  desc:'확대+오른쪽' },
  { id:'shake',    name:'흔들림',     desc:'미세 흔들림' },
  { id:'vignette', name:'비네팅',     desc:'가장자리 어둡게' },
  { id:'random',   name:'랜덤',       desc:'랜덤 적용' },
];
var FX_POOL = ['zoomin','zoomout','panl','panr','panu','pand','zleft','zright'];

// ── 음성 데이터 ────────────────────────────────────
var VOICES = {
  elevenlabs:[
    {id:'eun-woo',name:'Eun Woo',desc:'Calm, Steady',region:'KR',gender:'남'},
    {id:'mi-rae',name:'Mi-rae',desc:'Bright, Energetic',region:'KR',gender:'여'},
    {id:'ji-ho',name:'Ji-ho',desc:'Warm, Professional',region:'KR',gender:'남'},
    {id:'soo-yeon',name:'Soo-yeon',desc:'Soft, Natural',region:'KR',gender:'여'},
    {id:'21m00Tcm4TlvDq8ikWAM',name:'Rachel',desc:'Calm',region:'US',gender:'여'},
    {id:'EXAVITQu4vr4xnSDxMaL',name:'Bella',desc:'Soft',region:'US',gender:'여'},
    {id:'ErXwobaYiN019PkySvjV',name:'Antoni',desc:'Well-rounded',region:'US',gender:'남'},
    {id:'TxGEqnHWrfWFTfGW9XjX',name:'Josh',desc:'Deep',region:'US',gender:'남'},
    {id:'VR6AewLTigWG4xSOukaG',name:'Arnold',desc:'Crisp',region:'US',gender:'남'},
    {id:'pNInz6obpgDQGcFmaJgB',name:'Adam',desc:'Narrative',region:'US',gender:'남'},
    {id:'ZQe5CZNOzWyzPSCn5a3c',name:'Glinda',desc:'Warm',region:'UK',gender:'여'},
    {id:'g5CIjZEefAph4nQFvHAz',name:'Freya',desc:'Energetic',region:'UK',gender:'여'},
    {id:'hana-jp',name:'Hana',desc:'Soft',region:'JP',gender:'여'},
    {id:'kenji-jp',name:'Kenji',desc:'Professional',region:'JP',gender:'남'},
    {id:'mei-cn',name:'Mei',desc:'Clear',region:'CN',gender:'여'},
    {id:'pedro-es',name:'Pedro',desc:'Natural',region:'ES',gender:'남'},
    {id:'pierre-fr',name:'Pierre',desc:'Smooth',region:'FR',gender:'남'},
    {id:'hans-de',name:'Hans',desc:'Strong',region:'DE',gender:'남'},
    {id:'joao-pt',name:'João',desc:'Warm',region:'BR',gender:'남'},
    {id:'marco-it',name:'Marco',desc:'Rich',region:'IT',gender:'남'},
    {id:'ali-ar',name:'Ali',desc:'Deep',region:'AR',gender:'남'},
  ],
  gemini:[
    {id:'Aoede',name:'Aoede',desc:'Bright, Upbeat',region:'ALL',gender:'여'},
    {id:'Charon',name:'Charon',desc:'Informational',region:'ALL',gender:'남'},
    {id:'Fenrir',name:'Fenrir',desc:'Excitable',region:'ALL',gender:'남'},
    {id:'Kore',name:'Kore',desc:'Firm, Clear',region:'ALL',gender:'여'},
    {id:'Puck',name:'Puck',desc:'Playful',region:'ALL',gender:'남'},
    {id:'Leda',name:'Leda',desc:'Youthful',region:'ALL',gender:'여'},
    {id:'Orus',name:'Orus',desc:'Steady',region:'ALL',gender:'남'},
    {id:'Perseus',name:'Perseus',desc:'Conversational',region:'ALL',gender:'남'},
    {id:'Schedar',name:'Schedar',desc:'Neutral',region:'ALL',gender:'남'},
    {id:'Sulafat',name:'Sulafat',desc:'Warm, Soft',region:'ALL',gender:'여'},
    {id:'Zephyr',name:'Zephyr',desc:'Energetic',region:'ALL',gender:'여'},
    {id:'Achernar',name:'Achernar',desc:'Gentle',region:'ALL',gender:'여'},
    {id:'Algenib',name:'Algenib',desc:'Deep',region:'ALL',gender:'남'},
    {id:'Autonoe',name:'Autonoe',desc:'Clear',region:'ALL',gender:'여'},
    {id:'Despina',name:'Despina',desc:'Natural',region:'ALL',gender:'여'},
    {id:'Enceladus',name:'Enceladus',desc:'Breathy',region:'ALL',gender:'남'},
    {id:'Isonoe',name:'Isonoe',desc:'Steady',region:'ALL',gender:'여'},
    {id:'Laomedeia',name:'Laomedeia',desc:'Friendly',region:'ALL',gender:'여'},
    {id:'Rasalgethi',name:'Rasalgethi',desc:'Informative',region:'ALL',gender:'남'},
    {id:'Shaula',name:'Shaula',desc:'Lively',region:'ALL',gender:'여'},
    {id:'Umbriel',name:'Umbriel',desc:'Relaxed',region:'ALL',gender:'남'},
    {id:'Vindemiatrix',name:'Vindemiatrix',desc:'Calm',region:'ALL',gender:'여'},
    {id:'Wasat',name:'Wasat',desc:'Direct',region:'ALL',gender:'남'},
    {id:'Zubenelgenubi',name:'Zubenelgenubi',desc:'Casual',region:'ALL',gender:'남'},
    {id:'Pulcherrima',name:'Pulcherrima',desc:'Confident',region:'ALL',gender:'여'},
    {id:'Sadaltager',name:'Sadaltager',desc:'Knowledgeable',region:'ALL',gender:'남'},
  ],
  naver:[
    {id:'nara',name:'Nara',desc:'표준 여성',region:'KR',gender:'여'},
    {id:'nminsang',name:'Minsang',desc:'표준 남성',region:'KR',gender:'남'},
    {id:'njinho',name:'Jinho',desc:'중저음 남성',region:'KR',gender:'남'},
    {id:'njooahn',name:'Jooan',desc:'깊고 안정적',region:'KR',gender:'남'},
    {id:'njiyeon',name:'Jiyeon',desc:'따뜻한 여성',region:'KR',gender:'여'},
    {id:'nsujin',name:'Sujin',desc:'선명한 여성',region:'KR',gender:'여'},
    {id:'nmijin',name:'Mijin',desc:'부드러운 여성',region:'KR',gender:'여'},
    {id:'nkyunglee',name:'Kyunglee',desc:'안정적 여성',region:'KR',gender:'여'},
    {id:'nara_call',name:'Nara 콜센터',desc:'콜센터 전용',region:'KR',gender:'여'},
    {id:'noyj',name:'Yujin',desc:'뉴스 낭독',region:'KR',gender:'여'},
    {id:'neunyoung',name:'Eunyoung',desc:'뉴스 낭독',region:'KR',gender:'여'},
    {id:'nsabina',name:'Sabina',desc:'내레이션',region:'KR',gender:'여'},
    {id:'nraewon',name:'Raewon',desc:'내레이션 남성',region:'KR',gender:'남'},
    {id:'ntiffany',name:'Tiffany',desc:'활발하고 밝은',region:'KR',gender:'여'},
    {id:'nwoongi',name:'Woongi',desc:'차분하고 부드러운',region:'KR',gender:'남'},
    {id:'nhajun',name:'Hajun',desc:'10대 소년',region:'KR',gender:'남'},
    {id:'nbora',name:'Bora',desc:'활기찬 여성',region:'KR',gender:'여'},
    {id:'njangho',name:'Jangho',desc:'노인 남성',region:'KR',gender:'남'},
    {id:'njoonyoung',name:'Joonyoung',desc:'20대 남성',region:'KR',gender:'남'},
    {id:'nminsang_call',name:'Minsang 콜센터',desc:'콜센터 남성',region:'KR',gender:'남'},
  ]
};

var LANG_FILTERS = {
  elevenlabs:[{k:'ALL',l:'전체'},{k:'KR',l:'🇰🇷 한국어'},{k:'US',l:'🇺🇸 영어US'},{k:'UK',l:'🇬🇧 영어UK'},{k:'JP',l:'🇯🇵 일본어'},{k:'CN',l:'🇨🇳 중국어'},{k:'ES',l:'🇪🇸 스페인어'},{k:'FR',l:'🇫🇷 프랑스어'},{k:'DE',l:'🇩🇪 독일어'},{k:'BR',l:'🇧🇷 포르투갈어'},{k:'IT',l:'🇮🇹 이탈리아어'},{k:'AR',l:'🇸🇦 아랍어'}],
  gemini:[{k:'ALL',l:'전체 (다국어)'}],
  naver:[{k:'ALL',l:'전체'},{k:'KR',l:'🇰🇷 한국어'}],
  browser:[{k:'ALL',l:'전체'}]
};

// ── 초기화 ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  try {
    var chId = localStorage.getItem('sf_current_channel');
    if (!chId) { location.href = 'index.html'; return; }
    var chs = [];
    try { chs = JSON.parse(localStorage.getItem('sf_channels') || '[]'); } catch(e) {}
    CH = null;
    for (var i = 0; i < chs.length; i++) { if (chs[i].id === chId) { CH = chs[i]; break; } }
    if (!CH) { location.href = 'index.html'; return; }
    loadST();
    initUI();
    updateSubPrev();
    changeTtsEng();
  } catch(e) {
    console.error('초기화 오류:', e);
    alert('초기화 오류: ' + e.message);
  }
});

function loadST() {
  try {
    var raw = localStorage.getItem('sf_ch_' + CH.id);
    ST = raw ? JSON.parse(raw) : {};
  } catch(e) { ST = {}; }
  if (!ST.settings) ST.settings = {};
  if (!ST.projects) ST.projects = {};
  var def = {
    engine: CH.engine || 'api', ratio: '16:9',
    ttsEngine: 'elevenlabs', ttsSpeed: 1.0, selVoice: null,
    subFont: "'Noto Sans KR', sans-serif", subSz: 25, subCh: 20,
    subPos: 'bottom', subTc: '#FFFFFF', subBc: '#000000',
    subOp: 80, subShd: true, subFade: false, transT: 1, useBgm: false,
    globalStyle: 'cinematic photo, 4K, dramatic lighting, ultra realistic',
    globalPrompt: '', thumbPrompt: '', thumbStyle: '',
    gemKey: '', elKey: '', falKey: '', navCid: '', navCs: '',
    ytCid: '', ytCs: '', ytAk: '', ytPriv: 'private', ytCat: '22',
    characters: [], styleRefs: [], mascots: [],
    ytAccessToken: null
  };
  var keys = Object.keys(def);
  for (var i = 0; i < keys.length; i++) {
    if (ST.settings[keys[i]] === undefined) ST.settings[keys[i]] = def[keys[i]];
  }
  if (ST.currentPid && ST.projects[ST.currentPid]) {
    P = ST.projects[ST.currentPid];
    if (!P.scenes) P.scenes = [];
    if (!P.thumbnails) P.thumbnails = [];
  } else {
    newProj();
  }
}

function newProj() {
  var id = 'p_' + Date.now();
  P = { id: id, name: '새 프로젝트', scenes: [], thumbnails: [] };
  ST.projects[id] = P;
  ST.currentPid = id;
}

function initUI() {
  try {
    var s = ST.settings;
    el('topIcon').textContent = CH.icon;
    el('topName').textContent = CH.name;
    el('sbCh').textContent = CH.name;
    el('projEl').textContent = P.name;
    setEngSilent(s.engine);
    setRatioSilent(s.ratio);
    setVal('ttsEng', s.ttsEngine);
    setVal('ttsSpd', s.ttsSpeed);
    el('ttsSpdV').textContent = parseFloat(s.ttsSpeed || 1).toFixed(2) + 'x';
    setVal('subFont', s.subFont);
    setVal('subSz', s.subSz); el('subSzV').textContent = s.subSz || 25;
    setVal('subCh', s.subCh); el('subChV').textContent = s.subCh || 20;
    setVal('subPos', s.subPos);
    setVal('subTc', s.subTc); setVal('subBc', s.subBc);
    setVal('subOp', s.subOp); el('subOpV').textContent = s.subOp || 80;
    setChk('subShd', s.subShd); setChk('subFade', s.subFade);
    setVal('transT', s.transT); el('transV').textContent = (s.transT || 1) + '초';
    setVal('globalStyle', s.globalStyle);
    setVal('globalPrompt', s.globalPrompt);
    setVal('thumbPrompt', s.thumbPrompt);
    setVal('thumbStyle', s.thumbStyle);
    setVal('gemKey', s.gemKey); setVal('elKey', s.elKey);
    setVal('falKey', s.falKey); setVal('navCid', s.navCid); setVal('navCs', s.navCs);
    setVal('ytCid', s.ytCid); setVal('ytCs', s.ytCs); setVal('ytAk', s.ytAk);
    setVal('ytPriv', s.ytPriv); setVal('ytCat', s.ytCat);
    if (P.title) setVal('vidTitle', P.title);
    if (P.script) setVal('scriptIn', P.script);
    selVoice = s.selVoice;
    renderChars(); renderStyleRefs(); renderMascots();
    if (P.scenes && P.scenes.length > 0) renderSB();
    // YouTube 연결 상태 복원
    if (s.ytAccessToken) {
      el('ytDis').style.display = 'none';
      el('ytCon').style.display = 'block';
    }
  } catch(e) {
    console.error('initUI 오류:', e);
  }
}

// 헬퍼
function el(id) { return document.getElementById(id); }
function setVal(id, v) { var e = el(id); if (e && v !== undefined && v !== null) e.value = v; }
function setChk(id, v) { var e = el(id); if (e && v !== undefined) e.checked = !!v; }
function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }
function estDur(t) { return Math.max(3, (t || '').length / 7); }
function fmtT(s) { var m=Math.floor(s/60), sec=Math.floor(s%60); return m+':'+String(sec).padStart(2,'0'); }
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── 자동 저장 ──────────────────────────────────────
function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function() {
    try {
      collectS();
      localStorage.setItem('sf_ch_' + CH.id, JSON.stringify(ST));
      var d = el('sdot'); if (d) { d.classList.add('on'); setTimeout(function(){ d.classList.remove('on'); }, 1200); }
    } catch(e) { console.warn('저장 오류:', e); }
  }, 500);
}

function collectS() {
  var s = ST.settings;
  function gv(id) { var e = el(id); return e ? e.value : ''; }
  function gc(id) { var e = el(id); return e ? e.checked : false; }
  s.ttsEngine = gv('ttsEng') || s.ttsEngine;
  s.ttsSpeed = parseFloat(gv('ttsSpd')) || 1.0;
  s.selVoice = selVoice;
  s.subFont = gv('subFont') || s.subFont;
  s.subSz = parseInt(gv('subSz')) || 25;
  s.subCh = parseInt(gv('subCh')) || 20;
  s.subPos = gv('subPos') || 'bottom';
  s.subTc = gv('subTc') || '#FFFFFF';
  s.subBc = gv('subBc') || '#000000';
  s.subOp = parseInt(gv('subOp')) || 80;
  s.subShd = gc('subShd'); s.subFade = gc('subFade');
  s.transT = parseFloat(gv('transT')) || 1;
  s.useBgm = gc('useBgm');
  s.globalStyle = gv('globalStyle') || '';
  s.globalPrompt = gv('globalPrompt') || '';
  s.thumbPrompt = gv('thumbPrompt') || '';
  s.thumbStyle = gv('thumbStyle') || '';
  s.gemKey = gv('gemKey'); s.elKey = gv('elKey');
  s.falKey = gv('falKey'); s.navCid = gv('navCid'); s.navCs = gv('navCs');
  s.ytCid = gv('ytCid'); s.ytCs = gv('ytCs'); s.ytAk = gv('ytAk');
  s.ytPriv = gv('ytPriv') || 'private'; s.ytCat = gv('ytCat') || '22';
  var vt = el('vidTitle'); if (vt) P.title = vt.value;
  var sc = el('scriptIn'); if (sc) P.script = sc.value;
  ST.projects[P.id] = P;
}

function manualSave() {
  collectS();
  localStorage.setItem('sf_ch_' + CH.id, JSON.stringify(ST));
  var b = document.querySelector('.btn-sv');
  if (b) { b.textContent = '저장됨 ✓'; setTimeout(function(){ b.textContent = '저장'; }, 1500); }
}
function saveKeys() {
  collectS(); localStorage.setItem('sf_ch_' + CH.id, JSON.stringify(ST));
  var m = el('keySaveMsg'); if (m) { m.style.display = 'block'; setTimeout(function(){ m.style.display='none'; }, 2000); }
}
function saveYtKeys() { collectS(); localStorage.setItem('sf_ch_' + CH.id, JSON.stringify(ST)); alert('저장됨'); }

// ── 네비게이션 ─────────────────────────────────────
function gp(name) {
  try {
    document.querySelectorAll('.nav').forEach(function(n){ n.classList.toggle('on', n.getAttribute('data-p') === name); });
    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('on'); });
    var pg = el('page-' + name);
    if (pg) pg.classList.add('on');
    if (name === 'storyboard') { renderSB(); updateFlowBar(); }
    else if (name === 'timeline') renderTL();
    else if (name === 'preview') renderPV();
    else if (name === 'settings') changeTtsEng();
  } catch(e) { console.error('네비게이션 오류:', e); }
}
function goChannels() { location.href = 'index.html'; }
function renameProj() {
  var n = prompt('프로젝트 이름:', P.name);
  if (n) { P.name = n; el('projEl').textContent = n; autoSave(); }
}

// ── 엔진 ───────────────────────────────────────────
function setEng(e) { setEngSilent(e); autoSave(); }
function setEngSilent(e) {
  ST.settings.engine = e;
  ['api','flow','both'].forEach(function(k){
    var b = el('eng' + k.charAt(0).toUpperCase() + k.slice(1));
    if (b) b.classList.toggle('on', e === k);
  });
  updateFlowBar();
}
function updateFlowBar() {
  var b = el('sbFlowBar');
  var show = ST.settings.engine === 'flow' || ST.settings.engine === 'both';
  if (b) b.style.display = show ? 'flex' : 'none';
}
function openFlow() { window.open('https://flow.google.com', '_blank'); }

// ── 비율 ───────────────────────────────────────────
function setRatio(r) { setRatioSilent(r); autoSave(); }
function setRatioSilent(r) {
  ST.settings.ratio = r || '16:9';
  var b169 = el('r169'), b916 = el('r916');
  if (b169) { b169.className = r === '16:9' ? 'btn bp' : 'btn bgh'; }
  if (b916) { b916.className = r === '9:16' ? 'btn bp' : 'btn bgh'; }
}

// ── 대본 ───────────────────────────────────────────
function countW() {
  var t = (el('scriptIn') || {}).value || '';
  var w = t.trim() ? t.trim().split(/\s+/).length : 0;
  var e = el('wc'); if (e) e.textContent = w + '어절';
}
function clearScript() { var e = el('scriptIn'); if (e) e.value = ''; countW(); }

function setSplit(n, btn) {
  splitN = n;
  document.querySelectorAll('#splitOpts .btn').forEach(function(b){
    b.className = b === btn ? 'btn bp bsm' : 'btn bgh bsm';
  });
}

function loadSample() {
  setVal('vidTitle', '한화솔루션 유상증자 분석');
  setVal('scriptIn', '[장면1] 인트로\n2026년 3월 26일 아침 8시 42분. 한화솔루션을 2,000주 들고 있던 직장인 한 명이 출근길 지하철에서 MTS를 켰어. 전날 종가 51,000원. 화면에 뜬 숫자는 -19%.\n\n[장면2] 유상증자 분석\n유상증자 공시를 열면 제일 먼저 볼 곳이 있어. 자금 사용 목적이야. 한화솔루션 2.4조 중 1.5조가 차입금 상환, 9,000억이 시설 투자야.\n\n[장면3] 생존 vs 성장\n조달 자금의 절반 이상이 빚 갚는 데 들어가는 구조. 이걸 생존형 증자라고 분류해. 반대로 한화에어로의 3.6조는 성장형이야.\n\n[장면4] 5가지 체크포인트\n첫째, 채무 상환 비율 50% 초과 여부. 둘째, 발행가. 셋째, 실권주 처리. 넷째, 대주주 참여. 다섯째, 업황 사이클.\n\n[장면5] 마무리\n이 5가지를 모르면 다음번에도 똑같이 잃어. 유상증자 공시가 뜨는 순간 3초 만에 판단하는 투자자가 되어보자.');
  countW(); autoSave();
}

function splitScenes() {
  try {
    var scriptEl = el('scriptIn');
    var script = scriptEl ? scriptEl.value.trim() : '';
    if (!script) { alert('대본을 입력하세요.'); return; }

    var scenes = [];
    var idx = 0;

    // [장면N] 태그로 블록 분리
    var tagPattern = /\[장면\d+\]\s*([^\n]*)\n?([\s\S]*?)(?=\[장면\d+\]|$)/g;
    var match;
    var hasTag = false;

    while ((match = tagPattern.exec(script)) !== null) {
      hasTag = true;
      var title = match[1].trim() || ('장면 ' + (idx + 1));
      var content = match[2].trim();
      if (!content) continue;

      // 문장 분리
      var sents = content.split(/(?<=[.!?。！？])\s+|(?<=\n)\s*/).map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 1; });
      if (!sents.length) sents = [content];

      for (var i = 0; i < sents.length; i += splitN) {
        var chunk = sents.slice(i, i + splitN).join(' ').trim();
        if (!chunk) continue;
        scenes.push({
          id: idx++, title: title, narration: chunk,
          imagePrompt: '', videoPrompt: '', transition: 'cut',
          fx: 'none', status: 'pending',
          imgBlob: null, audioBlob: null, checked: false
        });
      }
    }

    // 태그 없으면 빈 줄로 분리
    if (!hasTag) {
      var blocks = script.split(/\n{2,}/);
      for (var bi = 0; bi < blocks.length; bi++) {
        var block = blocks[bi].trim();
        if (!block) continue;
        var sents2 = block.split(/(?<=[.!?。！？])\s+/).map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 1; });
        if (!sents2.length) sents2 = [block];
        for (var si = 0; si < sents2.length; si += splitN) {
          var chunk2 = sents2.slice(si, si + splitN).join(' ').trim();
          if (!chunk2) continue;
          scenes.push({
            id: idx++, title: '장면 ' + (idx), narration: chunk2,
            imagePrompt: '', videoPrompt: '', transition: 'cut',
            fx: 'none', status: 'pending',
            imgBlob: null, audioBlob: null, checked: false
          });
        }
      }
    }

    if (!scenes.length) { alert('분할할 내용이 없습니다. 대본을 확인해주세요.'); return; }

    P.scenes = scenes;
    autoSave();
    renderSB();
    sbLog(scenes.length + '개 장면으로 분할 완료', 'ok');
    gp('storyboard');
  } catch(e) {
    console.error('splitScenes 오류:', e);
    alert('장면 분할 오류: ' + e.message);
  }
}

async function analyzeAI() {
  var key = ST.settings.gemKey;
  if (!key) { alert('Gemini API 키를 설정 탭에서 입력하세요.'); gp('settings'); return; }
  var scriptEl = el('scriptIn');
  var script = scriptEl ? scriptEl.value.trim() : '';
  if (!script) { alert('대본을 입력하세요.'); return; }
  var style = ST.settings.globalStyle || '';
  var gp2 = ST.settings.globalPrompt || '';
  var chars = (ST.settings.characters || []).filter(function(c){ return c.name || c.desc; }).map(function(c){ return c.name + ': ' + c.desc; }).join(', ');
  el('sbLogWrap').style.display = 'block';
  sbLog('AI 씬 분석 중...', 'info');
  try {
    var prompt = '다음 스크립트를 씬별로 분석하고 JSON만 응답하세요(마크다운 없이):\n[{"id":0,"title":"제목","narration":"내레이션","imagePrompt":"영어 이미지 프롬프트' + (style?', '+style:'') + (gp2?', '+gp2:'') + (chars?', featuring '+chars:'') + '","videoPrompt":"영상 프롬프트","transition":"cut","fx":"none"}]\n\n스크립트:\n' + script;
    var raw = await callGemini(key, prompt);
    raw = raw.replace(/```json|```/g, '').trim();
    var parsed = JSON.parse(raw);
    P.scenes = parsed.map(function(s, i){ return Object.assign({}, s, { id: i, status: 'pending', imgBlob: null, audioBlob: null, checked: false }); });
    autoSave(); renderSB();
    sbLog('AI 분석 완료: ' + P.scenes.length + '개 씬', 'ok');
    gp('storyboard');
  } catch(e) { sbLog('AI 분석 실패: ' + e.message, 'err'); alert('오류: ' + e.message); }
}

// ── 스토리보드 ─────────────────────────────────────
function renderSB() {
  try {
    var grid = el('sceneGrid'); if (!grid) return;
    var badge = el('sbBadge'), cnt = el('sbCnt');
    var len = P.scenes ? P.scenes.length : 0;
    if (badge) badge.textContent = len;
    if (cnt) cnt.textContent = len + '개 장면';
    if (!len) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><h3>스토리보드가 비어 있습니다</h3><p>대본 탭에서 장면 분할을 실행하세요</p></div>';
      return;
    }
    var html = '';
    for (var i = 0; i < P.scenes.length; i++) {
      var s = P.scenes[i];
      var fx = FX_LIST[0];
      for (var fi = 0; fi < FX_LIST.length; fi++) { if (FX_LIST[fi].id === s.fx) { fx = FX_LIST[fi]; break; } }
      var stMap = {pending:'대기',generating:'생성중',img_done:'이미지✓',tts_done:'TTS✓',done:'완료',error:'오류'};
      var stCls = {pending:'ss-p',generating:'ss-g',img_done:'ss-i',tts_done:'ss-t',done:'ss-d',error:'ss-e'};
      var imgHtml = s.imgBlob
        ? '<div class="sc-img"><img src="' + URL.createObjectURL(s.imgBlob) + '" loading="lazy"></div>'
        : '<div class="sc-ph"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>이미지 없음</div>';
      html += '<div class="sc' + (s._sel ? ' sel' : '') + '" id="sc-' + i + '">'
        + '<div class="sc-hd" onclick="selSc(' + i + ')">'
        + '<label class="sc-cb" onclick="event.stopPropagation()"><input type="checkbox"' + (s.checked ? ' checked' : '') + ' onchange="P.scenes[' + i + '].checked=this.checked"></label>'
        + '<span class="sc-num">장면 ' + (i+1) + '</span>'
        + '<span class="sc-title">' + esc(s.title || '') + '</span>'
        + '<button class="ib" onclick="event.stopPropagation();openEdit(' + i + ')" title="편집">✎</button>'
        + '<button class="ib" onclick="event.stopPropagation();delSc(' + i + ')" title="삭제" style="color:var(--text3)">✕</button>'
        + '</div>'
        + imgHtml
        + '<div class="sc-body">'
        + '<div class="sc-narr">' + esc(s.narration || '') + '</div>'
        + '<div class="sc-prompt">' + esc(s.imagePrompt || '프롬프트 없음') + '</div>'
        + '<div class="sc-acts">'
        + '<span class="sc-st ' + (stCls[s.status] || 'ss-p') + '">' + (stMap[s.status] || s.status) + '</span>'
        + (s.audioBlob ? '<span class="badge bvc" style="font-size:9px">TTS✓</span>' : '')
        + '<span class="fx-badge" onclick="openEdit(' + i + ')" title="효과 변경">' + (fx.id === 'none' ? '효과없음' : fx.name) + '</span>'
        + '</div>'
        + '<div class="sc-acts" style="margin-top:5px">'
        + '<button class="ib" onclick="genImg1(' + i + ')" title="이미지 재생성">🖼</button>'
        + '<button class="ib" onclick="genTts1(' + i + ')" title="TTS 재생성">🔊</button>'
        + '<button class="ib" onclick="dlScImg(' + i + ')" title="이미지 다운"' + (!s.imgBlob ? ' disabled' : '') + '>↓🖼</button>'
        + '<button class="ib" onclick="dlScTts(' + i + ')" title="TTS 다운"' + (!s.audioBlob ? ' disabled' : '') + '>↓🔊</button>'
        + '</div></div></div>';
    }
    grid.innerHTML = html;
  } catch(e) { console.error('renderSB 오류:', e); }
}

function selSc(i) {
  for (var j = 0; j < P.scenes.length; j++) P.scenes[j]._sel = j === i;
  renderSB();
}
function addScene() {
  if (!P.scenes) P.scenes = [];
  P.scenes.push({ id: P.scenes.length, title: '새 장면', narration: '', imagePrompt: '', videoPrompt: '', transition: 'cut', fx: 'none', status: 'pending', imgBlob: null, audioBlob: null, checked: false });
  renderSB(); autoSave();
}
function delSc(i) {
  if (!confirm('이 장면을 삭제할까요?')) return;
  P.scenes.splice(i, 1);
  for (var j = 0; j < P.scenes.length; j++) P.scenes[j].id = j;
  renderSB(); autoSave();
}

// ── 씬 편집 모달 ───────────────────────────────────
function openEdit(i) {
  editIdx = i;
  var s = P.scenes[i];
  el('sceneModalTtl').textContent = '장면 ' + (i+1) + ' 편집';
  el('mNarr').value = s.narration || '';
  el('mImg').value = s.imagePrompt || '';
  el('mVid').value = s.videoPrompt || '';
  el('mTrans').value = s.transition || 'cut';
  var html = '';
  for (var fi = 0; fi < FX_LIST.length; fi++) {
    var f = FX_LIST[fi];
    html += '<div class="fx-opt' + (s.fx === f.id ? ' on' : '') + '" onclick="selFx(\'' + f.id + '\',this)" title="' + f.desc + '">' + f.name + '</div>';
  }
  el('mFxGrid').innerHTML = html;
  el('sceneModal').classList.add('open');
}
function selFx(id, btn) {
  document.querySelectorAll('#mFxGrid .fx-opt').forEach(function(e){ e.classList.remove('on'); });
  btn.classList.add('on');
  if (editIdx !== null) P.scenes[editIdx].fx = id;
}
function saveSceneEdit() {
  if (editIdx === null) return;
  var s = P.scenes[editIdx];
  s.narration = el('mNarr').value;
  s.imagePrompt = el('mImg').value;
  s.videoPrompt = el('mVid').value;
  s.transition = el('mTrans').value;
  closeModal('sceneModal'); renderSB(); autoSave();
}
function closeModal(id) { var e = el(id); if (e) e.classList.remove('open'); }

// ── 영상 효과 ──────────────────────────────────────
function applyFxSel() {
  var sel = P.scenes.filter(function(s){ return s.checked; });
  if (!sel.length) { alert('체크박스로 장면을 먼저 선택하세요.'); return; }
  sel.forEach(function(s){ s.fx = rnd(FX_POOL); });
  sbLog('선택 ' + sel.length + '개 장면에 랜덤 효과 적용', 'ok'); renderSB(); autoSave();
}
function applyFxAll() {
  P.scenes.forEach(function(s){ s.fx = rnd(FX_POOL); });
  sbLog('전체 ' + P.scenes.length + '개 장면에 랜덤 효과 적용', 'ok'); renderSB(); autoSave();
}

// ── 이미지 프롬프트 빌드 ───────────────────────────
function buildPrompt(scene) {
  var parts = [];
  if (scene.imagePrompt) parts.push(scene.imagePrompt);
  else parts.push(scene.narration || '');
  var style = ST.settings.globalStyle; if (style) parts.push(style);
  var gp2 = ST.settings.globalPrompt; if (gp2) parts.push(gp2);
  var chars = (ST.settings.characters || []).filter(function(c){ return c.name || c.desc; }).map(function(c){ return c.name + ': ' + c.desc; }).join('; ');
  if (chars) parts.push('Characters: ' + chars);
  return parts.join(', ');
}

// ── 이미지/TTS 개별 생성 ─────────────────────────
async function genImg1(i) {
  if (ST.settings.engine === 'flow') { alert('Google Flow 프롬프트:\n\n' + buildPrompt(P.scenes[i])); return; }
  var key = ST.settings.gemKey;
  if (!key) { alert('설정 탭에서 Gemini API 키를 먼저 입력하세요.'); gp('settings'); return; }
  P.scenes[i].status = 'generating'; renderSB();
  try {
    P.scenes[i].imgBlob = await generateImg(key, buildPrompt(P.scenes[i]));
    P.scenes[i].status = 'img_done';
    sbLog('장면 ' + (i+1) + ' 이미지 ✓', 'ok');
  } catch(e) { P.scenes[i].status = 'error'; sbLog('장면 ' + (i+1) + ' 오류: ' + e.message, 'err'); }
  renderSB(); autoSave();
}
async function genTts1(i) {
  try {
    P.scenes[i].audioBlob = await generateTTS(P.scenes[i].narration);
    sbLog('장면 ' + (i+1) + ' TTS ✓', 'ok'); renderSB(); autoSave();
  } catch(e) { sbLog('장면 ' + (i+1) + ' TTS 오류: ' + e.message, 'err'); }
}

// ── 전체/선택 생성 ─────────────────────────────────
async function genAllImg() {
  if (ST.settings.engine === 'flow') { sendToFlow('image'); return; }
  var key = ST.settings.gemKey;
  if (!key) { alert('Gemini API 키가 필요합니다.'); return; }
  el('sbLogWrap').style.display = 'block';
  for (var i = 0; i < P.scenes.length; i++) {
    P.scenes[i].status = 'generating'; renderSB();
    try {
      P.scenes[i].imgBlob = await generateImg(key, buildPrompt(P.scenes[i]));
      P.scenes[i].status = 'img_done';
      sbLog('장면 ' + (i+1) + '/' + P.scenes.length + ' 이미지 ✓', 'ok');
    } catch(e) { P.scenes[i].status = 'error'; sbLog('장면 ' + (i+1) + ' 오류: ' + e.message, 'err'); }
    renderSB(); await sleep(900);
  }
  autoSave();
}
async function genAllTts() {
  el('sbLogWrap').style.display = 'block';
  for (var i = 0; i < P.scenes.length; i++) {
    try {
      P.scenes[i].audioBlob = await generateTTS(P.scenes[i].narration);
      sbLog('장면 ' + (i+1) + '/' + P.scenes.length + ' TTS ✓', 'ok');
    } catch(e) { sbLog('장면 ' + (i+1) + ' TTS 오류: ' + e.message, 'err'); }
    renderSB(); await sleep(300);
  }
  autoSave();
}
async function genSelImg() {
  var key = ST.settings.gemKey;
  if (!key && ST.settings.engine !== 'flow') { alert('API 키가 필요합니다.'); return; }
  var hasSel = false;
  for (var i = 0; i < P.scenes.length; i++) { if (P.scenes[i].checked) { hasSel = true; await genImg1(i); await sleep(800); } }
  if (!hasSel) alert('체크박스로 장면을 선택하세요.');
}
async function genSelTts() {
  var hasSel = false;
  for (var i = 0; i < P.scenes.length; i++) { if (P.scenes[i].checked) { hasSel = true; await genTts1(i); await sleep(300); } }
  if (!hasSel) alert('체크박스로 장면을 선택하세요.');
}

// ── 다운로드 ───────────────────────────────────────
function dlScImg(i) {
  if (!P.scenes[i] || !P.scenes[i].imgBlob) return;
  var a = document.createElement('a');
  a.href = URL.createObjectURL(P.scenes[i].imgBlob);
  a.download = 'scene_' + String(i+1).padStart(3,'0') + '.png'; a.click();
}
function dlScTts(i) {
  if (!P.scenes[i] || !P.scenes[i].audioBlob) return;
  var ext = P.scenes[i].audioBlob.type.includes('mp3') ? 'mp3' : 'wav';
  var a = document.createElement('a');
  a.href = URL.createObjectURL(P.scenes[i].audioBlob);
  a.download = 'tts_' + String(i+1).padStart(3,'0') + '.' + ext; a.click();
}
function dlSelImg() {
  var n = 0;
  P.scenes.forEach(function(s, i){ if (s.checked && s.imgBlob) { setTimeout(function(){ dlScImg(i); }, n++ * 200); } });
  if (!n) alert('이미지가 있는 장면을 체크하세요.');
}
function dlSelTts() {
  var n = 0;
  P.scenes.forEach(function(s, i){ if (s.checked && s.audioBlob) { setTimeout(function(){ dlScTts(i); }, n++ * 250); } });
  if (!n) alert('TTS가 있는 장면을 체크하세요.');
}
function dlAllImg() {
  var n = 0;
  P.scenes.forEach(function(s, i){ if (s.imgBlob) { setTimeout(function(){ dlScImg(i); }, n++ * 200); } });
  if (!n) alert('생성된 이미지가 없습니다.');
}
async function dlAllTtsMerged() {
  var withAudio = P.scenes.filter(function(s){ return s.audioBlob; });
  if (!withAudio.length) { alert('TTS가 생성된 장면이 없습니다.'); return; }
  sbLog('TTS 파일 합치는 중...', 'info');
  try {
    var ctx = new AudioContext();
    var buffers = [];
    for (var i = 0; i < withAudio.length; i++) {
      try {
        var arr = await withAudio[i].audioBlob.arrayBuffer();
        var buf = await ctx.decodeAudioData(arr);
        buffers.push(buf);
      } catch(e) { console.warn('TTS 디코딩 실패:', e); }
    }
    if (!buffers.length) { alert('오디오 디코딩 실패. 개별 다운로드를 이용하세요.'); return; }
    var totalLen = buffers.reduce(function(a,b){ return a + b.length; }, 0);
    var merged = ctx.createBuffer(1, totalLen, buffers[0].sampleRate);
    var off = 0;
    buffers.forEach(function(b){ merged.copyToChannel(b.getChannelData(0), 0, off); off += b.length; });
    var wav = audioBufferToWav(merged);
    var blob = new Blob([wav], { type: 'audio/wav' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (P.name || 'all_tts') + '_merged.wav'; a.click();
    sbLog('전체 TTS 합치기 완료', 'ok');
    await ctx.close();
  } catch(e) {
    sbLog('합치기 실패. 개별 다운로드로 전환: ' + e.message, 'warn');
    P.scenes.forEach(function(s, i){ if (s.audioBlob) setTimeout(function(){ dlScTts(i); }, i * 250); });
  }
}
function audioBufferToWav(buf) {
  var ch = buf.numberOfChannels, sr = buf.sampleRate, len = buf.length * ch * 2;
  var data = new ArrayBuffer(44 + len), v = new DataView(data);
  var ws = function(off, str){ for (var i=0;i<str.length;i++) v.setUint8(off+i, str.charCodeAt(i)); };
  ws(0,'RIFF'); v.setUint32(4,36+len,true); ws(8,'WAVE'); ws(12,'fmt ');
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,ch,true);
  v.setUint32(24,sr,true); v.setUint32(28,sr*ch*2,true); v.setUint16(32,ch*2,true); v.setUint16(34,16,true);
  ws(36,'data'); v.setUint32(40,len,true);
  var off = 44;
  for (var i=0;i<buf.length;i++) { for (var c=0;c<ch;c++) { var s=Math.max(-1,Math.min(1,buf.getChannelData(c)[i])); v.setInt16(off,s<0?s*0x8000:s*0x7FFF,true); off+=2; } }
  return data;
}

function sendToFlow(type) {
  var lines = P.scenes.map(function(s,i){ return '=== 장면 '+(i+1)+': '+(s.title||'')+' ===\n'+(type==='video'?(s.videoPrompt||buildPrompt(s)):buildPrompt(s)); });
  var blob = new Blob([lines.join('\n\n')], {type:'text/plain'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'flow_'+type+'_'+P.name+'.txt'; a.click();
  window.open('https://flow.google.com','_blank');
  sbLog(P.scenes.length+'개 '+((type==='video')?'영상':'이미지')+' 프롬프트 → Flow', 'ok');
}

// ── 캐릭터 ─────────────────────────────────────────
function renderChars() {
  var chars = ST.settings.characters || [];
  var list = el('charList'); if (!list) return;
  var html = '';
  for (var i = 0; i < chars.length; i++) {
    var c = chars[i];
    html += '<div class="char-item">'
      + '<div class="char-thumb" onclick="clickCharThumb('+i+')">' + (c.imgUrl ? '<img src="'+c.imgUrl+'">' : '<span>사진</span>') + '</div>'
      + '<div class="char-info">'
      + '<input type="text" value="'+esc(c.name||'')+'" placeholder="캐릭터 이름" oninput="ST.settings.characters['+i+'].name=this.value;autoSave()">'
      + '<input type="text" value="'+esc(c.desc||'')+'" placeholder="설명 (예: tall man in a suit)" oninput="ST.settings.characters['+i+'].desc=this.value;autoSave()">'
      + '</div>'
      + '<button class="char-del" onclick="delChar('+i+')">✕</button>'
      + '</div>';
  }
  list.innerHTML = html;
  var addBtn = el('charAdd'); if (addBtn) addBtn.style.display = chars.length >= 5 ? 'none' : 'flex';
}
function addChar() {
  if (!ST.settings.characters) ST.settings.characters = [];
  if (ST.settings.characters.length >= 5) { alert('최대 5개까지 등록 가능합니다.'); return; }
  ST.settings.characters.push({ name: '', desc: '', imgUrl: null });
  renderChars(); autoSave();
}
function delChar(i) { ST.settings.characters.splice(i, 1); renderChars(); autoSave(); }
function clickCharThumb(i) { charEditIdx = i; el('charImgInput').click(); }
function charImgUploaded(input) {
  if (!input.files[0] || charEditIdx === null) return;
  ST.settings.characters[charEditIdx].imgUrl = URL.createObjectURL(input.files[0]);
  renderChars(); autoSave();
}

// ── 스타일 참조 / 마스코트 ─────────────────────────
function renderStyleRefs() {
  var refs = ST.settings.styleRefs || [];
  var list = el('styleRefList'); if (!list) return;
  var html = refs.map(function(r,i){ return '<div class="ref-item"><img src="'+r+'"><button class="ref-del" onclick="ST.settings.styleRefs.splice('+i+',1);renderStyleRefs();autoSave()">✕</button></div>'; }).join('');
  if (refs.length < 3) html += '<div class="ref-add" onclick="document.getElementById(\'styleRefInput\').click()">+</div>';
  list.innerHTML = html;
}
function addStyleRef(input) {
  if (!ST.settings.styleRefs) ST.settings.styleRefs = [];
  Array.from(input.files).slice(0, 3 - ST.settings.styleRefs.length).forEach(function(f){ ST.settings.styleRefs.push(URL.createObjectURL(f)); });
  renderStyleRefs(); autoSave();
}
function renderMascots() {
  var ms = ST.settings.mascots || [];
  var list = el('mascotList'); if (!list) return;
  var html = ms.map(function(m,i){ return '<div class="ref-item"><img src="'+m+'"><button class="ref-del" onclick="ST.settings.mascots.splice('+i+',1);renderMascots();autoSave()">✕</button></div>'; }).join('');
  if (ms.length < 5) html += '<div class="ref-add" onclick="document.getElementById(\'mascotInput\').click()">+</div>';
  list.innerHTML = html;
}
function addMascot(input) {
  if (!ST.settings.mascots) ST.settings.mascots = [];
  Array.from(input.files).slice(0, 5 - ST.settings.mascots.length).forEach(function(f){ ST.settings.mascots.push(URL.createObjectURL(f)); });
  renderMascots(); autoSave();
}

// ── 타임라인 ───────────────────────────────────────
function renderTL() {
  var vt = el('tlV'), at = el('tlA'), st2 = el('tlS');
  if (!P.scenes || !P.scenes.length) {
    if(vt) vt.innerHTML='<div style="font-size:11px;color:var(--text3);padding:5px">장면 없음</div>';
    return;
  }
  function mk(s, i, cls, lbl) {
    var w = Math.max(50, estDur(s.narration) * 8);
    return '<div class="clip '+cls+'" style="width:'+w+'px" onclick="tlSel('+i+')">'+lbl+'</div>';
  }
  var vHtml='', aHtml='', sHtml='';
  for (var i = 0; i < P.scenes.length; i++) {
    var s = P.scenes[i];
    vHtml += mk(s, i, 'clip-v', '씬'+(i+1)+(s.imgBlob?'🖼':''));
    aHtml += mk(s, i, 'clip-a', (s.audioBlob?'🔊':'—')+'TTS');
    sHtml += mk(s, i, 'clip-s', '자막');
  }
  if(vt) vt.innerHTML = vHtml;
  if(at) at.innerHTML = aHtml;
  if(st2) st2.innerHTML = sHtml;
  var tot = P.scenes.reduce(function(a,s){ return a+estDur(s.narration); }, 0);
  var te = el('tlTot'); if(te) te.textContent = fmtT(tot);
  tlSel(0);
}
function tlSel(i) {
  var s = P.scenes[i]; if (!s) return;
  var img = el('tlImg'), empty = el('tlEmpty');
  if (s.imgBlob) { img.src=URL.createObjectURL(s.imgBlob); img.style.display='block'; if(empty) empty.style.display='none'; }
  else { img.style.display='none'; if(empty) empty.style.display='flex'; }
  el('tlSN').textContent = '장면 '+(i+1);
  var fx = FX_LIST[0]; for(var fi=0;fi<FX_LIST.length;fi++){if(FX_LIST[fi].id===s.fx){fx=FX_LIST[fi];break;}}
  var fxEl = el('tlFX'); if(fxEl) fxEl.textContent = fx&&fx.id!=='none'?fx.name:'';
  var pr = el('tlProp');
  if (pr) pr.innerHTML = '<div style="color:var(--accent);font-weight:700;margin-bottom:6px">장면 '+(i+1)+'</div>'
    +'<div style="font-size:11px;color:var(--text3)">길이</div><div style="font-weight:600;margin-bottom:5px">'+estDur(s.narration).toFixed(1)+'초</div>'
    +'<div style="font-size:11px;color:var(--text3)">전환</div><div style="margin-bottom:5px">'+(s.transition||'Cut')+'</div>'
    +'<div style="font-size:11px;color:var(--text3)">효과</div><div style="margin-bottom:5px">'+(fx?fx.name:'없음')+'</div>'
    +'<div style="font-size:11px;color:var(--text3)">나레이션</div><div style="font-size:11px;color:var(--text2);line-height:1.5">'+esc((s.narration||'').substring(0,100))+'</div>';
}
function tlPP(){ var b=el('tlPBtn'); if(b) b.textContent=b.textContent==='▶'?'⏸':'▶'; }
function tlPrev(){ var c=P.scenes?P.scenes.findIndex(function(s){return s._sel;})||0:0; tlSel(Math.max(0,c-1)); }
function tlNext(){ var c=P.scenes?P.scenes.findIndex(function(s){return s._sel;})||0:0; tlSel(Math.min((P.scenes?P.scenes.length:1)-1,c+1)); }

// ── 미리보기 ───────────────────────────────────────
function renderPV(){ pvIdx=0; showPV(0); }
function showPV(i) {
  var s = P.scenes&&P.scenes[i]; if (!s) return;
  var img=el('pvImg'), empty=el('pvEmpty');
  if (s.imgBlob) { img.src=URL.createObjectURL(s.imgBlob); img.style.display='block'; if(empty) empty.style.display='none'; }
  else { img.style.display='none'; if(empty) empty.style.display='flex'; }
  var sub=el('pvSub');
  if (sub) { sub.textContent=(s.narration||'').substring(0,parseInt(ST.settings.subCh||20)); sub.style.display=s.narration?'block':'none'; }
  var info=el('pvInfo'); if(info) info.textContent='장면 '+(i+1)+' / '+(P.scenes?P.scenes.length:0);
  var t=el('pvT'); if(t) t.textContent=fmtT(pvIdx*7)+' / '+fmtT((P.scenes?P.scenes.length:0)*7);
}
function pvPlay() {
  pvPlaying=!pvPlaying; var b=el('pvBtn'); if(b) b.textContent=pvPlaying?'⏸':'▶';
  if (pvPlaying) {
    var step=function(){ if(!pvPlaying)return; if(pvIdx>=(P.scenes?P.scenes.length:0)-1){pvPlaying=false;var b2=el('pvBtn');if(b2)b2.textContent='▶';return;} pvIdx++; showPV(pvIdx); pvTimer=setTimeout(step, estDur((P.scenes&&P.scenes[pvIdx]?P.scenes[pvIdx].narration:''))*1000); };
    pvTimer=setTimeout(step, estDur((P.scenes&&P.scenes[pvIdx]?P.scenes[pvIdx].narration:''))*1000);
  } else clearTimeout(pvTimer);
}
function pvPrev(){ if(pvIdx>0){pvIdx--;showPV(pvIdx);} }
function pvNext(){ if(pvIdx<(P.scenes?P.scenes.length:1)-1){pvIdx++;showPV(pvIdx);} }
function toggleFS(){ el('pvW')&&el('pvW').requestFullscreen&&el('pvW').requestFullscreen(); }
function setPvR(r,btn){ document.querySelectorAll('.pv-ctrl .eng-btn').forEach(function(b){b.classList.remove('on');}); btn.classList.add('on'); var p=el('pvPl'); if(p){p.style.aspectRatio=r==='16:9'?'16/9':'9/16';p.style.maxWidth=r==='16:9'?'720px':'360px';} }

// ── 썸네일 ─────────────────────────────────────────
async function genThumbs() {
  var key = ST.settings.gemKey;
  if (!key) { alert('Gemini API 키가 필요합니다.'); gp('settings'); return; }
  var p = (el('thumbPrompt')||{}).value || '';
  var sty = (el('thumbStyle')||{}).value || '';
  if (!p.trim()) { alert('썸네일 프롬프트를 입력하세요.'); return; }
  var count = parseInt((el('thumbCount')||{}).value || '3');
  var grid = el('thumbGrid');
  if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text3)">생성 중...</div>';
  P.thumbnails = [];
  var fullP = p + (sty?', '+sty:'') + ', YouTube thumbnail, 16:9, high quality';
  for (var i = 0; i < count; i++) {
    try { P.thumbnails.push(await generateImg(key, fullP + ' variation '+(i+1))); }
    catch(e) { sbLog('썸네일 오류: '+e.message, 'err'); }
  }
  renderThumbs(); autoSave();
}
function renderThumbs() {
  var grid = el('thumbGrid'); if (!grid) return;
  if (!P.thumbnails||!P.thumbnails.length) { grid.innerHTML='<div class="empty" style="grid-column:1/-1;padding:20px"><p>썸네일을 생성해보세요</p></div>'; return; }
  grid.innerHTML = P.thumbnails.map(function(b,i){ return '<div class="ti"><span class="ti-lbl">#'+(i+1)+'</span><img src="'+URL.createObjectURL(b)+'" loading="lazy"><button class="ti-dl" onclick="dlThumb('+i+')">↓</button></div>'; }).join('');
}
function dlThumb(i) { var a=document.createElement('a'); a.href=URL.createObjectURL(P.thumbnails[i]); a.download='thumbnail_'+(i+1)+'.png'; a.click(); }

// ── 자막 미리보기 ──────────────────────────────────
function updateSubPrev() {
  var e = el('subPrev'); if (!e) return;
  var font = (el('subFont')||{}).value || "'Noto Sans KR', sans-serif";
  var sz   = parseInt((el('subSz')||{}).value||'25');
  var tc   = (el('subTc')||{}).value || '#FFFFFF';
  var bc   = (el('subBc')||{}).value || '#000000';
  var op   = parseInt((el('subOp')||{}).value||'80') / 100;
  var pos  = (el('subPos')||{}).value || 'bottom';
  var shd  = el('subShd')&&el('subShd').checked;
  var r=parseInt(bc.slice(1,3),16)||0, g2=parseInt(bc.slice(3,5),16)||0, b=parseInt(bc.slice(5,7),16)||0;
  var posMap = { bottom:'bottom:10%;top:auto;transform:translateX(-50%)', center:'top:50%;transform:translate(-50%,-50%)', top:'top:10%;bottom:auto;transform:translateX(-50%)' };
  var shadow = shd ? 'text-shadow:1px 1px 3px rgba(0,0,0,.9)' : '';
  e.style.cssText = 'position:absolute;left:50%;'+( posMap[pos]||posMap.bottom )+';padding:5px 12px;border-radius:4px;font-size:'+Math.round(sz*0.54)+'px;white-space:nowrap;color:'+tc+';background:rgba('+r+','+g2+','+b+','+op+');font-family:'+font+';'+shadow;
}
function toggleBgm() { var w=el('bgmWrap'); if(w) w.style.display=(el('useBgm')&&el('useBgm').checked)?'block':'none'; }

// ── TTS 음성 목록 ──────────────────────────────────
function changeTtsEng() {
  var eng = (el('ttsEng')||{}).value || 'elevenlabs';
  curLangF = 'ALL';
  var filters = LANG_FILTERS[eng] || [{k:'ALL',l:'전체'}];
  var fwrap = el('voiceFilter'); if (!fwrap) return;
  fwrap.innerHTML = filters.map(function(f){ return '<button class="vfb'+(f.k===curLangF?' on':'')+'" onclick="setLF(\''+f.k+'\',this,\''+eng+'\')">'+f.l+'</button>'; }).join('');
  renderVoices(eng, 'ALL');
}
function setLF(k, btn, eng) {
  curLangF = k;
  document.querySelectorAll('.vfb').forEach(function(b){ b.classList.remove('on'); }); btn.classList.add('on');
  renderVoices(eng || (el('ttsEng')||{}).value || 'elevenlabs', k);
}
function renderVoices(eng, langF) {
  var list = VOICES[eng] || [];
  var filtered = langF==='ALL' ? list : list.filter(function(v){ return v.region===langF; });
  var hint = el('vcHint'); if (hint) hint.textContent = filtered.length + '개 음성';
  var e = el('voiceList'); if (!e) return;
  if (!filtered.length) { e.innerHTML='<div style="font-size:12px;color:var(--text3);padding:7px">음성 없음</div>'; return; }
  e.innerHTML = filtered.map(function(v){ return '<div class="vi'+(selVoice===v.id?' sel':'')+'" onclick="selV(\''+v.id+'\',this)"><div style="flex:1"><div class="vi-nm">'+v.name+'</div><div class="vi-ds">'+v.desc+'</div></div><div style="display:flex;gap:3px;flex-shrink:0"><span class="badge bc" style="font-size:9px">'+v.region+'</span><span class="badge bvc" style="font-size:9px">'+v.gender+'</span></div><button class="vi-pv" onclick="event.stopPropagation();testVoice(\''+v.name+'\')">▶</button></div>'; }).join('');
}
function selV(id, btn) { selVoice=id; document.querySelectorAll('.vi').forEach(function(v){v.classList.remove('sel');}); btn.classList.add('sel'); autoSave(); }
function testVoice(name) { var u=new SpeechSynthesisUtterance('안녕하세요. 테스트 음성입니다.'); u.lang='ko-KR'; speechSynthesis.speak(u); }

// ── YouTube ─────────────────────────────────────────
function ytConnect() {
  var cid = (el('ytCid')||{}).value||ST.settings.ytCid||'';
  if (!cid) { alert('먼저 YouTube OAuth Client ID를 입력하세요.'); return; }
  var redirectUri = encodeURIComponent(window.location.href.split('?')[0].split('#')[0]);
  var scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly');
  var url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id='+cid+'&redirect_uri='+redirectUri+'&response_type=token&scope='+scope;
  var popup = window.open(url, 'ytauth', 'width=500,height=600');
  var chk = setInterval(function(){
    try { if(popup.closed){clearInterval(chk);return;} var h=popup.location.hash; if(h.includes('access_token')){ clearInterval(chk); popup.close(); var tk=new URLSearchParams(h.slice(1)).get('access_token'); ST.settings.ytAccessToken=tk; autoSave(); fetchYtCh(tk); } } catch(e){}
  }, 500);
}
async function fetchYtCh(token) {
  try {
    var r = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',{headers:{Authorization:'Bearer '+token}});
    var d = await r.json();
    if (d.items&&d.items.length) { el('ytChNm').textContent=d.items[0].snippet.title; el('ytDis').style.display='none'; el('ytCon').style.display='block'; }
  } catch(e) { alert('채널 정보 오류: '+e.message); }
}
function ytDiscon() { ST.settings.ytAccessToken=null; el('ytDis').style.display='block'; el('ytCon').style.display='none'; autoSave(); }
function selYtFile(input) {
  if (input.files[0]) { ytFileBlobGlobal=input.files[0]; var info=el('ytFileInfo'); if(info){info.textContent=input.files[0].name+' ('+(input.files[0].size/1024/1024).toFixed(1)+'MB)';info.style.display='block';} }
}
async function startUpload() {
  var token=ST.settings.ytAccessToken; if(!token){alert('YouTube 계정을 먼저 연결하세요.');return;}
  if(!ytFileBlobGlobal){alert('영상 파일을 선택하세요.');return;}
  var title=(el('ytTitle')||{}).value||P.name||'새 영상';
  var desc=(el('ytDesc')||{}).value||'';
  var tags=((el('ytTags')||{}).value||'').split(',').map(function(t){return t.trim();}).filter(Boolean);
  var privacy=(el('ytPriv')||{}).value||'private';
  var cat=(el('ytCat')||{}).value||'22';
  var schedule=(el('ytSched')||{}).value;
  el('ytStat').style.display='block'; el('ytStatTxt').textContent='업로드 초기화 중...';
  var meta={snippet:{title:title,description:desc,tags:tags,categoryId:cat},status:{privacyStatus:schedule?'private':privacy}};
  if(schedule) meta.status.publishAt=new Date(schedule).toISOString();
  try {
    var init=await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','X-Upload-Content-Type':ytFileBlobGlobal.type,'X-Upload-Content-Length':ytFileBlobGlobal.size},body:JSON.stringify(meta)});
    if(!init.ok){var err=await init.json();throw new Error(err.error&&err.error.message||'초기화 오류');}
    var upUrl=init.headers.get('Location'); if(!upUrl) throw new Error('업로드 URL 없음');
    var CHUNK=5*1024*1024, offset=0;
    while(offset<ytFileBlobGlobal.size){
      var end=Math.min(offset+CHUNK,ytFileBlobGlobal.size);
      var resp=await fetch(upUrl,{method:'PUT',headers:{'Content-Range':'bytes '+offset+'-'+(end-1)+'/'+ytFileBlobGlobal.size,'Content-Type':ytFileBlobGlobal.type},body:ytFileBlobGlobal.slice(offset,end)});
      offset=end; var pct=Math.round(offset/ytFileBlobGlobal.size*100);
      el('ytProg').style.width=pct+'%'; el('ytPct').textContent=pct+'%'; el('ytStatTxt').textContent='업로드 중... '+pct+'%';
      if(resp.status===200||resp.status===201){var result=await resp.json(); el('ytStatTxt').textContent='✓ 완료!'; el('ytLinkRow').style.display='block'; el('ytLink').href='https://www.youtube.com/watch?v='+result.id; break;}
    }
  } catch(e){ el('ytStatTxt').textContent='오류: '+e.message; }
}

// ── API 호출 ───────────────────────────────────────
async function callGemini(key, prompt) {
  var r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+key,
    {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
  var d = await r.json();
  if (!r.ok) throw new Error((d.error&&d.error.message)||'Gemini 오류');
  return d.candidates[0].content.parts[0].text;
}
async function generateImg(key, prompt) {
  var ratio = ST.settings.ratio || '16:9';
  var r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key='+key,
    {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({instances:[{prompt:prompt}],parameters:{sampleCount:1,aspectRatio:ratio}})});
  var d = await r.json();
  if (!r.ok) throw new Error((d.error&&d.error.message)||'이미지 생성 실패');
  var b64=d.predictions[0].bytesBase64Encoded, bytes=atob(b64), arr=new Uint8Array(bytes.length);
  for(var i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
  return new Blob([arr],{type:'image/png'});
}
async function generateTTS(text) {
  var eng=(el('ttsEng')||{}).value||ST.settings.ttsEngine||'gemini';
  var spd=parseFloat((el('ttsSpd')||{}).value||ST.settings.ttsSpeed||1.0);
  var voice=selVoice||ST.settings.selVoice;
  if(eng==='elevenlabs'){
    var key=ST.settings.elKey; if(!key) return browserTTS(text);
    var vid=voice||'EXAVITQu4vr4xnSDxMaL';
    var r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+vid,{method:'POST',headers:{'Content-Type':'application/json','xi-api-key':key},body:JSON.stringify({text:text,model_id:'eleven_multilingual_v2',voice_settings:{stability:.5,similarity_boost:.75,speed:spd}})});
    if(!r.ok){var e=await r.json();throw new Error((e.detail&&e.detail.message)||'ElevenLabs 오류');}
    return await r.blob();
  }
  if(eng==='gemini'){
    var key2=ST.settings.gemKey; if(!key2) return browserTTS(text);
    var vn=voice||'Kore';
    var r2=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key='+key2,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:vn}}}}})});
    var d2=await r2.json(); if(!r2.ok) throw new Error((d2.error&&d2.error.message)||'Gemini TTS 오류');
    var b64=d2.candidates[0].content.parts[0].inlineData.data, bytes=atob(b64), arr=new Uint8Array(bytes.length);
    for(var i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
    return new Blob([arr],{type:'audio/wav'});
  }
  if(eng==='naver'){
    var cid=ST.settings.navCid, cs=ST.settings.navCs; if(!cid||!cs) return browserTTS(text);
    var spk=voice||'nara';
    var body=new URLSearchParams({text:text,speaker:spk,volume:0,speed:0,pitch:0,format:'mp3'});
    var r3=await fetch('https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts',{method:'POST',headers:{'X-NCP-APIGW-API-KEY-ID':cid,'X-NCP-APIGW-API-KEY':cs,'Content-Type':'application/x-www-form-urlencoded'},body:body});
    if(!r3.ok) throw new Error('네이버 TTS 오류'); return await r3.blob();
  }
  return browserTTS(text);
}
function browserTTS(text) {
  return new Promise(function(res,rej){
    var u=new SpeechSynthesisUtterance(text); u.lang='ko-KR';
    u.rate=parseFloat((el('ttsSpd')||{}).value||1.0);
    speechSynthesis.speak(u);
    u.onend=function(){res(new Blob([''],{type:'audio/webm'}));};
    u.onerror=function(){rej(new Error('브라우저 TTS 실패'));};
  });
}
async function testKey(type) {
  if(type==='gemini'){var key=(el('gemKey')||{}).value;if(!key){alert('키 입력하세요.');return;}try{var r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?key='+key);alert(r.ok?'✓ 연결 성공!':'✕ 키 오류 ('+r.status+')');}catch(e){alert('✕ 네트워크 오류');}}
  else if(type==='elevenlabs'){var key=(el('elKey')||{}).value;if(!key){alert('키 입력하세요.');return;}try{var r=await fetch('https://api.elevenlabs.io/v1/user',{headers:{'xi-api-key':key}});alert(r.ok?'✓ 연결 성공!':'✕ 키 오류 ('+r.status+')');}catch(e){alert('✕ 네트워크 오류');}}
}

function doRender() { alert('이미지 완성: '+(P.scenes?P.scenes.filter(function(s){return s.imgBlob;}).length:0)+'개 / TTS: '+(P.scenes?P.scenes.filter(function(s){return s.audioBlob;}).length:0)+'개\n\n다운로드 후 FFmpeg으로 합성하세요.'); }

function sbLog(text, level) {
  var box=el('sbLog'); if(!box) return;
  var div=document.createElement('div'); div.className='l-'+(level||'info');
  div.textContent='['+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+'] '+text;
  box.appendChild(div); box.scrollTop=box.scrollHeight;
  var wrap=el('sbLogWrap'); if(wrap) wrap.style.display='block';
}
