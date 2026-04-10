import crypto from "crypto";

export const dynamic = "force-dynamic";

function decryptBotId(token) {
  const secret = process.env.WIDGET_SECRET;
  if (!secret) throw new Error("WIDGET_SECRET is not configured");
  const key = crypto.scryptSync(secret, "doodleai-embed-salt", 32);
  const buf = Buffer.from(token, "base64url");
  const iv = buf.subarray(0, 16);
  const encrypted = buf.subarray(16);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const token = searchParams.get("token");
  let botId = searchParams.get("botId") || "";

  if (token) {
    try {
      botId = decryptBotId(token);
    } catch {
      return new Response("// Invalid or tampered token", {
        headers: { "Content-Type": "application/javascript" },
      });
    }
  }

  if (!botId) {
    return new Response("// Missing token or botId", {
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

  var BOT_ID  = ${JSON.stringify(botId)};
  var API     = ${JSON.stringify(apiUrl)};
  var domain  = window.location.hostname;
  var sessionId = null;
  var messages  = [];
  var view      = 'quick'; // 'quick' | 'chat'

  /* ── Shared SVG defs (gradient + clip) injected once into the page ── */
  var _defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  _defs.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;');
  _defs.innerHTML = '<defs>' +
    '<linearGradient id="daiGrad" x1="8" x2="94.4" y1="8" y2="94.4" gradientUnits="userSpaceOnUse">' +
    '<stop stop-color="#8B5CF6"/><stop offset="1" stop-color="#6D28D9"/></linearGradient>' +
    '<clipPath id="daiClip"><path fill="#fff" d="M0 0h80v80H0z"/></clipPath>' +
    '</defs>';
  document.body.appendChild(_defs);

  /* ── Global styles ── */
  var _style = document.createElement('style');
  _style.textContent = [
    '#doodleai-widget-root * { box-sizing:border-box; margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }',
    '#doodleai-chat-body::-webkit-scrollbar { width:4px; }',
    '#doodleai-chat-body::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:2px; }',
    '#doodleai-chat-inp:focus { outline:none; }',
    '#doodleai-chat-inp::placeholder { color:#9ca3af; }',
    '@keyframes daiFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }',
    '@keyframes daiPing  { 0%,100%{transform:scale(1);opacity:0.25} 50%{transform:scale(1.15);opacity:0.1} }',
    '@keyframes daiSpin  { to{transform:rotate(360deg)} }',
    '@keyframes daiFadeUp{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }',
  ].join('\\n');
  document.head.appendChild(_style);

  /* ── Fetch bot config then build UI ── */
  fetch(API + '/api/chatbots/public/' + BOT_ID + '?domain=' + encodeURIComponent(domain))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (cfg) { if (cfg) build(cfg); })
    .catch(function () {});

  /* ════════════════════════════════════════════════════════════════ */
  function build(cfg) {
    var color    = cfg.primaryColor   || '#7c3aed';
    var botName  = cfg.botName        || 'Support Assistant';
    var welcome  = cfg.welcomeMessage || 'Hello! How can I help you today?';
    var pos      = cfg.position       || 'bottom-right';
    var qrs      = cfg.quickReplies   || [];
    var faqs     = cfg.faqs           || [];
    var autoOpen = cfg.autoOpen       || false;

    var isRight  = pos.indexOf('right')  !== -1;
    var isBottom = pos.indexOf('bottom') !== -1;
    var hEdge    = isRight  ? 'right:24px'  : 'left:24px';
    var vEdge    = isBottom ? 'bottom:24px' : 'top:24px';
    var pVEdge   = isBottom ? 'bottom:104px': 'top:104px';

    /* Root (pointer-events:none so it never blocks page clicks) */
    var root = mk('div', 'position:fixed;z-index:2147483646;pointer-events:none;top:0;left:0;width:0;height:0;');
    root.id = 'doodleai-widget-root';
    document.body.appendChild(root);

    /* ── Toggle button ── */
    var toggleBtn = mk('button',
      'position:fixed;z-index:2147483647;pointer-events:auto;background:transparent;border:0;padding:0;cursor:pointer;' +
      hEdge + ';' + vEdge);
    toggleBtn.innerHTML =
      '<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;">' +
        '<span style="position:absolute;inset:0;border-radius:50%;background:rgba(139,92,246,0.2);animation:daiPing 2s ease infinite;"></span>' +
        '<div style="position:relative;animation:daiFloat 3s ease-in-out infinite;">' + botSvg(80) + '</div>' +
      '</div>';
    root.appendChild(toggleBtn);

    /* ── Panel ── */
    var panel = mk('div',
      'position:fixed;z-index:2147483646;pointer-events:auto;width:380px;max-width:calc(100vw - 32px);' +
      'height:560px;background:#fff;border-radius:24px;' +
      'box-shadow:0 25px 60px rgba(0,0,0,0.18);display:none;flex-direction:column;overflow:hidden;' +
      hEdge + ';' + pVEdge);
    root.appendChild(panel);

    /* Header */
    var hdr = mk('div',
      'background:linear-gradient(135deg,' + color + ',' + color + 'cc);' +
      'padding:16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;');
    var hdrL = mk('div', 'display:flex;align-items:center;gap:12px;');
    var avWrap = mk('div', 'position:relative;flex-shrink:0;');
    avWrap.innerHTML = botSvg(44) +
      '<div style="position:absolute;bottom:0;right:0;width:12px;height:12px;background:#4ade80;border-radius:50%;border:2px solid #fff;"></div>';
    var hdrTxt = mk('div', '');
    hdrTxt.innerHTML =
      '<div style="color:#fff;font-weight:600;font-size:14px;line-height:1.3;">' + esc(botName) + '</div>' +
      '<div style="display:flex;align-items:center;gap:4px;margin-top:3px;">' +
        '<div style="width:8px;height:8px;background:#4ade80;border-radius:50%;"></div>' +
        '<div style="color:rgba(255,255,255,0.8);font-size:12px;">Online</div>' +
      '</div>';
    hdrL.appendChild(avWrap);
    hdrL.appendChild(hdrTxt);
    var closeBtn = mk('button',
      'width:32px;height:32px;background:rgba(255,255,255,0.2);border:none;cursor:pointer;' +
      'border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;');
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    hdr.appendChild(hdrL);
    hdr.appendChild(closeBtn);
    panel.appendChild(hdr);

    /* Scrollable body */
    var chatBody = mk('div', 'flex:1;overflow-y:auto;background:#f9fafb;');
    chatBody.id = 'doodleai-chat-body';
    panel.appendChild(chatBody);

    /* Input area */
    var inputArea = mk('div', 'padding:16px;background:#fff;border-top:1px solid #f3f4f6;flex-shrink:0;');
    var backBtn = mk('button', 'background:none;border:none;cursor:pointer;color:#9ca3af;font-size:12px;margin-bottom:8px;display:none;padding:0;');
    backBtn.textContent = '\u2190 Back to menu';
    backBtn.onmouseover = function () { backBtn.style.color = '#6b7280'; };
    backBtn.onmouseout  = function () { backBtn.style.color = '#9ca3af'; };
    var inputRow = mk('div', 'display:flex;gap:8px;align-items:center;');
    var inp = mk('input', 'flex:1;border:1.5px solid #e5e7eb;background:#f9fafb;color:#111827;border-radius:9999px;padding:10px 16px;font-size:13px;');
    inp.id = 'doodleai-chat-inp';
    inp.type = 'text';
    inp.placeholder = 'Type a message...';
    inp.onfocus = function () { inp.style.borderColor = color; };
    inp.onblur  = function () { inp.style.borderColor = '#e5e7eb'; };
    var sendBtn = mk('button',
      'width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;flex-shrink:0;background:' + color + ';');
    sendBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    inputRow.appendChild(inp);
    inputRow.appendChild(sendBtn);
    inputArea.appendChild(backBtn);
    inputArea.appendChild(inputRow);
    panel.appendChild(inputArea);

    /* ── View: Quick ── */
    function showQuick() {
      view = 'quick';
      backBtn.style.display = 'none';
      chatBody.innerHTML = '';

      var inner = mk('div', 'padding:16px;');

      /* Welcome bubble */
      var wRow = mk('div', 'display:flex;gap:12px;margin-bottom:20px;align-items:flex-start;');
      var wAvatar = mk('div', 'flex-shrink:0;');
      wAvatar.innerHTML = botSvg(36);
      var wBubble = mk('div',
        'background:#fff;border-radius:16px 16px 16px 4px;padding:12px 16px;' +
        'box-shadow:0 1px 4px rgba(0,0,0,0.08);max-width:80%;');
      var wText = mk('p', 'color:#1f2937;font-size:13px;line-height:1.5;');
      wText.textContent = welcome;
      wBubble.appendChild(wText);
      wRow.appendChild(wAvatar);
      wRow.appendChild(wBubble);
      inner.appendChild(wRow);

      /* "How can we help?" */
      var heading = mk('p', 'font-weight:600;font-size:14px;margin-bottom:12px;color:' + color + ';');
      heading.textContent = 'How can we help you?';
      inner.appendChild(heading);

      /* Quick reply buttons */
      var questions = qrs.length > 0 ? qrs : faqs;
      if (questions.length > 0) {
        var qSec = mk('div', 'margin-bottom:8px;');
        var qLbl = mk('div', 'display:flex;align-items:center;gap:6px;color:#6b7280;font-size:12px;margin-bottom:8px;');
        qLbl.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
          '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
          '<span>Common Questions</span>';
        qSec.appendChild(qLbl);
        questions.forEach(function (qr) {
          var question = typeof qr === 'string' ? qr : qr.question;
          var answer   = typeof qr === 'object' && qr.answer ? qr.answer : null;
          qSec.appendChild(qBtn(question, color, function () {
            if (answer) {
              showChat();
              addMsg('user', question);
              addMsg('assistant', answer);
            } else {
              showChat();
              send(question);
            }
          }));
        });
        inner.appendChild(qSec);
      }

      chatBody.appendChild(inner);
    }

    /* ── View: Chat ── */
    function showChat() {
      view = 'chat';
      backBtn.style.display = 'block';
      chatBody.innerHTML = '';
      var msgsDiv = mk('div', 'padding:16px;display:flex;flex-direction:column;gap:16px;');
      msgsDiv.id = 'doodleai-msgs';
      chatBody.appendChild(msgsDiv);
      messages.forEach(function (m) { renderMsg(msgsDiv, m.role, m.content, m.time); });
      scrollDown();
    }

    function addMsg(role, content) {
      var m = { role: role, content: content, time: new Date() };
      messages.push(m);
      if (view === 'chat') {
        var msgsDiv = document.getElementById('doodleai-msgs');
        if (msgsDiv) { renderMsg(msgsDiv, role, content, m.time); scrollDown(); }
      }
    }

    function renderMsg(container, role, content, time) {
      var isUser = role === 'user';
      var row = mk('div', 'display:flex;gap:12px;' + (isUser ? 'flex-direction:row-reverse;' : ''));

      /* Avatar */
      var avatar = mk('div', 'flex-shrink:0;');
      if (isUser) {
        avatar.style.cssText =
          'width:36px;height:36px;border-radius:50%;background:#e5e7eb;' +
          'display:flex;align-items:center;justify-content:center;flex-shrink:0;';
        avatar.innerHTML = '<span style="color:#6b7280;font-size:12px;font-weight:600;">U</span>';
      } else {
        avatar.innerHTML = botSvg(36);
      }

      /* Bubble + timestamp */
      var col = mk('div', 'display:flex;flex-direction:column;max-width:72%;');
      var bubble = mk('div', isUser
        ? 'border-radius:16px 4px 16px 16px;padding:12px 16px;font-size:13px;line-height:1.5;color:#fff;word-break:break-word;background:' + color + ';'
        : 'border-radius:4px 16px 16px 16px;padding:12px 16px;font-size:13px;line-height:1.5;color:#1f2937;word-break:break-word;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.08);');
      bubble.textContent = content;
      var ts = mk('span', 'font-size:11px;color:#9ca3af;margin-top:4px;padding:0 4px;' + (isUser ? 'text-align:right;' : ''));
      ts.textContent = fmtTime(time);

      col.appendChild(bubble);
      col.appendChild(ts);
      row.appendChild(avatar);
      row.appendChild(col);
      container.appendChild(row);
    }

    function showTyping() {
      var msgsDiv = document.getElementById('doodleai-msgs');
      if (!msgsDiv) return null;
      var row = mk('div', 'display:flex;gap:12px;');
      var av = mk('div', 'flex-shrink:0;');
      av.innerHTML = botSvg(36);
      var bubble = mk('div',
        'border-radius:4px 16px 16px 16px;padding:12px 16px;background:#fff;' +
        'box-shadow:0 1px 4px rgba(0,0,0,0.08);display:flex;align-items:center;gap:6px;');
      bubble.innerHTML =
        '<svg style="animation:daiSpin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>' +
        '<span style="color:#9ca3af;font-size:13px;">Typing...</span>';
      row.appendChild(av);
      row.appendChild(bubble);
      msgsDiv.appendChild(row);
      scrollDown();
      return row;
    }

    /* ── Send message ── */
    function send(text) {
      addMsg('user', text);
      var typing = showTyping();
      fetch(API + '/api/widget/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionId, botId: BOT_ID, domain: domain }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          sessionId = data.sessionId;
          if (typing) typing.remove();
          addMsg('assistant', data.reply || 'Sorry, no response.');
        })
        .catch(function () {
          if (typing) typing.remove();
          addMsg('assistant', "Sorry, I'm having trouble responding. Please try again.");
        });
    }

    /* ── Toggle open/close ── */
    var isOpen = false;
    function toggle() {
      isOpen = !isOpen;
      if (isOpen) {
        panel.style.display = 'flex';
        panel.style.animation = 'daiFadeUp 0.2s ease';
        if (view === 'chat') showChat(); else showQuick();
        setTimeout(function () { inp.focus(); }, 250);
      } else {
        panel.style.display = 'none';
      }
    }

    toggleBtn.onclick = toggle;
    closeBtn.onclick  = toggle;
    backBtn.onclick   = function () { showQuick(); };
    sendBtn.onclick   = function () {
      var txt = inp.value.trim();
      if (!txt) return;
      inp.value = '';
      if (view !== 'chat') showChat();
      send(txt);
    };
    inp.onkeydown = function (e) { if (e.key === 'Enter') sendBtn.click(); };
    if (autoOpen) toggle();
  }

  /* ── Utilities ── */
  function scrollDown() {
    var b = document.getElementById('doodleai-chat-body');
    if (b) setTimeout(function () { b.scrollTop = b.scrollHeight; }, 30);
  }

  function fmtTime(d) {
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function mk(tag, style) {
    var e = document.createElement(tag);
    if (style) e.style.cssText = style;
    return e;
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function qBtn(label, color, onClick) {
    var rgba = hex2rgba(color, 0.1);
    var btn = mk('button',
      'width:100%;text-align:left;border-radius:8px;padding:12px 16px;font-size:13px;' +
      'cursor:pointer;display:flex;align-items:center;justify-content:space-between;' +
      'border:none;margin-bottom:8px;background:' + rgba + ';color:' + color + ';');
    btn.innerHTML =
      '<span>' + esc(label) + '</span>' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    btn.onmouseover = function () { btn.style.background = color; btn.style.color = '#fff'; };
    btn.onmouseout  = function () { btn.style.background = rgba; btn.style.color = color; };
    btn.onclick = onClick;
    return btn;
  }

  function hex2rgba(hex, a) {
    if (!hex || hex[0] !== '#' || hex.length < 7) return 'rgba(124,58,237,' + a + ')';
    var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  /* Bot SVG — same illustration used in the dashboard preview */
  function botSvg(size) {
    var s = String(size);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" fill="none" viewBox="0 0 80 80">' +
      '<g clip-path="url(#daiClip)">' +
      '<path stroke="#8B5CF6" stroke-width="1.2" d="M40 79c21.54 0 39-17.46 39-39S61.54 1 40 1 1 18.46 1 40s17.46 39 39 39Z" opacity="0.3"/>' +
      '<path stroke="#8B5CF6" stroke-width="0.6" d="M40 75c19.33 0 35-15.67 35-35S59.33 5 40 5 5 20.67 5 40s15.67 35 35 35Z" opacity="0.15"/>' +
      '<path fill="url(#daiGrad)" d="M40 72c17.673 0 32-14.327 32-32S57.673 8 40 8 8 22.327 8 40s14.327 32 32 32"/>' +
      '<path fill="#fff" d="M40 49c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15" opacity="0.96"/>' +
      '<path fill="#7C3AED" d="M34 32.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6M46 32.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6"/>' +
      '<path fill="#fff" d="M35 29.8a1 1 0 1 0 0-2 1 1 0 0 0 0 2M47 29.8a1 1 0 1 0 0-2 1 1 0 0 0 0 2" opacity="0.9"/>' +
      '<path stroke="#7C3AED" stroke-linecap="round" stroke-width="1.8" d="M34 37q6 5 12 0"/>' +
      '<path stroke="#DDD6FE" stroke-linecap="round" stroke-width="1.8" d="M40 19v-6"/>' +
      '<path fill="#EDE9FE" d="M40 13.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6"/>' +
      '<path fill="#A78BFA" d="M40 14.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8"/>' +
      '<path fill="#fff" fill-opacity="0.45" d="M27 30a2 2 0 1 0-4 0v4a2 2 0 1 0 4 0zM57 30a2 2 0 1 0-4 0v4a2 2 0 1 0 4 0z"/>' +
      '<path fill="#fff" fill-opacity="0.2" d="M50 51H30a8 8 0 1 0 0 16h20a8 8 0 1 0 0-16"/>' +
      '<path fill="#fff" fill-opacity="0.2" d="m28 51-5 10 9-10"/>' +
      '<path fill="#fff" d="M31 61.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4" opacity="0.9"/>' +
      '<path fill="#fff" d="M40 61.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4" opacity="0.6"/>' +
      '<path fill="#fff" d="M49 61.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4" opacity="0.3"/>' +
      '</g></svg>';
  }
})();
`;
}
