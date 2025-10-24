import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Fancy Text Styler extension is activating...');
  
  const provider = new FancyTextViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('fancyText-view', provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('fancyText.open', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.fancyText-container');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('fancyText.insertSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      const selected = editor && !editor.selection.isEmpty
        ? editor.document.getText(editor.selection)
        : (await vscode.window.showInputBox({ prompt: 'Enter text to style' })) || '';
      provider.postPrefill(selected);
      await vscode.commands.executeCommand('workbench.view.extension.fancyText-container');
    })
  );
  
  console.log('Fancy Text Styler extension activated');
}

export function deactivate() {}

class FancyTextViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    console.log('Resolving webview view');
    
    this._view = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this.getHtmlContent();
    
    webviewView.webview.onDidReceiveMessage(message => {
      switch (message.type) {
        case 'copy':
          vscode.env.clipboard.writeText(message.text);
          vscode.window.setStatusBarMessage('✅ Copied to clipboard!', 1500);
          break;
        case 'insert':
          const editor = vscode.window.activeTextEditor;
          if (editor && message.text) {
            editor.edit(editBuilder => {
              editBuilder.replace(editor.selection, message.text);
            });
          }
          break;
      }
    });
    
    console.log('Webview view resolved');
  }

  private getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fancy Text Styler</title>
  <style>
    :root { --gap: 10px; }
    body { 
      margin: 0; 
      font-family: var(--vscode-font-family); 
      color: var(--vscode-foreground);
      background: var(--vscode-sidebar-background);
    }
    .wrap { padding: 10px; display: grid; gap: var(--gap); }
    h2 { margin: 0; font-size: 16px; }
    textarea#src { 
      width: 100%; 
      min-height: 70px; 
      resize: vertical; 
      padding: 8px; 
      border-radius: 4px; 
      border: 1px solid var(--vscode-input-border); 
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      font-size: 13px; 
    }
    .toolbar { display: flex; gap: var(--gap); }
    .toolbar button { 
      padding: 6px 10px; 
      border-radius: 4px; 
      border: 1px solid var(--vscode-button-border); 
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground); 
      cursor: pointer; 
    }
    .toolbar button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .results { display: grid; grid-template-columns: 1fr; gap: var(--gap); }
    .card { 
      border: 1px solid var(--vscode-panel-border); 
      border-radius: 6px; 
      padding: 8px; 
      background: var(--vscode-list-hoverBackground);
    }
    .card .top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .variant { 
      font-size: 14px; 
      line-height: 1.45; 
      word-break: break-word; 
      user-select: text;
      cursor: pointer;
      flex: 1;
    }
    .variant:hover { opacity: 0.8; }
    .meta { font-size: 11px; opacity: 0.75; margin-top: 6px; }
    .copy, .insert { 
      padding: 4px 8px; 
      border-radius: 4px; 
      border: 1px solid var(--vscode-button-border); 
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      cursor: pointer;
      font-size: 11px;
    }
    .copy:hover, .insert:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    footer { font-size: 11px; opacity: 0.7; text-align: center; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h2>🎨 Fancy Text Styler</h2>
    <textarea id="src" placeholder="Type text here...">Hello World</textarea>
    <div class="toolbar">
      <button id="gen">🔄 Generate</button>
      <button id="clear">🗑️ Clear</button>
      <button id="insert">📝 Insert First</button>
    </div>
    <div id="results" class="results"></div>
    <footer>💡 Click variant to copy | Use buttons for actions</footer>
  </div>
  <script>
    console.log('Sidebar script loading...');

    const vscode = acquireVsCodeApi();
    console.log('VS Code API acquired');

    const src = document.getElementById('src');
    const gen = document.getElementById('gen');
    const clearBtn = document.getElementById('clear');
    const insertBtn = document.getElementById('insert');
    const results = document.getElementById('results');

    console.log('DOM elements:', { src: !!src, gen: !!gen, clearBtn: !!clearBtn, insertBtn: !!insertBtn, results: !!results });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg?.type === 'prefill') {
        src.value = msg.text || '';
        doGenerate();
      }
    });

    let t;
    src.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(doGenerate, 120);
    });

    gen.addEventListener('click', doGenerate);
    clearBtn.addEventListener('click', () => { src.value=''; results.innerHTML=''; });
    insertBtn.addEventListener('click', () => {
      const first = results.querySelector('.variant');
      if (first) vscode.postMessage({ type: 'insert', text: first.textContent || '' });
    });

    function doGenerate(){
      try {
        const text = src.value || '';
        if (!text.trim()) { results.innerHTML = ''; return; }
        const items = generateAll(text);
        render(items);
      } catch (e) {
        results.innerHTML = \`<div style="color: red;">Error: \${e.message}</div>\`;
      }
    }

    function render(items){
      results.innerHTML = '';
      for (const it of items){
        const card = document.createElement('div');
        card.className = 'card';

        const top = document.createElement('div');
        top.className = 'top';

        const p = document.createElement('div');
        p.className = 'variant';
        p.textContent = it.text;
        p.title = 'Click to copy';
        p.addEventListener('click', () => vscode.postMessage({ type: 'copy', text: it.text }));

        const act = document.createElement('div');
        const btnCopy = document.createElement('button');
        btnCopy.className = 'copy';
        btnCopy.textContent = 'Copy';
        btnCopy.addEventListener('click', () => vscode.postMessage({ type: 'copy', text: it.text }));

        const btnIns = document.createElement('button');
        btnIns.className = 'insert';
        btnIns.textContent = 'Insert';
        btnIns.addEventListener('click', () => vscode.postMessage({ type: 'insert', text: it.text }));

        act.appendChild(btnCopy); act.appendChild(btnIns);
        top.appendChild(p); top.appendChild(act);

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = it.label;

        card.appendChild(top);
        card.appendChild(meta);
        results.appendChild(card);
      }
    }

    function mapWithSet(input, set) { return Array.from(input).map((ch) => set[ch] ?? ch).join(''); }
    function buildSet(toStartCaps, toStartLow){ const set = {}; for (let i=0;i<26;i++){ set[String.fromCharCode(65+i)] = String.fromCodePoint(toStartCaps+i); set[String.fromCharCode(97+i)] = String.fromCodePoint(toStartLow+i);} return set;}

    const MATH_BOLD=buildSet(0x1D400,0x1D41A), MATH_ITALIC=buildSet(0x1D434,0x1D44E), MATH_BOLDITALIC=buildSet(0x1D468,0x1D482), MATH_SCRIPT=buildSet(0x1D49C,0x1D4B6), MATH_BOLDSCRIPT=buildSet(0x1D4D0,0x1D4EA), FRAKTUR=buildSet(0x1D504,0x1D51E), BOLD_FRAKTUR=buildSet(0x1D56C,0x1D586), SANS=buildSet(0x1D5A0,0x1D5BA), SANS_BOLD=buildSet(0x1D5D4,0x1D5EE), SANS_ITALIC=buildSet(0x1D608,0x1D622), SANS_BOLDITALIC=buildSet(0x1D63C,0x1D656), MONO=buildSet(0x1D670,0x1D68A);
    const FULLWIDTH = (()=>{ const s={}; for(let i=0;i<26;i++){ s[String.fromCharCode(65+i)] = String.fromCodePoint(0xFF21+i); s[String.fromCharCode(97+i)] = String.fromCodePoint(0xFF41+i);} for(let i=0;i<10;i++){ s[String.fromCharCode(48+i)] = String.fromCodePoint(0xFF10+i);} s[' ']=' '; return s; })();
    const SMALLCAPS = (()=>{ const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; const s={}; for(let i=0;i<26;i++){ const up=String.fromCharCode(65+i); const lo=String.fromCharCode(97+i); s[up]=up; s[lo]=m[lo]||up;} return s; })();
    const UPSIDE = (()=>{ const p={'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᴉ','j':'ɾ','k':'ʞ','l':'ן','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z','A':'∀','B':'𐐒','C':'Ɔ','D':'p','E':'Ǝ','F':'Ⅎ','G':'פ','H':'H','I':'I','J':'ſ','K':'ʞ','L':'˥','M':'W','N':'N','O':'O','P':'Ԁ','Q':'Ό','R':'ᴚ','S':'S','T':'┴','U':'∩','V':'Λ','W':'M','X':'X','Y':'⅄','Z':'Z','?':'¿','!':'¡','[':']',']':'[','(' :')',')':'(' ,'{':'}','}': '{','<':'>','>':'<','_':'‾'}; const s={}; for(const k in p) s[k]=p[k]; return s; })();
    const STRIKE=(s)=>Array.from(s).map(ch=>ch+'\\u0336').join('');
    const UNDER=(s)=>Array.from(s).map(ch=>ch+'\\u0332').join('');
    const OVER=(s)=>Array.from(s).map(ch=>ch+'\\u0305').join('');
    const BOX_EACH=(s)=>Array.from(s).map(ch=>\`【\${ch}】\`).join('');
    const CORNER_EACH=(s)=>Array.from(s).map(ch=>\`『\${ch}』\`).join('');
    const WRAP_CAKE=(s)=>\`🍰 🎀 \${s} 🎀 🍰\`;
    const WRAP_SPARKLE=(s)=>\`✨ ⋆ 🌟 \${s} 🌟 ⋆ ✨\`;
    const WRAP_KAOMOJI=(s)=>\`(っ◔◡◔)っ ♥ \${s} ♥\`;

    function superscriptish(s){ const m={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ᶦ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','q':'ᑫ','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ','A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','Q':'Q','R':'ᴿ','S':'ˢ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ','X':'ˣ','Y':'ʸ','Z':'ᶻ'}; return Array.from(s).map(ch=>m[ch]??ch).join('');}
    function subscriptish(s){ const m={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','a':'ₐ','e':'ₑ','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','x':'ₓ'}; return Array.from(s).map(ch=>m[ch]??ch).join('');}

    function generateAll(s){
      const items=[]; 
      const push=(label,text)=>items.push({label,text});
      push('𝐌𝐚𝐭𝐡 𝐁𝐨𝐥𝐝', mapWithSet(s, MATH_BOLD));
      push('𝑀𝑎𝑡ℎ 𝐼𝑡𝑎𝑙𝑖𝑐', mapWithSet(s, MATH_ITALIC));
      push('𝑀𝑎𝑡ℎ 𝐁𝐨𝐥𝐝 𝐼𝑡𝑎𝑙𝑖𝑐', mapWithSet(s, MATH_BOLDITALIC));
      push('𝓢𝓬𝓻𝓲𝓹𝓽', mapWithSet(s, MATH_SCRIPT));
      push('𝓢𝓬𝓻𝓲𝓹𝓽 𝐁𝐨𝐥𝐝', mapWithSet(s, MATH_BOLDSCRIPT));
      push('𝔉𝔯𝔞𝔨𝔱𝔲𝔯', mapWithSet(s, FRAKTUR));
      push('𝕭𝖔𝖑𝖉 𝔉𝔯𝔞𝔨𝔱𝔲𝔯', mapWithSet(s, BOLD_FRAKTUR));
      push('𝗦𝗮𝗻𝘀', mapWithSet(s, SANS));
      push('𝗦𝗮𝗻𝘀 𝐁𝐨𝐥𝐝', mapWithSet(s, SANS_BOLD));
      push('𝗦𝗮𝗻𝘀 𝐼𝑡𝑎𝑙𝑖𝑐', mapWithSet(s, SANS_ITALIC));
      push('𝗦𝗮𝗻𝘀 𝐁𝐨𝐥𝐝 𝐼𝑡𝑎𝑙𝑖𝑐', mapWithSet(s, SANS_BOLDITALIC));
      push('𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎', mapWithSet(s, MONO));
      push('Ｆｕｌｌｗｉｄｔｈ', mapWithSet(s, FULLWIDTH));
      push('Sᴍᴀʟʟ ᴄᴀᴘs', mapWithSet(s, SMALLCAPS));
      push('ᵗᵘˢᵘᵖ ᶦˢʰ', superscriptish(s));
      push('ₛᵤᵦᵢₛₕ', subscriptish(s));
      push('Upside Down', Array.from(s).reverse().map(ch=>UPSIDE[ch]??ch).join(''));
      push('Strike', STRIKE(s));
      push('Underline', UNDER(s));
      push('Overline', OVER(s));
      push('【Box Each】', BOX_EACH(s));
      push('『Corner Each』', CORNER_EACH(s));
      push('🍰🎀 Wrapper', WRAP_CAKE(s));
      push('✨🌟 Wrapper', WRAP_SPARKLE(s));
      push('(◔◡◔) Wrapper', WRAP_KAOMOJI(s));
      return items;
    }

    console.log('Calling initial doGenerate');
    doGenerate();
    console.log('Sidebar loaded successfully');
  </script>
</body>
</html>`;
  }

  postPrefill(text: string) {
    if (this._view) {
      this._view.webview.postMessage({ type: 'prefill', text });
    }
  }
}
