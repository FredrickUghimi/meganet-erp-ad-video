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
const toastRects=()=>{ // per-LINE rects of each toast text + the 'invited' word rect (never the union of a wrapped word)
  const res=[]; for(const t of document.querySelectorAll('[role=status]')){const w=document.createTreeWalker(t,NodeFilter.SHOW_TEXT); let n; const lines=[]; const words=[];
   while((n=w.nextNode())){const r=document.createRange(); r.selectNodeContents(n); for(const q of r.getClientRects()){if(q.width>1) lines.push({x0:q.left,y0:q.top,x1:q.right,y1:q.bottom});}
     const re=/\S+/g;let m;while((m=re.exec(n.textContent))){r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);const fr=[...r.getClientRects()].filter(q=>q.width>1).map(q=>({x0:q.left,y0:q.top,x1:q.right,y1:q.bottom}));words.push({w:m[0],frags:fr});}}
   const tb=t.getBoundingClientRect(); res.push({box:{x0:tb.left,y0:tb.top,x1:tb.right,y1:tb.bottom},lines,words:words.map(x=>({w:x.w,x0:x.frags[0].x0,y0:x.frags[0].y0,x1:x.frags[x.frags.length-1].x1,y1:x.frags[x.frags.length-1].y1,frags:x.frags}))});} return res;};
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:360,height:780},deviceScaleFactor:3}); const page=await login(ctx,'mnd.admin','org_admin');
 const dialogs=[]; let dialogMode='accept'; page.on('dialog',async d=>{dialogs.push(d.message()); if(dialogMode==='accept') await d.accept(); else await d.dismiss();});
 const reqs=[]; page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/staff-directory/')) reqs.push(r.url().replace(BASE,''));});
 await page.goto(BASE+'/app/front-office/staff-directory'); await page.waitForSelector('text=Add / Edit Staff');
 const scrollEl=async(sel,block='start')=>{await page.evaluate(([s,bl])=>{const e=document.querySelector(s)||[...document.querySelectorAll('h2,h3,div')].find(x=>x.innerText&&x.innerText.trim()===s);e&&e.scrollIntoView({block:bl});},[sel,block]);await page.waitForTimeout(250);};
 const scrollText=async(txt,off=0)=>{await page.evaluate(([t,o])=>{const e=[...document.querySelectorAll('h2,h3,label,td,div,span')].filter(x=>x.children.length===0&&x.innerText&&x.innerText.trim().startsWith(t))[0];if(e){e.scrollIntoView({block:'start'});const m=document.querySelector('main')||document.scrollingElement;m.scrollBy(0,-o);}},[txt,off]);await page.waitForTimeout(300);};
 const scrollFilter=async()=>{await page.evaluate(()=>{const e=document.querySelector('input[placeholder^="Filter by name"]'); if(!e) return; e.scrollIntoView({block:'start'}); let p=e.parentElement; while(p&&!(p.scrollHeight>p.clientHeight+5&&/(auto|scroll)/.test(getComputedStyle(p).overflowY))) p=p.parentElement; (p||document.scrollingElement).scrollBy(0,-130);}); await page.waitForTimeout(300);};
 // layout facts
 note('thead_display_360',await page.evaluate(()=>getComputedStyle(document.querySelector('thead')).display));
 await shot(page,'s01_top');
 // drawer: find hamburger (top-left of header)
 const hb=await page.evaluate(()=>{const c=[...document.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2,t:q.top,l:q.left,w:q.width}}).filter(q=>q.t>20&&q.t<140&&q.l<80&&q.w>20);return c[0]||null;});
 note('hamburger',hb); await page.mouse.click(hb.x,hb.y); await page.waitForTimeout(600);
 await page.evaluate(()=>{const a=[...document.querySelectorAll('aside a')].find(x=>x.innerText.includes('Staff Directory'));a&&a.scrollIntoView({block:'center'});}); await shot(page,'s02_drawer_open',{link:await page.evaluate(()=>{const a=[...document.querySelectorAll('aside a')].find(x=>x.innerText.includes('Staff Directory'));if(!a)return null;const q=a.getBoundingClientRect();return{x0:q.left,y0:q.top,x1:q.right,y1:q.bottom};})});
 await page.evaluate(()=>{const a=[...document.querySelectorAll('aside a')].find(x=>x.innerText.includes('Staff Directory'));a&&a.click();}); await page.waitForTimeout(800); note('after_menu_click_url',page.url());
 await page.waitForSelector('text=Add / Edit Staff');
 // list + filter
 await scrollFilter(); await shot(page,'s03_list_top');
 await page.getByPlaceholder('Filter by name or email...').fill('Ekaette'); await page.waitForTimeout(500); await scrollFilter(); await shot(page,'s04_filter_one_card');
 await page.getByPlaceholder('Filter by name or email...').fill('');
 // form empty + errors
 await scrollText('Add / Edit Staff',0); await shot(page,'s05_form_empty');
 await page.click('button:has-text("Save")'); await page.waitForTimeout(700); await shot(page,'s06_err_empty');
 await page.getByLabel('First Name').fill('Nneka'); await page.getByLabel('Last Name').fill('Eze'); await page.locator('input[type=email]').fill('nneka-no-at');
 await page.getByLabel('Role').selectOption('nurse'); await page.getByLabel('Facility').selectOption({label:'Mega-Net Demo Hospital - Annex Clinic'});
 await page.click('button:has-text("Save")'); await page.waitForTimeout(700); await shot(page,'s07_err_bad_email');
 await page.locator('input[type=email]').fill('mnd.nurse@demo.mega-net.example'); await page.click('button:has-text("Save")'); await page.waitForTimeout(700); await shot(page,'s08_err_duplicate');
 // clean form then fill step by step
 await page.click('button:has-text("Clear")'); await page.waitForTimeout(300); await scrollText('Add / Edit Staff',0);
 await page.getByLabel('First Name').fill('Nneka'); await page.getByLabel('Last Name').fill('Eze'); await page.locator('input[type=email]').fill('nneka.eze@demo.mega-net.example'); await shot(page,'s09_names_typed');
 await page.getByLabel('Role').selectOption('nurse'); await shot(page,'s10_role_chosen');
 await page.getByLabel('Facility').selectOption({label:'Mega-Net Demo Hospital - Annex Clinic'}); await scrollText('Add / Edit Staff',0); await shot(page,'s11_ready_to_save');
 note('select_role_options',await page.evaluate(()=>[...document.querySelectorAll('select')[0].options].map(o=>o.text)));
 note('select_facility_options',await page.evaluate(()=>[...document.querySelectorAll('select')[1].options].map(o=>o.text)));
 note('password_inputs_on_form',await page.evaluate(()=>document.querySelectorAll('input[type=password]').length));
 await page.click('button:has-text("Save")'); await page.waitForTimeout(500);
 const tr=await page.evaluate(toastRects); await shot(page,'s12_after_invite_toast',{toasts:tr}); note('toast_after_invite',tr.map(t=>t.words.map(w=>w.w).join(' ')));
 note('form_after_invite',await page.evaluate(()=>({first:document.querySelector('input[type=email]').value})));
 await page.waitForTimeout(6500); note('toast_still_visible_after_7s',await page.evaluate(()=>document.querySelectorAll('[role=status]').length));
 await page.click('button:has-text("Clear")'); note('clear_empties_form',await page.evaluate(()=>document.querySelector('input[type=email]').value===''));
 // new row in list
 await page.getByPlaceholder('Filter by name or email...').fill('Nneka'); await page.waitForTimeout(500); await scrollFilter(); await shot(page,'s13_new_row_listed');
 // ---- T2: select row, edit
 await page.locator('[class*=table] tbody tr').first().click(); await page.waitForTimeout(300); await shot(page,'s20_row_clicked_list');
 await scrollText('Add / Edit Staff',0); await shot(page,'s21_form_loaded');
 await page.getByLabel('Role').selectOption('pharmacist'); await page.getByLabel('Facility').selectOption({label:'Mega-Net Demo Hospital - Main Campus'}); await shot(page,'s22_role_facility_changed');
 await page.click('button:has-text("Save")'); await page.waitForTimeout(500); const tr2=await page.evaluate(toastRects); await shot(page,'s23_after_update_toast',{toasts:tr2}); note('toast_after_update',tr2.map(t=>t.words.map(w=>w.w).join(' ')));
 await page.getByPlaceholder('Filter by name or email...').fill('Nneka'); await page.waitForTimeout(500); await scrollFilter(); await shot(page,'s24_row_updated');
 await page.click('button:has-text("Clear")'); await page.waitForTimeout(400); await page.getByPlaceholder('Filter by name or email...').fill('Nneka'); await page.waitForTimeout(500); await scrollFilter(); await shot(page,'s24b_row_updated_unselected');
 // sorting not available at 360
 // edit own row
 await page.getByPlaceholder('Filter by name or email...').fill('Adaeze'); await page.waitForTimeout(500); await page.locator('[class*=table] tbody tr').first().click(); await scrollText('Add / Edit Staff',0);
 await page.getByLabel('Role').selectOption('nurse'); await page.click('button:has-text("Save")'); await page.waitForTimeout(700); await shot(page,'s25_edit_own_error');
 await page.click('button:has-text("Clear")');
 // ---- T3: deactivate
 await page.getByPlaceholder('Filter by name or email...').fill('Nneka'); await page.waitForTimeout(500); await page.locator('[class*=table] tbody tr').first().click(); await scrollText('Add / Edit Staff',0);
 note('deactivate_enabled_on_active',await page.locator('button:has-text("Deactivate")').isEnabled()); await shot(page,'s30_form_ready_deactivate');
 // cancel path
 dialogMode='dismiss'; reqs.length=0; await page.click('button:has-text("Deactivate")'); await page.waitForTimeout(800); note('cancel_path',{dialogs:[...dialogs],deactivate_posts:reqs.filter(u=>u.includes('deactivate')).length});
 note('status_after_cancel',await page.evaluate(()=>[...document.querySelectorAll('tbody tr')].map(r=>r.innerText.replace(/\n+/g,' | '))));
 dialogMode='accept'; dialogs.length=0; await page.click('button:has-text("Deactivate")'); await page.waitForTimeout(500); note('confirm_text',dialogs);
 const tr3=await page.evaluate(toastRects); await shot(page,'s31_after_deactivate_toast',{toasts:tr3}); note('toast_after_deactivate',tr3.map(t=>t.words.map(w=>w.w).join(' ')));
 await page.waitForTimeout(500); await scrollFilter(); await shot(page,'s32_row_deactivated');
 await page.locator('[class*=table] tbody tr').first().click(); await scrollText('Add / Edit Staff',0); note('deactivate_enabled_on_deactivated',await page.locator('button:has-text("Deactivate")').isEnabled()); await shot(page,'s33_button_greyed');
 await page.click('button:has-text("Clear")');
 // own deactivate
 await page.getByPlaceholder('Filter by name or email...').fill('Adaeze'); await page.waitForTimeout(500); await page.locator('[class*=table] tbody tr').first().click(); await scrollText('Add / Edit Staff',0); dialogs.length=0;
 await page.click('button:has-text("Deactivate")'); await page.waitForTimeout(700); note('own_deactivate_confirm',dialogs); const tr4=await page.evaluate(toastRects); await shot(page,'s34_own_deactivate_error',{toasts:tr4}); note('toast_own_deactivate',tr4.map(t=>t.words.map(w=>w.w).join(' ')));
 // nurse view
 const c2=await b.newContext({viewport:{width:360,height:780},deviceScaleFactor:3}); const pn=await login(c2,'mnd.nurse','nurse');
 await pn.goto(BASE+'/app/front-office/nurses-bay'); await pn.waitForTimeout(1500);
 const hb2=await pn.evaluate(()=>{const c=[...document.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2,t:q.top,l:q.left,w:q.width}}).filter(q=>q.t>20&&q.t<140&&q.l<80&&q.w>20);return c[0]||null;}); await pn.mouse.click(hb2.x,hb2.y); await pn.waitForTimeout(600);
 note('nurse_drawer_has_staff_directory',await pn.evaluate(()=>!![...document.querySelectorAll('aside a')].find(x=>x.innerText.includes('Staff Directory'))));
 await pn.evaluate(()=>{const a=[...document.querySelectorAll('aside a')].find(x=>x.innerText.includes('Support'));a&&a.scrollIntoView({block:'center'});}); await shot(pn,'s40_nurse_drawer');
 fs.writeFileSync(OUT+'capture_log.json',JSON.stringify(LOG,null,1)); await b.close();
})().catch(e=>{console.log('SCRIPT ERROR',e.message.slice(0,500));process.exit(1)});
