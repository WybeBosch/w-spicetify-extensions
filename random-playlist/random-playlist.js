// NAME: Random Playlist
// DESCRIPTION: "Random playlist" button under the Your Library title. Plays a random playlist from your library, folders included.

(function randomPlaylist() {
	if (!Spicetify?.Platform?.RootlistAPI || !Spicetify.Player?.playUri || !Spicetify.SVGIcons?.shuffle) {
		setTimeout(randomPlaylist, 300);
		return;
	}

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

	async function playRandom() {
		const { items } = await Spicetify.Platform.RootlistAPI.getContents();
		const playlists = [];
		const walk = (list, folders) =>
			list.forEach((i) => (i.type === "folder" ? walk(i.items, [...folders, i.uri]) : i.type === "playlist" && playlists.push({ ...i, folders })));
		walk(items, []);
		if (!playlists.length) return;
		const pick = playlists[Math.floor(Math.random() * playlists.length)];
		await Spicetify.Player.playUri(pick.uri);
		Spicetify.showNotification(`Playing ${pick.name}`);
		Spicetify.Platform.History.push(`/playlist/${pick.uri.split(":").pop()}`);
		revealInSidebar(pick);
	}

	async function revealInSidebar(pick) {
		const storage = Spicetify.Platform.LocalStorageAPI;
		const expandedFolders = [...new Set([...(storage.getItem("ylx-expanded-folders") ?? []), ...pick.folders])];
		storage.setItem("ylx-expanded-folders", expandedFolders);
		const filters = storage.getItem("ylx-active-filter-ids")?.[""] ?? [];
		const { items } = await Spicetify.Platform.LibraryAPI.getContents({
			filters,
			sortOrder: storage.getItem("ylx-active-sort-order-by-filter-id")?.[filters[0]],
			sortDirection: storage.getItem("ylx-sort-direction"),
			expandedFolders,
			offset: 0,
			limit: 5000,
		});
		const uris = items.map((i) => i.uri);
		const index = uris.indexOf(pick.uri);
		const scroller = document.querySelector(".main-yourLibraryX-library [data-overlayscrollbars-viewport]");
		if (index < 0 || !scroller) return;

		// Pinned rows (Liked Songs, Your Episodes) are not in getContents, so measure the offset on a rendered row.
		const rowUri = (row) => row.querySelector("[aria-labelledby]")?.getAttribute("aria-labelledby").match(/listrow-title-(\S+)/)?.[1];
		for (let i = 0; i < 40; i++) {
			const row = [...document.querySelectorAll(".main-yourLibraryX-listItem")].find((r) => uris.includes(rowUri(r)));
			if (row && +row.getAttribute("aria-setsize") >= uris.length) {
				const offset = +row.getAttribute("aria-rowindex") - 1 - uris.indexOf(rowUri(row));
				const height = row.getBoundingClientRect().height;
				scroller.scrollTop = (index + offset) * height - scroller.clientHeight / 2 + height / 2;
				return;
			}
			await sleep(25);
		}
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
