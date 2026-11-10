// NAME: Copy Track Titles
// DESCRIPTION: Right-click one or more selected tracks to copy them as "Artist - Title" lines.

(function copyTrackTitles() {
	if (!Spicetify?.ContextMenu || !Spicetify.GraphQL?.Definitions?.getTrack || !Spicetify.Platform?.ClipboardAPI) {
		setTimeout(copyTrackTitles, 300);
		return;
	}

	async function line(uri) {
		const { data } = await Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.getTrack, { uri });
		const t = data?.trackUnion;
		if (!t?.name) return null;
		const artists = [t.firstArtist?.items ?? [], t.otherArtists?.items ?? []].flat().map((a) => a.profile?.name).filter(Boolean);
		return `${artists.join(", ")} - ${t.name}`;
	}

	async function copy(uris) {
		const lines = [];
		for (let i = 0; i < uris.length; i += 10) {
			lines.push(...(await Promise.all(uris.slice(i, i + 10).map((u) => line(u).catch(() => null)))));
		}
		const text = lines.filter(Boolean).join("\n");
		await Spicetify.Platform.ClipboardAPI.copy(text);
		Spicetify.showNotification(`Copied ${lines.filter(Boolean).length} title(s)`);
	}

	new Spicetify.ContextMenu.Item(
		"Copy titles",
		copy,
		(uris) => uris.length > 0 && uris.every((u) => u.startsWith("spotify:track:")),
		"copy",
	).register();
})();
