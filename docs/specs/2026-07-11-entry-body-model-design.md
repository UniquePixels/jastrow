# Entry Body Model — §6.0 Design

- **Date:** 2026-07-11
- **Status:** Reviewed — maintainer §6.0 eyes-on review completed
  2026-08-05 (decisions recorded in `docs/v2/body-review/`); B5/B12
  extensions and approved migration passes implemented (Tasks 14–16)
- **Parent:** [2026-07-08-v2-data-architecture-design.md](2026-07-08-v2-data-architecture-design.md)
  §6.0 (migration prerequisite: "entry body model, the big one").
  Resolves the provisional rows of parent §2.2 (`origin`, `senses`,
  `quotes`) and amends parent §2.3 (vocabulary) and §7 (cleanup
  register). Decision IDs here are B1–B12; the parent's D-numbers are
  unchanged.

## 1. Context

A printed Jastrow entry is one continuous body: headword, gender
marker, etymology parenthesis, construct/plural forms, bracketed
archaic meanings, glosses, numbered and lettered senses, citation
evidence, and (for verbs) binyan sections. The upstream ingestion
(digitization or Sefaria import — indistinguishable from this repo)
chopped this flow into fragments — `language_code`/`language_reference` (the
etymology paren, sometimes split mid-phrase), `content.morphology`
(the gender marker, 13,162 entries), `plural_form`, a sense-1
"definition" that opens with entry-level text, `quotes`, and `refs` —
none of which is the model. This design reassembles the printed body
into the structure v2 truth actually wants.

**Method (B1, maintainer 2026-07-11):** design the ideal form first —
"if we had no data to import, what structure best represents the
data?" — then map each region of the source onto it, with a measured
confidence and a fallback per region. Sefaria's fields are inputs to
that mapping, never the shape of the model.

**Design rule (B2/B3):** structure only what we address or index —
the sense tree, citation units, the grammar index, page, slug,
identity. Everything else stays tagged prose exactly as Jastrow wrote
it. Prose regions that upstream stored as separate fields (gender
marker, etymology paren) are rejoined into the gloss; typed access
comes from index fields that annotate the text without altering it.

## 2. The schema

Complete entry shape (every field shown; optional fields are omitted
from files when empty). Inline markup uses the parent spec's closed
vocabulary (§2.3) with one amendment — **B10: `<ref>` and `<cite>`
merge into a single `<cite ref="…">` tag** whose value is either a
rid (`A00013`) or a canonical Sefaria ref (`Shabbat 104a`). The rid
pattern (letter + five digits) cannot collide with a canonical ref,
so validation dispatches unambiguously: rid values must resolve to an
existing entry; everything else must parse as a canonical ref. The
optional `k=` kind attribute carries over. Units are arrays, not tag
soup — no other vocabulary change.

**Routing requirement (maintainer, 2026-07-11):** every inline
citation must support dual destinations at render — the primary link
goes to the app's internal view (entry, or internal search for
external refs, as the pill-box list does in v1), with a small
arrow/launch icon linking out to Sefaria. Both URLs derive from the
stored value (rid or canonical ref) at compile per D7 — no URLs are
stored, and no extra data is needed beyond the tag value.

```json
{
	"id": "A00014",
	"slug": "אב-2",
	"headword": { "text": "אָב", "homograph": 2 },
	"altHeadwords": [ { "text": "אבא" } ],
	"page": { "number": 2, "column": "a" },
	"grammar": { "gender": "m" },
	"senses": [
		{
			"gloss": "m. (b. h.; <he>אבה</he>, cmp. <cite ref=\"A01975\">אֵם</cite>), const. <cite ref=\"A00013\">אֲבִי</cite>, <cite ref=\"A00012\">אַב</cite> [embracer], <i>father, ancestor…</i>.",
			"units": [
				"<cite ref=\"Shemot Rabbah 46:5\">Ex. R. s. 46</cite> end <he>המגדל אב</he> the educator is the real father.",
				"<cite ref=\"Vayikra Rabbah 1:15\">Lev. R. s. 1</cite> <he>אבי החכמה וכ׳</he>, the father of all wisdom…"
			]
		},
		{ "label": "1", "gloss": "…", "units": ["…"] },
		{
			"label": "2", "gloss": "…", "units": ["…"],
			"senses": [ { "label": "a", "gloss": "…" } ]
		}
	],
	"stems": [
		{ "stem": "Nif.", "forms": ["נֶאֱבַד"], "senses": [ { "gloss": "…", "units": ["…"] } ] }
	]
}
```

Cross-reference entries (the 8,592 whose whole body is ", v. X") are
**ordinary entries** under this model: one unlabeled sense whose gloss
is the pointer text. No dedicated field — pointer-ness is a compile
classification (gloss matches the `v.`-only pattern), used by browse
and search presentation. The parent spec's §2.4 pointer records (D9)
are a different thing — custom curated finding aids — and are
unchanged by this design.

| Field | Notes |
|---|---|
| `id`, `slug`, `page` | Unchanged from parent §2.2 (identity, frozen URL slug, print locator via migration rule 6 — baseline deployed files + the 107 hand edits) |
| `headword`, `altHeadwords` | Unchanged form objects (parent §2.2): clean `text` + `homograph` (Roman, 2,871), `disambiguator` (superscript, 807), `reconstructed` (`*`, 1,339); byte-exact regeneration gate. Not re-decided here; restated so this document reads standalone |
| `grammar` | **The typed index (B3).** `gender` seeded at migration from the 13,162 visible markers; `pos` starts null — not in the export, filled by post-migration enrichment (v1 derived POS onto 7,611 entries — deployed `g.ps` — usable as a review seed, register #11). Lint checks index ↔ text agreement |
| `senses` | Tree of `{label?, gloss, units[], senses[]}`. The first sense is unlabeled — it is the entry's intro flow, exactly as printed. `label` is normalized (`"—2)"` → `"2"`, `"a)"` → `"a"`); print punctuation regenerates by rule, byte-exact, else the entry is quarantined (B6). **Form sections (B12, maintainer print-verified 2026-07-13; extended 2026-07-14 during study):** Jastrow's `—<marker> <form> 1)…2)…` blocks are separate lemma-level sense sets, not tails of the preceding sense — the upstream data flattens them into the prior sense's text. Originally verified for `Pl.` (plural); a second print pass found the identical convention under `Part. pass.` (passive participle), `Fem.` (feminine), and `Denom.` (denominative) headers. At migration the block is split out into its own **sibling sense node** (gloss = the marker intro, child senses = the restarted numbered items, full nesting allowed), attributed to the nearest preceding marker when a text carries more than one (sections are sequential). Applies only where a marker's block carries its own numbering — 13 entries, censused: `Pl.` 5, `Part. pass.` 6, `Fem.` 1, `Denom.` 1; plain marker prose without a restarted run stays inline. No schema change — `senses` already recurse; form-section-ness stays text-borne (the marker text in the gloss), consistent with B2 |
| `gloss` | Tagged prose. Contains — deliberately unextracted (B2) — the gender marker, the etymology parenthesis (rejoined), construct/plural-form phrases, bracketed archaic/historical meanings, and the defining text |
| `units` | Citation-evidence blocks (B4): tagged prose, one per citation cluster + its quote/translation prose. Segmented once at migration by the conservative terminator rule (§4); wrong boundaries are per-entry hand fixes afterwards |
| `stems` | Binyan sections (upstream grammar nodes): `stem` from the closed stem set, `forms` (binyan forms), own sense tree |
| — | Cross-reference ("v. …") entries need no field: see note above the table. Curated finding aids stay per parent §2.4 |

**Dropped from truth** (source snapshot retains everything):

| Upstream field | Fate | Decision |
|---|---|---|
| `language_code`, `language_reference` | Rejoined into gloss head (order per Sefaria's own renderer: marker → paren → text) | B2 |
| `content.morphology`, `plural_form` | Rejoined likewise; typed access via `grammar` / future forms index | B2 |
| `refs` | **Dropped — derived at compile** (§5) | B7 |
| `quotes` | **Dropped entirely** (§6) | B8 |
| `_id`, `parent_lexicon`, `prev_hw`/`next_hw`, headword mark-strings | Already dropped/derived per parent §2.2 | — |

## 3. Import mapping (ideal ← source)

Each region: rule, measured confidence, fallback. Every rule is
unit-tested against the fixture corpus (§7) before touching the
corpus, and every transformed entry must pass the round-trip gate:
strip tags, undo normalizations, concatenate — byte-identical to the
source entry.

| Region | Rule | Confidence | Fallback |
|---|---|---|---|
| Gloss head rejoin | `content.morphology` ⧺ `language_code` ⧺ `language_reference` ⧺ sense-1 text, seams preserved | High — pure concatenation; heals K00664-class mid-phrase splits by construction | None needed |
| `grammar.gender` | Parse the marker vocabulary (m., f., c., combos) — value space censused first | High — small closed set | Entries with unparseable markers get `gender` omitted; text unaffected |
| Sense labels | Normalize numerals/letters; regenerate print form (`1)` first, `—N)` after, `*` prefix preserved) | High | 72 broken-sequence entries (§7) quarantined to eyes-on; raw label kept where regeneration fails |
| Lettered items (B5) | Split `a)…b)…c)` runs into child senses — runs **before** unit segmentation | Medium — ~190 entries, fixtured | Unsplit text stays in parent gloss |
| Form sections (B12: `Pl.`, `Part. pass.`, `Fem.`, `Denom.`) | Split `—<marker> <form> 1)…` blocks out of their host sense into a sibling sense with child numbered senses — byte round-trip via pure slicing; a run attributes to the nearest preceding marker | High — exactly 13 entries, censused + fixtured (`Pl.` 5, `Part. pass.` 6, `Fem.` 1, `Denom.` 1) | Unsplit block stays in host gloss |
| Unit boundaries | Break before an external citation iff preceding text ends `.` or `—` (or sense start); `;`/`,` continue a citation list; mid-phrase citations never break | Medium — measured: 64.4% `.`, 13.9% `;`, 6.6% `—`, ~10% embedded | Failure mode is under-split only (two units render as one); per-entry fix later |
| Markup, links, cites | Parent spec rules 2–3 (closed vocabulary), emitting the unified `<cite ref>` (B10) | Per parent | Per parent |

## 4. Unit segmentation (B4)

Chosen over render-time segmentation and compile-time overrides
(maintainer, 2026-07-11) because a wrong boundary must be a small,
visible, per-entry fix — not a global renderer patch. The rule is
deliberately conservative; its known hazards, all censused before the
rule is finalized (maintainer vetting mandate, B9):

- refLink `href` values missing the leading slash (e.g. A00014's
  `href="Jerusalem_Talmud_Nedarim.5.6.3"`) — the citation detector
  must match both forms.
- Citations inside parentheses (`(play on X, Prov. XXIII, 29)`) —
  never boundaries.
- Sense-number damage (§7) interacting with segmentation.

## 5. References: derived, not stored (B7)

Measured: of 98,124 `refs`-field items, 87.8% exactly duplicate an
inline citation, 12.1% are same-book expansions of one, 29 items
(0.03%) have no inline basis. The field is a stale, incomplete
derivation of the body — 31% of inline citations are missing from it.
Truth therefore stores no reference list. `compile` derives the
complete per-entry index from the `<cite>` tags, categorized by
corpus (Talmud/Midrash/Bible/…, regenerating what v1 shipped as the
derived `rf` rollup) for the color-coded reference box and search.

The 29 orphans, audited 2026-07-11:

- 21 are internal cross-references to gershayim-abbreviation
  headwords (א"ט, אלפ"א …) whose target text sits unlinked in the
  body — fixed by wrapping the text in `<cite ref>` (hand pass, listed
  in the migration report).
- 5 are resolved-but-unlinked **ibid** citations (`Ib. 88ᵇ`) — fixed
  the same way, with the resolution taken from the old refs value.
- 3 are unexplained (D00541 → Yoma 2a, Q00890 → Yoma 2a:3, M01355 →
  R. Hash. 23b) — maintainer eyes-on at migration review.

**Ibid class (new register item):** the corpus has 15,421 ibid
citations; 8,403 carry links, 7,018 do not. Resolving the unlinked
ones (chaining from the previous citation in the entry) is a
post-migration linking pass — wrapping existing text in tags is
additive and does not block migration.

## 6. Quotes: dropped (B8)

The field is a vestigial Sefaria importer artifact: a generic
lexicon-schema attribute (BDB carries it too), populated for Jastrow
with compound phrases extracted from the body (printed א׳
abbreviation expanded, trailing translation captured, first slot of
every triple null), corrupted in places (`I`→`1`, truncations,
token-reversals) — and consumed by nothing in Sefaria's codebase;
their own renderer never displays it. Measured: 316 of 324 phrases
provably locate inside their entry's own body. Maintainer decision
2026-07-11: drop entirely. The phrases remain as ordinary body text;
the source snapshot retains the field; inline phrase-marking remains
possible later as an additive enrichment.

## 7. Censuses, fixtures, gates (B9)

Maintainer mandate: every parse rule is vetted against enumerated
edge-case classes before running; anything unprovable goes to eyes-on
review, never into truth silently.

| Census / fixture set | Size | Purpose |
|---|---|---|
| Gender-marker value space | 13,162 | Close the `grammar.gender` vocabulary |
| Broken sense-number sequences | 72 | Upstream damage (spurious/missing `N)`) — eyes-on; feeds label + segmentation fixtures |
| Lettered-item shapes | ~190 | Fixture the a)/b)/c) split |
| Unit-boundary classes | 89k+ citations | Terminator-rule distribution incl. slash-less hrefs, parenthesized cites |
| Preamble content survey | 5,842 origin + preamble entries | Verify the rejoin order; catalogue const./pl. phrasing for a future forms index |
| Ibid citations | 15,421 (7,018 unlinked) | Scope the post-migration linking pass |
| Orphan refs | 29 (21 + 5 + 3) | §5 dispositions |
| Quotes stragglers | 8 | Phrases that don't locate in their body — review before the field is deleted |

**Blessing gates** (in addition to the parent spec's): per-entry
byte round-trip over all 32,512 (strip structure → source text);
label-regeneration byte-exactness; golden render-diff with every
difference explained by a listed rule; maintainer sampled review.
Until blessing, no full-corpus pass writes anything.

## 8. Parent-spec consequences

- §2.2 provisional rows (`origin`, `senses`, `quotes`) are resolved
  by this document; `refs` row is superseded by §5 here.
- §2.3 vocabulary: `<ref rid>` and `<cite ref>` merge into one
  `<cite ref>` tag (B10); no new tags (units are arrays; phrase tag
  not adopted). D8 unchanged — sense-level addressing attributes
  remain additive future options.
- **B11 — formal schema deliverable:** the entry format ships as a
  machine-readable schema definition (JSON Schema), enforced by the
  pipeline `validate` stage (parent 2.4) and serving as the
  documented generic spec of the format — examples in this document
  illustrate it, they do not define it. Written alongside
  `migrate.ts`, kept current thereafter.
- Cleanup register: #1 becomes "derived-index completeness lint";
  #12 closes (quotes dropped); add "ibid linking pass" and "POS
  enrichment (seed from v1 `g.ps`)"; forms index noted as future
  additive work.
- D11 (compile) gains: reference-index derivation + corpus
  categorization.

## 9. Changelog

| Date | Change |
|------|--------|
| 2026-07-11 | Initial draft from design session (maintainer + Claude): ideal-form-first method; prose collapse + grammar index; units as arrays with conservative segmentation; lettered-item parse; refs and quotes dropped from truth; census/fixture/gate plan |
| 2026-07-11 | Review round 1 (maintainer): B10 — `<ref>`/`<cite>` merged into one `<cite ref>` tag, router/validator dispatch on the unambiguous rid pattern; dual-destination routing requirement recorded (internal primary + Sefaria arrow icon); B11 — formal JSON Schema is the documented generic spec, examples illustrate only. Visual-collab .docx samples removed |
| 2026-07-13 | **B12 — plural sections** (maintainer, print-verified via C00062): `—Pl. <form>` blocks with restarted `1)…` numbering are separate lemma-level sense sets; migration splits them into a sibling sense node with child senses (25 entries, censused). Found during the maintainer review of the §6.0 evidence package |
| 2026-07-14 | B12 extended (maintainer, during study): `Part. pass.` observed in print carrying the same section convention; generalized to form sections (`Pl.`/`Part. pass.`/`Fem.`/`Denom.`), 13 genuine splits |
| 2026-08-05 | **§6.0 maintainer review complete** (all 7 body-review docs). 01: crossref/citation-chop rejoins approved (36); numbering-gaps hand-verified against print — most are upstream-swallowed markers to reinsert; implied-`1)` convention identified (39 occurrences, print-faithful — v2 inserts the `1)` as a recorded deviation; register #16). 02: cite-wrap approved for 21 gershayim + 5 ibid orphans; the 3 baseless refs **removed** (judged user-added via Sefaria's interface — principle: show only what Jastrow linked). 03: all 8 quote stragglers drop with the field; Sefaria devs confirmed `quotes` was never validated. 04: `-N)` labels corrected to em-dash; D00341's `[1)` bracket moves into sense text as a recorded deviation. 05: segmentation boundaries approved on the 50-entry sample. 06: empty `binyan_form` strings dropped at migration (schema keeps `minLength: 1`); stray spaces trimmed (register #17). 07: extend `splitLettered` to italic-wrapped markers before migration (B5 rule work: re-fixture + re-gate). New scope surfaced: a `notes` mechanism for intentional deviations from print (anchored in text, shown with icon/popover) — to spec separately |
| 2026-08-05 | **B5 italic-marker extension implemented** (Task 15, per the 07 decision above): `splitLettered` recognizes three italic marker shapes alongside plain `a)` — the full pair `<i>a</i>)` (the bulk of the 75 reviewed entries) and two lazy-span shapes where Sefaria merged the marker into a neighboring italic span: span-end `a</i>)` (Q01353's `<i>section, a</i>)` for `<i>section, </i><i>a</i>)`) and span-start `<i>a)` (Q01198). The split repairs the boundary it cuts (span-end: `</i>` appended to the preceding segment; span-start: `<i>` re-opened on the item text) so no built gloss carries an unbalanced tag; `joinLettered` inverts the repair, keyed by each item's recorded raw marker, keeping the byte round-trip exact. Span-end is guarded by a corpus-measured discriminator (`.`/`,`/`;` + space before the letter): 6 genuine vs 15 possessive/parenthetical false positives (`(<i>in a</i>)`), all excluded. Full-corpus gates re-run: all four round-trips 32,512/32,512; structural lettered splits 116 → 191; census/structural reconciliation now 189 + 2 = 191, zero unexplained (dry-run Finding 2 updated). Fixtures: O01078, P00480, Q01353, Q01198 added to `lettered.jsonl` |
| 2026-08-05 | **§6.0 migration repair passes implemented** (Task 16, per the review decisions above): `repairs.ts` (pure, rid-keyed literal edits, loud on drift) + `bun body:migrate-dry` (repairs → composition → gates → report). 36 chop rejoins; 4 implied-`1)` inserts as recorded deviations (register #16 — maintainer clarified the chops were never senses, so the register's "39" split into #16 proper and new #18 for the chop class); 14 print-verified marker reinserts; 6 label repairs; binyan cleanup (486 empties dropped, 523 trimmed, 751 entries); 21 gershayim attribute escapes + 3 ibid cite-wraps + 3 baseless refs removed. Healed-corpus gates all 32,512/32,512; full-corpus schema 0 failures; label quarantines 0; broken sequences 72 → 34 (each survivor accounted); deferred to eyes-on: D00470, K00081, R00519. Evidence: docs/v2/body-migration.md |
