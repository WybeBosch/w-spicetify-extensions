// NAME: Genre Tags
// DESCRIPTION: Shows Last.fm genre tags of the playing artist in the now playing bar. Click a tag to open its "The Sound of" playlist by thesoundsofspotify.

(function genreTags() {
	if (!Spicetify?.Player?.data || !Spicetify.Platform?.AuthorizationAPI || !document.querySelector(".main-trackInfo-container")) {
		setTimeout(genreTags, 300);
		return;
	}

	const KEY_STORAGE = "genre-tags:lastfm-api-key";
	const NOT_GENRES = new Set(["seen live", "british", "uk", "american", "usa", "female vocalists", "male vocalists", "favorites", "favourites", "the voice", "the voice uk"]);
	const MAX_TAGS = 3;
	const MIN_WEIGHT = 10;
	const cache = new Map();

	const apiKey = () => localStorage.getItem(KEY_STORAGE) || localStorage.getItem("stats:config:api-key");

	async function getTags(artist) {
		if (cache.has(artist)) return cache.get(artist);
		const key = apiKey();
		if (!key) return [];
		const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${encodeURIComponent(artist)}&api_key=${key}&format=json`);
		const tags = ((await res.json()).toptags?.tag ?? [])
			.filter((t) => t.count >= MIN_WEIGHT && !NOT_GENRES.has(t.name.toLowerCase()))
			.slice(0, MAX_TAGS)
			.map((t) => t.name.toLowerCase());
		cache.set(artist, tags);
		return tags;
	}

	const SOUND_OF_KEY = "genre-tags:sound-of";
	const MONTH = 30 * 24 * 3600 * 1000;
	let soundOf = JSON.parse(localStorage.getItem(SOUND_OF_KEY) ?? "null");

	// One-time crawl of all ~7000 "The Sound of" playlists, slow on purpose, cached for a month.
	async function loadSoundOf() {
		if (soundOf && Date.now() - soundOf.fetched < MONTH) return;
		const map = {};
		for (let offset = 0, total = 1; offset < total; offset += 200) {
			const token = Spicetify.Platform.AuthorizationAPI.getState().token.accessToken;
			const res = await fetch(`https://spclient.wg.spotify.com/user-profile-view/v3/profile/thesoundsofspotify/playlists?offset=${offset}&limit=200`, {
				headers: { authorization: `Bearer ${token}`, accept: "application/json" },
			});
			if (!res.ok) return;
			const page = await res.json();
			total = page.total_public_playlists_count ?? 0;
			for (const p of page.public_playlists ?? []) map[p.name.toLowerCase()] = p.uri.split(":").pop();
			await new Promise((r) => setTimeout(r, 500));
		}
		soundOf = { fetched: Date.now(), map };
		localStorage.setItem(SOUND_OF_KEY, JSON.stringify(soundOf));
	}

	function openSoundOf(tag) {
		const term = `The Sound of ${tag}`;
		const id = soundOf?.map[term.toLowerCase()];
		Spicetify.Platform.History.push(id ? `/playlist/${id}` : `/search/${encodeURIComponent(term)}/playlists`);
	}

	function slot() {
		const container = document.querySelector(".main-trackInfo-container");
		if (!container) return null;
		let el = container.querySelector(".genre-tags");
		if (!el) {
			el = document.createElement("div");
			el.className = "genre-tags";
			el.style.cssText = "grid-area:genres;margin-top:8px;font-size:13px;font-style:italic;color:var(--text-subdued);white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
			container.style.gridTemplateAreas = '"pretitle pretitle" "title title" "badges subtitle" "genres genres"';
			container.append(el);
		}
		return el;
	}

	function tip(el, text) {
		el.setAttribute("aria-label", text);
		if (el._tippy) el._tippy.setContent(text);
		else if (text) Spicetify.Tippy(el, { ...Spicetify.TippyProps, content: text });
	}

	function render(el, tags) {
		el.replaceChildren(
			...tags.map((tag) => {
				const a = document.createElement("a");
				a.textContent = tag;
				a.style.cssText = "cursor:pointer;color:inherit;text-decoration:underline;text-underline-offset:2px";
				tip(a, `Open "The Sound of ${tag}"`);
				a.onclick = () => openSoundOf(tag);
				return [a, ", "];
			}).flat().slice(0, -1),
		);
	}

	async function update() {
		const item = Spicetify.Player.data?.item;
		const el = slot();
		if (!el) return;
		el.replaceChildren();
		const artist = item?.artists?.[0]?.name ?? item?.metadata?.artist_name;
		if (!artist || !item.uri?.startsWith("spotify:track:")) return;
		const tags = await getTags(artist).catch(() => []);
		if (Spicetify.Player.data?.item?.uri === item.uri) render(el, tags);
	}

	Spicetify.Player.addEventListener("songchange", update);
	new MutationObserver(() => {
		if (!document.querySelector(".main-trackInfo-container .genre-tags")) update();
	}).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	update();
	loadSoundOf().catch(() => {});
})();
