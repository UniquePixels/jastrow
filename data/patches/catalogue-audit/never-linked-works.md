# Audit — the never-linked works family (4 rows, 3,117)

**RULED 2026-08-31 (Brian): WITHDRAW.** All four rows go to
`judgment` with one Phase 4 linker item, as recommended below.

| Row | Instances |
|---|---:|
| `tanhuma-never-linked` | 1,137 |
| `mekhilta-sifra-never-linked` | 923 |
| `pesikta-drk-never-linked` | 695 |
| `targum-sheni-never-linked` | 362 |

`midrash-petichta-unanchored` (279) was catalogued alongside these and
is audited separately — it is the one row of the five whose target work
names DO exist in the corpus. See `midrash-petichta.md`.

## The one question that decides all four

Each row says a work is cited often and anchored never, and asks for a
rule that anchors it. Such a rule does not repair an anchor — **it
mints one**, and the ref it writes must name a Sefaria work. So the
question is not the citation rate. It is whether the corpus anywhere
attests the work name the minted ref would have to carry.

This is the `seeParticleRestore` test from batch 8, applied to a target
vocabulary rather than a particle vocabulary: a slot that was
normalised away leaves ONE surviving value; a slot that is merely
under-populated keeps a dozen.

## The census

Over all 32,512 entries after `applyRepairs`
(`admin/pipeline/transform/rules/corpus-fixture.ts`,
`repairedEntries()`), every `data-ref` attribute value:

```text
170,184 anchor occurrences
 72,387 distinct data-ref values
 23,211 distinct work names   (value minus its trailing locus)
```

Against that vocabulary:

| Work the row would mint | Occurrences |
|---|---:|
| Midrash Tanchuma (any spelling) | **0** |
| Sifra | **0** |
| Mekhilta d'Rabbi Yishmael | **1** |
| Pesikta d'Rav Kahana | **0** |
| Targum Sheni | **0** |

**No alias explains the zeros.** The work-name list was enumerated by
initial letter, not probed by guess:

- `S…` holds **10** names. No `Sifra`. It does hold `Sifrei Devarim`
  402 and `Sifrei Bamidbar` 193 — which is the control
  `mekhilta-sifra-never-linked` itself named, and it holds.
- `T…` holds **102** names, all `Targum Jonathan on …`, `Targum of
  … Chronicles`, `Tosefta …`, `Taanit`. No `Targum Sheni`, no
  `Second Targum`. `Aramaic Targum to Esther` (286) is Targum Rishon,
  the row's own point.
- `M…` holds **71** names. `Midrash Tehillim` 880 is the near
  neighbour; there is no `Midrash Tanchuma`.
- `P…` holds **6** names in total. `Pesikta Rabbati` **809** is there;
  `Pesikta d'Rav Kahana` is not.

## The Pesikta pair confirms the row's own falsifier

`pesikta-drk-never-linked` warned that a naive `Pesik.` rule would
rewrite correct links, the discriminator being the absence of `R.`.
The census puts numbers on it: **`Pesikta Rabbati` 809 anchors against
`Pesikta d'Rav Kahana` 0**. The trap is real and it is large.

## Why a mint cannot be verified here

Every minting rule the registry carries is verified against an
in-corpus witness. `sectionBreakTerminator` mints a period against
7,250 correct against 11. `seeParticleRestore` mints `v.` against a
retained vocabulary of a dozen values, head 7,154 of 7,270.
`continuationMarkerDash` declares its em dash `copied` and the gate
checks it against that entry's own sibling marker.

For these four there is no witness to check against. The gate would
have to assert that a string absent from 170,184 anchors is the correct
Sefaria address — an assertion sourced from outside the corpus, which
no corpus gate can make. `Mekhilta d'Rabbi Yishmael` at 1 occurrence is
not a counter-example; one value is exactly the "normalised away"
signature, not a retained vocabulary.

## Recommendation

**Withdraw all four to `judgment`**, and open one Phase 4 linker item
covering the shared cause: the work-name table the linker consults has
no entry for these works. That is where an external work-name mapping
legitimately lives; the transform route cannot source one.

This is the `empty-stem-section` shape — a real defect whose repair
belongs to a later phase, recorded rather than discarded.

The four rows' measurements are sound and should survive into the
Phase 4 item: the citation counts, the 85–93% comparable-work link
rates, the `Sifré` and `Pesikta Rabbati` controls, and the three-arm
splits (`Tanḥ.` standard / `ed. Bub.` / anaphoric; `Pesik.` /
`Pesik. Zutr.`) all name work that the linker item will need.

## Reproduce

`scratchpad/batch-9/reftargets.ts` — census and probes.
