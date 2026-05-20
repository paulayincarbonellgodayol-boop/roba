// ─────────────────────────────────────────────────────────────────
//  ROBA – Demo seed  (78 items · 20 outfits · 9 occasions · 2023–2026)
//  Usage: open the app in a browser, then in DevTools console run:
//    await seedDatabase()          // clears existing data first
//    await seedDatabase(false)     // keeps existing data, only adds
// ─────────────────────────────────────────────────────────────────
async function seedDatabase(clearFirst = true) {
  const DB_NAME = 'roba_db_demo';
  const DB_VER  = 3;

  const db = await new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });

  const idbPut   = (s, d) => new Promise((res, rej) => { const t = db.transaction(s,'readwrite'); const r = t.objectStore(s).put(d); r.onsuccess = () => res(r.result); t.onerror = e => rej(e.target.error); });
  const idbAdd   = (s, d) => new Promise((res, rej) => { const t = db.transaction(s,'readwrite'); const r = t.objectStore(s).add(d); r.onsuccess = () => res(r.result); t.onerror = e => rej(e.target.error); });
  const idbClear = s      => new Promise((res, rej) => { const t = db.transaction(s,'readwrite'); t.objectStore(s).clear().onsuccess = () => res(); t.onerror = e => rej(e.target.error); });

  if (clearFirst) {
    console.log('Clearing existing data…');
    await Promise.all(['items','wears','outfits','meta'].map(idbClear));
  }

  /* ── deterministic date generator ── */
  let _s = 137;
  const rand = () => { _s = (_s * 1664525 + 1013904223) & 0xffffffff; return (_s >>> 0) / 4294967295; };

  function genDates(start, end, n, monthPref) {
    const ms = new Date(start).getTime(), me = new Date(end).getTime();
    const seen = new Set(), out = [];
    for (let i = 0; i < n * 50 && out.length < n; i++) {
      const d = new Date(ms + rand() * (me - ms));
      if (!monthPref || monthPref.includes(d.getMonth()) || rand() < 0.12) {
        const str = d.toISOString().slice(0,10);
        if (!seen.has(str)) { seen.add(str); out.push(str); }
      }
    }
    return out.sort();
  }

  /* ══════════════════════════════════════════════════════
     ITEMS  (78 pieces)
     seasons: primavera · estiu · tardor · hivern
     formality: casual · smart-casual · formal
  ══════════════════════════════════════════════════════ */
  const ALL = ['primavera','estiu','tardor','hivern'];
  const SPR = ['primavera','estiu','tardor'];
  const SUM = ['primavera','estiu'];
  const HOT = ['estiu'];
  const AUT = ['tardor','hivern'];
  const C   = ['casual'];
  const CS  = ['casual','smart-casual'];
  const SC  = ['smart-casual'];
  const SF  = ['smart-casual','formal'];
  const CSF = ['casual','smart-casual','formal'];

  const ITEMS_DEF = [
    /* ─ DALT  (20 tops) ─ */
    {id:'si001',brand:'Zara',           name:'Samarreta bàsica blanca',      cat:'DALT',    type:'Samarreta', colors:['blanc'],          seasons:ALL, form:C,   sz:'S',    px:12,  yr:'2022', tags:['bàsic']},
    {id:'si002',brand:'H&M',            name:'Samarreta de ratlles navy',    cat:'DALT',    type:'Samarreta', colors:['blau','blanc'],   seasons:SPR, form:C,   sz:'S',    px:15,  yr:'2023', tags:[]},
    {id:'si003',brand:'Stradivarius',   name:'Samarreta oversize negra',     cat:'DALT',    type:'Samarreta', colors:['negre'],          seasons:ALL, form:C,   sz:'S',    px:14,  yr:'2022', tags:['bàsic']},
    {id:'si004',brand:'Bershka',        name:'Top crop groc',                cat:'DALT',    type:'Top',       colors:['groc'],           seasons:SUM, form:C,   sz:'S',    px:16,  yr:'2023', tags:['estiu']},
    {id:'si005',brand:'Mango',          name:'Camisa de lli beix',           cat:'DALT',    type:'Camisa',    colors:['beix'],           seasons:SUM, form:CS,  sz:'S',    px:35,  yr:'2023', tags:['estiu']},
    {id:'si006',brand:'Massimo Dutti',  name:'Camisa de cotó blanca',        cat:'DALT',    type:'Camisa',    colors:['blanc'],          seasons:ALL, form:SF,  sz:'S',    px:65,  yr:'2022', tags:['feina']},
    {id:'si007',brand:'COS',            name:'Brusa negra asimètrica',       cat:'DALT',    type:'Brusa',     colors:['negre'],          seasons:SPR, form:SC,  sz:'S',    px:89,  yr:'2023', tags:['feina']},
    {id:'si008',brand:'Maje',           name:"Top d'encaix blanc",           cat:'DALT',    type:'Top',       colors:['blanc'],          seasons:SUM, form:SF,  sz:'S',    px:120, yr:'2023', tags:[]},
    {id:'si009',brand:'The Kooples',    name:'Camisa de seda floral',        cat:'DALT',    type:'Camisa',    colors:['multicolor'],     seasons:SUM, form:SF,  sz:'S',    px:175, yr:'2023', tags:[]},
    {id:'si010',brand:'Sandro',         name:'Jersei de punt cru',           cat:'DALT',    type:'Jersei',    colors:['crema'],          seasons:AUT, form:SC,  sz:'S',    px:185, yr:'2022', tags:['hivern']},
    {id:'si011',brand:'Ralph Lauren',   name:'Jersei de coll rodó navy',     cat:'DALT',    type:'Jersei',    colors:['blau'],           seasons:AUT, form:CS,  sz:'S',    px:120, yr:'2022', tags:[]},
    {id:'si012',brand:'Scalpers',       name:'Camisa oxford blava',          cat:'DALT',    type:'Camisa',    colors:['blau'],           seasons:ALL, form:CS,  sz:'S',    px:60,  yr:'2023', tags:[]},
    {id:'si013',brand:'Karl Lagerfeld', name:'Brusa de seda rosa',           cat:'DALT',    type:'Brusa',     colors:['rosa'],           seasons:SUM, form:SF,  sz:'S',    px:145, yr:'2024', tags:[]},
    {id:'si014',brand:'Emporio Armani', name:'Top de punt negre',            cat:'DALT',    type:'Top',       colors:['negre'],          seasons:AUT, form:SF,  sz:'S',    px:140, yr:'2024', tags:['feina']},
    {id:'si015',brand:'Primark',        name:'Samarreta oversize blanca',    cat:'DALT',    type:'Samarreta', colors:['blanc'],          seasons:ALL, form:C,   sz:'S',    px:7,   yr:'2023', tags:['bàsic']},
    {id:'si016',brand:'Pull&Bear',      name:'Samarreta gràfica vintage',    cat:'DALT',    type:'Samarreta', colors:['negre'],          seasons:SPR, form:C,   sz:'S',    px:18,  yr:'2023', tags:[]},
    {id:'si017',brand:'Mango',          name:'Brusa de volants blanca',      cat:'DALT',    type:'Brusa',     colors:['blanc'],          seasons:SUM, form:CS,  sz:'S',    px:42,  yr:'2023', tags:[]},
    {id:'si018',brand:'Brownie',        name:'Camisa de quadres verd/blanc', cat:'DALT',    type:'Camisa',    colors:['verd','blanc'],   seasons:SPR, form:C,   sz:'S',    px:55,  yr:'2024', tags:[]},
    {id:'si019',brand:'Hugo Boss',      name:'Polo blanc',                   cat:'DALT',    type:'Altres',    colors:['blanc'],          seasons:SUM, form:CS,  sz:'S',    px:85,  yr:'2023', tags:[]},
    {id:'si020',brand:'Armani Exchange',name:'Top de tiretes negre',         cat:'DALT',    type:'Top',       colors:['negre'],          seasons:HOT, form:CSF, sz:'S',    px:70,  yr:'2024', tags:[]},

    /* ─ BAIX  (15 bottoms) ─ */
    {id:'si021',brand:'Calvin Klein',   name:'Texans slim blaus',            cat:'BAIX',    type:'Texans',    colors:['blau'],           seasons:ALL, form:CS,  sz:'27',   px:80,  yr:'2022', tags:['bàsic']},
    {id:'si022',brand:'Pull&Bear',      name:'Texans rectes blau fosc',      cat:'BAIX',    type:'Texans',    colors:['blau'],           seasons:SPR, form:C,   sz:'36',   px:30,  yr:'2023', tags:[]},
    {id:'si023',brand:'Zara',           name:'Pantalons cargo verds',        cat:'BAIX',    type:'Pantalons', colors:['verd'],           seasons:SPR, form:C,   sz:'36',   px:35,  yr:'2023', tags:[]},
    {id:'si024',brand:'Stradivarius',   name:'Faldilla plissada blava',      cat:'BAIX',    type:'Faldilla',  colors:['blau'],           seasons:SPR, form:CS,  sz:'36',   px:22,  yr:'2023', tags:['estiu']},
    {id:'si025',brand:'Mango',          name:'Faldilla midi marró',          cat:'BAIX',    type:'Faldilla',  colors:['marró'],          seasons:AUT, form:SF,  sz:'36',   px:45,  yr:'2022', tags:['feina']},
    {id:'si026',brand:'COS',            name:'Pantalons negres tall recte',  cat:'BAIX',    type:'Pantalons', colors:['negre'],          seasons:SPR, form:SF,  sz:'36',   px:95,  yr:'2022', tags:['feina','bàsic']},
    {id:'si027',brand:'Massimo Dutti',  name:'Pantalons de lli beix',        cat:'BAIX',    type:'Pantalons', colors:['beix'],           seasons:SUM, form:SC,  sz:'36',   px:75,  yr:'2023', tags:['feina']},
    {id:'si028',brand:'Bershka',        name:'Shorts vaquers',               cat:'BAIX',    type:'Shorts',    colors:['blau'],           seasons:HOT, form:C,   sz:'36',   px:18,  yr:'2023', tags:['estiu']},
    {id:'si029',brand:'Pepe Jeans',     name:"Texans boca d'ampolla",        cat:'BAIX',    type:'Texans',    colors:['blau'],           seasons:SPR, form:CS,  sz:'27',   px:70,  yr:'2023', tags:[]},
    {id:'si030',brand:'Zara',           name:'Pantalons de lli verd fosc',   cat:'BAIX',    type:'Pantalons', colors:['verd'],           seasons:SUM, form:CS,  sz:'36',   px:40,  yr:'2024', tags:[]},
    {id:'si031',brand:'H&M',            name:'Faldilla denim midi',          cat:'BAIX',    type:'Faldilla',  colors:['blau'],           seasons:SUM, form:C,   sz:'36',   px:25,  yr:'2023', tags:[]},
    {id:'si032',brand:'Stradivarius',   name:'Pantalons de cuero negres',    cat:'BAIX',    type:'Pantalons', colors:['negre'],          seasons:AUT, form:CS,  sz:'36',   px:35,  yr:'2024', tags:[]},
    {id:'si033',brand:'Mango',          name:'Shorts de lli beix',           cat:'BAIX',    type:'Shorts',    colors:['beix'],           seasons:HOT, form:CS,  sz:'36',   px:30,  yr:'2023', tags:['estiu']},
    {id:'si034',brand:'Scalpers',       name:'Pantalons chino beix',         cat:'BAIX',    type:'Pantalons', colors:['beix'],           seasons:ALL, form:CS,  sz:'36',   px:65,  yr:'2022', tags:[]},
    {id:'si035',brand:'Primark',        name:'Texans rectes negres',         cat:'BAIX',    type:'Texans',    colors:['negre'],          seasons:ALL, form:C,   sz:'36',   px:15,  yr:'2023', tags:['bàsic']},

    /* ─ SENCER  (8 one-pieces) ─ */
    {id:'si036',brand:'Sandro',         name:'Vestit mini floral',           cat:'SENCER',  type:'Vestit',    colors:['multicolor'],     seasons:SUM, form:SF,  sz:'36',   px:250, yr:'2023', tags:[]},
    {id:'si037',brand:'Mango',          name:'Mono de lli blanc',            cat:'SENCER',  type:'Mono',      colors:['blanc'],          seasons:HOT, form:CS,  sz:'S',    px:55,  yr:'2023', tags:['estiu']},
    {id:'si038',brand:'Zara',           name:'Vestit llarg negre',           cat:'SENCER',  type:'Vestit',    colors:['negre'],          seasons:ALL, form:SF,  sz:'S',    px:49,  yr:'2022', tags:['versàtil']},
    {id:'si039',brand:'The Kooples',    name:'Vestit de punt negre',         cat:'SENCER',  type:'Vestit',    colors:['negre'],          seasons:AUT, form:SF,  sz:'S',    px:210, yr:'2022', tags:[]},
    {id:'si040',brand:'Stradivarius',   name:"Vestit floral d'estiu",        cat:'SENCER',  type:'Vestit',    colors:['multicolor'],     seasons:SUM, form:C,   sz:'S',    px:28,  yr:'2023', tags:['estiu']},
    {id:'si041',brand:'Maje',           name:'Vestit midi beix',             cat:'SENCER',  type:'Vestit',    colors:['beix'],           seasons:SUM, form:SF,  sz:'36',   px:275, yr:'2024', tags:[]},
    {id:'si042',brand:'Bershka',        name:'Vestit estampat tropical',     cat:'SENCER',  type:'Vestit',    colors:['multicolor'],     seasons:HOT, form:C,   sz:'S',    px:25,  yr:'2023', tags:['estiu']},
    {id:'si043',brand:'H&M',            name:'Mono de teixit negre',         cat:'SENCER',  type:'Mono',      colors:['negre'],          seasons:SPR, form:SF,  sz:'S',    px:45,  yr:'2024', tags:[]},

    /* ─ JAQUETA  (9 outerwear) ─ */
    {id:'si044',brand:'The Kooples',    name:'Americana negra',              cat:'JAQUETA', type:'Americana', colors:['negre'],          seasons:SPR, form:SF,  sz:'36',   px:295, yr:'2022', tags:['feina']},
    {id:'si045',brand:'Maje',           name:'Jaqueta de tweed multicolor',  cat:'JAQUETA', type:'Americana', colors:['multicolor'],     seasons:AUT, form:SC,  sz:'36',   px:230, yr:'2023', tags:[]},
    {id:'si046',brand:'Zara',           name:'Jaqueta de cuir negra',        cat:'JAQUETA', type:'Jaqueta',   colors:['negre'],          seasons:AUT, form:CS,  sz:'S',    px:89,  yr:'2022', tags:[]},
    {id:'si047',brand:'H&M',            name:'Abric de llana camel',         cat:'JAQUETA', type:'Abric',     colors:['marró'],          seasons:AUT, form:CS,  sz:'S',    px:79,  yr:'2022', tags:['hivern']},
    {id:'si048',brand:'Massimo Dutti',  name:'Americana de llana gris',      cat:'JAQUETA', type:'Americana', colors:['gris'],           seasons:AUT, form:SF,  sz:'36',   px:180, yr:'2022', tags:['feina']},
    {id:'si049',brand:'Scalpers',       name:'Jaqueta bomber verda',         cat:'JAQUETA', type:'Jaqueta',   colors:['verd'],           seasons:['primavera','tardor'], form:C, sz:'S', px:90, yr:'2024', tags:[]},
    {id:'si050',brand:'Mango',          name:'Abric oversize beix',          cat:'JAQUETA', type:'Abric',     colors:['beix'],           seasons:AUT, form:CS,  sz:'S',    px:105, yr:'2023', tags:['hivern']},
    {id:'si051',brand:'Ralph Lauren',   name:'Jaqueta acolchada navy',       cat:'JAQUETA', type:'Jaqueta',   colors:['blau'],           seasons:AUT, form:CS,  sz:'S',    px:195, yr:'2023', tags:[]},
    {id:'si052',brand:'Stradivarius',   name:'Jaqueta vaquera clara',        cat:'JAQUETA', type:'Texana',    colors:['blau'],           seasons:['primavera','estiu','tardor'], form:C, sz:'S', px:35, yr:'2023', tags:[]},

    /* ─ SABATES  (10 shoes) ─ */
    {id:'si053',brand:'Decathlon',      name:'Bambes de running blanques',   cat:'SABATES', type:'Bambes',    colors:['blanc'],          seasons:ALL, form:C,   sz:'37',   px:45,  yr:'2022', tags:['sport']},
    {id:'si054',brand:'Zara',           name:'Bambes blanques plataforma',   cat:'SABATES', type:'Bambes',    colors:['blanc'],          seasons:SUM, form:C,   sz:'37',   px:39,  yr:'2023', tags:[]},
    {id:'si055',brand:'Mango',          name:'Botina de taló negra',         cat:'SABATES', type:'Botina',    colors:['negre'],          seasons:AUT, form:SF,  sz:'37',   px:65,  yr:'2022', tags:['feina']},
    {id:'si056',brand:'Zara',           name:'Sandàlies planes beix',        cat:'SABATES', type:'Sandàlies', colors:['beix'],           seasons:SUM, form:CS,  sz:'37',   px:29,  yr:'2023', tags:['estiu']},
    {id:'si057',brand:'Stradivarius',   name:'Botina de cuir marró',         cat:'SABATES', type:'Botina',    colors:['marró'],          seasons:AUT, form:CS,  sz:'37',   px:50,  yr:'2022', tags:[]},
    {id:'si058',brand:'H&M',            name:'Espardenyes naturals',         cat:'SABATES', type:'Sandàlies', colors:['beix'],           seasons:SUM, form:C,   sz:'37',   px:18,  yr:'2023', tags:['estiu']},
    {id:'si059',brand:'Mango',          name:'Sabates de taló baix negres',  cat:'SABATES', type:'Botina',    colors:['negre'],          seasons:SPR, form:SF,  sz:'37',   px:55,  yr:'2023', tags:['feina']},
    {id:'si060',brand:'Bershka',        name:'Bambes de lona blaves',        cat:'SABATES', type:'Bambes',    colors:['blau'],           seasons:SPR, form:C,   sz:'37',   px:22,  yr:'2023', tags:[]},
    {id:'si061',brand:'Zara',           name:'Botes altes de cuir negres',   cat:'SABATES', type:'Botina',    colors:['negre'],          seasons:AUT, form:CS,  sz:'37',   px:79,  yr:'2023', tags:[]},
    {id:'si062',brand:'Stradivarius',   name:'Sandàlies de platja blanques', cat:'SABATES', type:'Sandàlies', colors:['blanc'],          seasons:HOT, form:C,   sz:'37',   px:20,  yr:'2023', tags:['estiu','platja']},

    /* ─ ARRACADES  (8 earrings) ─ */
    {id:'si063',brand:'Mira Mira',      name:'Aro daurat gran',              cat:'ARRACADES',type:'Aro',      colors:['daurat'],         seasons:ALL, form:CS,  sz:'única', px:35,  yr:'2022', tags:[]},
    {id:'si064',brand:'Mira Mira',      name:'Arracades llargues de pedres', cat:'ARRACADES',type:'Llarga',   colors:['multicolor'],     seasons:ALL, form:SF,  sz:'única', px:55,  yr:'2023', tags:[]},
    {id:'si065',brand:'Tous',           name:'Arracades rodones plata',      cat:'ARRACADES',type:'Curta',    colors:['platejat'],       seasons:ALL, form:CS,  sz:'única', px:65,  yr:'2022', tags:[]},
    {id:'si066',brand:'Bimba y Lola',   name:'Arracades llargues blanques',  cat:'ARRACADES',type:'Llarga',   colors:['blanc'],          seasons:ALL, form:SF,  sz:'única', px:75,  yr:'2023', tags:[]},
    {id:'si067',brand:'Zara',           name:'Arracades de clip negres',     cat:'ARRACADES',type:'Curta',    colors:['negre'],          seasons:ALL, form:C,   sz:'única', px:12,  yr:'2023', tags:[]},
    {id:'si068',brand:'Mira Mira',      name:'Arracades mini daurads',       cat:'ARRACADES',type:'Curta',    colors:['daurat'],         seasons:ALL, form:CS,  sz:'única', px:28,  yr:'2023', tags:['bàsic']},
    {id:'si069',brand:'Tous',           name:'Arracades de cor vermell',     cat:'ARRACADES',type:'Curta',    colors:['vermell'],        seasons:ALL, form:CS,  sz:'única', px:45,  yr:'2024', tags:[]},
    {id:'si070',brand:'Bimba y Lola',   name:'Arracades de perles',          cat:'ARRACADES',type:'Llarga',   colors:['blanc'],          seasons:ALL, form:SF,  sz:'única', px:95,  yr:'2024', tags:[]},

    /* ─ BOLSO  (8 bags) ─ */
    {id:'si071',brand:'Furla',          name:'Metropolis negre',             cat:'BOLSO',   type:'',          colors:['negre'],          seasons:ALL, form:SF,  sz:'única', px:280, yr:'2022', tags:[]},
    {id:'si072',brand:'Longchamp',      name:'Le Pliage beix',               cat:'BOLSO',   type:'',          colors:['beix'],           seasons:ALL, form:CS,  sz:'única', px:95,  yr:'2022', tags:['viatge']},
    {id:'si073',brand:'Tous',           name:'Bossa de cuir marró',          cat:'BOLSO',   type:'',          colors:['marró'],          seasons:AUT, form:CS,  sz:'única', px:145, yr:'2023', tags:[]},
    {id:'si074',brand:'Zara',           name:'Bossa de palla beix',          cat:'BOLSO',   type:'',          colors:['beix'],           seasons:SUM, form:C,   sz:'única', px:25,  yr:'2023', tags:['estiu']},
    {id:'si075',brand:'Bimba y Lola',   name:'Bossa de cadena platejada',    cat:'BOLSO',   type:'',          colors:['platejat'],       seasons:ALL, form:SF,  sz:'única', px:195, yr:'2023', tags:[]},
    {id:'si076',brand:'Longchamp',      name:'Le Pliage negre',              cat:'BOLSO',   type:'',          colors:['negre'],          seasons:ALL, form:CS,  sz:'única', px:95,  yr:'2023', tags:['viatge']},
    {id:'si077',brand:'Tous',           name:'Kaos mini marró',              cat:'BOLSO',   type:'',          colors:['marró'],          seasons:ALL, form:CS,  sz:'única', px:120, yr:'2024', tags:[]},
    {id:'si078',brand:'Zara',           name:'Bossa de roba negra',          cat:'BOLSO',   type:'',          colors:['negre'],          seasons:ALL, form:C,   sz:'única', px:22,  yr:'2024', tags:[]},
  ];

  const iMap = {};
  ITEMS_DEF.forEach(it => iMap[it.id] = it);

  /* ══════════════════════════════════════════════════════
     SAVED OUTFITS  (20)
  ══════════════════════════════════════════════════════ */
  const OUTFITS_DEF = [
    {id:'so001', name:'Dimarts de reunions',       pieces:['si007','si026','si055','si071']},
    {id:'so002', name:'Pas tranquil pel barri',    pieces:['si005','si027','si057','si063']},
    {id:'so003', name:'Mercat i cafè',             pieces:['si003','si021','si053','si074']},
    {id:'so004', name:'Dijous de nit',             pieces:['si039','si055','si066','si075']},
    {id:'so005', name:'Estiu de festa',            pieces:['si036','si056','si064','si073']},
    {id:'so006', name:'Mode aeroport',             pieces:['si012','si022','si053','si072']},
    {id:'so007', name:'Còctel de feina',           pieces:['si013','si026','si059','si065']},
    {id:'so008', name:'Diumenge suau',             pieces:['si011','si024','si058','si073']},
    {id:'so009', name:"Hivern a l'oficina",        pieces:['si048','si006','si027','si057']},
    {id:'so010', name:'Tardor i fulles',           pieces:['si045','si022','si054','si075']},
    {id:'so011', name:'Mono de juliol',            pieces:['si037','si056','si064']},
    {id:'so012', name:'El dia a dia',              pieces:['si010','si023','si053','si065']},
    {id:'so013', name:'Brunch de dissabte',        pieces:['si017','si024','si054','si063']},
    {id:'so014', name:'Cita a cegues',             pieces:['si041','si055','si066','si071']},
    {id:'so015', name:'Concert al parc',           pieces:['si002','si029','si060','si063']},
    {id:'so016', name:'Viatge de cap de setmana',  pieces:['si015','si028','si053','si072']},
    {id:'so017', name:'Primera setmana de tardor', pieces:['si010','si025','si057','si076']},
    {id:'so018', name:"Cap d'any",                 pieces:['si044','si038','si061','si070']},
    {id:'so019', name:'Platja del matí',           pieces:['si004','si028','si062','si068']},
    {id:'so020', name:"Passeig d'hivern",          pieces:['si047','si010','si035','si057']},
  ];

  const oDefs = {};
  OUTFITS_DEF.forEach(o => oDefs[o.id] = o);

  /* ══════════════════════════════════════════════════════
     WEAR SESSIONS
     Target: ~500 individual wear records
     (saved outfit sessions × avg 4 items) + (ad-hoc sessions × avg 4 items)
     ~96 outfit sessions × 4 = ~384 · ~30 adhoc × 4 = ~120 · total ≈ 504
  ══════════════════════════════════════════════════════ */
  const sessions = [];
  let sctr = 1;

  function addOutfitSessions(oId, count, start, end, months) {
    genDates(start, end, count, months).forEach(date =>
      sessions.push({ sessionId:'o_seed_'+String(sctr++).padStart(3,'0'), outfitId:oId, outfitName:oDefs[oId].name, items:oDefs[oId].pieces, date })
    );
  }

  function adhoc(items, date) {
    sessions.push({ sessionId:null, outfitId:null, outfitName:'', items, date });
  }

  // month arrays (0=Jan … 11=Dec)
  const mALL = null;
  const mSUM = [4,5,6,7];
  const mAUT = [8,9,10,11];
  const mWIN = [10,11,0,1];
  const mOFF = [0,1,2,3,8,9,10,11]; // non-summer (office)

  // Outfit sessions — counts tuned so total wear records ≈ 500
  addOutfitSessions('so001',  7, '2023-01-15', '2026-05-01', mOFF); // Dimarts reunions
  addOutfitSessions('so002',  5, '2023-03-01', '2026-05-01', [2,3,4,8,9,10]); // Pas pel barri
  addOutfitSessions('so003', 10, '2023-01-01', '2026-05-15', mALL); // Mercat i cafè
  addOutfitSessions('so004',  4, '2023-02-01', '2026-04-01', mALL); // Dijous de nit
  addOutfitSessions('so005',  3, '2023-06-01', '2025-09-01', mSUM); // Estiu de festa
  addOutfitSessions('so006',  4, '2023-03-01', '2026-04-01', mALL); // Aeroport
  addOutfitSessions('so007',  3, '2023-04-01', '2026-03-01', mOFF); // Còctel feina
  addOutfitSessions('so008',  7, '2023-02-01', '2026-05-01', mALL); // Diumenge suau
  addOutfitSessions('so009',  5, '2023-10-01', '2026-03-01', mWIN); // Hivern oficina
  addOutfitSessions('so010',  4, '2023-09-01', '2026-01-01', mAUT); // Tardor
  addOutfitSessions('so011',  4, '2023-06-01', '2025-09-01', mSUM); // Mono juliol
  addOutfitSessions('so012',  8, '2023-01-01', '2026-05-01', [8,9,10,11,0,1,2]); // Dia a dia
  addOutfitSessions('so013',  5, '2023-04-01', '2026-05-01', [2,3,4,8,9,10]); // Brunch
  addOutfitSessions('so014',  3, '2023-05-01', '2026-04-01', mALL); // Cita
  addOutfitSessions('so015',  4, '2023-03-01', '2026-05-01', [3,4,5,8,9]); // Concert parc
  addOutfitSessions('so016',  4, '2023-04-01', '2026-05-01', mALL); // Viatge cap setmana
  addOutfitSessions('so017',  4, '2023-09-01', '2025-12-01', mAUT); // Primera tardor
  addOutfitSessions('so018',  2, '2023-12-20', '2026-01-10', [11,0]); // Cap d'any
  addOutfitSessions('so019',  5, '2023-06-01', '2025-09-01', mSUM); // Platja matí
  addOutfitSessions('so020',  6, '2023-10-01', '2026-05-01', mWIN); // Passeig hivern

  // Ad-hoc sessions (items worn together, no saved outfit — feeds historial variety)
  adhoc(['si001','si028','si054','si063'], '2023-07-08');
  adhoc(['si002','si021','si053','si072'], '2023-04-22');
  adhoc(['si003','si025','si055','si071'], '2023-11-05');
  adhoc(['si001','si024','si056','si065'], '2023-05-14');
  adhoc(['si004','si028','si058','si074'], '2023-08-19');
  adhoc(['si006','si026','si059','si064'], '2023-09-28');
  adhoc(['si014','si025','si055','si075'], '2023-10-11');
  adhoc(['si009','si027','si056','si063'], '2023-06-03');
  adhoc(['si011','si022','si053','si072'], '2023-03-18');
  adhoc(['si010','si026','si057','si065'], '2023-12-09');
  adhoc(['si019','si034','si057','si065'], '2023-02-25');
  adhoc(['si040','si058','si068','si074'], '2023-07-15');
  adhoc(['si003','si021','si053','si067'], '2024-01-13');
  adhoc(['si008','si030','si056','si066'], '2024-05-04');
  adhoc(['si001','si028','si058','si074'], '2024-07-20');
  adhoc(['si012','si029','si057','si072'], '2024-03-09');
  adhoc(['si010','si025','si055','si065'], '2024-11-23');
  adhoc(['si002','si024','si054','si063'], '2024-04-12');
  adhoc(['si013','si027','si059','si064'], '2024-06-08');
  adhoc(['si014','si026','si057','si075'], '2024-10-05');
  adhoc(['si040','si056','si063','si074'], '2024-07-06');
  adhoc(['si042','si062','si068','si074'], '2024-08-15');
  adhoc(['si016','si032','si057','si067'], '2024-10-19');
  adhoc(['si043','si059','si076'],         '2024-11-08');
  adhoc(['si003','si023','si058','si067'], '2025-03-15');
  adhoc(['si001','si021','si053','si072'], '2025-02-08');
  adhoc(['si004','si028','si056','si074'], '2025-08-02');
  adhoc(['si012','si022','si053','si065'], '2025-11-08');
  adhoc(['si037','si056','si066','si074'], '2025-07-05');
  adhoc(['si017','si024','si054','si063'], '2025-03-28');
  adhoc(['si008','si033','si056','si066'], '2025-08-14');
  adhoc(['si003','si029','si057','si065'], '2026-01-11');
  adhoc(['si006','si026','si055','si071'], '2026-02-22');
  adhoc(['si001','si022','si053','si072'], '2026-04-18');
  adhoc(['si008','si027','si056','si066'], '2026-05-10');

  /* ══════════════════════════════════════════════════════
     COMPUTE WEAR COUNTS
  ══════════════════════════════════════════════════════ */
  const iWears = {};
  ITEMS_DEF.forEach(it => iWears[it.id] = { count:0, dates:[] });
  const oWears = {};
  OUTFITS_DEF.forEach(o => oWears[o.id] = { count:0, dates:[] });

  sessions.forEach(s => {
    s.items.forEach(id => { if (iWears[id]) { iWears[id].count++; iWears[id].dates.push(s.date); } });
    if (s.outfitId && oWears[s.outfitId]) { oWears[s.outfitId].count++; oWears[s.outfitId].dates.push(s.date); }
  });

  const totalWearRecs = sessions.reduce((acc, s) => acc + s.items.length, 0);
  console.log(`Planned ${sessions.length} sessions → ${totalWearRecs} wear records`);

  /* ══════════════════════════════════════════════════════
     WRITE ITEMS
  ══════════════════════════════════════════════════════ */
  console.log('Writing 78 items…');
  for (const def of ITEMS_DEF) {
    const wc       = iWears[def.id].count;
    const dates    = iWears[def.id].dates.sort();
    const lastWorn = dates.length ? dates[dates.length - 1] : null;
    await idbPut('items', {
      id: def.id, brand: def.brand, name: def.name,
      color: def.colors[0], colors: def.colors,
      type: def.type, category: def.cat,
      size: def.sz, price: def.px, notes: '',
      seasons: def.seasons, formality: def.form, tags: def.tags,
      units: [{ id:'u1', purchaseDate: def.yr+'-01-01', purchaseYear: def.yr, retired: false, retiredDate: '' }],
      quantity: 1, totalCost: def.px,
      cpw: wc > 0 ? def.px / wc : def.px,
      wears: wc, lastWorn,
      images: [], favourite: false, needsInfo: false, seeded: true,
      purchaseYear: def.yr,
    });
  }

  /* ══════════════════════════════════════════════════════
     WRITE OUTFITS
  ══════════════════════════════════════════════════════ */
  console.log('Writing 20 outfits…');
  for (const def of OUTFITS_DEF) {
    const wc       = oWears[def.id].count;
    const dates    = oWears[def.id].dates.sort();
    const lastWorn = dates.length ? dates[dates.length - 1] : null;
    await idbPut('outfits', {
      id: def.id, name: def.name,
      pieces: def.pieces.map(id => ({ itemId:id, text: iMap[id] ? iMap[id].brand+' '+iMap[id].name : id, catKey: iMap[id]?.cat || '' })),
      wears: wc, lastWorn, favourite: false,
    });
  }

  /* ══════════════════════════════════════════════════════
     WRITE WEAR RECORDS
  ══════════════════════════════════════════════════════ */
  console.log(`Writing ${totalWearRecs} wear records…`);
  for (const s of sessions) {
    for (const itemId of s.items) {
      const it = iMap[itemId];
      if (!it) continue;
      await idbAdd('wears', {
        date: s.date, itemId,
        outfitId:    s.outfitId   || null,
        outfitLabel: s.outfitName || '',
        freeText: null, catKey: it.cat, seeded: true,
      });
    }
  }

  /* ══════════════════════════════════════════════════════
     WRITE OCASIONS  (9)
  ══════════════════════════════════════════════════════ */
  console.log('Writing 9 ocasions…');
  await idbPut('meta', { key: 'ocasions', value: [
    { name:'Feina',              outfits:[
        {type:'saved',outfitId:'so001'},
        {type:'saved',outfitId:'so007'},
        {type:'saved',outfitId:'so009'},
    ]},
    { name:'Cap de setmana',     outfits:[
        {type:'saved',outfitId:'so002'},
        {type:'saved',outfitId:'so003'},
        {type:'saved',outfitId:'so008'},
        {type:'saved',outfitId:'so013'},
    ]},
    { name:'Sortida nocturna',   outfits:[
        {type:'saved',outfitId:'so004'},
        {type:'saved',outfitId:'so018'},
    ]},
    { name:'Esport',             outfits:[] },
    { name:'Viatge',             outfits:[
        {type:'saved',outfitId:'so006'},
        {type:'saved',outfitId:'so016'},
    ]},
    { name:'Casual diari',       outfits:[
        {type:'saved',outfitId:'so003'},
        {type:'saved',outfitId:'so012'},
        {type:'saved',outfitId:'so015'},
        {type:'saved',outfitId:'so020'},
    ]},
    { name:'Cita',               outfits:[
        {type:'saved',outfitId:'so014'},
        {type:'saved',outfitId:'so004'},
        {type:'saved',outfitId:'so005'},
    ]},
    { name:'Platja i estiu',     outfits:[
        {type:'saved',outfitId:'so011'},
        {type:'saved',outfitId:'so019'},
        {type:'saved',outfitId:'so005'},
    ]},
    { name:'Cultura i concerts',  outfits:[
        {type:'saved',outfitId:'so015'},
        {type:'saved',outfitId:'so008'},
        {type:'saved',outfitId:'so010'},
    ]},
  ]});

  console.log(`\n✓ Seed complete!`);
  console.log(`  78 items · 20 outfits · ${sessions.length} sessions · ${totalWearRecs} wear records · 9 ocasions`);
  console.log('  Refresh the page to see the data.');
}
