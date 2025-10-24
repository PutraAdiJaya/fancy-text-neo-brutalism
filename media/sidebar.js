console.log('Sidebar script loading...');

const vscode = acquireVsCodeApi();

console.log('VS Code API acquired');

const src = document.getElementById('src');
const gen = document.getElementById('gen');
const clearBtn = document.getElementById('clear');
const insertBtn = document.getElementById('insert');
const results = document.getElementById('results');

console.log('DOM elements retrieved:', { src: !!src, gen: !!gen, clearBtn: !!clearBtn, insertBtn: !!insertBtn, results: !!results });

// receive prefill from extension
window.addEventListener('message', (event) => {
  console.log('Message received:', event.data);
  const msg = event.data;
  if (msg?.type === 'prefill') {
    console.log('Prefill message received:', msg.text);
    src.value = msg.text || '';
    doGenerate();
  }
});

// live update on typing (debounced)
let t;
src.addEventListener('input', () => {
  console.log('Input event triggered');
  clearTimeout(t);
  t = setTimeout(doGenerate, 120);
});

gen.addEventListener('click', () => {
  console.log('Generate button clicked');
  doGenerate();
});

clearBtn.addEventListener('click', () => {
  console.log('Clear button clicked');
  src.value='';
  results.innerHTML='';
});

insertBtn.addEventListener('click', () => {
  console.log('Insert button clicked');
  const first = results.querySelector('.variant');
  if (first) {
    vscode.postMessage({ type: 'insert', text: first.textContent || '' });
  }
});

function doGenerate(){
  console.log('doGenerate called');
  try {
    const text = src.value || '';
    console.log('Text to generate:', text);
    if (!text.trim()) { 
      results.innerHTML = ''; 
      return; 
    }
    const items = generateAll(text);
    console.log('Generated items:', items.length);
    render(items);
  } catch (e) {
    console.error('Error in doGenerate:', e);
    results.innerHTML = `<div style="color: red;">Error: ${e.message}</div>`;
  }
}

function render(items){
  console.log('Render called with items:', items.length);
  try {
    results.innerHTML = '';
    for (const it of items){
      const card = document.createElement('div');
      card.className = 'card';

      const top = document.createElement('div');
      top.className = 'top';

      const p = document.createElement('div');
      p.className = 'variant';
      p.textContent = it.text;
      // click on the text itself also copies
      p.title = 'Click to copy';
      p.addEventListener('click', () => {
        console.log('Variant clicked:', it.text);
        vscode.postMessage({ type: 'copy', text: it.text });
      });

      const act = document.createElement('div');

      const btnCopy = document.createElement('button');
      btnCopy.className = 'copy';
      btnCopy.textContent = 'Copy';
      btnCopy.addEventListener('click', () => {
        console.log('Copy button clicked:', it.text);
        vscode.postMessage({ type: 'copy', text: it.text });
      });

      const btnIns = document.createElement('button');
      btnIns.className = 'insert';
      btnIns.textContent = 'Insert';
      btnIns.addEventListener('click', () => {
        console.log('Insert button clicked:', it.text);
        vscode.postMessage({ type: 'insert', text: it.text });
      });

      act.appendChild(btnCopy); act.appendChild(btnIns);
      top.appendChild(p); top.appendChild(act);

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = it.label;

      card.appendChild(top);
      card.appendChild(meta);
      results.appendChild(card);
    }
    console.log('Render completed');
  } catch (e) {
    console.error('Error in render:', e);
    results.innerHTML = `<div style="color: red;">Render Error: ${e.message}</div>`;
  }
}

// ==== Variant generators ====
function mapWithSet(input, set) { 
  console.log('mapWithSet called');
  return Array.from(input).map((ch) => set[ch] ?? ch).join(''); 
}

function buildSet(toStartCaps, toStartLow){
  console.log('buildSet called');
  const set = {}; 
  for (let i=0;i<26;i++){ 
    set[String.fromCharCode(65+i)] = String.fromCodePoint(toStartCaps+i); 
    set[String.fromCharCode(97+i)] = String.fromCodePoint(toStartLow+i);
  } 
  return set;
}

console.log('Initializing character sets...');
const MATH_BOLD=buildSet(0x1D400,0x1D41A), MATH_ITALIC=buildSet(0x1D434,0x1D44E), MATH_BOLDITALIC=buildSet(0x1D468,0x1D482), MATH_SCRIPT=buildSet(0x1D49C,0x1D4B6), MATH_BOLDSCRIPT=buildSet(0x1D4D0,0x1D4EA), FRAKTUR=buildSet(0x1D504,0x1D51E), BOLD_FRAKTUR=buildSet(0x1D56C,0x1D586), SANS=buildSet(0x1D5A0,0x1D5BA), SANS_BOLD=buildSet(0x1D5D4,0x1D5EE), SANS_ITALIC=buildSet(0x1D608,0x1D622), SANS_BOLDITALIC=buildSet(0x1D63C,0x1D656), MONO=buildSet(0x1D670,0x1D68A);
const FULLWIDTH = (()=>{ const s={}; for(let i=0;i<26;i++){ s[String.fromCharCode(65+i)] = String.fromCodePoint(0xFF21+i); s[String.fromCharCode(97+i)] = String.fromCodePoint(0xFF41+i);} for(let i=0;i<10;i++){ s[String.fromCharCode(48+i)] = String.fromCodePoint(0xFF10+i);} s[' ']=' '; return s; })();
const SMALLCAPS = (()=>{ const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; const s={}; for(let i=0;i<26;i++){ const up=String.fromCharCode(65+i); const lo=String.fromCharCode(97+i); s[up]=up; s[lo]=m[lo]||up;} return s; })();
const UPSIDE = (()=>{ const p={'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᴉ','j':'ɾ','k':'ʞ','l':'ן','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z','A':'∀','B':'𐐒','C':'Ɔ','D':'p','E':'Ǝ','F':'Ⅎ','G':'פ','H':'H','I':'I','J':'ſ','K':'ʞ','L':'˥','M':'W','N':'N','O':'O','P':'Ԁ','Q':'Ό','R':'ᴚ','S':'S','T':'┴','U':'∩','V':'Λ','W':'M','X':'X','Y':'⅄','Z':'Z','?':'¿','!':'¡','[':']',']':'[','(' :')',')':'(' ,'{':'}','}': '{','<':'>','>':'<','_':'‾'}; const s={}; for(const k in p) s[k]=p[k]; return s; })();
const STRIKE=(s)=>{ console.log('STRIKE called'); return Array.from(s).map(ch=>ch+'\u0336').join(''); }
const UNDER=(s)=>{ console.log('UNDER called'); return Array.from(s).map(ch=>ch+'\u0332').join(''); }
const OVER=(s)=>{ console.log('OVER called'); return Array.from(s).map(ch=>ch+'\u0305').join(''); }
const BOX_EACH=(s)=>Array.from(s).map(ch=>`【${ch}】`).join('');
const CORNER_EACH=(s)=>Array.from(s).map(ch=>`『${ch}』`).join('');
const WRAP_CAKE=(s)=>`🍰 🎀 ${s} 🎀 🍰`;
const WRAP_SPARKLE=(s)=>`✨ ⋆ 🌟 ${s} 🌟 ⋆ ✨`;
const WRAP_KAOMOJI=(s)=>`(っ◔◡◔)っ ♥ ${s} ♥`;

function superscriptish(s){
  console.log('superscriptish called');
  const m={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ᶦ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','q':'ᑫ','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ','A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','Q':'Q','R':'ᴿ','S':'ˢ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ','X':'ˣ','Y':'ʸ','Z':'ᶻ'}; 
  return Array.from(s).map(ch=>m[ch]??ch).join('');
}

function subscriptish(s){
  console.log('subscriptish called');
  const m={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','a':'ₐ','e':'ₑ','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','x':'ₓ'}; 
  return Array.from(s).map(ch=>m[ch]??ch).join('');
}

function generateAll(s){
  console.log('generateAll called with:', s);
  try {
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
    console.log('generateAll completed with items:', items.length);
    return items;
  } catch (e) {
    console.error('Error in generateAll:', e);
    return [{label: 'Error', text: 'Failed to generate text variants'}];
  }
}

// initial render
console.log('Calling initial doGenerate');
doGenerate();
console.log('Sidebar script loaded successfully');