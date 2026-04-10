export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId") || "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  if (!botId) {
    return new Response("// Missing botId", {
      headers: { "Content-Type": "application/javascript" },
    });
  }

  const js = widgetScript(botId, apiUrl);

  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function widgetScript(botId, apiUrl) {
  return `(function () {
  if (document.getElementById('doodleai-widget-root')) return;

  var BOT_ID = ${JSON.stringify(botId)};
  var API = ${JSON.stringify(apiUrl)};
  var domain = window.location.hostname;
  var sessionId = null;

  // Inject scoped styles
  var style = document.createElement('style');
  style.textContent = [
    '#doodleai-widget-root * { box-sizing: border-box; margin: 0; padding: 0; }',
    '#doodleai-msgs::-webkit-scrollbar { width: 4px; }',
    '#doodleai-msgs::-webkit-scrollbar-track { background: transparent; }',
    '#doodleai-msgs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }',
    '#doodleai-input::placeholder { color: rgba(255,255,255,0.35); }',
    '#doodleai-input:focus { outline: none; }',
    '@keyframes doodleai-fade-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }',
    '.doodleai-panel-open { animation: doodleai-fade-in 0.2s ease; }',
  ].join('\\n');
  document.head.appendChild(style);

  fetch(API + '/api/chatbots/public/' + BOT_ID + '?domain=' + encodeURIComponent(domain))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (cfg) { if (cfg) init(cfg); })
    .catch(function () {});

  function init(cfg) {
    var color    = cfg.primaryColor   || '#7c3aed';
    var botName  = cfg.botName        || 'Support Assistant';
    var welcome  = cfg.welcomeMessage || 'Hello! How can I help you today?';
    var pos      = cfg.position       || 'bottom-right';
    var qrs      = cfg.quickReplies   || [];
    var autoOpen = cfg.autoOpen       || false;

    var isRight  = pos.indexOf('right') !== -1;
    var isBottom = pos.indexOf('bottom') !== -1;
    var edgeH    = isRight  ? 'right:24px'  : 'left:24px';
    var edgeV    = isBottom ? 'bottom:24px' : 'top:24px';
    var panelH   = isRight  ? 'right:24px'  : 'left:24px';
    var panelV   = isBottom ? 'bottom:88px' : 'top:88px';

    // Root container (pointer-events:none so it never blocks clicks when closed)
    var root = el('div', { id: 'doodleai-widget-root',
      style: 'position:fixed;z-index:2147483646;pointer-events:none;' });
    document.body.appendChild(root);

    // ── Toggle button ──────────────────────────────────────────────
    var btn = el('button', {
      style: css({
        position:'fixed', zIndex:2147483647, pointerEvents:'auto',
        width:'56px', height:'56px', borderRadius:'50%',
        background:color, border:'none', cursor:'pointer',
        boxShadow:'0 4px 20px rgba(0,0,0,0.35)',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'transform 0.2s ease',
      }, edgeH, edgeV),
    });
    btn.innerHTML = iconChat();
    btn.onmouseover = function () { btn.style.transform = 'scale(1.08)'; };
    btn.onmouseout  = function () { btn.style.transform = 'scale(1)'; };
    root.appendChild(btn);

    // ── Panel ──────────────────────────────────────────────────────
    var panel = el('div', {
      style: css({
        position:'fixed', zIndex:2147483646, pointerEvents:'auto',
        width:'360px', maxHeight:'540px',
        background:'#1a1a2e', borderRadius:'16px',
        boxShadow:'0 12px 48px rgba(0,0,0,0.5)',
        display:'none', flexDirection:'column', overflow:'hidden',
        border:'1px solid rgba(124,58,237,0.25)',
      }, panelH, panelV),
    });
    root.appendChild(panel);

    // Header
    var hdr = el('div', {
      style: css({ background:color, padding:'14px 16px',
        display:'flex', alignItems:'center', gap:'10px', flexShrink:'0' }),
    });
    hdr.innerHTML =
      '<div style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + iconBot() + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="color:#fff;font-weight:600;font-size:13px;line-height:1.3;">' + esc(botName) + '</div>' +
        '<div style="color:rgba(255,255,255,0.65);font-size:11px;">Online</div>' +
      '</div>' +
      '<button id="doodleai-close-btn" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.75);padding:4px;line-height:0;flex-shrink:0;">' + iconX() + '</button>';
    panel.appendChild(hdr);

    // Messages
    var msgs = el('div', { id:'doodleai-msgs',
      style: css({ flex:'1', overflowY:'auto', padding:'14px',
        display:'flex', flexDirection:'column', gap:'8px', minHeight:'0' }),
    });
    panel.appendChild(msgs);
    appendBotMsg(msgs, welcome, color);

    // Quick replies
    if (qrs.length > 0) {
      var qrWrap = el('div', { style:'padding:0 14px 10px;display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0;' });
      qrs.forEach(function (qr) {
        var qrBtn = el('button', {
          style: css({ background:'transparent', border:'1px solid '+color,
            color:color, padding:'5px 13px', borderRadius:'20px',
            fontSize:'12px', cursor:'pointer', transition:'all 0.15s',
            lineHeight:'1.4', pointerEvents:'auto' }),
        });
        qrBtn.textContent = qr.question;
        qrBtn.onmouseover = function () { qrBtn.style.background = color; qrBtn.style.color = '#fff'; };
        qrBtn.onmouseout  = function () { qrBtn.style.background = 'transparent'; qrBtn.style.color = color; };
        qrBtn.onclick = function () {
          qrWrap.style.display = 'none';
          if (qr.answer) {
            appendUserMsg(msgs, qr.question, color);
            appendBotMsg(msgs, qr.answer, color);
            scrollBottom(msgs);
          } else {
            send(qr.question, msgs, color);
          }
        };
        qrWrap.appendChild(qrBtn);
      });
      panel.appendChild(qrWrap);
    }

    // Input bar
    var bar = el('div', {
      style: css({ padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.07)',
        display:'flex', gap:'8px', alignItems:'center', flexShrink:'0',
        background:'rgba(0,0,0,0.25)' }),
    });
    var inp = el('input', {
      id:'doodleai-input', type:'text', placeholder:'Type a message…',
      style: css({ flex:'1', background:'rgba(255,255,255,0.07)',
        border:'1px solid rgba(255,255,255,0.1)', color:'#fff',
        borderRadius:'10px', padding:'9px 13px', fontSize:'13px' }),
    });
    inp.onfocus = function () { inp.style.borderColor = color; };
    inp.onblur  = function () { inp.style.borderColor = 'rgba(255,255,255,0.1)'; };

    var sendBtn = el('button', {
      style: css({ width:'38px', height:'38px', borderRadius:'10px',
        background:color, border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:'0',
        transition:'opacity 0.15s' }),
    });
    sendBtn.innerHTML = iconSend();
    sendBtn.onmouseover = function () { sendBtn.style.opacity = '0.85'; };
    sendBtn.onmouseout  = function () { sendBtn.style.opacity = '1'; };

    bar.appendChild(inp);
    bar.appendChild(sendBtn);
    panel.appendChild(bar);

    // ── Interactions ───────────────────────────────────────────────
    var isOpen = false;

    function toggle() {
      isOpen = !isOpen;
      if (isOpen) {
        panel.style.display = 'flex';
        panel.classList.add('doodleai-panel-open');
        btn.innerHTML = iconX();
        root.style.pointerEvents = 'none'; // root still transparent
        inp.focus();
        scrollBottom(msgs);
      } else {
        panel.style.display = 'none';
        btn.innerHTML = iconChat();
      }
    }

    btn.onclick = toggle;
    hdr.querySelector('#doodleai-close-btn').onclick = toggle;
    sendBtn.onclick = function () {
      var txt = inp.value.trim();
      if (!txt) return;
      inp.value = '';
      send(txt, msgs, color);
    };
    inp.onkeydown = function (e) { if (e.key === 'Enter') sendBtn.click(); };

    if (autoOpen) toggle();
  }

  // ── Messaging ─────────────────────────────────────────────────────
  function send(text, msgs, color) {
    appendUserMsg(msgs, text, color);
    var typing = appendTyping(msgs);
    scrollBottom(msgs);

    fetch(API + '/api/widget/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId: sessionId, botId: BOT_ID, domain: domain }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        sessionId = data.sessionId;
        typing.remove();
        appendBotMsg(msgs, data.reply || 'Sorry, no response.', color);
        scrollBottom(msgs);
      })
      .catch(function () {
        typing.remove();
        appendBotMsg(msgs, "Sorry, I'm having trouble responding. Please try again.", color);
        scrollBottom(msgs);
      });
  }

  function appendUserMsg(container, text, color) {
    var w = el('div', { style: 'display:flex;justify-content:flex-end;' });
    var b = el('div', { style: css({
      maxWidth:'80%', padding:'9px 13px', borderRadius:'16px 4px 16px 16px',
      background:color, color:'#fff', fontSize:'13px', lineHeight:'1.5', wordBreak:'break-word',
    }) });
    b.textContent = text;
    w.appendChild(b);
    container.appendChild(w);
  }

  function appendBotMsg(container, text, color) {
    var w = el('div', { style: 'display:flex;justify-content:flex-start;' });
    var b = el('div', { style: css({
      maxWidth:'82%', padding:'9px 13px', borderRadius:'4px 16px 16px 16px',
      background:'rgba(255,255,255,0.09)', color:'#e5e5e5',
      fontSize:'13px', lineHeight:'1.5', wordBreak:'break-word',
    }) });
    b.textContent = text;
    w.appendChild(b);
    container.appendChild(w);
    return w;
  }

  function appendTyping(container) {
    var w = el('div', { style: 'display:flex;justify-content:flex-start;' });
    var b = el('div', { style: 'padding:9px 13px;border-radius:4px 16px 16px 16px;background:rgba(255,255,255,0.09);' });
    b.innerHTML = '<span style="display:inline-flex;gap:3px;align-items:center;">' +
      '<span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);animation:doodleai-fade-in 0.6s ease infinite alternate;"></span>' +
      '<span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);animation:doodleai-fade-in 0.6s ease 0.2s infinite alternate;"></span>' +
      '<span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);animation:doodleai-fade-in 0.6s ease 0.4s infinite alternate;"></span>' +
    '</span>';
    w.appendChild(b);
    container.appendChild(w);
    return w;
  }

  function scrollBottom(el) {
    setTimeout(function () { el.scrollTop = el.scrollHeight; }, 30);
  }

  // ── Helpers ────────────────────────────────────────────────────────
  function el(tag, attrs) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'style') { e.style.cssText = attrs[k]; }
      else { e[k] = attrs[k]; }
    });
    return e;
  }

  function css(obj) {
    var extra = [].slice.call(arguments, 1);
    var parts = Object.keys(obj).map(function (k) {
      var prop = k.replace(/([A-Z])/g, function (m) { return '-' + m.toLowerCase(); });
      return prop + ':' + obj[k];
    });
    extra.forEach(function (s) { if (s) parts.push(s); });
    return parts.join(';');
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function iconChat() {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  }
  function iconX() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }
  function iconSend() {
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  }
  function iconBot() {
    return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/><circle cx="8.5" cy="16" r="1" fill="white"/><circle cx="15.5" cy="16" r="1" fill="white"/></svg>';
  }
})();
`;
}
