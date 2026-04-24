/**
 * Rabbinic Time dialog — sha'ot zmaniyot & zmanim reference.
 *
 * Draws a seasonal timeline, 24-hour circle diagram, and monthly
 * sha'ah-duration chart inside the #rabbinic-time dialog. Adapted
 * from the standalone shaot-zemaniyot prototype.
 */

/* global Chart */

(() => {
	const NS = 'http://www.w3.org/2000/svg';

	function mk(tag, attrs = {}) {
		const el = document.createElementNS(NS, tag);
		for (const [k, v] of Object.entries(attrs)) {
			el.setAttribute(k, v);
		}
		return el;
	}

	function tx(text, attrs = {}) {
		const el = mk('text', attrs);
		el.textContent = String(text);
		return el;
	}

	function clrSvg(svg) {
		// Preserve <title> for accessibility; remove all other children
		const title = svg.querySelector(':scope > title');
		while (svg.firstChild) {
			svg.removeChild(svg.firstChild);
		}
		if (title) {
			svg.appendChild(title);
		}
	}

	function displayHour(hh) {
		if (hh === 0) {
			return 12;
		}
		if (hh > 12) {
			return hh - 12;
		}
		return hh;
	}

	function fh(h) {
		const norm = ((h % 24) + 24) % 24;
		const hh = Math.floor(norm);
		const mm = Math.round((norm - hh) * 60);
		if (mm === 60) {
			return fh(hh + 1);
		}
		const ap = hh >= 12 ? 'PM' : 'AM';
		return `${displayHour(hh)}:${mm.toString().padStart(2, '0')} ${ap}`;
	}

	function pol(a, r, cx, cy) {
		const rd = ((a - 90) * Math.PI) / 180;
		return { x: cx + r * Math.cos(rd), y: cy + r * Math.sin(rd) };
	}

	function normEnd(a1, endA) {
		let e = endA;
		while (e <= a1) {
			e += 360;
		}
		return e;
	}

	function pieSeg(cx, cy, r, a1, a2) {
		const end = normEnd(a1, a2);
		if (end - a1 >= 360) {
			return `M${cx - r},${cy} A${r},${r},0,1,1,${cx + r},${cy} A${r},${r},0,1,1,${cx - r},${cy}Z`;
		}
		const la = end - a1 > 180 ? 1 : 0;
		const p1 = pol(a1, r, cx, cy);
		const p2 = pol(end, r, cx, cy);
		return `M${cx},${cy} L${p1.x.toFixed(1)},${p1.y.toFixed(1)} A${r},${r},0,${la},1,${p2.x.toFixed(1)},${p2.y.toFixed(1)}Z`;
	}

	function ringSeg(cx, cy, ro, ri, a1, a2) {
		const end = normEnd(a1, a2);
		const la = end - a1 > 180 ? 1 : 0;
		const s1 = pol(a1, ro, cx, cy);
		const e1 = pol(end, ro, cx, cy);
		const s2 = pol(end, ri, cx, cy);
		const e2 = pol(a1, ri, cx, cy);
		return `M${s1.x.toFixed(1)},${s1.y.toFixed(1)} A${ro},${ro},0,${la},1,${e1.x.toFixed(1)},${e1.y.toFixed(1)} L${s2.x.toFixed(1)},${s2.y.toFixed(1)} A${ri},${ri},0,${la},0,${e2.x.toFixed(1)},${e2.y.toFixed(1)}Z`;
	}

	function hToA(h) {
		return (((((h - 12) % 24) + 24) % 24) / 24) * 360;
	}

	function anchorForAngle(angle, widen) {
		const am = ((angle % 360) + 360) % 360;
		if (widen && (am < 14 || am > 346)) {
			return 'middle';
		}
		if (am < 166) {
			return 'start';
		}
		if (am > 194) {
			return 'end';
		}
		return 'middle';
	}

	function zoneLabel(id) {
		if (id === 'tsh') {
			return 'Tamid (Shacharit)';
		}
		if (id === 'tba') {
			return 'Tamid (Mincha)';
		}
		if (id === 'bharb') {
			return 'Bein Ha-Arbayim';
		}
		return '';
	}

	function tickSize(isMaj, isMed) {
		if (isMaj) {
			return 11;
		}
		if (isMed) {
			return 7;
		}
		return 4;
	}

	const SEA = {
		summer: {
			key: 'summer',
			label: 'Summer',
			sm: 75,
			col: '#9a6a10',
			netz: 4.5,
			shkiah: 19.5,
			alot: 3.3,
			mish: 3.92,
			tzet: 19.8,
		},
		equinox: {
			key: 'equinox',
			label: 'Equinox',
			sm: 60,
			col: '#6b5c20',
			netz: 6.0,
			shkiah: 18.0,
			alot: 4.8,
			mish: 5.42,
			tzet: 18.3,
		},
		winter: {
			key: 'winter',
			label: 'Winter',
			sm: 45,
			col: '#3860a0',
			netz: 7.5,
			shkiah: 16.5,
			alot: 6.3,
			mish: 6.92,
			tzet: 16.8,
		},
	};
	const SKEYS = ['summer', 'equinox', 'winter'];

	function chatzotLailah(s) {
		return s.tzet + (24 - (s.shkiah - s.netz)) / 2;
	}

	function skyZones(s, key) {
		const { netz: N, shkiah: S, alot: A, mish: M, tzet: T } = s;
		const noon = (N + S) / 2;
		const pre = A - 0.3;
		const post = T + 0.45;
		if (key === 'winter') {
			return [
				{ s: pre, e: A, c: '#050c18' },
				{ s: A, e: M, c: '#0d1a2c' },
				{ s: M, e: N, c: '#223448' },
				{ s: N, e: N + 0.7, c: '#4a6a88' },
				{ s: N + 0.7, e: noon - 0.5, c: '#88a8c0' },
				{ s: noon - 0.5, e: noon + 0.5, c: '#b0c8d8' },
				{ s: noon + 0.5, e: S - 0.7, c: '#88a8c0' },
				{ s: S - 0.7, e: S, c: '#4a6a88' },
				{ s: S, e: T, c: '#1c2a3c' },
				{ s: T, e: post, c: '#050c18' },
			];
		}
		if (key === 'summer') {
			return [
				{ s: pre, e: A, c: '#060e1c' },
				{ s: A, e: M, c: '#1a2840' },
				{ s: M, e: N, c: '#9a5820' },
				{ s: N, e: N + 1, c: '#d4943a' },
				{ s: N + 1, e: noon - 1, c: '#f4e488' },
				{ s: noon - 1, e: noon + 1, c: '#fffae8' },
				{ s: noon + 1, e: S - 1, c: '#f4e488' },
				{ s: S - 1, e: S, c: '#d4943a' },
				{ s: S, e: T, c: '#7a2858' },
				{ s: T, e: post, c: '#0a1428' },
			];
		}
		return [
			{ s: pre, e: A, c: '#060e1c' },
			{ s: A, e: M, c: '#142030' },
			{ s: M, e: N, c: '#5a3818' },
			{ s: N, e: N + 0.75, c: '#a07838' },
			{ s: N + 0.75, e: noon - 0.5, c: '#d4c070' },
			{ s: noon - 0.5, e: noon + 0.5, c: '#f4ecd4' },
			{ s: noon + 0.5, e: S - 0.75, c: '#d4c070' },
			{ s: S - 0.75, e: S, c: '#a07838' },
			{ s: S, e: T, c: '#5a2040' },
			{ s: T, e: post, c: '#060e1c' },
		];
	}

	const C_DB = '#2563eb';
	const C_PR = '#b83232';
	const C_KB = '#15803d';

	const MK = [
		{
			id: 'alot',
			cat: 'db',
			lv: 0,
			col: C_DB,
			getH: (s) => s.alot,
			name: 'Alot HaShachar',
			heb: 'עֲלוֹת הַשַּׁחַר',
			trans: 'rising of the dawn',
			when: (s) => `${fh(s.alot)} · ~72 min before Netz`,
			note: "First trace of light on the eastern horizon. Day begins for some korbanos. Earliest b'dieved Shacharit. Yoma 28b: 'amud hashachar.' The 72 vs 90 min debate is based on walking distance of 4 mil before sunrise.",
		},
		{
			id: 'mish',
			cat: 'db',
			lv: 1,
			col: C_DB,
			getH: (s) => s.mish,
			name: 'Misheyakir',
			heb: 'מִשֶּׁיַּכִּיר',
			trans: '"when one can recognize"',
			when: (s) => `${fh(s.mish)} · ~35 min before Netz`,
			note: "Light sufficient to distinguish techelet (blue) thread from white in tzitzit, and to recognize a friend at arm's length. Earliest time for tallit and tefillin (most Poskim). Varies by season and latitude.",
		},
		{
			id: 'netz',
			cat: 'db',
			lv: 0,
			col: C_DB,
			getH: (s) => s.netz,
			name: 'Netz HaChama',
			heb: 'נֵץ הַחַמָּה',
			trans: 'sunrise',
			when: (s) => `${fh(s.netz)} · sha'ah 0`,
			note: "Start of the halachic day. All 12 sha'ot zemaniyot measured from here. Preferred (vatikin) time for Shacharit Amidah — completing the Amidah at the first ray of sunrise (Berachot 9b).",
		},
		{
			id: 'shki',
			cat: 'db',
			lv: 1,
			col: C_DB,
			getH: (s) => s.shkiah,
			name: 'Shkiah',
			heb: 'שְׁקִיעָה',
			trans: 'sunset',
			when: (s) => `${fh(s.shkiah)} · sha'ah 12`,
			note: 'End of the halachic day. Shabbat and Yom Tov begin. R. Tam distinguishes shkiah rishona (disc disappears) from full darkness (~50 min later); most Rishonim follow the Geonim and hold twilight begins from this moment.',
		},
		{
			id: 'bhash',
			cat: 'db',
			lv: 0,
			col: '#1e3878',
			isZone: true,
			getH: (s) => s.shkiah,
			getH2: (s) => s.tzet,
			name: 'Bein HaShmashot',
			heb: 'בֵּין הַשְּׁמָשׁוֹת',
			trans: '"between the suns" — uncertain twilight',
			when: (s) => `${fh(s.shkiah)} – ${fh(s.tzet)} (13–72 min; disputed)`,
			note: "Uncertain boundary between day and night — treated stringently as both simultaneously. Cannot do melachah; cannot yet make Havdalah. R. Yose (Shabbat 34b): 'like the twinkling of an eye.' Geonim: ~18 min after Shkiah. R. Tam: ~50–72 min. This is the core of almost every Shabbat-ending question.",
		},
		{
			id: 'tzet',
			cat: 'db',
			lv: 0,
			col: C_DB,
			getH: (s) => s.tzet,
			name: 'Tzet HaKochavim',
			heb: 'צֵאת הַכּוֹכָבִים',
			trans: '"emergence of the stars"',
			when: (s) =>
				`${fh(s.tzet)} · ~18 min after Shkiah (Geonim); R. Tam: ~50–72 min`,
			note: 'Definitive nightfall; 3 medium stars visible. Shabbat ends; Havdalah recited; Maariv valid. The Geonim vs R. Tam dispute is fundamentally a dispute about when Tzet occurs.',
		},
		{
			id: 'chatzL',
			cat: 'db',
			lv: 0,
			col: C_DB,
			noTimeline: true,
			getH: (s) => {
				const c = chatzotLailah(s);
				return c >= 24 ? c - 24 : c;
			},
			name: 'Chatzot Lailah',
			heb: 'חֲצוֹת הַלַּיְלָה',
			trans: 'halachic midnight',
			when: (s) => {
				const c = chatzotLailah(s);
				return `${fh(c >= 24 ? c - 24 : c)} · midpoint of night`;
			},
			note: "Exactly 6 night sha'ot after Tzet. Night sha'ot span Tzet to Alot, divided into 12 equal parts — their duration differs from daytime sha'ot. The Exodus plague struck at midnight (Shemot 12:29). Tikun Chatzot recited here.",
		},
		{
			id: 'ashm',
			cat: 'db',
			noTimeline: true,
			noCircle: true,
			getH: () => 0,
			name: 'Ashmorot',
			heb: 'אַשְׁמוֹרוֹת',
			trans: 'night watches',
			when: () => 'Night divided into 3 watches (Talmud) or 4 (Roman)',
			note: 'Berachot 3b: R. Eliezer — at each of the 3 watch transitions God mourns the Temple, with a sign for each: (1) donkeys bray, (2) dogs howl, (3) a nursing child wakes. David rose at the last watch for Tehillim. R. Yosi: 4 watches (Roman military reckoning).',
		},
		{
			id: 'erev',
			cat: 'db',
			noTimeline: true,
			noCircle: true,
			getH: () => 0,
			name: 'Erev',
			heb: 'עֶרֶב',
			trans: '"evening" / "eve"',
			when: () => 'Broadly: afternoon through sunset; "erev X" = eve of X',
			note: "Torah term for the pre-night transition. Since the halachic day begins at night (Bereishit 1: vayehi erev, vayehi voker), 'erev Shabbat' = Friday afternoon, 'erev Pesach' = 14 Nisan afternoon. Underlies preparation laws for Shabbat and Yom Tov.",
		},

		{
			id: 'shema',
			cat: 'pr',
			lv: 1,
			col: C_PR,
			getH: (s) => s.netz + (3 * s.sm) / 60,
			name: 'Sof Zman Shema',
			heb: 'סוֹף זְמַן שְׁמַע',
			trans: 'deadline for morning Shema',
			when: (s) => `${fh(s.netz + (3 * s.sm) / 60)} · sha'ah 3`,
			note: "Latest time to fulfill the Torah obligation of morning Shema (Berachot 9b). After this: recited without a beracha. B'dieved until Sof Tefillah (sha'ah 4). Set at sha'ah 3 because Shema must be said before 'the third hour when kings arise.'",
		},
		{
			id: 'tefil',
			cat: 'pr',
			lv: 0,
			col: C_PR,
			getH: (s) => s.netz + (4 * s.sm) / 60,
			name: 'Sof Tefillah',
			heb: 'סוֹף תְּפִלָּה',
			trans: 'deadline for Shacharit Amidah',
			when: (s) => `${fh(s.netz + (4 * s.sm) / 60)} · sha'ah 4`,
			note: 'Latest time for Shacharit Amidah (Berachot 26a-b). Directly mirrors when the Tamid Shachar had to be completed — the tefillah window is derived from the korban window. After this: Shacharit is missed; make-up (tashlumin) with first Maariv is possible.',
		},
		{
			id: 'chatz',
			cat: 'pr',
			lv: 1,
			col: C_PR,
			getH: (s) => s.netz + (6 * s.sm) / 60,
			name: 'Chatzot',
			heb: 'חֲצוֹת',
			trans: 'halachic noon',
			when: (s) => `${fh(s.netz + (6 * s.sm) / 60)} · sha'ah 6`,
			note: "Midpoint of the halachic day. Latest time to offer Korban Pesach (Rambam). Tachanun omitted after Chatzot. Earliest Mincha = Mincha Gedolah (half sha'ah after this).",
		},
		{
			id: 'mged',
			cat: 'pr',
			lv: 0,
			col: C_PR,
			getH: (s) => s.netz + (6.5 * s.sm) / 60,
			name: 'Mincha Gedolah',
			heb: 'מִנְחָה גְדוֹלָה',
			trans: 'earliest Mincha',
			when: (s) => `${fh(s.netz + (6.5 * s.sm) / 60)} · sha'ah 6½`,
			note: "Earliest valid time for Mincha Amidah — half a sha'ah after Chatzot. Corresponds to when the afternoon Tamid first became valid to offer. R. Yochanan: Mincha Gedolah is preferable in some respects (Berachot 29b).",
		},
		{
			id: 'mket',
			cat: 'pr',
			lv: 1,
			col: C_PR,
			getH: (s) => s.netz + (9.5 * s.sm) / 60,
			name: 'Mincha Ketanah',
			heb: 'מִנְחָה קְטַנָּה',
			trans: 'preferred Mincha time',
			when: (s) => `${fh(s.netz + (9.5 * s.sm) / 60)} · sha'ah 9½`,
			note: "Preferred (l'chatchila) time for Mincha Amidah. Berachot 6b: 'One who davens Mincha Ketanah — Eliyahu the prophet answered him.' Corresponds precisely to when the Tamid bein ha-arbayim was ideally slaughtered (Pesachim 58a).",
		},
		{
			id: 'plag',
			cat: 'pr',
			lv: 0,
			col: C_PR,
			getH: (s) => s.netz + (10.75 * s.sm) / 60,
			name: 'Plag HaMincha',
			heb: 'פְּלַג הַמִּנְחָה',
			trans: 'portion of the afternoon',
			when: (s) => `${fh(s.netz + (10.75 * s.sm) / 60)} · sha'ah 10¾`,
			note: "¾ through the last sha'ah. Latest Mincha (R. Yehuda, Berachot 27a); earliest Maariv (same opinion — cannot hold both at once). Many communities begin Kabbalat Shabbat at Plag on Friday night.",
		},

		{
			id: 'bharb',
			cat: 'kb',
			lv: 1,
			col: '#5a7a18',
			isZone: true,
			getH: (s) => s.netz + (9.5 * s.sm) / 60,
			getH2: (s) => s.tzet,
			name: 'Bein Ha-Arbayim',
			heb: 'בֵּין הָעַרְבַּיִם',
			trans: '"between the two evenings"',
			when: (s) =>
				`${fh(s.netz + (9.5 * s.sm) / 60)} – ${fh(s.tzet)} (start disputed)`,
			note: "Torah term (Shemot 12:6; 29:39) defining when to bring: Tamid shel bein ha-arbayim, Korban Pesach, Menorah lighting, Shabbat candle lighting. Start-time dispute: Rashbam — 'two evenings' = (1) sun begins to decline → sunset, (2) sunset → full dark. Rambam: any visible post-noon decline. Most Acharonim: from ~Mincha Ketanah.",
		},
		{
			id: 'tsh',
			cat: 'kb',
			lv: 0,
			col: C_KB,
			isZone: true,
			getH: (s) => s.netz,
			getH2: (s) => s.netz + (4 * s.sm) / 60,
			name: 'Tamid Shachar',
			heb: 'תָּמִיד שֶׁל שַׁחַר',
			trans: 'morning daily offering',
			when: (s) =>
				`${fh(s.netz)} – ${fh(s.netz + (4 * s.sm) / 60)} (Netz – sha'ah 4)`,
			note: "Whole-burnt offering slaughtered after Netz and fully offered by sha'ah 4 — hence Sof Tefillah is sha'ah 4. On erev Shabbat / erev Pesach: slaughtered at sha'ah 7 to clear the mizbeach for Korban Pesach (Pesachim 58a). Shacharit Amidah window corresponds to this offering window (Berachot 26b).",
		},
		{
			id: 'musaf',
			cat: 'kb',
			noTimeline: true,
			noCircle: true,
			getH: () => 0,
			name: 'Musaf',
			heb: 'מוּסָף',
			trans: 'additional offering',
			when: () =>
				"Shabbat/Yom Tov/Rosh Chodesh — after Shacharit, ideally before sha'ah 7",
			note: "Additional korban on Shabbat, Rosh Chodesh, Yom Tov, and Chol HaMoed, beyond the Tamid. Brought after Shacharit; ideally before sha'ah 7. The Musaf Amidah corresponds to this offering. Missed Musaf cannot be made up (Berachot 28a, R. Yochanan).",
		},
		{
			id: 'tba',
			cat: 'kb',
			lv: 1,
			col: '#1e6b22',
			isZone: true,
			getH: (s) => s.netz + (8.5 * s.sm) / 60,
			getH2: (s) => s.netz + (10 * s.sm) / 60,
			name: 'Tamid Bein HaArbayim',
			heb: 'תָּמִיד שֶׁל בֵּין הָעַרְבַּיִם',
			trans: 'afternoon daily offering',
			when: (s) =>
				`${fh(s.netz + (8.5 * s.sm) / 60)} – ${fh(s.netz + (10 * s.sm) / 60)} (sha'ot 8½–10)`,
			note: "Slaughtered at sha'ah 8.5; offered by sha'ah 10. On erev Shabbat / erev Pesach: slaughtered at sha'ah 7.5. Mincha Amidah window corresponds to this offering (Berachot 26b). Mincha Ketanah (sha'ah 9.5) mirrors the ideal slaughter time (Pesachim 58a).",
		},
		{
			id: 'kp',
			cat: 'kb',
			noTimeline: true,
			noCircle: true,
			getH: () => 0,
			name: 'Korban Pesach',
			heb: 'קָרְבַּן פֶּסַח',
			trans: 'Passover offering — 14 Nisan only',
			when: () => '14 Nisan, bein ha-arbayim — after Tamid BA, through sunset',
			note: "Slaughtered 14 Nisan bein ha-arbayim (Shemot 12:6). Three groups cycled through the Azarah (Pesachim 64b). The Bein Ha-Arbayim start-time dispute directly determines when Pesach shechita could begin. Special erev Pesach schedule: Tamid Shachar at sha'ah 7, Tamid BA at sha'ah 7.5, then Pesach groups through bein ha-arbayim.",
		},
	];

	const ZROWS = [
		{ ids: ['tsh', 'tba'], catReq: 'kb' },
		{ ids: ['bharb'], catReq: 'kb' },
		{ ids: ['bhash'], catReq: 'db' },
	];

	const RS = { summer: true, equinox: true, winter: true };
	const RC = { db: true, pr: true, kb: true };
	let clockSea = 'equinox';
	const CC = { db: true, pr: true, kb: true };

	const XS = 2.5;
	const XE = 21.0;
	const XR = XE - XS;

	function hx(h, BL, BW) {
		return BL + ((h - XS) / XR) * BW;
	}

	function labelFor(id) {
		const map = {
			netz: 'Netz',
			shki: 'Shkiah',
			alot: 'Alot',
			mish: 'Misheyakir',
			shema: 'Sof Shema',
			tefil: 'Sof Tefillah',
			chatz: 'Chatzot',
			mged: 'Mincha Gedolah',
			mket: 'Mincha Ketanah',
			plag: 'Plag HaMincha',
			tzet: 'Tzet',
			chatzL: 'Chatzot Lailah',
		};
		return map[id] || MK.find((m) => m.id === id)?.name.split(' ')[0] || id;
	}

	function scrollToRow(id) {
		const dialog = document.querySelector('.rabbinic-time-dialog');
		if (!dialog) {
			return;
		}
		const tabGroup = dialog.querySelector('.rt-tabs');
		if (tabGroup) {
			tabGroup.setAttribute('active', 'rt-timeline');
		}
		setTimeout(() => {
			const el = dialog.querySelector(`#rt-row-${id}`);
			if (!el) {
				return;
			}
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			el.style.transition = 'background 0.3s';
			const orig = el.style.background;
			el.style.background = '#d8e8ff';
			setTimeout(() => {
				el.style.background = orig;
			}, 1400);
		}, 120);
	}

	function drawRefSVG() {
		const svg = document.getElementById('rt-ref-svg');
		if (!svg) {
			return;
		}
		clrSvg(svg);
		const activeSea = SKEYS.filter((k) => RS[k]);
		if (activeSea.length === 0) {
			svg.setAttribute('viewBox', '0 0 760 36');
			svg.appendChild(
				tx('Select at least one season.', {
					x: 380,
					y: 22,
					'text-anchor': 'middle',
					'font-size': 12,
					fill: '#6b7280',
				}),
			);
			return;
		}
		const BL = 46;
		const BR = 732;
		const BW = BR - BL;
		const BH = 20;
		const ZH = 9;
		const ZG = 1;
		const GAP = 10;
		const activeZR = ZROWS.filter((r) => RC[r.catReq]);
		const zoneAreaH = activeZR.length * (ZH + ZG);
		const ABOVE = 30;
		const perH = ABOVE + BH + zoneAreaH;
		const TITLE = 16;
		const HHDR = 22;
		const VPAD = 6;
		const totalH = TITLE + HHDR + activeSea.length * (perH + GAP) + VPAD;
		svg.setAttribute('viewBox', `0 0 760 ${totalH}`);
		svg.appendChild(
			mk('rect', {
				width: 760,
				height: totalH,
				fill: 'var(--wa-color-surface-default)',
				rx: 6,
			}),
		);
		svg.appendChild(
			tx(`Comparing: ${activeSea.map((k) => SEA[k].label).join(' · ')}`, {
				x: 380,
				y: 11,
				'text-anchor': 'middle',
				'font-size': 9.5,
				'font-weight': 700,
				fill: 'var(--wa-color-text-default)',
			}),
		);
		for (let h = 3; h <= 21; h += 2) {
			const x = hx(h, BL, BW);
			if (x < BL || x > BR) {
				continue;
			}
			let lbl;
			if (h === 12) {
				lbl = '12PM';
			} else if (h < 12) {
				lbl = `${h}AM`;
			} else {
				lbl = `${h - 12}PM`;
			}
			svg.appendChild(
				tx(lbl, {
					x,
					y: TITLE + 10,
					'text-anchor': 'middle',
					'font-size': 6.5,
					fill: '#737373',
				}),
			);
			svg.appendChild(
				mk('line', {
					x1: x,
					y1: TITLE + HHDR,
					x2: x,
					y2: totalH - VPAD,
					stroke: 'rgba(128,128,128,0.10)',
					'stroke-width': 0.6,
				}),
			);
		}
		let yOff = TITLE + HHDR;
		for (const key of activeSea) {
			const s = SEA[key];
			const bandY = yOff + ABOVE;
			const zoneBaseY = bandY + BH + ZG;
			svg.appendChild(
				tx(s.label, {
					x: 2,
					y: bandY + BH / 2 + 2,
					'font-size': 8.5,
					'font-weight': 700,
					fill: s.col,
				}),
			);
			svg.appendChild(
				tx(`${s.sm}m`, {
					x: 2,
					y: bandY + BH / 2 + 12,
					'font-size': 7,
					fill: s.col,
				}),
			);
			for (const { s: hs, e: he, c } of skyZones(s, key)) {
				const x1 = Math.max(BL, hx(hs, BL, BW));
				const x2 = Math.min(BR, hx(he, BL, BW));
				if (x2 > x1) {
					svg.appendChild(
						mk('rect', {
							x: x1,
							y: bandY,
							width: x2 - x1,
							height: BH,
							fill: c,
						}),
					);
				}
			}
			svg.appendChild(
				mk('rect', {
					x: BL,
					y: bandY,
					width: BW,
					height: BH,
					fill: 'none',
					stroke: 'rgba(128,128,128,0.3)',
					'stroke-width': 0.8,
					rx: 2,
				}),
			);
			for (let i = 1; i <= 11; i++) {
				const x = hx(s.netz + (i * s.sm) / 60, BL, BW);
				if (x > BL && x < BR) {
					svg.appendChild(
						mk('line', {
							x1: x,
							y1: bandY + BH * 0.15,
							x2: x,
							y2: bandY + BH * 0.85,
							stroke: 'rgba(0,0,0,0.45)',
							'stroke-width': 1,
						}),
					);
				}
			}
			const above = MK.filter(
				(m) =>
					!m.isZone &&
					!m.noTimeline &&
					((m.cat === 'db' && RC.db) || (m.cat === 'pr' && RC.pr)),
			);
			const UY = bandY - 22;
			const LY = bandY - 10;
			for (const m of above) {
				const x = hx(m.getH(s), BL, BW);
				if (x < BL - 2 || x > BR + 2) {
					continue;
				}
				const isE = ['netz', 'shki', 'alot', 'tzet', 'mish'].includes(m.id);
				const y = m.lv === 1 ? UY : LY;
				svg.appendChild(
					mk('line', {
						x1: x,
						y1: y + 2,
						x2: x,
						y2: bandY,
						stroke: m.col,
						'stroke-width': isE ? 1.8 : 0.9,
					}),
				);
				svg.appendChild(
					mk('circle', { cx: x, cy: y, r: isE ? 3.5 : 2.5, fill: m.col }),
				);
				const lbl = tx(labelFor(m.id), {
					x,
					y: y - 4,
					'text-anchor': 'middle',
					'font-size': isE ? 8.5 : 7.5,
					fill: m.col,
					'font-weight': isE ? 700 : 400,
					cursor: 'pointer',
				});
				lbl.addEventListener('click', () => scrollToRow(m.id));
				svg.appendChild(lbl);
			}
			activeZR.forEach((zrow, ri) => {
				const zy = zoneBaseY + ri * (ZH + ZG);
				for (const id of zrow.ids) {
					const zm = MK.find((m) => m.id === id);
					if (!zm) {
						continue;
					}
					const x1 = hx(zm.getH(s), BL, BW);
					const x2 = hx(zm.getH2(s), BL, BW);
					if (x2 <= x1 + 1) {
						continue;
					}
					if (id === 'bhash') {
						svg.appendChild(
							mk('rect', {
								x: x1,
								y: zy,
								width: x2 - x1,
								height: ZH,
								fill: '#4a6ab8',
								opacity: 0.32,
								rx: 1,
							}),
						);
						const zt = tx('Bein HaShmashot', {
							x: x2 + 3,
							y: zy + ZH - 1,
							'text-anchor': 'start',
							'font-size': 6.5,
							fill: '#2563eb',
							'font-weight': 700,
							cursor: 'pointer',
						});
						zt.addEventListener('click', () => scrollToRow('bhash'));
						svg.appendChild(zt);
					} else {
						svg.appendChild(
							mk('rect', {
								x: x1,
								y: zy,
								width: x2 - x1,
								height: ZH,
								fill: zm.col,
								opacity: 0.42,
								rx: 1,
							}),
						);
						if (x2 - x1 > 32) {
							const lbl = zoneLabel(id);
							if (lbl) {
								const zt = tx(lbl, {
									x: (x1 + x2) / 2,
									y: zy + ZH - 1,
									'text-anchor': 'middle',
									'font-size': 6.5,
									fill: '#1d1d20',
									'font-weight': 700,
									cursor: 'pointer',
								});
								zt.addEventListener('click', () => scrollToRow(id));
								svg.appendChild(zt);
							}
						}
					}
				}
			});
			yOff += perH + GAP;
		}
	}

	function drawRefTable() {
		const tbody = document.getElementById('rt-ref-body');
		if (!tbody) {
			return;
		}
		tbody.innerHTML = '';
		const s = SEA.equinox;
		const sections = [
			{ cat: 'db', label: 'Zmanim — Structure of the Day', color: C_DB },
			{ cat: 'pr', label: 'Prayer Times', color: C_PR },
			{ cat: 'kb', label: 'Korbanot — Temple Offering Windows', color: C_KB },
		];
		let first = true;
		for (const { cat, label, color } of sections) {
			if (!RC[cat]) {
				continue;
			}
			if (!first) {
				const sp = document.createElement('tr');
				sp.innerHTML =
					'<td colspan="3" style="padding:6px 0;border:none;"></td>';
				tbody.appendChild(sp);
			}
			first = false;
			const h = document.createElement('tr');
			h.className = 'rt-sh';
			const hd = document.createElement('td');
			hd.colSpan = 3;
			hd.style.color = color;
			hd.textContent = label;
			h.appendChild(hd);
			tbody.appendChild(h);
			for (const m of MK.filter((x) => x.cat === cat)) {
				const tr = document.createElement('tr');
				tr.id = `rt-row-${m.id}`;
				const td1 = document.createElement('td');
				const nm = document.createElement('div');
				nm.className = 'rt-zn';
				nm.style.color = m.col;
				nm.textContent = m.name;
				const heb = document.createElement('span');
				heb.className = 'rt-hb';
				heb.style.color = color;
				heb.textContent = m.heb;
				const tr2 = document.createElement('span');
				tr2.className = 'rt-tr';
				tr2.textContent = m.trans;
				td1.append(nm, heb, tr2);
				const td2 = document.createElement('td');
				td2.className = 'rt-tw';
				td2.style.color = color;
				td2.textContent = m.when(s);
				const td3 = document.createElement('td');
				td3.className = 'rt-nt';
				td3.textContent = m.note;
				tr.append(td1, td2, td3);
				tbody.appendChild(tr);
			}
		}
	}

	function drawRef() {
		drawRefSVG();
		drawRefTable();
	}

	function drawClock() {
		const svg = document.getElementById('rt-clock-svg');
		if (!svg) {
			return;
		}
		clrSvg(svg);
		const s = SEA[clockSea];
		const CX = 290;
		const CY = 290;
		const R = 200;
		const Ri = 70;
		const { netz: N, alot: A, tzet: T } = s;
		svg.appendChild(
			mk('circle', { cx: CX, cy: CY, r: R + 10, fill: '#060e1c' }),
		);
		for (const { s: hs, e: he, c } of skyZones(s, clockSea)) {
			const a1 = hToA(hs);
			const a2 = normEnd(a1, hToA(he));
			if (a2 - a1 > 0.3) {
				svg.appendChild(mk('path', { d: pieSeg(CX, CY, R, a1, a2), fill: c }));
			}
		}
		{
			const nA1 = hToA(T);
			const nA2 = normEnd(nA1, hToA(A));
			if (nA2 - nA1 > 1) {
				svg.appendChild(
					mk('path', { d: pieSeg(CX, CY, R, nA1, nA2), fill: '#060e1c' }),
				);
			}
		}
		for (let i = 1; i <= 11; i++) {
			const a = hToA(N + (i * s.sm) / 60);
			const p1 = pol(a, Ri, CX, CY);
			const p2 = pol(a, R, CX, CY);
			svg.appendChild(
				mk('line', {
					x1: p1.x.toFixed(1),
					y1: p1.y.toFixed(1),
					x2: p2.x.toFixed(1),
					y2: p2.y.toFixed(1),
					stroke: 'rgba(180,140,60,0.22)',
					'stroke-width': 0.8,
				}),
			);
		}
		for (let h = 0; h < 24; h++) {
			const a = hToA(h);
			const isMaj = h % 6 === 0;
			const isMed = h % 3 === 0;
			const p1 = pol(a, R, CX, CY);
			const p2 = pol(a, R + tickSize(isMaj, isMed), CX, CY);
			svg.appendChild(
				mk('line', {
					x1: p1.x.toFixed(1),
					y1: p1.y.toFixed(1),
					x2: p2.x.toFixed(1),
					y2: p2.y.toFixed(1),
					stroke: 'rgba(255,255,255,0.38)',
					'stroke-width': isMaj ? 1.4 : 0.7,
				}),
			);
			if (isMaj) {
				const lbl = { 0: '12 AM', 6: '6 AM', 12: '12 PM', 18: '6 PM' }[h] || '';
				const lp = pol(a, R + 22, CX, CY);
				svg.appendChild(
					tx(lbl, {
						x: lp.x.toFixed(1),
						y: (lp.y + 3.5).toFixed(1),
						'text-anchor': 'middle',
						'font-size': 8.5,
						fill: 'rgba(255,255,255,0.52)',
					}),
				);
			}
		}
		if (CC.db) {
			const nightLen = (A < T ? A + 24 : A) - T;
			const w = nightLen / 3;
			const wDef = [
				{ heb: 'א', sign: 'חֲמוֹרִים', c: '#1a2848' },
				{ heb: 'ב', sign: 'כְּלָבִים', c: '#0e1c38' },
				{ heb: 'ג', sign: 'יוֹנְקִים', c: '#152240' },
			];
			for (let i = 0; i < 3; i++) {
				const a1 = hToA(T + i * w);
				const a2 = normEnd(a1, hToA(T + (i + 1) * w));
				const el = mk('path', {
					d: ringSeg(CX, CY, R - 18, R - 36, a1, a2),
					fill: wDef[i].c,
				});
				el.setAttribute('opacity', '0.88');
				svg.appendChild(el);
				const midA = a1 + (a2 - a1) / 2;
				const mp1 = pol(midA, R - 23, CX, CY);
				const mp2 = pol(midA, R - 31, CX, CY);
				svg.appendChild(
					tx(wDef[i].heb, {
						x: mp1.x.toFixed(1),
						y: (mp1.y + 4).toFixed(1),
						'text-anchor': 'middle',
						'font-size': 9,
						fill: 'rgba(160,190,255,0.9)',
						'font-weight': 700,
					}),
				);
				svg.appendChild(
					tx(wDef[i].sign, {
						x: mp2.x.toFixed(1),
						y: (mp2.y + 2.5).toFixed(1),
						'text-anchor': 'middle',
						'font-size': 5,
						fill: 'rgba(200,220,255,0.9)',
					}),
				);
			}
			for (let i = 1; i <= 2; i++) {
				const a = hToA(T + (i * nightLen) / 3);
				const p1 = pol(a, Ri, CX, CY);
				const p2 = pol(a, R, CX, CY);
				svg.appendChild(
					mk('line', {
						x1: p1.x.toFixed(1),
						y1: p1.y.toFixed(1),
						x2: p2.x.toFixed(1),
						y2: p2.y.toFixed(1),
						stroke: 'rgba(130,165,255,0.38)',
						'stroke-width': 0.9,
						'stroke-dasharray': '2,3',
					}),
				);
			}
		}
		const zoneBands = [
			{
				id: 'bharb',
				catReq: 'kb',
				ro: R - 2,
				ri: R - 10,
				col: '#5a7a18',
				op: 0.8,
			},
			{
				id: 'bhash',
				catReq: 'db',
				ro: R - 10,
				ri: R - 18,
				col: '#1e3878',
				op: 0.85,
			},
			{ id: 'tsh', catReq: 'kb', ro: R - 18, ri: R - 27, col: C_KB, op: 0.78 },
			{
				id: 'tba',
				catReq: 'kb',
				ro: R - 27,
				ri: R - 36,
				col: '#1e6b22',
				op: 0.78,
			},
		];
		for (const { id, catReq, ro, ri, col, op } of zoneBands) {
			if (!CC[catReq]) {
				continue;
			}
			const zm = MK.find((m) => m.id === id);
			if (!zm) {
				continue;
			}
			const a1 = hToA(zm.getH(s));
			const a2 = normEnd(a1, hToA(zm.getH2(s)));
			if (a2 - a1 < 0.5) {
				continue;
			}
			if (id === 'bhash') {
				const el = mk('path', {
					d: ringSeg(CX, CY, ro, ri, a1, a2),
					fill: '#4a6ab8',
				});
				el.setAttribute('opacity', '0.45');
				svg.appendChild(el);
				const midA = a1 + (a2 - a1) / 2;
				const anchor = anchorForAngle(midA, false);
				const lp = pol(midA, R - 14, CX, CY);
				const ep = pol(midA, R + 44, CX, CY);
				svg.appendChild(
					mk('line', {
						x1: lp.x.toFixed(1),
						y1: lp.y.toFixed(1),
						x2: ep.x.toFixed(1),
						y2: ep.y.toFixed(1),
						stroke: 'rgba(80,120,220,0.5)',
						'stroke-width': 0.8,
						'stroke-dasharray': '2,2',
					}),
				);
				const tp = pol(midA, R + 54, CX, CY);
				svg.appendChild(
					tx('Bein HaShmashot', {
						x: tp.x.toFixed(1),
						y: (tp.y + 3).toFixed(1),
						'text-anchor': anchor,
						'font-size': 7,
						fill: '#4060c0',
						'font-weight': 700,
					}),
				);
			} else {
				const el = mk('path', {
					d: ringSeg(CX, CY, ro, ri, a1, a2),
					fill: col,
				});
				el.setAttribute('opacity', op);
				svg.appendChild(el);
				const midA = a1 + (a2 - a1) / 2;
				if (a2 - a1 > 18) {
					const mp = pol(midA, (ro + ri) / 2, CX, CY);
					const lbl = zoneLabel(id);
					if (lbl) {
						svg.appendChild(
							tx(lbl, {
								x: mp.x.toFixed(1),
								y: (mp.y + 2.5).toFixed(1),
								'text-anchor': 'middle',
								'font-size': 5.5,
								fill: 'rgba(255,255,255,0.88)',
								'font-weight': 700,
							}),
						);
					}
				}
			}
		}
		svg.appendChild(
			mk('circle', {
				cx: CX,
				cy: CY,
				r: Ri,
				fill: 'var(--wa-color-surface-default)',
				stroke: 'rgba(128,128,128,0.25)',
				'stroke-width': 1.5,
			}),
		);
		svg.appendChild(
			tx('☀', {
				x: CX,
				y: CY - Ri + 20,
				'text-anchor': 'middle',
				'font-size': 16,
				fill: 'rgba(220,160,20,0.85)',
			}),
		);
		svg.appendChild(
			tx('חֲצוֹת', {
				x: CX,
				y: CY - Ri + 33,
				'text-anchor': 'middle',
				'font-size': 7.5,
				fill: 'rgba(170,120,20,0.65)',
			}),
		);
		svg.appendChild(
			tx('☽', {
				x: CX,
				y: CY + Ri - 9,
				'text-anchor': 'middle',
				'font-size': 13,
				fill: 'rgba(150,185,240,0.7)',
			}),
		);
		svg.appendChild(
			tx(s.label, {
				x: CX,
				y: CY + 7,
				'text-anchor': 'middle',
				'font-size': 11,
				fill: '#6b7280',
				'font-weight': 700,
			}),
		);
		svg.appendChild(
			tx(`${s.sm} min/sha'ah`, {
				x: CX,
				y: CY + 20,
				'text-anchor': 'middle',
				'font-size': 7.5,
				fill: '#6b7280',
			}),
		);
		const actM = MK.filter(
			(m) =>
				!m.noCircle &&
				!m.isZone &&
				((m.cat === 'db' && CC.db) || (m.cat === 'pr' && CC.pr)),
		);
		const RtL = R + 34;
		const RtH = R + 52;
		const RnL = R + 50;
		const RnH = R + 70;
		for (const m of actM) {
			let h = m.getH(s);
			if (m.id === 'chatzL') {
				const c = chatzotLailah(s);
				h = c >= 24 ? c - 24 : c;
			}
			const a = hToA(h);
			const isE = ['netz', 'shki', 'alot', 'tzet', 'mish'].includes(m.id);
			const tR = m.lv === 1 ? RtH : RtL;
			const nR = m.lv === 1 ? RnH : RnL;
			const dp = pol(a, R, CX, CY);
			svg.appendChild(
				mk('circle', {
					cx: dp.x.toFixed(1),
					cy: dp.y.toFixed(1),
					r: isE ? 5 : 3.5,
					fill: m.col,
					stroke: 'rgba(255,255,255,0.32)',
					'stroke-width': 0.8,
				}),
			);
			const lp1 = pol(a, R + 5, CX, CY);
			const lp2 = pol(a, nR - 9, CX, CY);
			svg.appendChild(
				mk('line', {
					x1: lp1.x.toFixed(1),
					y1: lp1.y.toFixed(1),
					x2: lp2.x.toFixed(1),
					y2: lp2.y.toFixed(1),
					stroke: m.col,
					'stroke-width': 0.9,
					'stroke-dasharray': m.cat === 'db' ? '3,2' : 'none',
					opacity: 0.7,
				}),
			);
			const anchor = anchorForAngle(a, true);
			const tp = pol(a, tR, CX, CY);
			svg.appendChild(
				tx(fh(h), {
					x: tp.x.toFixed(1),
					y: (tp.y + 3).toFixed(1),
					'text-anchor': anchor,
					'font-size': 6.5,
					fill: 'rgba(255,255,255,0.45)',
				}),
			);
			const np = pol(a, nR, CX, CY);
			svg.appendChild(
				tx(labelFor(m.id), {
					x: np.x.toFixed(1),
					y: (np.y + 3).toFixed(1),
					'text-anchor': anchor,
					'font-size': isE ? 9 : 8,
					fill: m.col,
					'font-weight': isE ? 700 : 400,
				}),
			);
		}
	}

	let chartInstance = null;
	function drawChart() {
		const canvas = document.getElementById('rt-month-chart');
		const ChartCtor = globalThis.Chart;
		if (!canvas || typeof ChartCtor === 'undefined') {
			return;
		}
		if (chartInstance) {
			return;
		}
		chartInstance = new ChartCtor(canvas.getContext('2d'), {
			type: 'line',
			data: {
				labels: [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'May',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dec',
				],
				datasets: [
					{
						data: [47, 53, 59, 66, 73, 75, 74, 68, 60, 53, 48, 46],
						borderColor: '#247BA0',
						backgroundColor: 'rgba(26,107,107,0.07)',
						borderWidth: 2.5,
						tension: 0.35,
						fill: true,
						pointRadius: 5,
						pointBackgroundColor: '#247BA0',
						pointBorderColor: '#ffffff',
						pointBorderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: { label: (c) => `1 sha'ah = ${c.raw} min` },
						borderWidth: 1,
						padding: 10,
					},
				},
				scales: {
					x: {
						grid: { color: 'rgba(128,128,128,0.12)' },
						ticks: { color: '#6b7280' },
					},
					y: {
						min: 40,
						max: 80,
						grid: { color: 'rgba(128,128,128,0.12)' },
						ticks: { color: '#6b7280', callback: (v) => `${v}m` },
					},
				},
			},
			plugins: [
				{
					afterDraw({ ctx, scales: { y, x } }) {
						const yp = y.getPixelForValue(60);
						ctx.save();
						ctx.setLineDash([6, 4]);
						ctx.strokeStyle = '#b83232';
						ctx.lineWidth = 1.5;
						ctx.beginPath();
						ctx.moveTo(x.left, yp);
						ctx.lineTo(x.right, yp);
						ctx.stroke();
						ctx.setLineDash([]);
						ctx.fillStyle = '#b83232';
						ctx.font = '11px sans-serif';
						ctx.textAlign = 'right';
						ctx.fillText('60 min (equinox)', x.right - 4, yp - 5);
						ctx.restore();
					},
				},
			],
		});
	}

	function wireControls() {
		const dialog = document.querySelector('.rabbinic-time-dialog');
		if (!dialog) {
			return;
		}
		for (const key of SKEYS) {
			const btn = dialog.querySelector(`#rt-r-${key}`);
			if (btn) {
				btn.addEventListener('click', () => {
					RS[key] = !RS[key];
					btn.classList.toggle('active', RS[key]);
					drawRef();
				});
			}
		}
		for (const c of ['db', 'pr', 'kb']) {
			const btn = dialog.querySelector(`#rt-r-${c}`);
			if (btn) {
				btn.addEventListener('click', () => {
					RC[c] = !RC[c];
					btn.classList.toggle('active', RC[c]);
					drawRef();
				});
			}
		}
		for (const key of SKEYS) {
			const btn = dialog.querySelector(`#rt-c-${key}`);
			if (btn) {
				btn.addEventListener('click', () => {
					clockSea = key;
					for (const j of SKEYS) {
						dialog
							.querySelector(`#rt-c-${j}`)
							?.classList.toggle('active', j === key);
					}
					drawClock();
				});
			}
		}
		for (const c of ['db', 'pr', 'kb']) {
			const btn = dialog.querySelector(`#rt-c-${c}`);
			if (btn) {
				btn.addEventListener('click', () => {
					CC[c] = !CC[c];
					btn.classList.toggle('active', CC[c]);
					drawClock();
				});
			}
		}
	}

	let initialized = false;
	function init() {
		if (!initialized) {
			initialized = true;
			wireControls();
			drawRef();
			drawClock();
		}
		// Chart.js needs the canvas to be visible with a measurable size — defer to next frame
		requestAnimationFrame(() => drawChart());
	}

	globalThis.RabbinicTime = { init };
})();
