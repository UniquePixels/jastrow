# 04 — Sense-label quarantines (6 occurrences)

**Set:** the `sense.number` occurrences the dry run quarantined as
unparseable (dry-run report `.labels.quarantined`, Finding 4): `[1)`
(a bracket where a digit belongs — OCR/transcription damage) and
`-2)` (ASCII hyphen-minus standing in for the em dash used everywhere
else for the same continuation marker). Quarantined by design (B6):
coercing them would break byte-exact label regeneration.

**Decision to record per row:** keep the raw token verbatim in truth,
or hand-correct it at migration (e.g. `-2)` → `—2)`), deliberately
accepting the byte difference from the source for that entry.

| Rid | Headword | Raw value | Surrounding sense text | Decision |
| --- | --- | --- | --- | --- |
| D00341 | דּוּר I | `[1)` | (entry start) **[1)** to form a circle or enclosure (v. Fl. to Levy Talm. Dict. I, p. 440ᵃ sq.).—Denom. דּוּר II, דּוֹר, דִּירָה &c.… |  |
| M02309 | מְצִי II | `-2)` | …) and since he wrings the blood out, he does the act prescribed for the burnt-offering &c. **-2)** to suck. Sabb. 54ᵇ לִימְצְיוּהָ, v. יָילָא. |  |
| O00408 | סוּר I | `-2)` | …om the decisions of the courts, the interpretations of the Rabbis, Deut. XVII, 11); a. fr. **-2)** to pass away, cease. Num. R. s. 9 (ref. to Am. VI, 7) אותה שעה תָסוּר שמחת הסרוחים at that time shall the joy … |  |
| S02030 | קְרִיאָה | `-2)` | …h a call (Gen. XXVIII, 1); אני … אלא בק׳ I will commence with a call (ib. XLIX, 1); a. fr. **-2)** reading esp. from the Scriptures. קְרִיאַת שמע (קְרִיַּת) (abbrev. ק"ש), or ק׳ (sub. שמע) the recitation of Sh… |  |
| U00745 | שטי | `-2)` | same, v. supra. **-2)** (with ב) to fool, jest. Yeb. 106ᵃ; B. Kam. 116ᵃ אמר ליה משטה אני בך he may say, I was only jesting with thee. … |  |
| U00939 | שִׁילּוּחַ | `-2)` | … אותו בש׳ I punished him with banishment (from Eden); Lam. R. introd. (R. Abbahu 1); a. e. **-2)** (cmp. מִשְׁלַחַת) letting loose, visitation. Yeb. 114ᵇ ש׳ נחשים וכ׳ a plague of serpents and scorpions.—[Y. Gi… |  |
