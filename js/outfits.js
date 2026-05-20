'use strict';

// ══════════════════════════════════════════
//  OUTFITS — historial + creador + footer stats
//  Depends on: app.js globals (dbGetAll, dbGet, dbPut, dbAdd, dbDelete,
//              renderDashboard, closeAllDrops)
//              wardrobe.js (CAT_LABELS)
//              log.js (LOG_CATS)
//              utils.js (toast, formatDate, esc)
//  Loaded before app.js; all calls happen at runtime only.
// ══════════════════════════════════════════

let outfitBuilderPieces = {};
let editingPieces = {};
let historyOutfitsCache = [];
let historyIMap = {};
let historySort = 'count';
let historialStackFilters = [];
let hsfCloseDrop = null;
let historialModalFilters = new Set();
let hmBaseChips    = [];
let hmExtraFilters = [];
let hmModalOutfits = [];

async function initOutfitsView(){
  const allWears = await dbGetAll('wears');
  const allItems = await dbGetAll('items');
  const iMap = {};
  allItems.forEach(it => iMap[it.id] = it);

  historyIMap = iMap;
  historyOutfitsCache = buildHistoryOutfits(allWears, iMap);

  outfitBuilderPieces = {};
  LOG_CATS.forEach(c => { outfitBuilderPieces[c.key] = []; });
  renderOutfitBuilder(allItems);

  renderHistoryOutfits();
  await renderOutfitsList();
  renderHistorialFilters();
}

// ── COLUMN A: History outfits ──

function buildHistoryOutfits(allWears, iMap){
  const dayGroups = {};
  allWears.forEach(w => {
    const key = w.outfitId || ('day-' + w.date);
    if(!dayGroups[key]) dayGroups[key] = {date: w.date, items: []};
    if(w.itemId && iMap[w.itemId]) dayGroups[key].items.push(w.itemId);
  });

  const nucleusMap = {};
  Object.values(dayGroups).forEach(day => {
    if(!day.items.length) return;
    const dalts   = day.items.filter(id => iMap[id]?.category === 'DALT').sort();
    const baixos  = day.items.filter(id => iMap[id]?.category === 'BAIX').sort();
    const sencers = day.items.filter(id => iMap[id]?.category === 'SENCER').sort();

    let nucleusKey;
    if(sencers.length && !dalts.length && !baixos.length){
      nucleusKey = 'S:' + sencers.join('|');
    } else if(dalts.length || baixos.length){
      nucleusKey = 'D:' + dalts.join('|') + '+B:' + baixos.join('|');
    } else return;

    if(!nucleusMap[nucleusKey]){
      nucleusMap[nucleusKey] = {
        nucleusKey,
        daltIds: dalts,
        baixIds: baixos,
        sencerIds: sencers,
        dates: [],
        variants: {}
      };
    }
    nucleusMap[nucleusKey].dates.push(day.date);

    const varKey = day.items.slice().sort().join('|');
    if(!nucleusMap[nucleusKey].variants[varKey]){
      nucleusMap[nucleusKey].variants[varKey] = {items: day.items, count: 0, dates: []};
    }
    nucleusMap[nucleusKey].variants[varKey].count++;
    nucleusMap[nucleusKey].variants[varKey].dates.push(day.date);
  });

  return Object.values(nucleusMap).map(n => {
    let cpwTotal = 0;
    [...n.daltIds, ...n.baixIds, ...n.sencerIds].forEach(id => {
      const it = iMap[id];
      if(it && it.wears > 0) cpwTotal += it.cpw;
    });
    return {
      ...n,
      count: n.dates.length,
      cpwTotal,
      lastWorn: n.dates.slice().sort().pop(),
    };
  });
}

function sortHistoryOutfits(by, btn){
  historySort = by;
  document.querySelectorAll('#ob-sort-count,#ob-sort-cpw').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  renderHistoryOutfits();
}

function renderHistoryOutfits(){
  const container = document.getElementById('history-outfits-list');
  if(!container) return;

  let outfits = [...historyOutfitsCache];

  if(historialStackFilters.length){
    outfits = outfits.filter(o => {
      const allIds = new Set([...o.daltIds, ...o.baixIds, ...o.sencerIds,
        ...Object.values(o.variants).flatMap(v => v.items)]);
      return historialStackFilters.every(f => allIds.has(f.itemId));
    });
  }

  if(historySort === 'count') outfits.sort((a,b) => b.count - a.count);
  else outfits.sort((a,b) => b.cpwTotal - a.cpwTotal);

  if(!outfits.length){
    container.innerHTML = '<div style="font-size:13px;color:var(--text3);padding:1rem 0">'
      + (historialStackFilters.length ? 'Cap outfit trobat amb aquest filtre.' : 'Cap historial encara. Registra el teu primer dia!') + '</div>';
    return;
  }

  const nucleusName = o => {
    const n = id => { const it = historyIMap[id]; return it ? it.brand + ' ' + it.name : id; };
    return o.sencerIds.length
      ? o.sencerIds.map(n).join(' + ')
      : [o.daltIds.map(n).join(' + '), o.baixIds.map(n).join(' + ')].filter(Boolean).join(' · ');
  };

  container.innerHTML = outfits.slice(0,50).map((o, oi) =>
    '<div class="hoc" data-hocidx="' + oi + '">'
    + '<div class="hoc-header">'
    + '<div class="hoc-names">' + esc(nucleusName(o)) + '</div>'
    + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.1rem;flex-shrink:0">'
    + '<div class="hoc-meta"><div class="hoc-count">' + o.count + '</div><div class="hoc-count-lbl">cops</div></div>'
    + '<div style="font-size:11px;color:var(--text3)">'
    + (o.cpwTotal > 0 ? o.cpwTotal.toFixed(2) + '€' : '—')
    + ' · ' + (o.lastWorn ? formatDate(o.lastWorn) : '—') + '</div>'
    + '</div>'
    + '<span class="hoc-arrow">›</span>'
    + '</div>'
    + '</div>'
  ).join('');

  container.querySelectorAll('.hoc').forEach(el => {
    el.addEventListener('click', () => openHistorialModal(outfits[parseInt(el.dataset.hocidx)]));
  });
}

// ── Two-step picker: category → item chips ──
// containerEl is cleared and filled; onSelect(itemId, catKey, label) called on item click.
function attachTwoStepPicker(containerEl, byCat, onSelect){
  const availCats = Object.keys(byCat).filter(k => byCat[k]?.length).map(k => [k, CAT_LABELS[k] || k]);
  if(!availCats.length){ containerEl.innerHTML = ''; return; }

  const catHTML = availCats.map(([cat, label]) =>
    '<span class="hm-add-chip" data-tspcat="' + cat + '">' + esc(label) + '</span>'
  ).join('');

  containerEl.innerHTML =
    '<div class="tsp-cats" style="display:flex;align-items:center;gap:0.3rem;flex-wrap:wrap">'
    + '<span class="hm-add-cat">Afegir</span>' + catHTML + '</div>'
    + '<div class="tsp-items" style="display:none"></div>';

  const stepCats  = containerEl.querySelector('.tsp-cats');
  const stepItems = containerEl.querySelector('.tsp-items');

  containerEl.querySelectorAll('[data-tspcat]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const cat   = btn.dataset.tspcat;
      const items = (byCat[cat] || []).sort((a,b) => (b.wears||0) - (a.wears||0));
      stepItems.innerHTML =
        '<button class="tsp-back">← ' + esc(CAT_LABELS[cat]||cat) + '</button>'
        + '<div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-top:0.3rem">'
        + items.map(it =>
            '<span class="hm-add-chip" data-tspid="' + it.id + '" data-tspcat2="' + it.category + '" data-tsplabel="' + esc(it.brand + ' ' + it.name) + '">'
            + esc(it.brand + ' ' + it.name) + '</span>'
          ).join('')
        + '</div>';
      stepCats.style.display  = 'none';
      stepItems.style.display = 'block';

      stepItems.querySelector('.tsp-back').addEventListener('click', e => {
        e.stopPropagation();
        stepItems.style.display = 'none';
        stepCats.style.display  = 'flex';
      });
      stepItems.querySelectorAll('[data-tspid]').forEach(el => {
        el.addEventListener('click', () => onSelect(el.dataset.tspid, el.dataset.tspcat2, el.dataset.tsplabel));
      });
    });
  });
}

// ── Historial stack filters ──
function renderHistorialFilters(){
  const wrap = document.getElementById('smart-selector-wrap');
  if(!wrap) return;

  // Items that appear in at least one historial outfit
  const wornIds = new Set(historyOutfitsCache.flatMap(o => [...o.daltIds, ...o.baixIds, ...o.sencerIds]));
  const activeIds = new Set(historialStackFilters.map(f => f.itemId));

  // Active filter chips
  const activeHTML = historialStackFilters.map((f, i) =>
    '<span class="hm-chip hm-chip-on" style="font-size:11px">'
    + '<span class="hm-chip-cat">' + esc(CAT_LABELS[f.catKey]||f.catKey) + '</span>'
    + ' ' + esc(f.label)
    + ' <span class="hm-chip-rm" data-hsfrmidx="' + i + '">×</span>'
    + '</span>'
  ).join('');

  // Available items by category (worn, not already active)
  const byCat = {};
  Object.values(historyIMap).forEach(it => {
    if(!wornIds.has(it.id) || activeIds.has(it.id)) return;
    if(!byCat[it.category]) byCat[it.category] = [];
    byCat[it.category].push(it);
  });
  const hasItems = Object.values(historyIMap).some(it => wornIds.has(it.id));
  const hasByCat = Object.keys(byCat).length > 0;

  wrap.innerHTML =
    (activeHTML ? '<div class="hm-filters-row" style="margin-bottom:0.5rem">' + activeHTML + '</div>' : '')
    + (hasItems && hasByCat
      ? '<div class="hsf-drop-wrap">'
        + '<button class="hsf-drop-btn" id="hsf-trigger">+ Afegir peça ▾︎</button>'
        + '<div class="hsf-drop-panel" id="hsf-panel" style="display:none"></div>'
        + '</div>'
      : (!hasItems ? '<div style="font-size:12px;color:var(--text3)">Cap peça registrada encara.</div>' : ''));

  const trigger = document.getElementById('hsf-trigger');
  const panel   = document.getElementById('hsf-panel');
  if(trigger && panel){
    attachTwoStepPicker(panel, byCat, (id, cat, label) => {
      historialStackFilters.push({itemId: id, catKey: cat, label});
      if(hsfCloseDrop){ document.removeEventListener('click', hsfCloseDrop); hsfCloseDrop = null; }
      renderHistorialFilters();
      renderHistoryOutfits();
    });
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const open = panel.style.display !== 'none';
      panel.style.display = open ? 'none' : 'block';
      trigger.textContent = open ? '+ Afegir peça ▾︎' : '+ Afegir peça ▴︎';
    });
    if(hsfCloseDrop) document.removeEventListener('click', hsfCloseDrop);
    hsfCloseDrop = e => {
      if(!wrap.contains(e.target)){
        panel.style.display = 'none';
        trigger.textContent = '+ Afegir peça ▾︎';
        document.removeEventListener('click', hsfCloseDrop);
        hsfCloseDrop = null;
      }
    };
    document.addEventListener('click', hsfCloseDrop);
  }

  wrap.querySelectorAll('[data-hsfrmidx]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      historialStackFilters.splice(parseInt(el.dataset.hsfrmidx), 1);
      renderHistorialFilters();
      renderHistoryOutfits();
    });
  });
}

// ── COLUMN B: Builder ──
function renderOutfitBuilder(allItems){
  const container = document.getElementById('outfit-builder-cats');
  if(!container) return;

  container.innerHTML = LOG_CATS.map(cat =>
    '<div class="log-cat-section">'
    + '<div class="log-cat-header"><span class="log-cat-label">' + cat.label + '</span></div>'
    + '<div id="obrows-' + cat.key + '" class="ob-chips-row"></div>'
    + '<div id="obpicker-' + cat.key + '"></div>'
    + '</div>'
  ).join('');

  LOG_CATS.forEach(cat => renderOutfitBuilderCat(cat.key, allItems));
}

function renderOutfitBuilderCat(catKey, allItems){
  const rowsEl   = document.getElementById('obrows-'   + catKey);
  const pickerEl = document.getElementById('obpicker-' + catKey);
  if(!rowsEl || !pickerEl) return;

  const pieces = outfitBuilderPieces[catKey] || [];

  // Selected piece chips
  rowsEl.innerHTML = pieces.length
    ? pieces.map((p, i) =>
        '<span class="ob-piece-chip">'
        + esc(p.text)
        + ' <span class="ob-chip-rm" data-obrmcat="' + catKey + '" data-obrmidx="' + i + '">×</span>'
        + '</span>'
      ).join('')
    : '';

  rowsEl.querySelectorAll('[data-obrmcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      outfitBuilderPieces[btn.dataset.obrmcat].splice(parseInt(btn.dataset.obrmidx), 1);
      renderOutfitBuilderCat(catKey, allItems);
      checkDuplicateNucleus();
    });
  });

  // Build byType grouping (ordered by TYPES_BY_CAT, then any custom types found)
  const byType = {};
  (TYPES_BY_CAT[catKey] || []).forEach(t => { byType[t] = []; });
  allItems.filter(it => it.category === catKey).forEach(it => {
    const t = it.type || 'Altres';
    if(!byType[t]) byType[t] = [];
    byType[t].push(it);
  });
  Object.keys(byType).forEach(k => { if(!byType[k].length) delete byType[k]; });

  // Trigger button + inline picker panel
  pickerEl.innerHTML =
    '<button class="log-add-btn" id="obtrg-' + catKey + '">+ Afegir peça</button>'
    + '<div id="obpick-' + catKey + '" style="display:none;margin-top:0.4rem"></div>';

  const triggerBtn = document.getElementById('obtrg-'  + catKey);
  const pickPanel  = document.getElementById('obpick-' + catKey);

  if(Object.keys(byType).length){
    triggerBtn.addEventListener('click', () => {
      const open = pickPanel.style.display !== 'none';
      pickPanel.style.display = open ? 'none' : 'block';
      if(!open) attachTwoStepPicker(pickPanel, byType, (id, _cat, label) => {
        outfitBuilderPieces[catKey].push({itemId: id, text: label});
        pickPanel.style.display = 'none';
        renderOutfitBuilderCat(catKey, allItems);
        checkDuplicateNucleus();
      });
    });
  } else {
    triggerBtn.disabled = true;
    triggerBtn.style.opacity = '0.4';
  }
}

function checkDuplicateNucleus(){
  const dalts  = (outfitBuilderPieces['DALT']||[]).map(p=>p.itemId).filter(Boolean).sort();
  const baixos = (outfitBuilderPieces['BAIX']||[]).map(p=>p.itemId).filter(Boolean).sort();
  if(!dalts.length && !baixos.length){ document.getElementById('outfit-dup-warning').style.display='none'; return; }
  const nucleusKey = 'D:' + dalts.join('|') + '+B:' + baixos.join('|');
  const isDup = historyOutfitsCache.some(o => o.nucleusKey === nucleusKey);
  document.getElementById('outfit-dup-warning').style.display = isDup ? 'block' : 'none';
}

function clearOutfitBuilder(){
  LOG_CATS.forEach(c => { outfitBuilderPieces[c.key] = []; });
  const nameInput = document.getElementById('outfit-name-input');
  if(nameInput) nameInput.value = '';
  document.getElementById('outfit-dup-warning').style.display = 'none';
  LOG_CATS.forEach(cat => {
    const rowsEl    = document.getElementById('obrows-'  + cat.key);
    const pickPanel = document.getElementById('obpick-'  + cat.key);
    if(rowsEl)    rowsEl.innerHTML = '';
    if(pickPanel){ pickPanel.style.display = 'none'; pickPanel.innerHTML = ''; }
  });
}

async function saveOutfit(){
  const name = document.getElementById('outfit-name-input')?.value?.trim() || '';
  const pieces = [];
  LOG_CATS.forEach(cat => {
    (outfitBuilderPieces[cat.key]||[]).forEach(p => {
      if(p.itemId) pieces.push({catKey: cat.key, itemId: p.itemId, text: p.text});
    });
  });
  if(!pieces.length){ toast('Afegeix almenys una peça'); return; }

  const outfit = {
    id: 'outfit_' + Date.now(),
    name: name || 'Outfit ' + new Date().toLocaleDateString('ca'),
    pieces,
    createdAt: new Date().toISOString(),
    wears: 0,
    lastWorn: null,
    favourite: false,
  };
  await dbPut('outfits', outfit);
  toast('Outfit guardat ✓');
  clearOutfitBuilder();
  await renderOutfitsList();
}

async function renderOutfitsList(){
  const container = document.getElementById('outfits-list');
  if(!container) return;
  const [outfits, allItems] = await Promise.all([dbGetAll('outfits'), dbGetAll('items')]);
  const iMap = {};
  allItems.forEach(it => iMap[it.id] = it);

  if(!outfits.length){ container.innerHTML = '<div style="font-size:12px;color:var(--text3)">Cap outfit guardat encara.</div>'; return; }
  outfits.sort((a,b) => (b.wears||0) - (a.wears||0));

  container.innerHTML = outfits.map(o => {
    const cpwTotal = (o.pieces||[]).reduce((s,p) => s + (iMap[p.itemId]?.wears > 0 ? (iMap[p.itemId].cpw||0) : 0), 0);
    const cpwStr = cpwTotal > 0 ? cpwTotal.toFixed(2) + '€' : '—';
    return '<div class="saved-outfit-card" data-outfitid="' + o.id + '">'
      + '<div class="saved-outfit-top">'
      + '<div class="saved-outfit-info">'
      + '<div class="saved-outfit-name">' + (o.favourite?'★ ':'') + esc(o.name) + '</div>'
      + '<div class="day-card-cpw">' + (o.wears||0) + ' cops · ' + (o.lastWorn?formatDate(o.lastWorn):'—') + ' · CPU: ' + cpwStr + '</div>'
      + '</div>'
      + '<div class="saved-outfit-btns">'
      + '<button class="btn btn-primary btn-sm" style="font-size:11px" data-wearoutfit="' + o.id + '">Registrar</button>'
      + '<button class="chip ' + (o.favourite?'accent-on':'') + '" style="font-size:11px;padding:0.3rem 0.6rem" data-favoutfit="' + o.id + '">' + (o.favourite?'★':'☆') + '</button>'
      + '<button class="btn btn-danger btn-sm" style="font-size:11px" data-deloutfit="' + o.id + '">×</button>'
      + '<span class="saved-outfit-chevron">▶︎</span>'
      + '</div>'
      + '</div>'
      + '<div class="saved-outfit-body" style="display:none"></div>'
      + '</div>';
  }).join('');

  container.querySelectorAll('.saved-outfit-top').forEach(top => {
    top.addEventListener('click', async e => {
      if(e.target.closest('button')) return;
      const card = top.closest('.saved-outfit-card');
      const body = card.querySelector('.saved-outfit-body');
      const isOpen = card.classList.contains('open');
      card.classList.toggle('open', !isOpen);
      top.querySelector('.saved-outfit-chevron').textContent = isOpen ? '▶︎' : '▾︎';
      body.style.display = isOpen ? 'none' : 'block';
      if(!isOpen && !body.dataset.loaded){
        body.dataset.loaded = '1';
        await expandOutfitCard(card.dataset.outfitid, body, allItems);
      }
    });
  });

  container.querySelectorAll('[data-wearoutfit]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); wearSavedOutfit(btn.dataset.wearoutfit); }));
  container.querySelectorAll('[data-favoutfit]').forEach(btn => btn.addEventListener('click', async e => {
    e.stopPropagation();
    const o = await dbGet('outfits', btn.dataset.favoutfit);
    if(!o) return;
    o.favourite = !o.favourite;
    await dbPut('outfits', o);
    toast(o.favourite ? 'Outfit afegit als preferits ★' : 'Tret dels preferits');
    renderOutfitsList();
  }));
  container.querySelectorAll('[data-deloutfit]').forEach(btn => btn.addEventListener('click', async e => {
    e.stopPropagation();
    if(!confirm('Eliminar aquest outfit guardat?')) return;
    await dbDelete('outfits', btn.dataset.deloutfit);
    toast('Outfit eliminat');
    renderOutfitsList();
  }));
}

async function expandOutfitCard(outfitId, bodyEl, allItems){
  const outfit = await dbGet('outfits', outfitId);
  if(!outfit){ bodyEl.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:0.5rem 0">No trobat.</div>'; return; }

  const iMap = {};
  allItems.forEach(it => iMap[it.id] = it);

  // Piece chips
  const chipsHTML = '<div class="op-pieces-wrap">'
    + outfit.pieces.map(p => {
        const it = iMap[p.itemId];
        return '<span class="op-piece-chip" data-openitem="' + p.itemId + '">'
          + '<span class="op-chip-cat">' + esc(CAT_LABELS[p.catKey]||p.catKey) + '</span>'
          + ' ' + esc(it ? it.brand + ' ' + it.name : p.text)
          + '</span>';
      }).join('')
    + '</div>';

  // Historial-computed sessions: days where ALL outfit pieces were worn
  const allWears = await dbGetAll('wears');
  const outfitItemIds = outfit.pieces.map(p => p.itemId);
  const dateMap = {};
  allWears.forEach(w => {
    if(!dateMap[w.date]) dateMap[w.date] = {};
    if(!dateMap[w.date][w.itemId]) dateMap[w.date][w.itemId] = [];
    dateMap[w.date][w.itemId].push(w.id);
  });
  const sessionList = Object.entries(dateMap)
    .filter(([, dm]) => outfitItemIds.every(id => dm[id]))
    .map(([date, dm]) => ({ date, ids: outfitItemIds.flatMap(id => dm[id]) }))
    .sort((a,b) => b.date.localeCompare(a.date));

  // Group sessions by year, newest first
  const byYear = {};
  sessionList.forEach(s => {
    const y = s.date.substring(0, 4);
    if(!byYear[y]) byYear[y] = [];
    byYear[y].push(s);
  });
  const years = Object.keys(byYear).sort().reverse();

  const sessionsHTML = years.map(year => {
    const ys = byYear[year];
    const chipsRow = ys.map(s =>
      '<span class="op-date-chip" data-date="' + s.date + '">'
      + formatDate(s.date)
      + ' <span class="op-chip-del" data-sessionids="' + s.ids.join(',') + '">×</span>'
      + '</span>'
    ).join('');
    return '<div class="wh-year-block">'
      + '<div class="wh-year-hdr" data-opyear="' + year + '">'
      + year + ' <span class="wh-yr-count">' + ys.length + ' ' + (ys.length===1?'cop':'cops') + '</span>'
      + '<span class="wh-chevron">▶︎</span>'
      + '</div>'
      + '<div class="op-date-chips-wrap" style="display:none">' + chipsRow + '</div>'
      + '</div>';
  }).join('');

  bodyEl.innerHTML =
    '<div class="op-body-inner">'
    + '<div style="display:flex;justify-content:flex-end;margin-bottom:0.4rem">'
    + '<button class="btn btn-secondary btn-sm" style="font-size:11px" data-editoutfit="1">✎ Editar</button>'
    + '</div>'
    + '<div class="op-section-title">Peces</div>'
    + chipsHTML
    + (years.length
      ? '<div class="op-section-title" style="margin-top:0.75rem">Portada ' + sessionList.length + ' ' + (sessionList.length===1?'vegada':'vegades') + ' (historial)</div>'
        + sessionsHTML
      : '<div class="op-section-title" style="margin-top:0.75rem;color:var(--text3)">Sense registres</div>')
    + '</div>';

  bodyEl.querySelectorAll('.op-piece-chip[data-openitem]').forEach(chip => {
    chip.addEventListener('click', () => openItemModal(chip.dataset.openitem));
  });

  bodyEl.querySelector('[data-editoutfit]').addEventListener('click', () => enterOutfitEditMode(outfitId, bodyEl, outfit, allItems));

  // Year accordion toggle
  bodyEl.querySelectorAll('[data-opyear]').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const body = hdr.nextElementSibling;
      const chevron = hdr.querySelector('.wh-chevron');
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'flex';
      chevron.textContent = isOpen ? '▶︎' : '▾︎';
    });
  });

  // Date chip → navigate to calendar
  bodyEl.querySelectorAll('.op-date-chip').forEach(chip => {
    chip.addEventListener('click', e => {
      if(e.target.closest('.op-chip-del')) return;
      const [y, m] = chip.dataset.date.split('-').map(Number);
      calYear = y; calMonth = m - 1;
      showView('calendar', document.querySelector('.nav-btn[data-view="calendar"]'));
      setTimeout(() => openDayModal(chip.dataset.date), 300);
    });
  });

  // Delete session (× on chip)
  bodyEl.querySelectorAll('.op-chip-del').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if(!confirm('Eliminar aquest registre d\'ús?')) return;
      const ids = btn.dataset.sessionids.split(',').map(Number);
      const toDelete = allWears.filter(w => ids.includes(w.id));
      for(const w of toDelete) await dbDelete('wears', w.id);
      const affectedIds = [...new Set(toDelete.map(w => w.itemId))];
      for(const iid of affectedIds){
        const updWears = await dbGetIndex('wears', 'itemId', iid);
        const it = await dbGet('items', iid);
        if(it){
          it.wears = updWears.length;
          it.cpw = it.totalCost > 0 && it.wears > 0 ? it.totalCost / it.wears : 0;
          const s = [...updWears].sort((a,b) => b.date.localeCompare(a.date));
          it.lastWorn = s.length > 0 ? s[0].date : null;
          await dbPut('items', it);
        }
      }
      const o = await dbGet('outfits', outfitId);
      if(o){
        const remaining = sessionList.filter(s => !ids.some(id => s.ids.includes(id)));
        o.wears = remaining.length;
        o.lastWorn = remaining.length > 0 ? remaining[0].date : null;
        await dbPut('outfits', o);
      }
      toast('Registre eliminat');
      renderOutfitsList();
      renderDashboard();
    });
  });
}

// ── Edit mode for saved outfits ──

function enterOutfitEditMode(outfitId, bodyEl, outfit, allItems){
  editingPieces = {};
  LOG_CATS.forEach(c => { editingPieces[c.key] = []; });
  outfit.pieces.forEach(p => { if(editingPieces[p.catKey]) editingPieces[p.catKey].push({itemId: p.itemId, text: p.text}); });
  renderEditOutfitBody(outfitId, bodyEl, outfit, allItems);
}

function renderEditOutfitBody(outfitId, bodyEl, outfit, allItems){
  const catSections = LOG_CATS.map(cat =>
    '<div class="log-cat-section">'
    + '<div class="log-cat-header"><span class="log-cat-label">' + cat.label + '</span>'
    + '<button class="log-add-btn" data-eobcat="' + cat.key + '">+ Afegir</button></div>'
    + '<div id="eorows-' + cat.key + '">' + editOutfitRowsHTML(cat.key, allItems) + '</div>'
    + '</div>'
  ).join('');

  bodyEl.innerHTML =
    '<div class="op-body-inner">'
    + '<div class="form-group" style="margin-bottom:0.65rem">'
    + '<label class="form-label" style="font-size:11px">Nom</label>'
    + '<input class="form-input" id="eo-name" value="' + esc(outfit.name) + '" style="font-size:13px;padding:0.35rem 0.6rem">'
    + '</div>'
    + catSections
    + '<div style="display:flex;gap:0.5rem;margin-top:0.85rem">'
    + '<button class="btn btn-primary btn-sm" id="eo-save">Desar</button>'
    + '<button class="btn btn-secondary btn-sm" id="eo-cancel">Cancel·lar</button>'
    + '</div>'
    + '</div>';

  bodyEl.querySelectorAll('[data-eobcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      editingPieces[btn.dataset.eobcat].push({itemId: null, text: ''});
      refreshEditRows(btn.dataset.eobcat, bodyEl, allItems);
    });
  });
  LOG_CATS.forEach(cat => attachEditRowEvents(cat.key, bodyEl, allItems));

  bodyEl.querySelector('#eo-save').addEventListener('click', async () => {
    const name = bodyEl.querySelector('#eo-name').value.trim();
    if(!name){ toast('El nom no pot estar buit'); return; }
    const pieces = [];
    LOG_CATS.forEach(cat => { (editingPieces[cat.key]||[]).forEach(p => { if(p.itemId) pieces.push({catKey: cat.key, itemId: p.itemId, text: p.text}); }); });
    if(!pieces.length){ toast('Afegeix almenys una peça'); return; }
    const o = await dbGet('outfits', outfitId);
    if(!o) return;
    o.name = name; o.pieces = pieces;
    await dbPut('outfits', o);
    toast('Outfit actualitzat ✓');
    editingPieces = {};
    renderOutfitsList();
  });

  bodyEl.querySelector('#eo-cancel').addEventListener('click', async () => {
    editingPieces = {};
    const o = await dbGet('outfits', outfitId);
    if(o) await expandOutfitCard(outfitId, bodyEl, allItems);
  });
}

function editOutfitRowsHTML(catKey, allItems){
  const pieces = editingPieces[catKey] || [];
  const iMap = {};
  allItems.forEach(it => iMap[it.id] = it);
  if(!pieces.length) return '<div style="font-size:12px;color:var(--text3);padding:2px 0 4px">Cap peça</div>';
  return pieces.map((p, i) => {
    if(p.itemId){
      const it = iMap[p.itemId];
      return '<div class="log-piece-row">'
        + '<span style="font-size:13px;flex:1">' + esc(it ? it.brand + ' ' + it.name : p.text) + '</span>'
        + '<button class="log-rm-btn" data-eormcat="' + catKey + '" data-eormidx="' + i + '">×</button>'
        + '</div>';
    }
    return '<div class="log-piece-row">'
      + '<div class="ac-wrap" style="flex:1;position:relative">'
      + '<input class="log-piece-input" id="eoinput-' + catKey + '-' + i + '" type="text" placeholder="Busca una peça…" autocomplete="off">'
      + '<div class="ac-drop" id="eodrop-' + catKey + '-' + i + '" style="display:none"></div>'
      + '</div>'
      + '<button class="log-rm-btn" data-eormcat="' + catKey + '" data-eormidx="' + i + '">×</button>'
      + '</div>';
  }).join('');
}

function refreshEditRows(catKey, bodyEl, allItems){
  const el = bodyEl.querySelector('#eorows-' + catKey);
  if(el) el.innerHTML = editOutfitRowsHTML(catKey, allItems);
  attachEditRowEvents(catKey, bodyEl, allItems);
}

function attachEditRowEvents(catKey, bodyEl, allItems){
  bodyEl.querySelectorAll('[data-eormcat="' + catKey + '"]').forEach(btn => {
    btn.addEventListener('click', () => {
      editingPieces[catKey].splice(parseInt(btn.dataset.eormidx), 1);
      refreshEditRows(catKey, bodyEl, allItems);
    });
  });
  (editingPieces[catKey]||[]).forEach((p, i) => {
    if(p.itemId) return;
    const input = bodyEl.querySelector('#eoinput-' + catKey + '-' + i);
    const drop  = bodyEl.querySelector('#eodrop-' + catKey + '-' + i);
    if(!input || !drop) return;
    const showDrop = val => {
      const q = val.toLowerCase();
      const matches = allItems.filter(it => it.category === catKey && (it.brand.toLowerCase().includes(q) || it.name.toLowerCase().includes(q))).slice(0, 7);
      drop.innerHTML = matches.map(it =>
        '<div class="ac-item" data-eoid="' + it.id + '" data-eotext="' + esc(it.brand + ' ' + it.name) + '">'
        + '<span class="ac-main">' + esc(it.brand) + ' ' + esc(it.name) + '</span>'
        + ' <span class="ac-sub">' + esc(it.color||'') + '</span>'
        + '</div>'
      ).join('');
      drop.style.display = matches.length && q ? 'block' : 'none';
      drop.querySelectorAll('[data-eoid]').forEach(el => {
        el.addEventListener('mousedown', e => {
          e.preventDefault();
          editingPieces[catKey][i] = {itemId: el.dataset.eoid, text: el.dataset.eotext};
          refreshEditRows(catKey, bodyEl, allItems);
        });
      });
    };
    input.addEventListener('input', () => showDrop(input.value));
    input.addEventListener('focus', () => showDrop(input.value));
    input.addEventListener('blur', () => setTimeout(() => { drop.style.display = 'none'; }, 150));
  });
}

async function wearSavedOutfit(outfitId){
  const outfit = await dbGet('outfits', outfitId);
  if(!outfit) return;
  const date = new Date().toISOString().split('T')[0];
  const wearOutfitId = 'o' + Date.now();
  for(const p of outfit.pieces){
    await dbAdd('wears', {date, itemId: p.itemId, outfitId: wearOutfitId, outfitLabel: outfit.name, freeText: null, catKey: p.catKey, seeded: false});
    const it = await dbGet('items', p.itemId);
    if(it){
      it.wears = (it.wears||0) + 1;
      it.cpw = it.totalCost > 0 ? it.totalCost / it.wears : 0;
      if(!it.lastWorn || date > it.lastWorn) it.lastWorn = date;
      await dbPut('items', it);
    }
  }
  outfit.wears = (outfit.wears||0) + 1;
  outfit.lastWorn = date;
  await dbPut('outfits', outfit);
  toast('Outfit registrat avui ✓');
  renderOutfitsList();
  renderDashboard();
}

// ── Historial modal ──

function openHistorialModal(o){
  hmBaseChips = [...o.daltIds, ...o.baixIds, ...o.sencerIds].map(id => ({
    itemId: id,
    catKey: historyIMap[id]?.category || '',
    label: historyIMap[id] ? historyIMap[id].brand + ' ' + historyIMap[id].name : id
  }));
  historialModalFilters = new Set(hmBaseChips.map(c => c.itemId));
  hmExtraFilters = [];
  renderHistorialModal();
  document.getElementById('historial-modal').classList.add('open');
}

function closeHistorialModal(){
  document.getElementById('historial-modal').classList.remove('open');
}

function renderHistorialModal(){
  const filterEl = document.getElementById('hm-filters');
  const listEl   = document.getElementById('hm-list');
  if(!filterEl || !listEl) return;

  // Toggleable base chips (outfit nucleus pieces)
  const baseHTML = hmBaseChips.map((f, i) => {
    const on = historialModalFilters.has(f.itemId);
    return '<span class="hm-chip ' + (on ? 'hm-chip-on' : 'hm-chip-off') + '" data-hmtoggle="' + i + '" title="' + (on?'Desactivar':'Activar') + ' filtre">'
      + '<span class="hm-chip-cat">' + esc(CAT_LABELS[f.catKey]||f.catKey) + '</span>'
      + ' ' + esc(f.label)
      + '</span>';
  }).join('');

  // Extra filter chips (removable)
  const extraHTML = hmExtraFilters.map((f, i) =>
    '<span class="hm-chip hm-chip-on">'
    + '<span class="hm-chip-cat">' + esc(CAT_LABELS[f.catKey]||f.catKey) + '</span>'
    + ' ' + esc(f.label)
    + ' <span class="hm-chip-rm" data-hmrmextra="' + i + '">×</span>'
    + '</span>'
  ).join('');

  // Compute matching outfits first so the add-filter only surfaces co-worn pieces
  const allActiveIds = new Set([...historialModalFilters, ...hmExtraFilters.map(f => f.itemId)]);
  hmModalOutfits = historyOutfitsCache.filter(o => {
    const all = new Set([...o.daltIds, ...o.baixIds, ...o.sencerIds,
      ...Object.values(o.variants).flatMap(v => v.items)]);
    return [...allActiveIds].every(id => all.has(id));
  });

  // Add-filter chips: only pieces from matching outfits, not already active
  const usedIds = new Set([...hmBaseChips.map(c => c.itemId), ...hmExtraFilters.map(c => c.itemId)]);
  const byCat = {};
  hmModalOutfits.forEach(o => {
    const pieceIds = [...o.daltIds, ...o.baixIds, ...o.sencerIds,
      ...Object.values(o.variants).flatMap(v => v.items)];
    pieceIds.forEach(id => {
      if(usedIds.has(id)) return;
      const it = historyIMap[id];
      if(!it || byCat[it.category]?.some(x => x.id === id)) return;
      if(!byCat[it.category]) byCat[it.category] = [];
      byCat[it.category].push(it);
    });
  });
  filterEl.innerHTML =
    '<div class="hm-filters-row">' + baseHTML + extraHTML + '</div>'
    + '<div id="hm-add-section" style="margin-top:0.45rem"></div>';

  filterEl.querySelectorAll('[data-hmtoggle]').forEach(el => {
    el.addEventListener('click', () => {
      const id = hmBaseChips[parseInt(el.dataset.hmtoggle)].itemId;
      if(historialModalFilters.has(id)) historialModalFilters.delete(id);
      else historialModalFilters.add(id);
      renderHistorialModal();
    });
  });
  filterEl.querySelectorAll('[data-hmrmextra]').forEach(el => {
    el.addEventListener('click', () => {
      hmExtraFilters.splice(parseInt(el.dataset.hmrmextra), 1);
      renderHistorialModal();
    });
  });

  const addSection = document.getElementById('hm-add-section');
  if(addSection){
    attachTwoStepPicker(addSection, byCat, (id, cat, label) => {
      hmExtraFilters.push({itemId: id, catKey: cat, label});
      renderHistorialModal();
    });
  }

  listEl.innerHTML = hmModalOutfits.length
    ? '<div style="font-size:12px;color:var(--text3);margin-bottom:0.6rem">' + hmModalOutfits.length + ' outfit' + (hmModalOutfits.length!==1?'s':'') + '</div>'
      + hmModalOutfits.slice(0,40).map((o, oi) => renderHmOutfitCard(o, oi)).join('')
    : '<div style="font-size:13px;color:var(--text3)">Cap outfit coincideix.</div>';

  listEl.querySelectorAll('[data-hmsave]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const o = hmModalOutfits[parseInt(btn.dataset.hmsave)];
      showHmSaveForm([...o.daltIds, ...o.baixIds, ...o.sencerIds], o.count, o.lastWorn);
    });
  });
  listEl.querySelectorAll('[data-hmvsave]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const [oi, vi] = btn.dataset.hmvsave.split('-').map(Number);
      const o = hmModalOutfits[oi];
      const v = Object.values(o.variants).sort((a,b) => b.count - a.count)[vi];
      showHmSaveForm(v.items, v.count, v.dates[v.dates.length-1]);
    });
  });
}

function showHmSaveForm(itemIds, wears, lastWorn){
  document.querySelectorAll('.hm-save-dialog').forEach(d => d.remove());

  const autoName = itemIds.map(id => {
    const it = historyIMap[id];
    return it ? it.brand + ' ' + it.name : id;
  }).join(' + ');

  const overlay = document.createElement('div');
  overlay.className = 'hm-save-dialog';
  overlay.innerHTML =
    '<div class="hm-save-dialog-box">'
    + '<div style="font-size:13px;font-weight:500;margin-bottom:0.75rem">Guarda l\'outfit</div>'
    + '<input class="form-input hm-si-input" type="text" value="' + esc(autoName) + '" placeholder="Nom del conjunt…" style="margin-bottom:0.4rem">'
    + '<button class="hm-si-autoname" style="font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:0;text-decoration:underline;display:block;margin-bottom:0.85rem">Usar nom de les peces</button>'
    + '<div style="display:flex;gap:0.5rem;justify-content:flex-end">'
    + '<button class="btn btn-secondary" data-hmsicancl="1">Cancel·lar</button>'
    + '<button class="btn btn-primary" data-hmsisave="1">Desar</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);
  const input = overlay.querySelector('.hm-si-input');
  input.focus(); input.select();

  const close = () => overlay.remove();

  overlay.querySelector('.hm-si-autoname').addEventListener('click', () => { input.value = autoName; input.focus(); });
  overlay.querySelector('[data-hmsisave]').addEventListener('click', async () => {
    const name = input.value.trim() || autoName;
    close();
    await saveHistorialOutfit(name, itemIds, wears, lastWorn);
  });
  overlay.querySelector('[data-hmsicancl]').addEventListener('click', close);
  overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
  input.addEventListener('keydown', e => { if(e.key === 'Enter') overlay.querySelector('[data-hmsisave]').click(); if(e.key === 'Escape') close(); });
}

function renderHmOutfitCard(o, oi){
  const n = id => { const it = historyIMap[id]; return it ? esc(it.brand + ' ' + it.name) : id; };
  const nucleusStr = o.sencerIds.length
    ? o.sencerIds.map(n).join(' + ')
    : [o.daltIds.map(n).join(' + '), o.baixIds.map(n).join(' + ')].filter(Boolean).join(' · ');
  const cpwStr = o.cpwTotal > 0 ? o.cpwTotal.toFixed(2) + '€' : '—';

  const variants = Object.values(o.variants).sort((a,b) => b.count - a.count);
  const varHTML = variants.map((v, vi) => {
    const extras = v.items.filter(id => !o.daltIds.includes(id) && !o.baixIds.includes(id) && !o.sencerIds.includes(id));
    const extraStr = extras.length ? extras.map(n).join(', ') : 'Sense extras';
    return '<div class="hoc-variant" style="display:flex;align-items:center;gap:0.5rem">'
      + '<div style="flex:1"><div class="hoc-variant-name">' + extraStr + '</div>'
      + '<div class="hoc-variant-stat">' + v.count + '× · ' + formatDate(v.dates[v.dates.length-1]) + '</div></div>'
      + '<button class="btn btn-secondary btn-sm" style="font-size:10px;padding:0.15rem 0.5rem;flex-shrink:0" data-hmvsave="' + oi + '-' + vi + '">Guardar</button>'
      + '</div>';
  }).join('');

  return '<div class="hoc" style="margin-bottom:0.5rem">'
    + '<div class="hoc-header" style="cursor:default">'
    + '<div class="hoc-names">' + nucleusStr + '</div>'
    + '<div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0">'
    + '<div class="hoc-meta"><div class="hoc-count">' + o.count + '</div><div class="hoc-count-lbl">cops</div></div>'
    + '<div style="font-size:11px;color:var(--text3)">' + cpwStr + '</div>'
    + '<button class="btn btn-secondary btn-sm" style="font-size:11px" data-hmsave="' + oi + '">Guardar nucli</button>'
    + '</div>'
    + '</div>'
    + (varHTML ? '<div class="hoc-body" style="display:block">' + varHTML + '</div>' : '')
    + '</div>';
}

async function saveHistorialOutfit(name, itemIds, wears, lastWorn){
  const pieces = itemIds.map(id => ({
    catKey: historyIMap[id]?.category || '',
    itemId: id,
    text: historyIMap[id] ? historyIMap[id].brand + ' ' + historyIMap[id].name : id
  }));
  await dbPut('outfits', {
    id: 'outfit_' + Date.now(), name, pieces,
    createdAt: new Date().toISOString(),
    wears: wears || 0, lastWorn: lastWorn || null, favourite: false
  });
  toast('Outfit "' + name + '" guardat ✓');
  await renderOutfitsList();
}

// ── Footer stats ──
async function renderFooter(){
  const footer = document.getElementById('app-footer');
  if(footer) footer.style.display = 'block';
  const allItems = await dbGetAll('items');
  const allWears = await dbGetAll('wears');
  const totalCost = allItems.reduce((s,i) => s + (i.totalCost||0), 0);
  const el = document.getElementById('footer-stats');
  if(el){
    el.innerHTML =
      '<span class="footer-stat-val">' + allItems.length + '</span> peces<br>'
      + '<span class="footer-stat-val">' + allWears.length + '</span> usos registrats<br>'
      + '<span class="footer-stat-val">' + totalCost.toFixed(0) + '€</span> invertits en total';
  }
}
