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
      enableScripts: true,
      localResourceRoots: []
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
    :root { 
      --gap: 4px;
      --aurora-1: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 50%, rgba(245, 158, 11, 0.15) 100%);
      --aurora-2: linear-gradient(225deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%);
      --card-glow: 0 4px 20px rgba(139, 92, 246, 0.15), 0 0 40px rgba(236, 72, 153, 0.08);
      --card-hover-glow: 0 8px 30px rgba(139, 92, 246, 0.25), 0 0 60px rgba(236, 72, 153, 0.15);
    }
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0;
      font-family: var(--vscode-font-family); 
      color: var(--vscode-foreground);
      background: var(--vscode-sidebar-background);
      font-size: var(--vscode-font-size);
    }
    .wrap { padding: 10px; display: flex; flex-direction: column; gap: var(--gap); }
    h2 { 
      margin: 0 0 12px 0; 
      font-size: 15px; 
      font-weight: 700;
      background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 0.5px;
    }
    .input-wrapper {
      position: relative;
    }
    textarea#src { 
      width: 100%; 
      min-height: 70px; 
      resize: vertical; 
      padding: 12px 36px 12px 12px;
      border-radius: 12px; 
      border: 2px solid transparent;
      background: linear-gradient(var(--vscode-input-background), var(--vscode-input-background)) padding-box,
                  linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3)) border-box;
      color: var(--vscode-input-foreground);
      font-size: 13px;
      font-family: var(--vscode-editor-font-family);
      line-height: 1.5;
      transition: all 0.3s ease;
    }
    textarea#src:focus {
      outline: none;
      border-color: transparent;
      background: linear-gradient(var(--vscode-input-background), var(--vscode-input-background)) padding-box,
                  linear-gradient(135deg, #8B5CF6, #EC4899, #F59E0B) border-box;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }
    .clear-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: var(--vscode-input-foreground);
      cursor: pointer;
      border-radius: 3px;
      font-size: 16px;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: all 0.2s;
    }
    .clear-btn:hover {
      background: var(--vscode-toolbar-hoverBackground);
      opacity: 1;
    }
    .input-wrapper:hover .clear-btn {
      display: flex;
    }
    .results { 
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .card { 
      border: 2px solid transparent;
      border-radius: 8px; 
      padding: 6px 10px;
      background: 
        linear-gradient(var(--vscode-editor-background), var(--vscode-editor-background)) padding-box,
        linear-gradient(135deg, 
          rgba(139, 92, 246, 0.3) 0%, 
          rgba(236, 72, 153, 0.3) 50%, 
          rgba(6, 182, 212, 0.3) 100%
        ) border-box;
      box-shadow: var(--card-glow);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .card:hover::before {
      opacity: 1;
    }
    .card:hover { 
      border-color: transparent;
      background: 
        linear-gradient(var(--vscode-editor-background), var(--vscode-editor-background)) padding-box,
        linear-gradient(135deg, 
          rgba(139, 92, 246, 0.6) 0%, 
          rgba(236, 72, 153, 0.6) 50%, 
          rgba(6, 182, 212, 0.6) 100%
        ) border-box;
      box-shadow: var(--card-hover-glow);
      transform: translateY(-3px) scale(1.01);
    }
    .card .top {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      gap: 8px;
    }
    .variant { 
      font-size: 13px; 
      line-height: 1.1;
      word-break: break-all;
      user-select: text;
      flex: 1;
      font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Apple Color Emoji', 'Noto Sans', 'Arial Unicode MS', Arial, sans-serif;
    }
    .card .actions {
      display: flex;
      gap: 3px;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .card:hover .actions {
      opacity: 1;
    }
    .meta { 
      font-size: 9px; 
      opacity: 0.45;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 1px;
    }
    .copy, .insert { 
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 0px; 
      border: 2px solid transparent;
      background: transparent;
      color: var(--vscode-icon-foreground);
      cursor: pointer;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .copy:hover {
      background: var(--vscode-button-background);
      border-color: var(--vscode-button-background);
      transform: scale(1.15) rotate(-5deg);
    }
    .insert:hover {
      background: var(--vscode-button-secondaryBackground);
      border-color: var(--vscode-button-secondaryBackground);
      transform: scale(1.15) rotate(5deg);
    }
    footer { 
      font-size: 10px; 
      opacity: 0.5;
      text-align: center;
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid var(--vscode-widget-border);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h2>🎨 Fancy Text</h2>
    <div class="input-wrapper">
      <textarea id="src" placeholder="Type or paste text here...">Hello World</textarea>
      <button class="clear-btn" id="clear" title="Clear text">×</button>
    </div>
    <div id="results" class="results"></div>
    <footer>💡 Click to copy • 📝 Click Insert • Some styles show boxes but work when pasted</footer>
  </div>
  <script>
    console.log('Sidebar script loading...');

    const vscode = acquireVsCodeApi();
    const src = document.getElementById('src');
    const clearBtn = document.getElementById('clear');
    const results = document.getElementById('results');

    // Prefill from extension
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg?.type === 'prefill') {
        src.value = msg.text || '';
        doGenerate();
      }
    });

    // Auto-generate on input with debounce
    let t;
    src.addEventListener('input', () => {
      toggleClearButton();
      clearTimeout(t);
      t = setTimeout(doGenerate, 150);
    });

    // Clear button
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      src.value = '';
      results.innerHTML = '';
      toggleClearButton();
      src.focus();
    });

    // Toggle clear button visibility
    function toggleClearButton() {
      clearBtn.style.display = src.value.trim() ? 'flex' : 'none';
    }

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

        const actions = document.createElement('div');
        actions.className = 'actions';
        
        const btnCopy = document.createElement('button');
        btnCopy.className = 'copy';
        btnCopy.innerHTML = '📋';
        btnCopy.title = 'Copy to clipboard';
        btnCopy.addEventListener('click', () => vscode.postMessage({ type: 'copy', text: it.text }));

        const btnIns = document.createElement('button');
        btnIns.className = 'insert';
        btnIns.innerHTML = '📝';
        btnIns.title = 'Insert to editor';
        btnIns.addEventListener('click', () => vscode.postMessage({ type: 'insert', text: it.text }));

        actions.appendChild(btnCopy);
        actions.appendChild(btnIns);
        top.appendChild(p);
        top.appendChild(actions);

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = it.label;

        card.appendChild(top);
        card.appendChild(meta);
        results.appendChild(card);
      }
    }

    // Exact Unicode maps from working FancyTextGen
    const map=(t,m)=>Array.from(t).map(c=>m[c]||c).join('');
    const BOLD={'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙','a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳','0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'};
    const ITALIC={'A':'𝐴','B':'𝐵','C':'𝐶','D':'𝐷','E':'𝐸','F':'𝐹','G':'𝐺','H':'𝐻','I':'𝐼','J':'𝐽','K':'𝐾','L':'𝐿','M':'𝑀','N':'𝑁','O':'𝑂','P':'𝑃','Q':'𝑄','R':'𝑅','S':'𝑆','T':'𝑇','U':'𝑈','V':'𝑉','W':'𝑊','X':'𝑋','Y':'𝑌','Z':'𝑍','a':'𝑎','b':'𝑏','c':'𝑐','d':'𝑑','e':'𝑒','f':'𝑓','g':'𝑔','h':'ℎ','i':'𝑖','j':'𝑗','k':'𝑘','l':'𝑙','m':'𝑚','n':'𝑛','o':'𝑜','p':'𝑝','q':'𝑞','r':'𝑟','s':'𝑠','t':'𝑡','u':'𝑢','v':'𝑣','w':'𝑤','x':'𝑥','y':'𝑦','z':'𝑧'};
    const BOLDITALIC={'A':'𝑨','B':'𝑩','C':'𝑪','D':'𝑫','E':'𝑬','F':'𝑭','G':'𝑮','H':'𝑯','I':'𝑰','J':'𝑱','K':'𝑲','L':'𝑳','M':'𝑴','N':'𝑵','O':'𝑶','P':'𝑷','Q':'𝑸','R':'𝑹','S':'𝑺','T':'𝑻','U':'𝑼','V':'𝑽','W':'𝑾','X':'𝑿','Y':'𝒀','Z':'𝒁','a':'𝒂','b':'𝒃','c':'𝒄','d':'𝒅','e':'𝒆','f':'𝒇','g':'𝒈','h':'𝒉','i':'𝒊','j':'𝒋','k':'𝒌','l':'𝒍','m':'𝒎','n':'𝒏','o':'𝒐','p':'𝒑','q':'𝒒','r':'𝒓','s':'𝒔','t':'𝒕','u':'𝒖','v':'𝒗','w':'𝒘','x':'𝒙','y':'𝒚','z':'𝒛'};
    const SCRIPT={'A':'𝒜','B':'ℬ','C':'𝒞','D':'𝒟','E':'ℰ','F':'ℱ','G':'𝒢','H':'ℋ','I':'ℐ','J':'𝒥','K':'𝒦','L':'ℒ','M':'ℳ','N':'𝒩','O':'𝒪','P':'𝒫','Q':'𝒬','R':'ℛ','S':'𝒮','T':'𝒯','U':'𝒰','V':'𝒱','W':'𝒲','X':'𝒳','Y':'𝒴','Z':'𝒵','a':'𝒶','b':'𝒷','c':'𝒸','d':'𝒹','e':'ℯ','f':'𝒻','g':'ℊ','h':'𝒽','i':'𝒾','j':'𝒿','k':'𝓀','l':'𝓁','m':'𝓂','n':'𝓃','o':'ℴ','p':'𝓅','q':'𝓆','r':'𝓇','s':'𝓈','t':'𝓉','u':'𝓊','v':'𝓋','w':'𝓌','x':'𝓍','y':'𝓎','z':'𝓏'};
    const BOLDSCRIPT={'A':'𝓐','B':'𝓑','C':'𝓒','D':'𝓓','E':'𝓔','F':'𝓕','G':'𝓖','H':'𝓗','I':'𝓘','J':'𝓙','K':'𝓚','L':'𝓛','M':'𝓜','N':'𝓝','O':'𝓞','P':'𝓟','Q':'𝓠','R':'𝓡','S':'𝓢','T':'𝓣','U':'𝓤','V':'𝓥','W':'𝓦','X':'𝓧','Y':'𝓨','Z':'𝓩','a':'𝓪','b':'𝓫','c':'𝓬','d':'𝓭','e':'𝓮','f':'𝓯','g':'𝓰','h':'𝓱','i':'𝓲','j':'𝓳','k':'𝓴','l':'𝓵','m':'𝓶','n':'𝓷','o':'𝓸','p':'𝓹','q':'𝓺','r':'𝓻','s':'𝓼','t':'𝓽','u':'𝓾','v':'𝓿','w':'𝔀','x':'𝔁','y':'𝔂','z':'𝔃'};
    const DOUBLESTRUCK={'A':'𝔸','B':'𝔹','C':'ℂ','D':'𝔻','E':'𝔼','F':'𝔽','G':'𝔾','H':'ℍ','I':'𝕀','J':'𝕁','K':'𝕂','L':'𝕃','M':'𝕄','N':'ℕ','O':'𝕆','P':'ℙ','Q':'ℚ','R':'ℝ','S':'𝕊','T':'𝕋','U':'𝕌','V':'𝕍','W':'𝕎','X':'𝕏','Y':'𝕐','Z':'ℤ','a':'𝕒','b':'𝕓','c':'𝕔','d':'𝕕','e':'𝕖','f':'𝕗','g':'𝕘','h':'𝕙','i':'𝕚','j':'𝕛','k':'𝕜','l':'𝕝','m':'𝕞','n':'𝕟','o':'𝕠','p':'𝕡','q':'𝕢','r':'𝕣','s':'𝕤','t':'𝕥','u':'𝕦','v':'𝕧','w':'𝕨','x':'𝕩','y':'𝕪','z':'𝕫','0':'𝟜','1':'𝟝','2':'𝟞','3':'𝟟','4':'𝟠','5':'𝟡','6':'𝟢','7':'𝟣','8':'𝟤','9':'𝟥'};
    const FRAKTUR={'A':'𝔄','B':'𝔅','C':'ℭ','D':'𝔇','E':'𝔈','F':'𝔉','G':'𝔊','H':'ℌ','I':'ℑ','J':'𝔍','K':'𝔎','L':'𝔏','M':'𝔐','N':'𝔑','O':'𝔒','P':'𝔓','Q':'𝔔','R':'ℜ','S':'𝔖','T':'𝔗','U':'𝔘','V':'𝔙','W':'𝔚','X':'𝔛','Y':'𝔜','Z':'ℨ','a':'𝔞','b':'𝔟','c':'𝔠','d':'𝔡','e':'𝔢','f':'𝔣','g':'𝔤','h':'𝔥','i':'𝔦','j':'𝔧','k':'𝔨','l':'𝔩','m':'𝔪','n':'𝔫','o':'𝔬','p':'𝔭','q':'𝔮','r':'𝔯','s':'𝔰','t':'𝔱','u':'𝔲','v':'𝔳','w':'𝔴','x':'𝔵','y':'𝔶','z':'𝔷'};
    const BOLDFRAKTUR={'A':'𝕬','B':'𝕭','C':'𝕮','D':'𝕯','E':'𝕰','F':'𝕱','G':'𝕲','H':'𝕳','I':'𝕴','J':'𝕵','K':'𝕶','L':'𝕷','M':'𝕸','N':'𝕹','O':'𝕺','P':'𝕻','Q':'𝕼','R':'𝕽','S':'𝕾','T':'𝕿','U':'𝖀','V':'𝖁','W':'𝖂','X':'𝖃','Y':'𝖄','Z':'𝖅','a':'𝖆','b':'𝖇','c':'𝖈','d':'𝖉','e':'𝖊','f':'𝖋','g':'𝖌','h':'𝖍','i':'𝖎','j':'𝖏','k':'𝖐','l':'𝖑','m':'𝖒','n':'𝖓','o':'𝖔','p':'𝖕','q':'𝖖','r':'𝖗','s':'𝖘','t':'𝖙','u':'𝖚','v':'𝖛','w':'𝖜','x':'𝖝','y':'𝖞','z':'𝖟'};
    const SANS={'A':'𝖠','B':'𝖡','C':'𝖢','D':'𝖣','E':'𝖤','F':'𝖥','G':'𝖦','H':'𝖧','I':'𝖨','J':'𝖩','K':'𝖪','L':'𝖫','M':'𝖬','N':'𝖭','O':'𝖮','P':'𝖯','Q':'𝖰','R':'𝖱','S':'𝖲','T':'𝖳','U':'𝖴','V':'𝖵','W':'𝖶','X':'𝖷','Y':'𝖸','Z':'𝖹','a':'𝖺','b':'𝖻','c':'𝖼','d':'𝖽','e':'𝖾','f':'𝖿','g':'𝗀','h':'𝗁','i':'𝗂','j':'𝗃','k':'𝗄','l':'𝗅','m':'𝗆','n':'𝗇','o':'𝗈','p':'𝗉','q':'𝗊','r':'𝗋','s':'𝗌','t':'𝗍','u':'𝗎','v':'𝗏','w':'𝗐','x':'𝗑','y':'𝗒','z':'𝗓','0':'𝟮','1':'𝟯','2':'𝟰','3':'𝟱','4':'𝟲','5':'𝟳','6':'𝟴','7':'𝟵','8':'𝟶','9':'𝟷'};
    const SANSBOLD={'A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝','K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧','U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭','a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷','k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁','u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇','0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵'};
    const SANSITALIC={'A':'𝘈','B':'𝘉','C':'𝘊','D':'𝘋','E':'𝘌','F':'𝘍','G':'𝘎','H':'𝘏','I':'𝘐','J':'𝘑','K':'𝘒','L':'𝘓','M':'𝘔','N':'𝘕','O':'𝘖','P':'𝘗','Q':'𝘘','R':'𝘙','S':'𝘚','T':'𝘛','U':'𝘜','V':'𝘝','W':'𝘞','X':'𝘟','Y':'𝘠','Z':'𝘡','a':'𝘢','b':'𝘣','c':'𝘤','d':'𝘥','e':'𝘦','f':'𝘧','g':'𝘨','h':'𝘩','i':'𝘪','j':'𝘫','k':'𝘬','l':'𝘭','m':'𝘮','n':'𝘯','o':'𝘰','p':'𝘱','q':'𝘲','r':'𝘳','s':'𝘴','t':'𝘵','u':'𝘶','v':'𝘷','w':'𝘸','x':'𝘹','y':'𝘺','z':'𝘻'};
    const SANSBOLDITALIC={'A':'𝘼','B':'𝘽','C':'𝘾','D':'𝘿','E':'𝙀','F':'𝙁','G':'𝙂','H':'𝙃','I':'𝙄','J':'𝙅','K':'𝙆','L':'𝙇','M':'𝙈','N':'𝙉','O':'𝙊','P':'𝙋','Q':'𝙌','R':'𝙍','S':'𝙎','T':'𝙏','U':'𝙐','V':'𝙑','W':'𝙒','X':'𝙓','Y':'𝙔','Z':'𝙕','a':'𝙖','b':'𝙗','c':'𝙘','d':'𝙙','e':'𝙚','f':'𝙛','g':'𝙜','h':'𝙝','i':'𝙞','j':'𝙟','k':'𝙠','l':'𝙡','m':'𝙢','n':'𝙣','o':'𝙤','p':'𝙥','q':'𝙦','r':'𝙧','s':'𝙨','t':'𝙩','u':'𝙪','v':'𝙫','w':'𝙬','x':'𝙭','y':'𝙮','z':'𝙯'};
    const MONO={'A':'𝙰','B':'𝙱','C':'𝙲','D':'𝙳','E':'𝙴','F':'𝙵','G':'𝙶','H':'𝙷','I':'𝙸','J':'𝙹','K':'𝙺','L':'𝙻','M':'𝙼','N':'𝙽','O':'𝙾','P':'𝙿','Q':'𝚀','R':'𝚁','S':'𝚂','T':'𝚃','U':'𝚄','V':'𝚅','W':'𝚆','X':'𝚇','Y':'𝚈','Z':'𝚉','a':'𝚊','b':'𝚋','c':'𝚌','d':'𝚍','e':'𝚎','f':'𝚏','g':'𝚐','h':'𝚑','i':'𝚒','j':'𝚓','k':'𝚔','l':'𝚕','m':'𝚖','n':'𝚗','o':'𝚘','p':'𝚙','q':'𝚚','r':'𝚛','s':'𝚜','t':'𝚝','u':'𝚞','v':'𝚟','w':'𝚠','x':'𝚡','y':'𝚢','z':'𝚣','0':'𝟶','1':'𝟷','2':'𝟸','3':'𝟹','4':'𝟺','5':'𝟻','6':'𝟼','7':'𝟽','8':'𝟾','9':'𝟿'};
    const CIRCLED={'A':'Ⓐ','B':'Ⓑ','C':'Ⓒ','D':'Ⓓ','E':'Ⓔ','F':'Ⓕ','G':'Ⓖ','H':'Ⓗ','I':'Ⓘ','J':'Ⓙ','K':'Ⓚ','L':'Ⓛ','M':'Ⓜ','N':'Ⓝ','O':'Ⓞ','P':'Ⓟ','Q':'Ⓠ','R':'Ⓡ','S':'Ⓢ','T':'Ⓣ','U':'Ⓤ','V':'Ⓥ','W':'Ⓦ','X':'Ⓧ','Y':'Ⓨ','Z':'Ⓩ','a':'ⓐ','b':'ⓑ','c':'ⓒ','d':'ⓓ','e':'ⓔ','f':'ⓕ','g':'ⓖ','h':'ⓗ','i':'ⓘ','j':'ⓙ','k':'ⓚ','l':'ⓛ','m':'ⓜ','n':'ⓝ','o':'ⓞ','p':'ⓟ','q':'ⓠ','r':'ⓡ','s':'ⓢ','t':'ⓣ','u':'ⓤ','v':'ⓥ','w':'ⓦ','x':'ⓧ','y':'ⓨ','z':'ⓩ','0':'⓪','1':'①','2':'②','3':'③','4':'④','5':'⑤','6':'⑥','7':'⑦','8':'⑧','9':'⑨'};
    const SQUARED={'A':'🄰','B':'🄱','C':'🄲','D':'🄳','E':'🄴','F':'🄵','G':'🄶','H':'🄷','I':'🄸','J':'🄹','K':'🄺','L':'🄻','M':'🄼','N':'🄽','O':'🄾','P':'🄿','Q':'🅀','R':'🅁','S':'🅂','T':'🅃','U':'🅄','V':'🅅','W':'🅆','X':'🅇','Y':'🅈','Z':'🅉','a':'🄰','b':'🄱','c':'🄲','d':'🄳','e':'🄴','f':'🄵','g':'🄶','h':'🄷','i':'🄸','j':'🄹','k':'🄺','l':'🄻','m':'🄼','n':'🄽','o':'🄾','p':'🄿','q':'🅀','r':'🅁','s':'🅂','t':'🅃','u':'🅄','v':'🅅','w':'🅆','x':'🅇','y':'🅈','z':'🅉'};
    const FULLWIDTH={'A':'Ａ','B':'Ｂ','C':'Ｃ','D':'Ｄ','E':'Ｅ','F':'Ｆ','G':'Ｇ','H':'Ｈ','I':'Ｉ','J':'Ｊ','K':'Ｋ','L':'Ｌ','M':'Ｍ','N':'Ｎ','O':'Ｏ','P':'Ｐ','Q':'Ｑ','R':'Ｒ','S':'Ｓ','T':'Ｔ','U':'Ｕ','V':'Ｖ','W':'Ｗ','X':'Ｘ','Y':'Ｙ','Z':'Ｚ','a':'ａ','b':'ｂ','c':'ｃ','d':'ｄ','e':'ｅ','f':'ｆ','g':'ｇ','h':'ｈ','i':'ｉ','j':'ｊ','k':'ｋ','l':'ｌ','m':'ｍ','n':'ｎ','o':'ｏ','p':'ｐ','q':'ｑ','r':'ｒ','s':'ｓ','t':'ｔ','u':'ｕ','v':'ｖ','w':'ｗ','x':'ｘ','y':'ｙ','z':'ｚ','0':'０','1':'１','2':'２','3':'３','4':'４','5':'５','6':'６','7':'７','8':'８','9':'９'};
    const SMALLCAPS={'A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ꜰ','G':'ɢ','H':'ʜ','I':'ɪ','J':'ᴊ','K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ','Q':'Q','R':'ʀ','S':'ꜱ','T':'ᴛ','U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x','Y':'ʏ','Z':'ᴢ','a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'q','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    const SUPERSCRIPT={'A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','Q':'Q','R':'ᴿ','S':'ˢ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ','X':'ˣ','Y':'ʸ','Z':'ᶻ','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','q':'q','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
    const SUBSCRIPT={'A':'ₐ','B':'B','C':'C','D':'D','E':'ₑ','F':'F','G':'G','H':'ₕ','I':'ᵢ','J':'ⱼ','K':'ₖ','L':'ₗ','M':'ₘ','N':'ₙ','O':'ₒ','P':'ₚ','Q':'Q','R':'ᵣ','S':'ₛ','T':'ₜ','U':'ᵤ','V':'ᵥ','W':'W','X':'ₓ','Y':'Y','Z':'Z','a':'ₐ','b':'b','c':'c','d':'d','e':'ₑ','f':'f','g':'g','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','q':'q','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','w':'w','x':'ₓ','y':'y','z':'z','0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
    const UPSIDE={'A':'∀','B':'ᗺ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'Ⅎ','G':'ג','H':'H','I':'I','J':'ſ','K':'ʞ','L':'˥','M':'W','N':'N','O':'O','P':'Ԁ','Q':'Q','R':'ᴚ','S':'S','T':'⊥','U':'∩','V':'Λ','W':'M','X':'X','Y':'⅄','Z':'Z','a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᴉ','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z','0':'0','1':'Ɩ','2':'ᒅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6'};
    const STRIKE=(s)=>Array.from(s).map(c=>c===' '?' ':c+'\\u0336').join('');
    const UNDER=(s)=>Array.from(s).map(c=>c===' '?' ':c+'\\u0332').join('');
    const OVER=(s)=>Array.from(s).map(c=>c===' '?' ':c+'\\u0305').join('');
    const BOX_EACH=(s)=>Array.from(s).map(c=>c===' '?' ':'\\u3010'+c+'\\u3011').join('');
    const CORNER_EACH=(s)=>Array.from(s).map(c=>c===' '?' ':'\\u300e'+c+'\\u300f').join('');
    const WRAP_BUBBLE=(s)=>'\\ud83c\\udf70 \\ud83c\\udf80 '+s+' \\ud83c\\udf80 \\ud83c\\udf70';
    const WRAP_STARS=(s)=>'\\u2728 \\u22c6 \\ud83c\\udf1f '+s+' \\ud83c\\udf1f \\u22c6 \\u2728';
    const WRAP_CUTE=(s)=>'(\\u3063\\u25d4\\u25e1\\u25d4)\\u3063 \\u2665 '+s+' \\u2665';
    const WRAP_WAVES=(s)=>'\\u02dc"*\\u00b0\\u2022.\\u02dc"*\\u00b0\\u2022 '+s+' \\u2022\\u00b0*"\\u02dc.\\u2022\\u00b0*"\\u02dc';
    
    // NEW STYLES - 10 additional text transformations
    const GLITCH=(s)=>Array.from(s).map(c=>c+c).join('\\u200b'); // Double chars with zero-width space
    const ZALGO=(s)=>{const d=['̀','́','̂','̃','̄','̅','̆','̇','̈','̊','̋','̌','̖','̗','̘','̙','̚','̛']; return Array.from(s).map(c=>c===' '?' ':c+d[Math.floor(Math.random()*d.length)]+d[Math.floor(Math.random()*d.length)]).join('');};
    const MIXED_CASE=(s)=>Array.from(s).map((c,i)=>i%2===0?c.toLowerCase():c.toUpperCase()).join('');
    const REVERSE_TEXT=(s)=>Array.from(s).reverse().join('');
    const SQUARED_NEG={'A':'\\ud83c\\udd70','B':'\\ud83c\\udd71','C':'\\ud83c\\udd72','D':'\\ud83c\\udd73','E':'\\ud83c\\udd74','F':'\\ud83c\\udd75','G':'\\ud83c\\udd76','H':'\\ud83c\\udd77','I':'\\ud83c\\udd78','J':'\\ud83c\\udd79','K':'\\ud83c\\udd7a','L':'\\ud83c\\udd7b','M':'\\ud83c\\udd7c','N':'\\ud83c\\udd7d','O':'\\ud83c\\udd7e','P':'\\ud83c\\udd7f','Q':'\\ud83c\\udd80','R':'\\ud83c\\udd81','S':'\\ud83c\\udd82','T':'\\ud83c\\udd83','U':'\\ud83c\\udd84','V':'\\ud83c\\udd85','W':'\\ud83c\\udd86','X':'\\ud83c\\udd87','Y':'\\ud83c\\udd88','Z':'\\ud83c\\udd89','a':'\\ud83c\\udd70','b':'\\ud83c\\udd71','c':'\\ud83c\\udd72','d':'\\ud83c\\udd73','e':'\\ud83c\\udd74','f':'\\ud83c\\udd75','g':'\\ud83c\\udd76','h':'\\ud83c\\udd77','i':'\\ud83c\\udd78','j':'\\ud83c\\udd79','k':'\\ud83c\\udd7a','l':'\\ud83c\\udd7b','m':'\\ud83c\\udd7c','n':'\\ud83c\\udd7d','o':'\\ud83c\\udd7e','p':'\\ud83c\\udd7f','q':'\\ud83c\\udd80','r':'\\ud83c\\udd81','s':'\\ud83c\\udd82','t':'\\ud83c\\udd83','u':'\\ud83c\\udd84','v':'\\ud83c\\udd85','w':'\\ud83c\\udd86','x':'\\ud83c\\udd87','y':'\\ud83c\\udd88','z':'\\ud83c\\udd89'};
    const WIDE_BOLD=(s)=>map(map(s,FULLWIDTH),BOLD);
    const WAVE_DASH=(s)=>Array.from(s).map(c=>c===' '?' ':c+'~').join('');
    const DOT_SEP=(s)=>Array.from(s).map(c=>c===' '?' ':c+'\\u2022').join('').slice(0,-1); // Remove last dot
    const STAR_WRAP=(s)=>'*\\u2726\\uff65\\uff9f '+s+' \\u2726\\uff65\\uff9f*';
    function generateAll(s){
      const items=[]; 
      const push=(label,text)=>items.push({label,text});
      push('𝐁𝐨𝐥𝐝', map(s, BOLD));
      push('𝐼𝑡𝑎𝑙𝑖𝑐', map(s, ITALIC));
      push('𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄', map(s, BOLDITALIC));
      push('𝒮𝒸𝓇𝒾𝓅𝓉', map(s, SCRIPT));
      push('𝓑𝓸𝓵𝓭 𝓢𝓬𝓻𝓲𝓹𝓽', map(s, BOLDSCRIPT));
      push('𝔻𝕠𝕦𝕓𝕝𝕖-𝕤𝕥𝕣𝕦𝕔𝕜', map(s, DOUBLESTRUCK));
      push('𝔪𝔢𝔡𝔦𝔢𝔳𝔞𝔩', map(s, FRAKTUR));
      push('𝕭𝖔𝖑𝖉 𝔉𝔯𝔞𝔨𝔱𝔲𝔯', map(s, BOLDFRAKTUR));
      push('𝖲𝖺𝗇𝗌-𝗌𝖾𝗋𝗂𝖿', map(s, SANS));
      push('𝗕𝗼𝗹𝗱 𝗦𝗮𝗻𝘀', map(s, SANSBOLD));
      push('Sans Italic', map(s, SANSITALIC));
      push('Sans Bold Italic', map(s, SANSBOLDITALIC));
      push('𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎', map(s, MONO));
      push('Ⓒⓘⓡⓒⓛⓔⓓ', map(s, CIRCLED));
      push('🅂🅀🅄🄰🅁🄴🄳', map(s, SQUARED));
      push('Ｆｕｌｌｗｉｄｔｈ', map(s, FULLWIDTH));
      push('sᴍᴀʟʟ ᴄᴀᴘs', map(s, SMALLCAPS));
      push('ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ', map(s, SUPERSCRIPT));
      push('ₛᵤᵦₛcᵣᵢₚₜ', map(s, SUBSCRIPT));
      push('upsᴉpǝ ᗡoʍu', map(s, UPSIDE).split('').reverse().join(''));
      push('S̶t̶r̶i̶k̶e̶', STRIKE(s));
      push('U̲n̲d̲e̲r̲l̲i̲n̲e̲', UNDER(s));
      push('O̅v̅e̅r̅l̅i̅n̅e̅', OVER(s));
      push('【Brackets】', BOX_EACH(s));
      push('『Boxed』', CORNER_EACH(s));
      push('🍰 Bubble 🍰', WRAP_BUBBLE(s));
      push('✨ Stars ✨', WRAP_STARS(s));
      push('(ぃ◔◡◔)ぃ ♥ Cute ♥', WRAP_CUTE(s));
      push('˜"*°• Waves •°*"˜', WRAP_WAVES(s));
      // NEW STYLES
      push('⚡ Glitch', GLITCH(s));
      push('🌀 Zalgo', ZALGO(s));
      push('🎭 mIxEd CaSe', MIXED_CASE(s));
      push('🔁 Reverse', REVERSE_TEXT(s));
      push('⬜ Squared Negative', map(s, SQUARED_NEG));
      push('🎪 Wide Bold', WIDE_BOLD(s));
      push('🌊 Wave Dash', WAVE_DASH(s));
      push('📍 Dot Separated', DOT_SEP(s));
      push('⭐ Star Wrapped', STAR_WRAP(s));
      return items;
    }

    // Initial setup
    toggleClearButton();
    doGenerate();
    console.log('Fancy Text Styler loaded');
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
