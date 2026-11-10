// NAME: Playing From
// DESCRIPTION: Shows the playlist, album or artist you are playing from above the now playing buttons. Click it to open it. Also hides the "Lossless" line.

(function playingFrom() {
	if (!Spicetify?.Player?.data || !Spicetify.Platform?.History || !document.querySelector(".main-nowPlayingWidget-actionButtonWrapper")) {
		setTimeout(playingFrom, 300);
		return;
	}

	const style = document.createElement("style");
	style.textContent = `
		.main-nowPlayingBar-nowPlayingBar { height: 84px; }
		.main-trackInfo-container > :has(.main-trackInfo-artists > button) { display: none; }
		.main-nowPlayingWidget-actionButtonWrapper { position: relative; }
	`;
	document.head.append(style);

	const LABELS = { playlist: "Playlist", album: "Album", artist: "Artist", show: "Podcast" };

	function path(uri) {
		const parts = uri.split(":");
		if (parts.includes("collection")) return "/collection/tracks";
		return `/${parts[1]}/${parts[2]}`;
	}

	function slot() {
		const wrapper = document.querySelector(".main-nowPlayingWidget-actionButtonWrapper");
		if (!wrapper) return null;
		let el = wrapper.querySelector(".playing-from");
		if (!el) {
			el = document.createElement("a");
			el.className = "playing-from";
			el.style.cssText = "position:absolute;bottom:100%;left:8px;font-size:11px;color:var(--text-subdued);cursor:pointer;white-space:nowrap";
			el.onclick = () => el.dataset.path && Spicetify.Platform.History.push(el.dataset.path);
			wrapper.prepend(el);
		}
		return el;
	}

	function update() {
		const el = slot();
		if (!el) return;
		const ctx = Spicetify.Player.data?.context;
		const name = ctx?.metadata?.context_description;
		const label = ctx?.uri?.includes("collection") ? "Playlist" : LABELS[ctx?.uri?.split(":")[1]];
		el.textContent = name ? (label ? `${label}: ${name}` : name) : "";
		el.dataset.path = name && ctx.uri ? path(ctx.uri) : "";
	}

	Spicetify.Player.addEventListener("songchange", update);
	new MutationObserver(() => {
		if (!document.querySelector(".main-nowPlayingWidget-actionButtonWrapper .playing-from")) update();
	}).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	update();
})();
