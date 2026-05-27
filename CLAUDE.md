# ROBA — Project Instructions

## Catalan language rules

All user-visible text in this project is in Catalan. Apply these rules to every name, label, tag, comment, or string you write or review.

### Adjective gender agreement

Adjectives must agree in gender and number with their noun. Common adjectives in this wardrobe app:

| Adjective | m.sg. | f.sg. | m.pl. | f.pl. |
|-----------|-------|-------|-------|-------|
| black | negre | negra | negres | negres |
| white | blanc | blanca | blancs | blanques |
| blue | blau | blava | blaus | blaves |
| red | vermell | vermella | vermells | vermelles |
| green | verd | verda | verds | verdes |
| golden | daurat | daurada | daurats | daurades |
| silver | platejat | platejada | platejats | platejades |
| quilted | acolxat | acolxada | acolxats | acolxades |
| pleated | plissat | plissada | plissats | plissades |
| printed | estampat | estampada | estampats | estampades |
| long | llarg | llarga | llargs | llargues |
| short | curt | curta | curts | curtes |
| clear/light | clar | clara | clars | clares |
| dark | fosc | fosca | foscos | fosques |
| high | alt | alta | alts | altes |
| low | baix | baixa | baixos | baixes |
| flat | pla | plana | plans | planes |
| folding | plegable | plegable | plegables | plegables |
| natural | natural | natural | naturals | naturals |
| round | rodó | rodona | rodons | rodones |

Key feminine-plural nouns that often cause agreement errors: **arracades, ulleres, sandàlies, botes, espardenyes, sabates, bambes, bruses, camises, samarretes, faldilles, mitges**.

### Materials — use Catalan, not Spanish

| Catalan ✓ | Spanish ✗ |
|-----------|-----------|
| cuir | cuero |
| lli | lino |
| llana | lana |
| cotó | algodón |
| seda | (same) |
| pell | piel |
| acolxat | acolchado |
| teixit | tejido |
| roba | ropa (only when meaning fabric/cloth) |

### Other common errors to avoid

- `daurades` not `daurads` (no Catalan word ends in -ads)
- `platejades` not `platejads`
- Loanwords kept as-is (no translation needed): navy, bomber, oversize, cargo, midi, crop, slim, oxford, tweed, denim, lona

### Established app conventions (do not change)

These category/type names are fixed UI decisions, not spelling errors:
- Category keys: DALT, BAIX, SENCER, JAQUETA, SABATES, ARRACADES, BOLSO, ALTRES
- Type names in `TYPES_BY_CAT` in `wardrobe.js`
- Season keys: estiu, hivern, primavera, tardor
- Formality keys: casual, smart-casual, formal
