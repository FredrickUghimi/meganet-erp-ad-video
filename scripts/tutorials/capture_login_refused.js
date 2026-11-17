const { chromium } = require('playwright'); const fs=require('fs');
const BASE='http://127.0.0.1:8765', PW='LocalTutorial#2026x', OUT='tut/shots/';
const LOG={}; const note=(k,v)=>{LOG[k]=v;console.log('NOTE',k,JSON.stringify(v).slice(0,300));};
async function login(ctx,user,role){const p=await ctx.newPage();await p.goto(BASE+'/accounts/login/');await p.fill('input[name=username]',user);await p.fill('input[name=password]',PW);await p.selectOption('select[name=role]',role);await p.click('button[type=submit]');await p.waitForLoadState('networkidle');return p;}
const HIDE='*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important}';
const collect=()=>{ // text boxes for every visible text node, plus placeholders / input values / select values
  const out=[]; const vw=innerWidth, vh=innerHeight;
  const eff=(el)=>{let o=1;for(let e=el;e&&e.nodeType===1;e=e.parentElement){o*=parseFloat(getComputedStyle(e).opacity);}return o;};
  const vis=(el)=>{const s=getComputedStyle(el);return s.visibility!=='hidden'&&s.display!=='none';};
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let n; while((n=w.nextNode())){const t=n.textContent.replace(/\s+/g,' ').trim(); if(!t) continue; const el=n.parentElement; if(!el||['SCRIPT','STYLE','OPTION','NOSCRIPT'].includes(el.tagName)||!vis(el)) continue;
    const r=document.createRange(); r.selectNodeContents(n); const cs=getComputedStyle(el);
    for(const q of r.getClientRects()){ if(q.width<1||q.height<1) continue; if(q.bottom<0||q.top>vh||q.right<0||q.left>vw) continue;
      const cx=Math.min(Math.max((q.left+q.right)/2,0),vw-1), cy=Math.min(Math.max((q.top+q.bottom)/2,0),vh-1); const top=document.elementFromPoint(cx,cy); if(top&&!(el.contains(top)||top.contains(el))) continue;
      out.push({text:t,kind:'text',x0:q.left,y0:q.top,x1:q.right,y1:q.bottom,color:cs.color,opacity:eff(el),size:parseFloat(cs.fontSize),weight:cs.fontWeight});}}
  for(const el of document.querySelectorAll('input,textarea,select')){ if(!vis(el)) continue; const q=el.getBoundingClientRect(); if(q.bottom<0||q.top>vh||q.width<1) continue; const cs=getComputedStyle(el);
    {const cx=Math.min(Math.max(q.left+q.width/2,0),vw-1), cy=Math.min(Math.max(q.top+q.height/2,0),vh-1); const top=document.elementFromPoint(cx,cy); if(top&&!(el.contains(top)||top.contains(el))) continue;}
    const pad=(k)=>parseFloat(cs[k])||0; const box={x0:q.left+pad('paddingLeft')+(parseFloat(cs.borderLeftWidth)||0),y0:q.top+pad('paddingTop')+4,x1:q.right-pad('paddingRight'),y1:q.bottom-pad('paddingBottom')-4};
    if(el.tagName==='SELECT'){const o=el.options[el.selectedIndex]; if(o) out.push({text:'[select] '+o.text,kind:'select',...box,color:cs.color,opacity:eff(el),size:parseFloat(cs.fontSize),weight:cs.fontWeight});}
    else if(el.value){out.push({text:'[value] '+el.value,kind:'value',...box,color:cs.color,opacity:eff(el),size:parseFloat(cs.fontSize),weight:cs.fontWeight});}
    else if(el.placeholder){const pc=getComputedStyle(el,'::placeholder'); out.push({text:'[placeholder] '+el.placeholder,kind:'placeholder',...box,color:pc.color,opacity:eff(el)*parseFloat(pc.opacity||1),size:parseFloat(cs.fontSize),weight:cs.fontWeight});}}
  return out;};
async function shot(page,name,extra){
  if(!(extra&&extra.toasts)){ for(let i=0;i<40;i++){ const n=await page.evaluate(()=>[...document.querySelectorAll('[role=status]')].filter(t=>!/fictional data only/i.test(t.innerText)).length); if(!n) break; await page.waitForTimeout(250);} }
  await page.waitForTimeout(350);
  const boxes=await page.evaluate(collect); await page.screenshot({path:OUT+name+'.png'});
  await page.addStyleTag({content:HIDE}).then(async h=>{await page.waitForTimeout(150);await page.screenshot({path:OUT+name+'.notext.png'});await h.evaluate(e=>e.remove());});
  fs.writeFileSync(OUT+name+'.json',JSON.stringify({boxes,extra:extra||null}));
  console.log('SHOT',name,boxes.length,'text boxes');}

(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:360,height:780},deviceScaleFactor:3}); const p=await ctx.newPage();
 await p.goto(BASE+'/accounts/login/'); await p.fill('input[name=username]','nneka.eze'); await p.fill('input[name=password]',PW); await p.selectOption('select[name=role]','pharmacist'); await p.click('button[type=submit]'); await p.waitForLoadState('networkidle');
 note('deactivated_login_url',p.url()); note('deactivated_login_errors',await p.evaluate(()=>[...document.querySelectorAll('[role=alert],.errorlist,.error,li')].map(e=>e.innerText.trim()).filter(t=>/credentials|role/i.test(t))));
 await p.evaluate(()=>window.scrollTo(0,0)); await shot(p,'s36_login_refused'); fs.writeFileSync(OUT+'login_log.json',JSON.stringify(LOG,null,1)); await b.close();
})().catch(e=>{console.log('SCRIPT ERROR',e.message.slice(0,400));process.exit(1)});
