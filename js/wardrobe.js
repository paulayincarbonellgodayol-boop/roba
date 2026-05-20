'use strict';

// ══════════════════════════════════════════
//  WARDROBE — constants, state + rendering
//  Depends on: app.js globals (dbGetAll, dbGet, dbPut, dbDelete,
//              openItemModal, renderDashboard)
//              utils.js (toast, buildPaginator, flowerSVG, esc,
//                        catIconSVG, colorPill)
//  Loaded before app.js; all calls happen at runtime only.
// ══════════════════════════════════════════

const CAT_LABELS = {DALT:'Dalt',BAIX:'Baix',SENCER:'Sencer',JAQUETA:'Jaqueta',SABATES:'Sabates',ARRACADES:'Arracades',BOLSO:'Bolso',ALTRES:'Altres'};

const TYPES_BY_CAT = {
  DALT:['Samarreta','Brusa','Camisa','Jersei','Cardigan','Top','Altres'],
  BAIX:['Texans','Pantalons','Faldilla','Shorts','Mitges','Altres'],
  SENCER:['Vestit','Mono','Altres'],
  JAQUETA:['Jaqueta','Texana','Abric','Americana','Dessuadora','Anorac','Impermeable','Altres'],
  SABATES:['Bambes','Botina','Sandàlies','Xancletes','Altres'],
  ARRACADES:['Llarga','Curta','Aro','Altres'],
  BOLSO:['Bandolera','Motxilla','Nanses','Formal','Ronyonera','Altres'],
  ALTRES:['Cinturó','Ulleres de sol','Biquini','Guants','Paraigua','Altres'],
};

let wrdPage = 1;
const WRD_PER = 16;
let wrdSelectMode = false;
let wrdSelected = new Set();
let wrdActiveFilters = {
  cat:'', type:'',
  seasons:[], formality:[], colors:[], brands:[], sizes:[], status:[], tags:[],
  priceMin:null, priceMax:null, cpuMin:null, cpuMax:null, needsInfo:false,
  colorOp:'AND', tagOp:'AND'
};
let wrdFilterBarBuilt = false;

const SEASON_LABELS  = {estiu:'Estiu',hivern:'Hivern',primavera:'Primavera',tardor:'Tardor'};
const FORMAL_LABELS  = {casual:'Casual','smart-casual':'Smart Casual',formal:'Formal'};
const STATUS_LABELS  = {active:'Activa',retired:'Retirada','needs-info':'Cal info'};

function buildSliderPanel(panelId, items, valueKey, unit, step){
  const panel = document.getElementById(panelId);
  if(!panel) return;
  const vals = items.map(i => parseFloat(i[valueKey])||0).filter(v => v > 0);
  if(!vals.length){ panel.innerHTML = '<div style="padding:0.75rem;font-size:12px;color:var(--text3)">Cap valor</div>'; return; }
  const lo = Math.floor(Math.min(...vals));
  const hi = Math.ceil(Math.max(...vals));
  const fmtNum = v => step < 1 ? (+v).toFixed(2) : String(Math.round(+v));
  const minId = panelId + '-min', maxId = panelId + '-max';
  panel.innerHTML =
    '<div style="padding:0.85rem 1rem 0.8rem;min-width:220px">'
    + '<div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.65rem">'
    + '<input type="number" id="' + minId + '-num" class="form-input" min="' + lo + '" max="' + hi + '" value="' + fmtNum(lo) + '" step="' + step + '" style="width:68px;padding:0.25rem 0.4rem;font-size:12px;text-align:center">'
    + '<span style="font-size:12px;color:var(--text3);flex:1;text-align:center">—</span>'
    + '<input type="number" id="' + maxId + '-num" class="form-input" min="' + lo + '" max="' + hi + '" value="' + fmtNum(hi) + '" step="' + step + '" style="width:68px;padding:0.25rem 0.4rem;font-size:12px;text-align:center">'
    + '<span style="font-size:11px;color:var(--text3)">' + unit + '</span>'
    + '</div>'
    + '<div class="dbl-range-wrap">'
    + '<div class="dbl-range-track"><div class="dbl-range-fill" id="' + panelId + '-fill"></div></div>'
    + '<input type="range" class="dbl-range-thumb" id="' + minId + '" min="' + lo + '" max="' + hi + '" value="' + lo + '" step="' + step + '">'
    + '<input type="range" class="dbl-range-thumb" id="' + maxId + '" min="' + lo + '" max="' + hi + '" value="' + hi + '" step="' + step + '">'
    + '</div>'
    + '</div>';

  const minEl  = panel.querySelector('#' + minId),      maxEl  = panel.querySelector('#' + maxId);
  const minNum = panel.querySelector('#' + minId + '-num'), maxNum = panel.querySelector('#' + maxId + '-num');
  const fill   = panel.querySelector('#' + panelId + '-fill');
  const range  = hi - lo;

  const updateFill = () => {
    const p1 = range ? (+minEl.value - lo) / range * 100 : 0;
    const p2 = range ? (+maxEl.value - lo) / range * 100 : 100;
    fill.style.left = p1 + '%';
    fill.style.width = (p2 - p1) + '%';
    minEl.style.zIndex = +minEl.value >= hi ? 2 : 1;
  };

  const fireFilter = () => { updateClearBtn(); wrdPage = 1; renderWardrobe(); };

  const onSlide = () => {
    if(+minEl.value > +maxEl.value) maxEl.value = minEl.value;
    if(+maxEl.value < +minEl.value) minEl.value = maxEl.value;
    minNum.value = fmtNum(minEl.value);
    maxNum.value = fmtNum(maxEl.value);
    updateFill(); fireFilter();
  };

  const onMinNum = () => {
    let v = Math.max(lo, Math.min(+minNum.value, +maxEl.value));
    if(isNaN(v)) return;
    minEl.value = v; minNum.value = fmtNum(v); updateFill(); fireFilter();
  };
  const onMaxNum = () => {
    let v = Math.min(hi, Math.max(+maxNum.value, +minEl.value));
    if(isNaN(v)) return;
    maxEl.value = v; maxNum.value = fmtNum(v); updateFill(); fireFilter();
  };

  minEl.addEventListener('input', onSlide);
  maxEl.addEventListener('input', onSlide);
  minNum.addEventListener('change', onMinNum);
  maxNum.addEventListener('change', onMaxNum);
  // Also update live as user types if value is valid
  minNum.addEventListener('input', () => {
    const v = +minNum.value;
    if(v >= lo && v <= +maxEl.value){ minEl.value = v; updateFill(); fireFilter(); }
  });
  maxNum.addEventListener('input', () => {
    const v = +maxNum.value;
    if(v <= hi && v >= +minEl.value){ maxEl.value = v; updateFill(); fireFilter(); }
  });

  panel._reset = () => {
    minEl.value = lo; maxEl.value = hi;
    minNum.value = fmtNum(lo); maxNum.value = fmtNum(hi);
    updateFill();
  };

  updateFill();
}

// ── Filter bar ──
function buildFilterBar(allItems){
  if(wrdFilterBarBuilt) return;
  wrdFilterBarBuilt = true;

  const colorSet = new Set();
  allItems.forEach(it => {
    const cols = Array.isArray(it.colors) && it.colors.length
      ? it.colors
      : (it.color ? it.color.split(/\s+i\s+|,\s*/).map(c=>c.trim()).filter(Boolean) : []);
    cols.forEach(c => { if(c) colorSet.add(c); });
  });
  const sorted = [...colorSet].sort();
  const mIdx = sorted.findIndex(c => c.toLowerCase() === 'multicolor');
  if(mIdx > 0){ const mc = sorted.splice(mIdx, 1)[0]; sorted.unshift(mc); }
  const colors = sorted;
  const brands = [...new Set(allItems.map(i=>i.brand).filter(Boolean))].sort();
  const sizes  = [...new Set(allItems.map(i=>i.size).filter(Boolean))].sort();

  const tags = [...new Set(allItems.flatMap(i => i.tags || []))].sort();

  buildMultiPanel('fp-season',   Object.keys(SEASON_LABELS),  SEASON_LABELS,  'seasons');
  buildMultiPanel('fp-formality',Object.keys(FORMAL_LABELS),  FORMAL_LABELS,  'formality');
  buildMultiPanelWithFlowers('fp-color', colors, 'colors');
  buildMultiPanel('fp-brand',    brands, null, 'brands');
  buildMultiPanel('fp-size',     sizes,  null, 'sizes');
  buildMultiPanel('fp-status',   Object.keys(STATUS_LABELS),  STATUS_LABELS,  'status');
  buildTagPanel('fp-tag', tags);
  buildSliderPanel('fp-price', allItems, 'price', '€',    1);
  buildSliderPanel('fp-cpu',   allItems, 'cpw',   '€/ús', 0.05);

  document.querySelectorAll('.fbar-btn[data-fb]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const panel = document.getElementById('fp-' + btn.dataset.fb);
      const wasOpen = panel.classList.contains('open');
      document.querySelectorAll('.fbar-panel').forEach(p=>p.classList.remove('open'));
      if(!wasOpen) panel.classList.add('open');
    });
  });
  document.addEventListener('click', () => document.querySelectorAll('.fbar-panel').forEach(p=>p.classList.remove('open')));
  document.querySelectorAll('.fbar-panel').forEach(p => p.addEventListener('click', e => e.stopPropagation()));
}

function buildMultiPanelWithFlowers(panelId, values, filterKey){
  const panel=document.getElementById(panelId);
  if(!panel||!values.length){if(panel)panel.innerHTML='<div style="padding:0.5rem 0.85rem;font-size:12px;color:var(--text3)">Cap valor</div>';return;}
  panel.innerHTML='<div style="padding:0.4rem 0.5rem;border-bottom:1px solid var(--border2);display:flex;gap:0.4rem">'
    +'<button class="chip" style="font-size:11px;padding:0.2rem 0.6rem" data-colorop="OR">ALGUN</button>'
    +'<button class="chip on" style="font-size:11px;padding:0.2rem 0.6rem" data-colorop="AND">TOTS</button>'
    +'</div>'
    +values.map(v=>
      '<label class="fbar-option" style="gap:8px"><input type="checkbox" value="'+v+'" data-fkey="'+filterKey+'">'+flowerSVG(v,14)+' '+esc(v)+'</label>'
    ).join('');
  panel.querySelectorAll('[data-colorop]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      panel.querySelectorAll('[data-colorop]').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      wrdActiveFilters.colorOp=btn.dataset.colorop;
      wrdPage=1;renderWardrobe();
    });
  });
  panel.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change',()=>{
      if(cb.checked){if(!wrdActiveFilters[cb.dataset.fkey].includes(cb.value))wrdActiveFilters[cb.dataset.fkey].push(cb.value);}
      else wrdActiveFilters[cb.dataset.fkey]=wrdActiveFilters[cb.dataset.fkey].filter(x=>x!==cb.value);
      updateBadge(cb.dataset.fkey);wrdPage=1;renderWardrobe();
    });
  });
}

function buildTagPanel(panelId, tags){
  const panel = document.getElementById(panelId);
  if(!panel){ return; }
  if(!tags.length){ panel.innerHTML='<div style="padding:0.5rem 0.85rem;font-size:12px;color:var(--text3)">Cap etiqueta encara</div>'; return; }
  panel.innerHTML='<div style="padding:0.4rem 0.5rem;border-bottom:1px solid var(--border2);display:flex;gap:0.4rem">'
    +'<button class="chip" style="font-size:11px;padding:0.2rem 0.6rem" data-tagop="OR">ALGUN</button>'
    +'<button class="chip on" style="font-size:11px;padding:0.2rem 0.6rem" data-tagop="AND">TOTS</button>'
    +'</div>'
    +tags.map(t=>'<label class="fbar-option"><input type="checkbox" value="'+esc(t)+'" data-fkey="tags">'+esc(t)+'</label>').join('');
  panel.querySelectorAll('[data-tagop]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      panel.querySelectorAll('[data-tagop]').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      wrdActiveFilters.tagOp=btn.dataset.tagop;
      wrdPage=1; renderWardrobe();
    });
  });
  panel.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change',()=>{
      if(cb.checked){ if(!wrdActiveFilters.tags.includes(cb.value)) wrdActiveFilters.tags.push(cb.value); }
      else wrdActiveFilters.tags = wrdActiveFilters.tags.filter(x=>x!==cb.value);
      updateBadge('tags'); wrdPage=1; renderWardrobe();
    });
  });
}

function buildMultiPanel(panelId, values, displayMap, filterKey){
  const panel = document.getElementById(panelId);
  if(!panel || !values.length){ if(panel) panel.innerHTML='<div style="padding:0.5rem 0.85rem;font-size:12px;color:var(--text3)">Cap valor</div>'; return; }
  panel.innerHTML = values.map(v =>
    '<label class="fbar-option"><input type="checkbox" value="' + v + '" data-fkey="' + filterKey + '">' + (displayMap?.[v]||v) + '</label>'
  ).join('');
  panel.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      if(cb.checked){ if(!wrdActiveFilters[cb.dataset.fkey].includes(cb.value)) wrdActiveFilters[cb.dataset.fkey].push(cb.value); }
      else wrdActiveFilters[cb.dataset.fkey] = wrdActiveFilters[cb.dataset.fkey].filter(x=>x!==cb.value);
      updateBadge(cb.dataset.fkey);
      wrdPage=1; renderWardrobe();
    });
  });
}

function updateBadge(filterKey){
  const fbMap = {seasons:'season',formality:'formality',colors:'color',brands:'brand',sizes:'size',status:'status',tags:'tag'};
  const fbKey = fbMap[filterKey] || filterKey;
  const badge = document.getElementById('fb-badge-' + fbKey);
  if(!badge) return;
  const n = wrdActiveFilters[filterKey]?.length || 0;
  badge.textContent = n; badge.classList.toggle('show', n>0);
  const btn = document.querySelector('[data-fb="'+fbKey+'"]');
  if(btn) btn.classList.toggle('has-filter', n>0);
  updateClearBtn();
}

function updateClearBtn(){
  const pmEl = document.getElementById('fp-price-min'), pxEl = document.getElementById('fp-price-max');
  const cmEl = document.getElementById('fp-cpu-min'),   cxEl = document.getElementById('fp-cpu-max');
  const has = ['seasons','formality','colors','brands','sizes','status','tags'].some(k=>wrdActiveFilters[k].length>0)
    || (pmEl && +pmEl.value > +pmEl.min) || (pxEl && +pxEl.value < +pxEl.max)
    || (cmEl && +cmEl.value > +cmEl.min) || (cxEl && +cxEl.value < +cxEl.max);
  const btn = document.getElementById('fbar-clear');
  if(btn) btn.style.display = has ? 'inline' : 'none';
}

function clearAllFilters(){
  ['seasons','formality','colors','brands','sizes','status','tags'].forEach(k=>{ wrdActiveFilters[k]=[]; }); wrdActiveFilters.colorOp='AND'; wrdActiveFilters.tagOp='AND';
  document.querySelectorAll('.fbar-panel input[type=checkbox]').forEach(cb=>cb.checked=false);
  document.querySelectorAll('.fbar-badge').forEach(b=>{b.textContent='';b.classList.remove('show');});
  document.querySelectorAll('.fbar-btn').forEach(b=>b.classList.remove('has-filter'));
  ['fp-price','fp-cpu'].forEach(base => { const p = document.getElementById(base); if(p && p._reset) p._reset(); });
  updateClearBtn(); wrdPage=1; renderWardrobe();
}

// ── Select mode ──
function toggleSelectMode(){
  wrdSelectMode = !wrdSelectMode; wrdSelected.clear();
  document.getElementById('wrd-select-mode')?.classList.toggle('on', wrdSelectMode);
  document.getElementById('wrd-delete-selected').style.display = 'none';
  renderWardrobe();
}

async function deleteSelected(){
  if(!wrdSelected.size) return;
  if(!confirm('Eliminar ' + wrdSelected.size + ' pe' + (wrdSelected.size!==1?'ces':'ça') + ' seleccionades? Aniran a la paperera.')) return;
  for(const id of wrdSelected){
    const item = await dbGet('items', id);
    if(item){ item.deletedAt = Date.now(); await dbPut('trash', item); await dbDelete('items', id); }
  }
  toast(wrdSelected.size + ' pe' + (wrdSelected.size!==1?'ces':'ça') + ' mogudes a la paperera');
  wrdSelected.clear(); wrdSelectMode=false;
  document.getElementById('wrd-select-mode')?.classList.remove('on');
  document.getElementById('wrd-delete-selected').style.display='none';
  renderWardrobe(); renderDashboard();
}

// ── Main render ──
async function renderWardrobe(){
  const search = (document.getElementById('wrd-search')?.value||'').toLowerCase();
  const sort   = document.getElementById('wrd-sort')?.value||'reps_desc';
  let items = await dbGetAll('items');

  if(!document.getElementById('cat-chips').children.length) buildWardrobeChips();
  buildFilterBar(items);

  const pMinEl = document.getElementById('fp-price-min'), pMaxEl = document.getElementById('fp-price-max');
  const cMinEl = document.getElementById('fp-cpu-min'),   cMaxEl = document.getElementById('fp-cpu-max');
  const pMin = pMinEl && +pMinEl.value > +pMinEl.min ? +pMinEl.value : null;
  const pMax = pMaxEl && +pMaxEl.value < +pMaxEl.max ? +pMaxEl.value : null;
  const cMin = cMinEl && +cMinEl.value > +cMinEl.min ? +cMinEl.value : null;
  const cMax = cMaxEl && +cMaxEl.value < +cMaxEl.max ? +cMaxEl.value : null;
  ['price','cpu'].forEach(k => {
    const min = k==='price'?pMin:cMin, max = k==='price'?pMax:cMax;
    const badge = document.getElementById('fb-badge-'+k);
    if(badge){ badge.textContent=min||max?'1':''; badge.classList.toggle('show',!!(min||max)); }
    const btn = document.querySelector('[data-fb="'+k+'"]');
    if(btn) btn.classList.toggle('has-filter',!!(min||max));
  });

  if(wrdActiveFilters.cat) items = items.filter(i=>i.category===wrdActiveFilters.cat);
  if(wrdActiveFilters.type) items = items.filter(i=>(i.type||'').toLowerCase()===wrdActiveFilters.type.toLowerCase());
  if(wrdActiveFilters.seasons.length) items = items.filter(i=>i.seasons.length===0||wrdActiveFilters.seasons.some(s=>i.seasons.includes(s)));
  if(wrdActiveFilters.formality.length) items = items.filter(i=>i.formality.length===0||wrdActiveFilters.formality.some(f=>i.formality.includes(f)));
  if(wrdActiveFilters.colors.length) items = items.filter(i=>{
    const cols=(Array.isArray(i.colors)&&i.colors.length?i.colors:(i.color?i.color.split(/\s+i\s+|,\s*/).map(c=>c.trim()).filter(Boolean):[])).map(c=>c.toLowerCase());
    if(wrdActiveFilters.colorOp==='AND')
      return wrdActiveFilters.colors.every(c=>cols.includes(c.toLowerCase()));
    return wrdActiveFilters.colors.some(c=>cols.includes(c.toLowerCase()));
  });
  if(wrdActiveFilters.tags.length) items = items.filter(i=>{
    const t = i.tags || [];
    if(wrdActiveFilters.tagOp==='AND') return wrdActiveFilters.tags.every(tag=>t.includes(tag));
    return wrdActiveFilters.tags.some(tag=>t.includes(tag));
  });
  if(wrdActiveFilters.brands.length) items = items.filter(i=>wrdActiveFilters.brands.includes(i.brand));
  if(wrdActiveFilters.sizes.length)  items = items.filter(i=>wrdActiveFilters.sizes.includes(i.size));
  if(wrdActiveFilters.status.length) items = items.filter(i=>wrdActiveFilters.status.some(s=>{
    const isRetired = i.units?.length>0 && i.units.every(u=>u.retired);
    if(s==='active') return !isRetired;
    if(s==='retired') return isRetired;
    if(s==='needs-info') return i.needsInfo;
    return true;
  }));
  if(pMin!=null) items = items.filter(i=>i.price>=pMin);
  if(pMax!=null) items = items.filter(i=>i.price<=pMax);
  if(cMin!=null) items = items.filter(i=>i.wears>0&&i.cpw>=cMin);
  if(cMax!=null) items = items.filter(i=>i.wears>0&&i.cpw<=cMax);
  if(wrdActiveFilters.needsInfo) items = items.filter(i=>i.needsInfo);
  if(search) items = items.filter(i=>
    i.brand.toLowerCase().includes(search)||i.name.toLowerCase().includes(search)||
    i.color.toLowerCase().includes(search)||(i.type||'').toLowerCase().includes(search));

  if(sort==='reps_desc') items.sort((a,b)=>b.wears-a.wears);
  else if(sort==='reps_asc') items.sort((a,b)=>a.wears-b.wears);
  else if(sort==='cpw_asc') items.sort((a,b)=>(a.wears?a.cpw:9999)-(b.wears?b.cpw:9999));
  else if(sort==='cpw_desc') items.sort((a,b)=>b.cpw-a.cpw);
  else if(sort==='price_desc') items.sort((a,b)=>b.price-a.price);
  else if(sort==='alpha') items.sort((a,b)=>(a.brand+a.name).localeCompare(b.brand+b.name,'ca'));

  const needsCount = items.filter(i=>i.needsInfo).length;
  const niEl = document.getElementById('needs-info-banner');
  if(needsCount&&!wrdActiveFilters.needsInfo){ document.getElementById('needs-info-text').textContent=needsCount+' peça'+(needsCount!==1?'s':'')+' sense informació completa'; niEl.style.display='flex'; }
  else niEl.style.display='none';

  document.getElementById('wardrobe-sub').textContent = items.length+' pe'+(items.length!==1?'ces':'ça')+' trobades';

  const startI=(wrdPage-1)*WRD_PER, slice=items.slice(startI,startI+WRD_PER);
  const grid=document.getElementById('wardrobe-grid');
  if(!slice.length){ grid.innerHTML='<div class="empty"><span class="empty-icon">👗</span><div class="empty-title">Cap peça trobada</div><p>Prova a canviar els filtres.</p></div>'; document.getElementById('wardrobe-pag').innerHTML=''; return; }

  const delBtn=document.getElementById('wrd-delete-selected');
  if(delBtn) delBtn.style.display=wrdSelectMode&&wrdSelected.size>0?'inline-flex':'none';

  grid.innerHTML = slice.map(item => {
    const isRetired = item.units?.length>0&&item.units.every(u=>u.retired);
    const cpwStr = item.wears>0?item.cpw.toFixed(2)+'€':'—';
    const needsPill = item.needsInfo?'<span class="pill pill-warn">Cal info</span>':'';
    const retiredPill = isRetired?'<span class="pill" style="background:#E5E5E5;color:#888">Retirada</span>':'';
    const tagPills = (item.tags&&item.tags.length)?item.tags.map(t=>'<span class="pill pill-tag">'+esc(t)+'</span>').join(''):'';
    const isSelected = wrdSelected.has(item.id);
    return '<div class="item-card fade-in'+(item.needsInfo?' needs-info':'')+(item.favourite?' favourite':'')+(wrdSelectMode?' selectable':'')+(isSelected?' selected-card':'')+'" data-id="'+item.id+'" style="'+(isRetired?'opacity:0.55':'')+'">'
      +(wrdSelectMode?'<input type="checkbox" class="select-checkbox"'+(isSelected?' checked':'')+'>'  :'')
      +(()=>{
      const cols=Array.isArray(item.colors)&&item.colors.length?item.colors:(item.color?item.color.split(/\s+i\s+|,\s*/).map(c=>c.trim()).filter(Boolean):[]);
      return '<div class="ic-photo" style="display:flex;align-items:center;justify-content:center;background:var(--bg3)">'+catIconSVG(item.category,cols,56)+'</div>';
    })()
      +'<div class="ic-brand">'+item.brand+'</div>'
      +(()=>{
      const cols=Array.isArray(item.colors)&&item.colors.length?item.colors:(item.color?item.color.split(/\s+i\s+|,\s*/).map(c=>c.trim()).filter(Boolean):[item.color||'']);
      return '<div class="ic-name">'+item.name+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:0.4rem">'+cols.map(c=>colorPill(c)).join('')+'</div>';
    })()
      +'<div class="ic-pills"><span class="pill pill-cat">'+(CAT_LABELS[item.category]||item.category)+'</span>'+(item.type?'<span class="pill pill-type">'+item.type+'</span>':'')+tagPills+needsPill+retiredPill+'</div>'
      +'<div class="ic-stats"><div class="ic-stat"><div class="ic-stat-val">'+item.wears+'</div><div class="ic-stat-lbl">Usos</div></div><div class="ic-stat"><div class="ic-stat-val">'+(item.totalCost>0?item.totalCost.toFixed(0)+'€':'—')+'</div><div class="ic-stat-lbl">Cost total</div></div><div class="ic-stat"><div class="ic-stat-val">'+cpwStr+'</div><div class="ic-stat-lbl">CPU</div></div></div>'
      +'</div>';
  }).join('');

  grid.querySelectorAll('.item-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      if(wrdSelectMode){
        const id=card.dataset.id, cb=card.querySelector('.select-checkbox');
        if(wrdSelected.has(id)){wrdSelected.delete(id);card.classList.remove('selected-card');if(cb)cb.checked=false;}
        else{wrdSelected.add(id);card.classList.add('selected-card');if(cb)cb.checked=true;}
        const db2=document.getElementById('wrd-delete-selected');
        if(db2) db2.style.display=wrdSelected.size>0?'inline-flex':'none';
        return;
      }
      openItemModal(card.dataset.id);
    });
  });
  buildPaginator('wardrobe-pag',items.length,wrdPage,WRD_PER,p=>{wrdPage=p;renderWardrobe();});
}

function buildWardrobeChips(){
  const catEl=document.getElementById('cat-chips');
  catEl.innerHTML='';
  const allBtn=document.createElement('button'); allBtn.className='chip on'; allBtn.textContent='Totes';
  allBtn.addEventListener('click',()=>toggleCatChip('',allBtn)); catEl.appendChild(allBtn);
  Object.entries(CAT_LABELS).forEach(([k,v])=>{
    const btn=document.createElement('button'); btn.className='chip'; btn.textContent=v;
    btn.addEventListener('click',()=>toggleCatChip(k,btn)); catEl.appendChild(btn);
  });
}

function buildTypeChips(cat){
  const typeEl=document.getElementById('type-chips');
  if(!cat||!TYPES_BY_CAT[cat]){typeEl.style.display='none';wrdActiveFilters.type='';return;}
  typeEl.innerHTML='<span style="font-size:12px;color:var(--text3);margin-right:0.25rem;align-self:center">Tipus:</span>';
  const allBtn=document.createElement('button'); allBtn.className='chip on'; allBtn.textContent='Tots';
  allBtn.addEventListener('click',()=>{typeEl.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));allBtn.classList.add('on');wrdActiveFilters.type='';wrdPage=1;renderWardrobe();});
  typeEl.appendChild(allBtn);
  TYPES_BY_CAT[cat].forEach(t=>{
    const btn=document.createElement('button'); btn.className='chip'; btn.textContent=t;
    btn.addEventListener('click',()=>{typeEl.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));btn.classList.add('on');wrdActiveFilters.type=t;wrdPage=1;renderWardrobe();});
    typeEl.appendChild(btn);
  });
  typeEl.style.display='flex';
}

function toggleCatChip(cat,btn){
  document.querySelectorAll('#cat-chips .chip').forEach(c=>c.classList.remove('on'));
  btn.classList.add('on'); wrdActiveFilters.cat=cat; wrdActiveFilters.type='';
  buildTypeChips(cat); wrdPage=1; renderWardrobe();
}

function filterChip(type){if(type==='needs_info'){wrdActiveFilters.needsInfo=true;wrdPage=1;renderWardrobe();}}
