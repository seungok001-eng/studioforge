// StudioForge Automator — Background Service Worker v1.3

var CAPCUT_SERVER = 'http://localhost:9001';
var flowTabId = null;
var jobQueue  = [];
var results   = [];
var jobStatus = { total:0, done:0, failed:0, running:false, paused:false };

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  switch(msg.action) {
    case 'INJECTOR_READY':
      if (sender.tab && sender.tab.id) flowTabId = sender.tab.id;
      sendResponse({ ok: true });
      break;
    case 'START_JOB':
      startJob(msg.data).then(sendResponse).catch(function(e){ sendResponse({ok:false,error:e.message}); });
      return true;
    case 'PAUSE_JOB':
      jobStatus.paused = true; sendResponse({ok:true}); break;
    case 'RESUME_JOB':
      jobStatus.paused = false; processNext(); sendResponse({ok:true}); break;
    case 'STOP_JOB':
      jobQueue = []; jobStatus.running = false; jobStatus.paused = false;
      broadcastStatus(); sendResponse({ok:true}); break;
    case 'GET_STATUS':
      sendResponse({ ok:true, status: jobStatus, results: results }); break;
    case 'SCENE_DONE':
      handleSceneDone(msg.data); sendResponse({ok:true}); break;
    case 'SCENE_FAIL':
      handleSceneFail(msg.data); sendResponse({ok:true}); break;
    case 'DOWNLOAD_FILE':
      chrome.downloads.download({
        url: msg.data.url, filename: msg.data.filename,
        conflictAction: 'uniquify', saveAs: false
      }, function(id) {
        sendResponse(chrome.runtime.lastError ? {ok:false,error:chrome.runtime.lastError.message} : {ok:true,downloadId:id});
      });
      return true;
    case 'BUILD_DRAFT':
      buildCapCutDraft(msg.data).then(sendResponse).catch(function(e){ sendResponse({ok:false,error:e.message}); });
      return true;
    case 'START_VIDEO_FROM_IMAGES':
      startVideoFromImages(msg.data).then(sendResponse).catch(function(e){ sendResponse({ok:false,error:e.message}); });
      return true;
    case 'GET_IMAGE_RESULTS':
      sendResponse({ ok:true, images: results.filter(function(r){ return r.type==='image' && !r.failed; }) }); break;
  }
});

async function startJob(data) {
  jobQueue  = buildQueue(data.scenes, data.mode, data.projectName, data.settings);
  results   = [];
  jobStatus = { total:jobQueue.length, done:0, failed:0, running:true, paused:false,
                projectName:data.projectName, mode:data.mode, settings:data.settings };
  flowTabId = await openFlowTab();
  broadcastStatus();
  processNext();
  return { ok:true, total:jobQueue.length };
}

function buildQueue(scenes, mode, projectName, settings) {
  var q = [];
  if (mode === 'image') {
    scenes.forEach(function(s){ q.push({type:'image',sceneIdx:s.idx,prompt:s.imagePrompt||s.narration,narration:s.narration,projectName:projectName,settings:settings}); });
  } else if (mode === 'video') {
    scenes.forEach(function(s){ q.push({type:'video',sceneIdx:s.idx,prompt:s.videoPrompt||s.imagePrompt||s.narration,narration:s.narration,projectName:projectName,settings:settings}); });
  } else if (mode === 'both') {
    scenes.forEach(function(s){ q.push({type:'image',sceneIdx:s.idx,prompt:s.imagePrompt||s.narration,narration:s.narration,projectName:projectName,bothMode:true,settings:settings}); });
    scenes.forEach(function(s){ q.push({type:'video',sceneIdx:s.idx,prompt:s.videoPrompt||s.imagePrompt||s.narration,narration:s.narration,projectName:projectName,bothMode:true,useGeneratedImage:true,settings:settings}); });
  }
  return q;
}

async function processNext() {
  if (!jobStatus.running || jobStatus.paused) return;
  if (jobQueue.length === 0) {
    jobStatus.running = false;
    broadcastStatus();
    autoFinish();
    return;
  }
  var job = jobQueue.shift();
  broadcastStatus({ currentJob: job });
  try { await injectJobToFlow(job); }
  catch(e) { handleSceneFail({ sceneIdx:job.sceneIdx, type:job.type, error:e.message }); }
}

async function injectJobToFlow(job) {
  if (!flowTabId) flowTabId = await openFlowTab();
  var alive = false;
  try { var p = await chrome.tabs.sendMessage(flowTabId, {action:'PING'}); alive = p && p.ok; } catch(e){}
  if (!alive) {
    try { await chrome.scripting.executeScript({target:{tabId:flowTabId},files:['content/flow_injector.js']}); await sleep(1500); } catch(e){}
  }
  await chrome.tabs.sendMessage(flowTabId, { action:'GENERATE', job:job });
}

function handleSceneDone(data) {
  results.push(data);
  jobStatus.done++;
  if (data.type === 'image' && data.imageUrl) {
    var kv = {};
    kv['sf_img_' + data.sceneIdx] = { url:data.imageUrl, sceneIdx:data.sceneIdx, fileName:data.fileName };
    chrome.storage.local.set(kv);
    // base64로 변환해서 pending storage에 저장 → sf_bridge가 감지해서 StudioForge에 전달
    pushImageToStorage(data.sceneIdx, data.imageUrl);
  }
  broadcastStatus({ lastDone: data });
  setTimeout(processNext, 300);
}

// 이미지를 base64로 변환해서 storage에 저장
async function pushImageToStorage(sceneIdx, imageUrl) {
  try {
    var response = await fetch(imageUrl);
    var buffer   = await response.arrayBuffer();
    var mimeType = response.headers.get('content-type') || 'image/png';
    var bytes    = new Uint8Array(buffer);
    var binary   = '';
    bytes.forEach(function(b){ binary += String.fromCharCode(b); });
    var base64   = 'data:' + mimeType + ';base64,' + btoa(binary);

    // storage에 pending 이미지 저장 (sf_bridge가 감지)
    var kv = {};
    kv['sf_pending_' + sceneIdx] = {
      sceneIdx: sceneIdx,
      base64:   base64,
      imageUrl: imageUrl,
      ts:       Date.now()
    };
    await chrome.storage.local.set(kv);
    log('이미지 storage 저장 완료: 장면 ' + (sceneIdx+1));
  } catch(e) {
    log('pushImageToStorage 오류: ' + e.message);
  }
}

// StudioForge에 직접 메시지 전송 (fallback)
async function pushImageToStudioForge(sceneIdx, imageUrl) {
  // pushImageToStorage로 대체됨
}

async function pushImageToStudioForge(sceneIdx, imageUrl) {
  try {
    // StudioForge 탭 찾기
    var stored  = await chrome.storage.local.get('sfUrl');
    var sfUrl   = stored.sfUrl || 'https://studioforge-one.vercel.app';
    var pattern = sfUrl.replace(/^https?:\/\//, '*://') + '/*';
    var tabs    = await chrome.tabs.query({ url: pattern });
    if (!tabs.length) { log('StudioForge 탭 없음'); return; }

    var tabId = tabs[0].id;

    // sf_bridge.js 강제 주입 (이미 있어도 무시됨)
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files:  ['content/sf_bridge.js']
      });
      await sleep(300);
    } catch(e) {}

    // 이미지를 arrayBuffer로 fetch (sw에서 FileReader 대신)
    var response   = await fetch(imageUrl);
    var buffer     = await response.arrayBuffer();
    var mimeType   = response.headers.get('content-type') || 'image/png';
    var bytes      = new Uint8Array(buffer);
    var binary     = '';
    bytes.forEach(function(b){ binary += String.fromCharCode(b); });
    var base64     = 'data:' + mimeType + ';base64,' + btoa(binary);

    // StudioForge content script로 전달
    chrome.tabs.sendMessage(tabId, {
      action:   'SF_IMAGE_DONE',
      sceneIdx: sceneIdx,
      imageUrl: imageUrl,
      base64:   base64,
    }).catch(function(e){ log('SF 전달 오류: ' + e.message); });

  } catch(e) {
    log('pushImageToStudioForge 오류: ' + e.message);
  }
}

function handleSceneFail(data) {
  jobStatus.failed++;
  var d = {}; Object.assign(d, data); d.failed = true;
  results.push(d);
  broadcastStatus({ lastFailed: data });
  setTimeout(processNext, 200);
}

async function autoFinish() {
  broadcastStatus({ phase:'building_draft' });
  try {
    var r = await fetch(CAPCUT_SERVER + '/build_draft_from_downloads', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({project_name:jobStatus.projectName,results:results,settings:jobStatus.settings})
    });
    var d = await r.json();
    if (d.success) {
      broadcastStatus({ phase:'done', draftPath:d.draft_path });
      fetch(CAPCUT_SERVER + '/open_capcut', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({draft_path:d.draft_path})}).catch(function(){});
    } else {
      broadcastStatus({ phase:'draft_error', error:d.error });
    }
  } catch(e) { broadcastStatus({ phase:'draft_error', error:e.message }); }
}

async function startVideoFromImages(data) {
  var sel = data.selectedScenes || [];
  if (!sel.length) return { ok:false, error:'선택된 씬 없음' };
  jobQueue = sel.map(function(s){ return {type:'video',sceneIdx:s.sceneIdx,prompt:s.prompt||'',projectName:data.projectName||'프로젝트',settings:data.settings||{},useGeneratedImage:true,sourceImageUrl:s.imageUrl}; });
  results = results.filter(function(r){ return r.type !== 'video'; });
  jobStatus = { total:jobQueue.length, done:0, failed:0, running:true, paused:false, projectName:data.projectName, mode:'video_from_images', settings:data.settings };
  flowTabId = await openFlowTab();
  broadcastStatus();
  processNext();
  return { ok:true, total:jobQueue.length };
}

async function buildCapCutDraft(data) {
  var serverUrl = data.server_url || CAPCUT_SERVER;
  log('Draft 요청: ' + serverUrl + '/build_draft_from_downloads');

  var payload = {
    project_name: data.project_name || '프로젝트',
    results:      results,
    settings:     jobStatus.settings || {}
  };

  // ── 1순위: sw.js에서 직접 fetch (localhost는 host_permissions에 등록됨) ──
  try {
    var r2 = await fetch(serverUrl + '/build_draft_from_downloads', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    var d = await r2.json();
    log('Draft 응답: ' + JSON.stringify(d).substring(0,100));
    return d;
  } catch(e) {
    log('sw.js 직접 fetch 실패: ' + e.message + ' → SF 탭 경유 시도');
  }

  // ── 2순위: StudioForge 탭 경유 (content script에서 fetch) ──
  try {
    var stored = await chrome.storage.local.get('sfUrl');
    var sfUrl  = stored.sfUrl || 'https://studioforge-one.vercel.app';
    var pattern = sfUrl.replace(/^https?:\/\//, '*://') + '/*';
    var tabs = await chrome.tabs.query({ url: pattern });

    // StudioForge 탭이 없으면 자동 생성 (백그라운드)
    var tabCreated = false;
    if (!tabs.length) {
      log('StudioForge 탭 없음 → 자동 생성');
      var newTab = await chrome.tabs.create({ url: sfUrl, active: false });
      tabs = [newTab];
      tabCreated = true;
      // 페이지 로딩 대기 (최대 10초)
      await new Promise(function(resolve){
        var checks = 0;
        var timer = setInterval(async function(){
          checks++;
          try {
            var t = await chrome.tabs.get(newTab.id);
            if (t.status === 'complete' || checks > 20) {
              clearInterval(timer);
              resolve();
            }
          } catch(e) { clearInterval(timer); resolve(); }
        }, 500);
      });
      await sleep(500);
    }

    if (tabs.length) {
      var tabId = tabs[0].id;
      try {
        await chrome.scripting.executeScript({
          target:{tabId:tabId},
          files:['content/sf_bridge.js']
        });
        await sleep(300);
      } catch(e) {}

      var r = await chrome.tabs.sendMessage(tabId, {
        action: 'FETCH_CAPCUT',
        url:    serverUrl + '/build_draft_from_downloads',
        method: 'POST',
        body:   payload
      });

      // 자동 생성한 탭은 닫기
      if (tabCreated) {
        setTimeout(function(){ chrome.tabs.remove(tabId).catch(function(){}); }, 1000);
      }

      if (r && r.ok && r.data) {
        log('Draft 응답 (SF 경유): ' + JSON.stringify(r.data).substring(0,100));
        return r.data;
      }
      return {
        success: false,
        error: 'SF 탭 경유 실패: ' + (r && r.error || '응답 없음')
      };
    }
  } catch(e) {
    log('SF 경유 오류: ' + e.message);
    return {
      success: false,
      error: 'CapCut 서버 연결 실패: ' + e.message + '\n\n확인 사항:\n1) server.py 실행 중?\n2) http://localhost:9001/status 접속 시 {"status":"ok"} 표시되는지?\n3) Chrome 주소창에 localhost:9001/status 직접 열어보세요'
    };
  }

  return {
    success: false,
    error: 'CapCut 서버 연결 실패.\n\n확인 사항:\n1) server.py 실행 중?\n2) http://localhost:9001/status 접속 시 {"status":"ok"} 표시되는지?'
  };
}

async function openFlowTab() {
  var FLOW_URL = 'https://labs.google/fx/ko/tools/flow';
  var tabs = await chrome.tabs.query({ url:'https://labs.google/*' });
  var tabId;
  if (tabs.length > 0) {
    tabId = tabs[0].id;
  } else {
    var tab = await chrome.tabs.create({ url:FLOW_URL, active:false });
    tabId = tab.id;
    await sleep(3000);
  }
  var alive = false;
  try { var p = await chrome.tabs.sendMessage(tabId, {action:'PING'}); alive = p && p.ok; } catch(e){}
  if (!alive) {
    try { await chrome.scripting.executeScript({target:{tabId:tabId},files:['content/flow_injector.js']}); await sleep(1000); } catch(e){}
  }
  return tabId;
}

function broadcastStatus(extra) {
  var s = {}; Object.assign(s, jobStatus); Object.assign(s, extra||{});
  chrome.runtime.sendMessage({ action:'STATUS_UPDATE', status:s, results:results }).catch(function(){});
}

chrome.downloads.onChanged.addListener(function(delta) {
  if (delta.state && delta.state.current === 'complete' && flowTabId) {
    chrome.tabs.sendMessage(flowTabId, {action:'DOWNLOAD_COMPLETE',downloadId:delta.id}).catch(function(){});
  }
});

function sleep(ms) { return new Promise(function(r){ setTimeout(r,ms); }); }
function log(msg)  { console.log('%c[SW] '+msg,'color:#00d4ff;font-weight:bold'); }

// ── 아이콘 클릭 시 사이드패널 열기 ────────────────
chrome.action.onClicked.addListener(function(tab) {
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(function(){});
});

// 설치/업데이트 시 사이드패널 기본 활성화
chrome.runtime.onInstalled.addListener(function() {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(function(){});
});
