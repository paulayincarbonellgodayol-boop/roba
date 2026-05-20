'use strict';
// ══════════════════════════════════════════
//  SEED DATA — demo wardrobe 2023-2026
//  78 items · 20 outfits · 9 ocasions · ~500 wear records
// ══════════════════════════════════════════

function mapSeason(s){
  if(!s||s===''||s==='Tot') return ['primavera','estiu','tardor','hivern'];
  if(s==='Estiu')           return ['estiu'];
  if(s==='Primavera/Estiu') return ['primavera','estiu'];
  if(s==='Entretemps+Estiu')return ['primavera','estiu','tardor'];
  if(s==='Entretemps')      return ['primavera','tardor'];
  if(s==='Tardor/Hivern')   return ['tardor','hivern'];
  if(s==='Hivern')          return ['hivern'];
  return [];
}

const RAW_ITEMS = [
/* ── DALT (20 tops) ──────────────────────────────────────────────── */
{id:'si001',category:'DALT',brand:'Zara',           name:'Samarreta bàsica blanca',      color:'Blanc',      type:'Samarreta',rawSeason:'Tot',            rawFormality:'casual',              size:'S',  price:12,  purchaseYear:'2022',tags:['bàsic']},
{id:'si002',category:'DALT',brand:'H&M',            name:'Samarreta de ratlles navy',    color:'Blau i Blanc',type:'Samarreta',rawSeason:'Entretemps+Estiu',rawFormality:'casual',              size:'S',  price:15,  purchaseYear:'2023',tags:[]},
{id:'si003',category:'DALT',brand:'Stradivarius',   name:'Samarreta oversize negra',     color:'Negre',      type:'Samarreta',rawSeason:'Tot',            rawFormality:'casual',              size:'S',  price:14,  purchaseYear:'2022',tags:['bàsic']},
{id:'si004',category:'DALT',brand:'Bershka',        name:'Top crop groc',                color:'Groc',       type:'Top',      rawSeason:'Primavera/Estiu',rawFormality:'casual',              size:'S',  price:16,  purchaseYear:'2023',tags:['estiu']},
{id:'si005',category:'DALT',brand:'Mango',          name:'Camisa de lli beix',           color:'Beix',       type:'Camisa',   rawSeason:'Primavera/Estiu',rawFormality:'casual,smart-casual', size:'S',  price:35,  purchaseYear:'2023',tags:['estiu']},
{id:'si006',category:'DALT',brand:'Massimo Dutti',  name:'Camisa de cotó blanca',        color:'Blanc',      type:'Camisa',   rawSeason:'Tot',            rawFormality:'smart-casual,formal', size:'S',  price:65,  purchaseYear:'2022',tags:['feina']},
{id:'si007',category:'DALT',brand:'COS',            name:'Brusa negra asimètrica',       color:'Negre',      type:'Brusa',    rawSeason:'Entretemps+Estiu',rawFormality:'smart-casual',        size:'S',  price:89,  purchaseYear:'2023',tags:['feina']},
{id:'si008',category:'DALT',brand:'Maje',           name:"Top d'encaix blanc",           color:'Blanc',      type:'Top',      rawSeason:'Primavera/Estiu',rawFormality:'smart-casual,formal', size:'S',  price:120, purchaseYear:'2023',tags:[]},
{id:'si009',category:'DALT',brand:'The Kooples',    name:'Camisa de seda floral',        color:'Multicolor', type:'Camisa',   rawSeason:'Primavera/Estiu',rawFormality:'smart-casual,formal', size:'S',  price:175, purchaseYear:'2023',tags:[]},
{id:'si010',category:'DALT',brand:'Sandro',         name:'Jersei de punt cru',           color:'Beix',       type:'Jersei',   rawSeason:'Tardor/Hivern',  rawFormality:'smart-casual',        size:'S',  price:185, purchaseYear:'2022',tags:['hivern']},
{id:'si011',category:'DALT',brand:'Ralph Lauren',   name:'Jersei de coll rodó navy',     color:'Blau',       type:'Jersei',   rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'S',  price:120, purchaseYear:'2022',tags:[]},
{id:'si012',category:'DALT',brand:'Scalpers',       name:'Camisa oxford blava',          color:'Blau',       type:'Camisa',   rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'S',  price:60,  purchaseYear:'2023',tags:[]},
{id:'si013',category:'DALT',brand:'Karl Lagerfeld', name:'Brusa de seda rosa',           color:'Rosa',       type:'Brusa',    rawSeason:'Primavera/Estiu',rawFormality:'smart-casual,formal', size:'S',  price:145, purchaseYear:'2024',tags:[]},
{id:'si014',category:'DALT',brand:'Emporio Armani', name:'Top de punt negre',            color:'Negre',      type:'Top',      rawSeason:'Tardor/Hivern',  rawFormality:'smart-casual,formal', size:'S',  price:140, purchaseYear:'2024',tags:['feina']},
{id:'si015',category:'DALT',brand:'Primark',        name:'Samarreta oversize blanca',    color:'Blanc',      type:'Samarreta',rawSeason:'Tot',            rawFormality:'casual',              size:'S',  price:7,   purchaseYear:'2023',tags:['bàsic']},
{id:'si016',category:'DALT',brand:'Pull&Bear',      name:'Samarreta gràfica vintage',    color:'Negre',      type:'Samarreta',rawSeason:'Entretemps+Estiu',rawFormality:'casual',             size:'S',  price:18,  purchaseYear:'2023',tags:[]},
{id:'si017',category:'DALT',brand:'Mango',          name:'Brusa de volants blanca',      color:'Blanc',      type:'Brusa',    rawSeason:'Primavera/Estiu',rawFormality:'casual,smart-casual', size:'S',  price:42,  purchaseYear:'2023',tags:[]},
{id:'si018',category:'DALT',brand:'Brownie',        name:'Camisa de quadres verd/blanc', color:'Verd i Blanc',type:'Camisa',  rawSeason:'Entretemps+Estiu',rawFormality:'casual',             size:'S',  price:55,  purchaseYear:'2024',tags:[]},
{id:'si019',category:'DALT',brand:'Hugo Boss',      name:'Polo blanc',                   color:'Blanc',      type:'Altres',   rawSeason:'Primavera/Estiu',rawFormality:'casual,smart-casual', size:'S',  price:85,  purchaseYear:'2023',tags:[]},
{id:'si020',category:'DALT',brand:'Armani Exchange',name:'Top de tiretes negre',         color:'Negre',      type:'Top',      rawSeason:'Estiu',          rawFormality:'casual,smart-casual,formal',size:'S',price:70,purchaseYear:'2024',tags:[]},

/* ── BAIX (15 bottoms) ───────────────────────────────────────────── */
{id:'si021',category:'BAIX',brand:'Calvin Klein',   name:'Texans slim blaus',            color:'Blau',       type:'Texans',   rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'27', price:80,  purchaseYear:'2022',tags:['bàsic']},
{id:'si022',category:'BAIX',brand:'Pull&Bear',      name:'Texans rectes blau fosc',      color:'Blau',       type:'Texans',   rawSeason:'Entretemps+Estiu',rawFormality:'casual',             size:'36', price:30,  purchaseYear:'2023',tags:[]},
{id:'si023',category:'BAIX',brand:'Zara',           name:'Pantalons cargo verds',        color:'Verd',       type:'Pantalons',rawSeason:'Entretemps+Estiu',rawFormality:'casual',             size:'36', price:35,  purchaseYear:'2023',tags:[]},
{id:'si024',category:'BAIX',brand:'Stradivarius',   name:'Faldilla plissada blava',      color:'Blau',       type:'Faldilla', rawSeason:'Entretemps+Estiu',rawFormality:'casual,smart-casual',size:'36', price:22,  purchaseYear:'2023',tags:['estiu']},
{id:'si025',category:'BAIX',brand:'Mango',          name:'Faldilla midi marró',          color:'Marró',      type:'Faldilla', rawSeason:'Tardor/Hivern',  rawFormality:'smart-casual,formal', size:'36', price:45,  purchaseYear:'2022',tags:['feina']},
{id:'si026',category:'BAIX',brand:'COS',            name:'Pantalons negres tall recte',  color:'Negre',      type:'Pantalons',rawSeason:'Entretemps+Estiu',rawFormality:'smart-casual,formal',size:'36', price:95,  purchaseYear:'2022',tags:['feina','bàsic']},
{id:'si027',category:'BAIX',brand:'Massimo Dutti',  name:'Pantalons de lli beix',        color:'Beix',       type:'Pantalons',rawSeason:'Primavera/Estiu',rawFormality:'smart-casual',        size:'36', price:75,  purchaseYear:'2023',tags:['feina']},
{id:'si028',category:'BAIX',brand:'Bershka',        name:'Shorts vaquers',               color:'Blau',       type:'Shorts',   rawSeason:'Estiu',          rawFormality:'casual',              size:'36', price:18,  purchaseYear:'2023',tags:['estiu']},
{id:'si029',category:'BAIX',brand:'Pepe Jeans',     name:"Texans boca d'ampolla",        color:'Blau',       type:'Texans',   rawSeason:'Entretemps+Estiu',rawFormality:'casual,smart-casual',size:'27', price:70,  purchaseYear:'2023',tags:[]},
{id:'si030',category:'BAIX',brand:'Zara',           name:'Pantalons de lli verd fosc',   color:'Verd',       type:'Pantalons',rawSeason:'Primavera/Estiu',rawFormality:'casual,smart-casual', size:'36', price:40,  purchaseYear:'2024',tags:[]},
{id:'si031',category:'BAIX',brand:'H&M',            name:'Faldilla denim midi',          color:'Blau',       type:'Faldilla', rawSeason:'Primavera/Estiu',rawFormality:'casual',              size:'36', price:25,  purchaseYear:'2023',tags:[]},
{id:'si032',category:'BAIX',brand:'Stradivarius',   name:'Pantalons de cuero negres',    color:'Negre',      type:'Pantalons',rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'36', price:35,  purchaseYear:'2024',tags:[]},
{id:'si033',category:'BAIX',brand:'Mango',          name:'Shorts de lli beix',           color:'Beix',       type:'Shorts',   rawSeason:'Estiu',          rawFormality:'casual,smart-casual', size:'36', price:30,  purchaseYear:'2023',tags:['estiu']},
{id:'si034',category:'BAIX',brand:'Scalpers',       name:'Pantalons chino beix',         color:'Beix',       type:'Pantalons',rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'36', price:65,  purchaseYear:'2022',tags:[]},
{id:'si035',category:'BAIX',brand:'Primark',        name:'Texans rectes negres',         color:'Negre',      type:'Texans',   rawSeason:'Tot',            rawFormality:'casual',              size:'36', price:15,  purchaseYear:'2023',tags:['bàsic']},

/* ── SENCER (8 one-pieces) ───────────────────────────────────────── */
{id:'si036',category:'SENCER',brand:'Sandro',       name:'Vestit mini floral',           color:'Multicolor', type:'Vestit',   rawSeason:'Primavera/Estiu',rawFormality:'smart-casual,formal', size:'36', price:250, purchaseYear:'2023',tags:[]},
{id:'si037',category:'SENCER',brand:'Mango',        name:'Mono de lli blanc',            color:'Blanc',      type:'Mono',     rawSeason:'Estiu',          rawFormality:'casual,smart-casual', size:'S',  price:55,  purchaseYear:'2023',tags:['estiu']},
{id:'si038',category:'SENCER',brand:'Zara',         name:'Vestit llarg negre',           color:'Negre',      type:'Vestit',   rawSeason:'Tot',            rawFormality:'smart-casual,formal', size:'S',  price:49,  purchaseYear:'2022',tags:['versàtil']},
{id:'si039',category:'SENCER',brand:'The Kooples',  name:'Vestit de punt negre',         color:'Negre',      type:'Vestit',   rawSeason:'Tardor/Hivern',  rawFormality:'smart-casual,formal', size:'S',  price:210, purchaseYear:'2022',tags:[]},
{id:'si040',category:'SENCER',brand:'Stradivarius', name:"Vestit floral d'estiu",        color:'Multicolor', type:'Vestit',   rawSeason:'Primavera/Estiu',rawFormality:'casual',              size:'S',  price:28,  purchaseYear:'2023',tags:['estiu']},
{id:'si041',category:'SENCER',brand:'Maje',         name:'Vestit midi beix',             color:'Beix',       type:'Vestit',   rawSeason:'Primavera/Estiu',rawFormality:'smart-casual,formal', size:'36', price:275, purchaseYear:'2024',tags:[]},
{id:'si042',category:'SENCER',brand:'Bershka',      name:'Vestit estampat tropical',     color:'Multicolor', type:'Vestit',   rawSeason:'Estiu',          rawFormality:'casual',              size:'S',  price:25,  purchaseYear:'2023',tags:['estiu']},
{id:'si043',category:'SENCER',brand:'H&M',          name:'Mono de teixit negre',         color:'Negre',      type:'Mono',     rawSeason:'Entretemps+Estiu',rawFormality:'smart-casual,formal',size:'S',  price:45,  purchaseYear:'2024',tags:[]},

/* ── JAQUETA (9 outerwear) ───────────────────────────────────────── */
{id:'si044',category:'JAQUETA',brand:'The Kooples', name:'Americana negra',              color:'Negre',      type:'Americana',rawSeason:'Entretemps+Estiu',rawFormality:'smart-casual,formal',size:'36', price:295, purchaseYear:'2022',tags:['feina']},
{id:'si045',category:'JAQUETA',brand:'Maje',        name:'Jaqueta de tweed multicolor',  color:'Multicolor', type:'Americana',rawSeason:'Tardor/Hivern',  rawFormality:'smart-casual',        size:'36', price:230, purchaseYear:'2023',tags:[]},
{id:'si046',category:'JAQUETA',brand:'Zara',        name:'Jaqueta de cuir negra',        color:'Negre',      type:'Jaqueta',  rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'S',  price:89,  purchaseYear:'2022',tags:[]},
{id:'si047',category:'JAQUETA',brand:'H&M',         name:'Abric de llana camel',         color:'Marró',      type:'Abric',    rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'S',  price:79,  purchaseYear:'2022',tags:['hivern']},
{id:'si048',category:'JAQUETA',brand:'Massimo Dutti',name:'Americana de llana gris',     color:'Gris',       type:'Americana',rawSeason:'Tardor/Hivern',  rawFormality:'smart-casual,formal', size:'36', price:180, purchaseYear:'2022',tags:['feina']},
{id:'si049',category:'JAQUETA',brand:'Scalpers',    name:'Jaqueta bomber verda',         color:'Verd',       type:'Jaqueta',  rawSeason:'Entretemps',     rawFormality:'casual',              size:'S',  price:90,  purchaseYear:'2024',tags:[]},
{id:'si050',category:'JAQUETA',brand:'Mango',       name:'Abric oversize beix',          color:'Beix',       type:'Abric',    rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'S',  price:105, purchaseYear:'2023',tags:['hivern']},
{id:'si051',category:'JAQUETA',brand:'Ralph Lauren', name:'Jaqueta acolchada navy',      color:'Blau',       type:'Jaqueta',  rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'S',  price:195, purchaseYear:'2023',tags:[]},
{id:'si052',category:'JAQUETA',brand:'Stradivarius',name:'Jaqueta vaquera clara',        color:'Blau',       type:'Texana',   rawSeason:'Entretemps+Estiu',rawFormality:'casual',             size:'S',  price:35,  purchaseYear:'2023',tags:[]},

/* ── SABATES (10 shoes) ──────────────────────────────────────────── */
{id:'si053',category:'SABATES',brand:'Decathlon',   name:'Bambes de running blanques',   color:'Blanc',      type:'Bambes',   rawSeason:'Tot',            rawFormality:'casual',              size:'37', price:45,  purchaseYear:'2022',tags:['sport']},
{id:'si054',category:'SABATES',brand:'Zara',        name:'Bambes blanques plataforma',   color:'Blanc',      type:'Bambes',   rawSeason:'Primavera/Estiu',rawFormality:'casual',              size:'37', price:39,  purchaseYear:'2023',tags:[]},
{id:'si055',category:'SABATES',brand:'Mango',       name:'Botina de taló negra',         color:'Negre',      type:'Botina',   rawSeason:'Tardor/Hivern',  rawFormality:'smart-casual,formal', size:'37', price:65,  purchaseYear:'2022',tags:['feina']},
{id:'si056',category:'SABATES',brand:'Zara',        name:'Sandàlies planes beix',        color:'Beix',       type:'Sandàlies',rawSeason:'Primavera/Estiu',rawFormality:'casual,smart-casual', size:'37', price:29,  purchaseYear:'2023',tags:['estiu']},
{id:'si057',category:'SABATES',brand:'Stradivarius',name:'Botina de cuir marró',         color:'Marró',      type:'Botina',   rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'37', price:50,  purchaseYear:'2022',tags:[]},
{id:'si058',category:'SABATES',brand:'H&M',         name:'Espardenyes naturals',         color:'Beix',       type:'Sandàlies',rawSeason:'Primavera/Estiu',rawFormality:'casual',              size:'37', price:18,  purchaseYear:'2023',tags:['estiu']},
{id:'si059',category:'SABATES',brand:'Mango',       name:'Sabates de taló baix negres',  color:'Negre',      type:'Botina',   rawSeason:'Entretemps+Estiu',rawFormality:'smart-casual,formal',size:'37', price:55,  purchaseYear:'2023',tags:['feina']},
{id:'si060',category:'SABATES',brand:'Bershka',     name:'Bambes de lona blaves',        color:'Blau',       type:'Bambes',   rawSeason:'Entretemps+Estiu',rawFormality:'casual',             size:'37', price:22,  purchaseYear:'2023',tags:[]},
{id:'si061',category:'SABATES',brand:'Zara',        name:'Botes altes de cuir negres',   color:'Negre',      type:'Botina',   rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'37', price:79,  purchaseYear:'2023',tags:[]},
{id:'si062',category:'SABATES',brand:'Stradivarius',name:'Sandàlies de platja blanques', color:'Blanc',      type:'Sandàlies',rawSeason:'Estiu',          rawFormality:'casual',              size:'37', price:20,  purchaseYear:'2023',tags:['estiu','platja']},

/* ── ARRACADES (8 earrings) ──────────────────────────────────────── */
{id:'si063',category:'ARRACADES',brand:'Mira Mira', name:'Aro daurat gran',              color:'Daurat',     type:'Aro',      rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'única',price:35, purchaseYear:'2022',tags:[]},
{id:'si064',category:'ARRACADES',brand:'Mira Mira', name:'Arracades llargues de pedres', color:'Multicolor', type:'Llarga',   rawSeason:'Tot',            rawFormality:'smart-casual,formal', size:'única',price:55, purchaseYear:'2023',tags:[]},
{id:'si065',category:'ARRACADES',brand:'Tous',      name:'Arracades rodones plata',      color:'Platejat',   type:'Curta',    rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'única',price:65, purchaseYear:'2022',tags:[]},
{id:'si066',category:'ARRACADES',brand:'Bimba y Lola',name:'Arracades llargues blanques',color:'Blanc',      type:'Llarga',   rawSeason:'Tot',            rawFormality:'smart-casual,formal', size:'única',price:75, purchaseYear:'2023',tags:[]},
{id:'si067',category:'ARRACADES',brand:'Zara',      name:'Arracades de clip negres',     color:'Negre',      type:'Curta',    rawSeason:'Tot',            rawFormality:'casual',              size:'única',price:12, purchaseYear:'2023',tags:[]},
{id:'si068',category:'ARRACADES',brand:'Mira Mira', name:'Arracades mini daurads',       color:'Daurat',     type:'Curta',    rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'única',price:28, purchaseYear:'2023',tags:['bàsic']},
{id:'si069',category:'ARRACADES',brand:'Tous',      name:'Arracades de cor vermell',     color:'Vermell',    type:'Curta',    rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'única',price:45, purchaseYear:'2024',tags:[]},
{id:'si070',category:'ARRACADES',brand:'Bimba y Lola',name:'Arracades de perles',        color:'Blanc',      type:'Llarga',   rawSeason:'Tot',            rawFormality:'smart-casual,formal', size:'única',price:95, purchaseYear:'2024',tags:[]},

/* ── BOLSO (8 bags) ──────────────────────────────────────────────── */
{id:'si071',category:'BOLSO',brand:'Furla',         name:'Metropolis negre',             color:'Negre',      type:'',         rawSeason:'Tot',            rawFormality:'smart-casual,formal', size:'única',price:280,purchaseYear:'2022',tags:[]},
{id:'si072',category:'BOLSO',brand:'Longchamp',     name:'Le Pliage beix',               color:'Beix',       type:'',         rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'única',price:95, purchaseYear:'2022',tags:['viatge']},
{id:'si073',category:'BOLSO',brand:'Tous',          name:'Bossa de cuir marró',          color:'Marró',      type:'',         rawSeason:'Tardor/Hivern',  rawFormality:'casual,smart-casual', size:'única',price:145,purchaseYear:'2023',tags:[]},
{id:'si074',category:'BOLSO',brand:'Zara',          name:'Bossa de palla beix',          color:'Beix',       type:'',         rawSeason:'Primavera/Estiu',rawFormality:'casual',              size:'única',price:25, purchaseYear:'2023',tags:['estiu']},
{id:'si075',category:'BOLSO',brand:'Bimba y Lola',  name:'Bossa de cadena platejada',    color:'Platejat',   type:'',         rawSeason:'Tot',            rawFormality:'smart-casual,formal', size:'única',price:195,purchaseYear:'2023',tags:[]},
{id:'si076',category:'BOLSO',brand:'Longchamp',     name:'Le Pliage negre',              color:'Negre',      type:'',         rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'única',price:95, purchaseYear:'2023',tags:['viatge']},
{id:'si077',category:'BOLSO',brand:'Tous',          name:'Kaos mini marró',              color:'Marró',      type:'',         rawSeason:'Tot',            rawFormality:'casual,smart-casual', size:'única',price:120,purchaseYear:'2024',tags:[]},
{id:'si078',category:'BOLSO',brand:'Zara',          name:'Bossa de roba negra',          color:'Negre',      type:'',         rawSeason:'Tot',            rawFormality:'casual',              size:'única',price:22, purchaseYear:'2024',tags:[]},
];

// ──────────────────────────────────────────
//  buildItem — converts raw entry to full item object
// ──────────────────────────────────────────
function buildItem(raw){
  const seasons  = mapSeason(raw.rawSeason);
  const formality= (raw.rawFormality||'casual').split(',').map(s=>s.trim()).filter(Boolean);
  const price    = raw.price||0;
  const qty      = raw.quantity||1;
  const totalCost= price * qty;
  const units    = [];
  for(let i=0;i<qty;i++){
    units.push({
      id:`${raw.id}_u${i+1}`,
      purchaseDate: raw.purchaseYear ? raw.purchaseYear+'-01-01' : '',
      purchaseYear: raw.purchaseYear||'',
      retired: false, retiredDate: ''
    });
  }
  return {
    id: raw.id, category: raw.category, brand: raw.brand, name: raw.name,
    color: raw.color,
    colors: raw.color ? raw.color.split(/\s+i\s+|,\s*/).map(c=>c.trim()).filter(Boolean) : [],
    type: raw.type, seasons, formality,
    price, quantity: qty, units, totalCost,
    wears: 0, cpw: totalCost,
    purchaseYear: raw.purchaseYear||'',
    size: raw.size||'', tags: raw.tags||[],
    images:[], favourite:false, needsInfo:false,
    notes:'', lastWorn:null, seeded:true,
  };
}

// ──────────────────────────────────────────
//  buildWears — generates ~500 wear records (2023-2026)
//  seasonal logic · formality matching · color compatibility
// ──────────────────────────────────────────
function buildWears(){
  let _s=20250520;
  function rand(){ _s=Math.imul(_s^(_s>>>16),0x45d9f3b);_s=Math.imul(_s^(_s>>>16),0x45d9f3b);return((_s^(_s>>>16))>>>0)/0xffffffff; }
  function pick(arr){ return arr[Math.floor(rand()*arr.length)]; }
  function maybe(p){ return rand()<p; }

  const byCat={};
  RAW_ITEMS.forEach(it=>{ if(!byCat[it.category])byCat[it.category]=[]; byCat[it.category].push(it); });

  function bkt(mo){ if(mo>=6&&mo<=8)return 'estiu'; if(mo>=11||mo<=2)return 'hivern'; return 'entretemps'; }

  function fitsSeason(it,b){
    const s=it.rawSeason||'';
    if(!s||s==='Tot')            return true;
    if(s==='Estiu')              return b==='estiu';
    if(s==='Hivern')             return b==='hivern';
    if(s==='Primavera/Estiu')    return b==='estiu'||b==='entretemps';
    if(s==='Entretemps+Estiu')   return b==='estiu'||b==='entretemps';
    if(s==='Entretemps')         return b==='entretemps'||b==='estiu';
    if(s==='Tardor/Hivern')      return b==='hivern'||b==='entretemps';
    return true;
  }

  function fitsFormality(it,outfit){
    const f=(it.rawFormality||'casual').split(',').map(s=>s.trim());
    if(outfit==='casual') return f.some(x=>x==='casual'||x==='smart-casual');
    if(outfit==='formal') return f.some(x=>x==='formal'||x==='smart-casual');
    return true; // smart-casual accepts everything
  }

  const WARM=new Set(['Vermell','Taronja','Fucsia','Rosa','Groc']);
  const COOL=new Set(['Blau','Verd','Lila','Blau marí','Blau cel']);
  function fam(c){ const m=(c||'').split(/\s+i\s+/)[0]; if(WARM.has(m))return'warm'; if(COOL.has(m))return'cool'; return'neutral'; }
  function colOk(c1,c2){ const f1=fam(c1),f2=fam(c2); if(f1==='neutral'||f2==='neutral')return true; return f1===f2; }

  function fil(pool,b,outfit,ref){
    let r=pool.filter(it=>fitsSeason(it,b)&&fitsFormality(it,outfit));
    if(ref){ const fc=r.filter(it=>colOk(it.color,ref)); if(fc.length>0)r=fc; }
    return r;
  }

  const wears=[];
  const start=new Date('2023-01-01');
  const end  =new Date('2026-05-14');

  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
    if(!maybe(0.10)) continue; // ~10% → ~128 days → ~500 wear records

    const date=d.toISOString().slice(0,10);
    const mo=d.getMonth()+1;
    const b=bkt(mo);
    const fr=rand();
    const outfit=fr<0.65?'casual':fr<0.92?'smart-casual':'formal';
    const ids=[];
    let ref='Negre';

    // Core piece (SENCER or DALT+BAIX)
    const sPool=fil(byCat['SENCER']||[],b,outfit,null);
    if(b!=='hivern'&&sPool.length>0&&maybe(0.20)){
      const s=pick(sPool); ids.push(s.id); ref=s.color;
    } else {
      const dPool=fil(byCat['DALT']||[],b,outfit,null);
      if(dPool.length>0){
        const top=pick(dPool); ids.push(top.id); ref=top.color;
        const bPool=fil((byCat['BAIX']||[]).filter(it=>it.type!=='Mitges'&&it.type!=='Leggings'),b,outfit,ref);
        if(bPool.length>0) ids.push(pick(bPool).id);
      }
    }

    // Outerwear (always in winter, often in shoulder, rarely in summer)
    const needsJacket=b==='hivern'||(b==='entretemps'&&maybe(0.60))||(b==='estiu'&&maybe(0.05));
    if(needsJacket){
      const jPool=fil(byCat['JAQUETA']||[],b,outfit,ref);
      if(jPool.length>0) ids.push(pick(jPool).id);
    }

    // Shoes (always)
    let saPre=(byCat['SABATES']||[]).filter(it=>{
      if((it.type==='Sandàlies'||it.type==='Xancletes')&&b==='hivern') return false;
      if(it.type==='Botina'&&b==='estiu') return false;
      return true;
    });
    let saPool=fil(saPre,b,outfit,ref);
    if(!saPool.length) saPool=saPre.length?saPre:byCat['SABATES']||[];
    if(saPool.length>0) ids.push(pick(saPool).id);

    // Earrings (75%)
    if(maybe(0.75)){ const ar=byCat['ARRACADES']||[]; if(ar.length>0) ids.push(pick(ar).id); }

    // Bag (65%)
    if(maybe(0.65)){
      const boPool=fil(byCat['BOLSO']||[],b,outfit,ref);
      if(boPool.length>0) ids.push(pick(boPool).id);
    }

    if(ids.length>0) wears.push({date,items:ids});
  }

  return wears;
}

const RAW_WEARS=buildWears();

// ──────────────────────────────────────────
//  RAW_OUTFITS — 20 saved outfits
// ──────────────────────────────────────────
const RAW_OUTFITS=[
  {id:'so001',name:'Dimarts de reunions',      pieces:['si007','si026','si055','si071']},
  {id:'so002',name:'Pas tranquil pel barri',   pieces:['si005','si027','si057','si063']},
  {id:'so003',name:'Mercat i cafè',            pieces:['si003','si021','si053','si074']},
  {id:'so004',name:'Dijous de nit',            pieces:['si039','si055','si066','si075']},
  {id:'so005',name:'Estiu de festa',           pieces:['si036','si056','si064','si073']},
  {id:'so006',name:'Mode aeroport',            pieces:['si012','si022','si053','si072']},
  {id:'so007',name:'Còctel de feina',          pieces:['si013','si026','si059','si065']},
  {id:'so008',name:'Diumenge suau',            pieces:['si011','si024','si058','si073']},
  {id:'so009',name:"Hivern a l'oficina",       pieces:['si048','si006','si027','si057']},
  {id:'so010',name:'Tardor i fulles',          pieces:['si045','si022','si054','si075']},
  {id:'so011',name:'Mono de juliol',           pieces:['si037','si056','si064']},
  {id:'so012',name:'El dia a dia',             pieces:['si010','si023','si053','si065']},
  {id:'so013',name:'Brunch de dissabte',       pieces:['si017','si024','si054','si063']},
  {id:'so014',name:'Cita a cegues',            pieces:['si041','si055','si066','si071']},
  {id:'so015',name:'Concert al parc',          pieces:['si002','si029','si060','si063']},
  {id:'so016',name:'Viatge de cap de setmana', pieces:['si015','si028','si053','si072']},
  {id:'so017',name:'Primera setmana de tardor',pieces:['si010','si025','si057','si076']},
  {id:'so018',name:"Cap d'any",               pieces:['si044','si038','si061','si070']},
  {id:'so019',name:'Platja del matí',          pieces:['si004','si028','si062','si068']},
  {id:'so020',name:"Passeig d'hivern",         pieces:['si047','si010','si035','si057']},
];

// ──────────────────────────────────────────
//  RAW_OCASIONS — 9 occasions
// ──────────────────────────────────────────
const RAW_OCASIONS=[
  {name:'Feina',              outfits:[{type:'saved',outfitId:'so001'},{type:'saved',outfitId:'so007'},{type:'saved',outfitId:'so009'}]},
  {name:'Cap de setmana',     outfits:[{type:'saved',outfitId:'so002'},{type:'saved',outfitId:'so003'},{type:'saved',outfitId:'so008'},{type:'saved',outfitId:'so013'}]},
  {name:'Sortida nocturna',   outfits:[{type:'saved',outfitId:'so004'},{type:'saved',outfitId:'so018'}]},
  {name:'Esport',             outfits:[]},
  {name:'Viatge',             outfits:[{type:'saved',outfitId:'so006'},{type:'saved',outfitId:'so016'}]},
  {name:'Casual diari',       outfits:[{type:'saved',outfitId:'so003'},{type:'saved',outfitId:'so012'},{type:'saved',outfitId:'so015'},{type:'saved',outfitId:'so020'}]},
  {name:'Cita',               outfits:[{type:'saved',outfitId:'so014'},{type:'saved',outfitId:'so004'},{type:'saved',outfitId:'so005'}]},
  {name:'Platja i estiu',     outfits:[{type:'saved',outfitId:'so011'},{type:'saved',outfitId:'so019'},{type:'saved',outfitId:'so005'}]},
  {name:'Cultura i concerts', outfits:[{type:'saved',outfitId:'so015'},{type:'saved',outfitId:'so008'},{type:'saved',outfitId:'so010'}]},
];
