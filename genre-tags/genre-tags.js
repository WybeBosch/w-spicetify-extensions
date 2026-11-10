// NAME: Genre Tags
// DESCRIPTION: Shows Last.fm genre tags of the playing artist under the track title. Click a tag to search its "The Sound of" playlist.

(function genreTags() {
	if (!Spicetify?.Player?.data || !Spicetify.Platform?.History || !document.querySelector(".main-trackInfo-container")) {
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

	function slot() {
		const container = document.querySelector(".main-trackInfo-container");
		if (!container) return null;
		let line = container.querySelector("#custom-track-extras");
		if (!line) {
			line = document.createElement("div");
			line.id = "custom-track-extras";
			line.style.cssText = "grid-area:pretitle;contain:inline-size;display:flex;gap:6px;font-size:11px;color:var(--text-subdued);white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
			container.append(line);
		}
		let el = line.querySelector(".genre-tags");
		if (!el) {
			el = document.createElement("span");
			el.className = "genre-tags";
			line.append(el);
		}
		return el;
	}

	function render(el, tags) {
		el.replaceChildren(
			...tags.flatMap((tag, i) => {
				const a = document.createElement("a");
				a.textContent = tag;
				a.style.cssText = "cursor:pointer;color:inherit";
				a.title = `Search "The Sound of ${tag}"`;
				a.onclick = () => Spicetify.Platform.History.push(`/search/${encodeURIComponent(`The Sound of ${tag}`)}/playlists`);
				return i ? [", ", a] : [a];
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
		if (!document.querySelector("#custom-track-extras .genre-tags")) update();
	}).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	update();
})();
