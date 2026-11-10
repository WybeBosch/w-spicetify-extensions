// NAME: Release Date
// DESCRIPTION: Shows the release date of the playing track under its title, and in the track context menu.

(function releaseDate() {
	if (!Spicetify?.Player?.data || !Spicetify.GraphQL?.Definitions?.getTrack || !Spicetify.ContextMenu || !document.querySelector(".main-trackInfo-container")) {
		setTimeout(releaseDate, 300);
		return;
	}

	const cache = new Map();

	async function getDate(uri) {
		if (cache.has(uri)) return cache.get(uri);
		const { data } = await Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.getTrack, { uri });
		const d = data?.trackUnion?.albumOfTrack?.date;
		const date = !d ? null : d.precision === "DAY" ? d.isoString.slice(0, 10) : d.precision === "MONTH" ? d.isoString.slice(0, 7) : String(d.year);
		cache.set(uri, date);
		return date;
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
		let el = line.querySelector(".release-date");
		if (!el) {
			el = document.createElement("span");
			el.className = "release-date";
			line.prepend(el);
		}
		return el;
	}

	async function update() {
		const uri = Spicetify.Player.data?.item?.uri;
		const el = slot();
		if (!el) return;
		el.textContent = "";
		if (!uri?.startsWith("spotify:track:")) return;
		const date = await getDate(uri).catch(() => null);
		if (Spicetify.Player.data?.item?.uri === uri) el.textContent = date ?? "";
	}

	Spicetify.Player.addEventListener("songchange", update);
	new MutationObserver(() => {
		if (!document.querySelector("#custom-track-extras .release-date")) update();
	}).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	update();

	new Spicetify.ContextMenu.Item(
		"Show release date",
		async ([uri]) => Spicetify.showNotification(`Released: ${(await getDate(uri).catch(() => null)) ?? "unknown"}`),
		(uris) => uris.length === 1 && uris[0].startsWith("spotify:track:"),
		"clock",
	).register();
})();
