Check all Catalan-language text in the current working files (or in `$ARGUMENTS` if provided) for grammar and spelling mistakes. Apply the rules from CLAUDE.md:

1. **Gender agreement** — adjectives must match their noun in gender and number. Flag any mismatch (e.g. `daurads` on a feminine-plural noun, `acolchada` instead of `acolxada`).
2. **Catalan vs Spanish materials** — flag Spanish words like `cuero`, `lana`, `lino`, `tejido`, `acolchado` where the Catalan equivalent should be used.
3. **Invalid word forms** — Catalan has no `-ads` or `-ids` endings; flag any such forms.
4. **Adjective tables** — use the gender table in CLAUDE.md to verify every colour/property adjective against its noun.

For each issue found, report:
- File and line number
- The wrong text
- The corrected text
- Brief reason

After reporting, ask whether to apply the fixes.
