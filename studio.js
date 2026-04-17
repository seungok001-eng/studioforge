'use strict';
// ═══════════════════════════════════════════════════
//  StudioForge — studio.js  Final Edition
// ═══════════════════════════════════════════════════

var CH=null, ST={}, P={};
var splitN=2, editIdx=null, charEditIdx=null;
var pvIdx=0, pvPlaying=false, pvTimer=null;
var saveTimer=null, selVoice=null, curLangF='ALL';
var ytFileBlobGlobal=null;
var CAPCUT_SERVER='http://localhost:9001';
var serverConnected=false;
var stopFlag=false;
var idbDB=null;
// 타임라인 재생 상태
var tlPlaying=false, tlIdx=0, tlTimer=null, tlCurrentAudio=null;
// BGM 재생 상태
var bgmAudio=null, bgmBlob=null, bgmObjectUrl=null;

// ── 영상 효과 ──────────────────────────────────────
var FX_LIST=[
  {id:'none',    name:'없음',      desc:'효과 없음'},
  {id:'zoomin',  name:'줌 인',     desc:'서서히 확대'},
  {id:'zoomout', name:'줌 아웃',   desc:'서서히 축소'},
  {id:'panl',    name:'패닝 ←',    desc:'오른→왼 이동'},
  {id:'panr',    name:'패닝 →',    desc:'왼→오른 이동'},
  {id:'panu',    name:'패닝 ↑',    desc:'아래→위 이동'},
  {id:'pand',    name:'패닝 ↓',    desc:'위→아래 이동'},
  {id:'zleft',   name:'줌+좌',     desc:'확대+왼쪽 이동'},
  {id:'zright',  name:'줌+우',     desc:'확대+오른쪽 이동'},
  {id:'shake',   name:'흔들림',    desc:'미세하게 떨림'},
  {id:'vignette',name:'비네팅',    desc:'가장자리 어둡게'},
  {id:'random',  name:'랜덤',      desc:'랜덤 적용'},
];
var FX_POOL=['zoomin','zoomout','panl','panr','panu','pand','zleft','zright'];

// ── 음성 데이터 ────────────────────────────────────
var VOICES={
  elevenlabs:[
    // ── 🇰🇷 한국어 특화 목소리 ───────────────────────
    // 서울 표준어 - 남성
    {id:'1W00IGEmNmwmsDeYy7ag',name:'KKC',desc:'밝고 안정적, 내레이션',region:'KR',gender:'남',tier:'creator'},
    {id:'3MTvEr8xCMCC2mL9ujrI',name:'June',desc:'젊은 남성, 스토리텔링',region:'KR',gender:'남',tier:'creator'},
    {id:'Ir7oQcBXWiq4oFGROCfj',name:'Taemin',desc:'20대 따뜻한 남성',region:'KR',gender:'남',tier:'creator'},
    {id:'4JJwo477JUAx3HV0T7n7',name:'Yohan Koo',desc:'30대 자신감 있는 남성',region:'KR',gender:'남',tier:'creator'},
    {id:'s07IwTCOrCDCaETjUVjx',name:'Hyun Bin',desc:'전문 기업 PR 내레이션',region:'KR',gender:'남',tier:'creator'},
    {id:'PDoCXqBQFGsvfO0hNkEs',name:'KKC HQ',desc:'밝고 정보전달용',region:'KR',gender:'남',tier:'creator'},
    {id:'CxErO97xpQgQXYmapDKX',name:'Theo',desc:'대화체 남성',region:'KR',gender:'남',tier:'creator'},
    {id:'YBRudLRm83BV5Mazcr42',name:'Nobel Butler',desc:'중년 전문 성우 느낌',region:'KR',gender:'남',tier:'creator'},
    // 서울 표준어 - 여성
    {id:'AW5wrnG1jVizOYY7R1Oo',name:'JiYoung',desc:'따뜻하고 친근한 여성',region:'KR',gender:'여',tier:'creator'},
    {id:'uyVNoMrnUku1dZyVEXwD',name:'Anna Kim',desc:'젊은 여성, 내레이션',region:'KR',gender:'여',tier:'creator'},
    {id:'DMkRitQrfpiddSQT5adl',name:'Jjeong',desc:'30대 여성, 유튜브 내레이션',region:'KR',gender:'여',tier:'creator'},
    {id:'ksaI0TCD9BstzEzlxj4q',name:'Seulki',desc:'차분한 여성, 내레이션',region:'KR',gender:'여',tier:'creator'},
    {id:'JAglhVijAfMW2NotYUoH',name:'Easyoungedu',desc:'40대 전문 여성, 뉴스',region:'KR',gender:'여',tier:'creator'},
    {id:'IfMPqjWHWsif8Cy8DjRX',name:'AgongKigong',desc:'경상도+서울 여성',region:'KR',gender:'여',tier:'creator'},
    // 지방 사투리
    {id:'TRO4gatqxbbwLXHLDLSk',name:'Kangsu',desc:'충청도 억양 남성',region:'KR',gender:'남',tier:'creator'},
    {id:'WzMnDIgiICcj1oXbUBO0',name:'Sam Hottman',desc:'경상도 남성',region:'KR',gender:'남',tier:'creator'},
    {id:'SWu2lWaUX4JBPKyh7h1p',name:'Dembo Jang',desc:'함경도 억양, 뉴스체',region:'KR',gender:'남',tier:'creator'},
    {id:'bciERhbhQhAIWwvnQA7H',name:'Seongmin Yoo',desc:'전라도 남성',region:'KR',gender:'남',tier:'creator'},
    {id:'LS3HmRGCXV8wxCAhUbTt',name:'Dong',desc:'40대 따뜻한 전라도 남성',region:'KR',gender:'남',tier:'creator'},
    // ── 🇺🇸 영어 US ─────────────────────────────────
    {id:'21m00Tcm4TlvDq8ikWAM',name:'Rachel',desc:'Calm, Professional',region:'US',gender:'여',tier:'free'},
    {id:'EXAVITQu4vr4xnSDxMaL',name:'Bella',desc:'Soft, Warm',region:'US',gender:'여',tier:'free'},
    {id:'ErXwobaYiN019PkySvjV',name:'Antoni',desc:'Well-rounded',region:'US',gender:'남',tier:'free'},
    {id:'TxGEqnHWrfWFTfGW9XjX',name:'Josh',desc:'Deep, Young',region:'US',gender:'남',tier:'free'},
    {id:'VR6AewLTigWG4xSOukaG',name:'Arnold',desc:'Crisp, Strong',region:'US',gender:'남',tier:'free'},
    {id:'pNInz6obpgDQGcFmaJgB',name:'Adam',desc:'Narrative, Deep',region:'US',gender:'남',tier:'free'},
    {id:'yoZ06aMxZJJ28mfd3POQ',name:'Sam',desc:'Raspy, Young',region:'US',gender:'남',tier:'starter'},
    {id:'pMsXgVXv3BLzUgSXRplE',name:'Serena',desc:'Pleasant, Middle-aged',region:'US',gender:'여',tier:'starter'},
    {id:'wViXBPUzp2ZZixB1xQuM',name:'Matilda',desc:'Warm, Friendly',region:'US',gender:'여',tier:'creator'},
    {id:'SOYHLrjzK2X1ezoPC6cr',name:'Harry',desc:'Anxious, Young',region:'US',gender:'남',tier:'creator'},
    // ── 🇬🇧 영어 UK ─────────────────────────────────
    {id:'ZQe5CZNOzWyzPSCn5a3c',name:'Glinda',desc:'Warm, Witch',region:'UK',gender:'여',tier:'creator'},
    {id:'g5CIjZEefAph4nQFvHAz',name:'Freya',desc:'Energetic, UK',region:'UK',gender:'여',tier:'creator'},
    {id:'2EiwWnXFnvU5JabPnv8n',name:'Clyde',desc:'War Veteran',region:'UK',gender:'남',tier:'creator'},
    {id:'D38z5RcWu1voky8WS1ja',name:'Fin',desc:'Sailor, Calm',region:'UK',gender:'남',tier:'creator'},
    {id:'IKne3meq5aSn9XLyUdCD',name:'Charlie',desc:'Conversational, Casual',region:'UK',gender:'남',tier:'creator'},
    // ── 🇯🇵 일본어 ───────────────────────────────────
    {id:'TxGEqnHWrfWFTfGW9XjX',name:'Hana',desc:'Soft, Natural',region:'JP',gender:'여',tier:'free'},
    {id:'VR6AewLTigWG4xSOukaG',name:'Kenji',desc:'Professional',region:'JP',gender:'남',tier:'free'},
    // ── 기타 언어 ─────────────────────────────────────
    {id:'XB0fDUnXU5powFXDhCwa',name:'Charlotte',desc:'Warm, Spanish',region:'ES',gender:'여',tier:'creator'},
    {id:'onwK4e9ZLuTAKqWW03F9',name:'Daniel',desc:'Deep, French',region:'FR',gender:'남',tier:'creator'},
    {id:'N2lVS1w4EtoT3dr4eOWO',name:'Callum',desc:'Strong, German',region:'DE',gender:'남',tier:'creator'},
    {id:'jBpfuIE2acCO8z3wKNLl',name:'Gigi',desc:'Playful, Portuguese',region:'BR',gender:'여',tier:'creator'},
    {id:'LcfcDJNUP1GQjkzn1xUU',name:'Emily',desc:'Calm, Italian',region:'IT',gender:'여',tier:'creator'},
  ],
  gemini31flash:[
    // ── 여성 ──
    {id:'Aoede',name:'Aoede',desc:'Breezy, Bright',region:'ALL',gender:'여'},
    {id:'Kore',name:'Kore',desc:'Firm, Authoritative',region:'ALL',gender:'여'},
    {id:'Leda',name:'Leda',desc:'Youthful, Bright',region:'ALL',gender:'여'},
    {id:'Zephyr',name:'Zephyr',desc:'Bright, Energetic',region:'ALL',gender:'여'},
    {id:'Achernar',name:'Achernar',desc:'Soft, Gentle',region:'ALL',gender:'여'},
    {id:'Autonoe',name:'Autonoe',desc:'Bright, Clear',region:'ALL',gender:'여'},
    {id:'Despina',name:'Despina',desc:'Smooth, Natural',region:'ALL',gender:'여'},
    {id:'Erinome',name:'Erinome',desc:'Clear, Precise',region:'ALL',gender:'여'},
    {id:'Gacrux',name:'Gacrux',desc:'Mature, Steady',region:'ALL',gender:'여'},
    {id:'Laomedeia',name:'Laomedeia',desc:'Upbeat, Friendly',region:'ALL',gender:'여'},
    {id:'Pulcherrima',name:'Pulcherrima',desc:'Forward, Confident',region:'ALL',gender:'여'},
    {id:'Sulafat',name:'Sulafat',desc:'Warm, Engaging',region:'ALL',gender:'여'},
    {id:'Vindemiatrix',name:'Vindemiatrix',desc:'Gentle, Calm',region:'ALL',gender:'여'},
    {id:'Callirrhoe',name:'Callirrhoe',desc:'Easy-going',region:'ALL',gender:'여'},
    {id:'Sadachbia',name:'Sadachbia',desc:'Lively',region:'ALL',gender:'여'},
    // ── 남성 ──
    {id:'Charon',name:'Charon',desc:'Informational, Deep',region:'ALL',gender:'남'},
    {id:'Fenrir',name:'Fenrir',desc:'Excitable, Bold',region:'ALL',gender:'남'},
    {id:'Puck',name:'Puck',desc:'Upbeat, Playful',region:'ALL',gender:'남'},
    {id:'Orus',name:'Orus',desc:'Confident, Steady',region:'ALL',gender:'남'},
    {id:'Algenib',name:'Algenib',desc:'Gravelly, Rough',region:'ALL',gender:'남'},
    {id:'Algieba',name:'Algieba',desc:'Smooth, Expressive',region:'ALL',gender:'남'},
    {id:'Alnilam',name:'Alnilam',desc:'Firm, Even',region:'ALL',gender:'남'},
    {id:'Achird',name:'Achird',desc:'Friendly, Natural',region:'ALL',gender:'남'},
    {id:'Enceladus',name:'Enceladus',desc:'Breathy, Soft',region:'ALL',gender:'남'},
    {id:'Iapetus',name:'Iapetus',desc:'Clear, Precise',region:'ALL',gender:'남'},
    {id:'Rasalgethi',name:'Rasalgethi',desc:'Informative',region:'ALL',gender:'남'},
    {id:'Sadaltager',name:'Sadaltager',desc:'Knowledgeable',region:'ALL',gender:'남'},
    {id:'Schedar',name:'Schedar',desc:'Even, Neutral',region:'ALL',gender:'남'},
    {id:'Umbriel',name:'Umbriel',desc:'Easy-going, Relaxed',region:'ALL',gender:'남'},
    {id:'Zubenelgenubi',name:'Zubenelgenubi',desc:'Casual, Relaxed',region:'ALL',gender:'남'},
  ],
  gemini:[
    // ── 여성 목소리 ───────────────────────────────────
    {id:'Aoede',name:'Aoede',desc:'Breezy, Bright',region:'ALL',gender:'여'},
    {id:'Kore',name:'Kore',desc:'Firm, Authoritative',region:'ALL',gender:'여'},
    {id:'Leda',name:'Leda',desc:'Youthful, Bright',region:'ALL',gender:'여'},
    {id:'Zephyr',name:'Zephyr',desc:'Bright, Energetic',region:'ALL',gender:'여'},
    {id:'Achernar',name:'Achernar',desc:'Soft, Gentle',region:'ALL',gender:'여'},
    {id:'Autonoe',name:'Autonoe',desc:'Bright, Clear',region:'ALL',gender:'여'},
    {id:'Despina',name:'Despina',desc:'Smooth, Natural',region:'ALL',gender:'여'},
    {id:'Erinome',name:'Erinome',desc:'Clear, Precise',region:'ALL',gender:'여'},
    {id:'Gacrux',name:'Gacrux',desc:'Mature, Steady',region:'ALL',gender:'여'},
    {id:'Laomedeia',name:'Laomedeia',desc:'Upbeat, Friendly',region:'ALL',gender:'여'},
    {id:'Pulcherrima',name:'Pulcherrima',desc:'Forward, Confident',region:'ALL',gender:'여'},
    {id:'Sulafat',name:'Sulafat',desc:'Warm, Engaging',region:'ALL',gender:'여'},
    {id:'Vindemiatrix',name:'Vindemiatrix',desc:'Gentle, Calm',region:'ALL',gender:'여'},
    {id:'Callirrhoe',name:'Callirrhoe',desc:'Easy-going',region:'ALL',gender:'여'},
    {id:'Sadachbia',name:'Sadachbia',desc:'Lively',region:'ALL',gender:'여'},
    // ── 남성 목소리 ───────────────────────────────────
    {id:'Charon',name:'Charon',desc:'Informational, Deep',region:'ALL',gender:'남'},
    {id:'Fenrir',name:'Fenrir',desc:'Excitable, Bold',region:'ALL',gender:'남'},
    {id:'Puck',name:'Puck',desc:'Upbeat, Playful',region:'ALL',gender:'남'},
    {id:'Orus',name:'Orus',desc:'Confident, Steady',region:'ALL',gender:'남'},
    {id:'Algenib',name:'Algenib',desc:'Gravelly, Rough',region:'ALL',gender:'남'},
    {id:'Algieba',name:'Algieba',desc:'Smooth, Expressive',region:'ALL',gender:'남'},
    {id:'Alnilam',name:'Alnilam',desc:'Firm, Even',region:'ALL',gender:'남'},
    {id:'Achird',name:'Achird',desc:'Friendly, Natural',region:'ALL',gender:'남'},
    {id:'Enceladus',name:'Enceladus',desc:'Breathy, Soft',region:'ALL',gender:'남'},
    {id:'Iapetus',name:'Iapetus',desc:'Clear, Precise',region:'ALL',gender:'남'},
    {id:'Rasalgethi',name:'Rasalgethi',desc:'Informative',region:'ALL',gender:'남'},
    {id:'Sadaltager',name:'Sadaltager',desc:'Knowledgeable',region:'ALL',gender:'남'},
    {id:'Schedar',name:'Schedar',desc:'Even, Neutral',region:'ALL',gender:'남'},
    {id:'Umbriel',name:'Umbriel',desc:'Easy-going, Relaxed',region:'ALL',gender:'남'},
    {id:'Zubenelgenubi',name:'Zubenelgenubi',desc:'Casual, Relaxed',region:'ALL',gender:'남'},
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
var LANG_FILTERS={
  elevenlabs:[{k:'ALL',l:'전체'},{k:'KR',l:'🇰🇷 한국어'},{k:'US',l:'🇺🇸 영어US'},{k:'UK',l:'🇬🇧 영어UK'},{k:'JP',l:'🇯🇵 일본어'},{k:'ES',l:'🇪🇸 스페인어'},{k:'FR',l:'🇫🇷 프랑스어'},{k:'DE',l:'🇩🇪 독일어'},{k:'BR',l:'🇧🇷 포르투갈어'},{k:'IT',l:'🇮🇹 이탈리아어'}],
  gemini31flash:[
    // ── 여성 ──
    {id:'Aoede',name:'Aoede',desc:'Breezy, Bright',region:'ALL',gender:'여'},
    {id:'Kore',name:'Kore',desc:'Firm, Authoritative',region:'ALL',gender:'여'},
    {id:'Leda',name:'Leda',desc:'Youthful, Bright',region:'ALL',gender:'여'},
    {id:'Zephyr',name:'Zephyr',desc:'Bright, Energetic',region:'ALL',gender:'여'},
    {id:'Achernar',name:'Achernar',desc:'Soft, Gentle',region:'ALL',gender:'여'},
    {id:'Autonoe',name:'Autonoe',desc:'Bright, Clear',region:'ALL',gender:'여'},
    {id:'Despina',name:'Despina',desc:'Smooth, Natural',region:'ALL',gender:'여'},
    {id:'Erinome',name:'Erinome',desc:'Clear, Precise',region:'ALL',gender:'여'},
    {id:'Gacrux',name:'Gacrux',desc:'Mature, Steady',region:'ALL',gender:'여'},
    {id:'Laomedeia',name:'Laomedeia',desc:'Upbeat, Friendly',region:'ALL',gender:'여'},
    {id:'Pulcherrima',name:'Pulcherrima',desc:'Forward, Confident',region:'ALL',gender:'여'},
    {id:'Sulafat',name:'Sulafat',desc:'Warm, Engaging',region:'ALL',gender:'여'},
    {id:'Vindemiatrix',name:'Vindemiatrix',desc:'Gentle, Calm',region:'ALL',gender:'여'},
    {id:'Callirrhoe',name:'Callirrhoe',desc:'Easy-going',region:'ALL',gender:'여'},
    {id:'Sadachbia',name:'Sadachbia',desc:'Lively',region:'ALL',gender:'여'},
    // ── 남성 ──
    {id:'Charon',name:'Charon',desc:'Informational, Deep',region:'ALL',gender:'남'},
    {id:'Fenrir',name:'Fenrir',desc:'Excitable, Bold',region:'ALL',gender:'남'},
    {id:'Puck',name:'Puck',desc:'Upbeat, Playful',region:'ALL',gender:'남'},
    {id:'Orus',name:'Orus',desc:'Confident, Steady',region:'ALL',gender:'남'},
    {id:'Algenib',name:'Algenib',desc:'Gravelly, Rough',region:'ALL',gender:'남'},
    {id:'Algieba',name:'Algieba',desc:'Smooth, Expressive',region:'ALL',gender:'남'},
    {id:'Alnilam',name:'Alnilam',desc:'Firm, Even',region:'ALL',gender:'남'},
    {id:'Achird',name:'Achird',desc:'Friendly, Natural',region:'ALL',gender:'남'},
    {id:'Enceladus',name:'Enceladus',desc:'Breathy, Soft',region:'ALL',gender:'남'},
    {id:'Iapetus',name:'Iapetus',desc:'Clear, Precise',region:'ALL',gender:'남'},
    {id:'Rasalgethi',name:'Rasalgethi',desc:'Informative',region:'ALL',gender:'남'},
    {id:'Sadaltager',name:'Sadaltager',desc:'Knowledgeable',region:'ALL',gender:'남'},
    {id:'Schedar',name:'Schedar',desc:'Even, Neutral',region:'ALL',gender:'남'},
    {id:'Umbriel',name:'Umbriel',desc:'Easy-going, Relaxed',region:'ALL',gender:'남'},
    {id:'Zubenelgenubi',name:'Zubenelgenubi',desc:'Casual, Relaxed',region:'ALL',gender:'남'},
  ],
  gemini31flash:[{k:'ALL',l:'전체'},{k:'F',l:'👩 여성'},{k:'M',l:'👨 남성'}],
  gemini:[{k:'ALL',l:'전체'},{k:'F',l:'👩 여성'},{k:'M',l:'👨 남성'}],
  naver:[{k:'ALL',l:'전체'},{k:'KR',l:'🇰🇷 한국어'}],
  browser:[{k:'ALL',l:'전체'}]
};

// ═══════════════════════════════════════════════════
//  IndexedDB — Blob 영구 저장 (이미지/TTS/영상)
// ═══════════════════════════════════════════════════
function idbOpen(){
  return new Promise(function(res,rej){
    if(idbDB){res(idbDB);return;}
    var req=indexedDB.open('StudioForge',1);
    req.onupgradeneeded=function(e){
      var db=e.target.result;
      if(!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs');
    };
    req.onsuccess=function(e){idbDB=e.target.result;res(idbDB);};
    req.onerror=function(){rej(req.error);};
  });
}
async function idbSet(key,val){
  try{var db=await idbOpen();return new Promise(function(res,rej){var tx=db.transaction('blobs','readwrite');tx.objectStore('blobs').put(val,key);tx.oncomplete=res;tx.onerror=rej;});}
  catch(e){console.warn('idbSet 오류:',e);}
}
async function idbGet(key){
  try{var db=await idbOpen();return new Promise(function(res,rej){var req=db.transaction('blobs','readonly').objectStore('blobs').get(key);req.onsuccess=function(){res(req.result||null);};req.onerror=rej;});}
  catch(e){console.warn('idbGet 오류:',e);return null;}
}
async function idbDel(key){
  try{var db=await idbOpen();return new Promise(function(res,rej){var tx=db.transaction('blobs','readwrite');tx.objectStore('blobs').delete(key);tx.oncomplete=res;tx.onerror=rej;});}
  catch(e){console.warn('idbDel 오류:',e);}
}
async function idbClearProject(pid){
  // 특정 프로젝트의 Blob들 정리
  try{
    var db=await idbOpen();
    var tx=db.transaction('blobs','readwrite');
    var store=tx.objectStore('blobs');
    var req=store.getAllKeys();
    req.onsuccess=function(){
      var keys=req.result||[];
      keys.filter(function(k){return k.startsWith(pid+'_');}).forEach(function(k){store.delete(k);});
    };
  }catch(e){console.warn('idbClearProject:',e);}
}

// Blob 저장 키 생성
function blobKey(type,sceneId){return (P.id||'p')+'_'+type+'_'+sceneId;}

// 씬에 Blob 저장 (IndexedDB + 참조)
async function saveBlob(type,sceneId,blob){
  var key=blobKey(type,sceneId);
  await idbSet(key,blob);
  return blob;
}
// 씬에서 Blob 로드
async function loadBlob(type,sceneId){
  return await idbGet(blobKey(type,sceneId));
}

// ═══════════════════════════════════════════════════
//  base64 ↔ Blob 변환 유틸
// ═══════════════════════════════════════════════════
function blobToB64(blob){
  return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result);};r.onerror=rej;r.readAsDataURL(blob);});
}
function b64ToBlob(b64,type){
  var arr=b64.split(','), mime=arr[0].match(/:(.*?);/)[1], bstr=atob(arr[1]), n=bstr.length, u8=new Uint8Array(n);
  for(var i=0;i<n;i++) u8[i]=bstr.charCodeAt(i);
  return new Blob([u8],{type:type||mime});
}

// ═══════════════════════════════════════════════════
//  초기화
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',function(){
  try{
    var chId=localStorage.getItem('sf_current_channel');
    if(!chId){location.href='index.html';return;}
    var chs=[];try{chs=JSON.parse(localStorage.getItem('sf_channels')||'[]');}catch(e){}
    CH=null;for(var i=0;i<chs.length;i++){if(chs[i].id===chId){CH=chs[i];break;}}
    if(!CH){location.href='index.html';return;}
    loadST();
    initUI();
    updateSubPrev();
    changeTtsEng();
    loadProjectBlobs().then(function(){renderSB();});
    checkServer();
    setInterval(checkServer,10000);
  }catch(e){console.error('초기화 오류:',e);alert('초기화 오류: '+e.message);}
});

function loadST(){
  try{ST=JSON.parse(localStorage.getItem('sf_ch_'+CH.id)||'{}');}catch(e){ST={};}
  if(!ST.settings)ST.settings={};
  if(!ST.projects)ST.projects={};
  var def={
    imgEngine:'gemini',ratio:'16:9',
    ttsEngine:'elevenlabs',ttsSpeed:1.0,selVoice:null,
    subFont:"'Noto Sans KR', sans-serif",subSz:25,subCh:20,
    subPos:'bottom',subTc:'#FFFFFF',subBc:'#000000',
    subOp:80,subShd:true,subFade:false,transT:1,useBgm:false,
    globalStyle:'cinematic photo, 4K, dramatic lighting, ultra realistic',
    globalPrompt:'',thumbPrompt:'',thumbStyle:'',splitN:2,
    gemKey:'',grokKey:'',elKey:'',falKey:'',navCid:'',navCs:'',
    ytCid:'',ytCs:'',ytAk:'',ytPriv:'private',ytCat:'22',
    characters:[],styleRefs:[],mascots:[],ytAccessToken:null
  };
  var keys=Object.keys(def);
  for(var i=0;i<keys.length;i++){if(ST.settings[keys[i]]===undefined)ST.settings[keys[i]]=def[keys[i]];}
  splitN=ST.settings.splitN||2;
  if(ST.currentPid&&ST.projects[ST.currentPid]){
    P=ST.projects[ST.currentPid];
    if(!P.scenes)P.scenes=[];
    if(!P.thumbnails)P.thumbnails=[];
  }else{newProj();}
}

function newProj(){
  var id='p_'+Date.now();
  P={id:id,name:'새 프로젝트',scenes:[],thumbnails:[]};
  ST.projects[id]=P;ST.currentPid=id;
}

// IndexedDB에서 현재 프로젝트 Blob 로드
async function loadProjectBlobs(){
  if(!P.scenes||!P.scenes.length)return;
  for(var i=0;i<P.scenes.length;i++){
    var s=P.scenes[i];
    if(!s.imgBlob) s.imgBlob=await loadBlob('img',i)||null;
    if(!s.audioBlob) s.audioBlob=await loadBlob('tts',i)||null;
    if(!s.videoBlob) s.videoBlob=await loadBlob('vid',i)||null;
  }
}

function initUI(){
  try{
    var s=ST.settings;
    el('topIcon').textContent=CH.icon; el('topName').textContent=CH.name;
    el('sbCh').textContent=CH.name; el('projEl').textContent=P.name;
    setRatioSilent(s.ratio);
    setVal('imgEngine',s.imgEngine||'gemini');
    setVal('ttsEng',s.ttsEngine); setVal('ttsSpd',s.ttsSpeed);
    el('ttsSpdV').textContent=parseFloat(s.ttsSpeed||1).toFixed(2)+'x';
    setVal('subFont',s.subFont); setVal('subSz',s.subSz); el('subSzV').textContent=s.subSz||25;
    setVal('subCh',s.subCh); el('subChV').textContent=s.subCh||20;
    setVal('subPos',s.subPos); setVal('subTc',s.subTc); setVal('subBc',s.subBc);
    setVal('subOp',s.subOp); el('subOpV').textContent=s.subOp||80;
    setChk('subShd',s.subShd); setChk('subFade',s.subFade);
    setVal('transT',s.transT); el('transV').textContent=(s.transT||1)+'초';
    setVal('globalStyle',s.globalStyle); setVal('globalPrompt',s.globalPrompt);
    setVal('thumbPrompt',s.thumbPrompt); setVal('thumbStyle',s.thumbStyle);
    setVal('gemKey',s.gemKey); setVal('grokKey',s.grokKey); setVal('elKey',s.elKey);
    setVal('falKey',s.falKey); setVal('navCid',s.navCid); setVal('navCs',s.navCs);
    setVal('ytCid',s.ytCid); setVal('ytCs',s.ytCs); setVal('ytAk',s.ytAk);
    setVal('ytPriv',s.ytPriv); setVal('ytCat',s.ytCat);
    if(P.title) setVal('vidTitle',P.title);
    if(P.script) setVal('scriptIn',P.script);
    selVoice=s.selVoice;
    // 상단 프로젝트명
    var pnm=el('projNm');if(pnm)pnm.textContent=P.name;
    var pOld=el('projEl');if(pOld&&pOld.tagName==='SPAN'&&!el('projNm'))pOld.textContent=P.name;
    el('sbCh').textContent=CH.name;
    // splitN 버튼 복원
    var splitBtns=document.querySelectorAll('#splitOpts .btn');
    splitBtns.forEach(function(b,i){b.className=(i+1===splitN)?'btn bp bsm':'btn bgh bsm';});
    renderChars(); renderStyleRefs(); renderMascots();
    if(s.ytAccessToken){el('ytDis').style.display='none';el('ytCon').style.display='block';}
    // BGM 볼륨 복원
    if(s.bgmVol!==undefined){setVal('bgmVol',s.bgmVol);var bv=el('bgmVolV');if(bv)bv.textContent=s.bgmVol+'%';}
    setTimeout(function(){updateEngineUI();},100);
  }catch(e){console.error('initUI 오류:',e);}
}

// 헬퍼
function el(id){return document.getElementById(id);}
function setVal(id,v){var e=el(id);if(e&&v!==undefined&&v!==null)e.value=v;}
function setChk(id,v){var e=el(id);if(e&&v!==undefined)e.checked=!!v;}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
function estDur(t){return Math.max(3,(t||'').length/7);}
function fmtT(s){var m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+String(sec).padStart(2,'0');}
function rnd(arr){return arr[Math.floor(Math.random()*arr.length)];}

// ── 완료 알림 ──────────────────────────────────────
function notifyDone(msg){
  // 브라우저 알림
  if(Notification&&Notification.permission==='granted'){
    new Notification('StudioForge',{body:msg,icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="6" fill="%230b0c10"/><text y="24" font-size="20" fill="%2300d4ff">S</text></svg>'});
  }else if(Notification&&Notification.permission!=='denied'){
    Notification.requestPermission().then(function(p){if(p==='granted') new Notification('StudioForge',{body:msg});});
  }
  // 소리 알림 (Web Audio API 비프음)
  try{
    var ctx=new AudioContext();
    var osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    osc.frequency.value=880;gain.gain.setValueAtTime(0.3,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
    osc.start(ctx.currentTime);osc.stop(ctx.currentTime+0.5);
    setTimeout(function(){ctx.close();},600);
  }catch(e){}
}

// ── 자동 저장 ──────────────────────────────────────
function autoSave(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(function(){
    try{
      collectS();
      localStorage.setItem('sf_ch_'+CH.id,JSON.stringify(ST));
      var d=el('sdot');if(d){d.classList.add('on');setTimeout(function(){d.classList.remove('on');},1200);}
    }catch(e){console.warn('저장 오류:',e);}
  },500);
}

function collectS(){
  var s=ST.settings;
  function gv(id){var e=el(id);return e?e.value:'';}
  function gc(id){var e=el(id);return e?e.checked:false;}
  s.imgEngine=gv('imgEngine')||s.imgEngine;
  s.ttsEngine=gv('ttsEng')||s.ttsEngine; s.ttsSpeed=parseFloat(gv('ttsSpd'))||1.0; s.selVoice=selVoice;
  s.subFont=gv('subFont')||s.subFont; s.subSz=parseInt(gv('subSz'))||25; s.subCh=parseInt(gv('subCh'))||20;
  s.subPos=gv('subPos')||'bottom'; s.subTc=gv('subTc')||'#FFFFFF'; s.subBc=gv('subBc')||'#000000';
  s.subOp=parseInt(gv('subOp'))||80; s.subShd=gc('subShd'); s.subFade=gc('subFade');
  s.transT=parseFloat(gv('transT'))||1; s.useBgm=gc('useBgm');
  s.globalStyle=gv('globalStyle')||''; s.globalPrompt=gv('globalPrompt')||'';
  s.thumbPrompt=gv('thumbPrompt')||''; s.thumbStyle=gv('thumbStyle')||'';
  s.splitN=splitN;
  s.gemKey=gv('gemKey'); s.grokKey=gv('grokKey'); s.elKey=gv('elKey');
  s.falKey=gv('falKey'); s.navCid=gv('navCid'); s.navCs=gv('navCs');
  s.ytCid=gv('ytCid'); s.ytCs=gv('ytCs'); s.ytAk=gv('ytAk');
  s.ytPriv=gv('ytPriv')||'private'; s.ytCat=gv('ytCat')||'22';
  s.bgmVol=parseInt(gv('bgmVol')||'20');
  var vt=el('vidTitle');if(vt)P.title=vt.value;
  var sc=el('scriptIn');if(sc)P.script=sc.value;
  // scenes에서 Blob 제거하고 저장 (Blob은 IndexedDB에 별도 저장)
  var scenesClean=P.scenes.map(function(s){
    return {id:s.id,title:s.title,narration:s.narration,imagePrompt:s.imagePrompt,
            videoPrompt:s.videoPrompt,transition:s.transition,fx:s.fx,status:s.status,checked:s.checked,
            hasImg:!!s.imgBlob,hasTts:!!s.audioBlob,hasVid:!!s.videoBlob};
  });
  var pSave=Object.assign({},P,{scenes:scenesClean});
  ST.projects[P.id]=pSave;
}

function manualSave(){collectS();localStorage.setItem('sf_ch_'+CH.id,JSON.stringify(ST));var b=document.querySelector('.btn-sv');if(b){b.textContent='저장됨 ✓';setTimeout(function(){b.textContent='저장';},1500);}}
function saveKeys(){collectS();localStorage.setItem('sf_ch_'+CH.id,JSON.stringify(ST));var m=el('keySaveMsg');if(m){m.style.display='block';setTimeout(function(){m.style.display='none';},2000);}}
function saveYtKeys(){collectS();localStorage.setItem('sf_ch_'+CH.id,JSON.stringify(ST));alert('저장됨');}

// ── 네비게이션 ─────────────────────────────────────
function gp(name){
  try{
    document.querySelectorAll('.nav').forEach(function(n){n.classList.toggle('on',n.getAttribute('data-p')===name);});
    document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on');});
    var pg=el('page-'+name);if(pg)pg.classList.add('on');
    if(name==='storyboard'){renderSB();updateFlowBar();}
    else if(name==='timeline')renderTL();
    else if(name==='preview')renderPV();
    else if(name==='pipeline')updatePipelineUI();
    else if(name==='settings')changeTtsEng();
  }catch(e){console.error('네비게이션 오류:',e);}
}
function goChannels(){location.href='index.html';}
function renameProj(){var n=prompt('프로젝트 이름:',P.name);if(n){P.name=n;el('projEl').textContent=n;autoSave();}}

// ── 프로젝트 목록 ──────────────────────────────────
function openProjList(){
  var modal=el('projModal');
  if(!modal) return;
  _renderProjList();
  modal.classList.add('open');
}

function toggleProjMenu(){
  var menu=el('projMenu');
  if(!menu)return;
  var isOpen=menu.style.display!=='none';
  if(isOpen){menu.style.display='none';return;}
  renderProjMenu();
  menu.style.display='block';
  // 바깥 클릭 시 닫기
  setTimeout(function(){
    document.addEventListener('click',function _close(e){
      if(!el('projDropWrap').contains(e.target)){menu.style.display='none';}
      document.removeEventListener('click',_close);
    });
  },0);
}

function renderProjMenu(){
  var list=el('projList');
  if(!list)return;
  var projs=Object.values(ST.projects||{}).sort(function(a,b){return (b.id||'').localeCompare(a.id||'');});
  if(!projs.length){list.innerHTML='<div style="color:var(--text3);font-size:12px;padding:10px 12px">프로젝트 없음</div>';return;}
  list.innerHTML=projs.map(function(proj){
    var cnt=(proj.scenes||[]).length;
    var isCur=proj.id===P.id;
    return '<div style="display:flex;align-items:center;gap:6px;padding:9px 12px;cursor:pointer;background:'+(isCur?'rgba(0,212,255,.06)':'transparent')+';transition:background .15s" onmouseenter="this.style.background=\'var(--bg3)\'" onmouseleave="this.style.background=\''+(isCur?'rgba(0,212,255,.06)':'transparent')+'\';" onclick="switchProj(\''+proj.id+'\')">'
      +'<div style="flex:1;overflow:hidden">'
      +'<div style="font-size:12px;font-weight:'+(isCur?'700':'500')+';color:'+(isCur?'var(--accent)':'var(--text)')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(proj.name||'이름 없음')+'</div>'
      +'<div style="font-size:10px;color:var(--text3)">'+cnt+'개 장면</div>'
      +'</div>'
      +'<button onclick="event.stopPropagation();renameProjById(\''+proj.id+'\')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;padding:2px 4px;border-radius:3px" title="이름 변경">✎</button>'
      +'<button onclick="event.stopPropagation();deleteProjById(\''+proj.id+'\')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;padding:2px 4px;border-radius:3px" title="삭제">✕</button>'
      +'</div>';
  }).join('');
}

function createProj(){
  var n=prompt('새 프로젝트 이름:','새 프로젝트');
  if(!n)return;
  collectS();
  var id='p_'+Date.now();
  P={id:id,name:n,scenes:[],thumbnails:[]};
  ST.projects[id]=P;ST.currentPid=id;
  var pnm=el('projNm');if(pnm)pnm.textContent=n;
  setVal('vidTitle','');setVal('scriptIn','');
  renderSB();autoSave();
  el('projMenu').style.display='none';
  sbLog('새 프로젝트 생성: '+n,'ok');
}

function _renderProjList(){
  var list=el('projModalList');
  if(!list) return;
  var projs=Object.values(ST.projects||{});
  if(!projs.length){list.innerHTML='<div style="color:var(--text3);font-size:12px;padding:8px">프로젝트 없음</div>';return;}
  list.innerHTML=projs.map(function(proj){
    var sceneCount=(proj.scenes||[]).length;
    var isCur=proj.id===P.id;
    var hasImg=(proj.scenes||[]).filter(function(s){return s.hasImg;}).length;
    return '<div class="proj-item'+(isCur?' proj-cur':'')+'" onclick="switchProj(\''+proj.id+'\')">'
      +'<div class="proj-item-info">'
      +'<div class="proj-item-name">'+esc(proj.name||'이름 없음')+(isCur?' <span style="font-size:9px;color:var(--accent);margin-left:4px">현재</span>':'')+'</div>'
      +'<div class="proj-item-meta">'+sceneCount+'개 장면'+(hasImg?' · 이미지 '+hasImg+'개':'')+'</div>'
      +'</div>'
      +'<div style="display:flex;gap:5px;flex-shrink:0">'
      +'<button class="ib" onclick="event.stopPropagation();renameProjById(\''+proj.id+'\')" title="이름 변경">✎</button>'
      +'<button class="ib" onclick="event.stopPropagation();deleteProjById(\''+proj.id+'\')" title="삭제" style="color:var(--text3)">✕</button>'
      +'</div></div>';
  }).join('');
}

function switchProj(id){
  if(id===P.id){closeModal('projModal');return;}
  collectS();
  localStorage.setItem('sf_ch_'+CH.id,JSON.stringify(ST));
  ST.currentPid=id;
  P=ST.projects[id];
  if(!P.scenes)P.scenes=[];
  if(!P.thumbnails)P.thumbnails=[];
  el('projEl').textContent=P.name;
  if(P.title) setVal('vidTitle',P.title);
  if(P.script) setVal('scriptIn',P.script);
  loadProjectBlobs().then(function(){renderSB();});
  closeModal('projModal');
  sbLog('프로젝트 전환: '+P.name,'ok');
}

function renameProjById(id){
  var proj=ST.projects[id];if(!proj)return;
  var n=prompt('프로젝트 이름:',proj.name);
  if(!n)return;
  proj.name=n;
  if(id===P.id){P.name=n;el('projEl').textContent=n;}
  autoSave();
  _renderProjList();
}

function deleteProjById(id){
  if(Object.keys(ST.projects||{}).length<=1){alert('마지막 프로젝트는 삭제할 수 없습니다.');return;}
  var proj=ST.projects[id];
  if(!proj)return;
  if(!confirm('프로젝트 "'+proj.name+'"을 삭제할까요? 생성된 이미지/TTS도 모두 삭제됩니다.'))return;
  idbClearProject(id);
  delete ST.projects[id];
  if(id===P.id){
    var remain=Object.values(ST.projects);
    if(remain.length){
      P=remain[0];ST.currentPid=P.id;
      el('projEl').textContent=P.name;
      loadProjectBlobs().then(function(){renderSB();});
    }else{newProj();}
  }
  autoSave();
  _renderProjList();
}

function createNewProj(){
  var n=prompt('새 프로젝트 이름:','새 프로젝트');
  if(!n)return;
  collectS();
  var id='p_'+Date.now();
  P={id:id,name:n,scenes:[],thumbnails:[]};
  ST.projects[id]=P;ST.currentPid=id;
  el('projEl').textContent=n;
  setVal('vidTitle','');
  setVal('scriptIn','');
  renderSB();autoSave();
  closeModal('projModal');
  sbLog('새 프로젝트 생성: '+n,'ok');
}

// ── 영상 비율 ──────────────────────────────────────
function setRatio(r){setRatioSilent(r);autoSave();}
function setRatioSilent(r){
  ST.settings.ratio=r||'16:9';
  var b1=el('r169'),b2=el('r916');
  if(b1){b1.className=r==='16:9'?'btn bp':'btn bgh';}
  if(b2){b2.className=r==='9:16'?'btn bp':'btn bgh';}
}

// ── 엔진 UI 통합 ───────────────────────────────────
function updateEngineUI(){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  ST.settings.imgEngine=eng;
  var isGrokFlow=eng==='grok_flow', isFlow=eng==='gemini_flow';
  // 상단 배지 업데이트
  var wrap=el('engBadgeWrap');
  if(wrap){
    var engLabels={
      gemini:'<span class="eng-badge eng-gemini">🔵 Gemini Imagen 3</span>',
      grok:'<span class="eng-badge eng-grok">🟣 Grok Aurora</span>',
      gemini_flow:'<span class="eng-badge eng-flow">🟢 Google Flow</span>',
      grok_flow:'<span class="eng-badge eng-grok-flow">🟠 Grok Automation</span>',
    };
    wrap.innerHTML=engLabels[eng]||'';
  }
  // 엔진 설명
  var desc=el('engDesc');
  if(desc){
    var descs={
      gemini:'Gemini API 키로 Imagen 3를 직접 호출합니다. 빠르고 안정적.',
      grok:'xAI API 키로 Grok Aurora를 직접 호출합니다.',
      gemini_flow:'Flow Automator 확장프로그램 필요. 프롬프트 TXT 내보내기 후 Google Flow에서 일괄 생성.',
      grok_flow:'Grok Automation 확장프로그램 필요. 프롬프트 TXT 내보내기 후 grok.com/imagine에서 일괄 생성.',
    };
    desc.textContent=descs[eng]||'';
  }
  // 스토리보드 자동화 바
  var bar=el('sbFlowBar');
  if(bar)bar.style.display=(isFlow||isGrokFlow)?'flex':'none';
  var fBar=el('flowModeBar'),gBar=el('grokModeBar');
  if(fBar)fBar.style.display=isFlow?'flex':'none';
  if(gBar)gBar.style.display=isGrokFlow?'flex':'none';
  // 전체 영상 버튼 라벨
  var vBtn=el('btnGenAllVid');
  if(vBtn){
    if(eng==='grok')vBtn.textContent='전체 Grok 영상';
    else if(isGrokFlow)vBtn.textContent='전체→Grok';
    else if(isFlow)vBtn.textContent='전체→Flow';
    else vBtn.style.display='none';
    if(eng==='grok'||isGrokFlow||isFlow)vBtn.style.display='';
  }
  autoSave();
}
function openFlow(){window.open('https://labs.google/flow','_blank');}

// ── 대본 ───────────────────────────────────────────
function countW(){var t=(el('scriptIn')||{}).value||'';var w=t.trim()?t.trim().split(/\s+/).length:0;var e=el('wc');if(e)e.textContent=w+'어절';}
function clearScript(){var e=el('scriptIn');if(e)e.value='';countW();}
function setSplit(n,btn){
  splitN=n;ST.settings.splitN=n;
  document.querySelectorAll('#splitOpts .btn').forEach(function(b){b.className=b===btn?'btn bp bsm':'btn bgh bsm';});
  autoSave();
}

function loadSample(){
  setVal('vidTitle','한화솔루션 유상증자 분석');
  setVal('scriptIn','[장면1] 인트로\n2026년 3월 26일 아침 8시 42분. 한화솔루션을 2,000주 들고 있던 직장인 한 명이 출근길 지하철에서 MTS를 켰어. 전날 종가 51,000원. 화면에 뜬 숫자는 -19%.\n\n[장면2] 분석\n유상증자 공시를 열면 제일 먼저 볼 곳이 자금 사용 목적이야. 2.4조 중 1.5조가 차입금 상환이야.\n\n[장면3] 결론\n채무 상환 비율이 50%를 넘으면 생존형 증자야. 이 5가지만 알면 3초 만에 판단할 수 있어.');
  countW();autoSave();
}

function splitScenes(){
  try{
    var scriptEl=el('scriptIn'),script=scriptEl?scriptEl.value.trim():'';
    if(!script){alert('대본을 입력하세요.');return;}
    var scenes=[],idx=0;
    var tagPat=/\[장면\d+\]\s*([^\n]*)\n?([\s\S]*?)(?=\[장면\d+\]|$)/g,match,hasTag=false;
    while((match=tagPat.exec(script))!==null){
      hasTag=true;
      var title=match[1].trim()||('장면 '+(idx+1)),content=match[2].trim();
      if(!content)continue;
      var sents=content.split(/(?<=[.!?。！？])\s+|(?<=\n)\s*/).map(function(s){return s.trim();}).filter(function(s){return s.length>1;});
      if(!sents.length)sents=[content];
      for(var i=0;i<sents.length;i+=splitN){
        var chunk=sents.slice(i,i+splitN).join(' ').trim();if(!chunk)continue;
        scenes.push({id:idx++,title:title,narration:chunk,imagePrompt:'',videoPrompt:'',transition:'cut',fx:'none',status:'pending',imgBlob:null,audioBlob:null,videoBlob:null,checked:false});
      }
    }
    if(!hasTag){
      var blocks=script.split(/\n{2,}/);
      for(var bi=0;bi<blocks.length;bi++){
        var block=blocks[bi].trim();if(!block)continue;
        var sents2=block.split(/(?<=[.!?。！？])\s+/).map(function(s){return s.trim();}).filter(function(s){return s.length>1;});
        if(!sents2.length)sents2=[block];
        for(var si=0;si<sents2.length;si+=splitN){
          var chunk2=sents2.slice(si,si+splitN).join(' ').trim();if(!chunk2)continue;
          scenes.push({id:idx++,title:'장면 '+(idx),narration:chunk2,imagePrompt:'',videoPrompt:'',transition:'cut',fx:'none',status:'pending',imgBlob:null,audioBlob:null,videoBlob:null,checked:false});
        }
      }
    }
    if(!scenes.length){alert('분할할 내용이 없습니다.');return;}
    // 기존 프로젝트 Blob 정리
    idbClearProject(P.id);
    P.scenes=scenes;autoSave();renderSB();
    sbLog(scenes.length+'개 장면으로 분할 완료','ok');gp('storyboard');
  }catch(e){console.error('splitScenes:',e);alert('장면 분할 오류: '+e.message);}
}

async function analyzeAI(){
  // 이미 분할된 씬이 있으면 그걸 기준으로 프롬프트만 생성
  // 없으면 대본을 기준으로 분할+프롬프트 동시 생성
  var hasScenes = P.scenes && P.scenes.length > 0;
  if(!hasScenes){
    var scriptEl=el('scriptIn'), script=scriptEl?scriptEl.value.trim():'';
    if(!script){alert('대본을 입력하거나 먼저 장면 분할을 실행하세요.');return;}
  }
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  var style=ST.settings.globalStyle||'', gp2=ST.settings.globalPrompt||'';
  var chars=(ST.settings.characters||[]).filter(function(c){return c.name||c.desc;}).map(function(c){return c.name+': '+c.desc;}).join(', ');
  el('sbLogWrap').style.display='block';

  if(hasScenes){
    // ── 모드 A: 기존 씬 유지, 각 씬에 이미지/영상 프롬프트만 생성 ──
    sbLog('기존 '+P.scenes.length+'개 씬에 이미지 프롬프트 생성 중...','info');
    showProgBar('AI 프롬프트 생성 중...');
    var styleNote = style ? ', '+style : '';
    var gpNote    = gp2   ? ', '+gp2   : '';
    var charNote  = chars ? ', featuring '+chars : '';

    for(var i=0; i<P.scenes.length; i++){
      if(stopFlag) break;
      setProgBar((i/P.scenes.length)*100, 'AI 프롬프트 생성 중... '+(i+1)+'/'+P.scenes.length);
      try{
        var singlePrompt =
          '다음 나레이션에 딱 맞는 이미지 프롬프트와 영상 프롬프트를 영어로 생성하세요.\n'
          +'JSON만 응답(마크다운 없이): {"imagePrompt":"...'+styleNote+gpNote+charNote+'","videoPrompt":"...","fx":"none","transition":"cut"}\n\n'
          +'나레이션: '+P.scenes[i].narration;
        var raw = await callAI(singlePrompt);
        raw = raw.replace(/```json|```/g,'').trim();
        // JSON 파싱 실패 대비
        try{
          var parsed = JSON.parse(raw);
          P.scenes[i].imagePrompt = parsed.imagePrompt || P.scenes[i].imagePrompt;
          P.scenes[i].videoPrompt = parsed.videoPrompt || P.scenes[i].videoPrompt;
          if(parsed.fx && parsed.fx !== 'none') P.scenes[i].fx = parsed.fx;
          if(parsed.transition) P.scenes[i].transition = parsed.transition;
        }catch(pe){
          // JSON 파싱 실패 시 텍스트 전체를 imagePrompt로 사용
          P.scenes[i].imagePrompt = raw.substring(0,300);
        }
        sbLog('장면 '+(i+1)+' 프롬프트 ✓','ok');
      }catch(e){
        sbLog('장면 '+(i+1)+' 프롬프트 오류: '+e.message,'err');
      }
      await sleep(300);
    }
    hideProgBar();
    autoSave(); renderSB();
    sbLog('AI 프롬프트 생성 완료 ('+P.scenes.length+'개 씬 유지)','ok');
    notifyDone('프롬프트 생성 완료!');

  } else {
    // ── 모드 B: 씬 없을 때만 대본 전체 분석해서 분할+프롬프트 동시 생성 ──
    sbLog('AI 씬 분석+분할 중 ('+(eng.startsWith('grok')?'Grok':'Gemini')+')...','info');
    var script=(el('scriptIn')||{}).value||'';
    try{
      var prompt='다음 스크립트를 씬별로 분석하고 JSON만 응답하세요(마크다운 없이):\n'
        +'[{"id":0,"title":"제목","narration":"내레이션","imagePrompt":"영어 이미지 프롬프트'+(style?', '+style:'')+(gp2?', '+gp2:'')+(chars?', featuring '+chars:'')+'","videoPrompt":"영상 프롬프트","transition":"cut","fx":"none"}]\n\n'
        +'스크립트:\n'+script;
      var raw=await callAI(prompt);
      raw=raw.replace(/```json|```/g,'').trim();
      var parsed=JSON.parse(raw);
      idbClearProject(P.id);
      P.scenes=parsed.map(function(s,i){return Object.assign({},s,{id:i,status:'pending',imgBlob:null,audioBlob:null,videoBlob:null,checked:false});});
      autoSave(); renderSB();
      sbLog('AI 분석 완료: '+P.scenes.length+'개 씬','ok');
      gp('storyboard');
    }catch(e){sbLog('AI 분석 실패: '+e.message,'err');alert('오류: '+e.message);}
  }
}

// ── 스토리보드 ─────────────────────────────────────
function renderSB(){
  try{
    var grid=el('sceneGrid');if(!grid)return;
    var badge=el('sbBadge'),cnt=el('sbCnt'),len=P.scenes?P.scenes.length:0;
    if(badge)badge.textContent=len;if(cnt)cnt.textContent=len+'개 장면';
    if(!len){grid.innerHTML='<div class="empty" style="grid-column:1/-1"><h3>스토리보드가 비어 있습니다</h3><p>대본 탭에서 장면 분할을 실행하세요</p></div>';return;}
    var html='';
    var stMap={pending:'대기',generating:'생성중',img_done:'이미지✓',tts_done:'TTS✓',done:'완료',error:'오류'};
    var stCls={pending:'ss-p',generating:'ss-g',img_done:'ss-i',tts_done:'ss-t',done:'ss-d',error:'ss-e'};
    for(var i=0;i<P.scenes.length;i++){
      var s=P.scenes[i];
      var fx=FX_LIST[0];for(var fi=0;fi<FX_LIST.length;fi++){if(FX_LIST[fi].id===s.fx){fx=FX_LIST[fi];break;}}
      var fxClass=s.fx&&s.fx!=='none'&&s.fx!=='random'?(' fx-'+s.fx):'';
      var imgHtml=s.imgBlob
        ?'<div class="sc-img'+fxClass+'" onclick="openLightbox('+i+')" title="클릭해서 크게 보기"><img src="'+URL.createObjectURL(s.imgBlob)+'" loading="lazy"></div>'
        :'<div class="sc-ph"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>이미지 없음</div>';
      html+='<div class="sc'+(s._sel?' sel':'')+'" id="sc-'+i+'">'
        +'<div class="sc-hd" onclick="selSc('+i+')">'
        +'<label class="sc-cb" onclick="event.stopPropagation()"><input type="checkbox"'+(s.checked?' checked':'')+' onchange="P.scenes['+i+'].checked=this.checked;syncSelAll()"></label>'
        +'<span class="sc-num">장면 '+(i+1)+'</span>'
        +'<span class="sc-title">'+esc(s.title||'')+'</span>'
        +'<button class="ib" onclick="event.stopPropagation();openEdit('+i+')" title="편집">✎</button>'
        +'<button class="ib" onclick="event.stopPropagation();cloneScene('+i+')" title="복제">⧉</button>'
        +'<button class="ib" onclick="event.stopPropagation();delSc('+i+')" title="삭제" style="color:var(--text3)">✕</button>'
        +'</div>'+imgHtml
        +'<div class="sc-body">'
        +'<div class="sc-narr">'+esc(s.narration||'')+'</div>'
        +'<div class="sc-prompt">'+esc(s.imagePrompt||'프롬프트 없음')+'</div>'
        +'<div class="sc-acts">'
        +'<span class="sc-st '+(stCls[s.status]||'ss-p')+'">'+(stMap[s.status]||s.status)+'</span>'
        +(s.audioBlob?'<span class="badge bvc" style="font-size:9px">TTS✓</span>':'')
        +(s.videoBlob?'<span class="badge bac" style="font-size:9px">영상✓</span>':'')
        +'<span class="fx-badge" onclick="openEdit('+i+')" title="효과 변경">'+(fx.id==='none'?'효과없음':fx.name)+'</span>'
        +'</div>'
        +'<div class="sc-acts" style="margin-top:5px">'
        +'<button class="ib" onclick="genImg1('+i+')" title="이미지 재생성">🖼</button>'
        +'<button class="ib" onclick="genTts1('+i+')" title="TTS 재생성">🔊</button>'
        +(s.audioBlob?'<button class="ib" onclick="playScTts('+i+')" title="TTS 미리듣기" style="color:var(--green)">▶</button>':'')
        +'<button class="ib" onclick="genVid1('+i+')" title="영상 생성">🎬</button>'
        +'<button class="ib" onclick="dlScImg('+i+')" title="이미지 다운"'+(s.imgBlob?'':' disabled')+'>↓🖼</button>'
        +'<button class="ib" onclick="dlScTts('+i+')" title="TTS 다운"'+(s.audioBlob?'':' disabled')+'>↓🔊</button>'
        +(s.videoBlob?'<button class="ib" onclick="dlScVid('+i+')" title="영상 다운">↓🎬</button>':'')
        +'</div></div></div>';
    }
    grid.innerHTML=html;
  }catch(e){console.error('renderSB:',e);}
}

// 전체 선택/해제
function toggleSelAll(chk){P.scenes.forEach(function(s){s.checked=chk.checked;});renderSB();}
function syncSelAll(){
  var all=P.scenes.every(function(s){return s.checked;});
  var none=P.scenes.every(function(s){return !s.checked;});
  var cb=el('selAll');if(cb){cb.checked=all;cb.indeterminate=!all&&!none;}
}

function selSc(i){P.scenes.forEach(function(s,j){s._sel=j===i;});renderSB();}

function addScene(){
  if(!P.scenes)P.scenes=[];
  P.scenes.push({id:P.scenes.length,title:'새 장면',narration:'',imagePrompt:'',videoPrompt:'',transition:'cut',fx:'none',status:'pending',imgBlob:null,audioBlob:null,videoBlob:null,checked:false});
  renderSB();autoSave();
}

function cloneScene(i){
  var s=P.scenes[i];
  var clone=Object.assign({},s,{id:P.scenes.length,title:s.title+' (복사)',checked:false,imgBlob:s.imgBlob,audioBlob:s.audioBlob,videoBlob:s.videoBlob});
  P.scenes.splice(i+1,0,clone);
  P.scenes.forEach(function(sc,j){sc.id=j;});
  renderSB();autoSave();
  sbLog('장면 '+(i+1)+' 복제됨','ok');
}

function delSc(i){
  if(!confirm('삭제할까요?'))return;
  // IndexedDB 정리
  idbDel(blobKey('img',i));idbDel(blobKey('tts',i));idbDel(blobKey('vid',i));
  P.scenes.splice(i,1);P.scenes.forEach(function(s,j){s.id=j;});
  renderSB();autoSave();
}

// ── 씬 편집 모달 ───────────────────────────────────
function openEdit(i){
  editIdx=i;var s=P.scenes[i];
  el('sceneModalTtl').textContent='장면 '+(i+1)+' 편집';
  el('mNarr').value=s.narration||'';el('mImg').value=s.imagePrompt||'';
  el('mVid').value=s.videoPrompt||'';el('mTrans').value=s.transition||'cut';
  var html='';
  for(var fi=0;fi<FX_LIST.length;fi++){var f=FX_LIST[fi];html+='<div class="fx-opt'+(s.fx===f.id?' on':'')+'" onclick="selFx(\''+f.id+'\',this)" title="'+f.desc+'">'+f.name+'</div>';}
  el('mFxGrid').innerHTML=html;
  el('sceneModal').classList.add('open');
}
function selFx(id,btn){document.querySelectorAll('#mFxGrid .fx-opt').forEach(function(e){e.classList.remove('on');});btn.classList.add('on');if(editIdx!==null)P.scenes[editIdx].fx=id;}
function saveSceneEdit(){
  if(editIdx===null)return;
  var s=P.scenes[editIdx];s.narration=el('mNarr').value;s.imagePrompt=el('mImg').value;
  s.videoPrompt=el('mVid').value;s.transition=el('mTrans').value;
  closeModal('sceneModal');renderSB();autoSave();
}
function closeModal(id){var e=el(id);if(e)e.classList.remove('open');}

// ── 라이트박스 ─────────────────────────────────────
function openLightbox(i){
  var s=P.scenes[i];if(!s||!s.imgBlob)return;
  var lb=el('lightbox'),img=el('lbImg');
  if(!lb||!img)return;
  img.src=URL.createObjectURL(s.imgBlob);
  lb.classList.add('open');
}
function closeLightbox(){var lb=el('lightbox');if(lb)lb.classList.remove('open');}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLightbox();});

// ── 영상 효과 ──────────────────────────────────────
function applyFxSel(){var sel=P.scenes.filter(function(s){return s.checked;});if(!sel.length){alert('장면을 선택하세요.');return;}sel.forEach(function(s){s.fx=rnd(FX_POOL);});sbLog('선택 '+sel.length+'개 랜덤 효과 적용','ok');renderSB();autoSave();}
function applyFxAll(){P.scenes.forEach(function(s){s.fx=rnd(FX_POOL);});sbLog('전체 '+P.scenes.length+'개 랜덤 효과 적용','ok');renderSB();autoSave();}
function stopGen(){stopFlag=true;sbLog('중지 요청됨','warn');hideProgBar();}

// ── 진행률 바 ──────────────────────────────────────
function showProgBar(txt){
  stopFlag=false;
  var w=el('genProgWrap');if(w)w.style.display='block';
  setProgBar(0,txt);
}
function setProgBar(pct,txt){
  var b=el('genProgBar'),t=el('genProgTxt'),p=el('genProgPct');
  if(b)b.style.width=pct+'%';if(t&&txt)t.textContent=txt;if(p)p.textContent=Math.round(pct)+'%';
}
function hideProgBar(){var w=el('genProgWrap');if(w)w.style.display='none';}

// ── 이미지 프롬프트 빌드 ──────────────────────────
function buildPrompt(scene){
  var parts=[];
  if(scene.imagePrompt)parts.push(scene.imagePrompt);else parts.push(scene.narration||'');
  var style=ST.settings.globalStyle;if(style)parts.push(style);
  var gp2=ST.settings.globalPrompt;if(gp2)parts.push(gp2);
  var chars=(ST.settings.characters||[]).filter(function(c){return c.name||c.desc;}).map(function(c){return c.name+': '+c.desc;}).join('; ');
  if(chars)parts.push('Characters: '+chars);
  return parts.join(', ');
}

// ── 개별 생성 ──────────────────────────────────────
async function genImg1(i){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  if(eng==='grok_flow'){exportForGrokAutomator('image',[i]);return;}
  if(eng==='gemini_flow'){alert('Google Flow 프롬프트:\n\n'+buildPrompt(P.scenes[i]));return;}
  var key=eng==='grok'?ST.settings.grokKey:ST.settings.gemKey;
  if(!key){alert('설정 탭에서 API 키를 입력하세요.');gp('settings');return;}
  P.scenes[i].status='generating';renderSB();
  var retries=0,maxRetry=1;
  while(retries<=maxRetry){
    try{
      var blob=await generateImg(key,buildPrompt(P.scenes[i]));
      P.scenes[i].imgBlob=blob;
      await saveBlob('img',i,blob);
      P.scenes[i].status='img_done';
      sbLog('장면 '+(i+1)+' 이미지 ✓ ('+(eng==='grok'?'Grok Aurora':'Gemini')+')','ok');
      break;
    }catch(e){
      if(retries<maxRetry){sbLog('장면 '+(i+1)+' 재시도 중...','warn');retries++;await sleep(2000);}
      else{P.scenes[i].status='error';sbLog('장면 '+(i+1)+' 오류: '+e.message,'err');break;}
    }
  }
  renderSB();autoSave();
}

async function genTts1(i){
  try{
    var blob=await generateTTS(P.scenes[i].narration);
    P.scenes[i].audioBlob=blob;
    await saveBlob('tts',i,blob);
    sbLog('장면 '+(i+1)+' TTS ✓','ok');renderSB();autoSave();
  }catch(e){sbLog('장면 '+(i+1)+' TTS 오류: '+e.message,'err');}
}

async function genVid1(i){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  if(eng==='grok'){
    var key=ST.settings.grokKey;if(!key){alert('xAI API 키가 필요합니다.');return;}
    P.scenes[i].status='generating';renderSB();
    try{
      var vBlob=await generateGrokVideo(P.scenes[i].videoPrompt||buildPrompt(P.scenes[i]),P.scenes[i].imgBlob);
      P.scenes[i].videoBlob=vBlob;await saveBlob('vid',i,vBlob);P.scenes[i].status='done';
      sbLog('장면 '+(i+1)+' Grok 영상 ✓','ok');
    }catch(e){P.scenes[i].status='error';sbLog('장면 '+(i+1)+' 영상 오류: '+e.message,'err');}
    renderSB();autoSave();return;
  }
  if(eng==='grok_flow'){exportForGrokAutomator('video',[i]);return;}
  if(eng==='gemini_flow'){alert('Google Flow 영상 프롬프트:\n\n'+(P.scenes[i].videoPrompt||buildPrompt(P.scenes[i])));return;}
  sbLog('영상 생성: Grok API 또는 확장프로그램 엔진을 선택하세요','warn');
}

// ── 전체/선택 생성 ─────────────────────────────────
async function genAllImg(){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  if(eng==='grok_flow'){exportForGrokAutomator('image');return;}
  if(eng==='gemini_flow'){sendToFlow('image');return;}
  var key=eng==='grok'?ST.settings.grokKey:ST.settings.gemKey;
  if(!key){alert('API 키가 필요합니다.');return;}
  el('sbLogWrap').style.display='block';
  showProgBar('이미지 생성 준비 중...');
  var total=P.scenes.length,done=0,fail=0;
  for(var i=0;i<total;i++){
    if(stopFlag)break;
    P.scenes[i].status='generating';renderSB();
    setProgBar((i/total)*100,'이미지 생성 중... '+( i+1)+'/'+total);
    var retries=0;
    while(retries<=1){
      try{
        var blob=await generateImg(key,buildPrompt(P.scenes[i]));
        P.scenes[i].imgBlob=blob;await saveBlob('img',i,blob);P.scenes[i].status='img_done';done++;
        sbLog('장면 '+(i+1)+'/'+total+' 이미지 ✓','ok');break;
      }catch(e){
        if(retries<1){sbLog('재시도 중...','warn');retries++;await sleep(2000);}
        else{P.scenes[i].status='error';fail++;sbLog('장면 '+(i+1)+' 오류: '+e.message,'err');break;}
      }
    }
    renderSB();await sleep(eng==='grok'?1500:900);
  }
  hideProgBar();autoSave();
  notifyDone('이미지 생성 완료! 성공:'+done+'개 / 실패:'+fail+'개');
  sbLog('이미지 생성 완료. 성공:'+done+' / 실패:'+fail,'ok');
}

async function genAllTts(){
  el('sbLogWrap').style.display='block';
  showProgBar('TTS 생성 준비 중...');
  var total=P.scenes.length,done=0;
  for(var i=0;i<total;i++){
    if(stopFlag)break;
    setProgBar((i/total)*100,'TTS 생성 중... '+(i+1)+'/'+total);
    try{
      var blob=await generateTTS(P.scenes[i].narration);
      P.scenes[i].audioBlob=blob;await saveBlob('tts',i,blob);done++;
      sbLog('장면 '+(i+1)+'/'+total+' TTS ✓','ok');
    }catch(e){sbLog('장면 '+(i+1)+' TTS 오류: '+e.message,'err');}
    renderSB();await sleep(300);
  }
  hideProgBar();autoSave();
  notifyDone('TTS 생성 완료! '+done+'개');
}

async function genAllVid(){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  if(eng==='grok'){
    var has=P.scenes&&P.scenes.some(function(s){return s.imgBlob;});
    if(!has){alert('이미지를 먼저 생성하세요.');return;}
    el('sbLogWrap').style.display='block';showProgBar('Grok 영상 생성 중...');
    for(var i=0;i<P.scenes.length;i++){
      if(stopFlag)break;
      P.scenes[i].status='generating';renderSB();
      setProgBar((i/P.scenes.length)*100,'Grok 영상 생성 중... '+(i+1)+'/'+P.scenes.length);
      try{
        var vBlob=await generateGrokVideo(P.scenes[i].videoPrompt||buildPrompt(P.scenes[i]),P.scenes[i].imgBlob);
        P.scenes[i].videoBlob=vBlob;await saveBlob('vid',i,vBlob);P.scenes[i].status='done';
        sbLog('장면 '+(i+1)+' Grok 영상 ✓','ok');
      }catch(e){P.scenes[i].status='error';sbLog('오류: '+e.message,'err');}
      renderSB();await sleep(3000);
    }
    hideProgBar();autoSave();notifyDone('Grok 영상 생성 완료!');return;
  }
  if(eng==='grok_flow'){exportForGrokAutomator('video');return;}
  sendToFlow('video');
}

async function genSelImg(){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  var key=eng==='grok'?ST.settings.grokKey:ST.settings.gemKey;
  if(!key&&eng!=='grok_flow'&&eng!=='gemini_flow'){alert('API 키가 필요합니다.');return;}
  var has=false;
  for(var i=0;i<P.scenes.length;i++){if(P.scenes[i].checked){has=true;await genImg1(i);await sleep(600);}}
  if(!has)alert('체크박스로 장면을 선택하세요.');
}
async function genSelTts(){
  var has=false;
  for(var i=0;i<P.scenes.length;i++){if(P.scenes[i].checked){has=true;await genTts1(i);await sleep(300);}}
  if(!has)alert('체크박스로 장면을 선택하세요.');
}

// ── 다운로드 ───────────────────────────────────────
function dlScImg(i){if(!P.scenes[i]?.imgBlob)return;var a=document.createElement('a');a.href=URL.createObjectURL(P.scenes[i].imgBlob);a.download='scene_'+String(i+1).padStart(3,'0')+'.png';a.click();}
function dlScTts(i){if(!P.scenes[i]?.audioBlob)return;var ext=P.scenes[i].audioBlob.type.includes('mp3')?'mp3':'wav';var a=document.createElement('a');a.href=URL.createObjectURL(P.scenes[i].audioBlob);a.download='tts_'+String(i+1).padStart(3,'0')+'.'+ext;a.click();}
var _scTtsAudio=null;
function playScTts(i){
  if(!P.scenes[i]||!P.scenes[i].audioBlob){sbLog('장면 '+(i+1)+' TTS가 없습니다.','warn');return;}
  if(_scTtsAudio){_scTtsAudio.pause();_scTtsAudio.src='';_scTtsAudio=null;}
  _scTtsAudio=new Audio(URL.createObjectURL(P.scenes[i].audioBlob));
  _scTtsAudio.play().catch(function(e){sbLog('재생 오류: '+e.message,'err');});
  sbLog('장면 '+(i+1)+' TTS 재생 중...','info');
}
function dlScVid(i){if(!P.scenes[i]?.videoBlob)return;var a=document.createElement('a');a.href=URL.createObjectURL(P.scenes[i].videoBlob);a.download='video_'+String(i+1).padStart(3,'0')+'.mp4';a.click();}
function dlSelImg(){var n=0;P.scenes.forEach(function(s,i){if(s.checked&&s.imgBlob){setTimeout(function(){dlScImg(i);},n++*200);}});if(!n)alert('이미지가 있는 장면을 체크하세요.');}
function dlSelTts(){var n=0;P.scenes.forEach(function(s,i){if(s.checked&&s.audioBlob){setTimeout(function(){dlScTts(i);},n++*250);}});if(!n)alert('TTS가 있는 장면을 체크하세요.');}
function dlAllImg(){var n=0;P.scenes.forEach(function(s,i){if(s.imgBlob){setTimeout(function(){dlScImg(i);},n++*200);}});if(!n)alert('생성된 이미지가 없습니다.');}

async function dlAllTtsMerged(){
  var withAudio=P.scenes.filter(function(s){return s.audioBlob;});
  if(!withAudio.length){alert('TTS가 생성된 장면이 없습니다.');return;}
  sbLog('TTS 파일 합치는 중...','info');
  try{
    var ctx=new AudioContext();var buffers=[];
    for(var i=0;i<withAudio.length;i++){
      try{var arr=await withAudio[i].audioBlob.arrayBuffer();var buf=await ctx.decodeAudioData(arr);buffers.push(buf);}catch(e){console.warn('디코딩 실패:',e);}
    }
    if(!buffers.length){alert('오디오 디코딩 실패. 개별 다운로드를 이용하세요.');return;}
    var totalLen=buffers.reduce(function(a,b){return a+b.length;},0);
    var merged=ctx.createBuffer(1,totalLen,buffers[0].sampleRate);var off=0;
    buffers.forEach(function(b){merged.copyToChannel(b.getChannelData(0),0,off);off+=b.length;});
    var wav=audioBufferToWav(merged),blob=new Blob([wav],{type:'audio/wav'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(P.name||'all_tts')+'_merged.wav';a.click();
    sbLog('전체 TTS 합치기 완료 ('+withAudio.length+'개 파일)','ok');
    await ctx.close();
  }catch(e){
    sbLog('합치기 실패, 개별 다운로드: '+e.message,'warn');
    P.scenes.forEach(function(s,i){if(s.audioBlob)setTimeout(function(){dlScTts(i);},i*250);});
  }
}

function audioBufferToWav(buf){
  var ch=buf.numberOfChannels,sr=buf.sampleRate,len=buf.length*ch*2;
  var data=new ArrayBuffer(44+len),v=new DataView(data);
  var ws=function(off,str){for(var i=0;i<str.length;i++)v.setUint8(off+i,str.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,36+len,true);ws(8,'WAVE');ws(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);
  ws(36,'data');v.setUint32(40,len,true);
  var off=44;
  for(var i=0;i<buf.length;i++){for(var c=0;c<ch;c++){var s=Math.max(-1,Math.min(1,buf.getChannelData(c)[i]));v.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2;}}
  return data;
}

// ── Flow / Grok 내보내기 ───────────────────────────
function sendToFlow(type){
  var lines=P.scenes.map(function(s,i){return '=== 장면 '+(i+1)+': '+(s.title||'')+' ===\n'+(type==='video'?(s.videoPrompt||buildPrompt(s)):buildPrompt(s));});
  var blob=new Blob([lines.join('\n\n')],{type:'text/plain'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='flow_'+type+'_'+P.name+'.txt';a.click();
  window.open('https://labs.google/flow','_blank');
  sbLog(P.scenes.length+'개 '+(type==='video'?'영상':'이미지')+' 프롬프트 → Flow','ok');
  el('sbLogWrap').style.display='block';
}

function exportForGrokAutomator(type,indices){
  var scenes=indices?indices.map(function(i){return P.scenes[i];}).filter(Boolean):P.scenes;
  var prompts=scenes.map(function(s){return type==='video'?(s.videoPrompt||buildPrompt(s)):buildPrompt(s);});
  var blob=new Blob([prompts.join('\n\n')],{type:'text/plain;charset=utf-8'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='grok_automation_'+type+'_'+P.name+'.txt';a.click();
  sbLog('Grok Automation '+type+' 프롬프트 '+prompts.length+'개 내보내기 완료','ok');
  el('sbLogWrap').style.display='block';
  window.open('https://grok.com/imagine','_blank');
}

function exportForFlowAutomator(type){
  var prompts=P.scenes.map(function(s){return type==='video'?(s.videoPrompt||buildPrompt(s)):buildPrompt(s);});
  var blob=new Blob([prompts.join('\n\n')],{type:'text/plain;charset=utf-8'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='flow_automator_'+type+'_'+P.name+'.txt';a.click();
  sbLog('Flow Automator '+type+' 프롬프트 내보내기','ok');
  el('sbLogWrap').style.display='block';
}

// ── 캐릭터 ─────────────────────────────────────────
function renderChars(){
  var chars=ST.settings.characters||[],list=el('charList');if(!list)return;
  var html='';
  for(var i=0;i<chars.length;i++){
    var c=chars[i];
    html+='<div class="char-item"><div class="char-thumb" onclick="clickCharThumb('+i+')">'+(c.imgUrl?'<img src="'+c.imgUrl+'">':'<span>사진</span>')+'</div>'
      +'<div class="char-info"><input type="text" value="'+esc(c.name||'')+'" placeholder="캐릭터 이름" oninput="ST.settings.characters['+i+'].name=this.value;autoSave()">'
      +'<input type="text" value="'+esc(c.desc||'')+'" placeholder="설명 (예: tall man in a suit)" oninput="ST.settings.characters['+i+'].desc=this.value;autoSave()"></div>'
      +'<button class="char-del" onclick="delChar('+i+')">✕</button></div>';
  }
  list.innerHTML=html;
  var addBtn=el('charAdd');if(addBtn)addBtn.style.display=chars.length>=5?'none':'flex';
}
function addChar(){if(!ST.settings.characters)ST.settings.characters=[];if(ST.settings.characters.length>=5){alert('최대 5개');return;}ST.settings.characters.push({name:'',desc:'',imgUrl:null});renderChars();autoSave();}
function delChar(i){ST.settings.characters.splice(i,1);renderChars();autoSave();}
function clickCharThumb(i){charEditIdx=i;el('charImgInput').click();}
async function charImgUploaded(input){
  if(!input.files[0]||charEditIdx===null)return;
  // base64로 저장 (새로고침 후에도 유지)
  var b64=await blobToB64(input.files[0]);
  ST.settings.characters[charEditIdx].imgUrl=b64;
  renderChars();autoSave();
}

// ── 스타일 참조 / 마스코트 (base64 저장) ─────────
function renderStyleRefs(){
  var refs=ST.settings.styleRefs||[],list=el('styleRefList');if(!list)return;
  var html=refs.map(function(r,i){return '<div class="ref-item"><img src="'+r+'"><button class="ref-del" onclick="ST.settings.styleRefs.splice('+i+',1);renderStyleRefs();autoSave()">✕</button></div>';}).join('');
  if(refs.length<3)html+='<div class="ref-add" onclick="document.getElementById(\'styleRefInput\').click()">+</div>';
  list.innerHTML=html;
}
async function addStyleRef(input){
  if(!ST.settings.styleRefs)ST.settings.styleRefs=[];
  var toAdd=Array.from(input.files).slice(0,3-ST.settings.styleRefs.length);
  for(var i=0;i<toAdd.length;i++){var b64=await blobToB64(toAdd[i]);ST.settings.styleRefs.push(b64);}
  renderStyleRefs();autoSave();
}

function renderMascots(){
  var ms=ST.settings.mascots||[],list=el('mascotList');if(!list)return;
  var html=ms.map(function(m,i){return '<div class="ref-item"><img src="'+m+'"><button class="ref-del" onclick="ST.settings.mascots.splice('+i+',1);renderMascots();autoSave()">✕</button></div>';}).join('');
  if(ms.length<5)html+='<div class="ref-add" onclick="document.getElementById(\'mascotInput\').click()">+</div>';
  list.innerHTML=html;
}
async function addMascot(input){
  if(!ST.settings.mascots)ST.settings.mascots=[];
  var toAdd=Array.from(input.files).slice(0,5-ST.settings.mascots.length);
  for(var i=0;i<toAdd.length;i++){var b64=await blobToB64(toAdd[i]);ST.settings.mascots.push(b64);}
  renderMascots();autoSave();
}

// ── 타임라인 ───────────────────────────────────────
function renderTL(){
  var vt=el('tlV'),at=el('tlA'),st2=el('tlS');
  if(!P.scenes||!P.scenes.length){if(vt)vt.innerHTML='<div style="font-size:11px;color:var(--text3);padding:5px">장면 없음</div>';return;}
  function mk(s,i,cls,lbl){var w=Math.max(50,estDur(s.narration)*8);return '<div class="clip '+cls+'" style="width:'+w+'px" onclick="tlSel('+i+')">'+lbl+'</div>';}
  var vH='',aH='',sH='';
  for(var i=0;i<P.scenes.length;i++){var s=P.scenes[i];vH+=mk(s,i,'clip-v','씬'+(i+1)+(s.imgBlob?'🖼':''));aH+=mk(s,i,'clip-a',(s.audioBlob?'🔊':'—')+'TTS');sH+=mk(s,i,'clip-s','자막');}
  if(vt)vt.innerHTML=vH;if(at)at.innerHTML=aH;if(st2)st2.innerHTML=sH;
  var tot=P.scenes.reduce(function(a,s){return a+estDur(s.narration);},0);
  var te=el('tlTot');if(te)te.textContent=fmtT(tot);
  tlSel(0);
}
function tlSel(i){
  var s=P.scenes[i];if(!s)return;
  var img=el('tlImg'),empty=el('tlEmpty');
  if(s.imgBlob){img.src=URL.createObjectURL(s.imgBlob);img.style.display='block';if(empty)empty.style.display='none';}
  else{img.style.display='none';if(empty)empty.style.display='flex';}
  el('tlSN').textContent='장면 '+(i+1);
  var fx=FX_LIST.find(function(f){return f.id===s.fx;})||FX_LIST[0];
  var fxEl=el('tlFX');if(fxEl)fxEl.textContent=fx&&fx.id!=='none'?fx.name:'';
  var pr=el('tlProp');
  if(pr)pr.innerHTML='<div style="color:var(--accent);font-weight:700;margin-bottom:6px">장면 '+(i+1)+'</div>'
    +'<div style="font-size:11px;color:var(--text3)">길이</div><div style="font-weight:600;margin-bottom:5px">'+estDur(s.narration).toFixed(1)+'초</div>'
    +'<div style="font-size:11px;color:var(--text3)">전환</div><div style="margin-bottom:5px">'+(s.transition||'Cut')+'</div>'
    +'<div style="font-size:11px;color:var(--text3)">효과</div><div style="margin-bottom:5px">'+(fx?fx.name:'없음')+'</div>'
    +'<div style="font-size:11px;color:var(--text3)">나레이션</div><div style="font-size:11px;color:var(--text2);line-height:1.5">'+esc((s.narration||'').substring(0,100))+'</div>';
}
function tlPP(){
  if(!P.scenes||!P.scenes.length){alert('재생할 장면이 없습니다.');return;}
  tlPlaying=!tlPlaying;
  var b=el('tlPBtn');if(b)b.textContent=tlPlaying?'⏸':'▶';
  if(tlPlaying){
    // 현재 선택된 씬부터 재생
    var curSel=P.scenes.findIndex(function(s){return s._sel;});
    tlIdx=curSel>=0?curSel:0;
    _tlPlayStep();
  } else {
    _tlStop();
  }
}

function _tlStop(){
  clearTimeout(tlTimer);
  if(tlCurrentAudio){try{tlCurrentAudio.pause();tlCurrentAudio.src='';}catch(e){}}
  tlCurrentAudio=null;
  tlPlaying=false;
  var b=el('tlPBtn');if(b)b.textContent='▶';
}

function _tlPlayStep(){
  if(!tlPlaying||tlIdx>=(P.scenes?P.scenes.length:0)){
    _tlStop();return;
  }
  tlSel(tlIdx);
  // 자막 표시
  var s=P.scenes[tlIdx];
  var sub=el('tlSub');
  if(sub){
    sub.textContent=(s.narration||'').substring(0,parseInt(ST.settings.subCh||30));
    sub.style.display=s.narration?'block':'none';
  }
  // TTS 재생
  var dur=estDur(s.narration)*1000;
  if(s.audioBlob){
    var au=new Audio();
    au.src=URL.createObjectURL(s.audioBlob);
    tlCurrentAudio=au;
    au.play().catch(function(){});
    au.onended=function(){
      if(sub)sub.style.display='none';
      tlIdx++;_tlPlayStep();
    };
    // 타임아웃 안전망 (TTS가 예상보다 짧은 경우)
    tlTimer=setTimeout(function(){
      if(tlPlaying&&tlCurrentAudio===au&&!au.ended){au.onended=null;if(sub)sub.style.display='none';tlIdx++;_tlPlayStep();}
    },Math.max(dur+2000,5000));
  } else {
    // TTS 없으면 예상 시간 후 다음 장면
    if(sub)setTimeout(function(){if(sub)sub.style.display='none';},dur-200);
    tlTimer=setTimeout(function(){tlIdx++;_tlPlayStep();},dur);
  }
  // 타임코드 업데이트
  _tlUpdateTime();
}

function _tlUpdateTime(){
  if(!tlPlaying)return;
  var elapsed=P.scenes.slice(0,tlIdx).reduce(function(a,s){return a+estDur(s.narration);},0);
  var cur=el('tlCur');if(cur)cur.textContent=fmtT(elapsed);
  setTimeout(function(){if(tlPlaying)_tlUpdateTime();},500);
}
function tlPrev(){var c=P.scenes?P.scenes.findIndex(function(s){return s._sel;})||0:0;tlSel(Math.max(0,c-1));}
function tlNext(){var c=P.scenes?P.scenes.findIndex(function(s){return s._sel;})||0:0;tlSel(Math.min((P.scenes?P.scenes.length:1)-1,c+1));}

// ── 미리보기 ───────────────────────────────────────
function renderPV(){pvIdx=0;showPV(0);}
function showPV(i){
  var s=P.scenes&&P.scenes[i];if(!s)return;
  var img=el('pvImg'),empty=el('pvEmpty');
  if(s.imgBlob){img.src=URL.createObjectURL(s.imgBlob);img.style.display='block';if(empty)empty.style.display='none';}
  else{img.style.display='none';if(empty)empty.style.display='flex';}
  var sub=el('pvSub');
  if(sub){sub.textContent=(s.narration||'').substring(0,parseInt(ST.settings.subCh||20));sub.style.display=s.narration?'block':'none';}
  var info=el('pvInfo');if(info)info.textContent='장면 '+(i+1)+' / '+(P.scenes?P.scenes.length:0);
  var t=el('pvT');if(t)t.textContent=fmtT(pvIdx*7)+' / '+fmtT((P.scenes?P.scenes.length:0)*7);
}
function pvPlay(){
  pvPlaying=!pvPlaying;
  var b=el('pvBtn');if(b)b.textContent=pvPlaying?'⏸':'▶';
  if(pvPlaying){
    // BGM 시작
    if(ST.settings.useBgm && bgmObjectUrl) startBgm(0.15);
    var step=function(){
      if(!pvPlaying)return;
      if(pvIdx>=(P.scenes?P.scenes.length:0)-1){
        pvPlaying=false;
        var b2=el('pvBtn');if(b2)b2.textContent='▶';
        stopBgm();return;
      }
      pvIdx++;showPV(pvIdx);
      if(P.scenes[pvIdx]&&P.scenes[pvIdx].audioBlob){
        var au=new Audio();
        au.src=URL.createObjectURL(P.scenes[pvIdx].audioBlob);
        au.play().catch(function(){});
      }
      pvTimer=setTimeout(step,estDur((P.scenes&&P.scenes[pvIdx]?P.scenes[pvIdx].narration:''))*1000);
    };
    if(P.scenes[pvIdx]&&P.scenes[pvIdx].audioBlob){
      var au=new Audio();
      au.src=URL.createObjectURL(P.scenes[pvIdx].audioBlob);
      au.play().catch(function(){});
    }
    pvTimer=setTimeout(step,estDur((P.scenes&&P.scenes[pvIdx]?P.scenes[pvIdx].narration:''))*1000);
  }else{
    clearTimeout(pvTimer);
    stopBgm();
  }
}
function pvPrev(){if(pvIdx>0){pvIdx--;showPV(pvIdx);}}
function pvNext(){if(pvIdx<(P.scenes?P.scenes.length:1)-1){pvIdx++;showPV(pvIdx);}}
function toggleFS(){el('pvW')&&el('pvW').requestFullscreen&&el('pvW').requestFullscreen();}
function setPvR(r,btn){
  document.querySelectorAll('.pv-ctrl .btn').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  var p=el('pvPl');if(p){p.style.aspectRatio=r==='16:9'?'16/9':'9/16';p.style.maxWidth=r==='16:9'?'720px':'360px';}
}

// ── 썸네일 ─────────────────────────────────────────
async function genThumbs(){
  var key=ST.settings.gemKey;if(!key){alert('Gemini API 키가 필요합니다.');gp('settings');return;}
  var p=(el('thumbPrompt')||{}).value||'';var sty=(el('thumbStyle')||{}).value||'';
  if(!p.trim()){alert('썸네일 프롬프트를 입력하세요.');return;}
  var count=parseInt((el('thumbCount')||{}).value||'3');
  var grid=el('thumbGrid');if(grid)grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text3)">생성 중...</div>';
  P.thumbnails=[];
  var fullP=p+(sty?', '+sty:'')+', YouTube thumbnail, 16:9, high quality';
  for(var i=0;i<count;i++){try{P.thumbnails.push(await generateImg(key,fullP+' variation '+(i+1)));}catch(e){sbLog('썸네일 오류: '+e.message,'err');}}
  renderThumbs();autoSave();
}
function renderThumbs(){
  var grid=el('thumbGrid');if(!grid)return;
  if(!P.thumbnails||!P.thumbnails.length){grid.innerHTML='<div class="empty" style="grid-column:1/-1;padding:20px"><p>썸네일을 생성해보세요</p></div>';return;}
  grid.innerHTML=P.thumbnails.map(function(b,i){return '<div class="ti"><span class="ti-lbl">#'+(i+1)+'</span><img src="'+URL.createObjectURL(b)+'" loading="lazy"><button class="ti-dl" onclick="dlThumb('+i+')">↓</button></div>';}).join('');
}
function dlThumb(i){var a=document.createElement('a');a.href=URL.createObjectURL(P.thumbnails[i]);a.download='thumbnail_'+(i+1)+'.png';a.click();}

// ── 자막 미리보기 ──────────────────────────────────
function updateSubPrev(){
  var e=el('subPrev');if(!e)return;
  var font=(el('subFont')||{}).value||"'Noto Sans KR', sans-serif";
  var sz=parseInt((el('subSz')||{}).value||'25');
  var tc=(el('subTc')||{}).value||'#FFFFFF', bc=(el('subBc')||{}).value||'#000000';
  var op=parseInt((el('subOp')||{}).value||'80')/100;
  var pos=(el('subPos')||{}).value||'bottom';
  var shd=el('subShd')&&el('subShd').checked;
  var r=parseInt(bc.slice(1,3),16)||0, g2=parseInt(bc.slice(3,5),16)||0, b=parseInt(bc.slice(5,7),16)||0;
  var posMap={bottom:'bottom:10%;top:auto;transform:translateX(-50%)',center:'top:50%;transform:translate(-50%,-50%)',top:'top:10%;bottom:auto;transform:translateX(-50%)'};
  var shadow=shd?'text-shadow:1px 1px 3px rgba(0,0,0,.9)':'';
  e.style.cssText='position:absolute;left:50%;'+(posMap[pos]||posMap.bottom)+';padding:5px 12px;border-radius:4px;font-size:'+Math.round(sz*0.54)+'px;white-space:nowrap;color:'+tc+';background:rgba('+r+','+g2+','+b+','+op+');font-family:'+font+';'+shadow;
}
function toggleBgm(){
  var w=el('bgmWrap');
  if(w)w.style.display=(el('useBgm')&&el('useBgm').checked)?'block':'none';
  if(!(el('useBgm')&&el('useBgm').checked)) stopBgm();
}

function loadBgm(input){
  if(!input.files[0])return;
  bgmBlob=input.files[0];
  if(bgmObjectUrl) URL.revokeObjectURL(bgmObjectUrl);
  bgmObjectUrl=URL.createObjectURL(bgmBlob);
  var info=el('bgmFileInfo');
  if(info)info.textContent='✓ '+bgmBlob.name+' ('+(bgmBlob.size/1024).toFixed(0)+'KB)';
  sbLog('BGM 로드됨: '+bgmBlob.name,'ok');
}
function loadBgmFile(input){loadBgm(input);}  // HTML onchange 별칭

function testBgm(){
  var vol=parseFloat((el('bgmVol')||{}).value||20)/100;
  startBgm(vol);
  sbLog('BGM 테스트 재생 중 (■ 버튼으로 중지)','info');
}

function startBgm(volume){
  if(!bgmObjectUrl){sbLog('BGM 파일을 먼저 선택하세요.','warn');return;}
  stopBgm();
  bgmAudio=new Audio(bgmObjectUrl);
  bgmAudio.loop=true;
  bgmAudio.volume=volume!=null?volume:0.15; // 기본 -15dB 느낌
  bgmAudio.play().catch(function(e){sbLog('BGM 재생 오류: '+e.message,'err');});
}

function stopBgm(){
  if(bgmAudio){
    try{bgmAudio.pause();bgmAudio.src='';}catch(e){}
    bgmAudio=null;
  }
}

// ── 음성 목록 ──────────────────────────────────────
var curTierF = 'ALL';
var curVoiceSearch = '';

function changeTtsEng(){
  var eng=(el('ttsEng')||{}).value||'elevenlabs';
  curLangF='ALL'; curTierF='ALL'; curVoiceSearch='';
  var sv=el('voiceSearch');if(sv)sv.value='';

  // 언어 필터
  var filters=LANG_FILTERS[eng]||[{k:'ALL',l:'전체'}];
  var fwrap=el('voiceFilter');
  if(fwrap)fwrap.innerHTML=filters.map(function(f){
    return '<button class="vfb'+(f.k===curLangF?' on':'')+'" onclick="setLF(\''+f.k+'\',this,\''+eng+'\')">'+f.l+'</button>';
  }).join('');

  // 티어 필터 (ElevenLabs만)
  var tf=el('tierFilter');
  if(tf)tf.style.display=(eng==='elevenlabs')?'flex':'none';

  renderVoices(eng,'ALL');
}

function setLF(k,btn,eng){
  curLangF=k;
  document.querySelectorAll('.vfb:not([id^="tier-"])').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  renderVoices(eng||(el('ttsEng')||{}).value||'elevenlabs',k);
}

function setTierF(k,btn){
  curTierF=k;
  document.querySelectorAll('[id^="tier-"]').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  renderVoices((el('ttsEng')||{}).value||'elevenlabs',curLangF);
}

function filterVoiceSearch(){
  curVoiceSearch=(el('voiceSearch')||{}).value||'';
  renderVoices((el('ttsEng')||{}).value||'elevenlabs',curLangF);
}

function renderVoices(eng,langF){
  var list=VOICES[eng]||[];
  var filtered=list;

  // 언어/성별 필터
  if(langF && langF!=='ALL') {
    if(langF==='F') filtered=filtered.filter(function(v){return v.gender==='여';});
    else if(langF==='M') filtered=filtered.filter(function(v){return v.gender==='남';});
    else filtered=filtered.filter(function(v){return v.region===langF;});
  }

  // 티어 필터 (ElevenLabs)
  if(eng==='elevenlabs'&&curTierF&&curTierF!=='ALL'){
    filtered=filtered.filter(function(v){return v.tier===curTierF;});
  }

  // 검색 필터
  if(curVoiceSearch.trim()){
    var q=curVoiceSearch.trim().toLowerCase();
    filtered=filtered.filter(function(v){
      return v.name.toLowerCase().includes(q)||v.desc.toLowerCase().includes(q);
    });
  }

  var hint=el('vcHint');if(hint)hint.textContent=filtered.length+'개 음성';
  var e=el('voiceList');if(!e)return;
  if(!filtered.length){e.innerHTML='<div style="font-size:12px;color:var(--text3);padding:7px">검색 결과 없음</div>';return;}

  e.innerHTML=filtered.map(function(v){
    var tierColors = {free:'rgba(16,185,129,.15)', starter:'rgba(59,130,246,.15)', creator:'rgba(245,158,11,.15)'};
    var tierTextColors = {free:'var(--green)', starter:'#3b82f6', creator:'var(--accent3)'};
    var tierLabels = {free:'Free', starter:'Starter', creator:'Creator'};
    var tierBadge = v.tier ? '<span class="badge" style="font-size:9px;background:'+(tierColors[v.tier]||'')+';color:'+(tierTextColors[v.tier]||'var(--text3)')+'">'+(tierLabels[v.tier]||v.tier)+'</span>' : '';
    var genderIcon=v.gender==='여'?'👩':'👨';
    return '<div class="vi'+(selVoice===v.id?' sel':'')+'" data-vid="'+v.id+'" onclick="selV(\''+v.id+'\',this,\''+esc(v.name)+'\',\''+v.gender+'\')">'
      +'<div style="flex:1"><div class="vi-nm">'+genderIcon+' '+v.name+'</div><div class="vi-ds">'+v.desc+'</div></div>'
      +'<div style="display:flex;gap:3px;flex-shrink:0;align-items:center">'
      +tierBadge
      +'<span class="badge bc" style="font-size:9px">'+v.region+'</span>'
      +'</div>'
      +'<button class="vi-pv" onclick="event.stopPropagation();testVoice(\''+v.id+'\',\''+esc(v.name)+'\',\''+v.region+'\')">▶</button>'
      +'</div>';
  }).join('');
}

function selV(id,btn,name,gender){
  selVoice=id;
  document.querySelectorAll('.vi').forEach(function(v){v.classList.remove('sel');});
  if(btn)btn.classList.add('sel');
  // 현재 선택 표시 업데이트
  var bar=el('curVoiceBar'),nm=el('curVoiceName'),gn=el('curVoiceGender');
  if(bar)bar.style.display='block';
  if(nm)nm.textContent=name||id;
  if(gn)gn.textContent=gender==='여'?'(여성)':gender==='남'?'(남성)':'';
  autoSave();
}

// 나라별 미리듣기 텍스트
var PREVIEW_TEXT = {
  KR: '안녕하세요. 목소리 테스트입니다.',
  US: 'Hello! This is a voice preview.',
  UK: 'Hello! This is a voice preview.',
  JP: 'こんにちは。音声テストです。',
  CN: '你好，这是语音测试。',
  ES: 'Hola, esta es una prueba de voz.',
  FR: 'Bonjour, ceci est un test de voix.',
  DE: 'Hallo, das ist ein Stimmtest.',
  BR: 'Olá, este é um teste de voz.',
  IT: 'Ciao, questo è un test vocale.',
  ALL: 'Hello! This is a voice preview.',
};

// PCM → WAV 변환 (Gemini TTS는 PCM raw data 반환)
function pcmToWavUrl(base64Pcm) {
  var pcmStr = atob(base64Pcm);
  var pcmBytes = new Uint8Array(pcmStr.length);
  for (var i=0; i<pcmStr.length; i++) pcmBytes[i] = pcmStr.charCodeAt(i);
  var sampleRate=24000, channels=1, bitsPerSample=16;
  var header = new ArrayBuffer(44);
  var v = new DataView(header);
  // RIFF
  [0x52,0x49,0x46,0x46].forEach(function(b,i){v.setUint8(i,b);});
  v.setUint32(4, 36+pcmBytes.length, true);
  [0x57,0x41,0x56,0x45].forEach(function(b,i){v.setUint8(8+i,b);});
  // fmt
  [0x66,0x6D,0x74,0x20].forEach(function(b,i){v.setUint8(12+i,b);});
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,channels,true);
  v.setUint32(24,sampleRate,true);
  v.setUint32(28,sampleRate*channels*bitsPerSample/8,true);
  v.setUint16(32,channels*bitsPerSample/8,true); v.setUint16(34,bitsPerSample,true);
  // data
  [0x64,0x61,0x74,0x61].forEach(function(b,i){v.setUint8(36+i,b);});
  v.setUint32(40,pcmBytes.length,true);
  var wav = new Uint8Array(44+pcmBytes.length);
  wav.set(new Uint8Array(header),0); wav.set(pcmBytes,44);
  return URL.createObjectURL(new Blob([wav],{type:'audio/wav'}));
}

// TTS 실제 미리듣기
async function testVoice(voiceId, voiceName, region) {
  var vid = voiceId || selVoice;
  var eng = (el('ttsEng')||{}).value || 'elevenlabs';
  var reg = region || curLangF || 'ALL';
  var text = PREVIEW_TEXT[reg] || PREVIEW_TEXT['ALL'];

  if (eng==='elevenlabs') {
    var key = (el('elKey')||{}).value || ST.settings.elKey;
    if (!key) { alert('ElevenLabs API 키를 입력하세요.'); return; }
    if (!vid) { alert('목소리를 먼저 선택하세요.'); return; }
    try {
      var r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+vid, {
        method:'POST',
        headers:{'Content-Type':'application/json','xi-api-key':key},
        body:JSON.stringify({text:text,model_id:'eleven_multilingual_v2',voice_settings:{stability:.5,similarity_boost:.75}})
      });
      if (!r.ok) { alert('ElevenLabs 오류: '+r.status); return; }
      var blob = await r.blob();
      new Audio(URL.createObjectURL(blob)).play();
    } catch(e) { alert('미리듣기 오류: '+e.message); }

  } else if (eng==='gemini' || eng==='gemini31flash') {
    var key2 = (el('gemKey')||{}).value || ST.settings.gemKey;
    if (!key2) { alert('Gemini API 키를 입력하세요.'); return; }
    var vn = vid || 'Kore';
    var modelId = eng==='gemini31flash' ? 'gemini-3.1-flash-tts-preview' : 'gemini-2.5-pro-preview-tts';
    try {
      var r2 = await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+modelId+':generateContent?key='+key2, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({contents:[{parts:[{text:text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:vn}}}}})
      });
      var d2 = await r2.json();
      var b64 = d2.candidates&&d2.candidates[0]&&d2.candidates[0].content&&d2.candidates[0].content.parts&&d2.candidates[0].content.parts[0]&&d2.candidates[0].content.parts[0].inlineData&&d2.candidates[0].content.parts[0].inlineData.data;
      if (!b64) { alert('Gemini TTS 응답 없음.\n오류: '+(d2.error&&d2.error.message||JSON.stringify(d2).substring(0,100))); return; }
      new Audio(pcmToWavUrl(b64)).play();
    } catch(e) { alert('미리듣기 오류: '+e.message); }

  } else {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = reg==='KR'?'ko-KR':reg==='JP'?'ja-JP':reg==='CN'?'zh-CN':'en-US';
    speechSynthesis.speak(u);
  }
}

// ── 파이프라인 탭 ──────────────────────────────────
function updatePipelineUI(){
  var imgCount=P.scenes?P.scenes.filter(function(s){return s.imgBlob;}).length:0;
  var ttsCount=P.scenes?P.scenes.filter(function(s){return s.audioBlob;}).length:0;
  var total=P.scenes?P.scenes.length:0;
  var el1=el('plSceneCount');if(el1)el1.textContent=total;
  var el2=el('plImgCount');if(el2)el2.textContent=imgCount+'/'+total;
  var el3=el('plTtsCount');if(el3)el3.textContent=ttsCount+'/'+total;
  var el4=el('plProjName');if(el4)el4.textContent=P.name||'새 프로젝트';
  checkServer().then(updateServerUI);
}

// ── CapCut 서버 ─────────────────────────────────────
async function checkServer(){
  try{var r=await fetch(CAPCUT_SERVER+'/status',{signal:AbortSignal.timeout(2000)});var d=await r.json();serverConnected=d.status==='ok';}
  catch(e){serverConnected=false;}
  updateServerUI();
}
function updateServerUI(){
  var dot=el('serverDot'),txt=el('serverTxt');if(!dot)return;
  if(serverConnected){dot.style.background='var(--green)';dot.style.animation='bl 1.5s infinite';if(txt)txt.textContent='CapCut 서버 연결됨';document.querySelectorAll('.capcut-btn').forEach(function(b){b.disabled=false;});}
  else{dot.style.background='var(--text3)';dot.style.animation='none';if(txt)txt.textContent='CapCut 서버 미연결 (서버시작.bat 실행)';document.querySelectorAll('.capcut-btn').forEach(function(b){b.disabled=true;});}
}

async function sendToCapCut(){
  if(!serverConnected){alert('CapCut 서버가 실행되어 있지 않습니다.\ncapcut-server 폴더의 서버시작.bat/sh를 먼저 실행하세요.');return;}
  var hasImg=P.scenes&&P.scenes.some(function(s){return s.imgBlob;});
  if(!hasImg){alert('이미지 또는 영상이 없습니다. 먼저 생성하세요.');return;}
  sbLog('CapCut 서버로 전송 중...','info');
  var scenes=P.scenes.map(function(s,i){var n=String(i+1).padStart(3,'0');return{id:i,narration:s.narration||'',image_path:'scene_'+n+'.png',video_path:s.videoBlob?'video_'+n+'.mp4':'',audio_path:s.audioBlob?'tts_'+n+'.wav':'',duration_sec:estDur(s.narration),fx:s.fx||'none',transition:s.transition||'cut'};});
  var payload={project_name:P.name||'StudioForge',fps:30,width:ST.settings.ratio==='9:16'?1080:1920,height:ST.settings.ratio==='9:16'?1920:1080,scenes:scenes,subtitle_settings:{font:ST.settings.subFont||'Noto Sans KR',size:ST.settings.subSz||25,color:ST.settings.subTc||'#FFFFFF',bg_color:ST.settings.subBc||'#000000',bg_opacity:(ST.settings.subOp||80)/100,position:ST.settings.subPos||'bottom'}};
  try{
    var r=await fetch(CAPCUT_SERVER+'/build_draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    var d=await r.json();
    if(d.success){sbLog('CapCut draft 생성 완료! 경로: '+d.draft_path,'ok');alert('✓ CapCut Draft 생성 완료!\n\n'+d.draft_path+'\n\n'+d.next_step);}
    else{sbLog('오류: '+d.error,'err');alert('오류: '+d.error);}
  }catch(e){sbLog('서버 오류: '+e.message,'err');}
}

async function renderWithFFmpeg(){
  if(!serverConnected){alert('CapCut 서버가 필요합니다.');return;}
  var draftName=prompt('렌더링할 Draft 이름:');if(!draftName)return;
  sbLog('FFmpeg 렌더링 시작...','info');
  try{
    var r=await fetch(CAPCUT_SERVER+'/render_ffmpeg',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({draft_name:draftName})});
    var d=await r.json();
    if(d.success){sbLog('렌더링 완료: '+(d.output_files||[]).join(', '),'ok');}
    else{sbLog('렌더링 실패: '+d.error,'err');}
  }catch(e){sbLog('오류: '+e.message,'err');}
}

// ── YouTube 업로드 ─────────────────────────────────
function ytConnect(){
  var cid=(el('ytCid')||{}).value||ST.settings.ytCid||'';if(!cid){alert('먼저 YouTube OAuth Client ID를 입력하세요.');return;}
  var ru=encodeURIComponent(window.location.href.split('?')[0].split('#')[0]);
  var sc=encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly');
  var url='https://accounts.google.com/o/oauth2/v2/auth?client_id='+cid+'&redirect_uri='+ru+'&response_type=token&scope='+sc;
  var popup=window.open(url,'ytauth','width=500,height=600');
  var chk=setInterval(function(){try{if(popup.closed){clearInterval(chk);return;}var h=popup.location.hash;if(h.includes('access_token')){clearInterval(chk);popup.close();var tk=new URLSearchParams(h.slice(1)).get('access_token');ST.settings.ytAccessToken=tk;autoSave();fetchYtCh(tk);}}catch(e){}},500);
}
async function fetchYtCh(token){try{var r=await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',{headers:{Authorization:'Bearer '+token}});var d=await r.json();if(d.items&&d.items.length){el('ytChNm').textContent=d.items[0].snippet.title;el('ytDis').style.display='none';el('ytCon').style.display='block';}}catch(e){alert('채널 정보 오류: '+e.message);}}
function ytDiscon(){ST.settings.ytAccessToken=null;el('ytDis').style.display='block';el('ytCon').style.display='none';autoSave();}
function selYtFile(input){if(input.files[0]){ytFileBlobGlobal=input.files[0];var info=el('ytFileInfo');if(info){info.textContent=input.files[0].name+' ('+(input.files[0].size/1024/1024).toFixed(1)+'MB)';info.style.display='block';}}}
async function startUpload(){
  var token=ST.settings.ytAccessToken;if(!token){alert('YouTube 계정을 먼저 연결하세요.');return;}
  if(!ytFileBlobGlobal){alert('영상 파일을 선택하세요.');return;}
  var title=(el('ytTitle')||{}).value||P.name||'새 영상',desc=(el('ytDesc')||{}).value||'';
  var tags=((el('ytTags')||{}).value||'').split(',').map(function(t){return t.trim();}).filter(Boolean);
  var privacy=(el('ytPriv')||{}).value||'private',cat=(el('ytCat')||{}).value||'22',schedule=(el('ytSched')||{}).value;
  el('ytStat').style.display='block';el('ytStatTxt').textContent='업로드 초기화 중...';
  var meta={snippet:{title:title,description:desc,tags:tags,categoryId:cat},status:{privacyStatus:schedule?'private':privacy}};
  if(schedule)meta.status.publishAt=new Date(schedule).toISOString();
  try{
    var init=await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','X-Upload-Content-Type':ytFileBlobGlobal.type,'X-Upload-Content-Length':ytFileBlobGlobal.size},body:JSON.stringify(meta)});
    if(!init.ok){var err=await init.json();throw new Error(err.error&&err.error.message||'초기화 오류');}
    var upUrl=init.headers.get('Location');if(!upUrl)throw new Error('업로드 URL 없음');
    var CHUNK=5*1024*1024,offset=0;
    while(offset<ytFileBlobGlobal.size){
      var end=Math.min(offset+CHUNK,ytFileBlobGlobal.size);
      var resp=await fetch(upUrl,{method:'PUT',headers:{'Content-Range':'bytes '+offset+'-'+(end-1)+'/'+ytFileBlobGlobal.size,'Content-Type':ytFileBlobGlobal.type},body:ytFileBlobGlobal.slice(offset,end)});
      offset=end;var pct=Math.round(offset/ytFileBlobGlobal.size*100);
      el('ytProg').style.width=pct+'%';el('ytPct').textContent=pct+'%';el('ytStatTxt').textContent='업로드 중... '+pct+'%';
      if(resp.status===200||resp.status===201){var result=await resp.json();el('ytStatTxt').textContent='✓ 완료!';el('ytLinkRow').style.display='block';el('ytLink').href='https://www.youtube.com/watch?v='+result.id;break;}
    }
  }catch(e){el('ytStatTxt').textContent='오류: '+e.message;}
}

// ── API 호출 ───────────────────────────────────────
async function callGemini(key,prompt){
  var r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
  var d=await r.json();if(!r.ok)throw new Error((d.error&&d.error.message)||'Gemini 오류');
  return d.candidates[0].content.parts[0].text;
}

async function callAI(prompt){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  if(eng==='grok'||eng==='grok_flow'){
    var key=ST.settings.grokKey;if(!key)throw new Error('xAI API 키가 필요합니다.');
    var r=await fetch('https://api.x.ai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:'grok-4-1-fast-non-reasoning',messages:[{role:'user',content:prompt}],temperature:0.3})});
    var d=await r.json();if(!r.ok)throw new Error((d.error&&d.error.message)||'Grok API 오류');
    return d.choices[0].message.content;
  }
  var gemKey=ST.settings.gemKey;if(!gemKey)throw new Error('Gemini API 키가 필요합니다.');
  return callGemini(gemKey,prompt);
}

async function generateImg(key,prompt){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  if(eng==='grok'){
    var grokKey=ST.settings.grokKey;if(!grokKey)throw new Error('xAI API 키가 필요합니다.');
    var r=await fetch('https://api.x.ai/v1/images/generations',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+grokKey},body:JSON.stringify({model:'grok-imagine-image',prompt:prompt,response_format:'url',n:1})});
    var d=await r.json();if(!r.ok)throw new Error((d.error&&d.error.message)||'Grok 이미지 생성 실패');
    var imgResp=await fetch(d.data[0].url);return await imgResp.blob();
  }
  // Gemini Imagen
  var ratio=ST.settings.ratio||'16:9';
  var r2=await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({instances:[{prompt:prompt}],parameters:{sampleCount:1,aspectRatio:ratio}})});
  var d2=await r2.json();if(!r2.ok)throw new Error((d2.error&&d2.error.message)||'이미지 생성 실패');
  var b64=d2.predictions[0].bytesBase64Encoded,bytes=atob(b64),arr=new Uint8Array(bytes.length);
  for(var i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);
  return new Blob([arr],{type:'image/png'});
}

async function generateGrokVideo(prompt,imageBlob){
  var grokKey=ST.settings.grokKey;if(!grokKey)throw new Error('xAI API 키가 필요합니다.');
  var ratio=ST.settings.ratio||'16:9';
  var body={model:'grok-imagine-video',prompt:prompt,duration:8,aspect_ratio:ratio,resolution:'720p'};
  if(imageBlob){var b64=await blobToB64(imageBlob);body.image={type:'base64',data:b64.split(',')[1],media_type:imageBlob.type||'image/png'};}
  var r=await fetch('https://api.x.ai/v1/video/generations',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+grokKey},body:JSON.stringify(body)});
  var d=await r.json();if(!r.ok)throw new Error((d.error&&d.error.message)||'Grok 영상 요청 실패');
  var jobId=d.id||d.job_id;if(!jobId)throw new Error('Job ID 없음');
  sbLog('Grok 영상 생성 중... (job: '+jobId.substring(0,8)+'...)','info');
  var startTime=Date.now();
  while(Date.now()-startTime<300000){
    await sleep(5000);
    var poll=await fetch('https://api.x.ai/v1/video/generations/'+jobId,{headers:{Authorization:'Bearer '+grokKey}});
    var pd=await poll.json();
    if(pd.status==='completed'||pd.status==='succeeded'){
      var videoUrl=pd.video&&pd.video.url||pd.url||pd.output_url;
      if(!videoUrl)throw new Error('영상 URL 없음');
      var vResp=await fetch(videoUrl);return await vResp.blob();
    }
    if(pd.status==='failed'||pd.status==='error')throw new Error('Grok 영상 생성 실패: '+(pd.error||'unknown'));
    sbLog('Grok 영상 진행 중... ('+pd.status+')','info');
  }
  throw new Error('Grok 영상 타임아웃 (5분)');
}

async function generateTTS(text){
  var eng=(el('ttsEng')||{}).value||ST.settings.ttsEngine||'gemini';
  var spd=parseFloat((el('ttsSpd')||{}).value||ST.settings.ttsSpeed||1.0);
  var voice=selVoice||ST.settings.selVoice;
  if(eng==='elevenlabs'){
    var key=ST.settings.elKey;if(!key)return browserTTS(text);
    var vid=voice||'EXAVITQu4vr4xnSDxMaL';
    var r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+vid,{method:'POST',headers:{'Content-Type':'application/json','xi-api-key':key},body:JSON.stringify({text:text,model_id:'eleven_multilingual_v2',voice_settings:{stability:.5,similarity_boost:.75,speed:spd}})});
    if(!r.ok){var e=await r.json();throw new Error((e.detail&&e.detail.message)||'ElevenLabs 오류');}
    return await r.blob();
  }
  if(eng==='gemini'||eng==='gemini31flash'){
    var key2=ST.settings.gemKey;if(!key2)return browserTTS(text);
    var vn=voice||'Kore';
    var modelId2=eng==='gemini31flash'?'gemini-3.1-flash-tts-preview':'gemini-2.5-pro-preview-tts';
    var r2=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+modelId2+':generateContent?key='+key2,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:vn}}}}})});
    var d2=await r2.json();if(!r2.ok)throw new Error((d2.error&&d2.error.message)||'Gemini TTS 오류');
    var b64=d2.candidates[0].content.parts[0].inlineData.data;
    // PCM → WAV 변환
    var pcmStr=atob(b64),pcmBytes=new Uint8Array(pcmStr.length);
    for(var pi=0;pi<pcmStr.length;pi++)pcmBytes[pi]=pcmStr.charCodeAt(pi);
    var sr=24000,ch=1,bps=16,hdr=new ArrayBuffer(44),hv=new DataView(hdr);
    [0x52,0x49,0x46,0x46].forEach(function(b,i){hv.setUint8(i,b);});
    hv.setUint32(4,36+pcmBytes.length,true);
    [0x57,0x41,0x56,0x45].forEach(function(b,i){hv.setUint8(8+i,b);});
    [0x66,0x6D,0x74,0x20].forEach(function(b,i){hv.setUint8(12+i,b);});
    hv.setUint32(16,16,true);hv.setUint16(20,1,true);hv.setUint16(22,ch,true);
    hv.setUint32(24,sr,true);hv.setUint32(28,sr*ch*bps/8,true);
    hv.setUint16(32,ch*bps/8,true);hv.setUint16(34,bps,true);
    [0x64,0x61,0x74,0x61].forEach(function(b,i){hv.setUint8(36+i,b);});
    hv.setUint32(40,pcmBytes.length,true);
    var wav=new Uint8Array(44+pcmBytes.length);wav.set(new Uint8Array(hdr),0);wav.set(pcmBytes,44);
    return new Blob([wav],{type:'audio/wav'});
  }
  if(eng==='naver'){
    // 네이버는 CORS 차단 → CapCut 로컬 서버가 연결된 경우에만 동작
    if(!serverConnected){
      sbLog('네이버 클로바: 로컬 CapCut 서버가 필요합니다. 브라우저 TTS로 대체.','warn');
      return browserTTS(text);
    }
    try{
      var cid=ST.settings.navCid,cs=ST.settings.navCs;if(!cid||!cs)return browserTTS(text);
      var spk=voice||'nara';
      // CapCut 서버를 프록시로 사용
      var r3=await fetch(CAPCUT_SERVER+'/naver_tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text,speaker:spk,client_id:cid,client_secret:cs})});
      if(!r3.ok)throw new Error('네이버 TTS 프록시 오류');
      return await r3.blob();
    }catch(e){sbLog('네이버 TTS 오류: '+e.message+'. 브라우저 TTS로 대체.','warn');return browserTTS(text);}
  }
  return browserTTS(text);
}

function browserTTS(text){
  return new Promise(function(res,rej){
    var u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';
    u.rate=parseFloat((el('ttsSpd')||{}).value||1.0);
    speechSynthesis.speak(u);
    u.onend=function(){res(new Blob([''],{type:'audio/webm'}));};
    u.onerror=function(){rej(new Error('브라우저 TTS 실패'));};
  });
}

async function testKey(type){
  if(type==='gemini'){var key=(el('gemKey')||{}).value;if(!key){alert('키를 입력하세요.');return;}try{var r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?key='+key);alert(r.ok?'✓ Gemini 연결 성공!':'✕ 키 오류 ('+r.status+')');}catch(e){alert('✕ 네트워크 오류');}}
  else if(type==='grok'){var key2=(el('grokKey')||{}).value;if(!key2){alert('키를 입력하세요.');return;}try{var r2=await fetch('https://api.x.ai/v1/models',{headers:{Authorization:'Bearer '+key2}});alert(r2.ok?'✓ xAI Grok 연결 성공!':'✕ 키 오류 ('+r2.status+')');}catch(e){alert('✕ 네트워크 오류');}}
  else if(type==='elevenlabs'){var key3=(el('elKey')||{}).value;if(!key3){alert('키를 입력하세요.');return;}try{var r3=await fetch('https://api.elevenlabs.io/v1/user',{headers:{'xi-api-key':key3}});alert(r3.ok?'✓ ElevenLabs 연결 성공!':'✕ 키 오류 ('+r3.status+')');}catch(e){alert('✕ 네트워크 오류');}}
}

function doRender(){
  alert('이미지 완성: '+(P.scenes?P.scenes.filter(function(s){return s.imgBlob;}).length:0)+'개\nTTS: '+(P.scenes?P.scenes.filter(function(s){return s.audioBlob;}).length:0)+'개\n영상: '+(P.scenes?P.scenes.filter(function(s){return s.videoBlob;}).length:0)+'개\n\n다운로드 후 FFmpeg으로 합성하거나 CapCut 서버를 사용하세요.');
}

function sbLog(text,level){
  var box=el('sbLog');if(!box)return;
  var div=document.createElement('div');div.className='l-'+(level||'info');
  div.textContent='['+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+'] '+text;
  box.appendChild(div);box.scrollTop=box.scrollHeight;
  var wrap=el('sbLogWrap');if(wrap)wrap.style.display='block';
}

function updateFlowBar(){
  var eng=(el('imgEngine')||{}).value||ST.settings.imgEngine||'gemini';
  var isGrokFlow=eng==='grok_flow',isFlow=eng==='gemini_flow';
  var bar=el('sbFlowBar');if(bar)bar.style.display=(isFlow||isGrokFlow)?'flex':'none';
  var fBar=el('flowModeBar'),gBar=el('grokModeBar');
  if(fBar)fBar.style.display=isFlow?'flex':'none';
  if(gBar)gBar.style.display=isGrokFlow?'flex':'none';
}

// ── StudioForge Automator 확장프로그램 연동 ────────
// 확장프로그램에서 생성된 이미지 URL을 받아서 씬에 적용
if (typeof window !== 'undefined') {
  window.addEventListener('message', function(e) {
    if (e.data && e.data.action === 'SF_IMAGE_DONE') {
      applyExtensionImage(e.data.sceneIdx, e.data.imageUrl);
    }
  });

  // chrome.runtime 메시지도 수신 (확장프로그램 content script 경유)
  if (window.__sfListenerAdded !== true) {
    window.__sfListenerAdded = true;
    document.addEventListener('SF_IMAGE_DONE', function(e) {
      if (e.detail) applyExtensionImage(e.detail.sceneIdx, e.detail.imageUrl, e.detail.base64);
    });
  }
}

async function applyExtensionImage(sceneIdx, imageUrl, base64) {
  if (!P.scenes || !P.scenes[sceneIdx]) return;
  try {
    var blob;
    if (base64) {
      // base64 직접 변환 (CORS 없음)
      var arr = base64.split(',');
      var mime = arr[0].match(/:(.*?);/)[1];
      var bstr = atob(arr[1]);
      var n = bstr.length;
      var u8arr = new Uint8Array(n);
      while (n--) { u8arr[n] = bstr.charCodeAt(n); }
      blob = new Blob([u8arr], { type: mime });
    } else {
      // fallback: fetch 시도
      var r = await fetch(imageUrl);
      blob = await r.blob();
    }
    P.scenes[sceneIdx].imgBlob = blob;
    P.scenes[sceneIdx].hasImg  = true;
    P.scenes[sceneIdx].status  = 'done';
    await saveBlob(P.id + '_img_' + sceneIdx, blob);
    autoSave();
    renderSB();
    sbLog('이미지 적용 완료: 장면 ' + (sceneIdx+1), 'ok');
  } catch(e) {
    sbLog('이미지 적용 오류: ' + e.message, 'err');
  }
}

// ── 캐릭터/스타일 패널 토글 ─────────────────────────
function toggleCharStylePanel(){
  var panel=el('charStylePanel'),toggle=el('charStyleToggle');
  if(!panel)return;
  var open=panel.style.display!=='none';
  panel.style.display=open?'none':'block';
  if(toggle)toggle.textContent=open?'▼ 펼치기':'▲ 접기';
}
