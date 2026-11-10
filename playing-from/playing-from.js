// NAME: Playing From
// DESCRIPTION: Shows the playlist, album or artist you are playing from in the now playing bar. Click it to open it.

(function playingFrom() {
	if (!Spicetify?.Player?.data || !Spicetify.Platform?.History || !document.querySelector(".main-trackInfo-container")) {
		setTimeout(playingFrom, 300);
		return;
	}

	const GRID = '"pretitle pretitle" "title title" "badges subtitle" "context context" "genres genres" "quality quality"';

	function path(uri) {
		const parts = uri.split(":");
		if (parts.includes("collection")) return "/collection/tracks";
		return `/${parts[1]}/${parts[2]}`;
	}

	function slot() {
		const container = document.querySelector(".main-trackInfo-container");
		if (!container) return null;
		let el = container.querySelector(".playing-from");
		if (!el) {
			el = document.createElement("a");
			el.className = "playing-from";
			el.style.cssText = "grid-area:context;contain:inline-size;font-size:11px;color:var(--text-subdued);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
			el.onclick = () => el.dataset.path && Spicetify.Platform.History.push(el.dataset.path);
			container.style.gridTemplateAreas = GRID;
			container.append(el);
		}
		return el;
	}

	function update() {
		const el = slot();
		if (!el) return;
		const ctx = Spicetify.Player.data?.context;
		const name = ctx?.metadata?.context_description;
		el.textContent = name ?? "";
		el.dataset.path = name && ctx.uri ? path(ctx.uri) : "";
		el.title = name ? `Playing from ${name}` : "";
	}

	const style = document.createElement("style");
	style.textContent = ".main-nowPlayingBar-nowPlayingBar { height: 108px; }";
	document.head.append(style);

	Spicetify.Player.addEventListener("songchange", update);
	new MutationObserver(() => {
		if (!document.querySelector(".main-trackInfo-container .playing-from")) update();
	}).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	update();
})();
