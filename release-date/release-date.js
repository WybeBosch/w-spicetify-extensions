// NAME: Release Date
// DESCRIPTION: Shows the release date of the playing track next to its title, and in the track context menu.

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
		const title = document.querySelector(".main-trackInfo-name [data-encore-id='text']");
		if (!title) return null;
		let el = title.querySelector(".release-date");
		if (!el) {
			el = document.createElement("span");
			el.className = "release-date";
			el.style.cssText = "color:var(--text-subdued);font-size:11px";
			title.append(el);
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
		if (Spicetify.Player.data?.item?.uri === uri) el.textContent = date ? ` - (${date.slice(0, 4)})` : "";
	}

	Spicetify.Player.addEventListener("songchange", update);
	new MutationObserver(() => {
		if (!document.querySelector(".main-trackInfo-name .release-date")) update();
	}).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	update();

	new Spicetify.ContextMenu.Item(
		"Show release date",
		async ([uri]) => Spicetify.showNotification(`Released: ${(await getDate(uri).catch(() => null)) ?? "unknown"}`),
		(uris) => uris.length === 1 && uris[0].startsWith("spotify:track:"),
		"clock",
	).register();
})();
