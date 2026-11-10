// NAME: Random Playlist
// DESCRIPTION: Top bar button that plays a random playlist from your library, folders included.

(function randomPlaylist() {
	if (!Spicetify?.Topbar?.Button || !Spicetify.Platform?.RootlistAPI || !Spicetify.Player?.playUri) {
		setTimeout(randomPlaylist, 300);
		return;
	}

	async function playRandom() {
		const { items } = await Spicetify.Platform.RootlistAPI.getContents();
		const playlists = [];
		const walk = (list) => list.forEach((i) => (i.type === "folder" ? walk(i.items) : i.type === "playlist" && playlists.push(i)));
		walk(items);
		if (!playlists.length) return;
		const pick = playlists[Math.floor(Math.random() * playlists.length)];
		await Spicetify.Player.playUri(pick.uri);
		Spicetify.showNotification(`Playing ${pick.name}`);
	}

	new Spicetify.Topbar.Button("Play a random playlist", "shuffle", playRandom).register();
})();
