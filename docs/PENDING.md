# ROBA — Pending Matters

_Update this file as items are solved or added._

---

## Open

| # | Description | Ease | Priority | Notes |
|---|-------------|------|----------|-------|
| **43** | Multiple outfits per day — decide behaviour: allow logging two outfits on the same date; clarify how historial groups/counts them and whether wears double-count | Medium | Medium | Currently ambiguous; needs a data model decision before implementing |
| **42** | Ocasions pinned outfit detail: show full expanded card (pieces by category, wear stats, CPU) matching Guardats outfit card | Medium | Medium | Requires extracting `expandOutfitCard` into a shared helper; basic dialog exists |
| **38** | Material de la roba — new field on item form + filter in filter bar | Easy | Medium | Same pattern as existing filters |
| **37** | Pestanya ABOUT — credits, version, short description of app | Easy | Low | Static content tab |
| **26** | Custom category icons | Medium | Medium | Replace text category labels with icons |
| **30** | Statistics tab — valor total armari, cost per categoria, wear trends | Medium | High | Needs aggregation logic; reuses existing CPU/wears data |
| **39** | Icona preferències dalt-dreta — feature toggles panel | Hard | Medium | UI for enabling/disabling optional features |
| **24** | More organic outfit design — richer visual outfit cards | Hard | Medium | Visual/layout work |
| **18** | Photos per item | Hard | High | Unlocks #19, #29, #31, #32 |
| **19** | Outfit visual with photos | Hard | High | Blocked by #18 |
| **29** | Outfit share as image | Hard | Medium | Blocked by #18 |
| **31** | Item detail page with photo gallery | Hard | Medium | Blocked by #18 |
| **32** | Lookbook / mood board view | Hard | Medium | Blocked by #18 |
| **5** | Trip packing tab | Very Hard | Low | Separate packing list flow |
| **2** | Multi-language UI (CA / ES / EN) | Very Hard | Low | Full string extraction needed |

---

## Closed / Solved

| # | Description | How solved |
|---|-------------|------------|
| — | Wear history (item modal): companion text font reduced to 11px; vertical separator line between date and companions via `inline-block` span (reliable cross-browser); spacing 0.65rem each side | CSS + JS wrapper — current session |
| — | Ocasions cards: outfit count showed 0 (read from empty wear field) | Fixed to read `oc.outfits.length` instead — current session |
| — | Spelling: "Guardar outfit" → "Desar outfit", "guardat" → "desat", "Biquíni" → "Biquini", "Paraigüies" → "Paraigua" | Corrected across index.html, outfits.js, wardrobe.js — current session |
| — | Demo seed replaced: 78 items · 20 outfits · 9 ocasions · ~500 wear records (2023–2026), brands from Spanish market | `js/seed.js` rewritten; boots automatically on first load or DB version < 2 — 02e2c9e |
| — | Item cards: seasons and formality hidden, tags inline with category/type pills | Removed from card render in `wardrobe.js` — current session |
| — | Color filter: Multicolor always sorted to top | `findIndex` with case-insensitive match — current session |
| **41** | Ocasions: clicking a pinned outfit shows detail | Floating dialog (`.hm-save-dialog` pattern) — cb91d3c |
| **40** | OR/AND filter toggles → Catalan (ALGUN/TOTS) | Text swap in `buildMultiPanelWithFlowers` + `buildTagPanel` — cb91d3c |
| **36** | Multi-select dropdowns don't auto-close | Confirmed not a bug: panels stay open for multi-select, close on outside click via document listener |
| **4+23** | Places worn/bought + web link / reference code | Two optional fields on item form: `boughtAt` (free text) + `refLink` (code or URL, renders as link if http) — 242a3e8 |
| **35** | "Nova peça" + "Més portada" overflow on narrow screens | Added `display:grid` to `@media(max-width:620px)` toolbar rule — cb91d3c |
| **34** | Save historial outfit as named outfit — mobile layout broken | Replaced inline form with `position:fixed` overlay dialog appended to body — 5b74f42 |
| **33** | Historial: nucleus chips toggleable to filter | Implemented chip on/off state + re-render on toggle — 5b74f42 |
| **28** | Historial modal add-picker: co-worn filter | Picker only shows items from matching outfits; `hmModalOutfits` computed first — 5b74f42 |
| **27** | Historial: multi-stack filters via dropdown | Two-step category→item picker with opaque dropdown panel — 5b74f42 |
| **25** | Outfit builder: two-step type→item picker | `attachTwoStepPicker` shared helper replacing text autocomplete — 5b74f42 |
| **21** | Preferits tab — hearts/stars, tabs per type | Implemented with outfit + item favouriting |
| **20** | Wear history accordion per item | Year-grouped accordion with date chips in item modal |
| **17** | Ocasions tab — log wear to occasion | Tab with occasion cards, detail view, wear logging |
| **16** | Saved outfits — name, store, wear | Guardats section in Outfits tab with expand cards |
| **15** | Historial view | History outfits grouped by nucleus |
| **14** | Outfit builder | Category-by-category builder with saved outfits |
| **13** | Status filter (en ús / donat / guardat…) | Filter panel in Armari |
| **12** | Size filter | Filter panel in Armari |
| **11** | Brand filter | Filter panel in Armari |
| **10** | Formality filter | Filter panel in Armari |
| **9** | Color filter with flower icons | Filter panel with SVG flowers |
| **8** | Seasons filter | Filter panel in Armari |
| **7** | Cost per wear (CPU) | Computed from price / wears, shown on cards |
| **6** | Wear logging per item | Log wear modal with date + occasion |
| **3** | Free tags — chip input, AND/OR filter, card display | Tag input on form, `.pill-tag` on cards, filter panel — cb91d3c |
| **1** | Basic wardrobe CRUD — add/edit/delete items, categories, search | Core app |
