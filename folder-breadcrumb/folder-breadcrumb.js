// NAME: Folder Breadcrumb
// DESCRIPTION: Shows the library folder path in the top bar of a playlist page. Click a folder to expand and scroll to it in the sidebar.

(function folderBreadcrumb() {
	if (!Spicetify?.Platform?.RootlistAPI || !Spicetify.Platform.History || !Spicetify.SVGIcons?.["playlist-folder"]) {
		setTimeout(folderBreadcrumb, 300);
		return;
	}

	let path = [];

	async function findPath(uri) {
		const { items } = await Spicetify.Platform.RootlistAPI.getContents();
		const walk = (list, folders) => {
			for (const i of list) {
				if (i.type === "folder") {
					const found = walk(i.items, [...folders, i]);
					if (found) return found;
				} else if (i.uri === uri) return folders;
			}
			return null;
		};
		return walk(items, []) ?? [];
	}

	async function openInSidebar(index) {
		const storage = Spicetify.Platform.LocalStorageAPI;
		const target = path[index].uri;
		const expandedFolders = [...new Set([...(storage.getItem("ylx-expanded-folders") ?? []), ...path.slice(0, index + 1).map((f) => f.uri)])];
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
		const scroller = document.querySelector(".main-yourLibraryX-library [data-overlayscrollbars-viewport]");
		if (!uris.includes(target) || !scroller) return;
		// Pinned rows are not in getContents, so measure the offset on a rendered row.
		const rowUri = (row) => row.querySelector("[aria-labelledby]")?.getAttribute("aria-labelledby").match(/listrow-title-(\S+)/)?.[1];
		for (let i = 0; i < 40; i++) {
			const row = [...document.querySelectorAll(".main-yourLibraryX-listItem")].find((r) => uris.includes(rowUri(r)));
			if (row && +row.getAttribute("aria-setsize") >= uris.length) {
				const offset = +row.getAttribute("aria-rowindex") - 1 - uris.indexOf(rowUri(row));
				const height = row.getBoundingClientRect().height;
				scroller.scrollTop = (uris.indexOf(target) + offset) * height - scroller.clientHeight / 2 + height / 2;
				flash(target, rowUri);
				return;
			}
			await new Promise((r) => setTimeout(r, 25));
		}
	}

	async function flash(uri, rowUri) {
		for (let i = 0; i < 20; i++) {
			const row = [...document.querySelectorAll(".main-yourLibraryX-listItem")].find((r) => rowUri(r) === uri);
			if (row) {
				row.style.transition = "none";
				row.style.backgroundColor = "rgba(30, 215, 96, .35)";
				requestAnimationFrame(() => {
					row.style.transition = "background-color 1s ease-out .3s";
					row.style.backgroundColor = "";
				});
				setTimeout(() => (row.style.transition = ""), 1400);
				return;
			}
			await new Promise((r) => setTimeout(r, 25));
		}
	}

	function render() {
		const bar = document.querySelector(".main-topBar-container");
		const container = bar?.querySelector(".main-topBar-topbarContentContainer");
		if (!container) return;
		let el = bar.querySelector(".folder-breadcrumb");
		if (!path.length) return el?.remove();
		if (!el) {
			el = document.createElement("div");
			el.className = "folder-breadcrumb";
			bar.append(el);
		}
		const box = container.getBoundingClientRect();
		const barBox = bar.getBoundingClientRect();
		const cover = document.querySelector(".main-view-container .main-entityHeader-imageContainer")?.getBoundingClientRect();
		const left = cover ? cover.left - barBox.left : box.left - barBox.left + (parseFloat(getComputedStyle(container).paddingLeft) || 0);
		el.style.cssText = `position:absolute;top:${box.top - barBox.top}px;height:${box.height}px;left:${left}px;z-index:2;display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-base);opacity:.85;transition:opacity .15s`;
		const scroller = document.querySelector(".main-view-container [data-overlayscrollbars-viewport]");
		el.style.opacity = (scroller?.scrollTop ?? 0) > 40 ? "0" : ".85";
		el.style.pointerEvents = el.style.opacity === "0" ? "none" : "";
		if (el.dataset.path === path.map((f) => f.uri).join()) return;
		el.dataset.path = path.map((f) => f.uri).join();
		el.innerHTML = `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">${Spicetify.SVGIcons["playlist-folder"]}</svg>`;
		path.forEach((folder, i) => {
			if (i) el.append(" › ");
			const a = document.createElement("a");
			a.textContent = folder.name;
			a.style.cssText = "cursor:pointer;color:inherit";
			a.onmouseenter = () => (a.style.textDecoration = "underline");
			a.onmouseleave = () => (a.style.textDecoration = "");
			a.onclick = () => openInSidebar(i);
			el.append(a);
		});
	}

	async function onRoute({ pathname }) {
		const id = pathname.match(/^\/playlist\/([^/]+)/)?.[1];
		path = id ? await findPath(`spotify:playlist:${id}`) : [];
		render();
	}

	Spicetify.Platform.History.listen(onRoute);
	new MutationObserver(render).observe(document.querySelector(".Root__main-view") ?? document.body, { childList: true, subtree: true });
	document.addEventListener("scroll", render, true);
	onRoute(Spicetify.Platform.History.location);
})();
