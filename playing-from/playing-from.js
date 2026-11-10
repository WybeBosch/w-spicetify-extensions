// NAME: Playing From
// DESCRIPTION: Shows the playlist, album or artist you are playing from in the now playing bar. Click it to open it. Also hides the "Lossless" line.

(function playingFrom() {
	if (!Spicetify?.Player?.data || !Spicetify.Platform?.History || !document.querySelector(".main-trackInfo-container")) {
		setTimeout(playingFrom, 300);
		return;
	}

	const style = document.createElement("style");
	style.textContent = `
		.main-nowPlayingBar-nowPlayingBar { height: 84px; }
		.main-trackInfo-container > :has(.main-trackInfo-artists > button) { display: none; }
		#custom-track-context .playing-from:not(:empty) ~ .genre-tags:not(:empty)::before { content: "\\00a0· "; font-style: normal; }
	`;
	document.head.append(style);

	function path(uri) {
		const parts = uri.split(":");
		if (parts.includes("collection")) return "/collection/tracks";
		return `/${parts[1]}/${parts[2]}`;
	}

	function slot() {
		const container = document.querySelector(".main-trackInfo-container");
		if (!container) return null;
		let line = container.querySelector("#custom-track-context");
		if (!line) {
			line = document.createElement("div");
			line.id = "custom-track-context";
			line.style.cssText = "grid-area:context;contain:inline-size;font-size:11px;color:var(--text-subdued);white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
			container.style.gridTemplateAreas = '"pretitle pretitle" "title title" "badges subtitle" "context context"';
			container.append(line);
		}
		let el = line.querySelector(".playing-from");
		if (!el) {
			el = document.createElement("a");
			el.className = "playing-from";
			el.style.cssText = "cursor:pointer;color:inherit";
			el.onclick = () => el.dataset.path && Spicetify.Platform.History.push(el.dataset.path);
			line.prepend(el);
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

	Spicetify.Player.addEventListener("songchange", update);
	new MutationObserver(() => {
		if (!document.querySelector("#custom-track-context .playing-from")) update();
	}).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	update();
})();
