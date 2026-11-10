// NAME: Random Playlist
// DESCRIPTION: "Random playlist" button under the Your Library title. Plays a random playlist from your library, folders included.

(function randomPlaylist() {
	if (!Spicetify?.Platform?.RootlistAPI || !Spicetify.Player?.playUri || !Spicetify.SVGIcons?.shuffle) {
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

	function mount() {
		const header = document.querySelector(".main-yourLibraryX-header");
		const create = header?.querySelector("button[aria-label='Create']");
		if (!create || header.querySelector(".random-playlist")) return;
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = [...create.classList].filter((c) => !c.startsWith("main-useDropTarget")).join(" ") + " random-playlist";
		btn.style.alignSelf = "flex-start";
		btn.setAttribute("aria-label", "Random playlist");
		btn.innerHTML = `<svg role="img" aria-hidden="true" class="${create.querySelector("svg")?.getAttribute("class") ?? ""}" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">${Spicetify.SVGIcons.shuffle}</svg><span class="${create.querySelector("span")?.getAttribute("class") ?? ""}">Random playlist</span>`;
		btn.onclick = playRandom;
		header.querySelector(".main-yourLibraryX-headerContent").after(btn);
	}

	new MutationObserver(mount).observe(document.body, { childList: true, subtree: true });
	mount();
})();
