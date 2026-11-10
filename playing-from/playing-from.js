// NAME: Playing From
// DESCRIPTION: Shows the playlist, album or artist you are playing from under the now playing buttons, on the genre line. Click it to open it. Also hides the "Lossless" line.

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
			el.style.cssText = "position:absolute;top:100%;left:0;font-size:11px;color:var(--text-subdued);cursor:pointer;white-space:nowrap";
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
		requestAnimationFrame(() => align(el));
	}

	function align(el) {
		const wrapper = el.parentElement;
		const icon = wrapper?.querySelector("button svg");
		const line = document.querySelector(".main-trackInfo-container .genre-tags") ?? document.querySelector(".main-trackInfo-artists");
		if (!icon || !line) return;
		const box = wrapper.getBoundingClientRect();
		el.style.left = `${icon.getBoundingClientRect().left - box.left}px`;
		el.style.top = `${line.getBoundingClientRect().top - box.top}px`;
		el.style.lineHeight = getComputedStyle(line).lineHeight;
	}

	Spicetify.Player.addEventListener("songchange", update);
	new MutationObserver(() => {
		const el = document.querySelector(".main-nowPlayingWidget-actionButtonWrapper .playing-from");
		el ? align(el) : update();
	}).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	update();
})();
