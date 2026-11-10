// NAME: Genre Tags
// DESCRIPTION: Shows Last.fm genre tags of the playing artist in the now playing bar. Click a tag to open its "The Sound of" playlist by thesoundsofspotify.

(function genreTags() {
	if (!Spicetify?.Player?.data || !Spicetify.GraphQL?.Definitions?.searchDesktop || !document.querySelector(".main-trackInfo-container")) {
		setTimeout(genreTags, 300);
		return;
	}

	const KEY_STORAGE = "genre-tags:lastfm-api-key";
	const NOT_GENRES = new Set(["seen live", "british", "uk", "american", "usa", "female vocalists", "male vocalists", "favorites", "favourites", "the voice", "the voice uk"]);
	const MAX_TAGS = 3;
	const MIN_WEIGHT = 10;
	const GRID = '"pretitle pretitle" "title title" "badges subtitle" "context context" "genres genres" "quality quality"';
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

	async function openSoundOf(tag) {
		const term = `The Sound of ${tag}`;
		const { data } = await Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.searchDesktop, {
			searchTerm: term,
			offset: 0,
			limit: 20,
			numberOfTopResults: 5,
			includeAudiobooks: false,
			includeArtistHasConcertsField: false,
			includePreReleases: false,
			includeLocalConcertsField: false,
			includeAuthors: false,
		});
		const playlists = (data?.searchV2?.playlists?.items ?? []).map((i) => i.data).filter((p) => p?.ownerV2?.data?.username === "thesoundsofspotify");
		const hit = playlists.find((p) => p.name.toLowerCase() === term.toLowerCase()) ?? playlists[0];
		Spicetify.Platform.History.push(hit ? `/playlist/${hit.uri.split(":")[2]}` : `/search/${encodeURIComponent(term)}/playlists`);
	}

	function slot() {
		const container = document.querySelector(".main-trackInfo-container");
		if (!container) return null;
		let el = container.querySelector(".genre-tags");
		if (!el) {
			el = document.createElement("div");
			el.className = "genre-tags";
			el.style.cssText = "grid-area:genres;contain:inline-size;display:flex;gap:4px;font-size:11px;font-style:italic;color:var(--text-subdued);white-space:nowrap;overflow:hidden";
			container.style.gridTemplateAreas = GRID;
			container.append(el);
		}
		return el;
	}

	function render(el, tags) {
		el.replaceChildren(
			...tags.map((tag) => {
				const a = document.createElement("a");
				a.textContent = `[${tag}]`;
				a.style.cssText = "cursor:pointer;color:inherit";
				a.title = `Open "The Sound of ${tag}"`;
				a.onclick = () => openSoundOf(tag).catch(() => Spicetify.Platform.History.push(`/search/${encodeURIComponent(`The Sound of ${tag}`)}/playlists`));
				return a;
			}),
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
})();
